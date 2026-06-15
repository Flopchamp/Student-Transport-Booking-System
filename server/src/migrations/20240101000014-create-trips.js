'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('trips', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      trip_reference: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'drivers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      vehicle_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'vehicles', key: 'id' },
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
      status: {
        type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'scheduled',
      },
      scheduled_date: { type: Sequelize.DATEONLY, allowNull: false },
      scheduled_time: { type: Sequelize.TIME, allowNull: true },
      actual_start_time: { type: Sequelize.DATE, allowNull: true },
      actual_end_time: { type: Sequelize.DATE, allowNull: true },
      start_latitude: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      start_longitude: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      end_latitude: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      end_longitude: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      distance_covered_km: { type: Sequelize.DECIMAL(8, 2), allowNull: true },
      passenger_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('trips', ['driver_id', 'scheduled_date']);
    await queryInterface.addIndex('trips', ['status']);
    await queryInterface.addIndex('trips', ['route_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('trips');
  },
};
