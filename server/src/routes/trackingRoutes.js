const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  updateLocation,
  getVehicleLocation,
  getAllLocations,
  getMyVehicleLocations,
  getETAForBooking,
  getMyETAs,
} = require('../controllers/trackingController');

const router = Router();

// All tracking routes require authentication
router.use(protect);

// ─── Parent: ETA endpoints ──────────────────────────
router.get('/my-etas', getMyETAs);
router.get('/eta/:bookingId', getETAForBooking);

// ─── Parent: My vehicles' locations ─────────────────
router.get('/my-vehicles', getMyVehicleLocations);

// ─── Admin: All fleet locations ─────────────────────
router.get('/', authorize('admin'), getAllLocations);

// ─── Get single vehicle location ────────────────────
router.get('/:vehicleId', getVehicleLocation);

// ─── Update vehicle location (admin or driver) ──────
router.put('/:vehicleId', authorize('admin'), updateLocation);

module.exports = router;
