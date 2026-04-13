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
  requestRefund,
  getReceipt,
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
router.get('/:id/receipt', paymentIdValidator, validate, getReceipt);

// ─── Parent Only ────────────────────────────────────
router.patch('/:id/request-refund', paymentIdValidator, validate, requestRefund);

// ─── Admin Only ─────────────────────────────────────
router.patch('/:id/refund', authorize('admin'), paymentIdValidator, validate, refundPayment);

module.exports = router;
