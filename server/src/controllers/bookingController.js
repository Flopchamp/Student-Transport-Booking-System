const { Op, Transaction } = require('sequelize');
const { sequelize, Booking, Student, Route, Vehicle, Driver, Payment } = require('../models');
const { sendBookingConfirmationEmail, sendBookingStatusEmail, sendBookingCancellationEmail } = require('../services/emailService');
const { sendBookingConfirmedSMS, sendBookingCancelledSMS } = require('../services/smsService');
const logAudit = require('../utils/auditLog');
const { createNotification, notifyAdmins } = require('../utils/notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * Promote the next waitlisted booking on a route to pending status.
 * Called when a slot opens up (cancellation or capacity increase).
 */
const promoteFromWaitlist = async (routeId) => {
  try {
    const nextWaitlisted = await Booking.findOne({
      where: { route_id: routeId, status: 'waitlisted' },
      order: [['createdAt', 'ASC']],
      include: [
        { association: 'parent', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { association: 'student', attributes: ['id', 'first_name', 'last_name'] },
        { association: 'route', attributes: ['id', 'name'] },
      ],
    });

    if (nextWaitlisted) {
      nextWaitlisted.status = 'pending';
      await nextWaitlisted.save();

      // Notify parent their waitlisted booking has been promoted
      if (nextWaitlisted.parent?.email) {
        sendBookingStatusEmail(nextWaitlisted.parent.email, {
          parentName: `${nextWaitlisted.parent.first_name} ${nextWaitlisted.parent.last_name}`,
          bookingRef: nextWaitlisted.booking_reference,
          studentName: nextWaitlisted.student ? `${nextWaitlisted.student.first_name} ${nextWaitlisted.student.last_name}` : '—',
          routeName: nextWaitlisted.route ? nextWaitlisted.route.name : '—',
          newStatus: 'pending',
        }).catch((err) => console.error('[Email] Waitlist promotion email failed:', err.message));
      }

      console.log(`[Waitlist] Promoted booking ${nextWaitlisted.booking_reference} from waitlist to pending`);
    }
  } catch (err) {
    console.error('[Waitlist] Promotion failed:', err.message);
  }
};

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

  // 3–5. Duplicate check + capacity check + booking insert are a single atomic unit.
  // SERIALIZABLE prevents two concurrent requests from both reading "capacity available"
  // and both writing a `pending` booking, which would silently exceed vehicle capacity.
  const { booking, isAtCapacity } = await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async (t) => {
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
        transaction: t,
      });
      if (existingBooking) {
        throw ApiError.conflict(
          `Student already has an active booking (${existingBooking.booking_reference}) on this route for overlapping dates.`,
        );
      }

      // 4. Check route capacity — auto-waitlist if at capacity
      const activeBookingsOnRoute = await Booking.count({
        where: {
          route_id,
          status: { [Op.in]: ['pending', 'confirmed'] },
        },
        transaction: t,
      });

      const vehiclesOnRoute = await Vehicle.findAll({
        include: [{
          model: Driver,
          as: 'driver',
          where: { route_id },
          attributes: [],
        }],
        attributes: ['capacity'],
        transaction: t,
      });
      const totalCapacity = vehiclesOnRoute.reduce((sum, v) => sum + v.capacity, 0);
      const capacityFull = totalCapacity > 0 && activeBookingsOnRoute >= totalCapacity;

      // 5. Create booking — price from route, auto-waitlist if at capacity
      const newBooking = await Booking.create({
        parent_id: req.user.id,
        student_id,
        route_id,
        pickup_time,
        dropoff_time: dropoff_time || null,
        start_date,
        end_date: end_date || null,
        amount: route.price,
        notes: notes || null,
        status: capacityFull ? 'waitlisted' : 'pending',
      }, { transaction: t });

      return { booking: newBooking, isAtCapacity: capacityFull };
    },
  );

  // 6. Re-fetch with associations (lock released — no need to hold it for the JOIN)
  const fullBooking = await Booking.findByPk(booking.id, { include: bookingIncludes });

  // 7. Send booking confirmation email (fire-and-forget)
  sendBookingConfirmationEmail(req.user.email, {
    parentName: `${req.user.first_name} ${req.user.last_name}`,
    bookingRef: fullBooking.booking_reference,
    studentName: fullBooking.student ? `${fullBooking.student.first_name} ${fullBooking.student.last_name}` : '—',
    routeName: fullBooking.route ? fullBooking.route.name : '—',
    startDate: fullBooking.start_date,
    pickupTime: fullBooking.pickup_time,
    amount: fullBooking.amount,
  }).catch((err) => console.error('[Email] Booking confirmation failed:', err.message));

  // In-app notification to parent
  createNotification({
    userId: req.user.id,
    title: isAtCapacity ? 'Added to Waitlist' : 'Booking Created',
    message: isAtCapacity
      ? `Your booking ${fullBooking.booking_reference} has been waitlisted. You'll be notified when a slot opens.`
      : `Booking ${fullBooking.booking_reference} created successfully for ${fullBooking.student?.first_name || 'your student'}.`,
    type: 'booking',
    link: '/my-bookings',
  });

  // Notify admins of new booking
  notifyAdmins({
    title: 'New Booking',
    message: `New booking ${fullBooking.booking_reference} by ${req.user.first_name} ${req.user.last_name}${isAtCapacity ? ' (waitlisted)' : ''}.`,
    type: 'booking',
    link: '/admin/bookings',
  });

  const message = isAtCapacity
    ? 'Route is at capacity. You have been added to the waitlist.'
    : 'Booking created successfully';
  ApiResponse.created(res, { booking: fullBooking }, message);
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

  // In-app notification to parent
  createNotification({
    userId: req.user.id,
    title: 'Booking Cancelled',
    message: `Booking ${updated.booking_reference} has been cancelled.`,
    type: 'booking',
    link: '/my-bookings',
  });

  // Promote next waitlisted booking on this route
  promoteFromWaitlist(booking.route_id);

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
    waitlisted: ['pending', 'cancelled'],
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

    // SMS notification for booking confirmed
    if (status === 'confirmed' && updated.parent.phone) {
      sendBookingConfirmedSMS(updated.parent.phone, {
        bookingRef: updated.booking_reference,
        studentName: updated.student ? `${updated.student.first_name} ${updated.student.last_name}` : '—',
        routeName: updated.route ? updated.route.name : '—',
        pickupTime: updated.pickup_time || 'See app',
      });
    }

    // SMS for booking cancelled by admin
    if (status === 'cancelled' && updated.parent.phone) {
      sendBookingCancelledSMS(updated.parent.phone, {
        bookingRef: updated.booking_reference,
        studentName: updated.student ? `${updated.student.first_name} ${updated.student.last_name}` : '—',
      });
    }
  }

  // In-app notification to parent
  if (updated.parent_id) {
    createNotification({
      userId: updated.parent_id,
      title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your booking ${updated.booking_reference} has been ${status} by admin.`,
      type: 'booking',
      link: '/my-bookings',
    });
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

/**
 * POST /api/v1/bookings/recurring
 * Create recurring bookings (parent).
 * Generates multiple bookings based on recurrence pattern.
 */
const createRecurringBooking = catchAsync(async (req, res) => {
  const { student_id, route_id, pickup_time, dropoff_time, start_date, recurrence_pattern, recurrence_end_date, notes } = req.body;

  // Validate inputs
  if (!recurrence_pattern || !['daily', 'weekly', 'monthly'].includes(recurrence_pattern)) {
    throw ApiError.badRequest('Invalid recurrence pattern. Must be daily, weekly, or monthly.');
  }
  if (!recurrence_end_date) {
    throw ApiError.badRequest('Recurrence end date is required.');
  }

  // Verify student
  const student = await Student.findOne({
    where: { id: student_id, parent_id: req.user.id, is_active: true },
  });
  if (!student) throw ApiError.notFound('Student not found or does not belong to you.');

  // Verify route
  const route = await Route.findOne({ where: { id: route_id, is_active: true } });
  if (!route) throw ApiError.notFound('Route not found or is inactive.');

  // Generate dates
  const dates = [];
  let current = new Date(start_date);
  const end = new Date(recurrence_end_date);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    if (recurrence_pattern === 'daily') {
      current.setDate(current.getDate() + 1);
    } else if (recurrence_pattern === 'weekly') {
      current.setDate(current.getDate() + 7);
    } else if (recurrence_pattern === 'monthly') {
      current.setMonth(current.getMonth() + 1);
    }
  }

  if (dates.length === 0) {
    throw ApiError.badRequest('No booking dates could be generated from the given range.');
  }
  if (dates.length > 90) {
    throw ApiError.badRequest('Maximum 90 recurring bookings allowed at once.');
  }

  // SERIALIZABLE: prevent concurrent recurring requests from racing on the same route/dates.
  // All capacity reads and inserts are atomic — no other transaction can interleave.
  const { parentBooking, childBookings, waitlistedCount } = await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async (t) => {
      // Fetch vehicle capacity once — same for all dates on this route
      const vehiclesOnRoute = await Vehicle.findAll({
        include: [{
          model: Driver,
          as: 'driver',
          where: { route_id },
          attributes: [],
        }],
        attributes: ['capacity'],
        transaction: t,
      });
      const totalCapacity = vehiclesOnRoute.reduce((sum, v) => sum + v.capacity, 0);

      // Per-date: duplicate check + capacity count. No inserts yet — all reads see a
      // consistent snapshot, so checking date N doesn't see bookings created for date N-1.
      const dateStatuses = [];
      for (const date of dates) {
        const duplicate = await Booking.findOne({
          where: {
            student_id,
            route_id,
            status: { [Op.in]: ['pending', 'confirmed'] },
            start_date: { [Op.lte]: date },
            [Op.or]: [{ end_date: null }, { end_date: { [Op.gte]: date } }],
          },
          attributes: ['booking_reference'],
          transaction: t,
        });
        if (duplicate) {
          throw ApiError.conflict(
            `Student already has an active booking on this route for ${date} (ref: ${duplicate.booking_reference}).`,
          );
        }

        const activeOnDate = await Booking.count({
          where: {
            route_id,
            status: { [Op.in]: ['pending', 'confirmed'] },
            start_date: { [Op.lte]: date },
            [Op.or]: [{ end_date: null }, { end_date: { [Op.gte]: date } }],
          },
          transaction: t,
        });
        dateStatuses.push(totalCapacity > 0 && activeOnDate >= totalCapacity ? 'waitlisted' : 'pending');
      }

      // Create parent booking covering the full date range
      const newParent = await Booking.create({
        parent_id: req.user.id,
        student_id,
        route_id,
        pickup_time,
        dropoff_time: dropoff_time || null,
        start_date: dates[0],
        end_date: dates[dates.length - 1],
        amount: route.price,
        notes: notes || null,
        is_recurring: true,
        recurrence_pattern,
        recurrence_end_date,
        status: dateStatuses[0],
      }, { transaction: t });

      // bulkCreate all child bookings in a single INSERT statement
      let newChildren = [];
      if (dates.length > 1) {
        newChildren = await Booking.bulkCreate(
          dates.slice(1).map((date, i) => ({
            parent_id: req.user.id,
            student_id,
            route_id,
            pickup_time,
            dropoff_time: dropoff_time || null,
            start_date: date,
            end_date: date,
            amount: route.price,
            notes: notes || null,
            is_recurring: true,
            recurrence_pattern,
            parent_booking_id: newParent.id,
            status: dateStatuses[i + 1],
          })),
          { transaction: t },
        );
      }

      const waitlisted = dateStatuses.filter(s => s === 'waitlisted').length;
      return { parentBooking: newParent, childBookings: newChildren, waitlistedCount: waitlisted };
    },
  );

  const totalBookings = 1 + childBookings.length;
  const totalAmount = Number(route.price) * totalBookings;

  // Send confirmation email (fire-and-forget)
  sendBookingConfirmationEmail(req.user.email, {
    parentName: `${req.user.first_name} ${req.user.last_name}`,
    studentName: `${student.first_name} ${student.last_name}`,
    routeName: route.name,
    startDate: dates[0],
    bookingRef: parentBooking.booking_reference,
    amount: totalAmount,
  }).catch(err => console.error('[Email] Recurring booking email failed:', err.message));

  const message = waitlistedCount > 0
    ? `${totalBookings} recurring bookings created (${waitlistedCount} waitlisted due to capacity)`
    : `${totalBookings} recurring bookings created successfully`;

  ApiResponse.created(res, {
    parent_booking: parentBooking,
    total_bookings: totalBookings,
    total_amount: totalAmount,
    waitlisted_count: waitlistedCount,
    dates,
  }, message);
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
  createRecurringBooking,
};
