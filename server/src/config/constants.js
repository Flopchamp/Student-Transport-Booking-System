module.exports = {
  ROLES: {
    PARENT: 'parent',
    ADMIN: 'admin',
    DRIVER: 'driver',
  },

  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    WAITLISTED: 'waitlisted',
  },

  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    REFUND_REQUESTED: 'refund_requested',
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

  TRIP_STATUS: {
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
};
