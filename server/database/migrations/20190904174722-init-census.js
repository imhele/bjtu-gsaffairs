'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, STRING, TINYINT } = Sequelize;
    await queryInterface.createTable('Census', {
      id: {
        type: STRING(16),
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: STRING(50),
        allowNull: false,
      },
      studentType: {
        type: INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      gender: {
        type: TINYINT,
        allowNull: true,
        defaultValue: null,
      },
      collegeCode: {
        type: STRING(10),
        allowNull: false,
      },
      discipline: {
        type: STRING(80),
        allowNull: true,
        defaultValue: null,
      },
      schoolStatus: {
        type: STRING(2),
        allowNull: true,
        defaultValue: null,
      },
      countryStatus: {
        type: STRING(2),
        allowNull: true,
        defaultValue: null,
      },
      teacherCode: {
        type: STRING(16),
        allowNull: true,
        defaultValue: null,
      },
      teacher2Code: {
        type: STRING(16),
        allowNull: true,
        defaultValue: null,
      },
      ofYear: {
        type: STRING(4),
        allowNull: true,
        defaultValue: null,
      },
      isQrz: {
        type: TINYINT,
        allowNull: true,
        defaultValue: null,
      },
    });
    // await queryInterface.addConstraint('Census', ['collegeCode'], {
    //   type: 'foreign key',
    //   onDelete: 'RESTRICT',
    //   onUpdate: 'CASCADE',
    //   references: {
    //     table: 'College',
    //     field: 'code',
    //   },
    // });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Census');
  },
};
