const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const {
  createAnnouncementValidator,
  updateAnnouncementValidator,
  announcementIdValidator,
} = require('../validators/announcementValidator');

// All routes require auth
router.use(protect);

// Both parents and admins can list and view
router.get('/', getAnnouncements);
router.get('/:id', announcementIdValidator, validate, getAnnouncement);

// Admin-only
router.post('/', restrictTo('admin'), createAnnouncementValidator, validate, createAnnouncement);
router.put('/:id', restrictTo('admin'), updateAnnouncementValidator, validate, updateAnnouncement);
router.delete('/:id', restrictTo('admin'), announcementIdValidator, validate, deleteAnnouncement);

module.exports = router;
