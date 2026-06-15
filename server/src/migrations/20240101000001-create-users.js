'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      first_name: { type: Sequelize.STRING(50), allowNull: false },
      last_name: { type: Sequelize.STRING(50), allowNull: false },
      email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(20), allowNull: false },
      password: { type: Sequelize.STRING(255), allowNull: false },
      role: {
        type: Sequelize.ENUM('parent', 'admin', 'driver'),
        allowNull: false,
        defaultValue: 'parent',
      },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      reset_password_token: { type: Sequelize.STRING(255), allowNull: true },
      reset_password_expires: { type: Sequelize.DATE, allowNull: true },
      email_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      email_verification_token: { type: Sequelize.STRING(255), allowNull: true },
      email_verification_expires: { type: Sequelize.DATE, allowNull: true },
      sms_notifications: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
