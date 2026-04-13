const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reference: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: 'complaint_reference_unique',
    defaultValue: () => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `CMP-${timestamp}-${random}`;
    },
  },
  parent_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Optionally linked to a specific booking',
  },
  category: {
    type: DataTypes.ENUM('safety', 'delay', 'driver', 'vehicle', 'billing', 'other'),
    allowNull: false,
    defaultValue: 'other',
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    allowNull: false,
    defaultValue: 'open',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium',
  },
  admin_response: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'complaints',
});

module.exports = Complaint;
