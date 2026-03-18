const { body, param, query } = require('express-validator');

const createRouteValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Route name is required')
    .isLength({ max: 100 }).withMessage('Route name must be under 100 characters'),

  body('description')
    .optional({ nullable: true })
    .trim(),

  body('start_location')
    .trim()
    .notEmpty().withMessage('Start location is required')
    .isLength({ max: 255 }).withMessage('Start location must be under 255 characters'),

  body('start_lat')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }).withMessage('Start latitude must be between -90 and 90'),

  body('start_lng')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }).withMessage('Start longitude must be between -180 and 180'),

  body('end_location')
    .trim()
    .notEmpty().withMessage('End location is required')
    .isLength({ max: 255 }).withMessage('End location must be under 255 characters'),

  body('end_lat')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }).withMessage('End latitude must be between -90 and 90'),

  body('end_lng')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }).withMessage('End longitude must be between -180 and 180'),

  body('stops')
    .optional({ nullable: true })
    .isArray().withMessage('Stops must be an array'),

  body('stops.*.name')
    .optional()
    .trim()
    .notEmpty().withMessage('Stop name is required'),

  body('stops.*.address')
    .optional()
    .trim()
    .notEmpty().withMessage('Stop address is required'),

  body('stops.*.order')
    .optional()
    .isInt({ min: 0 }).withMessage('Stop order must be a non-negative integer'),

  body('distance_km')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Distance must be a positive number'),

  body('estimated_duration_min')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
];

const updateRouteValidator = [
  param('id')
    .isUUID().withMessage('Invalid route ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Route name must be under 100 characters'),

  body('description')
    .optional({ nullable: true })
    .trim(),

  body('start_location')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Start location must be under 255 characters'),

  body('start_lat')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }).withMessage('Start latitude must be between -90 and 90'),

  body('start_lng')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }).withMessage('Start longitude must be between -180 and 180'),

  body('end_location')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('End location must be under 255 characters'),

  body('end_lat')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }).withMessage('End latitude must be between -90 and 90'),

  body('end_lng')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }).withMessage('End longitude must be between -180 and 180'),

  body('stops')
    .optional({ nullable: true })
    .isArray().withMessage('Stops must be an array'),

  body('distance_km')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Distance must be a positive number'),

  body('estimated_duration_min')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
];

const routeIdValidator = [
  param('id')
    .isUUID().withMessage('Invalid route ID'),
];

const listRoutesValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim(),

  query('min_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Min price must be non-negative'),

  query('max_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Max price must be non-negative'),
];

module.exports = {
  createRouteValidator,
  updateRouteValidator,
  routeIdValidator,
  listRoutesValidator,
};
