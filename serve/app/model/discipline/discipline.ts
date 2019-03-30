import { Application } from 'egg';
import { setModelInstanceMethods } from '../../utils';
import { DefineModelAttributes, STRING, TINYINT } from 'sequelize';

export interface Discipline {
  code: string;
  upcode_id: string;
  name: string;
  name_en: string;
  name_formal: string;
  is_pro: number;
}

export const attr: DefineModelAttributes<Discipline> = {
  code: {
    allowNull: false,
    primaryKey: true,
    comment: '代码',
    type: STRING(20),
  },
  upcode_id: {
    comment: '院系名',
    type: STRING(20),
  },
  name: {
    comment: '院系名',
    type: STRING(80),
  },
  name_en: {
    comment: '英文名',
    type: STRING(200),
  },
  name_formal: {
    comment: '简称',
    type: STRING(80),
  },
  is_pro: {
    allowNull: false,
    comment: '附加码',
    type: TINYINT(1),
  },
};

export default (app: Application) =>
  setModelInstanceMethods(
    app.model.define('Discipline', attr, { tableName: 'discipline_discipline' }),
    attr,
  );
