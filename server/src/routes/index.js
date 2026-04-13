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

module.exports = router;
