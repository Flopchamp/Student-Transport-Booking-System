const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createVehicleValidator,
  updateVehicleValidator,
  vehicleIdValidator,
  listVehiclesValidator,
} = require('../validators/vehicleValidator');
const {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');

const router = Router();

// All vehicle routes require authentication + admin role
router.use(protect, authorize('admin'));

router.post('/', createVehicleValidator, validate, createVehicle);
router.get('/', listVehiclesValidator, validate, getVehicles);
router.get('/:id', vehicleIdValidator, validate, getVehicle);
router.put('/:id', updateVehicleValidator, validate, updateVehicle);
router.delete('/:id', vehicleIdValidator, validate, deleteVehicle);

module.exports = router;
