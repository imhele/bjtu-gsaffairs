import { Application } from 'egg';
import { intEnumValid } from '../../errcode';
import { setModelInstanceMethods } from '../../utils';
import { DefineModelAttributes, DATEONLY, STRING, TINYINT } from 'sequelize';

export interface StaffInfo {
  jobnum: string;
  name: string;
  xmjp: string;
  gender: number;
  certificate_type: number;
  idcard: string;
  birthday: string;
  nation: string;
  nationality: string;
  faction: string;
  title_code: string;
  title: string;
  headship: string;
  degree_name: string;
  degree_date: string;
  education_name: string;
  department_code: string;
  department: string;
  cellphone: string;
  email: string;
  is_school_staff: number;
}

export const attr: DefineModelAttributes<StaffInfo> = {
  jobnum: {
    allowNull: false,
    comment: '工号',
    primaryKey: true,
    type: STRING(12),
    validate: { len: [0, 12], notEmpty: true },
  },
  name: {
    allowNull: false,
    comment: '姓名',
    type: STRING(20),
    validate: { len: [0, 20], notEmpty: true },
  },
  xmjp: {
    allowNull: true,
    comment: '姓名简拼',
    type: STRING(30),
    validate: { len: [0, 30] },
  },
  gender: {
    allowNull: true,
    comment: '性别',
    type: TINYINT,
    values: ['男', '女'],
    validate: { ...intEnumValid(2) },
  },
  certificate_type: {
    allowNull: true,
    comment: '证件类型',
    type: STRING(20),
    validate: { len: [0, 20] },
  },
  idcard: {
    allowNull: true,
    comment: '证件号码',
    type: STRING(18),
    validate: { len: [0, 18] },
  },
  birthday: {
    allowNull: true,
    comment: '出生日期',
    type: DATEONLY,
    validate: { isDate: true },
  },
  nation: {
    allowNull: true,
    comment: '民族',
    type: STRING(20),
    validate: { len: [0, 20] },
  },
  nationality: {
    allowNull: true,
    comment: '国籍',
    type: STRING(20),
    validate: { len: [0, 20] },
  },
  faction: {
    allowNull: true,
    comment: '政治面貌',
    type: STRING(50),
    validate: { len: [0, 50] },
  },
  title_code: {
    allowNull: true,
    comment: '职称编号',
    type: STRING(20),
    validate: { len: [0, 20] },
  },
  title: {
    allowNull: true,
    comment: '职称名称',
    type: STRING(20),
    validate: { len: [0, 20] },
  },
  headship: {
    allowNull: true,
    comment: '行政职务',
    type: STRING(20),
    validate: { len: [0, 20] },
  },
  degree_name: {
    allowNull: true,
    comment: '最高学位名称',
    type: STRING(8),
    validate: { len: [0, 8] },
  },
  degree_date: {
    allowNull: true,
    comment: '最高学位获取时间',
    type: DATEONLY,
    validate: { isDate: true },
  },
  education_name: {
    allowNull: true,
    comment: '学历名称',
    type: STRING(8),
    validate: { len: [0, 8] },
  },
  department_code: {
    allowNull: true,
    comment: '学历名称',
    type: STRING(10),
    validate: { len: [0, 10] },
  },
  department: {
    allowNull: true,
    comment: '部门名称',
    type: STRING(40),
    validate: { len: [0, 40] },
  },
  cellphone: {
    allowNull: true,
    comment: '手机号',
    type: STRING(20),
    validate: { len: [0, 20] },
  },
  email: {
    allowNull: true,
    comment: 'email',
    type: STRING(50),
    validate: { len: [0, 50], isEmail: true },
  },
  is_school_staff: {
    allowNull: true,
    comment: '人事单位是否本校',
    type: TINYINT,
    values: ['是', '否'],
    validate: { ...intEnumValid(2) },
  },
};

export default (app: Application) =>
  setModelInstanceMethods(
    app.model.define('PeopleStaff', attr, { tableName: 'people_staff' }),
    attr,
  );
