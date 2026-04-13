const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createRouteValidator,
  updateRouteValidator,
  routeIdValidator,
  listRoutesValidator,
} = require('../validators/routeValidator');
const {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  deleteRoute,
  activateRoute,
  getRoutePrice,
} = require('../controllers/routeController');

const router = Router();

// All routes require authentication
router.use(protect);

// ─── Parent + Admin (read) ──────────────────────────
router.get('/', listRoutesValidator, validate, getRoutes);
router.get('/:id', routeIdValidator, validate, getRoute);
router.get('/:id/price', routeIdValidator, validate, getRoutePrice);

// ─── Admin Only (write) ─────────────────────────────
router.post('/', authorize('admin'), createRouteValidator, validate, createRoute);
router.put('/:id', authorize('admin'), updateRouteValidator, validate, updateRoute);
router.delete('/:id', authorize('admin'), routeIdValidator, validate, deleteRoute);
router.patch('/:id/activate', authorize('admin'), routeIdValidator, validate, activateRoute);

module.exports = router;
