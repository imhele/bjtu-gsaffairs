import { SUUID, extendsModel } from '@/utils';
import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { INTEGER, Instance, STRING } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface Account {
  id: string;
  /** 学籍信息外键 */
  censusId: string | null;
  loginAt: number;
  name: string;
  password: string;
  scope: number;
  /** 教职工信息外键 */
  staffId: string | null;
}

export const DefineAccount: DefineModel<Account> = {
  Attr: {
    id: {
      type: STRING(16),
      allowNull: false,
      primaryKey: true,
    },
    censusId: {
      type: STRING(16),
      allowNull: true,
      defaultValue: null,
    },
    loginAt: {
      type: INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    name: {
      type: STRING(50),
      allowNull: false,
    },
    password: {
      type: STRING(16),
      allowNull: false,
    },
    scope: {
      type: INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    staffId: {
      type: STRING(16),
      allowNull: true,
      defaultValue: null,
    },
  },
  Sample: {
    id: SUUID(16),
    censusId: null,
    loginAt: 0,
    name: 'User',
    password: SUUID(16),
    scope: 0,
    staffId: null,
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
      censusId:
        type: string
        isSchema: true
        allowEmpty: "null"
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
      name:
        type: string
        isSchema: true
        limitation:
          - max: 50
          - allow: ""
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
      staffId:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 16
          - token: []
  `),
};

export default (app: Application) => {
  const AccountModel = app.model.define<Instance<Account>, Account>('Account', DefineAccount.Attr);
  AccountModel.associate = function AccountAssociate() {
    app.model.Account.belongsTo(app.model.Census, {
      foreignKey: 'censusId',
      targetKey: 'id',
    });
    app.model.Account.belongsTo(app.model.Staff, {
      foreignKey: 'staffId',
      targetKey: 'id',
    });
  }
  return extendsModel(AccountModel);
};
