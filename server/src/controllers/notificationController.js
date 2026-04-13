const { Op } = require('sequelize');
const { Notification } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/v1/notifications
 * Get the current user's notifications (paginated).
 */
const getNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, unread_only } = req.query;
  const offset = (page - 1) * limit;

  const where = { user_id: req.user.id };
  if (unread_only === 'true') {
    where.is_read = false;
  }

  const { count, rows: notifications } = await Notification.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
  });

  ApiResponse.paginated(
    res,
    { notifications },
    {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
    'Notifications retrieved successfully',
  );
});

/**
 * GET /api/v1/notifications/unread-count
 * Get the count of unread notifications for the current user.
 */
const getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.count({
    where: { user_id: req.user.id, is_read: false },
  });

  ApiResponse.success(res, { count }, 'Unread count retrieved');
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a single notification as read.
 */
const markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOne({
    where: { id: req.params.id, user_id: req.user.id },
  });

  if (!notification) {
    return ApiResponse.notFound(res, 'Notification not found.');
  }

  notification.is_read = true;
  notification.read_at = new Date();
  await notification.save();

  ApiResponse.success(res, { notification }, 'Notification marked as read');
});

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read for the current user.
 */
const markAllAsRead = catchAsync(async (req, res) => {
  await Notification.update(
    { is_read: true, read_at: new Date() },
    { where: { user_id: req.user.id, is_read: false } },
  );

  ApiResponse.success(res, null, 'All notifications marked as read');
});

/**
 * DELETE /api/v1/notifications/:id
 * Delete a single notification.
 */
const deleteNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findOne({
    where: { id: req.params.id, user_id: req.user.id },
  });

  if (!notification) {
    return ApiResponse.notFound(res, 'Notification not found.');
  }

  await notification.destroy();
  ApiResponse.success(res, null, 'Notification deleted');
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
