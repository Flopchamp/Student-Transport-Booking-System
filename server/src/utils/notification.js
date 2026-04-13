const { Notification } = require('../models');

/**
 * Create an in-app notification for a user.
 * Fire-and-forget — does not throw on failure.
 *
 * @param {Object} opts
 * @param {string} opts.userId - Target user ID
 * @param {string} opts.title  - Short title
 * @param {string} opts.message - Body message
 * @param {'booking'|'payment'|'system'|'announcement'|'complaint'|'tracking'} [opts.type='system']
 * @param {string} [opts.link] - Optional link to navigate to
 */
const createNotification = async ({ userId, title, message, type = 'system', link = null }) => {
  try {
    await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      link,
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

/**
 * Send a notification to all admin users.
 */
const notifyAdmins = async ({ title, message, type = 'system', link = null }) => {
  try {
    const { User } = require('../models');
    const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
    await Promise.all(
      admins.map((admin) =>
        Notification.create({ user_id: admin.id, title, message, type, link })
      )
    );
  } catch (err) {
    console.error('Failed to notify admins:', err.message);
  }
};

module.exports = { createNotification, notifyAdmins };
