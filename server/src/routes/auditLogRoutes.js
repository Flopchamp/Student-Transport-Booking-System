const { Router } = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAuditLogs } = require('../controllers/auditLogController');

const router = Router();

// All routes require admin authentication
router.use(protect, authorize('admin'));

router.get('/', getAuditLogs);

module.exports = router;
