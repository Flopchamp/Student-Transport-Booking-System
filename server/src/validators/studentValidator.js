const { body, param, query } = require('express-validator');

const createStudentValidator = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),

  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),

  body('date_of_birth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      const dob = new Date(value);
      const now = new Date();
      if (dob >= now) throw new Error('Date of birth must be in the past');
      const age = (now - dob) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 3) throw new Error('Student must be at least 3 years old');
      if (age > 25) throw new Error('Student must be under 25 years old');
      return true;
    }),

  body('school_name')
    .trim()
    .notEmpty().withMessage('School name is required')
    .isLength({ max: 100 }).withMessage('School name must be under 100 characters'),

  body('grade')
    .trim()
    .notEmpty().withMessage('Grade is required')
    .isLength({ max: 20 }).withMessage('Grade must be under 20 characters'),

  body('pickup_address')
    .trim()
    .notEmpty().withMessage('Pickup address is required')
    .isLength({ max: 255 }).withMessage('Pickup address must be under 255 characters'),

  body('pickup_lat')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }).withMessage('Pickup latitude must be between -90 and 90'),

  body('pickup_lng')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }).withMessage('Pickup longitude must be between -180 and 180'),

  body('special_needs')
    .optional({ nullable: true })
    .trim(),
];

const updateStudentValidator = [
  param('id')
    .isUUID().withMessage('Invalid student ID'),

  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),

  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),

  body('date_of_birth')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      const dob = new Date(value);
      const now = new Date();
      if (dob >= now) throw new Error('Date of birth must be in the past');
      const age = (now - dob) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 3) throw new Error('Student must be at least 3 years old');
      if (age > 25) throw new Error('Student must be under 25 years old');
      return true;
    }),

  body('school_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('School name must be under 100 characters'),

  body('grade')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Grade must be under 20 characters'),

  body('pickup_address')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Pickup address must be under 255 characters'),

  body('pickup_lat')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }).withMessage('Pickup latitude must be between -90 and 90'),

  body('pickup_lng')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }).withMessage('Pickup longitude must be between -180 and 180'),

  body('special_needs')
    .optional({ nullable: true })
    .trim(),
];

const studentIdValidator = [
  param('id')
    .isUUID().withMessage('Invalid student ID'),
];

const listStudentsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim(),

  query('school_name')
    .optional()
    .trim(),

  query('grade')
    .optional()
    .trim(),
];

module.exports = {
  createStudentValidator,
  updateStudentValidator,
  studentIdValidator,
  listStudentsValidator,
};
