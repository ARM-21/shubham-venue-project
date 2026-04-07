import mongoose from 'mongoose';

const eventReportSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizerEvent',
      required: true,
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'suspicious_activity',
        'false_content',
        'policy_violation',
        'spam',
        'fraud',
        'inappropriate_content',
        'misleading_information',
        'discrimination',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    evidence: {
      type: [String], // URLs to screenshots/attachments
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    adminNotes: {
      type: String,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolution: {
      type: String,
      enum: ['created_flag', 'auto_suspended', 'dismissed_invalid', 'sent_warning', null],
      default: null,
    },
    relatedFlagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flag',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    updatedStatus: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for queries
eventReportSchema.index({ eventId: 1, status: 1 });
eventReportSchema.index({ reportedBy: 1, createdAt: -1 });
eventReportSchema.index({ status: 1, priority: 1 });
eventReportSchema.index({ createdAt: -1 });

// Virtual to check if report is old (pending for >7 days)
eventReportSchema.virtual('isStale').get(function () {
  if (this.status !== 'pending') return false;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.createdAt < weekAgo;
});

export default mongoose.model('EventReport', eventReportSchema);
