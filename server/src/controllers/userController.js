const { User } = require('../models');
const { Op } = require('sequelize');
const logAudit = require('../utils/auditLog');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * GET /users
 * List all users (admin only).
 * Supports search, role filter, status filter, pagination.
 */
const getUsers = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    role,
    status, // 'active' | 'inactive'
    sort = 'createdAt',
    order = 'DESC',
  } = req.query;

  const where = {};

  // Search by name or email
  if (search) {
    where[Op.or] = [
      { first_name: { [Op.like]: `%${search}%` } },
      { last_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  // Filter by role
  if (role) {
    where.role = role;
  }

  // Filter by active status
  if (status === 'active') {
    where.is_active = true;
  } else if (status === 'inactive') {
    where.is_active = false;
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows: users } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password', 'reset_password_token', 'reset_password_expires'] },
    order: [[sort, order.toUpperCase()]],
    limit: parseInt(limit),
    offset,
  });

  ApiResponse.paginated(
    res,
    users,
    {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
    'Users retrieved successfully'
  );
});

/**
 * GET /users/stats
 * Get user statistics (admin only).
 */
const getUserStats = catchAsync(async (req, res) => {
  const totalUsers = await User.count();
  const activeUsers = await User.count({ where: { is_active: true } });
  const parents = await User.count({ where: { role: 'parent' } });
  const admins = await User.count({ where: { role: 'admin' } });

  ApiResponse.success(res, {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    parents,
    admins,
  }, 'User stats retrieved successfully');
});

/**
 * PATCH /users/:id/toggle-status
 * Activate or deactivate a user (admin only).
 * Admins cannot deactivate themselves.
 */
const toggleUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deactivating themselves
  if (id === req.user.id) {
    throw ApiError.badRequest('You cannot deactivate your own account.');
  }

  const user = await User.findByPk(id, {
    attributes: { exclude: ['password', 'reset_password_token', 'reset_password_expires'] },
  });

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  user.is_active = !user.is_active;
  await user.save();

  // Audit log
  logAudit({
    userId: req.user.id,
    action: user.is_active ? 'user.activate' : 'user.deactivate',
    entityType: 'user',
    entityId: user.id,
    description: `${user.is_active ? 'Activated' : 'Deactivated'} user ${user.first_name} ${user.last_name} (${user.email})`,
    metadata: { targetUserId: user.id, newStatus: user.is_active },
    ipAddress: req.ip,
  });

  ApiResponse.success(
    res,
    user,
    `User ${user.is_active ? 'activated' : 'deactivated'} successfully`
  );
});

module.exports = {
  getUsers,
  getUserStats,
  toggleUserStatus,
};
