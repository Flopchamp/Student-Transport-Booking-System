const crypto = require('crypto');
const { Op } = require('sequelize');
const { User } = require('../models');
const { generateToken } = require('../services/authService');
const { sendPasswordResetEmail, sendWelcomeEmail, sendEmailVerificationEmail } = require('../services/emailService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const env = require('../config/env');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days — matches JWT_EXPIRES_IN
  path: '/',
};

const setAuthCookie = (res, token) => res.cookie('token', token, COOKIE_OPTIONS);

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

  // Generate email verification token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.email_verification_token = hashedToken;
  user.email_verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await user.save({ hooks: false });

  // Set auth cookie — token never touches the response body
  setAuthCookie(res, generateToken(user));

  // Send verification email (fire-and-forget)
  const verifyUrl = `${env.CLIENT_URL}/verify-email/${rawToken}`;
  sendEmailVerificationEmail(user.email, {
    parentName: `${user.first_name} ${user.last_name}`,
    verifyUrl,
  }).catch((err) => console.error('[Email] Verification email failed:', err.message));

  // Send welcome email (fire-and-forget)
  sendWelcomeEmail(user.email, {
    parentName: `${user.first_name} ${user.last_name}`,
  }).catch((err) => console.error('[Email] Welcome email failed:', err.message));

  ApiResponse.created(res, { user: user.toSafeJSON() }, 'Registration successful');
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

  setAuthCookie(res, generateToken(user));

  ApiResponse.success(res, { user: user.toSafeJSON() }, 'Login successful');
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
  const { first_name, last_name, phone, sms_notifications } = req.body;

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  // Only allow updating safe fields
  if (first_name) user.first_name = first_name;
  if (last_name) user.last_name = last_name;
  if (phone) user.phone = phone;
  if (sms_notifications !== undefined) user.sms_notifications = sms_notifications;

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

  // Update password (bcrypt hook will hash it, password_changed_at is set automatically)
  user.password = new_password;
  await user.save();

  // Rotate the cookie so the new token reflects the updated password_changed_at
  setAuthCookie(res, generateToken(user));

  ApiResponse.success(res, null, 'Password changed successfully');
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

  setAuthCookie(res, generateToken(user));

  ApiResponse.success(res, null, 'Password has been reset successfully.');
});

/**
 * GET /api/v1/auth/verify-email/:token
 * Verify the user's email address using the token from the email link.
 */
const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    where: {
      email_verification_token: hashedToken,
      email_verification_expires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw ApiError.badRequest('Verification link is invalid or has expired.');
  }

  user.email_verified = true;
  user.email_verification_token = null;
  user.email_verification_expires = null;
  await user.save({ hooks: false });

  ApiResponse.success(res, null, 'Email verified successfully.');
});

/**
 * POST /api/v1/auth/resend-verification
 * Resend email verification link for the authenticated user.
 */
const resendVerification = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  if (user.email_verified) {
    return ApiResponse.success(res, null, 'Email is already verified.');
  }

  // Generate new verification token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.email_verification_token = hashedToken;
  user.email_verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ hooks: false });

  const verifyUrl = `${env.CLIENT_URL}/verify-email/${rawToken}`;
  await sendEmailVerificationEmail(user.email, {
    parentName: `${user.first_name} ${user.last_name}`,
    verifyUrl,
  });

  ApiResponse.success(res, null, 'Verification email sent.');
});

/**
 * POST /api/v1/auth/logout
 * Clear the auth cookie.
 */
const logout = (req, res) => {
  res.clearCookie('token', { path: '/' });
  ApiResponse.success(res, null, 'Logged out successfully');
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};
