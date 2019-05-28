import { Application } from 'egg';
import { setModelInstanceMethods } from '../../utils';
import { DefineModelAttributes, INTEGER, TINYINT } from 'sequelize';

export interface IntershipsConfig {
  id?: number;
  used: number;
  position_start: number;
  position_end: number;
  apply_start: number;
  apply_end: number;
  max_workload: number;
}

export const attr: DefineModelAttributes<IntershipsConfig> = {
  used: {
    allowNull: false,
    comment: '是否启用',
    type: TINYINT,
    defaultValue: 1,
    validate: { isInt: true, notEmpty: true },
  },
  position_start: {
    allowNull: false,
    comment: '岗位维护开始时间',
    type: INTEGER,
    validate: { notEmpty: true },
  },
  position_end: {
    allowNull: false,
    comment: '岗位维护结束时间',
    type: INTEGER,
    validate: { notEmpty: true },
  },
  apply_start: {
    allowNull: false,
    comment: '学生申请开始时间',
    type: INTEGER,
    validate: { notEmpty: true },
  },
  apply_end: {
    allowNull: false,
    comment: '学生申请结束时间',
    type: INTEGER,
    validate: { notEmpty: true },
  },
  max_workload: {
    allowNull: false,
    comment: '最大月工作量',
    type: INTEGER,
    defaultValue: 40,
    validate: { notEmpty: true },
  },
};

export default (app: Application) =>
  setModelInstanceMethods(
    app.model.define('IntershipsConfig', attr, {
      tableName: 'interships_config',
    }),
    attr,
  );
