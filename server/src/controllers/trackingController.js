const { VehicleLocation, Vehicle, Driver, Route, Booking, Student } = require('../models');
const { calculateETA, getProximityStatus } = require('../utils/eta');
const { createNotification } = require('../utils/notification');
const { sendBusApproachingSMS } = require('../services/smsService');
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

/**
 * GET /api/v1/tracking/eta/:bookingId
 * Calculate ETA for a specific booking's vehicle to the route destination.
 */
const getETAForBooking = catchAsync(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findOne({
    where: { id: bookingId, parent_id: req.user.id },
    include: [
      { model: Route, as: 'route', attributes: ['id', 'name', 'end_location', 'end_lat', 'end_lng', 'start_lat', 'start_lng'] },
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'plate_number'] },
      { model: Student, as: 'student', attributes: ['id', 'first_name', 'last_name', 'pickup_lat', 'pickup_lng', 'pickup_address'] },
    ],
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found.');
  }

  if (!booking.vehicle_id) {
    throw ApiError.badRequest('No vehicle assigned to this booking yet.');
  }

  // Get vehicle location
  const location = await VehicleLocation.findOne({
    where: { vehicle_id: booking.vehicle_id },
  });

  if (!location) {
    throw ApiError.notFound('No GPS data available for this vehicle.');
  }

  // Calculate ETA to student pickup point (if available) or route end
  const destLat = booking.student?.pickup_lat || booking.route?.end_lat;
  const destLng = booking.student?.pickup_lng || booking.route?.end_lng;

  if (!destLat || !destLng) {
    throw ApiError.badRequest('Destination coordinates not available.');
  }

  const eta = calculateETA({
    vehicleLat: location.latitude,
    vehicleLng: location.longitude,
    destLat,
    destLng,
    currentSpeed: location.speed || 0,
  });

  const proximity = getProximityStatus(eta.distanceKm);

  ApiResponse.success(res, {
    eta: {
      ...eta,
      proximity,
      vehicleLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed,
        heading: location.heading,
        is_moving: location.is_moving,
        last_updated: location.last_updated,
      },
      destination: {
        name: booking.student?.pickup_address || booking.route?.end_location,
        latitude: destLat,
        longitude: destLng,
      },
    },
  }, 'ETA calculated successfully');
});

/**
 * GET /api/v1/tracking/my-etas
 * Get ETAs for all of the parent's active bookings with assigned vehicles.
 */
const getMyETAs = catchAsync(async (req, res) => {
  const activeBookings = await Booking.findAll({
    where: {
      parent_id: req.user.id,
      status: ['confirmed'],
    },
    include: [
      { model: Student, as: 'student', attributes: ['id', 'first_name', 'last_name', 'pickup_lat', 'pickup_lng', 'pickup_address'] },
      { model: Route, as: 'route', attributes: ['id', 'name', 'end_location', 'end_lat', 'end_lng'] },
      {
        model: Vehicle, as: 'vehicle', attributes: ['id', 'plate_number', 'make', 'model'],
        include: [{ model: Driver, as: 'driver', attributes: ['id', 'first_name', 'last_name', 'phone'] }],
      },
    ],
  });

  const vehicleIds = [...new Set(activeBookings.filter((b) => b.vehicle_id).map((b) => b.vehicle_id))];

  const locations = vehicleIds.length > 0
    ? await VehicleLocation.findAll({ where: { vehicle_id: vehicleIds } })
    : [];

  const locationMap = {};
  for (const loc of locations) {
    locationMap[loc.vehicle_id] = loc;
  }

  const etas = activeBookings
    .filter((b) => b.vehicle_id)
    .map((b) => {
      const bData = b.toJSON();
      const location = locationMap[b.vehicle_id];

      const destLat = bData.student?.pickup_lat || bData.route?.end_lat;
      const destLng = bData.student?.pickup_lng || bData.route?.end_lng;

      let eta = null;
      let proximity = null;

      if (location && destLat && destLng) {
        eta = calculateETA({
          vehicleLat: location.latitude,
          vehicleLng: location.longitude,
          destLat,
          destLng,
          currentSpeed: location.speed || 0,
        });
        proximity = getProximityStatus(eta.distanceKm);
      }

      return {
        booking: {
          id: bData.id,
          booking_reference: bData.booking_reference,
          status: bData.status,
          student: bData.student,
          route: bData.route,
        },
        vehicle: bData.vehicle,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed,
          is_moving: location.is_moving,
          last_updated: location.last_updated,
        } : null,
        eta,
        proximity,
      };
    });

  ApiResponse.success(res, { etas }, 'ETAs calculated successfully');
});

module.exports = {
  updateLocation,
  getVehicleLocation,
  getAllLocations,
  getMyVehicleLocations,
  getETAForBooking,
  getMyETAs,
};
