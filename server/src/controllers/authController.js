const crypto = require('crypto');
const { Op } = require('sequelize');
const { User } = require('../models');
const { generateToken } = require('../services/authService');
const { sendPasswordResetEmail } = require('../services/emailService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const env = require('../config/env');

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

/**
 * POST /api/v1/auth/forgot-password
 * Generate a password reset token and email it to the user.
 */
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return ApiResponse.success(res, null, 'If an account with that email exists, a reset link has been sent.');
  }

  // Generate a random token
  const rawToken = crypto.randomBytes(32).toString('hex');

  // Hash the token before storing (so a DB leak doesn't expose valid tokens)
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Save hashed token and expiry (1 hour) to the user
  user.reset_password_token = hashedToken;
  user.reset_password_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ hooks: false }); // skip bcrypt hook — no password change

  // Build the reset URL (the raw token goes in the URL)
  const resetUrl = `${env.CLIENT_URL}/reset-password/${rawToken}`;

  try {
    await sendPasswordResetEmail(email, resetUrl);
  } catch (err) {
    // If email fails, clear the token so the user can try again
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save({ hooks: false });
    throw ApiError.internal('Failed to send reset email. Please try again later.');
  }

  ApiResponse.success(res, null, 'If an account with that email exists, a reset link has been sent.');
});

/**
 * POST /api/v1/auth/reset-password/:token
 * Reset the password using the token from the email link.
 */
const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash the raw token from the URL so we can compare it with the stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find a user with this token whose expiry is still in the future
  const user = await User.findOne({
    where: {
      reset_password_token: hashedToken,
      reset_password_expires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw ApiError.badRequest('Reset token is invalid or has expired.');
  }

  // Set the new password (bcrypt hook will hash it)
  user.password = password;
  user.reset_password_token = null;
  user.reset_password_expires = null;
  await user.save();

  // Generate a fresh JWT so the user is logged in immediately
  const jwtToken = generateToken(user);

  ApiResponse.success(res, { token: jwtToken }, 'Password has been reset successfully.');
});

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
};
