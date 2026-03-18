const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Route = sequelize.define('Route', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: { msg: 'Route name already exists' },
    validate: {
      notEmpty: { msg: 'Route name is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  start_location: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Start location is required' },
    },
  },
  start_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  start_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  end_location: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'End location is required' },
    },
  },
  end_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  end_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  stops: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of { name, address, lat, lng, order }',
  },
  distance_km: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  estimated_duration_min: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Price cannot be negative' },
    },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'routes',
});

module.exports = Route;
