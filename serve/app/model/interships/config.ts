/**
 * 暂时不使用，考虑添加到 middleware
 */
import { Application } from 'egg';
import { enumValid } from '../../errcode/validation';
import { setModelInstanceMethods } from '../../utils';
import { DefineModelAttributes, DATE, ENUM, TINYINT } from 'sequelize';

export interface IntershipsConfig {
  id?: number;
  semester: string;
  used: number;
  position_start: string;
  position_end: string;
  apply_start: string;
  apply_end: string;
}

export const attr: DefineModelAttributes<IntershipsConfig> = {
  semester: {
    allowNull: false,
    comment: '学年学期',
    type: ENUM,
    values: ['2018-2019学年 第一学期', '2018-2019学年 第二学期'],
    validate: {
      len: [0, 20],
      notEmpty: true,
      ...enumValid(['2018-2019学年 第一学期', '2018-2019学年 第二学期']),
    },
  },
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
    type: DATE,
    validate: { isDate: true, notEmpty: true },
  },
  position_end: {
    allowNull: false,
    comment: '岗位维护结束时间',
    type: DATE,
    validate: { isDate: true, notEmpty: true },
  },
  apply_start: {
    allowNull: false,
    comment: '学生申请开始时间',
    type: DATE,
    validate: { isDate: true, notEmpty: true },
  },
  apply_end: {
    allowNull: false,
    comment: '学生申请结束时间',
    type: DATE,
    validate: { isDate: true, notEmpty: true },
  },
};

export default (app: Application) =>
  setModelInstanceMethods(
    app.model.define('IntershipsConfig', attr, {
      tableName: 'interships_config',
    }),
    attr,
  );
