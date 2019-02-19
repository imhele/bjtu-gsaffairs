import { Application } from 'egg';
import { DefineModelAttributes } from 'sequelize';

export interface Staff {
  loginname: string;
  password: string;
  username: string;
  is_active: number;
  last_login: string;
}

export default (app: Application) => {
  const { DATE, STRING, TINYINT } = app.Sequelize;
  const attributes: DefineModelAttributes<Staff> = {
    loginname: {
      allowNull: false,
      comment: '工号',
      primaryKey: true,
      type: STRING(50),
      validate: { len: [0, 50], notEmpty: true },
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
  };
  return app.model.define('Staff', attributes, {
    tableName: 'client_staff',
  });
};
