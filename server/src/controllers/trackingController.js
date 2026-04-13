const { VehicleLocation, Vehicle, Driver, Route, Booking, Student } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * PUT /api/v1/tracking/:vehicleId
 * Update (or create) the GPS location for a vehicle.
 * Typically called by a driver app or GPS device.
 */
const updateLocation = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;
  const { latitude, longitude, speed, heading } = req.body;

  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found.');
  }

  const isMoving = (parseFloat(speed) || 0) > 2; // Consider moving if speed > 2 km/h

  const [location] = await VehicleLocation.upsert({
    vehicle_id: vehicleId,
    latitude,
    longitude,
    speed: speed || 0,
    heading: heading || 0,
    is_moving: isMoving,
    last_updated: new Date(),
  });

  ApiResponse.success(res, { location }, 'Location updated successfully');
});

/**
 * GET /api/v1/tracking/:vehicleId
 * Get the latest location for a specific vehicle.
 */
const getVehicleLocation = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;

  const location = await VehicleLocation.findOne({
    where: { vehicle_id: vehicleId },
    include: [
      {
        association: 'vehicle',
        attributes: ['id', 'plate_number', 'make', 'model', 'capacity', 'status'],
        include: [
          { model: Driver, as: 'driver', attributes: ['id', 'first_name', 'last_name', 'phone'] },
        ],
      },
    ],
  });

  if (!location) {
    throw ApiError.notFound('No location data available for this vehicle.');
  }

  ApiResponse.success(res, { location }, 'Vehicle location retrieved');
});

/**
 * GET /api/v1/tracking
 * Get all vehicle locations (admin fleet overview).
 */
const getAllLocations = catchAsync(async (req, res) => {
  const locations = await VehicleLocation.findAll({
    include: [
      {
        association: 'vehicle',
        attributes: ['id', 'plate_number', 'make', 'model', 'capacity', 'status'],
        include: [
          { model: Driver, as: 'driver', attributes: ['id', 'first_name', 'last_name', 'phone'] },
          { model: Route, as: 'drivers' }, // We'll get route through driver below
        ],
      },
    ],
    order: [['last_updated', 'DESC']],
  });

  // Enrich with route info via drivers
  const enriched = [];
  for (const loc of locations) {
    const locData = loc.toJSON();
    // Get the driver's route
    if (locData.vehicle) {
      const driver = await Driver.findOne({
        where: { vehicle_id: locData.vehicle.id },
        include: [{ model: Route, as: 'route', attributes: ['id', 'name', 'start_location', 'end_location'] }],
      });
      locData.route = driver?.route || null;
      locData.driver = driver ? { id: driver.id, first_name: driver.first_name, last_name: driver.last_name, phone: driver.phone } : locData.vehicle.driver;
    }
    enriched.push(locData);
  }

  ApiResponse.success(res, { locations: enriched }, 'All vehicle locations retrieved');
});

/**
 * GET /api/v1/tracking/my-vehicles
 * Get locations for vehicles associated with the parent's active bookings.
 */
const getMyVehicleLocations = catchAsync(async (req, res) => {
  // Find parent's active bookings with assigned vehicles
  const activeBookings = await Booking.findAll({
    where: {
      parent_id: req.user.id,
      status: ['confirmed', 'pending'],
    },
    attributes: ['id', 'booking_reference', 'vehicle_id', 'status'],
    include: [
      { model: Student, as: 'student', attributes: ['id', 'first_name', 'last_name'] },
      { model: Route, as: 'route', attributes: ['id', 'name', 'start_location', 'end_location'] },
      {
        model: Vehicle, as: 'vehicle', attributes: ['id', 'plate_number', 'make', 'model'],
        include: [
          { model: Driver, as: 'driver', attributes: ['id', 'first_name', 'last_name', 'phone'] },
        ],
      },
    ],
  });

  // Get locations for those vehicles
  const vehicleIds = [...new Set(activeBookings.filter((b) => b.vehicle_id).map((b) => b.vehicle_id))];

  const locations = vehicleIds.length > 0
    ? await VehicleLocation.findAll({
        where: { vehicle_id: vehicleIds },
      })
    : [];

  // Build a map of vehicleId -> location
  const locationMap = {};
  for (const loc of locations) {
    locationMap[loc.vehicle_id] = loc;
  }

  // Combine booking info with location data
  const result = activeBookings
    .filter((b) => b.vehicle_id)
    .map((b) => {
      const bData = b.toJSON();
      return {
        booking: {
          id: bData.id,
          booking_reference: bData.booking_reference,
          status: bData.status,
          student: bData.student,
          route: bData.route,
        },
        vehicle: bData.vehicle,
        location: locationMap[bData.vehicle_id] || null,
      };
    });

  ApiResponse.success(res, { vehicles: result }, 'My vehicle locations retrieved');
});

module.exports = {
  updateLocation,
  getVehicleLocation,
  getAllLocations,
  getMyVehicleLocations,
};
