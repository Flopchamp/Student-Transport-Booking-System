const { Op } = require('sequelize');
const { Announcement, User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const { logAudit } = require('../utils/auditLog');

/**
 * POST /announcements
 * Admin creates an announcement
 */
exports.createAnnouncement = catchAsync(async (req, res) => {
  const { title, content, category, priority, expires_at } = req.body;

  const announcement = await Announcement.create({
    title,
    content,
    category: category || 'general',
    priority: priority || 'normal',
    author_id: req.user.id,
    published_at: new Date(),
    expires_at: expires_at || null,
  });

  logAudit({
    userId: req.user.id,
    action: 'CREATE_ANNOUNCEMENT',
    entityType: 'Announcement',
    entityId: announcement.id,
    description: `Created announcement: "${title}"`,
    ipAddress: req.ip,
  });

  ApiResponse.success(res, announcement, 'Announcement created', 201);
});

/**
 * GET /announcements
 * Get announcements — admins see all, parents see active & non-expired
 */
exports.getAnnouncements = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, category, search } = req.query;
  const offset = (page - 1) * limit;
  const where = {};

  // Parents only see active, non-expired announcements
  if (req.user.role === 'parent') {
    where.is_active = true;
    where[Op.or] = [
      { expires_at: null },
      { expires_at: { [Op.gt]: new Date() } },
    ];
  }

  if (category) where.category = category;
  if (search) {
    const searchWhere = {
      [Op.or]: [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ],
    };
    Object.assign(where, searchWhere);
  }

  const { count, rows } = await Announcement.findAndCountAll({
    where,
    include: [{ model: User, as: 'author', attributes: ['id', 'first_name', 'last_name'] }],
    order: [['published_at', 'DESC']],
    limit: Number(limit),
    offset: Number(offset),
  });

  ApiResponse.success(res, {
    announcements: rows,
    total: count,
    page: Number(page),
    pages: Math.ceil(count / limit),
  });
});

/**
 * GET /announcements/:id
 */
exports.getAnnouncement = catchAsync(async (req, res) => {
  const announcement = await Announcement.findByPk(req.params.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'first_name', 'last_name'] }],
  });

  if (!announcement) {
    return ApiResponse.error(res, 'Announcement not found', 404);
  }

  ApiResponse.success(res, announcement);
});

/**
 * PUT /announcements/:id  (admin)
 */
exports.updateAnnouncement = catchAsync(async (req, res) => {
  const announcement = await Announcement.findByPk(req.params.id);
  if (!announcement) {
    return ApiResponse.error(res, 'Announcement not found', 404);
  }

  const { title, content, category, priority, is_active, expires_at } = req.body;
  await announcement.update({
    ...(title && { title }),
    ...(content && { content }),
    ...(category && { category }),
    ...(priority && { priority }),
    ...(is_active !== undefined && { is_active }),
    ...(expires_at !== undefined && { expires_at: expires_at || null }),
  });

  logAudit({
    userId: req.user.id,
    action: 'UPDATE_ANNOUNCEMENT',
    entityType: 'Announcement',
    entityId: announcement.id,
    description: `Updated announcement: "${announcement.title}"`,
    ipAddress: req.ip,
  });

  ApiResponse.success(res, announcement, 'Announcement updated');
});

/**
 * DELETE /announcements/:id  (admin)
 */
exports.deleteAnnouncement = catchAsync(async (req, res) => {
  const announcement = await Announcement.findByPk(req.params.id);
  if (!announcement) {
    return ApiResponse.error(res, 'Announcement not found', 404);
  }

  const title = announcement.title;
  await announcement.destroy();

  logAudit({
    userId: req.user.id,
    action: 'DELETE_ANNOUNCEMENT',
    entityType: 'Announcement',
    entityId: req.params.id,
    description: `Deleted announcement: "${title}"`,
    ipAddress: req.ip,
  });

  ApiResponse.success(res, null, 'Announcement deleted');
});
