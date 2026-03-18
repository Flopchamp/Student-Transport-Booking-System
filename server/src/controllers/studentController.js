const { Op } = require('sequelize');
const { Student, User, Booking } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// =============================================
// PARENT ENDPOINTS
// =============================================

/**
 * POST /api/v1/students
 * Add a new student (parent only — auto-assigns parent_id).
 */
const createStudent = catchAsync(async (req, res) => {
  const {
    first_name, last_name, date_of_birth,
    school_name, grade, pickup_address,
    pickup_lat, pickup_lng, special_needs,
  } = req.body;

  const student = await Student.create({
    parent_id: req.user.id,
    first_name,
    last_name,
    date_of_birth,
    school_name,
    grade,
    pickup_address,
    pickup_lat: pickup_lat || null,
    pickup_lng: pickup_lng || null,
    special_needs: special_needs || null,
  });

  ApiResponse.created(res, { student }, 'Student added successfully');
});

/**
 * GET /api/v1/students
 * List students — parents see only their own; admins see all.
 */
const getStudents = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, school_name, grade } = req.query;
  const offset = (page - 1) * limit;

  // Build where clause — only active students by default
  const where = { is_active: true };

  // Parents can only see their own students
  if (req.user.role === 'parent') {
    where.parent_id = req.user.id;
  }

  // Admins can optionally include inactive students
  if (req.user.role === 'admin' && req.query.include_inactive === 'true') {
    delete where.is_active;
  }

  // Search by name
  if (search) {
    where[Op.or] = [
      { first_name: { [Op.like]: `%${search}%` } },
      { last_name: { [Op.like]: `%${search}%` } },
    ];
  }

  // Filter by school
  if (school_name) {
    where.school_name = { [Op.like]: `%${school_name}%` };
  }

  // Filter by grade
  if (grade) {
    where.grade = grade;
  }

  const { count, rows: students } = await Student.findAndCountAll({
    where,
    include: [
      {
        association: 'parent',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
      },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
  });

  ApiResponse.paginated(
    res,
    { students },
    {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
    'Students retrieved successfully',
  );
});

/**
 * GET /api/v1/students/:id
 * Get a single student by ID.
 */
const getStudent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const where = { id };

  // Parents can only see their own students
  if (req.user.role === 'parent') {
    where.parent_id = req.user.id;
  }

  const student = await Student.findOne({
    where,
    include: [
      {
        association: 'parent',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
      },
      {
        association: 'bookings',
        limit: 5,
        order: [['created_at', 'DESC']],
      },
    ],
  });

  if (!student) {
    throw ApiError.notFound('Student not found.');
  }

  ApiResponse.success(res, { student }, 'Student retrieved successfully');
});

/**
 * PUT /api/v1/students/:id
 * Update a student's details.
 */
const updateStudent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const where = { id };

  // Parents can only update their own students
  if (req.user.role === 'parent') {
    where.parent_id = req.user.id;
  }

  const student = await Student.findOne({ where });

  if (!student) {
    throw ApiError.notFound('Student not found.');
  }

  // Allowed update fields
  const allowedFields = [
    'first_name', 'last_name', 'date_of_birth',
    'school_name', 'grade', 'pickup_address',
    'pickup_lat', 'pickup_lng', 'special_needs',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      student[field] = req.body[field];
    }
  });

  await student.save();

  ApiResponse.success(res, { student }, 'Student updated successfully');
});

/**
 * DELETE /api/v1/students/:id
 * Soft-delete a student (set is_active = false).
 */
const deleteStudent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const where = { id };

  // Parents can only delete their own students
  if (req.user.role === 'parent') {
    where.parent_id = req.user.id;
  }

  const student = await Student.findOne({ where });

  if (!student) {
    throw ApiError.notFound('Student not found.');
  }

  // Check for active bookings before deleting
  const activeBookings = await Booking.count({
    where: {
      student_id: id,
      status: { [Op.in]: ['pending', 'confirmed'] },
    },
  });

  if (activeBookings > 0) {
    throw ApiError.badRequest(
      `Cannot delete student with ${activeBookings} active booking(s). Cancel them first.`,
    );
  }

  // Soft delete
  student.is_active = false;
  await student.save();

  ApiResponse.success(res, null, 'Student removed successfully');
});

// =============================================
// ADMIN ENDPOINTS
// =============================================

/**
 * PATCH /api/v1/students/:id/activate
 * Re-activate a soft-deleted student (admin only).
 */
const activateStudent = catchAsync(async (req, res) => {
  const student = await Student.findByPk(req.params.id);

  if (!student) {
    throw ApiError.notFound('Student not found.');
  }

  student.is_active = true;
  await student.save();

  ApiResponse.success(res, { student }, 'Student activated successfully');
});

module.exports = {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  activateStudent,
};
