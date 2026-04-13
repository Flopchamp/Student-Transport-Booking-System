const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string',
  },
  category: {
    type: DataTypes.ENUM('general', 'booking', 'payment', 'notification', 'system'),
    defaultValue: 'general',
  },
  label: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'settings',
  timestamps: true,
  updatedAt: 'updatedAt',
  createdAt: 'createdAt',
});

// Default settings seed helper
Setting.seedDefaults = async () => {
  const defaults = [
    // General
    { key: 'site_name', value: 'EduTrans', type: 'string', category: 'general', label: 'Site Name', description: 'The name displayed in the application header.' },
    { key: 'support_email', value: 'support@edutrans.com', type: 'string', category: 'general', label: 'Support Email', description: 'Email shown to parents for support contact.' },
    { key: 'support_phone', value: '+254 700 000000', type: 'string', category: 'general', label: 'Support Phone', description: 'Phone number shown for support.' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', label: 'Maintenance Mode', description: 'When enabled, parents cannot make new bookings.' },

    // Booking
    { key: 'max_bookings_per_student', value: '3', type: 'number', category: 'booking', label: 'Max Bookings per Student', description: 'Maximum active bookings allowed per student.' },
    { key: 'booking_advance_days', value: '30', type: 'number', category: 'booking', label: 'Advance Booking Days', description: 'How many days in advance parents can book.' },
    { key: 'auto_cancel_unpaid_hours', value: '48', type: 'number', category: 'booking', label: 'Auto-Cancel Unpaid (hours)', description: 'Unpaid bookings auto-cancel after this many hours. Set 0 to disable.' },
    { key: 'allow_weekend_bookings', value: 'false', type: 'boolean', category: 'booking', label: 'Allow Weekend Bookings', description: 'Allow parents to select weekend pickup/drop-off.' },

    // Payment
    { key: 'currency', value: 'KES', type: 'string', category: 'payment', label: 'Currency Code', description: 'ISO 4217 currency code for all payments.' },
    { key: 'tax_rate', value: '0', type: 'number', category: 'payment', label: 'Tax Rate (%)', description: 'Tax percentage applied to booking payments.' },
    { key: 'allow_partial_payment', value: 'false', type: 'boolean', category: 'payment', label: 'Allow Partial Payment', description: 'Allow parents to pay in installments.' },

    // Notification
    { key: 'email_notifications_enabled', value: 'true', type: 'boolean', category: 'notification', label: 'Email Notifications', description: 'Enable or disable email notifications globally.' },
    { key: 'admin_notification_email', value: '', type: 'string', category: 'notification', label: 'Admin Notification Email', description: 'Email to receive admin notifications. Leave empty to use admin account email.' },

    // System
    { key: 'pagination_limit', value: '20', type: 'number', category: 'system', label: 'Default Page Size', description: 'Default number of items per page in tables.' },
    { key: 'session_timeout_minutes', value: '480', type: 'number', category: 'system', label: 'Session Timeout (min)', description: 'JWT token expiry in minutes.' },
  ];

  for (const setting of defaults) {
    await Setting.findOrCreate({ where: { key: setting.key }, defaults: setting });
  }
};

module.exports = Setting;
