const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDriverProfile,
  getDriverDashboard,
  getDriverBookings,
  updateMyLocation,
  updateMyStatus,
} = require('../controllers/driverPortalController');

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

module.exports = router;
