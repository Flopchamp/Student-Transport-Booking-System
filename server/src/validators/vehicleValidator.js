const { body, param, query } = require('express-validator');
const { VEHICLE_STATUS } = require('../config/constants');

const createVehicleValidator = [
  body('plate_number')
    .trim()
    .notEmpty().withMessage('Plate number is required')
    .isLength({ max: 20 }).withMessage('Plate number must be under 20 characters'),

  body('make')
    .trim()
    .notEmpty().withMessage('Vehicle make is required')
    .isLength({ max: 50 }).withMessage('Make must be under 50 characters'),

  body('model')
    .trim()
    .notEmpty().withMessage('Vehicle model is required')
    .isLength({ max: 50 }).withMessage('Model must be under 50 characters'),

  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 2000, max: 2030 }).withMessage('Year must be between 2000 and 2030'),

  body('capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1, max: 100 }).withMessage('Capacity must be between 1 and 100'),

  body('status')
    .optional()
    .isIn(Object.values(VEHICLE_STATUS)).withMessage('Invalid vehicle status'),

  body('insurance_expiry')
    .optional({ nullable: true })
    .isISO8601().withMessage('Insurance expiry must be a valid date (YYYY-MM-DD)'),

  body('last_inspection_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('Last inspection date must be a valid date (YYYY-MM-DD)'),
];

const updateVehicleValidator = [
  param('id')
    .isUUID().withMessage('Invalid vehicle ID'),

  body('plate_number')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Plate number must be under 20 characters'),

  body('make')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Make must be under 50 characters'),

  body('model')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Model must be under 50 characters'),

  body('year')
    .optional()
    .isInt({ min: 2000, max: 2030 }).withMessage('Year must be between 2000 and 2030'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Capacity must be between 1 and 100'),

  body('status')
    .optional()
    .isIn(Object.values(VEHICLE_STATUS)).withMessage('Invalid vehicle status'),

  body('insurance_expiry')
    .optional({ nullable: true })
    .isISO8601().withMessage('Insurance expiry must be a valid date (YYYY-MM-DD)'),

  body('last_inspection_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('Last inspection date must be a valid date (YYYY-MM-DD)'),
];

const vehicleIdValidator = [
  param('id')
    .isUUID().withMessage('Invalid vehicle ID'),
];

const listVehiclesValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(Object.values(VEHICLE_STATUS)).withMessage('Invalid vehicle status'),

  query('search')
    .optional()
    .trim(),
];

module.exports = {
  createVehicleValidator,
  updateVehicleValidator,
  vehicleIdValidator,
  listVehiclesValidator,
};
