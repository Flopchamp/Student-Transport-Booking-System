const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleLocation = sequelize.define('VehicleLocation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  vehicle_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: 'vehicle_location_unique', // One active record per vehicle
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  speed: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Speed in km/h',
  },
  heading: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Compass heading in degrees (0-360)',
  },
  is_moving: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  last_updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
}, {
  tableName: 'vehicle_locations',
});

module.exports = VehicleLocation;
