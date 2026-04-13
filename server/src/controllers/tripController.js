const { Op } = require('sequelize');
const { Trip, Driver, Vehicle, Route, Booking, Student, User } = require('../models');
const { TRIP_STATUS } = require('../config/constants');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { createNotification, notifyAdmins } = require('../utils/notification');
const { sendTripStartedSMS } = require('../services/smsService');

// =============================================
// ADMIN ENDPOINTS
// =============================================

/**
 * GET /api/v1/trips
 * List all trips (admin). Supports date filter, status filter, pagination.
 */
const getAllTrips = catchAsync(async (req, res) => {
  const { page = 1, limit = 15, status, date, driver_id, route_id } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (status) where.status = status;
  if (date) where.scheduled_date = date;
  if (driver_id) where.driver_id = driver_id;
  if (route_id) where.route_id = route_id;

  const { count, rows } = await Trip.findAndCountAll({
    where,
    include: [
      {
        model: Driver,
        as: 'driver',
        attributes: ['id', 'first_name', 'last_name', 'phone', 'status'],
      },
      {
        model: Vehicle,
        as: 'vehicle',
        attributes: ['id', 'plate_number', 'make', 'model', 'capacity'],
      },
      {
        model: Route,
        as: 'route',
        attributes: ['id', 'name', 'start_location', 'end_location', 'distance_km'],
      },
    ],
    limit: parseInt(limit),
    offset,
    order: [['scheduled_date', 'DESC'], ['scheduled_time', 'ASC']],
  });

  ApiResponse.paginated(res, { trips: rows }, {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / parseInt(limit)),
  }, 'Trips retrieved');
});

/**
 * GET /api/v1/trips/stats
 * Admin trip statistics.
 */
const getTripStats = catchAsync(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const [total, inProgress, completedToday, scheduledToday, cancelled] = await Promise.all([
    Trip.count(),
    Trip.count({ where: { status: TRIP_STATUS.IN_PROGRESS } }),
    Trip.count({ where: { status: TRIP_STATUS.COMPLETED, scheduled_date: today } }),
    Trip.count({ where: { status: TRIP_STATUS.SCHEDULED, scheduled_date: today } }),
    Trip.count({ where: { status: TRIP_STATUS.CANCELLED } }),
  ]);

  ApiResponse.success(res, {
    stats: { total, inProgress, completedToday, scheduledToday, cancelled },
  }, 'Trip stats retrieved');
});

/**
 * GET /api/v1/trips/:id
 * Get single trip details (admin).
 */
const getTripById = catchAsync(async (req, res) => {
  const trip = await Trip.findByPk(req.params.id, {
    include: [
      {
        model: Driver,
        as: 'driver',
        attributes: ['id', 'first_name', 'last_name', 'phone', 'email', 'license_number'],
      },
      {
        model: Vehicle,
        as: 'vehicle',
        attributes: ['id', 'plate_number', 'make', 'model', 'capacity', 'status'],
      },
      {
        model: Route,
        as: 'route',
        attributes: ['id', 'name', 'start_location', 'end_location', 'distance_km', 'estimated_duration_min'],
      },
    ],
  });

  if (!trip) throw ApiError.notFound('Trip not found');

  // Also get bookings for this trip's route/driver/date
  const bookings = await Booking.findAll({
    where: {
      driver_id: trip.driver_id,
      route_id: trip.route_id,
      status: { [Op.in]: ['confirmed', 'completed'] },
      start_date: { [Op.lte]: trip.scheduled_date },
      [Op.or]: [
        { end_date: null },
        { end_date: { [Op.gte]: trip.scheduled_date } },
      ],
    },
    include: [
      { model: Student, as: 'student', attributes: ['id', 'first_name', 'last_name', 'school_name', 'grade'] },
      { model: User, as: 'parent', attributes: ['id', 'first_name', 'last_name', 'phone'] },
    ],
  });

  ApiResponse.success(res, { trip, bookings }, 'Trip details retrieved');
});

/**
 * POST /api/v1/trips
 * Create a trip (admin can schedule trips ahead of time).
 */
const createTrip = catchAsync(async (req, res) => {
  const { driver_id, vehicle_id, route_id, scheduled_date, scheduled_time, notes } = req.body;

  // Validate driver exists
  const driver = await Driver.findByPk(driver_id);
  if (!driver) throw ApiError.notFound('Driver not found');

  // Validate vehicle exists
  const vehicle = await Vehicle.findByPk(vehicle_id);
  if (!vehicle) throw ApiError.notFound('Vehicle not found');

  // Validate route exists
  const route = await Route.findByPk(route_id);
  if (!route) throw ApiError.notFound('Route not found');

  // Check for duplicate trip on same date/driver
  const existing = await Trip.findOne({
    where: {
      driver_id,
      scheduled_date,
      status: { [Op.in]: [TRIP_STATUS.SCHEDULED, TRIP_STATUS.IN_PROGRESS] },
    },
  });
  if (existing) {
    throw ApiError.badRequest('Driver already has an active/scheduled trip on this date');
  }

  // Count passengers (confirmed bookings for this driver+route on scheduled date)
  const passengerCount = await Booking.count({
    where: {
      driver_id,
      route_id,
      status: 'confirmed',
      start_date: { [Op.lte]: scheduled_date },
      [Op.or]: [
        { end_date: null },
        { end_date: { [Op.gte]: scheduled_date } },
      ],
    },
  });

  const trip = await Trip.create({
    driver_id,
    vehicle_id,
    route_id,
    scheduled_date,
    scheduled_time: scheduled_time || null,
    notes: notes || null,
    passenger_count: passengerCount,
  });

  ApiResponse.created(res, { trip }, 'Trip scheduled successfully');
});

/**
 * PATCH /api/v1/trips/:id/cancel
 * Admin cancel a trip.
 */
const cancelTrip = catchAsync(async (req, res) => {
  const trip = await Trip.findByPk(req.params.id);
  if (!trip) throw ApiError.notFound('Trip not found');

  if (trip.status === TRIP_STATUS.COMPLETED) {
    throw ApiError.badRequest('Cannot cancel a completed trip');
  }

  trip.status = TRIP_STATUS.CANCELLED;
  trip.notes = trip.notes
    ? `${trip.notes}\nCancelled by admin: ${req.body.reason || 'No reason provided'}`
    : `Cancelled by admin: ${req.body.reason || 'No reason provided'}`;
  await trip.save();

  ApiResponse.success(res, { trip }, 'Trip cancelled');
});

// =============================================
// DRIVER PORTAL ENDPOINTS
// =============================================

/**
 * GET /api/v1/driver-portal/trips
 * Get driver's trips.
 */
const getMyTrips = catchAsync(async (req, res) => {
  const { page = 1, limit = 15, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const driver = await Driver.findOne({ where: { user_id: req.user.id } });
  if (!driver) throw ApiError.notFound('No driver profile linked to your account.');

  const where = { driver_id: driver.id };
  if (status) where.status = status;

  const { count, rows } = await Trip.findAndCountAll({
    where,
    include: [
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'plate_number', 'make', 'model'] },
      { model: Route, as: 'route', attributes: ['id', 'name', 'start_location', 'end_location', 'distance_km'] },
    ],
    limit: parseInt(limit),
    offset,
    order: [['scheduled_date', 'DESC'], ['scheduled_time', 'ASC']],
  });

  ApiResponse.paginated(res, { trips: rows }, {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / parseInt(limit)),
  }, 'Driver trips retrieved');
});

/**
 * POST /api/v1/driver-portal/trips/start
 * Driver starts a trip. Creates a new trip if one isn't scheduled, or starts a scheduled one.
 */
const startTrip = catchAsync(async (req, res) => {
  const { latitude, longitude } = req.body;

  const driver = await Driver.findOne({
    where: { user_id: req.user.id },
    include: [
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'plate_number'] },
      { model: Route, as: 'route', attributes: ['id', 'name', 'start_location', 'end_location', 'distance_km'] },
    ],
  });
  if (!driver) throw ApiError.notFound('No driver profile linked to your account.');
  if (!driver.vehicle_id) throw ApiError.badRequest('No vehicle assigned to you.');
  if (!driver.route_id) throw ApiError.badRequest('No route assigned to you.');

  // Check if driver already has an in_progress trip
  const activeTrip = await Trip.findOne({
    where: { driver_id: driver.id, status: TRIP_STATUS.IN_PROGRESS },
  });
  if (activeTrip) throw ApiError.badRequest('You already have a trip in progress. End it first.');

  const today = new Date().toISOString().split('T')[0];

  // Try to find a scheduled trip for today
  let trip = await Trip.findOne({
    where: { driver_id: driver.id, scheduled_date: today, status: TRIP_STATUS.SCHEDULED },
  });

  // Count passengers
  const passengerCount = await Booking.count({
    where: {
      driver_id: driver.id,
      route_id: driver.route_id,
      status: 'confirmed',
      start_date: { [Op.lte]: today },
      [Op.or]: [
        { end_date: null },
        { end_date: { [Op.gte]: today } },
      ],
    },
  });

  if (trip) {
    // Start the scheduled trip
    trip.status = TRIP_STATUS.IN_PROGRESS;
    trip.actual_start_time = new Date();
    trip.start_latitude = latitude || null;
    trip.start_longitude = longitude || null;
    trip.passenger_count = passengerCount;
    await trip.save();
  } else {
    // Create and start a new trip on-the-fly
    trip = await Trip.create({
      driver_id: driver.id,
      vehicle_id: driver.vehicle_id,
      route_id: driver.route_id,
      scheduled_date: today,
      status: TRIP_STATUS.IN_PROGRESS,
      actual_start_time: new Date(),
      start_latitude: latitude || null,
      start_longitude: longitude || null,
      passenger_count: passengerCount,
    });
  }

  // Update driver status to on_trip
  driver.status = 'on_trip';
  await driver.save();

  // Notify parents of confirmed bookings that the trip has started
  const bookings = await Booking.findAll({
    where: {
      driver_id: driver.id,
      route_id: driver.route_id,
      status: 'confirmed',
      start_date: { [Op.lte]: today },
      [Op.or]: [
        { end_date: null },
        { end_date: { [Op.gte]: today } },
      ],
    },
    include: [
      { model: User, as: 'parent', attributes: ['id', 'phone'] },
      { model: Student, as: 'student', attributes: ['first_name'] },
    ],
  });

  for (const booking of bookings) {
    createNotification({
      userId: booking.parent_id,
      title: 'Trip Started',
      message: `The bus for ${booking.student?.first_name || 'your child'} has started on route ${driver.route?.name || 'assigned route'}.`,
      type: 'tracking',
      link: '/tracking',
    }).catch(err => console.error('Notification error:', err));

    if (booking.parent?.phone) {
      sendTripStartedSMS(
        booking.parent.phone,
        booking.student?.first_name || 'your child',
        driver.route?.name || 'assigned route',
        { userId: booking.parent_id }
      ).catch(err => console.error('SMS error:', err));
    }
  }

  const tripWithIncludes = await Trip.findByPk(trip.id, {
    include: [
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'plate_number', 'make', 'model'] },
      { model: Route, as: 'route', attributes: ['id', 'name', 'start_location', 'end_location'] },
    ],
  });

  ApiResponse.success(res, { trip: tripWithIncludes }, 'Trip started successfully');
});

/**
 * PATCH /api/v1/driver-portal/trips/:id/end
 * Driver ends a trip.
 */
const endTrip = catchAsync(async (req, res) => {
  const { latitude, longitude, distance_covered_km, notes } = req.body;

  const driver = await Driver.findOne({ where: { user_id: req.user.id } });
  if (!driver) throw ApiError.notFound('No driver profile linked to your account.');

  const trip = await Trip.findOne({
    where: { id: req.params.id, driver_id: driver.id, status: TRIP_STATUS.IN_PROGRESS },
  });
  if (!trip) throw ApiError.notFound('No in-progress trip found with this ID.');

  trip.status = TRIP_STATUS.COMPLETED;
  trip.actual_end_time = new Date();
  trip.end_latitude = latitude || null;
  trip.end_longitude = longitude || null;
  trip.distance_covered_km = distance_covered_km || null;
  if (notes) trip.notes = trip.notes ? `${trip.notes}\n${notes}` : notes;
  await trip.save();

  // Update driver status back to available
  driver.status = 'available';
  await driver.save();

  // Mark today's confirmed bookings for this driver+route as completed
  const today = new Date().toISOString().split('T')[0];
  await Booking.update(
    { status: 'completed' },
    {
      where: {
        driver_id: driver.id,
        route_id: trip.route_id,
        status: 'confirmed',
        start_date: { [Op.lte]: today },
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: today } },
        ],
        // Only mark one-time bookings as completed (end_date is null or equals start_date)
        // Recurring bookings should remain confirmed
        is_recurring: false,
      },
    }
  );

  const tripWithIncludes = await Trip.findByPk(trip.id, {
    include: [
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'plate_number', 'make', 'model'] },
      { model: Route, as: 'route', attributes: ['id', 'name', 'start_location', 'end_location'] },
    ],
  });

  ApiResponse.success(res, { trip: tripWithIncludes }, 'Trip completed successfully');
});

/**
 * GET /api/v1/driver-portal/trips/active
 * Get the driver's currently active (in_progress) trip.
 */
const getActiveTrip = catchAsync(async (req, res) => {
  const driver = await Driver.findOne({ where: { user_id: req.user.id } });
  if (!driver) throw ApiError.notFound('No driver profile linked to your account.');

  const trip = await Trip.findOne({
    where: { driver_id: driver.id, status: TRIP_STATUS.IN_PROGRESS },
    include: [
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'plate_number', 'make', 'model'] },
      { model: Route, as: 'route', attributes: ['id', 'name', 'start_location', 'end_location', 'distance_km'] },
    ],
  });

  ApiResponse.success(res, { trip: trip || null }, trip ? 'Active trip found' : 'No active trip');
});

module.exports = {
  // Admin
  getAllTrips,
  getTripStats,
  getTripById,
  createTrip,
  cancelTrip,
  // Driver portal
  getMyTrips,
  startTrip,
  endTrip,
  getActiveTrip,
};
