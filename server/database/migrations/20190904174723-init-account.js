'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING } = Sequelize;
    await queryInterface.createTable('Account', {
      id: {
        type: STRING(16),
        allowNull: false,
        primaryKey: true,
      },
      loginAt: {
        type: INTEGER.UNSIGNED(),
        allowNull: false,
        defaultValue: 0,
      },
      password: {
        type: STRING(16),
        allowNull: false,
      },
      scope: {
        type: INTEGER.UNSIGNED(),
        allowNull: false,
        defaultValue: 0,
      },
      username: {
        type: STRING(50),
        allowNull: false,
      },
    });
    // await queryInterface.addConstraint('Account', ['accountId'], {
    //   type: 'primary key',
    //   name: 'PrimaryKey',
    // });
    // await queryInterface.addIndex('Account', { name: 'accountIdIndex', fields: ['accountId'] });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Account');
  },
};
