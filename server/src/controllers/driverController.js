const { Op } = require('sequelize');
const { Driver, Vehicle, Booking } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * POST /api/v1/drivers
 * Create a new driver (admin only).
 */
const createDriver = catchAsync(async (req, res) => {
  const {
    first_name, last_name, email, phone,
    license_number, license_expiry,
    vehicle_id, status, profile_photo,
  } = req.body;

  // Check duplicate email
  const existingEmail = await Driver.findOne({ where: { email } });
  if (existingEmail) {
    throw ApiError.conflict('A driver with this email already exists.');
  }

  // Check duplicate license
  const existingLicense = await Driver.findOne({ where: { license_number } });
  if (existingLicense) {
    throw ApiError.conflict('A driver with this license number already exists.');
  }

  // If vehicle_id provided, check it exists and isn't assigned
  if (vehicle_id) {
    const vehicle = await Vehicle.findByPk(vehicle_id);
    if (!vehicle) {
      throw ApiError.notFound('Vehicle not found.');
    }
    const assignedDriver = await Driver.findOne({ where: { vehicle_id } });
    if (assignedDriver) {
      throw ApiError.conflict('This vehicle is already assigned to another driver.');
    }
  }

  const driver = await Driver.create({
    first_name,
    last_name,
    email,
    phone,
    license_number,
    license_expiry,
    vehicle_id: vehicle_id || null,
    status: status || 'available',
    profile_photo: profile_photo || null,
  });

  ApiResponse.created(res, { driver }, 'Driver created successfully');
});

/**
 * GET /api/v1/drivers
 * List all drivers (admin only).
 */
const getDrivers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where[Op.or] = [
      { first_name: { [Op.like]: `%${search}%` } },
      { last_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { license_number: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows: drivers } = await Driver.findAndCountAll({
    where,
    include: [
      {
        association: 'vehicle',
        attributes: ['id', 'plate_number', 'make', 'model', 'capacity', 'status'],
      },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
  });

  ApiResponse.paginated(
    res,
    { drivers },
    {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
    'Drivers retrieved successfully',
  );
});

/**
 * GET /api/v1/drivers/:id
 * Get a single driver by ID (admin only).
 */
const getDriver = catchAsync(async (req, res) => {
  const driver = await Driver.findByPk(req.params.id, {
    include: [
      {
        association: 'vehicle',
        attributes: ['id', 'plate_number', 'make', 'model', 'year', 'capacity', 'status'],
      },
    ],
  });

  if (!driver) {
    throw ApiError.notFound('Driver not found.');
  }

  ApiResponse.success(res, { driver }, 'Driver retrieved successfully');
});

/**
 * PUT /api/v1/drivers/:id
 * Update a driver (admin only).
 */
const updateDriver = catchAsync(async (req, res) => {
  const driver = await Driver.findByPk(req.params.id);

  if (!driver) {
    throw ApiError.notFound('Driver not found.');
  }

  // Check email uniqueness if changing
  if (req.body.email && req.body.email !== driver.email) {
    const existing = await Driver.findOne({ where: { email: req.body.email } });
    if (existing) {
      throw ApiError.conflict('A driver with this email already exists.');
    }
  }

  // Check license uniqueness if changing
  if (req.body.license_number && req.body.license_number !== driver.license_number) {
    const existing = await Driver.findOne({ where: { license_number: req.body.license_number } });
    if (existing) {
      throw ApiError.conflict('A driver with this license number already exists.');
    }
  }

  // Check vehicle availability if assigning a new vehicle
  if (req.body.vehicle_id && req.body.vehicle_id !== driver.vehicle_id) {
    const vehicle = await Vehicle.findByPk(req.body.vehicle_id);
    if (!vehicle) {
      throw ApiError.notFound('Vehicle not found.');
    }
    const assignedDriver = await Driver.findOne({
      where: { vehicle_id: req.body.vehicle_id, id: { [Op.ne]: driver.id } },
    });
    if (assignedDriver) {
      throw ApiError.conflict('This vehicle is already assigned to another driver.');
    }
  }

  const allowedFields = [
    'first_name', 'last_name', 'email', 'phone',
    'license_number', 'license_expiry',
    'vehicle_id', 'status', 'profile_photo',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      driver[field] = req.body[field];
    }
  });

  await driver.save();

  // Re-fetch with vehicle association
  const updated = await Driver.findByPk(driver.id, {
    include: [{ association: 'vehicle', attributes: ['id', 'plate_number', 'make', 'model'] }],
  });

  ApiResponse.success(res, { driver: updated }, 'Driver updated successfully');
});

/**
 * DELETE /api/v1/drivers/:id
 * Delete a driver (admin only). Checks for active bookings.
 */
const deleteDriver = catchAsync(async (req, res) => {
  const driver = await Driver.findByPk(req.params.id);

  if (!driver) {
    throw ApiError.notFound('Driver not found.');
  }

  // Check for active bookings
  const activeBookings = await Booking.count({
    where: {
      driver_id: driver.id,
      status: { [Op.in]: ['pending', 'confirmed'] },
    },
  });

  if (activeBookings > 0) {
    throw ApiError.badRequest(
      `Cannot delete driver with ${activeBookings} active booking(s).`,
    );
  }

  // Soft-delete: deactivate instead of destroying
  driver.is_active = false;
  driver.status = 'off_duty';
  await driver.save();

  ApiResponse.success(res, null, 'Driver deleted successfully');
});

/**
 * PATCH /api/v1/drivers/:id/assign-vehicle
 * Assign or unassign a vehicle to a driver (admin only).
 */
const assignVehicle = catchAsync(async (req, res) => {
  const driver = await Driver.findByPk(req.params.id);

  if (!driver) {
    throw ApiError.notFound('Driver not found.');
  }

  const { vehicle_id } = req.body;

  // Unassign — set to null
  if (vehicle_id === null) {
    driver.vehicle_id = null;
    await driver.save();
    return ApiResponse.success(res, { driver }, 'Vehicle unassigned from driver');
  }

  // Validate vehicle exists
  const vehicle = await Vehicle.findByPk(vehicle_id);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found.');
  }

  // Check if vehicle is already assigned to another driver
  const assignedDriver = await Driver.findOne({
    where: { vehicle_id, id: { [Op.ne]: driver.id } },
  });
  if (assignedDriver) {
    throw ApiError.conflict(
      `Vehicle already assigned to ${assignedDriver.first_name} ${assignedDriver.last_name}.`,
    );
  }

  driver.vehicle_id = vehicle_id;
  await driver.save();

  const updated = await Driver.findByPk(driver.id, {
    include: [{ association: 'vehicle', attributes: ['id', 'plate_number', 'make', 'model'] }],
  });

  ApiResponse.success(res, { driver: updated }, 'Vehicle assigned to driver successfully');
});

module.exports = {
  createDriver,
  getDrivers,
  getDriver,
  updateDriver,
  deleteDriver,
  assignVehicle,
};
