'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING } = Sequelize;
    await queryInterface.createTable('Account', {
      accountId: {
        type: STRING(18),
        allowNull: false,
      },
      secret: {
        type: STRING(22),
        allowNull: false,
      },
    });
    await queryInterface.addConstraint('Account', ['accountId'], {
      type: 'primary key',
      name: 'PrimaryKey',
    });
    // await queryInterface.addIndex('Account', { name: 'accountIdIndex', fields: ['accountId'] });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Account');
  },
};
