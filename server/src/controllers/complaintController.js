const { Op } = require('sequelize');
const { Complaint, User, Booking } = require('../models');
const logAudit = require('../utils/auditLog');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const complaintIncludes = [
  { association: 'parent', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] },
  {
    association: 'booking',
    attributes: ['id', 'booking_reference', 'status', 'start_date'],
    required: false,
  },
];

/* ──────────────────────────────────────────────
   PARENT ENDPOINTS
   ────────────────────────────────────────────── */

/**
 * POST /complaints
 * Create a complaint (parent).
 */
const createComplaint = catchAsync(async (req, res) => {
  const { subject, description, category, booking_id, priority } = req.body;

  // If booking_id provided, verify it belongs to this parent
  if (booking_id) {
    const booking = await Booking.findOne({
      where: { id: booking_id, parent_id: req.user.id },
    });
    if (!booking) {
      throw ApiError.notFound('Booking not found or does not belong to you.');
    }
  }

  const complaint = await Complaint.create({
    parent_id: req.user.id,
    booking_id: booking_id || null,
    subject,
    description,
    category: category || 'other',
    priority: priority || 'medium',
  });

  const full = await Complaint.findByPk(complaint.id, { include: complaintIncludes });

  ApiResponse.created(res, full, 'Complaint submitted successfully');
});

/**
 * GET /complaints
 * List complaints — parents see own, admins see all.
 */
const getComplaints = catchAsync(async (req, res) => {
  const { page = 1, limit = 15, status, category, priority, search } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = {};

  if (req.user.role === 'parent') {
    where.parent_id = req.user.id;
  }

  if (status) where.status = status;
  if (category) where.category = category;
  if (priority) where.priority = priority;
  if (search) {
    where[Op.or] = [
      { subject: { [Op.like]: `%${search}%` } },
      { reference: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Complaint.findAndCountAll({
    where,
    include: complaintIncludes,
    limit: parseInt(limit),
    offset,
    order: [['createdAt', 'DESC']],
  });

  ApiResponse.paginated(res, rows, {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / parseInt(limit)),
  }, 'Complaints retrieved successfully');
});

/**
 * GET /complaints/:id
 * Get a single complaint.
 */
const getComplaint = catchAsync(async (req, res) => {
  const where = { id: req.params.id };
  if (req.user.role === 'parent') {
    where.parent_id = req.user.id;
  }

  const complaint = await Complaint.findOne({ where, include: complaintIncludes });
  if (!complaint) throw ApiError.notFound('Complaint not found.');

  ApiResponse.success(res, complaint, 'Complaint retrieved successfully');
});

/* ──────────────────────────────────────────────
   ADMIN ENDPOINTS
   ────────────────────────────────────────────── */

/**
 * PATCH /complaints/:id/respond
 * Admin responds to / updates a complaint.
 */
const respondToComplaint = catchAsync(async (req, res) => {
  const { admin_response, status } = req.body;

  const complaint = await Complaint.findByPk(req.params.id);
  if (!complaint) throw ApiError.notFound('Complaint not found.');

  if (admin_response) complaint.admin_response = admin_response;
  if (status) {
    complaint.status = status;
    if (status === 'resolved' || status === 'closed') {
      complaint.resolved_at = new Date();
    }
  }
  await complaint.save();

  const full = await Complaint.findByPk(complaint.id, { include: complaintIncludes });

  // Audit log
  logAudit({
    userId: req.user.id,
    action: `complaint.${status || 'respond'}`,
    entityType: 'complaint',
    entityId: complaint.id,
    description: `Responded to complaint ${complaint.reference}${status ? ` — set status to ${status}` : ''}`,
    metadata: { status, responseLength: admin_response?.length },
    ipAddress: req.ip,
  });

  ApiResponse.success(res, full, 'Complaint updated successfully');
});

/**
 * GET /complaints/stats
 * Admin complaint statistics.
 */
const getComplaintStats = catchAsync(async (req, res) => {
  const [total, open, inProgress, resolved, closed] = await Promise.all([
    Complaint.count(),
    Complaint.count({ where: { status: 'open' } }),
    Complaint.count({ where: { status: 'in_progress' } }),
    Complaint.count({ where: { status: 'resolved' } }),
    Complaint.count({ where: { status: 'closed' } }),
  ]);

  ApiResponse.success(res, { total, open, inProgress, resolved, closed }, 'Complaint stats retrieved');
});

module.exports = {
  createComplaint,
  getComplaints,
  getComplaint,
  respondToComplaint,
  getComplaintStats,
};
