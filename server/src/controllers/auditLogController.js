const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /audit-logs
 * List audit logs with search, filter, and pagination (admin only).
 */
const getAuditLogs = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 25,
    action,
    entity_type,
    user_id,
    search,
    sort = 'createdAt',
    order = 'DESC',
  } = req.query;

  const where = {};

  if (action) where.action = action;
  if (entity_type) where.entity_type = entity_type;
  if (user_id) where.user_id = user_id;
  if (search) {
    where.description = { [Op.like]: `%${search}%` };
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows: logs } = await AuditLog.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
      },
    ],
    order: [[sort, order.toUpperCase()]],
    limit: parseInt(limit),
    offset,
  });

  ApiResponse.paginated(
    res,
    logs,
    {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
    'Audit logs retrieved successfully'
  );
});

module.exports = { getAuditLogs };
