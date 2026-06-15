'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      booking_reference: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      route_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'routes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      vehicle_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'vehicles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'drivers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      pickup_time: { type: Sequelize.TIME, allowNull: false },
      dropoff_time: { type: Sequelize.TIME, allowNull: true },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: true },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'waitlisted'),
        allowNull: false,
        defaultValue: 'pending',
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      is_recurring: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      recurrence_pattern: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly'),
        allowNull: true,
      },
      recurrence_end_date: { type: Sequelize.DATEONLY, allowNull: true },
      // Self-referencing FK — table exists at this point, InnoDB accepts it
      parent_booking_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'bookings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('bookings', ['status', 'created_at']);
    await queryInterface.addIndex('bookings', ['route_id', 'status']);
    await queryInterface.addIndex('bookings', ['parent_id']);
    await queryInterface.addIndex('bookings', ['student_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bookings');
  },
};
