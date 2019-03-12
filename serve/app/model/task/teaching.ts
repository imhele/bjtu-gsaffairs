import { Application } from 'egg';
import { intEnumValid } from '../../errcode';
import { setModelInstanceMethods } from '../../utils';
import { DefineModelAttributes, DECIMAL, TINYINT, STRING, INTEGER } from 'sequelize';

export interface TaskTeaching<E extends boolean = false> {
  zxjxjhh: string;
  kch: string;
  kcm: string;
  kxh: string;
  jkzxs: number;
  student_type: E extends false ? string : number;
  krl: number;
  college_code: string;
  department_code: string;
  zxs: number;
}

export const attr: DefineModelAttributes<TaskTeaching> = {
  zxjxjhh: {
    allowNull: false,
    comment: '学年学期',
    type: STRING(20),
    validate: { len: [0, 20], notEmpty: true },
  },
  kch: {
    allowNull: false,
    comment: '课程号',
    type: STRING(10),
    validate: { len: [0, 10], notEmpty: true },
  },
  kcm: {
    allowNull: true,
    comment: '课程名',
    type: STRING(100),
    validate: { len: [0, 100] },
  },
  kxh: {
    allowNull: false,
    comment: '课序号',
    type: STRING(3),
    validate: { len: [0, 3], notEmpty: true },
  },
  jkzxs: {
    allowNull: true,
    comment: '授课总学时',
    type: DECIMAL,
    validate: { notEmpty: true },
  },
  student_type: {
    allowNull: true,
    comment: '课程学生类型',
    type: INTEGER,
    values: ['', '研究生课程', '本科生课程'],
    validate: { ...intEnumValid(3, 1) },
  },
  krl: {
    allowNull: true,
    comment: '课容量',
    type: INTEGER,
  },
  college_code: {
    allowNull: true,
    comment: '开课学院',
    type: STRING(10),
    validate: { len: [0, 10] },
  },
  department_code: {
    allowNull: true,
    comment: '负责单位',
    type: STRING(30),
    validate: { len: [0, 30] },
  },
  zxs: {
    allowNull: true,
    comment: '授课总学时',
    type: DECIMAL(4, 1),
    validate: { notEmpty: true },
  },
};

export default (app: Application) =>
  setModelInstanceMethods(
    app.model.define('TaskTeaching', attr, {
      tableName: 'task_teaching',
    }),
    attr,
  );
