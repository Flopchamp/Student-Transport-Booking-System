const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'e.g. booking.status_change, payment.refund, user.toggle_status',
  },
  entity_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'e.g. booking, payment, user, vehicle, driver, route',
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional context — old/new values, etc.',
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
}, {
  tableName: 'audit_logs',
  updatedAt: false, // Audit logs are immutable
});

module.exports = AuditLog;
