const { body, param, query } = require('express-validator');
const { BOOKING_STATUS } = require('../config/constants');

const createBookingValidator = [
  body('student_id')
    .notEmpty().withMessage('Student ID is required')
    .isUUID().withMessage('Invalid student ID'),

  body('route_id')
    .notEmpty().withMessage('Route ID is required')
    .isUUID().withMessage('Invalid route ID'),

  body('pickup_time')
    .notEmpty().withMessage('Pickup time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .withMessage('Pickup time must be in HH:MM or HH:MM:SS format'),

  body('dropoff_time')
    .optional({ nullable: true })
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .withMessage('Dropoff time must be in HH:MM or HH:MM:SS format'),

  body('start_date')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      const start = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today) throw new Error('Start date cannot be in the past');
      return true;
    }),

  body('end_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('End date must be a valid date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.body.start_date && value) {
        const start = new Date(req.body.start_date);
        const end = new Date(value);
        if (end < start) throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('notes')
    .optional({ nullable: true })
    .trim(),
];

const updateBookingStatusValidator = [
  param('id')
    .isUUID().withMessage('Invalid booking ID'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(Object.values(BOOKING_STATUS)).withMessage('Invalid booking status'),

  body('vehicle_id')
    .optional({ nullable: true })
    .isUUID().withMessage('Invalid vehicle ID'),

  body('driver_id')
    .optional({ nullable: true })
    .isUUID().withMessage('Invalid driver ID'),
];

const bookingIdValidator = [
  param('id')
    .isUUID().withMessage('Invalid booking ID'),
];

const listBookingsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(Object.values(BOOKING_STATUS)).withMessage('Invalid booking status'),

  query('student_id')
    .optional()
    .isUUID().withMessage('Invalid student ID'),

  query('route_id')
    .optional()
    .isUUID().withMessage('Invalid route ID'),

  query('start_date')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date'),

  query('end_date')
    .optional()
    .isISO8601().withMessage('End date must be a valid date'),
];

module.exports = {
  createBookingValidator,
  updateBookingValidator: [
    param('id')
      .isUUID().withMessage('Invalid booking ID'),

    body('start_date')
      .optional()
      .isISO8601().withMessage('Start date must be a valid date (YYYY-MM-DD)')
      .custom((value) => {
        const start = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (start < today) throw new Error('Start date cannot be in the past');
        return true;
      }),

    body('end_date')
      .optional({ nullable: true })
      .isISO8601().withMessage('End date must be a valid date (YYYY-MM-DD)'),

    body('pickup_time')
      .optional()
      .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
      .withMessage('Pickup time must be in HH:MM or HH:MM:SS format'),

    body('dropoff_time')
      .optional({ nullable: true })
      .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
      .withMessage('Dropoff time must be in HH:MM or HH:MM:SS format'),

    body('notes')
      .optional({ nullable: true })
      .trim(),
  ],
  updateBookingStatusValidator,
  bookingIdValidator,
  listBookingsValidator,
};
