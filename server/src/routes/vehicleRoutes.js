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

// Read routes — any authenticated user
router.get('/', protect, listVehiclesValidator, validate, getVehicles);
router.get('/:id', protect, vehicleIdValidator, validate, getVehicle);

// Write routes — admin only
router.post('/', protect, authorize('admin'), createVehicleValidator, validate, createVehicle);
router.put('/:id', protect, authorize('admin'), updateVehicleValidator, validate, updateVehicle);
router.delete('/:id', protect, authorize('admin'), vehicleIdValidator, validate, deleteVehicle);

module.exports = router;
