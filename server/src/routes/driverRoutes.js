const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createDriverValidator,
  updateDriverValidator,
  driverIdValidator,
  listDriversValidator,
} = require('../validators/driverValidator');
const {
  createDriver,
  getDrivers,
  getDriver,
  updateDriver,
  deleteDriver,
  assignVehicle,
  assignRoute,
} = require('../controllers/driverController');

const router = Router();

// All driver routes require authentication + admin role
router.use(protect, authorize('admin'));

router.post('/', createDriverValidator, validate, createDriver);
router.get('/', listDriversValidator, validate, getDrivers);
router.get('/:id', driverIdValidator, validate, getDriver);
router.put('/:id', updateDriverValidator, validate, updateDriver);
router.delete('/:id', driverIdValidator, validate, deleteDriver);
router.patch('/:id/assign-vehicle', driverIdValidator, validate, assignVehicle);
router.patch('/:id/assign-route', driverIdValidator, validate, assignRoute);

module.exports = router;
