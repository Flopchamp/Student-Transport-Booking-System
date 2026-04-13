const { body, param } = require('express-validator');

exports.createAnnouncementValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),
  body('category')
    .optional()
    .isIn(['general', 'transport', 'payment', 'schedule', 'emergency'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('expires_at')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Invalid expiry date'),
];

exports.updateAnnouncementValidator = [
  param('id').isUUID().withMessage('Invalid announcement ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
  body('content')
    .optional()
    .trim(),
  body('category')
    .optional()
    .isIn(['general', 'transport', 'payment', 'schedule', 'emergency']),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent']),
  body('is_active')
    .optional()
    .isBoolean(),
];

exports.announcementIdValidator = [
  param('id').isUUID().withMessage('Invalid announcement ID'),
];
