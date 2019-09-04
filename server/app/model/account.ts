import { extendsModel } from '@/utils';
import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { Instance, STRING } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface Account {
  secret: string;
  accountId: string;
}

export const DefineAccount: DefineModel<Account> = {
  Attr: {
    accountId: {
      type: STRING(18),
      allowNull: false,
    },
    secret: {
      type: STRING(22),
      allowNull: false,
    },
  },
  Sample: {
    accountId: 'abcdefghijklmnopqr',
    secret: 'abcdefghijklmnopqrstuv',
  },
  Validator: yamlJoi(`
type: object
isSchema: true
limitation:
  - keys:
      accountId:
        type: string
        isSchema: true
        limitation:
          - length: 18
          - token: []
      secret:
        type: string
        isSchema: true
        limitation:
          - length: 22
          - token: []
  `),
};

export default (app: Application) => {
  const AccountModel = app.model.define<Instance<Account>, Account>('Account', DefineAccount.Attr, {
    indexes: [{ name: 'PrimaryKey', unique: true, fields: ['accountId'] }],
  });
  AccountModel.removeAttribute('id');
  return extendsModel(AccountModel);
};
