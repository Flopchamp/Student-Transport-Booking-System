const { Booking, Payment, User, Student, Route, Vehicle, Driver } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /analytics/overview
 * Overall system analytics (admin only).
 */
const getOverview = catchAsync(async (req, res) => {
  const [
    totalUsers,
    totalStudents,
    totalRoutes,
    activeRoutes,
    totalVehicles,
    activeVehicles,
    totalDrivers,
    availableDrivers,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    totalPayments,
    completedPayments,
  ] = await Promise.all([
    User.count(),
    Student.count(),
    Route.count(),
    Route.count({ where: { is_active: true } }),
    Vehicle.count(),
    Vehicle.count({ where: { status: 'active' } }),
    Driver.count(),
    Driver.count({ where: { status: 'available' } }),
    Booking.count(),
    Booking.count({ where: { status: 'pending' } }),
    Booking.count({ where: { status: 'confirmed' } }),
    Booking.count({ where: { status: 'completed' } }),
    Booking.count({ where: { status: 'cancelled' } }),
    Payment.count(),
    Payment.count({ where: { status: 'completed' } }),
  ]);

  // Revenue from completed payments
  const revenueResult = await Payment.sum('amount', {
    where: { status: 'completed' },
  });
  const totalRevenue = revenueResult || 0;

  // Pending revenue
  const pendingRevResult = await Payment.sum('amount', {
    where: { status: 'pending' },
  });
  const pendingRevenue = pendingRevResult || 0;

  ApiResponse.success(res, {
    users: { total: totalUsers },
    students: { total: totalStudents },
    routes: { total: totalRoutes, active: activeRoutes },
    vehicles: { total: totalVehicles, active: activeVehicles },
    drivers: { total: totalDrivers, available: availableDrivers },
    bookings: {
      total: totalBookings,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
    },
    payments: {
      total: totalPayments,
      completed: completedPayments,
    },
    revenue: {
      total: parseFloat(totalRevenue),
      pending: parseFloat(pendingRevenue),
    },
  }, 'Analytics overview retrieved successfully');
});

/**
 * GET /analytics/bookings-by-route
 * Booking counts grouped by route (admin only).
 */
const getBookingsByRoute = catchAsync(async (req, res) => {
  const routes = await Route.findAll({
    attributes: [
      'id',
      'name',
      [fn('COUNT', col('bookings.id')), 'bookingCount'],
    ],
    include: [
      {
        model: Booking,
        as: 'bookings',
        attributes: [],
      },
    ],
    group: ['Route.id'],
    order: [[literal('bookingCount'), 'DESC']],
    subQuery: false,
    limit: 10,
  });

  ApiResponse.success(res, routes, 'Bookings by route retrieved successfully');
});

/**
 * GET /analytics/revenue-by-route
 * Revenue grouped by route from completed payments (admin only).
 */
const getRevenueByRoute = catchAsync(async (req, res) => {
  const routes = await Route.findAll({
    attributes: [
      'id',
      'name',
      [fn('COALESCE', fn('SUM', col('bookings.amount')), 0), 'totalRevenue'],
      [fn('COUNT', col('bookings.id')), 'bookingCount'],
    ],
    include: [
      {
        model: Booking,
        as: 'bookings',
        attributes: [],
        where: {
          status: { [Op.in]: ['confirmed', 'completed'] },
        },
        required: false,
      },
    ],
    group: ['Route.id'],
    order: [[literal('totalRevenue'), 'DESC']],
    subQuery: false,
    limit: 10,
  });

  ApiResponse.success(res, routes, 'Revenue by route retrieved successfully');
});

/**
 * GET /analytics/bookings-by-status
 * Booking status distribution (admin only).
 */
const getBookingsByStatus = catchAsync(async (req, res) => {
  const results = await Booking.findAll({
    attributes: [
      'status',
      [fn('COUNT', col('id')), 'count'],
    ],
    group: ['status'],
    order: [[fn('COUNT', col('id')), 'DESC']],
    raw: true,
  });

  ApiResponse.success(res, results, 'Bookings by status retrieved successfully');
});

/**
 * GET /analytics/monthly-bookings
 * Booking counts for the last 6 months (admin only).
 */
const getMonthlyBookings = catchAsync(async (req, res) => {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const count = await Booking.count({
      where: {
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    const revenue = (await Payment.sum('amount', {
      where: {
        status: 'completed',
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    })) || 0;

    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      bookings: count,
      revenue: parseFloat(revenue),
    });
  }

  ApiResponse.success(res, months, 'Monthly bookings retrieved successfully');
});

/**
 * GET /analytics/recent-registrations
 * New user registrations in the last 30 days (admin only).
 */
const getRecentRegistrations = catchAsync(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newUsers = await User.count({
    where: {
      createdAt: { [Op.gte]: thirtyDaysAgo },
    },
  });

  const newStudents = await Student.count({
    where: {
      createdAt: { [Op.gte]: thirtyDaysAgo },
    },
  });

  const newBookings = await Booking.count({
    where: {
      createdAt: { [Op.gte]: thirtyDaysAgo },
    },
  });

  ApiResponse.success(res, {
    newUsers,
    newStudents,
    newBookings,
    period: '30 days',
  }, 'Recent registrations retrieved successfully');
});

module.exports = {
  getOverview,
  getBookingsByRoute,
  getRevenueByRoute,
  getBookingsByStatus,
  getMonthlyBookings,
  getRecentRegistrations,
};
