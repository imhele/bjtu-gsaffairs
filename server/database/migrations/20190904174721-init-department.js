'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, STRING, TINYINT } = Sequelize;
    await queryInterface.createTable('Department', {
      code: {
        type: STRING(30),
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: STRING(50),
        allowNull: false,
      },
      shortName: {
        type: STRING(50),
        allowNull: false,
      },
      parent: {
        type: STRING(30),
        allowNull: false,
      },
      level: {
        type: INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      used: {
        type: TINYINT,
        allowNull: false,
      },
      szdwh: {
        type: STRING(30),
        allowNull: false,
      },
      affairsUsed: {
        type: TINYINT,
        allowNull: false,
      },
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Department');
  },
};
