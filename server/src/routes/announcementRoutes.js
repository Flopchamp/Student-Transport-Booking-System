const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
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
router.post('/', authorize('admin'), createAnnouncementValidator, validate, createAnnouncement);
router.put('/:id', authorize('admin'), updateAnnouncementValidator, validate, updateAnnouncement);
router.delete('/:id', authorize('admin'), announcementIdValidator, validate, deleteAnnouncement);

module.exports = router;
