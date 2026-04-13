const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TRIP_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  trip_reference: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: 'trip_reference_unique',
    defaultValue: () => {
      const ts = Date.now().toString(36).toUpperCase();
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `TR-${ts}-${rand}`;
    },
  },
  driver_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  vehicle_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  route_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(Object.values(TRIP_STATUS)),
    defaultValue: TRIP_STATUS.SCHEDULED,
    allowNull: false,
  },
  scheduled_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  scheduled_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  actual_start_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actual_end_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  start_latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  start_longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  end_latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  end_longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  distance_covered_km: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  passenger_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'trips',
  indexes: [
    { fields: ['driver_id', 'scheduled_date'] },
    { fields: ['status'] },
    { fields: ['route_id'] },
  ],
});

module.exports = Trip;
