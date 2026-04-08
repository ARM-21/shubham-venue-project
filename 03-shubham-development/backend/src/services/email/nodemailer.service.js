import nodemailer from 'nodemailer';

// Initialize transporter with SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
  },
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
      
      <p>If you have any questions or would like to appeal this warning, please contact our support team at <strong>${process.env.SUPPORT_EMAIL || 'support@shubham-venue.me'}</strong></p>
      
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
    from: `"Shubham Venue <${process.env.SMTP_USER || process.env.EMAIL_USER}>"`,
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
      
      <p>For assistance, please contact: <strong>${process.env.SUPPORT_EMAIL || 'support@shubham-venue.me'}</strong></p>
      
      <p style="margin-top: 30px;">Best regards,<br/><strong>Shubham Venue Moderation Team</strong></p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;

  const mailOptions = {
    from: `"Shubham Venue <${process.env.SMTP_USER || process.env.EMAIL_USER}>"`,
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
      <p>If you believe this suspension is in error, please send us a detailed explanation and any supporting evidence to <strong>${process.env.SUPPORT_EMAIL || 'support@shubham-venue.me'}</strong></p>
      
      <p style="margin-top: 30px;">Best regards,<br/><strong>Shubham Venue Compliance Team</strong></p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <footer style="text-align: center; font-size: 12px; color: #888;">
        Shubham Venue, Waling BP Road, Syangja <br/>
        📞 9849320765 | ✉️ contact@shubham-venue.me
      </footer>
    </div>
  `;

  const mailOptions = {
    from: `"Shubham Venue <${process.env.SMTP_USER || process.env.EMAIL_USER}>"`,
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
      <p style="font-size: 12px; color: #666;"><strong>Email:</strong> ${process.env.SUPPORT_EMAIL || 'support@shubham-venue.me'}<br/><strong>Phone:</strong> 9849320765</p>

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
    from: `"Shubham Venue" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
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
    from: `"Shubham Venue" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
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
