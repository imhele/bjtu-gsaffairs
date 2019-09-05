import { SUUID, extendsModel } from '@/utils';
import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { Instance, STRING } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface College {
  /** 院系代码 */
  code: string;
  /** 院系名 */
  name: string;
  /** 简称 */
  shortName: string;
  /** 英文名 */
  nameEn: string;
  /** 附加码 */
  codeExtra: string;
}

export const DefineCollege: DefineModel<College> = {
  Attr: {
    code: {
      type: STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: STRING(50),
      allowNull: false,
    },
    shortName: {
      type: STRING(20),
      allowNull: false,
    },
    nameEn: {
      type: STRING(80),
      allowNull: false,
    },
    codeExtra: {
      type: STRING(10),
      allowNull: false,
    },
  },
  Sample: {
    code: SUUID(10),
    name: '',
    shortName: '',
    nameEn: '',
    codeExtra: '',
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
          - max: 10
          - token: []
      name:
        type: string
        isSchema: true
        limitation:
          - max: 50
          - allow: ""
      shortName:
        type: string
        isSchema: true
        limitation:
          - max: 20
          - allow: ""
      nameEn:
        type: string
        isSchema: true
        limitation:
          - max: 80
          - allow: ""
      codeExtra:
        type: string
        isSchema: true
        limitation:
          - max: 10
          - allow: ""
  `),
};

export default (app: Application) => {
  const CollegeModel = app.model.define<Instance<College>, College>('College', DefineCollege.Attr);
  return extendsModel(CollegeModel);
};
