const nodemailer = require('nodemailer');
const env = require('../config/env');

/**
 * Create nodemailer transporter.
 * Falls back to console logging in development if SMTP is not configured.
 */
const createTransporter = () => {
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return null;
};

/**
 * Send a password reset email.
 * @param {string} to - Recipient email address.
 * @param {string} resetUrl - Full URL the user clicks to reset their password.
 */
const sendPasswordResetEmail = async (to, resetUrl) => {
  const subject = 'Password Reset Request — EduTrans';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1e293b;">Reset Your Password</h2>
      <p style="color: #475569; line-height: 1.6;">
        You requested a password reset for your EduTrans account.
        Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 32px; background: #6366f1; color: #fff; font-weight: bold; text-decoration: none; border-radius: 8px;">
          Reset Password
        </a>
      </div>
      <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
        If you didn't request this, please ignore this email. Your password will remain unchanged.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">
        &copy; ${new Date().getFullYear()} EduTrans — Student Transport Solutions
      </p>
    </div>
  `;

  const transporter = createTransporter();

  if (transporter) {
    await transporter.sendMail({
      from: `"EduTrans" <${env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Password reset email sent to ${to}`);
  } else {
    // Development fallback — log to console
    console.log('─────────────────────────────────────────');
    console.log('[Email - Dev Fallback] Password Reset Email');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('─────────────────────────────────────────');
  }
};

module.exports = { sendPasswordResetEmail };
