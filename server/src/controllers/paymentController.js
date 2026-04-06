const { Op } = require('sequelize');
const { Payment, Booking, Route, Student, User } = require('../models');
const { PAYMENT_STATUS, BOOKING_STATUS } = require('../config/constants');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// Common includes for payment queries
const paymentIncludes = [
  {
    association: 'booking',
    attributes: ['id', 'booking_reference', 'status', 'amount', 'start_date', 'pickup_time'],
    include: [
      { association: 'student', attributes: ['id', 'first_name', 'last_name', 'school_name'] },
      { association: 'route', attributes: ['id', 'name', 'start_location', 'end_location'] },
    ],
  },
  { association: 'parent', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] },
];

// =============================================
// PARENT ENDPOINTS
// =============================================

/**
 * POST /api/v1/payments
 * Create a payment for a booking (parent).
 * Simulates payment processing (no real gateway integration).
 */
const createPayment = catchAsync(async (req, res) => {
  const { booking_id, payment_method, phone_number, card_token } = req.body;

  // 1. Verify the booking belongs to this parent and is payable
  const booking = await Booking.findOne({
    where: { id: booking_id, parent_id: req.user.id },
    include: [
      { association: 'route', attributes: ['id', 'name', 'price'] },
    ],
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found or does not belong to you.');
  }

  if (booking.status === 'cancelled') {
    throw ApiError.badRequest('Cannot pay for a cancelled booking.');
  }

  if (booking.status === 'completed') {
    throw ApiError.badRequest('This booking is already completed.');
  }

  // 2. Check if there's already a completed payment for this booking
  const existingPayment = await Payment.findOne({
    where: {
      booking_id,
      status: PAYMENT_STATUS.COMPLETED,
    },
  });

  if (existingPayment) {
    throw ApiError.conflict('This booking has already been paid for.');
  }

  // 3. Check for a pending payment — fail it and create new
  const pendingPayment = await Payment.findOne({
    where: {
      booking_id,
      parent_id: req.user.id,
      status: PAYMENT_STATUS.PENDING,
    },
  });

  if (pendingPayment) {
    pendingPayment.status = PAYMENT_STATUS.FAILED;
    pendingPayment.failure_reason = 'Superseded by new payment attempt';
    await pendingPayment.save();
  }

  // 4. Create the payment record
  const payment = await Payment.create({
    booking_id,
    parent_id: req.user.id,
    amount: booking.amount,
    currency: 'KES',
    payment_method,
    status: PAYMENT_STATUS.PENDING,
  });

  // 5. Simulate payment processing
  //    In production, this would call Stripe/M-Pesa API
  //    For now, we simulate a successful payment after a short delay
  const simulateSuccess = true; // Toggle for testing failures

  if (simulateSuccess) {
    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.paid_at = new Date();

    if (payment_method === 'mpesa') {
      // Simulate M-Pesa receipt
      const receipt = 'QK' + Date.now().toString(36).toUpperCase().slice(-8);
      payment.mpesa_receipt_number = receipt;
    } else {
      // Simulate Stripe payment intent
      payment.stripe_payment_intent_id = 'pi_sim_' + Date.now().toString(36);
    }

    await payment.save();

    // Update booking status to confirmed after successful payment
    booking.status = BOOKING_STATUS.CONFIRMED;
    await booking.save();
  } else {
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failure_reason = 'Payment declined (simulated)';
    await payment.save();
  }

  // 6. Refetch with full associations
  const fullPayment = await Payment.findByPk(payment.id, { include: paymentIncludes });

  const statusCode = payment.status === PAYMENT_STATUS.COMPLETED ? 201 : 200;
  const message = payment.status === PAYMENT_STATUS.COMPLETED
    ? 'Payment processed successfully'
    : 'Payment failed. Please try again.';

  return res.status(statusCode).json({
    success: payment.status === PAYMENT_STATUS.COMPLETED,
    message,
    data: { payment: fullPayment },
  });
});

/**
 * GET /api/v1/payments
 * List payments — parents see own, admins see all.
 */
const getPayments = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, booking_id } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  // Parents see only their own payments
  if (req.user.role === 'parent') {
    where.parent_id = req.user.id;
  }

  if (status) where.status = status;
  if (booking_id) where.booking_id = booking_id;

  const { count, rows: payments } = await Payment.findAndCountAll({
    where,
    include: paymentIncludes,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
  });

  ApiResponse.paginated(
    res,
    { payments },
    {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
    'Payments retrieved successfully',
  );
});

/**
 * GET /api/v1/payments/:id
 * Get a single payment.
 */
const getPayment = catchAsync(async (req, res) => {
  const where = { id: req.params.id };

  // Parents can only see their own
  if (req.user.role === 'parent') {
    where.parent_id = req.user.id;
  }

  const payment = await Payment.findOne({
    where,
    include: paymentIncludes,
  });

  if (!payment) {
    throw ApiError.notFound('Payment not found.');
  }

  ApiResponse.success(res, { payment }, 'Payment retrieved successfully');
});

// =============================================
// ADMIN ENDPOINTS
// =============================================

/**
 * GET /api/v1/payments/stats
 * Admin payment stats
 */
const getPaymentStats = catchAsync(async (req, res) => {
  const [totalPayments, completedPayments, failedPayments, pendingPayments] = await Promise.all([
    Payment.count(),
    Payment.count({ where: { status: PAYMENT_STATUS.COMPLETED } }),
    Payment.count({ where: { status: PAYMENT_STATUS.FAILED } }),
    Payment.count({ where: { status: PAYMENT_STATUS.PENDING } }),
  ]);

  // Total revenue from completed payments
  const revenueResult = await Payment.sum('amount', {
    where: { status: PAYMENT_STATUS.COMPLETED },
  });

  ApiResponse.success(res, {
    stats: {
      totalPayments,
      completedPayments,
      failedPayments,
      pendingPayments,
      totalRevenue: revenueResult || 0,
    },
  }, 'Payment stats retrieved successfully');
});

/**
 * PATCH /api/v1/payments/:id/refund
 * Refund a completed payment (admin).
 */
const refundPayment = catchAsync(async (req, res) => {
  const payment = await Payment.findByPk(req.params.id, {
    include: [{ association: 'booking' }],
  });

  if (!payment) {
    throw ApiError.notFound('Payment not found.');
  }

  if (payment.status !== PAYMENT_STATUS.COMPLETED) {
    throw ApiError.badRequest('Only completed payments can be refunded.');
  }

  // Mark as refunded
  payment.status = PAYMENT_STATUS.REFUNDED;
  await payment.save();

  // Revert booking to pending if it was confirmed by this payment
  if (payment.booking && payment.booking.status === BOOKING_STATUS.CONFIRMED) {
    payment.booking.status = BOOKING_STATUS.PENDING;
    await payment.booking.save();
  }

  const fullPayment = await Payment.findByPk(payment.id, { include: paymentIncludes });

  ApiResponse.success(res, { payment: fullPayment }, 'Payment refunded successfully');
});

module.exports = {
  createPayment,
  getPayments,
  getPayment,
  getPaymentStats,
  refundPayment,
};
