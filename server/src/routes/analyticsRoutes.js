const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getOverview,
  getBookingsByRoute,
  getRevenueByRoute,
  getBookingsByStatus,
  getMonthlyBookings,
  getRecentRegistrations,
} = require('../controllers/analyticsController');

const router = Router();

// All routes require admin authentication
router.use(protect, authorize('admin'));

router.get('/overview', getOverview);
router.get('/bookings-by-route', getBookingsByRoute);
router.get('/revenue-by-route', getRevenueByRoute);
router.get('/bookings-by-status', getBookingsByStatus);
router.get('/monthly-bookings', getMonthlyBookings);
router.get('/recent-registrations', getRecentRegistrations);

module.exports = router;
