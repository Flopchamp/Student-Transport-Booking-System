const { Op } = require('sequelize');
const { Driver, User, Vehicle, Route, Booking, Student, VehicleLocation } = require('../models');
const { calculateETA } = require('../utils/eta');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/v1/driver-portal/profile
 * Get the driver's own profile (linked via user_id).
 */
const getDriverProfile = catchAsync(async (req, res) => {
  const driver = await Driver.findOne({
    where: { user_id: req.user.id },
    include: [
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'plate_number', 'make', 'model', 'capacity', 'status'] },
      { model: Route, as: 'route', attributes: ['id', 'name', 'start_location', 'end_location', 'distance_km', 'estimated_duration_min'] },
    ],
  });

  if (!driver) {
    throw ApiError.notFound('No driver profile linked to your account.');
  }

  ApiResponse.success(res, { driver }, 'Driver profile retrieved');
});

/**
 * GET /api/v1/driver-portal/dashboard
 * Get driver dashboard — assigned route, vehicle, today's bookings, stats.
 */
const getDriverDashboard = catchAsync(async (req, res) => {
  const driver = await Driver.findOne({
    where: { user_id: req.user.id },
    include: [
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'plate_number', 'make', 'model', 'capacity', 'status'] },
      { model: Route, as: 'route', attributes: ['id', 'name', 'start_location', 'end_location', 'distance_km'] },
    ],
  });

  if (!driver) {
    throw ApiError.notFound('No driver profile linked to your account.');
  }

  // Today's bookings for the driver
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = await Booking.findAll({
    where: {
      driver_id: driver.id,
      status: { [Op.in]: ['confirmed', 'pending'] },
      start_date: { [Op.lte]: today },
      [Op.or]: [
        { end_date: null },
        { end_date: { [Op.gte]: today } },
      ],
    },
    include: [
      { model: Student, as: 'student', attributes: ['id', 'first_name', 'last_name', 'school_name', 'grade', 'pickup_address', 'special_needs'] },
      { model: Route, as: 'route', attributes: ['id', 'name', 'start_location', 'end_location'] },
    ],
    order: [['pickup_time', 'ASC']],
  });

  // Stats
  const [totalBookings, completedTrips, activeBookings] = await Promise.all([
    Booking.count({ where: { driver_id: driver.id } }),
    Booking.count({ where: { driver_id: driver.id, status: 'completed' } }),
    Booking.count({ where: { driver_id: driver.id, status: { [Op.in]: ['confirmed', 'pending'] } } }),
  ]);

  ApiResponse.success(res, {
    driver,
    todayBookings,
    stats: {
      totalBookings,
      completedTrips,
      activeBookings,
      todayCount: todayBookings.length,
    },
  }, 'Dashboard data retrieved');
});

/**
 * GET /api/v1/driver-portal/bookings
 * Get bookings assigned to this driver.
 */
const getDriverBookings = catchAsync(async (req, res) => {
  const { page = 1, limit = 15, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const driver = await Driver.findOne({ where: { user_id: req.user.id } });
  if (!driver) throw ApiError.notFound('No driver profile linked to your account.');

  const where = { driver_id: driver.id };
  if (status) where.status = status;

  const { count, rows } = await Booking.findAndCountAll({
    where,
    include: [
      { model: Student, as: 'student', attributes: ['id', 'first_name', 'last_name', 'school_name', 'grade', 'pickup_address', 'special_needs'] },
      { model: Route, as: 'route', attributes: ['id', 'name', 'start_location', 'end_location'] },
      { model: User, as: 'parent', attributes: ['id', 'first_name', 'last_name', 'phone', 'email'] },
    ],
    limit: parseInt(limit),
    offset,
    order: [['start_date', 'DESC']],
  });

  ApiResponse.paginated(res, { bookings: rows }, {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / parseInt(limit)),
  }, 'Driver bookings retrieved');
});

/**
 * PUT /api/v1/driver-portal/location
 * Update the driver's vehicle GPS location.
 */
const updateMyLocation = catchAsync(async (req, res) => {
  const { latitude, longitude, speed, heading } = req.body;

  const driver = await Driver.findOne({ where: { user_id: req.user.id } });
  if (!driver) throw ApiError.notFound('No driver profile linked to your account.');
  if (!driver.vehicle_id) throw ApiError.badRequest('No vehicle assigned to you.');

  const isMoving = (parseFloat(speed) || 0) > 2;

  const [location] = await VehicleLocation.upsert({
    vehicle_id: driver.vehicle_id,
    latitude,
    longitude,
    speed: speed || 0,
    heading: heading || 0,
    is_moving: isMoving,
    last_updated: new Date(),
  });

  ApiResponse.success(res, { location }, 'Location updated');
});

/**
 * PATCH /api/v1/driver-portal/status
 * Update driver's own status (available, on_trip, off_duty).
 */
const updateMyStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['available', 'on_trip', 'off_duty'];
  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const driver = await Driver.findOne({ where: { user_id: req.user.id } });
  if (!driver) throw ApiError.notFound('No driver profile linked to your account.');

  driver.status = status;
  await driver.save();

  ApiResponse.success(res, { driver }, `Status updated to ${status}`);
});

module.exports = {
  getDriverProfile,
  getDriverDashboard,
  getDriverBookings,
  updateMyLocation,
  updateMyStatus,
};
