import { Application } from 'egg';
import { filtersMap } from '../../controller/positionFilter';
import { isJson } from '../../errcode';
import { setModelInstanceMethods } from '../../utils';
import { DefineModelAttributes, INTEGER, TEXT, TINYINT } from 'sequelize';

export interface IntershipsConfig {
  id?: number;
  used: number;
  position_start: number;
  position_end: number;
  apply_start: number;
  apply_end: number;
  max_workload: number;
  available_semesters: string[];
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
  available_semesters: {
    allowNull: true,
    comment: '可选学期',
    type: TEXT,
    validate: { notEmpty: true, isJson },
  },
};

export default (app: Application) => {
  const Model = setModelInstanceMethods(
    app.model.define('IntershipsConfig', attr, {
      tableName: 'interships_config',
    }),
    attr,
  );
  Model.associate = async () => {
    /* 后端启动时，从数据库取出可选的学期选项，添加到 `filtersMap` 中 */
    const config = await app.model.Interships.Config.findOne();
    const semesters = JSON.parse((config && config.get('available_semesters')) || '[]');
    filtersMap.semester!.selectOptions = semesters.map((value: string) => ({ value }));
  };
  return Model;
};
