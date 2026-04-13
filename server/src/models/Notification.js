const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('booking', 'payment', 'system', 'announcement', 'complaint', 'tracking'),
    defaultValue: 'system',
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Optional link to navigate to when notification is clicked',
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'notifications',
  indexes: [
    { fields: ['user_id', 'is_read'] },
    { fields: ['user_id', 'createdAt'] },
  ],
});

module.exports = Notification;
