const { Op } = require('sequelize');
const { Booking, Student, Route, Vehicle, Driver, Payment } = require('../models');
const { sendBookingConfirmationEmail, sendBookingStatusEmail, sendBookingCancellationEmail } = require('../services/emailService');
const logAudit = require('../utils/auditLog');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// Common include set for booking queries
const bookingIncludes = [
  { association: 'student', attributes: ['id', 'first_name', 'last_name', 'school_name', 'grade'] },
  { association: 'route', attributes: ['id', 'name', 'start_location', 'end_location', 'price'] },
  { association: 'parent', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] },
  { association: 'vehicle', attributes: ['id', 'plate_number', 'make', 'model', 'capacity'] },
  { association: 'driver', attributes: ['id', 'first_name', 'last_name', 'phone'] },
];

// =============================================
// PARENT ENDPOINTS
// =============================================

/**
 * POST /api/v1/bookings
 * Create a new booking (parent).
 * Auto-sets parent_id, pulls price from route.
 */
const createBooking = catchAsync(async (req, res) => {
  const { student_id, route_id, pickup_time, dropoff_time, start_date, end_date, notes } = req.body;

  // 1. Verify the student belongs to this parent
  const student = await Student.findOne({
    where: { id: student_id, parent_id: req.user.id, is_active: true },
  });
  if (!student) {
    throw ApiError.notFound('Student not found or does not belong to you.');
  }

  // 2. Verify the route exists and is active
  const route = await Route.findOne({
    where: { id: route_id, is_active: true },
  });
  if (!route) {
    throw ApiError.notFound('Route not found or is inactive.');
  }

  // 3. Check for duplicate active booking (same student + route + overlapping dates)
  const existingBooking = await Booking.findOne({
    where: {
      student_id,
      route_id,
      status: { [Op.in]: ['pending', 'confirmed'] },
      start_date: { [Op.lte]: end_date || start_date },
      [Op.or]: [
        { end_date: null },
        { end_date: { [Op.gte]: start_date } },
      ],
    },
  });
  if (existingBooking) {
    throw ApiError.conflict(
      `Student already has an active booking (${existingBooking.booking_reference}) on this route for overlapping dates.`,
    );
  }

  // 4. Create booking — price from route
  const booking = await Booking.create({
    parent_id: req.user.id,
    student_id,
    route_id,
    pickup_time,
    dropoff_time: dropoff_time || null,
    start_date,
    end_date: end_date || null,
    amount: route.price,
    notes: notes || null,
  });

  // 5. Re-fetch with associations
  const fullBooking = await Booking.findByPk(booking.id, { include: bookingIncludes });

  // 6. Send booking confirmation email (fire-and-forget)
  sendBookingConfirmationEmail(req.user.email, {
    parentName: `${req.user.first_name} ${req.user.last_name}`,
    bookingRef: fullBooking.booking_reference,
    studentName: fullBooking.student ? `${fullBooking.student.first_name} ${fullBooking.student.last_name}` : '—',
    routeName: fullBooking.route ? fullBooking.route.name : '—',
    startDate: fullBooking.start_date,
    pickupTime: fullBooking.pickup_time,
    amount: fullBooking.amount,
  }).catch((err) => console.error('[Email] Booking confirmation failed:', err.message));

  ApiResponse.created(res, { booking: fullBooking }, 'Booking created successfully');
});

/**
 * GET /api/v1/bookings
 * List bookings — parents see own, admins see all.
 */
const getBookings = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, student_id, route_id, start_date, end_date } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  // Parents see only their own bookings
  if (req.user.role === 'parent') {
    where.parent_id = req.user.id;
  }

  if (status) where.status = status;
  if (student_id) where.student_id = student_id;
  if (route_id) where.route_id = route_id;

  // Date range filter
  if (start_date) {
    where.start_date = { ...(where.start_date || {}), [Op.gte]: start_date };
  }
  if (end_date) {
    where.start_date = { ...(where.start_date || {}), [Op.lte]: end_date };
  }

  const { count, rows: bookings } = await Booking.findAndCountAll({
    where,
    include: bookingIncludes,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
  });

  ApiResponse.paginated(
    res,
    { bookings },
    {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
    'Bookings retrieved successfully',
  );
});

/**
 * GET /api/v1/bookings/:id
 * Get a single booking.
 */
const getBooking = catchAsync(async (req, res) => {
  const where = { id: req.params.id };

  // Parents can only see their own
  if (req.user.role === 'parent') {
    where.parent_id = req.user.id;
  }

  const booking = await Booking.findOne({
    where,
    include: [
      ...bookingIncludes,
      { association: 'payments' },
    ],
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found.');
  }

  ApiResponse.success(res, { booking }, 'Booking retrieved successfully');
});

/**
 * PATCH /api/v1/bookings/:id/cancel
 * Cancel a booking (parent — own bookings only).
 */
const cancelBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findOne({
    where: { id: req.params.id, parent_id: req.user.id },
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found.');
  }

  if (booking.status === 'cancelled') {
    throw ApiError.badRequest('Booking is already cancelled.');
  }

  if (booking.status === 'completed') {
    throw ApiError.badRequest('Cannot cancel a completed booking.');
  }

  booking.status = 'cancelled';
  await booking.save();

  const updated = await Booking.findByPk(booking.id, { include: bookingIncludes });

  // Send cancellation email (fire-and-forget)
  sendBookingCancellationEmail(req.user.email, {
    parentName: `${req.user.first_name} ${req.user.last_name}`,
    bookingRef: updated.booking_reference,
    studentName: updated.student ? `${updated.student.first_name} ${updated.student.last_name}` : '—',
    routeName: updated.route ? updated.route.name : '—',
  }).catch((err) => console.error('[Email] Cancellation email failed:', err.message));

  ApiResponse.success(res, { booking: updated }, 'Booking cancelled successfully');
});

/**
 * PUT /api/v1/bookings/:id
 * Update a pending booking (parent — own bookings only).
 * Allows changing: start_date, end_date, pickup_time, dropoff_time, notes.
 */
const updateBooking = catchAsync(async (req, res) => {
  const { start_date, end_date, pickup_time, dropoff_time, notes } = req.body;

  const booking = await Booking.findOne({
    where: { id: req.params.id, parent_id: req.user.id },
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found.');
  }

  if (booking.status !== 'pending') {
    throw ApiError.badRequest('Only pending bookings can be modified.');
  }

  // Update allowed fields
  if (start_date !== undefined) booking.start_date = start_date;
  if (end_date !== undefined) booking.end_date = end_date || null;
  if (pickup_time !== undefined) booking.pickup_time = pickup_time;
  if (dropoff_time !== undefined) booking.dropoff_time = dropoff_time || null;
  if (notes !== undefined) booking.notes = notes || null;

  await booking.save();

  const updated = await Booking.findByPk(booking.id, { include: bookingIncludes });

  ApiResponse.success(res, { booking: updated }, 'Booking updated successfully');
});

// =============================================
// ADMIN ENDPOINTS
// =============================================

/**
 * PATCH /api/v1/bookings/:id/status
 * Update booking status + optionally assign vehicle/driver (admin).
 */
const updateBookingStatus = catchAsync(async (req, res) => {
  const { status, vehicle_id, driver_id } = req.body;

  const booking = await Booking.findByPk(req.params.id);

  if (!booking) {
    throw ApiError.notFound('Booking not found.');
  }

  // Validate status transitions
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    cancelled: [],      // terminal state
    completed: [],      // terminal state
  };

  if (!validTransitions[booking.status]?.includes(status)) {
    throw ApiError.badRequest(
      `Cannot change status from "${booking.status}" to "${status}".`,
    );
  }

  // If confirming, optionally assign vehicle and driver
  if (status === 'confirmed') {
    if (vehicle_id) {
      const vehicle = await Vehicle.findByPk(vehicle_id);
      if (!vehicle) throw ApiError.notFound('Vehicle not found.');
      if (vehicle.status !== 'active') throw ApiError.badRequest('Vehicle is not active.');

      // ── Capacity check ──
      const activeBookingsOnVehicle = await Booking.count({
        where: {
          vehicle_id,
          status: { [Op.in]: ['confirmed'] },
          id: { [Op.ne]: booking.id },
        },
      });
      if (activeBookingsOnVehicle >= vehicle.capacity) {
        throw ApiError.badRequest(
          `Vehicle ${vehicle.plate_number} is full (${vehicle.capacity} seats, ${activeBookingsOnVehicle} booked). Choose another vehicle or increase capacity.`,
        );
      }

      booking.vehicle_id = vehicle_id;
    }

    if (driver_id) {
      const driver = await Driver.findByPk(driver_id);
      if (!driver) throw ApiError.notFound('Driver not found.');
      if (driver.status === 'off_duty') throw ApiError.badRequest('Driver is off duty.');
      booking.driver_id = driver_id;
    }
  }

  const oldStatus = booking.status;
  booking.status = status;
  await booking.save();

  const updated = await Booking.findByPk(booking.id, { include: bookingIncludes });

  // Send status change email to parent (fire-and-forget)
  if (updated.parent) {
    sendBookingStatusEmail(updated.parent.email, {
      parentName: `${updated.parent.first_name} ${updated.parent.last_name}`,
      bookingRef: updated.booking_reference,
      studentName: updated.student ? `${updated.student.first_name} ${updated.student.last_name}` : '—',
      oldStatus,
      newStatus: status,
    }).catch((err) => console.error('[Email] Status change email failed:', err.message));
  }

  // Audit log
  logAudit({
    userId: req.user.id,
    action: 'booking.status_change',
    entityType: 'booking',
    entityId: updated.id,
    description: `Changed booking ${updated.booking_reference} from ${oldStatus} to ${status}`,
    metadata: { oldStatus, newStatus: status, vehicle_id, driver_id },
    ipAddress: req.ip,
  });

  ApiResponse.success(res, { booking: updated }, `Booking ${status} successfully`);
});

/**
 * PUT /api/v1/bookings/:id/assign
 * Assign vehicle and/or driver to a booking (admin).
 */
const assignBooking = catchAsync(async (req, res) => {
  const { vehicle_id, driver_id } = req.body;

  const booking = await Booking.findByPk(req.params.id);

  if (!booking) {
    throw ApiError.notFound('Booking not found.');
  }

  if (booking.status === 'cancelled' || booking.status === 'completed') {
    throw ApiError.badRequest(`Cannot assign resources to a ${booking.status} booking.`);
  }

  if (vehicle_id !== undefined) {
    if (vehicle_id === null) {
      booking.vehicle_id = null;
    } else {
      const vehicle = await Vehicle.findByPk(vehicle_id);
      if (!vehicle) throw ApiError.notFound('Vehicle not found.');
      if (vehicle.status !== 'active') throw ApiError.badRequest('Vehicle is not active.');

      // ── Capacity check ──
      const activeBookingsOnVehicle = await Booking.count({
        where: {
          vehicle_id,
          status: { [Op.in]: ['pending', 'confirmed'] },
          id: { [Op.ne]: booking.id },
        },
      });
      if (activeBookingsOnVehicle >= vehicle.capacity) {
        throw ApiError.badRequest(
          `Vehicle ${vehicle.plate_number} is full (${vehicle.capacity} seats, ${activeBookingsOnVehicle} booked). Choose another vehicle or increase capacity.`,
        );
      }

      booking.vehicle_id = vehicle_id;
    }
  }

  if (driver_id !== undefined) {
    if (driver_id === null) {
      booking.driver_id = null;
    } else {
      const driver = await Driver.findByPk(driver_id);
      if (!driver) throw ApiError.notFound('Driver not found.');
      if (driver.status === 'off_duty') throw ApiError.badRequest('Driver is off duty.');
      booking.driver_id = driver_id;
    }
  }

  await booking.save();

  const updated = await Booking.findByPk(booking.id, { include: bookingIncludes });

  ApiResponse.success(res, { booking: updated }, 'Booking assignment updated successfully');
});

/**
 * GET /api/v1/bookings/stats
 * Get booking statistics (admin).
 */
const getBookingStats = catchAsync(async (req, res) => {
  const [total, pending, confirmed, completed, cancelled] = await Promise.all([
    Booking.count(),
    Booking.count({ where: { status: 'pending' } }),
    Booking.count({ where: { status: 'confirmed' } }),
    Booking.count({ where: { status: 'completed' } }),
    Booking.count({ where: { status: 'cancelled' } }),
  ]);

  const totalRevenue = await Booking.sum('amount', {
    where: { status: { [Op.in]: ['confirmed', 'completed'] } },
  });

  ApiResponse.success(res, {
    stats: {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      totalRevenue: totalRevenue || 0,
    },
  }, 'Booking statistics retrieved successfully');
});

/**
 * GET /api/v1/bookings/route/:routeId/availability
 * Returns vehicle capacity vs active bookings for a route.
 * Helps parents see remaining seats before booking.
 */
const getRouteAvailability = catchAsync(async (req, res) => {
  const { routeId } = req.params;

  // Find all vehicles assigned to confirmed bookings on this route
  const activeBookings = await Booking.count({
    where: {
      route_id: routeId,
      status: { [Op.in]: ['pending', 'confirmed'] },
    },
  });

  // Sum capacity of all active vehicles on this route
  // (vehicles linked through drivers assigned to this route)
  const vehiclesOnRoute = await Vehicle.findAll({
    include: [{
      association: 'driver',
      where: { route_id: routeId },
      attributes: [],
    }],
    where: { status: 'active', is_active: true },
    attributes: ['id', 'plate_number', 'capacity'],
  });

  const totalCapacity = vehiclesOnRoute.reduce((sum, v) => sum + v.capacity, 0);
  const availableSeats = Math.max(0, totalCapacity - activeBookings);

  ApiResponse.success(res, {
    route_id: routeId,
    total_capacity: totalCapacity,
    active_bookings: activeBookings,
    available_seats: availableSeats,
    vehicles: vehiclesOnRoute.length,
  }, 'Route availability retrieved successfully');
});

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  updateBooking,
  updateBookingStatus,
  assignBooking,
  getBookingStats,
  getRouteAvailability,
};
