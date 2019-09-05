import { SUUID, extendsModel } from '@/utils';
import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { Instance, STRING, TINYINT } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface Discipline {
  /** 专业代码 */
  code: string;
  /** 院系名 */
  upcodeId: string | null;
  /** 专业名 */
  name: string;
  /** 专业英文名 */
  nameEn: string | null;
  /** 简称 */
  nameFormal: string | null;
  isPro: number;
}

export const DefineDiscipline: DefineModel<Discipline> = {
  Attr: {
    code: {
      type: STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    upcodeId: {
      type: STRING(20),
      allowNull: true,
      defaultValue: null,
    },
    name: {
      type: STRING(80),
      allowNull: false,
    },
    nameEn: {
      type: STRING(200),
      allowNull: true,
      defaultValue: null,
    },
    nameFormal: {
      type: STRING(80),
      allowNull: true,
      defaultValue: null,
    },
    isPro: {
      type: TINYINT,
      allowNull: false,
    },
  },
  Sample: {
    code: SUUID(20),
    upcodeId: null,
    name: 'Discipline',
    nameEn: null,
    nameFormal: null,
    isPro: 0,
  },
  Validator: yamlJoi(`
type: object
isSchema: true
limitation:
  - keys:
      code:
        type: string
        isSchema: true
        limitation:
          - max: 20
          - token: []
      upcodeId:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 20
          - allow: ""
      name:
        type: string
        isSchema: true
        limitation:
          - max: 80
          - allow: ""
      nameEn:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 200
          - allow: ""
      nameFormal:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 80
          - allow: ""
      isPro:
        type: number
        isSchema: true
        limitation:
          - allow: [0, 1]
  `),
};

export default (app: Application) => {
  const DisciplineModel = app.model.define<Instance<Discipline>, Discipline>(
    'Discipline',
    DefineDiscipline.Attr,
  );
  return extendsModel(DisciplineModel);
};
