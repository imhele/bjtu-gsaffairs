import { SUUID, extendsModel } from '@/utils';
import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { INTEGER, Instance, STRING } from 'sequelize';
import yamlJoi from 'yaml-joi';

export const enum AccountScope {
  PLACE_HOLDER,
  /**
   * 管理员身份
   */
  Admin = 1 << 0,
  /**
   * 研究生身份
   */
  Postgraduate = 1 << 1,
  /**
   * 职工身份
   */
  Staff = 1 << 2,
  /**
   * 人事处审核权限
   */
  HRAudit = 1 << 3,
  /**
   * 用人单位审核权限
   */
  EmployerAudit = 1 << 4,
  /**
   * 教务处审核权限
   */
  DeanAudit = 1 << 5,
  /**
   * 研究生院审核权限
   */
  GraduateSchoolAudit = 1 << 6,
  /**
   * 研工部审核权限
   */
  PostgraduateWorkDepAudit = 1 << 7,
}

export interface Account {
  id: string;
  loginAt: number;
  password: string;
  scope: number;
  username: string;
}

export const DefineAccount: DefineModel<Account> = {
  Attr: {
    id: {
      type: STRING(16),
      allowNull: false,
      primaryKey: true,
    },
    loginAt: {
      type: INTEGER.UNSIGNED(),
      allowNull: false,
      defaultValue: 0,
    },
    password: {
      type: STRING(16),
      allowNull: false,
    },
    scope: {
      type: INTEGER.UNSIGNED(),
      allowNull: false,
      defaultValue: 0,
    },
    username: {
      type: STRING(50),
      allowNull: false,
    },
  },
  Sample: {
    id: SUUID(16),
    loginAt: 0,
    password: SUUID(16),
    scope: 0,
    username: 'User',
  },
  Validator: yamlJoi(`
type: object
isSchema: true
limitation:
  - keys:
      id:
        type: string
        isSchema: true
        limitation:
          - max: 16
          - token: []
      loginAt:
        type: number
        isSchema: true
        limitation:
          - min: 0
          - max: ${Math.pow(2, 32)}
          - integer: []
      password:
        type: string
        isSchema: true
        limitation:
          - max: 16
          - token: []
      scope:
        type: number
        isSchema: true
        limitation:
          - min: 0
          - max: ${Math.pow(2, 32)}
          - integer: []
      username:
        type: string
        isSchema: true
        limitation:
          - max: 50
          - allow: ""
  `),
};

export default (app: Application) => {
  const AccountModel = app.model.define<Instance<Account>, Account>('Account', DefineAccount.Attr, {
    indexes: [{ name: 'usernameIndex', fields: ['username'] }],
  });
  return extendsModel(AccountModel);
};
