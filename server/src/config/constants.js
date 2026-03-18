module.exports = {
  ROLES: {
    PARENT: 'parent',
    ADMIN: 'admin',
  },

  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },

  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },

  PAYMENT_METHOD: {
    MPESA: 'mpesa',
    STRIPE: 'stripe',
  },

  VEHICLE_STATUS: {
    ACTIVE: 'active',
    MAINTENANCE: 'maintenance',
    INACTIVE: 'inactive',
  },

  DRIVER_STATUS: {
    AVAILABLE: 'available',
    ON_TRIP: 'on_trip',
    OFF_DUTY: 'off_duty',
  },
};
