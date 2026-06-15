'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehicles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      plate_number: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      make: { type: Sequelize.STRING(50), allowNull: false },
      model: { type: Sequelize.STRING(50), allowNull: false },
      year: { type: Sequelize.INTEGER, allowNull: false },
      capacity: { type: Sequelize.INTEGER, allowNull: false },
      status: {
        type: Sequelize.ENUM('active', 'maintenance', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      insurance_expiry: { type: Sequelize.DATEONLY, allowNull: true },
      last_inspection_date: { type: Sequelize.DATEONLY, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vehicles');
  },
};
