import { SUUID, extendsModel } from '@/utils';
import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { INTEGER, Instance, STRING, TINYINT } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface Department {
  /** 单位代码 */
  code: string;
  /** 单位名称 */
  name: string;
  /** 单位简称 */
  shortName: string;
  /** 父单位号 */
  parent: string;
  /** 单位级别 */
  level: number | null;
  /** 是否启用 */
  used: number;
  szdwh: string;
  /** 可申报岗位 */
  affairsUsed: number;
}

export const DefineDepartment: DefineModel<Department> = {
  Attr: {
    code: {
      type: STRING(30),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: STRING(50),
      allowNull: false,
    },
    shortName: {
      type: STRING(50),
      allowNull: false,
    },
    parent: {
      type: STRING(30),
      allowNull: false,
    },
    level: {
      type: INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    used: {
      type: TINYINT,
      allowNull: false,
    },
    szdwh: {
      type: STRING(30),
      allowNull: false,
    },
    affairsUsed: {
      type: TINYINT,
      allowNull: false,
    },
  },
  Sample: {
    code: SUUID(10),
    name: '',
    shortName: '',
    parent: '',
    level: null,
    used: 0,
    szdwh: '',
    affairsUsed: 0,
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
          - max: 30
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
          - max: 50
          - allow: ""
      parent:
        type: string
        isSchema: true
        limitation:
          - max: 30
          - allow: ""
      level:
        type: number
        isSchema: true
        allowEmpty: "null"
        limitation:
          - integer: []
      used:
        type: number
        isSchema: true
        limitation:
          - allow: [0, 1]
      szdwh:
        type: string
        isSchema: true
        limitation:
          - max: 30
          - allow: ""
      affairsUsed:
        type: number
        isSchema: true
        limitation:
          - allow: [0, 1]
  `),
};

export default (app: Application) => {
  const DepartmentModel = app.model.define<Instance<Department>, Department>(
    'Department',
    DefineDepartment.Attr,
  );
  return extendsModel(DepartmentModel);
};
