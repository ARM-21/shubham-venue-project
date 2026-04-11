import EventReport from '../../models/EventReport.js';
import OrganizerEvent from '../../models/OrganizerEvent.js';
import Flag from '../../models/Flag.js';
import User from '../../models/User.js';
import AdminNotification from '../../models/AdminNotification.js';
import { createAuditLog } from '../../middleware/audit.middleware.js';
import {
  sendOrganizerWarningEmail,
  sendFlagNotificationEmail,
  sendEventSuspensionEmail,
} from '../../services/email/email.service.js';

/**
 * Submit an event report (user/organizer initiated)
 */
export const submitEventReport = async (req, res) => {
  try {
    const userId = req.currentUser._id;
    const { eventId, reason, description, evidence = [], priority } = req.body;

    // Validate event exists
    const event = await OrganizerEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user already reported this event (within last 24 hours)
    const existingReport = await EventReport.findOne({
      eventId,
      reportedBy: userId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this event in the last 24 hours',
      });
    }

    // Create report
    const report = new EventReport({
      eventId,
      reportedBy: userId,
      reason,
      description,
      evidence: evidence.filter(e => e), // Remove empty strings
      priority: priority || 'medium',
    });

    await report.save();

    // Get reporter details
    const reporter = await User.findById(userId).select('firstName lastName email avatar');

    // Create audit log (log against the event being reported)
    await createAuditLog({
      entityType: 'event',
      entityId: eventId,
      action: 'flagged',
      performedBy: userId,
      metadata: {
        reason: reason,
        notes: description,
        references: {
          reportId: report._id,
        },
      },
      ipAddress: req.ip,
    });

    // Create in-app notifications for all admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        adminId: admin._id,
        type: 'event_report_submitted',
        title: `New Event Report - ${event.name}`,
        message: `${reporter?.firstName || 'User'} ${reporter?.lastName || ''} reported "${event.name}" for ${reason}`,
        requestUserId: userId,
        requestUserName: `${reporter?.firstName || ''} ${reporter?.lastName || ''}`.trim(),
        requestUserEmail: reporter?.email || '',
        eventId: eventId,
        organizerId: event.organizerId,
        actionPath: `/admin/governance/reports/${report._id}`,
        note: description,
      }));
      await AdminNotification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Event report submitted successfully',
      data: report,
    });
  } catch (error) {
    console.error('Error submitting event report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: error.message,
    });
  }
};

/**
 * Get all event reports (admin only)
 */
export const getEventReports = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20, search } = req.query;

    let query = {};

    // Only filter by status if provided
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;

    // Search by event name or reporter email
    if (search) {
      const eventIds = await OrganizerEvent.find({
        name: { $regex: search, $options: 'i' },
      }).select('_id');

      const reporters = await User.find({
        email: { $regex: search, $options: 'i' },
      }).select('_id');

      query.$or = [
        { eventId: { $in: eventIds } },
        { reportedBy: { $in: reporters } },
      ];
    }

    const skip = (page - 1) * limit;

    const reports = await EventReport.find(query)
      .populate('eventId', 'name startDateTime hallId organizerId')
      .populate('eventId.hallId', 'name')
      .populate('eventId.organizerId', 'email firstName lastName')
      .populate('reportedBy', 'email firstName lastName')
      .populate('resolvedBy', 'email firstName lastName')
      .populate('relatedFlagId', 'severity status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await EventReport.countDocuments(query);

    // Calculate stats
    const stats = await EventReport.aggregate([
      { $match: { status: { $ne: 'dismissed' } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        pending: stats.find(s => s._id === 'pending')?.count || 0,
        reviewing: stats.find(s => s._id === 'reviewing')?.count || 0,
        resolved: stats.find(s => s._id === 'resolved')?.count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message,
    });
  }
};

/**
 * Get single report detail (admin only)
 */
export const getReportDetail = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await EventReport.findById(reportId)
      .populate('eventId')
      .populate('eventId.hallId')
      .populate('eventId.organizerId')
      .populate('reportedBy')
      .populate('resolvedBy')
      .populate('relatedFlagId');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Mark as reviewing if it's pending
    if (report.status === 'pending') {
      report.status = 'reviewing';
      await report.save();
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching report detail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message,
    });
  }
};

/**
 * Resolve report with action (admin only)
 */
export const resolveEventReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { resolution, adminNotes, flagSeverity = 'high' } = req.body;
    const adminId = req.currentUser._id;

    // Valid resolutions: 'created_flag', 'auto_suspended', 'dismissed_invalid', 'sent_warning'
    const validResolutions = ['created_flag', 'auto_suspended', 'dismissed_invalid', 'sent_warning'];
    if (!validResolutions.includes(resolution)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resolution action',
      });
    }

    const report = await EventReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Update report
    report.status = 'resolved';
    report.resolution = resolution;
    report.adminNotes = adminNotes;
    report.resolvedBy = adminId;
    report.reviewedAt = new Date();
    report.updatedStatus = new Date();

    // Handle resolution actions
    if (resolution === 'created_flag') {
      // Get event details for email
      const event = await OrganizerEvent.findById(report.eventId).populate('organizerId');
      
      // Create official flag from report
      const flag = new Flag({
        eventId: report.eventId,
        organizerId: event.organizerId._id,
        reason: report.reason,
        description: report.description,
        severity: flagSeverity,
        evidence: report.evidence,
        flaggedBy: adminId,
        status: 'open',
      });
      await flag.save();
      report.relatedFlagId = flag._id;

      // Send flag notification email
      if (event?.organizerId?.email) {
        try {
          await sendFlagNotificationEmail(
            event.organizerId.email,
            `${event.organizerId.firstName} ${event.organizerId.lastName}`,
            event.name,
            flagSeverity
          );
        } catch (error) {
          console.error('Failed to send flag notification email:', error);
        }
      }

      // If critical/high, suspend event immediately
      if (flagSeverity === 'critical' || flagSeverity === 'high') {
        await OrganizerEvent.findByIdAndUpdate(report.eventId, {
          status: 'SUSPENDED',
          isFlagged: true,
          $push: { flags: flag._id },
        });

        // Send suspension email if event is suspended
        if (event?.organizerId?.email) {
          try {
            await sendEventSuspensionEmail(
              event.organizerId.email,
              `${event.organizerId.firstName} ${event.organizerId.lastName}`,
              event.name,
              report.reason
            );
          } catch (error) {
            console.error('Failed to send suspension email:', error);
          }
        }
      }
    } else if (resolution === 'auto_suspended') {
      // Auto suspend without flag
      await OrganizerEvent.findByIdAndUpdate(report.eventId, {
        status: 'SUSPENDED',
      });

      // Send suspension email to organizer
      const event = await OrganizerEvent.findById(report.eventId).populate('organizerId');
      if (event?.organizerId?.email) {
        try {
          await sendEventSuspensionEmail(
            event.organizerId.email,
            `${event.organizerId.firstName} ${event.organizerId.lastName}`,
            event.name,
            report.reason
          );
        } catch (error) {
          console.error('Failed to send suspension email:', error);
        }
      }
    } else if (resolution === 'sent_warning') {
      // Send warning notification to organizer
      const event = await OrganizerEvent.findById(report.eventId).populate('organizerId');
      if (event?.organizerId?.email) {
        try {
          await sendOrganizerWarningEmail(
            event.organizerId.email,
            `${event.organizerId.firstName} ${event.organizerId.lastName}`,
            event.name,
            report.reason
          );
        } catch (error) {
          console.error('Failed to send warning email:', error);
        }
      }
    }

    await report.save();

    // Create audit log (log against the reported event)
    await createAuditLog({
      entityType: 'event',
      entityId: report.eventId,
      action: 'status_changed',
      performedBy: adminId,
      metadata: {
        reason: `Report resolved: ${resolution}`,
        notes: adminNotes,
        references: {
          reportId: report._id,
        },
      },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Report resolved with action: ${resolution}`,
      data: report,
    });
  } catch (error) {
    console.error('Error resolving report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve report',
      error: error.message,
    });
  }
};

/**
 * Dismiss report as invalid (admin only)
 */
export const dismissEventReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.currentUser._id;

    const report = await EventReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = 'dismissed';
    report.resolution = 'dismissed_invalid';
    report.adminNotes = adminNotes;
    report.resolvedBy = adminId;
    report.reviewedAt = new Date();
    report.updatedStatus = new Date();

    await report.save();

    // Create audit log (log against the reported event)
    await createAuditLog({
      entityType: 'event',
      entityId: report.eventId,
      action: 'approved',
      performedBy: adminId,
      metadata: {
        reason: 'Report dismissed as invalid',
        notes: adminNotes,
        references: {
          reportId: report._id,
        },
      },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Report dismissed',
      data: report,
    });
  } catch (error) {
    console.error('Error dismissing report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss report',
      error: error.message,
    });
  }
};

/**
 * Get report stats dashboard
 */
export const getReportStats = async (req, res) => {
  try {
    const stats = {
      total: await EventReport.countDocuments(),
      pending: await EventReport.countDocuments({ status: 'pending' }),
      reviewing: await EventReport.countDocuments({ status: 'reviewing' }),
      resolved: await EventReport.countDocuments({ status: 'resolved' }),
      dismissed: await EventReport.countDocuments({ status: 'dismissed' }),
      critical: await EventReport.countDocuments({ priority: 'critical' }),
      stale: await EventReport.countDocuments({
        status: 'pending',
        createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    };

    const recentReports = await EventReport.find()
      .populate('eventId', 'name')
      .populate('reportedBy', 'email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentReports,
      },
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message,
    });
  }
};

/**
 * Check if user has already reported an event (prevent duplicate reports)
 */
export const checkUserReport = async (req, res) => {
  try {
    const userId = req.currentUser._id;
    const { eventId } = req.params;

    const existingReport = await EventReport.findOne({
      eventId,
      reportedBy: userId,
    });

    res.status(200).json({
      success: true,
      hasReported: !!existingReport,
      reportId: existingReport?._id || null,
    });
  } catch (error) {
    console.error('Error checking user report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check report status',
      error: error.message,
    });
  }
};
