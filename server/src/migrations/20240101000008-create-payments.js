'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      transaction_reference: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'bookings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'KES' },
      payment_method: {
        type: Sequelize.ENUM('mpesa', 'stripe'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded', 'refund_requested'),
        allowNull: false,
        defaultValue: 'pending',
      },
      mpesa_receipt_number: { type: Sequelize.STRING(50), allowNull: true },
      stripe_payment_intent_id: { type: Sequelize.STRING(100), allowNull: true },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      failure_reason: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('payments', ['booking_id', 'status']);
    await queryInterface.addIndex('payments', ['parent_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  },
};
