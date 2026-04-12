const { Op } = require('sequelize');
const { Route, Booking } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * POST /api/v1/routes
 * Create a new transport route (admin only).
 */
const createRoute = catchAsync(async (req, res) => {
  const {
    name, description, start_location, start_lat, start_lng,
    end_location, end_lat, end_lng, stops,
    distance_km, estimated_duration_min, price,
  } = req.body;

  // Check for duplicate name
  const existing = await Route.findOne({ where: { name } });
  if (existing) {
    throw ApiError.conflict('A route with this name already exists.');
  }

  const route = await Route.create({
    name,
    description: description || null,
    start_location,
    start_lat: start_lat || null,
    start_lng: start_lng || null,
    end_location,
    end_lat: end_lat || null,
    end_lng: end_lng || null,
    stops: stops || [],
    distance_km: distance_km || null,
    estimated_duration_min: estimated_duration_min || null,
    price,
  });

  ApiResponse.created(res, { route }, 'Route created successfully');
});

/**
 * GET /api/v1/routes
 * List all routes. Parents see active only; admins see all.
 */
const getRoutes = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, min_price, max_price } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  // Parents see only active routes
  if (req.user.role === 'parent') {
    where.is_active = true;
  }

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { start_location: { [Op.like]: `%${search}%` } },
      { end_location: { [Op.like]: `%${search}%` } },
    ];
  }

  if (min_price) {
    where.price = { ...(where.price || {}), [Op.gte]: parseFloat(min_price) };
  }
  if (max_price) {
    where.price = { ...(where.price || {}), [Op.lte]: parseFloat(max_price) };
  }

  const { count, rows: routes } = await Route.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['name', 'ASC']],
  });

  ApiResponse.paginated(
    res,
    { routes },
    {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
    'Routes retrieved successfully',
  );
});

/**
 * GET /api/v1/routes/:id
 * Get a single route by ID.
 */
const getRoute = catchAsync(async (req, res) => {
  const route = await Route.findByPk(req.params.id);

  if (!route) {
    throw ApiError.notFound('Route not found.');
  }

  // Parents can only see active routes
  if (req.user.role === 'parent' && !route.is_active) {
    throw ApiError.notFound('Route not found.');
  }

  ApiResponse.success(res, { route }, 'Route retrieved successfully');
});

/**
 * PUT /api/v1/routes/:id
 * Update a route (admin only).
 */
const updateRoute = catchAsync(async (req, res) => {
  const route = await Route.findByPk(req.params.id);

  if (!route) {
    throw ApiError.notFound('Route not found.');
  }

  // Check name uniqueness if name is being changed
  if (req.body.name && req.body.name !== route.name) {
    const existing = await Route.findOne({ where: { name: req.body.name } });
    if (existing) {
      throw ApiError.conflict('A route with this name already exists.');
    }
  }

  const allowedFields = [
    'name', 'description', 'start_location', 'start_lat', 'start_lng',
    'end_location', 'end_lat', 'end_lng', 'stops',
    'distance_km', 'estimated_duration_min', 'price',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      route[field] = req.body[field];
    }
  });

  await route.save();

  ApiResponse.success(res, { route }, 'Route updated successfully');
});

/**
 * DELETE /api/v1/routes/:id
 * Soft-delete a route (admin only).
 */
const deleteRoute = catchAsync(async (req, res) => {
  const route = await Route.findByPk(req.params.id);

  if (!route) {
    throw ApiError.notFound('Route not found.');
  }

  // Check for active bookings
  const activeBookings = await Booking.count({
    where: {
      route_id: route.id,
      status: { [Op.in]: ['pending', 'confirmed'] },
    },
  });

  if (activeBookings > 0) {
    throw ApiError.badRequest(
      `Cannot delete route with ${activeBookings} active booking(s). Cancel them first.`,
    );
  }

  route.is_active = false;
  await route.save();

  ApiResponse.success(res, null, 'Route deactivated successfully');
});

/**
 * PATCH /api/v1/routes/:id/activate
 * Re-activate a route (admin only).
 */
const activateRoute = catchAsync(async (req, res) => {
  const route = await Route.findByPk(req.params.id);

  if (!route) {
    throw ApiError.notFound('Route not found.');
  }

  route.is_active = true;
  await route.save();

  ApiResponse.success(res, { route }, 'Route activated successfully');
});

module.exports = {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  deleteRoute,
  activateRoute,
};
