/**
 * SMS Service
 * Uses Africa's Talking as the SMS provider (configurable).
 * Falls back to console logging when no API key is configured (dev mode).
 *
 * Environment variables:
 *   SMS_ENABLED=true|false
 *   SMS_PROVIDER=africastalking (default)
 *   AT_API_KEY=your_api_key
 *   AT_USERNAME=your_username
 *   AT_SENDER_ID=EduTrans (optional)
 */

const SMS_ENABLED = process.env.SMS_ENABLED === 'true';
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'africastalking';
const AT_API_KEY = process.env.AT_API_KEY || '';
const AT_USERNAME = process.env.AT_USERNAME || 'sandbox';
const AT_SENDER_ID = process.env.AT_SENDER_ID || 'EduTrans';

/**
 * Send an SMS message.
 * In production with AT credentials, uses Africa's Talking API.
 * Otherwise logs to console (dev/simulation mode).
 *
 * @param {string} phone - Recipient phone number (E.164 format preferred)
 * @param {string} message - SMS body (max ~160 chars for single segment)
 * @param {object} [options] - Additional options
 * @param {string} [options.userId] - If provided, checks user's sms_notifications preference
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendSMS = async (phone, message, options = {}) => {
  // Check user's SMS preference if userId provided
  if (options.userId) {
    try {
      const { User } = require('../models');
      const user = await User.findByPk(options.userId, { attributes: ['sms_notifications'] });
      if (user && user.sms_notifications === false) {
        console.log(`[SMS] Skipped — user ${options.userId} has SMS notifications disabled`);
        return { success: true, messageId: 'skipped_preference' };
      }
    } catch {
      // If check fails, proceed with sending
    }
  }

  if (!SMS_ENABLED) {
    console.log(`[SMS-SIM] To: ${phone} | ${message}`);
    return { success: true, messageId: `sim_${Date.now()}` };
  }

  if (SMS_PROVIDER === 'africastalking' && AT_API_KEY) {
    try {
      // Dynamic import — only loads if actually configured
      const AfricasTalking = require('africastalking');
      const at = AfricasTalking({ apiKey: AT_API_KEY, username: AT_USERNAME });
      const sms = at.SMS;

      const result = await sms.send({
        to: [phone],
        message,
        from: AT_SENDER_ID || undefined,
      });

      const report = result.SMSMessageData?.Recipients?.[0];
      if (report && report.statusCode === 101) {
        console.log(`[SMS] Sent to ${phone}: ${report.messageId}`);
        return { success: true, messageId: report.messageId };
      } else {
        console.error(`[SMS] Failed to ${phone}:`, report?.status || 'Unknown error');
        return { success: false, error: report?.status || 'SMS send failed' };
      }
    } catch (err) {
      console.error(`[SMS] Error sending to ${phone}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // Fallback — no provider configured, simulate
  console.log(`[SMS-SIM] To: ${phone} | ${message}`);
  return { success: true, messageId: `sim_${Date.now()}` };
};

// ─────────────────────────────────────────────
// Template-based SMS helpers (fire-and-forget)
// ─────────────────────────────────────────────

/**
 * Booking confirmed SMS.
 */
const sendBookingConfirmedSMS = (phone, data) => {
  const msg = `EduTrans: Booking ${data.bookingRef} confirmed for ${data.studentName}. Route: ${data.routeName}. Pickup: ${data.pickupTime}.`;
  return sendSMS(phone, msg).catch((err) =>
    console.error('[SMS] Booking confirmed SMS failed:', err.message),
  );
};

/**
 * Booking cancelled SMS.
 */
const sendBookingCancelledSMS = (phone, data) => {
  const msg = `EduTrans: Booking ${data.bookingRef} for ${data.studentName} has been cancelled.`;
  return sendSMS(phone, msg).catch((err) =>
    console.error('[SMS] Booking cancelled SMS failed:', err.message),
  );
};

/**
 * Payment received SMS.
 */
const sendPaymentReceivedSMS = (phone, data) => {
  const msg = `EduTrans: Payment of KES ${data.amount} received for booking ${data.bookingRef}. Ref: ${data.transactionRef}. Thank you!`;
  return sendSMS(phone, msg).catch((err) =>
    console.error('[SMS] Payment received SMS failed:', err.message),
  );
};

/**
 * Refund processed SMS.
 */
const sendRefundProcessedSMS = (phone, data) => {
  const msg = `EduTrans: Refund of KES ${data.amount} processed for transaction ${data.transactionRef}. Allow 3-5 business days.`;
  return sendSMS(phone, msg).catch((err) =>
    console.error('[SMS] Refund processed SMS failed:', err.message),
  );
};

/**
 * Trip started SMS — bus is on the way.
 */
const sendTripStartedSMS = (phone, data) => {
  const msg = `EduTrans: The bus for ${data.routeName} has started. ${data.driverName ? `Driver: ${data.driverName}.` : ''} ETA: ${data.eta || 'See app'}.`;
  return sendSMS(phone, msg).catch((err) =>
    console.error('[SMS] Trip started SMS failed:', err.message),
  );
};

/**
 * Bus approaching stop SMS.
 */
const sendBusApproachingSMS = (phone, data) => {
  const msg = `EduTrans: The bus is approaching ${data.stopName}. Please be ready. ETA: ${data.eta || '~5 min'}.`;
  return sendSMS(phone, msg).catch((err) =>
    console.error('[SMS] Bus approaching SMS failed:', err.message),
  );
};

/**
 * Delay notification SMS.
 */
const sendDelaySMS = (phone, data) => {
  const msg = `EduTrans: The bus on ${data.routeName} is delayed. New ETA: ${data.newEta}. We apologize for the inconvenience.`;
  return sendSMS(phone, msg).catch((err) =>
    console.error('[SMS] Delay SMS failed:', err.message),
  );
};

module.exports = {
  sendSMS,
  sendBookingConfirmedSMS,
  sendBookingCancelledSMS,
  sendPaymentReceivedSMS,
  sendRefundProcessedSMS,
  sendTripStartedSMS,
  sendBusApproachingSMS,
  sendDelaySMS,
};
