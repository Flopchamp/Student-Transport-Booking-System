const { body, param, query } = require('express-validator');
const { PAYMENT_METHOD, PAYMENT_STATUS } = require('../config/constants');

const createPaymentValidator = [
  body('booking_id')
    .notEmpty().withMessage('Booking ID is required')
    .isUUID().withMessage('Invalid booking ID'),

  body('payment_method')
    .notEmpty().withMessage('Payment method is required')
    .isIn(Object.values(PAYMENT_METHOD)).withMessage('Invalid payment method. Must be one of: ' + Object.values(PAYMENT_METHOD).join(', ')),

  body('phone_number')
    .optional({ nullable: true })
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),

  body('card_token')
    .optional({ nullable: true })
    .isString().withMessage('Card token must be a string'),
];

const paymentIdValidator = [
  param('id')
    .isUUID().withMessage('Invalid payment ID'),
];

const listPaymentsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(Object.values(PAYMENT_STATUS)).withMessage('Invalid payment status'),

  query('booking_id')
    .optional()
    .isUUID().withMessage('Invalid booking ID'),
];

module.exports = {
  createPaymentValidator,
  paymentIdValidator,
  listPaymentsValidator,
};
