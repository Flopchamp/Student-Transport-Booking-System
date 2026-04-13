const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  seedSettings,
  getPublicSettings,
} = require('../controllers/settingController');

// Public — accessible without auth
router.get('/public', getPublicSettings);

// Admin-only
router.use(protect, authorize('admin'));
router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/seed', seedSettings);

module.exports = router;
