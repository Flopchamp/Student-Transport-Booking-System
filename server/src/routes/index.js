const { Router } = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const transportRoutes = require('./transportRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const driverRoutes = require('./driverRoutes');
const bookingRoutes = require('./bookingRoutes');

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

// Future routes will be registered here:
// router.use('/payments', paymentRoutes);

module.exports = router;
