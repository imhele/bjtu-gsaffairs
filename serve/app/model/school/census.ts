'school_census';
import { Application } from 'egg';
import { intEnumValid } from '../../errcode';
import { setModelInstanceMethods } from '../../utils';
import { DefineModelAttributes, TINYINT, STRING, INTEGER } from 'sequelize';

export interface SchoolCensus<E extends boolean = false> {
  number: string;
  name: string;
  student_type: E extends false ? string : number;
  sex: E extends false ? string : number;
  college_id?: string;
  discipline: string;
  school_status: string;
  country_status: string;
  teacher_code: string;
  teacher2_code: string;
  of_year: string;
  is_qrz: E extends false ? string : number;
}

export const attr: DefineModelAttributes<SchoolCensus> = {
  number: {
    allowNull: false,
    comment: '学号',
    primaryKey: true,
    type: STRING(12),
    validate: { len: [0, 12], notEmpty: true },
  },
  name: {
    allowNull: false,
    comment: '姓名',
    type: STRING(50),
    validate: { len: [0, 50], notEmpty: true },
  },
  student_type: {
    allowNull: true,
    comment: '学生类型',
    type: INTEGER,
    values: ['博士', '硕士', '推免生', '进修生'],
    validate: { ...intEnumValid(4) },
  },
  sex: {
    allowNull: true,
    comment: '性别',
    type: INTEGER,
    values: ['男', '女'],
    validate: { ...intEnumValid(2) },
  },
  discipline: {
    allowNull: true,
    comment: '学科（专业）',
    type: STRING(80),
    validate: { len: [0, 80] },
  },
  school_status: {
    allowNull: true,
    comment: '是否校内学籍',
    type: STRING(2),
    validate: { len: [0, 2] },
  },
  country_status: {
    allowNull: true,
    comment: '是否国家学籍',
    type: STRING(2),
    validate: { len: [0, 2] },
  },
  teacher_code: {
    allowNull: true,
    comment: '导师工资号',
    type: STRING(10),
    validate: { len: [0, 10] },
  },
  teacher2_code: {
    allowNull: true,
    comment: '导师 2 工资号',
    type: STRING(10),
    validate: { len: [0, 10] },
  },
  of_year: {
    allowNull: true,
    comment: '所在年级',
    type: STRING(4),
    validate: { len: [0, 4] },
  },
  is_qrz: {
    allowNull: true,
    comment: '是否全日制',
    type: TINYINT,
    values: ['否', '是'],
    validate: { ...intEnumValid(2) },
  },
};

export default (app: Application) => {
  const Model = app.model.define('SchoolCensus', attr, {
    tableName: 'school_census',
  });
  Model.associate = () => {
    app.model.School.Census.belongsTo(app.model.Dicts.College, {
      foreignKey: 'college_id',
    });
  };
  return setModelInstanceMethods(Model, attr);
};
