const { body, param, query } = require('express-validator');
const { DRIVER_STATUS } = require('../config/constants');

const createDriverValidator = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),

  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 10, max: 20 }).withMessage('Phone number must be 10-20 characters'),

  body('license_number')
    .trim()
    .notEmpty().withMessage('License number is required')
    .isLength({ max: 50 }).withMessage('License number must be under 50 characters'),

  body('license_expiry')
    .notEmpty().withMessage('License expiry is required')
    .isISO8601().withMessage('License expiry must be a valid date (YYYY-MM-DD)'),

  body('vehicle_id')
    .optional({ nullable: true })
    .isUUID().withMessage('Invalid vehicle ID'),

  body('status')
    .optional()
    .isIn(Object.values(DRIVER_STATUS)).withMessage('Invalid driver status'),

  body('profile_photo')
    .optional({ nullable: true })
    .trim()
    .isURL().withMessage('Profile photo must be a valid URL'),
];

const updateDriverValidator = [
  param('id')
    .isUUID().withMessage('Invalid driver ID'),

  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),

  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),

  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 }).withMessage('Phone number must be 10-20 characters'),

  body('license_number')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('License number must be under 50 characters'),

  body('license_expiry')
    .optional()
    .isISO8601().withMessage('License expiry must be a valid date (YYYY-MM-DD)'),

  body('vehicle_id')
    .optional({ nullable: true })
    .isUUID().withMessage('Invalid vehicle ID'),

  body('status')
    .optional()
    .isIn(Object.values(DRIVER_STATUS)).withMessage('Invalid driver status'),

  body('profile_photo')
    .optional({ nullable: true })
    .trim(),
];

const driverIdValidator = [
  param('id')
    .isUUID().withMessage('Invalid driver ID'),
];

const listDriversValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(Object.values(DRIVER_STATUS)).withMessage('Invalid driver status'),

  query('search')
    .optional()
    .trim(),
];

module.exports = {
  createDriverValidator,
  updateDriverValidator,
  driverIdValidator,
  listDriversValidator,
};
