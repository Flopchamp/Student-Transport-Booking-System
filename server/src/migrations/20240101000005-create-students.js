'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('students', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      first_name: { type: Sequelize.STRING(50), allowNull: false },
      last_name: { type: Sequelize.STRING(50), allowNull: false },
      date_of_birth: { type: Sequelize.DATEONLY, allowNull: false },
      school_name: { type: Sequelize.STRING(100), allowNull: false },
      grade: { type: Sequelize.STRING(20), allowNull: false },
      pickup_address: { type: Sequelize.STRING(255), allowNull: false },
      pickup_lat: { type: Sequelize.DECIMAL(10, 8), allowNull: true },
      pickup_lng: { type: Sequelize.DECIMAL(11, 8), allowNull: true },
      special_needs: { type: Sequelize.TEXT, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('students');
  },
};
