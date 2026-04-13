const { Router } = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const transportRoutes = require('./transportRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const driverRoutes = require('./driverRoutes');
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');
const userRoutes = require('./userRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const auditLogRoutes = require('./auditLogRoutes');
const complaintRoutes = require('./complaintRoutes');
const settingRoutes = require('./settingRoutes');
const announcementRoutes = require('./announcementRoutes');
const trackingRoutes = require('./trackingRoutes');
const notificationRoutes = require('./notificationRoutes');
const driverPortalRoutes = require('./driverPortalRoutes');

const router = Router();

// Health check
router.use('/health', healthRoutes);

// Authentication
router.use('/auth', authRoutes);

// Students
router.use('/students', studentRoutes);

// Transport routes
router.use('/routes', transportRoutes);

// Vehicles (admin)
router.use('/vehicles', vehicleRoutes);

// Drivers (admin)
router.use('/drivers', driverRoutes);

// Bookings
router.use('/bookings', bookingRoutes);

// Payments
router.use('/payments', paymentRoutes);

// Users (admin)
router.use('/users', userRoutes);

// Analytics (admin)
router.use('/analytics', analyticsRoutes);

// Audit Logs (admin)
router.use('/audit-logs', auditLogRoutes);

// Complaints
router.use('/complaints', complaintRoutes);

// Settings
router.use('/settings', settingRoutes);

// Announcements
router.use('/announcements', announcementRoutes);

// GPS Tracking
router.use('/tracking', trackingRoutes);

// Notifications
router.use('/notifications', notificationRoutes);

// Driver Portal
router.use('/driver-portal', driverPortalRoutes);

module.exports = router;
