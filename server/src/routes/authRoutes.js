const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe, updateMe, changePassword } = require('../controllers/authController');
const { registerValidator, loginValidator, changePasswordValidator } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = Router();

// Strict rate limiter for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 10, // relaxed in dev
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/change-password', protect, changePasswordValidator, validate, changePassword);

module.exports = router;
