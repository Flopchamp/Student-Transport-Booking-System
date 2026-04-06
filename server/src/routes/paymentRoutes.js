const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createPaymentValidator,
  paymentIdValidator,
  listPaymentsValidator,
} = require('../validators/paymentValidator');
const {
  createPayment,
  getPayments,
  getPayment,
  getPaymentStats,
  refundPayment,
} = require('../controllers/paymentController');

const router = Router();

// All payment routes require authentication
router.use(protect);

// ─── Admin Stats (must be before /:id to avoid conflict) ───
router.get('/stats', authorize('admin'), getPaymentStats);

// ─── Parent + Admin ─────────────────────────────────
router.post('/', createPaymentValidator, validate, createPayment);
router.get('/', listPaymentsValidator, validate, getPayments);
router.get('/:id', paymentIdValidator, validate, getPayment);

// ─── Admin Only ─────────────────────────────────────
router.patch('/:id/refund', authorize('admin'), paymentIdValidator, validate, refundPayment);

module.exports = router;
