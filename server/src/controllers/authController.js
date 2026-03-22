const { User } = require('../models');
const { generateToken } = require('../services/authService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * POST /api/v1/auth/register
 * Register a new user (parent by default).
 */
const register = catchAsync(async (req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists.');
  }

  // Create user — role is always 'parent' (admin accounts must be created manually)
  const user = await User.create({
    first_name,
    last_name,
    email,
    phone,
    password,
    role: 'parent',
  });

  // Generate token
  const token = generateToken(user);

  ApiResponse.created(res, {
    user: user.toSafeJSON(),
    token,
  }, 'Registration successful');
});

/**
 * POST /api/v1/auth/login
 * Authenticate user and return JWT.
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email (include password for comparison)
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Check if account is active
  if (!user.is_active) {
    throw ApiError.unauthorized('Your account has been deactivated. Contact support.');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Generate token
  const token = generateToken(user);

  ApiResponse.success(res, {
    user: user.toSafeJSON(),
    token,
  }, 'Login successful');
});

/**
 * GET /api/v1/auth/me
 * Get current authenticated user's profile.
 */
const getMe = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [{ association: 'students' }],
  });

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  ApiResponse.success(res, { user }, 'Profile retrieved successfully');
});

/**
 * PUT /api/v1/auth/me
 * Update current authenticated user's profile.
 */
const updateMe = catchAsync(async (req, res) => {
  const { first_name, last_name, phone } = req.body;

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  // Only allow updating safe fields
  if (first_name) user.first_name = first_name;
  if (last_name) user.last_name = last_name;
  if (phone) user.phone = phone;

  await user.save();

  ApiResponse.success(res, { user: user.toSafeJSON() }, 'Profile updated successfully');
});

/**
 * PUT /api/v1/auth/change-password
 * Change password for authenticated user.
 */
const changePassword = catchAsync(async (req, res) => {
  const { current_password, new_password } = req.body;

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(current_password);
  if (!isPasswordValid) {
    throw ApiError.badRequest('Current password is incorrect.');
  }

  // Update password (bcrypt hook will hash it)
  user.password = new_password;
  await user.save();

  // Generate new token
  const token = generateToken(user);

  ApiResponse.success(res, { token }, 'Password changed successfully');
});

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
};
