'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING } = Sequelize;
    await queryInterface.createTable('Depadmin', {
      departmentCode: {
        type: STRING(30),
        allowNull: false,
      },
      staffId: {
        type: STRING(16),
        allowNull: false,
      },
    });
    await queryInterface.addConstraint('Depadmin', ['departmentCode'], {
      type: 'foreign key',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
        table: 'Department',
        field: 'code',
      },
    });
    await queryInterface.addConstraint('Depadmin', ['staffId'], {
      type: 'foreign key',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
        table: 'Staff',
        field: 'id',
      },
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Depadmin');
  },
};
