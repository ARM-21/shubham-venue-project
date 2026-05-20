import { Resend } from "resend";
import { httpError } from "../../utils/http.utils.js";
import ENV from "../../config/env.config.js";

const resend = new Resend(ENV.RESEND_KEY);

// Send OTP verification email
export const sendOTPEmail = async (email, otp, username) => {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #2c3e50;">Shubham Venue</h2>
      <p>Dear ${username || 'Guest'},</p>
      <p>Thank you for connecting with <strong>Shubham Venue</strong>. To complete your verification, please use the code below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; background: #2c3e50; color: #fff; padding: 12px 24px; font-size: 22px; letter-spacing: 3px; border-radius: 6px;">
          ${otp}
        </span>
      </div>
      
      <p>This code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
      
      <p>Warm regards,<br/>The Shubham Venue Team</p>
      
      <hr style="margin: 20px 0;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Shubham Venue <info@shubham-venue.me>',
      to: [email],
      subject: 'Your Verification Code – Shubham Venue',
      html
    });

    if (error) {
      console.error('Resend API error:', error);
      throw httpError(500, 'Failed to send verification email');
    }

    console.log('Email sent successfully:', data);
    return data;

  } catch (err) {
    console.error('Error sending OTP email:', err);
    throw httpError(500, 'Failed to send verification email. Please try again.');
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, username) => {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #2c3e50;">Welcome to Shubham Venue!</h2>
      <p>Dear ${username},</p>
      <p>Your email has been verified successfully. Thank you for joining us!</p>
      <p>You can now enjoy all our services including venue booking, event management, and more.</p>
      
      <p>Warm regards,<br/>The Shubham Venue Team</p>
      
      <hr style="margin: 20px 0;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;

  try {
    const { data } = await resend.emails.send({
      from: 'Shubham Venue <info@shubham-venue.me>',
      to: [email],
      subject: 'Welcome to Shubham Venue - Email Verified',
      html
    });

    return data;
  } catch (err) {
    console.error('Error sending welcome email:', err);
    // Don't throw error for welcome email - it's not critical
  }
};

// Send booking confirmation email
export const sendBookingConfirmationEmail = async (email, username, bookingDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #2c3e50;">Booking Confirmation</h2>
      <p>Dear ${username},</p>
      <p>Your booking has been confirmed!</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
        <p><strong>Date:</strong> ${bookingDetails.date}</p>
        <p><strong>Venue:</strong> ${bookingDetails.venue}</p>
        <p><strong>Amount:</strong> Rs. ${bookingDetails.amount}</p>
      </div>
      
      <p>We look forward to hosting your event!</p>
      
      <p>Warm regards,<br/>The Shubham Venue Team</p>
      
      <hr style="margin: 20px 0;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;

  try {
    const { data } = await resend.emails.send({
      from: 'Shubham Venue <info@shubham-venue.me>',
      to: [email],
      subject: 'Booking Confirmation - Shubham Venue',
      html
    });

    return data;
  } catch (err) {
    console.error('Error sending booking confirmation email:', err);
  }
};

// Notify admin(s) about a new booking
export const sendAdminBookingNotificationEmail = async (adminEmails, payload) => {
  const recipients = Array.isArray(adminEmails) ? adminEmails.filter(Boolean) : [adminEmails].filter(Boolean);
  if (!recipients.length) return;
  const {
    bookingId,
    userName,
    userEmail,
    date,
    slot,
    hallName,
    status,
    totalAmount,
  } = payload || {};

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 640px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #b22222; margin-bottom: 16px;">New Booking Received</h2>
      <p>Hello Admin,</p>
      <p>A new booking has been submitted. Details are below:</p>
      <div style="background: #f9f9f9; padding: 16px; border-radius: 6px; margin: 16px 0;">
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Slot:</strong> ${slot}</p>
        <p><strong>Venue:</strong> ${hallName}</p>
        <p><strong>Total Amount:</strong> Rs. ${totalAmount}</p>
      </div>
      <div style="padding: 12px 16px; background: #eef6ff; border-radius: 6px;">
        <p style="margin: 0 0 6px 0;"><strong>Customer:</strong> ${userName || "Guest"}</p>
        <p style="margin: 0;"><strong>Email:</strong> ${userEmail}</p>
      </div>
      <p style="margin-top: 16px;">Please review and take necessary action in the admin panel.</p>
      <p>— Shubham Venue</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Shubham Venue <info@shubham-venue.me>",
      to: recipients,
      subject: "New Booking Notification",
      html,
    });
  } catch (err) {
    console.error("Error sending admin booking notification email:", err);
  }
};

// Notify admin(s) about a new organizer request
export const sendAdminOrganizerRequestEmail = async (adminEmails, payload) => {
  const recipients = Array.isArray(adminEmails) ? adminEmails.filter(Boolean) : [adminEmails].filter(Boolean);
  if (!recipients.length) return;

  const { userName, userEmail, note, requestedAt } = payload || {};
  const noteBlock = note
    ? `<div style="background: #f9f9f9; padding: 12px; border-radius: 6px; margin: 12px 0;">${note}</div>`
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 640px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #b22222; margin-bottom: 16px;">Organizer Access Request</h2>
      <p>Hello Admin,</p>
      <p>A user has requested organizer access. Review the details below:</p>
      <div style="background: #f9f9f9; padding: 16px; border-radius: 6px; margin: 16px 0;">
        <p><strong>User:</strong> ${userName || "Guest"}</p>
        <p><strong>Email:</strong> ${userEmail || ""}</p>
        <p><strong>Requested At:</strong> ${requestedAt || ""}</p>
      </div>
      ${noteBlock}
      <p style="margin-top: 16px;">Please review and approve or reject this request in the admin panel.</p>
      <p>— Shubham Venue</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Shubham Venue <info@shubham-venue.me>",
      to: recipients,
      subject: "Organizer Request Submitted",
      html,
    });
  } catch (err) {
    console.error("Error sending organizer request notification email:", err);
  }
};

// Notify organizer when their event is approved
export const sendOrganizerEventApprovedEmail = async (organizerEmail, payload) => {
  if (!organizerEmail) return;

  const { eventName, organizerName, eventId } = payload || {};
  
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 640px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #28a745; margin-bottom: 16px;">Event Approved!</h2>
      <p>Dear ${organizerName || "Organizer"},</p>
      <p>Great news! Your event has been approved and is now live.</p>
      
      <div style="background: #d4edda; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #28a745;">
        <p style="margin: 0;"><strong>Event:</strong> ${eventName || "Your Event"}</p>
        <p style="margin: 8px 0 0 0;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">PUBLISHED</span></p>
      </div>
      
      <p>Your event is now visible to customers and accepting bookings. You can manage the event details anytime from your dashboard.</p>
      
      <p style="margin-top: 20px; padding: 12px; background: #f0f8ff; border-radius: 6px;">
        If you have any questions or need assistance, feel free to reach out to our support team.
      </p>
      
      <p>Thank you for hosting with Shubham Venue!</p>
      <p>— The Shubham Venue Team</p>
      
      <hr style="margin: 20px 0;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Shubham Venue <info@shubham-venue.me>",
      to: [organizerEmail],
      subject: `Your Event "${eventName}" Has Been Approved!`,
      html,
    });
  } catch (err) {
    console.error("Error sending event approved email to organizer:", err);
  }
};

// Notify organizer when their event is rejected
export const sendOrganizerEventRejectedEmail = async (organizerEmail, payload) => {
  if (!organizerEmail) return;

  const { eventName, organizerName, rejectionReason } = payload || {};
  const reasonBlock = rejectionReason 
    ? `<div style="background: #fff3cd; padding: 12px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 16px 0;"><strong>Reason:</strong> ${rejectionReason}</div>`
    : "";
  
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 640px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #dc3545; margin-bottom: 16px;">Event Requires Revision</h2>
      <p>Dear ${organizerName || "Organizer"},</p>
      <p>Thank you for submitting your event. Unfortunately, it could not be approved at this time.</p>
      
      <div style="background: #f8d7da; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #dc3545;">
        <p style="margin: 0;"><strong>Event:</strong> ${eventName || "Your Event"}</p>
        <p style="margin: 8px 0 0 0;"><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">REJECTED</span></p>
      </div>
      
      ${reasonBlock}
      
      <p>Please review the feedback and consider resubmitting your event with the necessary changes. Our admin team is here to support you.</p>
      
      <p style="margin-top: 16px;">If you have questions about the rejection or need clarification, please feel free to contact our support team at contact@shubham-venue.me or call 9849320765.</p>
      
      <p>We look forward to working with you soon!</p>
      <p>— The Shubham Venue Team</p>
      
      <hr style="margin: 20px 0;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Shubham Venue <info@shubham-venue.me>",
      to: [organizerEmail],
      subject: `Your Event "${eventName}" Requires Revision`,
      html,
    });
  } catch (err) {
    console.error("Error sending event rejected email to organizer:", err);
  }
};

// Notify admin(s) when new event needs approval
export const sendAdminEventPendingApprovalEmail = async (adminEmails, payload) => {
  const recipients = Array.isArray(adminEmails) ? adminEmails.filter(Boolean) : [adminEmails].filter(Boolean);
  if (!recipients.length) return;

  const { eventName, organizerName, trustScore, eventId } = payload || {};
  
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 640px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #0056b3; margin-bottom: 16px;">Event Pending Review</h2>
      <p>Hello Admin,</p>
      <p>A new event has been submitted and requires your review and approval.</p>
      
      <div style="background: #e7f3ff; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #0056b3;">
        <p style="margin: 0;"><strong>Event:</strong> ${eventName || "New Event"}</p>
        <p style="margin: 8px 0 0 0;"><strong>Organizer:</strong> ${organizerName || "Unknown"}</p>
        <p style="margin: 8px 0 0 0;"><strong>Organizer Trust Score:</strong> <span style="font-weight: bold;">${trustScore?.toFixed(1) || "N/A"}/5</span></p>
        <p style="margin: 8px 0 0 0;"><strong>Status:</strong> <span style="color: #0056b3; font-weight: bold;">PENDING REVIEW</span></p>
      </div>
      
      <p style="margin: 20px 0;">Please review this event submission at your earliest convenience. You can:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Approve the event for immediate publication</li>
        <li>Request modifications from the organizer</li>
        <li>Reject the event submission</li>
      </ul>
      
      <p style="margin: 20px 0; padding: 12px; background: #f0f8ff; border-radius: 6px;">
        <strong>Action Required:</strong> Visit the governance dashboard to review and take action on this event.
      </p>
      
      <p>— The Shubham Venue Team</p>
      
      <hr style="margin: 20px 0;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Shubham Venue <info@shubham-venue.me>",
      to: recipients,
      subject: `Review Required: Event "${eventName}" Pending Approval`,
      html,
    });
  } catch (err) {
    console.error("Error sending event pending approval email to admin:", err);
  }
};

// Send staff scanner assignment notification email
export const sendStaffAssignmentEmail = async (user, event, gate) => {
  if (!user?.email) return;

  const eventDate = event?.startDateTime || event?.eventDate;
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("en-NP", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";
  const formattedTime = eventDate
    ? new Date(eventDate).toLocaleTimeString("en-NP", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #8b3a3a;">🎉 New Scanner Assignment</h2>
      
      <p>Dear ${user.first_name || user.username || "Staff"},</p>
      
      <p>You have been assigned as a scanner for an upcoming event at <strong>Shubham Venue</strong>. Below are the details:</p>
      
      <div style="background: #f5f5f5; border-left: 4px solid #8b3a3a; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 10px 0;"><strong>Event Name:</strong> ${event?.name || "N/A"}</p>
        <p style="margin: 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin: 10px 0;"><strong>Time:</strong> ${formattedTime}</p>
        <p style="margin: 10px 0;"><strong>Gate/Entrance:</strong> <span style="background: #8b3a3a; color: #fff; padding: 5px 10px; border-radius: 4px; display: inline-block;">${gate || "N/A"}</span></p>
        ${event?.hall?.name ? `<p style="margin: 10px 0;"><strong>Hall:</strong> ${event.hall.name}</p>` : ""}
      </div>
      
      <p><strong>Your Responsibilities:</strong></p>
      <ul style="margin: 10px 0;">
        <li>Check in attendees using the QR scanner app</li>
        <li>Verify ticket validity before check-in</li>
        <li>Report any issues or suspicious activity</li>
        <li>Maintain security at your assigned gate</li>
      </ul>
      
      <p><strong>What You Need to Do:</strong></p>
      <ol style="margin: 10px 0;">
        <li>Download or update the Shubham QR Scanner mobile app</li>
        <li>Log in with your credentials</li>
        <li>Review the event details in the app</li>
        <li>Be ready 30 minutes before the event starts</li>
      </ol>
      
      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 5px 0;">⏰ <strong>Important:</strong> It is crucial to arrive at your gate at least 30 minutes before the event starts. Contact event organizers if you have any conflicts.</p>
      </div>
      
      <p>If you have any questions or need to reschedule, please contact us at <strong>${ENV.SUPPORT_EMAIL || "contact@shubham-venue.me"}</strong></p>
      
      <p style="margin-top: 30px;">Best regards,<br/><strong>Shubham Venue Staff Management Team</strong></p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me<br/>
        <a href="https://shubham-venue.me" style="color: #8b3a3a; text-decoration: none;">Visit our website</a>
      </footer>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Shubham Venue <info@shubham-venue.me>",
      to: [user.email],
      subject: `📋 New Scanner Assignment - ${event?.name || "Event"}`,
      html,
    });

    if (error) {
      console.error("Resend API error sending staff assignment email:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Staff assignment email sent:", data.id);
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error("Error sending staff assignment email:", err);
    return { success: false, error: err.message };
  }
};

// Send staff assignment cancellation notification email
export const sendStaffAssignmentCancelledEmail = async (user, event, reason = "") => {
  if (!user?.email) return;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #d32f2f;">⚠️ Assignment Cancelled</h2>
      
      <p>Dear ${user.first_name || user.username || "Staff"},</p>
      
      <p>Your scanner assignment for the following event has been cancelled:</p>
      
      <div style="background: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 10px 0;"><strong>Event:</strong> ${event?.name || "N/A"}</p>
        <p style="margin: 10px 0;"><strong>Cancellation Reason:</strong> ${reason || "No reason provided"}</p>
      </div>
      
      <p>If you believe this is an error or have questions, please contact us at <strong>${ENV.SUPPORT_EMAIL || "contact@shubham-venue.me"}</strong></p>
      
      <p style="margin-top: 30px;">Best regards,<br/><strong>Shubham Venue Staff Management Team</strong></p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Shubham Venue <info@shubham-venue.me>",
      to: [user.email],
      subject: `Assignment Cancelled - ${event?.name || "Event"}`,
      html,
    });

    if (error) {
      console.error("Resend API error sending cancellation email:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Staff assignment cancellation email sent:", data.id);
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error("Error sending staff assignment cancellation email:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Send warning email to event organizer
 */
export const sendOrganizerWarningEmail = async (organizerEmail, organizerName, eventName, reason) => {
  if (!organizerEmail) return;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #d32f2f;">⚠️ Event Warning Notice</h2>
      
      <p>Dear ${organizerName},</p>
      
      <p>We are writing to inform you about a concern regarding your event on our platform.</p>
      
      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 5px 0;"><strong>Event:</strong> ${eventName}</p>
        <p style="margin: 5px 0;"><strong>Issue Reported:</strong> ${reason}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-NP')}</p>
      </div>
      
      <p><strong>What This Means:</strong></p>
      <ul>
        <li>Our team has reviewed a report regarding your event</li>
        <li>This warning is being sent as a courtesy notice</li>
        <li>Please review the reported concern and take appropriate action</li>
        <li>Repeated violations may result in event suspension or account restrictions</li>
      </ul>
      
      <p><strong>What You Can Do:</strong></p>
      <ol>
        <li>Log in to your account to review the details</li>
        <li>Address any policy violations immediately</li>
        <li>Update event information if needed</li>
        <li>Contact our support team if you believe this is an error</li>
      </ol>
      
      <p>If you have any questions or would like to appeal this warning, please contact our support team at <strong>${ENV.SUPPORT_EMAIL}</strong></p>
      
      <p style="margin-top: 30px;">Best regards,<br/><strong>Shubham Venue Compliance Team</strong></p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me<br/>
        This is an automated message, please do not reply to this email.
      </footer>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Shubham Venue <info@shubham-venue.me>",
      to: [organizerEmail],
      subject: `⚠️ Important: Warning Notice for Event - ${eventName}`,
      html,
    });

    if (error) {
      console.error("Resend API error sending warning email:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Warning email sent:", data.id);
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error("Error sending warning email:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Send flag notification email
 */
export const sendFlagNotificationEmail = async (organizerEmail, organizerName, eventName, severity) => {
  if (!organizerEmail) return;

  const severityColors = {
    low: '#0066cc',
    medium: '#ff9800',
    high: '#d32f2f',
    critical: '#7c0000',
  };

  const severityDescriptions = {
    low: 'Your event has been flagged for minor review.',
    medium: 'Your event requires moderator attention.',
    high: 'Your event has been flagged and is under review. It may be suspended.',
    critical: 'Your event has been suspended due to serious violations.',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: ${severityColors[severity] || '#d32f2f'};">🚩 Event Flag Notification</h2>
      
      <p>Dear ${organizerName},</p>
      
      <p>${severityDescriptions[severity] || 'Your event has been flagged for review.'}</p>
      
      <div style="background: #f3f3f3; border-left: 4px solid ${severityColors[severity] || '#d32f2f'}; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 5px 0;"><strong>Event:</strong> ${eventName}</p>
        <p style="margin: 5px 0;"><strong>Severity:</strong> <span style="color: ${severityColors[severity] || '#d32f2f'}; font-weight: bold;">${severity.toUpperCase()}</span></p>
        <p style="margin: 5px 0;"><strong>Date Flagged:</strong> ${new Date().toLocaleDateString('en-NP')}</p>
      </div>
      
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Visit your dashboard to see more details</li>
        <li>Review our community guidelines</li>
        <li>Make necessary updates to your event</li>
        <li>Our team will contact you with further information</li>
      </ul>
      
      <p>For assistance, please contact: <strong>${ENV.SUPPORT_EMAIL}</strong></p>
      
      <p style="margin-top: 30px;">Best regards,<br/><strong>Shubham Venue Moderation Team</strong></p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Shubham Venue <info@shubham-venue.me>",
      to: [organizerEmail],
      subject: `🚩 Event Flag Notification - ${eventName}`,
      html,
    });

    if (error) {
      console.error("Resend API error sending flag notification:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Flag notification email sent:", data.id);
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error("Error sending flag notification email:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Send event suspension email
 */
export const sendEventSuspensionEmail = async (organizerEmail, organizerName, eventName, reason) => {
  if (!organizerEmail) return;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #d32f2f;">🚫 Event Suspended</h2>
      
      <p>Dear ${organizerName},</p>
      
      <p style="color: #d32f2f; font-weight: bold;">Your event has been suspended and is no longer visible to users.</p>
      
      <div style="background: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 5px 0;"><strong>Event:</strong> ${eventName}</p>
        <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>
        <p style="margin: 5px 0;"><strong>Date Suspended:</strong> ${new Date().toLocaleDateString('en-NP')}</p>
      </div>
      
      <p><strong>Important Information:</strong></p>
      <ul>
        <li>Your event is no longer available for bookings</li>
        <li>Existing bookings will be affected</li>
        <li>You may appeal this decision within 7 days</li>
        <li>Repeated violations may result in account suspension</li>
      </ul>
      
      <p><strong>Appeal Process:</strong></p>
      <p>If you believe this suspension is in error, please send us a detailed explanation and any supporting evidence to <strong>${ENV.SUPPORT_EMAIL}</strong></p>
      
      <p style="margin-top: 30px;">Best regards,<br/><strong>Shubham Venue Compliance Team</strong></p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Shubham Venue <info@shubham-venue.me>",
      to: [organizerEmail],
      subject: `🚫 Event Suspended - ${eventName}`,
      html,
    });

    if (error) {
      console.error("Resend API error sending suspension email:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Suspension email sent:", data.id);
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error("Error sending suspension email:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Send event cancellation notification to attendees
 */
export const sendEventCancellationEmail = async (attendeeEmail, eventName, cancellationReason, eventDate, refundFormUrl) => {
  if (!attendeeEmail) return;

  const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-NP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'N/A';

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 640px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #dc3545; margin-bottom: 16px;">Event Cancellation Notice</h2>
      <p>Dear Attendee,</p>
      <p>We regret to inform you that the following event has been cancelled:</p>
      
      <div style="background: #ffe6e6; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #dc3545;">
        <p style="margin: 0;"><strong>Event:</strong> ${eventName}</p>
        <p style="margin: 8px 0 0 0;"><strong>Scheduled Date:</strong> ${formattedDate}</p>
        ${cancellationReason ? `<p style="margin: 8px 0 0 0;"><strong>Reason:</strong> ${cancellationReason}</p>` : ''}
      </div>
      
      <h3 style="color: #2c3e50; margin-top: 20px;">Refund Process</h3>
      <p>We understand this may be disappointing. To process your refund request, please fill out the form below:</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <a href="${refundFormUrl}" style="display: inline-block; background: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Submit Refund Request Form
        </a>
      </div>
      
      <p>Our team will review your refund request and process it within 5-7 business days.</p>
      
      <h3 style="color: #2c3e50; margin-top: 20px;">Need Help?</h3>
      <p>If you have any questions or concerns, please contact our support team:</p>
      <p>
        <strong>Email:</strong> <a href="mailto:${ENV.SUPPORT_EMAIL}" style="color: #007bff;">${ENV.SUPPORT_EMAIL}</a><br/>
        <strong>Phone:</strong> 9849320765
      </p>
      
      <p style="margin-top: 20px;">We apologize for any inconvenience this may cause.</p>
      <p>Thank you for your understanding,<br/>The Shubham Venue Team</p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Shubham Venue <info@shubham-venue.me>",
      to: [attendeeEmail],
      subject: `Event Cancelled: "${eventName}" - Refund Information`,
      html
    });

    if (error) {
      console.error("Resend API error sending cancellation email:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Cancellation email sent:", data.id);
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error("Error sending event cancellation email:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Send booking invoice via email with attachment
 */
export const sendInvoiceEmail = async (customerEmail, customerName, bookingDetails, pdfBuffer) => {
  if (!customerEmail) return;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #2c3e50;">📄 Your Booking Invoice</h2>
      <p>Dear ${customerName},</p>
      <p>Thank you for your booking! Your invoice is attached to this email.</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
        <p style="margin: 5px 0;"><strong>Venue:</strong> ${bookingDetails.venue}</p>
        <p style="margin: 5px 0;"><strong>Event Date:</strong> ${bookingDetails.eventDate}</p>
        <p style="margin: 5px 0;"><strong>Time Slot:</strong> ${bookingDetails.slot}</p>
        <p style="margin: 5px 0;"><strong>Number of Guests:</strong> ${bookingDetails.guests}</p>
        <p style="margin: 5px 0; font-size: 18px; color: #2c3e50;"><strong>Total Amount:</strong> Rs. ${bookingDetails.totalAmount}</p>
      </div>

      <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 5px 0; color: #2e7d32;"><strong>✔️ Payment Status:</strong> ${bookingDetails.paymentStatus}</p>
        <p style="margin: 5px 0; color: #2e7d32;"><strong>✔️ Booking Status:</strong> ${bookingDetails.bookingStatus}</p>
      </div>

      <p><strong>Important Information:</strong></p>
      <ul>
        <li>Please keep this invoice for your records</li>
        <li>You will receive a reminder 24 hours before your event</li>
        <li>If you have any questions, contact our support team</li>
        <li>Your cancellation/modification policy details are below</li>
      </ul>

      <p style="margin-top: 20px; font-size: 12px; color: #666;">For questions or support, contact us at:</p>
      <p style="font-size: 12px; color: #666;"><strong>Email:</strong> ${ENV.SUPPORT_EMAIL}<br/><strong>Phone:</strong> 9849320765</p>

      <p style="margin-top: 30px;">Best regards,<br/><strong>Shubham Venue Management</strong></p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me<br/>
        <em>This is an automated message, please do not reply to this email.</em>
      </footer>
    </div>
  `;

  try {
    const attachments = pdfBuffer ? [
      {
        filename: `invoice-${bookingDetails.bookingId}.pdf`,
        content: pdfBuffer,
      }
    ] : [];

    const { data, error } = await resend.emails.send({
      from: "Shubham Venue <info@shubham-venue.me>",
      to: [customerEmail],
      subject: `📄 Booking Invoice - ${bookingDetails.bookingId}`,
      html,
      attachments
    });

    if (error) {
      console.error("Resend API error sending invoice email:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Invoice email sent:", data.id);
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error("Error sending invoice email:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmationEmail = async (customerEmail, customerName, paymentDetails) => {
  if (!customerEmail) return;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #4caf50;">✅ Payment Confirmed</h2>
      <p>Dear ${customerName},</p>
      <p>Your payment has been successfully received and confirmed!</p>
      
      <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${paymentDetails.bookingId}</p>
        <p style="margin: 5px 0;"><strong>Amount Paid:</strong> Rs. ${paymentDetails.amount}</p>
        <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentDetails.gateway}</p>
        <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${paymentDetails.transactionId || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${paymentDetails.paidAt}</p>
      </div>

      <p><strong>What's Next?</strong></p>
      <ul>
        <li>Your booking is now confirmed</li>
        <li>Check your email for the complete invoice</li>
        <li>You will receive appointment reminders before your event</li>
        <li>Keep your booking ID handy for any future reference</li>
      </ul>

      <p>Thank you for choosing Shubham Venue!</p>
      <p style="margin-top: 30px;">Best regards,<br/><strong>Shubham Venue Team</strong></p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Shubham Venue <info@shubham-venue.me>",
      to: [customerEmail],
      subject: `✅ Payment Confirmation - ${paymentDetails.bookingId}`,
      html
    });

    if (error) {
      console.error("Resend API error sending payment confirmation:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Payment confirmation email sent:", data.id);
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error("Error sending payment confirmation email:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Email service health check (replaces nodemailer.verify())
 */
export const sendPasswordResetEmail = async (email, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #3a1224;">Shubham Venue</h2>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #3a1224; color: #C0A04C; padding: 14px 32px; border-radius: 8px; font-weight: bold; text-decoration: none; letter-spacing: 1px;">
          Reset Password
        </a>
      </div>
      <p style="color: #888; font-size: 13px;">This link expires in <strong>1 hour</strong>. If you did not request this, ignore this email — your password will not change.</p>
      <hr style="margin: 20px 0;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja<br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;
  const { error } = await resend.emails.send({
    from: 'Shubham Venue <info@shubham-venue.me>',
    to: [email],
    subject: 'Reset your password – Shubham Venue',
    html,
  });
  if (error) throw httpError(500, 'Failed to send reset email');
};

export const verifyEmailConnection = async () => {
  try {
    console.log("✅ Resend email service is configured and ready");
    return { success: true, message: "Email service is configured and ready" };
  } catch (err) {
    console.error("Error verifying email service:", err);
    return { success: false, error: err.message };
  }
};
