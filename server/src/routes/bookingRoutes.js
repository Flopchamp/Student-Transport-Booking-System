const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createBookingValidator,
  updateBookingStatusValidator,
  bookingIdValidator,
  listBookingsValidator,
} = require('../validators/bookingValidator');
const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  updateBookingStatus,
  assignBooking,
  getBookingStats,
} = require('../controllers/bookingController');

const router = Router();

// All booking routes require authentication
router.use(protect);

// ─── Admin Stats (must be before /:id to avoid conflict) ───
router.get('/stats', authorize('admin'), getBookingStats);

// ─── Parent + Admin ─────────────────────────────────
router.post('/', createBookingValidator, validate, createBooking);
router.get('/', listBookingsValidator, validate, getBookings);
router.get('/:id', bookingIdValidator, validate, getBooking);

// ─── Parent (own bookings) ──────────────────────────
router.patch('/:id/cancel', bookingIdValidator, validate, cancelBooking);

// ─── Admin Only ─────────────────────────────────────
router.patch('/:id/status', authorize('admin'), updateBookingStatusValidator, validate, updateBookingStatus);
router.put('/:id/assign', authorize('admin'), bookingIdValidator, validate, assignBooking);

module.exports = router;
