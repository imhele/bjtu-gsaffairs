'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, STRING } = Sequelize;
    await queryInterface.createTable('Account', {
      id: {
        type: STRING(16),
        allowNull: false,
        primaryKey: true,
      },
      censusId: {
        type: STRING(16),
        allowNull: true,
        defaultValue: null,
      },
      loginAt: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      name: {
        type: STRING(50),
        allowNull: false,
      },
      password: {
        type: STRING(16),
        allowNull: false,
      },
      scope: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      staffId: {
        type: STRING(16),
        allowNull: true,
        defaultValue: null,
      },
    });
    // await queryInterface.addConstraint('Account', ['id'], {
    //   type: 'primary key',
    //   name: 'PrimaryKey',
    // });
    // await queryInterface.addIndex('Account', { name: 'idIndex', fields: ['id'] });
    await queryInterface.addConstraint('Account', ['censusId'], {
      type: 'foreign key',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      references: {
        table: 'Census',
        field: 'id',
      },
    });
    await queryInterface.addConstraint('Account', ['staffId'], {
      type: 'foreign key',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      references: {
        table: 'Staff',
        field: 'id',
      },
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('Account');
  },
};
