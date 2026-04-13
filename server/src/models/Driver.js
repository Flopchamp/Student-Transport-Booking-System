const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { DRIVER_STATUS } = require('../config/constants');

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    unique: true,
    comment: 'Links to User account for driver portal login',
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'First name is required' },
      len: { args: [2, 50], msg: 'First name must be 2-50 characters' },
    },
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Last name is required' },
      len: { args: [2, 50], msg: 'Last name must be 2-50 characters' },
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: { msg: 'Email already registered' },
    validate: {
      isEmail: { msg: 'Please provide a valid email' },
    },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Phone number is required' },
    },
  },
  license_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: { msg: 'License number already registered' },
    validate: {
      notEmpty: { msg: 'License number is required' },
    },
  },
  license_expiry: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: { msg: 'Please provide a valid date' },
    },
  },
  vehicle_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  route_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(Object.values(DRIVER_STATUS)),
    defaultValue: DRIVER_STATUS.AVAILABLE,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  profile_photo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'drivers',
});

module.exports = Driver;
