const { Router } = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');

const router = Router();

// Health check
router.use('/health', healthRoutes);

// Authentication
router.use('/auth', authRoutes);

// Future routes will be registered here:
// router.use('/students', studentRoutes);
// router.use('/routes', transportRoutes);
// router.use('/vehicles', vehicleRoutes);
// router.use('/drivers', driverRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/payments', paymentRoutes);

module.exports = router;
