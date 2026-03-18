const { Router } = require('express');
const healthRoutes = require('./healthRoutes');

const router = Router();

// Health check
router.use('/health', healthRoutes);

// Future routes will be registered here:
// router.use('/auth', authRoutes);
// router.use('/students', studentRoutes);
// router.use('/routes', transportRoutes);
// router.use('/vehicles', vehicleRoutes);
// router.use('/drivers', driverRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/payments', paymentRoutes);

module.exports = router;
