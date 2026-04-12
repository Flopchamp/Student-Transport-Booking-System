const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { BOOKING_STATUS } = require('../config/constants');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  booking_reference: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: 'booking_reference_unique',
    defaultValue: () => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `BK-${timestamp}-${random}`;
    },
  },
  parent_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  route_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  vehicle_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  driver_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  pickup_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  dropoff_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: { msg: 'Please provide a valid start date' },
    },
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(Object.values(BOOKING_STATUS)),
    defaultValue: BOOKING_STATUS.PENDING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Amount cannot be negative' },
    },
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'bookings',
});

module.exports = Booking;
