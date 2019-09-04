import { SUUID, extendsModel } from '@/utils';
import { DefineModel, Gender } from '@/utils/types';
import { Application } from 'egg';
import { DATEONLY, Instance, STRING, TINYINT } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface Staff {
  /** 工号 */
  id: string;
  /** 姓名 */
  name: string;
  /** 姓名简拼 */
  xmjp: string | null;
  /** 性别 */
  gender: Gender | null;
  /** 证件类型 */
  certificateType: number | null;
  /** 证件号码 */
  idcard: string | null;
  /** 出生日期 */
  birthday: Date | null;
  /** 民族 */
  nation: string | null;
  /** 国籍 */
  nationality: string | null;
  /** 政治面貌 */
  faction: string | null;
  /** 职称编号 */
  titleCode: string | null;
  /** 职称名称 */
  title: string | null;
  /** 行政职务 */
  headship: string | null;
  /** 最高学位名称 */
  degreeName: string | null;
  /** 最高学位获取时间 */
  degreeDate: Date | null;
  /** 学历名称 */
  educationName: string | null;
  /** 部门 */
  departmentCode: string;
  /** 部门名称 */
  department: string | null;
  /** 手机号 */
  cellphone: string | null;
  email: string | null;
  /** 人事单位是否本校 */
  isSchoolStaff: number | null;
}

export const DefineStaff: DefineModel<Staff> = {
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
    xmjp: {
      type: STRING(30),
      allowNull: true,
      defaultValue: null,
    },
    gender: {
      type: TINYINT,
      allowNull: true,
      defaultValue: null,
    },
    certificateType: {
      type: STRING(20),
      allowNull: true,
      defaultValue: null,
    },
    idcard: {
      type: STRING(18),
      allowNull: true,
      defaultValue: null,
    },
    birthday: {
      type: DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    nation: {
      type: STRING(20),
      allowNull: true,
      defaultValue: null,
    },
    nationality: {
      type: STRING(20),
      allowNull: true,
      defaultValue: null,
    },
    faction: {
      type: STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    titleCode: {
      type: STRING(20),
      allowNull: true,
      defaultValue: null,
    },
    title: {
      type: STRING(20),
      allowNull: true,
      defaultValue: null,
    },
    headship: {
      type: STRING(20),
      allowNull: true,
      defaultValue: null,
    },
    degreeName: {
      type: STRING(8),
      allowNull: true,
      defaultValue: null,
    },
    degreeDate: {
      type: DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    educationName: {
      type: STRING(8),
      allowNull: true,
      defaultValue: null,
    },
    // TODO
    departmentCode: {
      type: STRING(10),
      allowNull: false,
    },
    department: {
      type: STRING(40),
      allowNull: true,
      defaultValue: null,
    },
    cellphone: {
      type: STRING(20),
      allowNull: true,
      defaultValue: null,
    },
    email: {
      type: STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    isSchoolStaff: {
      type: TINYINT,
      allowNull: true,
      defaultValue: null,
    },
  },
  Sample: {
    id: SUUID(16),
    name: 'User',
    xmjp: null,
    gender: Gender.Male,
    certificateType: null,
    idcard: null,
    birthday: null,
    nation: null,
    nationality: null,
    faction: null,
    titleCode: null,
    title: null,
    headship: null,
    degreeName: null,
    degreeDate: null,
    educationName: null,
    departmentCode: '',
    department: null,
    cellphone: null,
    email: null,
    isSchoolStaff: null,
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
      xmjp:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 30
          - allow: ""
      gender:
        type: number
        isSchema: true
        allowEmpty: "null"
        limitation:
          - allow: [${Gender.Male}, ${Gender.Female}]
      certificateType:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 20
          - allow: ""
      idcard:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 18
          - allow: ""
      birthday:
        type: date
        isSchema: true
        allowEmpty: "null"
      nation:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 20
          - allow: ""
      nationality:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 20
          - allow: ""
      faction:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 50
          - allow: ""
      titleCode:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 20
          - allow: ""
      title:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 20
          - allow: ""
      headship:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 20
          - allow: ""
      degreeName:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 8
          - allow: ""
      degreeDate:
        type: date
        isSchema: true
        allowEmpty: "null"
      educationName:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 8
          - allow: ""
      departmentCode:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 10
          - allow: ""
      department:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 40
          - allow: ""
      cellphone:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 20
          - allow: ""
      email:
        type: string
        isSchema: true
        allowEmpty: "null"
        limitation:
          - max: 50
          - allow: ""
      isSchoolStaff:
        type: number
        isSchema: true
        allowEmpty: "null"
        limitation:
          - allow: [0, 1]
  `),
};

export default (app: Application) => {
  const StaffModel = app.model.define<Instance<Staff>, Staff>('Staff', DefineStaff.Attr);
  StaffModel.associate = function StaffAssociate() {
    app.model.Staff.belongsTo(app.model.Department, {
      foreignKey: 'departmentCode',
      targetKey: 'code',
    });
  };
  return extendsModel(StaffModel);
};
