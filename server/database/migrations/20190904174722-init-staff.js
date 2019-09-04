'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DATEONLY, STRING, TINYINT } = Sequelize;
    await queryInterface.createTable('Staff', {
      id: {
        type: STRING(16),
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: STRING(50),
        allowNull: false,
      },
      xmjp: {
        type: STRING(30),
        allowNull: true,
        defaultValue: null,
      },
      gender: {
        type: TINYINT,
        allowNull: true,
        defaultValue: null,
      },
      certificateType: {
        type: STRING(20),
        allowNull: true,
        defaultValue: null,
      },
      idcard: {
        type: STRING(18),
        allowNull: true,
        defaultValue: null,
      },
      birthday: {
        type: DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      nation: {
        type: STRING(20),
        allowNull: true,
        defaultValue: null,
      },
      nationality: {
        type: STRING(20),
        allowNull: true,
        defaultValue: null,
      },
      faction: {
        type: STRING(50),
        allowNull: true,
        defaultValue: null,
      },
      titleCode: {
        type: STRING(20),
        allowNull: true,
        defaultValue: null,
      },
      title: {
        type: STRING(20),
        allowNull: true,
        defaultValue: null,
      },
      headship: {
        type: STRING(20),
        allowNull: true,
        defaultValue: null,
      },
      degreeName: {
        type: STRING(8),
        allowNull: true,
        defaultValue: null,
      },
      degreeDate: {
        type: DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      educationName: {
        type: STRING(8),
        allowNull: true,
        defaultValue: null,
      },
      departmentCode: {
        type: STRING(10),
        allowNull: false,
      },
      department: {
        type: STRING(40),
        allowNull: true,
        defaultValue: null,
      },
      cellphone: {
        type: STRING(20),
        allowNull: true,
        defaultValue: null,
      },
      email: {
        type: STRING(50),
        allowNull: true,
        defaultValue: null,
      },
      isSchoolStaff: {
        type: TINYINT,
        allowNull: true,
        defaultValue: null,
      },
    });
    await queryInterface.addConstraint('Staff', ['departmentCode'], {
      type: 'foreign key',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      references: {
        table: 'Department',
        field: 'code',
      },
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Staff');
  },
};
