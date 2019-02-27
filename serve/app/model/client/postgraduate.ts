import { Application } from 'egg';
import { isJson } from '../../errcode';
import { setModelInstanceMethods } from '../../utils';
import { DefineModelAttributes, DATE, STRING, TINYINT, TEXT } from 'sequelize';

export interface Postgraduate<E extends boolean = false> {
  loginname: string;
  password: string;
  username: string;
  is_active: number;
  last_login: string;
  audit_link: E extends false ? string | string[] : string;
}

export const attr: DefineModelAttributes<Postgraduate<true>> = {
  loginname: {
    allowNull: false,
    comment: '学号',
    primaryKey: true,
    type: STRING(12),
    validate: { len: [0, 12], notEmpty: true },
  },
  password: {
    allowNull: false,
    comment: '密码',
    type: STRING(128),
    validate: { len: [0, 128], notEmpty: true },
  },
  username: {
    allowNull: true,
    comment: '姓名',
    type: STRING(50),
    validate: { len: [0, 50] },
  },
  is_active: {
    allowNull: false,
    comment: '是否激活',
    type: TINYINT,
    validate: { isInt: true, max: 1 },
  },
  last_login: {
    allowNull: true,
    comment: '最后登录时间',
    type: DATE,
    validate: { isDate: true },
  },
  audit_link: {
    allowNull: true,
    comment: '审核环节',
    type: TEXT,
    validate: { notEmpty: true, isJson },
  },
};

export default (app: Application) =>
  setModelInstanceMethods(
    app.model.define('ClientPostgraduate', attr, {
      tableName: 'client_postgraduate',
    }),
    attr,
  );
