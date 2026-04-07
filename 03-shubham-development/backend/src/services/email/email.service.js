import { Resend } from "resend";
import { httpError } from "../../utils/http.utils.js";

const resend = new Resend(process.env.RESEND_KEY);

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
      <h2 style="text-align: center; color: #2c3e50;">Welcome to Shubham Party Palace!</h2>
      <p>Dear ${username},</p>
      <p>Your email has been verified successfully. Thank you for joining us!</p>
      <p>You can now enjoy all our services including venue booking, event management, and more.</p>
      
      <p>Warm regards,<br/>The Shubham Party Palace Team</p>
      
      <hr style="margin: 20px 0;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Party Palace, Waling BP Road, Syangja <br/>
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
      
      <p>Warm regards,<br/>The Shubham Party Palace Team</p>
      
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
      subject: 'Booking Confirmation - Shubham Party Palace',
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
      from: "Shubham Venue <info@shubhampartypalacewaling.live>",
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
      from: "Shubham Venue <info@shubhampartypalacewaling.live>",
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
