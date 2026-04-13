const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDriverProfile,
  getDriverDashboard,
  getDriverBookings,
  updateMyLocation,
  updateMyStatus,
} = require('../controllers/driverPortalController');
const {
  getMyTrips,
  startTrip,
  endTrip,
  getActiveTrip,
} = require('../controllers/tripController');

const router = Router();

// All driver portal routes require authentication + driver role
router.use(protect);
router.use(authorize('driver'));

// Dashboard
router.get('/dashboard', getDriverDashboard);

// Profile
router.get('/profile', getDriverProfile);

// Bookings
router.get('/bookings', getDriverBookings);

// GPS Location update
router.put('/location', updateMyLocation);

// Status update
router.patch('/status', updateMyStatus);

// Trips
router.get('/trips', getMyTrips);
router.get('/trips/active', getActiveTrip);
router.post('/trips/start', startTrip);
router.patch('/trips/:id/end', endTrip);

module.exports = router;
