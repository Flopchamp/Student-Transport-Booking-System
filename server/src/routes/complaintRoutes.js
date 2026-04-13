const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createComplaintValidator,
  respondComplaintValidator,
  complaintIdValidator,
} = require('../validators/complaintValidator');
const {
  createComplaint,
  getComplaints,
  getComplaint,
  respondToComplaint,
  getComplaintStats,
} = require('../controllers/complaintController');

const router = Router();

// All routes require authentication
router.use(protect);

// Admin stats (before :id to avoid conflict)
router.get('/stats', authorize('admin'), getComplaintStats);

// Parent + Admin
router.post('/', createComplaintValidator, validate, createComplaint);
router.get('/', getComplaints);
router.get('/:id', complaintIdValidator, validate, getComplaint);

// Admin only
router.patch('/:id/respond', authorize('admin'), respondComplaintValidator, validate, respondToComplaint);

module.exports = router;
