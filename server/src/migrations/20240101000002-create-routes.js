'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('routes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      start_location: { type: Sequelize.STRING(255), allowNull: false },
      start_lat: { type: Sequelize.DECIMAL(10, 8), allowNull: true },
      start_lng: { type: Sequelize.DECIMAL(11, 8), allowNull: true },
      end_location: { type: Sequelize.STRING(255), allowNull: false },
      end_lat: { type: Sequelize.DECIMAL(10, 8), allowNull: true },
      end_lng: { type: Sequelize.DECIMAL(11, 8), allowNull: true },
      stops: { type: Sequelize.JSON, allowNull: true },
      distance_km: { type: Sequelize.DECIMAL(8, 2), allowNull: true },
      estimated_duration_min: { type: Sequelize.INTEGER, allowNull: true },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      pricing_type: {
        type: Sequelize.ENUM('flat', 'per_km', 'zone'),
        allowNull: false,
        defaultValue: 'flat',
      },
      base_price: { type: Sequelize.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
      price_per_km: { type: Sequelize.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
      zone_prices: { type: Sequelize.JSON, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('routes');
  },
};
