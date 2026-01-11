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
        📞 9849320765 | ✉️ shubhampartypalace.waling@gmail.com
      </footer>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Shubham Venue <info@shubhampartypalacewaling.live>',
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
        📞 9849320765 | ✉️ shubhampartypalace.waling@gmail.com
      </footer>
    </div>
  `;

  try {
    const { data } = await resend.emails.send({
      from: 'Shubham Venue <info@shubhampartypalacewaling.live>',
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
        📞 9849320765 | ✉️ shubhampartypalace.waling@gmail.com
      </footer>
    </div>
  `;

  try {
    const { data } = await resend.emails.send({
      from: 'Shubham Venue <info@shubhampartypalacewaling.live>',
      to: [email],
      subject: 'Booking Confirmation - Shubham Party Palace',
      html
    });

    return data;
  } catch (err) {
    console.error('Error sending booking confirmation email:', err);
  }
};
