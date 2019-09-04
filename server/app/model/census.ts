import { SUUID, extendsModel } from '@/utils';
import { DefineModel, Gender, StudentType } from '@/utils/types';
import { Application } from 'egg';
import { INTEGER, Instance, STRING, TINYINT } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface Census {
  /** 学号 */
  id: string;
  /** 姓名 */
  name: string;
  /** 学生类型 */
  studentType: StudentType | null;
  /** 性别 */
  gender: Gender | null;
  /** 学院 */
  collegeId: string;
  /** 学科（专业） */
  discipline: string | null;
  /** 是否校内学籍 */
  schoolStatus: string | null;
  /** 是否国家学籍 */
  countryStatus: string | null;
  /** 导师工资号 */
  teacherCode: string | null;
  /** 导师2工资号 */
  teacher2Code: string | null;
  /** 所在年级 */
  ofYear: string | null;
  /** 是否全日制 */
  isQrz: number | null;
}

export const DefineCensus: DefineModel<Census> = {
  Attr: {
    id: {
      type: STRING(16),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: STRING(50),
      allowNull: false,
    },
    studentType: {
      type: INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    gender: {
      type: TINYINT,
      allowNull: true,
      defaultValue: null,
    },
    collegeId: {
      type: STRING(10),
      allowNull: false,
    },
    discipline: {
      type: STRING(80),
      allowNull: true,
      defaultValue: null,
    },
    schoolStatus: {
      type: STRING(2),
      allowNull: true,
      defaultValue: null,
    },
    countryStatus: {
      type: STRING(2),
      allowNull: true,
      defaultValue: null,
    },
    teacherCode: {
      type: STRING(16),
      allowNull: true,
      defaultValue: null,
    },
    teacher2Code: {
      type: STRING(16),
      allowNull: true,
      defaultValue: null,
    },
    ofYear: {
      type: STRING(4),
      allowNull: true,
      defaultValue: null,
    },
    isQrz: {
      type: TINYINT,
      allowNull: true,
      defaultValue: null,
    }
  },
  Sample: {
    id: SUUID(16),
    name: 'User',
    studentType: null,
    gender: null,
    collegeId: '',
    discipline: null,
    schoolStatus: null,
    countryStatus: null,
    teacherCode: null,
    teacher2Code: null,
    ofYear: null,
    isQrz: null,
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
      name:
        type: string
        isSchema: true
        limitation:
          - max: 50
          - allow: ""
      studentType:
        type: number
        isSchema: true
        limitation:
          - allow:
              - ${StudentType.Doctor}
              - ${StudentType.Master}
              - ${StudentType.Exempted}
              - ${StudentType.Advanced}
      gender:
        type: number
        isSchema: true
        allowEmpty: "null"
        limitation:
          - allow: [${Gender.Male}, ${Gender.Female}]
      collegeId:
        type: string
        isSchema: true
        limitation:
          - max: 10
          - allow: ""
      discipline:
        type: string
        isSchema: true
        limitation:
          - max: 80
          - allow: ""
      schoolStatus:
        type: string
        isSchema: true
        limitation:
          - max: 2
          - allow: ""
      countryStatus:
        type: string
        isSchema: true
        limitation:
          - max: 2
          - allow: ""
      teacherCode:
        type: string
        isSchema: true
        limitation:
          - max: 16
          - allow: ""
      teacher2Code:
        type: string
        isSchema: true
        limitation:
          - max: 16
          - allow: ""
      ofYear:
        type: string
        isSchema: true
        limitation:
          - max: 4
          - allow: ""
      isQrz:
        type: number
        isSchema: true
        allowEmpty: "null"
        limitation:
          - allow: [0, 1]
  `),
};

export default (app: Application) => {
  const CensusModel = app.model.define<Instance<Census>, Census>('Census', DefineCensus.Attr);
  CensusModel.associate = function CensusAssociate() {
    app.model.Census.belongsTo(app.model.College, {
      foreignKey: 'collegeId',
      targetKey: 'id',
    });
  };
  return extendsModel(CensusModel);
};
