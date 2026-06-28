const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { ROLES } = require('../config/constants');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: { args: [8, 255], msg: 'Password must be at least 8 characters' },
    },
  },
  role: {
    type: DataTypes.ENUM(Object.values(ROLES)),
    defaultValue: ROLES.PARENT,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  reset_password_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  email_verification_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email_verification_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  sms_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  password_changed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
        user.password_changed_at = new Date();
      }
    },
  },
});

/**
 * Compare candidate password with stored hash.
 */
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Return user data without sensitive fields.
 */
User.prototype.toSafeJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.reset_password_token;
  delete values.reset_password_expires;
  delete values.email_verification_token;
  delete values.email_verification_expires;
  return values;
};

module.exports = User;
