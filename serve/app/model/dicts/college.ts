import { Application } from 'egg';
import { setModelInstanceMethods } from '../../utils';
import { DefineModelAttributes, STRING } from 'sequelize';

export interface College {
  code: string;
  name: string;
  short_name: string;
  name_en: string;
  code_extra: number;
}

export const attr: DefineModelAttributes<College> = {
  code: {
    allowNull: false,
    primaryKey: true,
    comment: '代码',
    type: STRING(10),
  },
  name: {
    allowNull: false,
    comment: '院系名',
    type: STRING(50),
  },
  short_name: {
    allowNull: false,
    comment: '简称',
    type: STRING(20),
  },
  name_en: {
    allowNull: false,
    comment: '英文名',
    type: STRING(80),
  },
  code_extra: {
    allowNull: false,
    comment: '附加码',
    type: STRING(10),
  },
};

export default (app: Application) =>
  setModelInstanceMethods(
    app.model.define('DictsCollege', attr, { tableName: 'dicts_college' }),
    attr,
  );
