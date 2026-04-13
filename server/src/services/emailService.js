const nodemailer = require('nodemailer');
const env = require('../config/env');

/* ───────────────────────────────────────────────────
   Transporter
   ─────────────────────────────────────────────────── */

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

/* ───────────────────────────────────────────────────
   Shared HTML wrapper
   ─────────────────────────────────────────────────── */
const wrapHtml = (body) => `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #334155;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="margin: 0; color: #6366f1; font-size: 24px;">EduTrans</h1>
      <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">Student Transport Booking System</p>
    </div>
    ${body}
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
      &copy; ${new Date().getFullYear()} EduTrans — Student Transport Solutions
    </p>
  </div>
`;

/* ───────────────────────────────────────────────────
   Helper to send or log in dev
   ─────────────────────────────────────────────────── */
const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();

  if (transporter) {
    await transporter.sendMail({
      from: `"EduTrans" <${env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent "${subject}" to ${to}`);
  } else {
    console.log('─────────────────────────────────────────');
    console.log(`[Email - Dev Fallback] ${subject}`);
    console.log(`To: ${to}`);
    console.log('─────────────────────────────────────────');
  }
};

/* ───────────────────────────────────────────────────
   1. Password Reset
   ─────────────────────────────────────────────────── */
const sendPasswordResetEmail = async (to, resetUrl) => {
  const subject = 'Password Reset Request — EduTrans';
  const html = wrapHtml(`
    <h2 style="color: #1e293b;">Reset Your Password</h2>
    <p style="line-height: 1.6;">
      You requested a password reset. Click the button below to set a new password.
      This link is valid for <strong>1 hour</strong>.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}"
         style="display: inline-block; padding: 12px 32px; background: #6366f1; color: #fff; font-weight: bold; text-decoration: none; border-radius: 8px;">
        Reset Password
      </a>
    </div>
    <p style="color: #94a3b8; font-size: 13px;">
      If you didn't request this, please ignore this email.
    </p>
  `);
  await sendEmail(to, subject, html);
};

/* ───────────────────────────────────────────────────
   2. Booking Confirmation
   ─────────────────────────────────────────────────── */
const sendBookingConfirmationEmail = async (to, data) => {
  const { parentName, bookingRef, studentName, routeName, startDate, pickupTime, amount } = data;
  const subject = `Booking Confirmed — ${bookingRef}`;
  const html = wrapHtml(`
    <h2 style="color: #1e293b;">Booking Confirmed! 🎉</h2>
    <p>Hi <strong>${parentName}</strong>,</p>
    <p style="line-height: 1.6;">
      Your transport booking has been confirmed. Here are the details:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Reference</td>
          <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${bookingRef}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Student</td>
          <td style="padding: 8px 0; font-weight: bold;">${studentName}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Route</td>
          <td style="padding: 8px 0; font-weight: bold;">${routeName}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Start Date</td>
          <td style="padding: 8px 0; font-weight: bold;">${startDate}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Pickup Time</td>
          <td style="padding: 8px 0; font-weight: bold;">${pickupTime}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Amount</td>
          <td style="padding: 8px 0; font-weight: bold; color: #16a34a;">KES ${Number(amount).toLocaleString()}</td></tr>
    </table>
    <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
      You will be notified of any status changes. Thank you for choosing EduTrans!
    </p>
  `);
  await sendEmail(to, subject, html);
};

/* ───────────────────────────────────────────────────
   3. Booking Status Change
   ─────────────────────────────────────────────────── */
const sendBookingStatusEmail = async (to, data) => {
  const { parentName, bookingRef, studentName, oldStatus, newStatus } = data;
  const subject = `Booking ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} — ${bookingRef}`;

  const statusColors = {
    confirmed: '#16a34a',
    cancelled: '#dc2626',
    completed: '#6366f1',
    pending: '#d97706',
  };

  const html = wrapHtml(`
    <h2 style="color: #1e293b;">Booking Status Updated</h2>
    <p>Hi <strong>${parentName}</strong>,</p>
    <p style="line-height: 1.6;">
      Your booking <strong style="font-family: monospace;">${bookingRef}</strong> for
      <strong>${studentName}</strong> has been updated.
    </p>
    <div style="text-align: center; margin: 24px 0; padding: 16px; background: #f1f5f9; border-radius: 8px;">
      <span style="color: #94a3b8; text-decoration: line-through; font-size: 14px;">${oldStatus}</span>
      <span style="margin: 0 12px; color: #94a3b8;">→</span>
      <span style="color: ${statusColors[newStatus] || '#334155'}; font-weight: bold; font-size: 16px; text-transform: uppercase;">${newStatus}</span>
    </div>
    <p style="color: #64748b; font-size: 13px;">
      If you have any questions, please contact our support team.
    </p>
  `);
  await sendEmail(to, subject, html);
};

/* ───────────────────────────────────────────────────
   4. Payment Receipt
   ─────────────────────────────────────────────────── */
const sendPaymentReceiptEmail = async (to, data) => {
  const { parentName, transactionRef, bookingRef, amount, paymentMethod, paidAt } = data;
  const subject = `Payment Receipt — ${transactionRef}`;
  const html = wrapHtml(`
    <h2 style="color: #1e293b;">Payment Successful ✅</h2>
    <p>Hi <strong>${parentName}</strong>,</p>
    <p style="line-height: 1.6;">
      We've received your payment. Here is your receipt:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Transaction</td>
          <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${transactionRef}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Booking</td>
          <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${bookingRef}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Method</td>
          <td style="padding: 8px 0; font-weight: bold;">${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Card (Stripe)'}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Date</td>
          <td style="padding: 8px 0; font-weight: bold;">${new Date(paidAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td></tr>
    </table>
    <div style="text-align: center; margin: 24px 0; padding: 16px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
      <p style="margin: 0; font-size: 13px; color: #16a34a;">Amount Paid</p>
      <p style="margin: 4px 0 0; font-size: 24px; font-weight: bold; color: #15803d;">KES ${Number(amount).toLocaleString()}</p>
    </div>
    <p style="color: #64748b; font-size: 13px;">
      A PDF receipt is available for download from your Payment History page.
    </p>
  `);
  await sendEmail(to, subject, html);
};

/* ───────────────────────────────────────────────────
   5. Booking Cancellation
   ─────────────────────────────────────────────────── */
const sendBookingCancellationEmail = async (to, data) => {
  const { parentName, bookingRef, studentName, routeName } = data;
  const subject = `Booking Cancelled — ${bookingRef}`;
  const html = wrapHtml(`
    <h2 style="color: #dc2626;">Booking Cancelled</h2>
    <p>Hi <strong>${parentName}</strong>,</p>
    <p style="line-height: 1.6;">
      Your booking <strong style="font-family: monospace;">${bookingRef}</strong> for
      <strong>${studentName}</strong> on route <strong>${routeName}</strong> has been cancelled.
    </p>
    <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
      If this was unintentional, you can create a new booking from your dashboard.
      For payment-related queries, please contact support.
    </p>
  `);
  await sendEmail(to, subject, html);
};

/* ───────────────────────────────────────────────────
   6. Welcome / Registration
   ─────────────────────────────────────────────────── */
const sendWelcomeEmail = async (to, data) => {
  const { parentName } = data;
  const subject = 'Welcome to EduTrans! 🚌';
  const html = wrapHtml(`
    <h2 style="color: #1e293b;">Welcome aboard, ${parentName}! 🎉</h2>
    <p style="line-height: 1.6;">
      Your EduTrans account has been created successfully. You can now:
    </p>
    <ul style="line-height: 2; color: #475569;">
      <li>Register your children</li>
      <li>Browse available transport routes</li>
      <li>Book transport with flexible schedules</li>
      <li>Track payments and download receipts</li>
    </ul>
    <p style="color: #64748b; font-size: 13px;">
      Log in to your dashboard to get started. If you need help, our support team is here for you.
    </p>
  `);
  await sendEmail(to, subject, html);
};

module.exports = {
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendBookingStatusEmail,
  sendPaymentReceiptEmail,
  sendBookingCancellationEmail,
  sendWelcomeEmail,
};
