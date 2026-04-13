const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllTrips,
  getTripStats,
  getTripById,
  createTrip,
  cancelTrip,
} = require('../controllers/tripController');

const router = Router();

// All trip admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getTripStats);
router.get('/', getAllTrips);
router.get('/:id', getTripById);
router.post('/', createTrip);
router.patch('/:id/cancel', cancelTrip);

module.exports = router;
