const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { PAYMENT_STATUS, PAYMENT_METHOD } = require('../config/constants');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  transaction_reference: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: 'transaction_reference_unique',
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  parent_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Amount cannot be negative' },
    },
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'KES',
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.ENUM(Object.values(PAYMENT_METHOD)),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(Object.values(PAYMENT_STATUS)),
    defaultValue: PAYMENT_STATUS.PENDING,
    allowNull: false,
  },
  mpesa_receipt_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  stripe_payment_intent_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  failure_reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'payments',
  hooks: {
    beforeCreate: (payment) => {
      if (!payment.transaction_reference) {
        const prefix = payment.payment_method === 'mpesa' ? 'MP' : 'ST';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        payment.transaction_reference = `${prefix}-${timestamp}-${random}`;
      }
    },
  },
});

module.exports = Payment;
