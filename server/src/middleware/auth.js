const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../services/authService');
const { User } = require('../models');

/**
 * Protect routes — verifies JWT token from Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    // 1) Extract token: cookie (browser) → Authorization header (mobile/API) → query param (file downloads)
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      throw ApiError.unauthorized('Access denied. No token provided.');
    }

    // 2) Verify token
    const decoded = verifyToken(token);

    // 3) Check if user still exists and is active
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw ApiError.unauthorized('User belonging to this token no longer exists.');
    }

    if (!user.is_active) {
      throw ApiError.unauthorized('Your account has been deactivated.');
    }

    // 4) Reject tokens issued before the last password change.
    // iat is seconds; password_changed_at is a Date — floor to seconds for comparison.
    if (user.password_changed_at) {
      const changedAtSeconds = Math.floor(user.password_changed_at.getTime() / 1000);
      if (decoded.iat < changedAtSeconds) {
        throw ApiError.unauthorized('Password was recently changed. Please log in again.');
      }
    }

    // 5) Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.isOperational) {
      return next(error);
    }
    next(ApiError.unauthorized('Invalid or expired token.'));
  }
};

/**
 * Restrict access to specific roles.
 * Must be used AFTER the protect middleware.
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'parent')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden('You do not have permission to perform this action.')
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};
