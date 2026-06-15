'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehicle_locations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      // One location record per vehicle (upsert pattern)
      vehicle_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'vehicles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      latitude: { type: Sequelize.DECIMAL(10, 8), allowNull: false },
      longitude: { type: Sequelize.DECIMAL(11, 8), allowNull: false },
      speed: { type: Sequelize.DECIMAL(6, 2), allowNull: true, defaultValue: 0 },
      heading: { type: Sequelize.DECIMAL(5, 2), allowNull: true, defaultValue: 0 },
      is_moving: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      last_updated: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vehicle_locations');
  },
};
