const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getUserStats, toggleUserStatus } = require('../controllers/userController');

const router = Router();

// All routes require admin authentication
router.use(protect, authorize('admin'));

// GET /users/stats — user statistics
router.get('/stats', getUserStats);

// GET /users — list all users
router.get('/', getUsers);

// PATCH /users/:id/toggle-status — activate/deactivate a user
router.patch('/:id/toggle-status', toggleUserStatus);

module.exports = router;
