const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const { Payment, Booking, Route, Student, User } = require('../models');
const { PAYMENT_STATUS, BOOKING_STATUS } = require('../config/constants');
const { sendPaymentReceiptEmail, sendRefundRequestEmail, sendRefundProcessedEmail } = require('../services/emailService');
const logAudit = require('../utils/auditLog');
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

  // 7. Send payment receipt email if successful (fire-and-forget)
  if (payment.status === PAYMENT_STATUS.COMPLETED && fullPayment.parent) {
    sendPaymentReceiptEmail(fullPayment.parent.email, {
      parentName: `${fullPayment.parent.first_name} ${fullPayment.parent.last_name}`,
      transactionRef: fullPayment.transaction_reference,
      bookingRef: fullPayment.booking?.booking_reference || '—',
      amount: fullPayment.amount,
      paymentMethod: fullPayment.payment_method,
      paidAt: fullPayment.paid_at || new Date(),
    }).catch((err) => console.error('[Email] Payment receipt email failed:', err.message));
  }

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
 * Refund a completed or refund-requested payment (admin).
 */
const refundPayment = catchAsync(async (req, res) => {
  const payment = await Payment.findByPk(req.params.id, {
    include: [{ association: 'booking' }, { association: 'parent' }],
  });

  if (!payment) {
    throw ApiError.notFound('Payment not found.');
  }

  if (payment.status !== PAYMENT_STATUS.COMPLETED && payment.status !== PAYMENT_STATUS.REFUND_REQUESTED) {
    throw ApiError.badRequest('Only completed or refund-requested payments can be refunded.');
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

  // Send refund processed email to parent
  if (payment.parent) {
    sendRefundProcessedEmail(payment.parent.email, {
      parentName: payment.parent.first_name,
      transactionRef: payment.transaction_reference,
      bookingRef: payment.booking?.booking_reference || '—',
      amount: payment.amount,
    }).catch((err) => console.error('Failed to send refund processed email:', err));
  }

  // Audit log
  logAudit({
    userId: req.user.id,
    action: 'payment.refund',
    entityType: 'payment',
    entityId: payment.id,
    description: `Refunded payment ${payment.transaction_reference} (KES ${payment.amount})`,
    metadata: { transactionRef: payment.transaction_reference, amount: payment.amount },
    ipAddress: req.ip,
  });

  ApiResponse.success(res, { payment: fullPayment }, 'Payment refunded successfully');
});

/**
 * PATCH /api/v1/payments/:id/request-refund
 * Request a refund for a completed payment (parent).
 */
const requestRefund = catchAsync(async (req, res) => {
  const payment = await Payment.findByPk(req.params.id, {
    include: [{ association: 'booking' }, { association: 'parent' }],
  });

  if (!payment) {
    throw ApiError.notFound('Payment not found.');
  }

  // Only the parent who made the payment can request a refund
  if (payment.parent_id !== req.user.id) {
    throw ApiError.forbidden('You can only request refunds for your own payments.');
  }

  if (payment.status !== PAYMENT_STATUS.COMPLETED) {
    throw ApiError.badRequest('Only completed payments can be refund-requested.');
  }

  payment.status = PAYMENT_STATUS.REFUND_REQUESTED;
  await payment.save();

  const fullPayment = await Payment.findByPk(payment.id, { include: paymentIncludes });

  // Notify admins about the refund request
  const admins = await User.findAll({ where: { role: 'admin' } });
  for (const admin of admins) {
    sendRefundRequestEmail(admin.email, {
      parentName: `${req.user.first_name} ${req.user.last_name}`,
      transactionRef: payment.transaction_reference,
      bookingRef: payment.booking?.booking_reference || '—',
      amount: payment.amount,
    }).catch((err) => console.error('Failed to send refund request email:', err));
  }

  // Audit log
  logAudit({
    userId: req.user.id,
    action: 'payment.refund_request',
    entityType: 'payment',
    entityId: payment.id,
    description: `Requested refund for payment ${payment.transaction_reference} (KES ${payment.amount})`,
    metadata: { transactionRef: payment.transaction_reference, amount: payment.amount },
    ipAddress: req.ip,
  });

  ApiResponse.success(res, { payment: fullPayment }, 'Refund request submitted successfully');
});

/**
 * GET /api/v1/payments/:id/receipt
 * Generate and stream a PDF receipt for a completed payment.
 */
const getReceipt = catchAsync(async (req, res) => {
  const where = { id: req.params.id };

  // Parents can only download their own receipts
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

  if (payment.status !== PAYMENT_STATUS.COMPLETED && payment.status !== PAYMENT_STATUS.REFUNDED) {
    throw ApiError.badRequest('Receipts are only available for completed or refunded payments.');
  }

  // Build PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Set response headers
  const filename = `receipt-${payment.transaction_reference}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  // ── Header ──
  doc.fontSize(22).font('Helvetica-Bold').text('EduTrans', { align: 'center' });
  doc.fontSize(10).font('Helvetica').fillColor('#666666')
    .text('Student Transport Booking System', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000')
    .text('Payment Receipt', { align: 'center' });
  doc.moveDown(1);

  // Divider
  doc.strokeColor('#cccccc').lineWidth(1)
    .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  // ── Receipt Details ──
  const leftCol = 50;
  const rightCol = 300;
  let y = doc.y;

  const addRow = (label, value, bold = false) => {
    doc.fontSize(10).font('Helvetica').fillColor('#666666')
      .text(label, leftCol, y);
    doc.fontSize(10).font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor('#000000')
      .text(String(value || '—'), rightCol, y);
    y += 22;
  };

  addRow('Transaction Ref:', payment.transaction_reference, true);
  addRow('Date:', payment.paid_at
    ? new Date(payment.paid_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(payment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  addRow('Status:', payment.status.toUpperCase(), true);
  addRow('Payment Method:', payment.payment_method === 'mpesa' ? 'M-Pesa' : 'Card (Stripe)');

  if (payment.mpesa_receipt_number) {
    addRow('M-Pesa Receipt:', payment.mpesa_receipt_number);
  }

  doc.moveDown(0.5);
  y = doc.y;

  // Divider
  doc.strokeColor('#cccccc').lineWidth(0.5)
    .moveTo(50, y).lineTo(545, y).stroke();
  y += 15;
  doc.y = y;

  // ── Parent Info ──
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000')
    .text('Parent Details', leftCol, y);
  y += 20;

  if (payment.parent) {
    addRow('Name:', `${payment.parent.first_name} ${payment.parent.last_name}`);
    addRow('Email:', payment.parent.email);
    addRow('Phone:', payment.parent.phone);
  }

  doc.moveDown(0.5);
  y = doc.y;

  // ── Booking Info ──
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000')
    .text('Booking Details', leftCol, y);
  y += 20;

  if (payment.booking) {
    addRow('Booking Ref:', payment.booking.booking_reference);
    addRow('Start Date:', payment.booking.start_date);
    addRow('Pickup Time:', payment.booking.pickup_time);

    if (payment.booking.student) {
      addRow('Student:', `${payment.booking.student.first_name} ${payment.booking.student.last_name}`);
      addRow('School:', payment.booking.student.school_name);
    }

    if (payment.booking.route) {
      addRow('Route:', payment.booking.route.name);
      addRow('From:', payment.booking.route.start_location);
      addRow('To:', payment.booking.route.end_location);
    }
  }

  doc.moveDown(1);
  y = doc.y;

  // Divider
  doc.strokeColor('#cccccc').lineWidth(1)
    .moveTo(50, y).lineTo(545, y).stroke();
  y += 15;
  doc.y = y;

  // ── Amount ──
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000')
    .text(`Amount Paid: KES ${parseFloat(payment.amount).toLocaleString()}`, leftCol, y);

  if (payment.status === 'refunded') {
    y += 25;
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#cc0000')
      .text('*** REFUNDED ***', leftCol, y);
  }

  doc.moveDown(3);

  // ── Footer ──
  doc.fontSize(8).font('Helvetica').fillColor('#999999')
    .text('This is a system-generated receipt. No signature required.', leftCol, undefined, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString('en-US')}`, { align: 'center' });

  doc.end();
});

module.exports = {
  createPayment,
  getPayments,
  getPayment,
  getPaymentStats,
  refundPayment,
  requestRefund,
  getReceipt,
};
