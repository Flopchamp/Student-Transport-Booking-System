'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('drivers', 'email');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('drivers', 'email', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'last_name',
    });
  },
};
