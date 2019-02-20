import { Application } from 'egg';
import { DefineModelAttributes, INTEGER, TINYINT, STRING } from 'sequelize';

export interface Department {
  code: string;
  name: string;
  short_name: string;
  parent: string;
  level: number;
  used: number;
  szdwh: string;
}

export const attr: DefineModelAttributes<Department> = {
  code: {
    allowNull: false,
    primaryKey: true,
    comment: '单位代码',
    type: STRING(30),
  },
  name: {
    allowNull: false,
    comment: '单位名称',
    type: STRING(50),
  },
  short_name: {
    allowNull: false,
    comment: '单位简称',
    type: STRING(50),
  },
  parent: {
    allowNull: false,
    comment: '父单位号',
    type: STRING(30),
  },
  level: {
    allowNull: true,
    comment: '单位级别',
    type: INTEGER,
  },
  used: {
    allowNull: false,
    comment: '是否启用',
    type: TINYINT(1),
  },
  szdwh: {
    allowNull: false,
    type: STRING(30),
  },
};

export default (app: Application) =>
  app.model.define('Department', attr, {
    tableName: 'dicts_department',
  });
