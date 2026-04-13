const { body, param } = require('express-validator');

const createComplaintValidator = [
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ max: 200 }).withMessage('Subject must be at most 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  body('category')
    .optional()
    .isIn(['safety', 'delay', 'driver', 'vehicle', 'billing', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('booking_id')
    .optional()
    .isUUID().withMessage('Invalid booking ID'),
];

const respondComplaintValidator = [
  param('id').isUUID().withMessage('Invalid complaint ID'),
  body('admin_response')
    .optional()
    .trim()
    .notEmpty().withMessage('Response cannot be empty'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
];

const complaintIdValidator = [
  param('id').isUUID().withMessage('Invalid complaint ID'),
];

module.exports = {
  createComplaintValidator,
  respondComplaintValidator,
  complaintIdValidator,
};
