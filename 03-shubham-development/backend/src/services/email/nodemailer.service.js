import nodemailer from 'nodemailer';
import ENV from '../../config/env.config.js';

// Initialize transporter with SMTP configuration
const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  secure: ENV.SMTP_SECURE,
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASSWORD,
  },
  family: 4
});

/**
 * Send warning email to event organizer
 */
export const sendOrganizerWarningEmail = async (organizerEmail, organizerName, eventName, reason) => {
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

  const mailOptions = {
    from: `"Shubham Venue <${ENV.SMTP_USER}>"`,
    to: organizerEmail,
    subject: `⚠️ Important: Warning Notice for Event - ${eventName}`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Warning email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending warning email:', error);
    throw error;
  }
};

/**
 * Send flag notification email
 */
export const sendFlagNotificationEmail = async (organizerEmail, organizerName, eventName, severity) => {
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

  const mailOptions = {
    from: `"Shubham Venue <${ENV.SMTP_USER}>"`,
    to: organizerEmail,
    subject: `🚩 Event Flag Notification - ${eventName}`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Flag notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending flag notification email:', error);
    throw error;
  }
};

/**
 * Send event suspension email
 */
export const sendEventSuspensionEmail = async (organizerEmail, organizerName, eventName, reason) => {
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

  const mailOptions = {
    from: `"Shubham Venue <${ENV.SMTP_USER}>"`,
    to: organizerEmail,
    subject: `🚫 Event Suspended - ${eventName}`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Suspension email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending suspension email:', error);
    throw error;
  }
};

/**
 * Verify SMTP connection
 */
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return { success: true, message: 'Email service is configured and ready' };
  } catch (error) {
    console.error('SMTP connection error:', error);
    throw error;
  }
};

/**
 * Send booking invoice via email with attachment
 */
export const sendInvoiceEmail = async (customerEmail, customerName, bookingDetails, pdfBuffer) => {
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

  const mailOptions = {
    from: `"Shubham Venue" <${ENV.SMTP_USER}>`,
    to: customerEmail,
    subject: `📄 Booking Invoice - ${bookingDetails.bookingId}`,
    html,
    attachments: pdfBuffer ? [
      {
        filename: `invoice-${bookingDetails.bookingId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ] : []
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Invoice email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmationEmail = async (customerEmail, customerName, paymentDetails) => {
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

  const mailOptions = {
    from: `"Shubham Venue" <${ENV.SMTP_USER}>`,
    to: customerEmail,
    subject: `✅ Payment Confirmation - ${paymentDetails.bookingId}`,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
};

/**
 * Send event cancellation notification to attendees
 */
export const sendEventCancellationEmail = async (attendeeEmail, eventName, cancellationReason, eventDate, refundFormUrl) => {
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

  const mailOptions = {
    from: `"Shubham Venue" <${ENV.SMTP_USER}>`,
    to: attendeeEmail,
    subject: `Event Cancelled: "${eventName}" - Refund Information`,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Cancellation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending event cancellation email:', error);
    // Non-blocking - don't throw error
    return { success: false, error: error.message };
  }
};

/**
 * Send staff scanner assignment notification email
 */
export const sendStaffAssignmentEmail = async (user, event, gate) => {
  const eventDate = event.startDateTime || event.eventDate;
  const formattedDate = new Date(eventDate).toLocaleDateString("en-NP", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = new Date(eventDate).toLocaleTimeString("en-NP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #8b3a3a;">🎉 New Scanner Assignment</h2>
      
      <p>Dear ${user.first_name || user.username},</p>
      
      <p>You have been assigned as a scanner for an upcoming event at <strong>Shubham Venue</strong>. Below are the details:</p>
      
      <div style="background: #f5f5f5; border-left: 4px solid #8b3a3a; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 10px 0;"><strong>Event Name:</strong> ${event.name}</p>
        <p style="margin: 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin: 10px 0;"><strong>Time:</strong> ${formattedTime}</p>
        <p style="margin: 10px 0;"><strong>Gate/Entrance:</strong> <span style="background: #8b3a3a; color: #fff; padding: 5px 10px; border-radius: 4px; display: inline-block;">${gate}</span></p>
        ${event.hall ? `<p style="margin: 10px 0;"><strong>Hall:</strong> ${event.hall.name || "N/A"}</p>` : ""}
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

  const mailOptions = {
    from: `"Shubham Venue" <${ENV.SMTP_USER}>`,
    to: user.email,
    subject: `📋 New Scanner Assignment - ${event.name}`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Staff assignment email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending staff assignment email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send staff assignment cancellation notification email
 */
export const sendStaffAssignmentCancelledEmail = async (user, event, reason = "") => {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #d32f2f;">⚠️ Assignment Cancelled</h2>
      
      <p>Dear ${user.first_name || user.username},</p>
      
      <p>Your scanner assignment for the following event has been cancelled:</p>
      
      <div style="background: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 10px 0;"><strong>Event:</strong> ${event.name}</p>
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

  const mailOptions = {
    from: `"Shubham Venue" <${ENV.SMTP_USER}>`,
    to: user.email,
    subject: `Assignment Cancelled - ${event.name}`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Staff assignment cancellation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending staff assignment cancellation email:', error);
    return { success: false, error: error.message };
  }
};
