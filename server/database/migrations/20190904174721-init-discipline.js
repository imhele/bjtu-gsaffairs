'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {  STRING } = Sequelize;
    await queryInterface.createTable('Discipline', {
      code: {
        type: STRING(20),
        allowNull: false,
        primaryKey: true,
      },
      upcodeId: {
        type: STRING(20),
        allowNull: true,
        defaultValue: null,
      },
      name: {
        type: STRING(80),
        allowNull: false,
      },
      nameEn: {
        type: STRING(200),
        allowNull: true,
        defaultValue: null,
      },
      nameFormal: {
        type: STRING(80),
        allowNull: true,
        defaultValue: null,
      },
      isPro: {
        type: TINYINT,
        allowNull: false,
      },
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Discipline');
  },
};
