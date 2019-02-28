import { Application } from 'egg';
import { setModelInstanceMethods } from '../../utils';
import { isJson, intEnumValid } from '../../errcode/validation';
import { DefineModelAttributes, STRING, TEXT, INTEGER } from 'sequelize';

export interface IntershipsStuapply<E extends boolean = false> {
  id?: number;
  student_number?: string;
  phone: number;
  email: string;
  award_level: string;
  english: string;
  computer: string;
  resume: string;
  award_ex: string;
  experiments: string;
  favor: string;
  other: string;
  status: E extends false ? string : number;
  audit: E extends false ? string : number;
  audit_log: string;
  position_id?: number;
}

export const ApplyStatus = {
  待审核: 'process',
  审核通过: 'finish',
  废除: 'error',
  草稿: 'process',
};

export const ApplyAuditStatus = ['学生申请', '导师确认', '用人单位审核', '研工部审核', '申请成功'];

export const attr: DefineModelAttributes<IntershipsStuapply<true>> = {
  phone: {
    allowNull: false,
    comment: '联系电话',
    type: STRING(20),
    validate: { len: [0, 20], notEmpty: true },
  },
  email: {
    allowNull: false,
    comment: '电子邮件',
    type: STRING,
    validate: { len: [0, 255], isEmail: true, notEmpty: true },
  },
  award_level: {
    allowNull: false,
    comment: '奖学金等级',
    type: STRING,
    validate: { len: [0, 255], notEmpty: true },
  },
  english: {
    allowNull: false,
    comment: '外语水平',
    type: STRING,
    validate: { len: [0, 255], notEmpty: true },
  },
  computer: {
    allowNull: false,
    comment: '计算机水平',
    type: STRING,
    validate: { len: [0, 255], notEmpty: true },
  },
  resume: {
    allowNull: false,
    comment: '个人简历',
    type: TEXT,
    validate: { notEmpty: true },
  },
  experiments: {
    allowNull: false,
    comment: '工作经验及科研情况',
    type: TEXT,
    validate: { notEmpty: true },
  },
  award_ex: {
    allowNull: true,
    comment: '社会工作及获奖经历',
    type: TEXT,
  },
  favor: {
    allowNull: true,
    comment: '业余爱好',
    type: TEXT,
  },
  other: {
    allowNull: true,
    comment: '其他说明',
    type: TEXT,
  },
  status: {
    allowNull: false,
    comment: '状态',
    type: INTEGER,
    defaultValue: 0,
    values: Object.keys(ApplyStatus),
    validate: { notEmpty: true, ...intEnumValid(ApplyStatus) },
  },
  audit: {
    allowNull: false,
    comment: '审核进度',
    type: INTEGER,
    defaultValue: 0,
    values: ApplyAuditStatus,
    validate: { notEmpty: true, ...intEnumValid(ApplyAuditStatus) },
  },
  audit_log: {
    allowNull: true,
    comment: '审核日志',
    type: TEXT,
    defaultValue: JSON.stringify([]),
    validate: { isJson },
  },
};

export default (app: Application) => {
  const Model = app.model.define('IntershipsStuapply', attr, {
    tableName: 'interships_stuapply',
  });
  Model.associate = () => {
    app.model.Interships.Stuapply.belongsTo(app.model.Interships.Position, {
      foreignKey: 'position_id',
    });
    app.model.Interships.Stuapply.belongsTo(app.model.School.Census, {
      foreignKey: 'student_number',
    });
  };
  return setModelInstanceMethods(Model, attr);
};
