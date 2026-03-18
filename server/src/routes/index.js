const { Router } = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');

const router = Router();

// Health check
router.use('/health', healthRoutes);

// Authentication
router.use('/auth', authRoutes);

// Students
router.use('/students', studentRoutes);

// Future routes will be registered here:
// router.use('/routes', transportRoutes);
// router.use('/vehicles', vehicleRoutes);
// router.use('/drivers', driverRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/payments', paymentRoutes);

module.exports = router;
