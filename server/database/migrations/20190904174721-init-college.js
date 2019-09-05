'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING } = Sequelize;
    await queryInterface.createTable('College', {
      code: {
        type: STRING(10),
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: STRING(50),
        allowNull: false,
      },
      shortName: {
        type: STRING(20),
        allowNull: false,
      },
      nameEn: {
        type: STRING(80),
        allowNull: false,
      },
      codeExtra: {
        type: STRING(10),
        allowNull: false,
      },
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('College');
  },
};
