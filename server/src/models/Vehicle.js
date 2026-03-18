const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { VEHICLE_STATUS } = require('../config/constants');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  plate_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: { msg: 'Plate number already registered' },
    validate: {
      notEmpty: { msg: 'Plate number is required' },
    },
  },
  make: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Vehicle make is required' },
    },
  },
  model: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Vehicle model is required' },
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [2000], msg: 'Year must be 2000 or later' },
      max: { args: [2030], msg: 'Year cannot exceed 2030' },
    },
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Capacity must be at least 1' },
    },
  },
  status: {
    type: DataTypes.ENUM(Object.values(VEHICLE_STATUS)),
    defaultValue: VEHICLE_STATUS.ACTIVE,
    allowNull: false,
  },
  insurance_expiry: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  last_inspection_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'vehicles',
});

module.exports = Vehicle;
