const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  seedSettings,
  getPublicSettings,
} = require('../controllers/settingController');

// Public — accessible without auth
router.get('/public', getPublicSettings);

// Admin-only
router.use(protect, restrictTo('admin'));
router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/seed', seedSettings);

module.exports = router;
