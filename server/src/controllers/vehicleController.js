const { Op } = require('sequelize');
const { Vehicle, Driver, Booking } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * POST /api/v1/vehicles
 * Create a new vehicle (admin only).
 */
const createVehicle = catchAsync(async (req, res) => {
  const {
    plate_number, make, model, year, capacity,
    status, insurance_expiry, last_inspection_date,
  } = req.body;

  // Check for duplicate plate number
  const existing = await Vehicle.findOne({ where: { plate_number } });
  if (existing) {
    throw ApiError.conflict('A vehicle with this plate number already exists.');
  }

  const vehicle = await Vehicle.create({
    plate_number,
    make,
    model,
    year,
    capacity,
    status: status || 'active',
    insurance_expiry: insurance_expiry || null,
    last_inspection_date: last_inspection_date || null,
  });

  ApiResponse.created(res, { vehicle }, 'Vehicle created successfully');
});

/**
 * GET /api/v1/vehicles
 * List all vehicles (admin only).
 */
const getVehicles = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where[Op.or] = [
      { plate_number: { [Op.like]: `%${search}%` } },
      { make: { [Op.like]: `%${search}%` } },
      { model: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows: vehicles } = await Vehicle.findAndCountAll({
    where,
    include: [
      {
        association: 'driver',
        attributes: ['id', 'first_name', 'last_name', 'phone', 'status'],
      },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
  });

  ApiResponse.paginated(
    res,
    { vehicles },
    {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
    'Vehicles retrieved successfully',
  );
});

/**
 * GET /api/v1/vehicles/:id
 * Get a single vehicle by ID (admin only).
 */
const getVehicle = catchAsync(async (req, res) => {
  const vehicle = await Vehicle.findByPk(req.params.id, {
    include: [
      {
        association: 'driver',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'license_number', 'status'],
      },
    ],
  });

  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found.');
  }

  ApiResponse.success(res, { vehicle }, 'Vehicle retrieved successfully');
});

/**
 * PUT /api/v1/vehicles/:id
 * Update a vehicle (admin only).
 */
const updateVehicle = catchAsync(async (req, res) => {
  const vehicle = await Vehicle.findByPk(req.params.id);

  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found.');
  }

  // Check plate uniqueness if changing
  if (req.body.plate_number && req.body.plate_number !== vehicle.plate_number) {
    const existing = await Vehicle.findOne({ where: { plate_number: req.body.plate_number } });
    if (existing) {
      throw ApiError.conflict('A vehicle with this plate number already exists.');
    }
  }

  const allowedFields = [
    'plate_number', 'make', 'model', 'year', 'capacity',
    'status', 'insurance_expiry', 'last_inspection_date',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      vehicle[field] = req.body[field];
    }
  });

  await vehicle.save();

  ApiResponse.success(res, { vehicle }, 'Vehicle updated successfully');
});

/**
 * DELETE /api/v1/vehicles/:id
 * Delete a vehicle (admin only). Checks for active bookings & assigned driver.
 */
const deleteVehicle = catchAsync(async (req, res) => {
  const vehicle = await Vehicle.findByPk(req.params.id);

  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found.');
  }

  // Check for assigned driver
  const assignedDriver = await Driver.findOne({ where: { vehicle_id: vehicle.id } });
  if (assignedDriver) {
    throw ApiError.badRequest(
      `Cannot delete vehicle assigned to driver ${assignedDriver.first_name} ${assignedDriver.last_name}. Unassign first.`,
    );
  }

  // Check for active bookings
  const activeBookings = await Booking.count({
    where: {
      vehicle_id: vehicle.id,
      status: { [Op.in]: ['pending', 'confirmed'] },
    },
  });

  if (activeBookings > 0) {
    throw ApiError.badRequest(
      `Cannot delete vehicle with ${activeBookings} active booking(s).`,
    );
  }

  // Soft-delete: deactivate instead of destroying
  vehicle.is_active = false;
  vehicle.status = 'inactive';
  await vehicle.save();

  ApiResponse.success(res, null, 'Vehicle deleted successfully');
});

module.exports = {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
};
