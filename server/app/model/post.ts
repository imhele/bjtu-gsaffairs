import { SUUID, extendsModel } from '@/utils';
import { DefineModel, PostMeta, PostStatus } from '@/utils/types';
import { Application } from 'egg';
import { INTEGER, Instance, SMALLINT, STRING, TEXT, TINYINT } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface Post {
  id: number;
  /** 学年学期 */
  semester: number;
  /** 岗位名称 */
  name: string;
  /** 岗位类型 & 校区 & 聘用方式 */
  meta: PostMeta;
  /** 需求描述 */
  demand: string;
  /** 需求人数 */
  demandAmount: number;
  /** 工作内容 */
  content: string;
  /** 工作地点 */
  address: string;
  /** 工作时间 */
  workTime: string;
  /** 周工作量 */
  weeklyWorkload: number;
  /** 聘用开始时间 */
  employStart: number;
  /** 聘用结束时间 */
  employEnd: number;
  /** 岗位状态 */
  status: PostStatus;
  /** 操作记录 */
  log: string;
  /** 所属单位 */
  departmentCode: string | null;
  /** 岗位负责人 */
  staffId: string;
  /** 联系电话 */
  cellphone: string;
  /** 课程信息 */
  teachingTaskId: number | null;
}

export const DefinePost: DefineModel<Post> = {
  Attr: {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    semester: {
      type: SMALLINT.UNSIGNED,
      allowNull: false,
    },
    name: {
      type: STRING(255),
      allowNull: false,
    },
    meta: {
      type: SMALLINT.UNSIGNED,
      allowNull: false,
    },
    demand: {
      type: TEXT,
      allowNull: false,
    },
    demandAmount: {
      type: TINYINT.UNSIGNED,
      allowNull: false,
    },
    content: {
      type: TEXT,
      allowNull: false,
    },
    address: {
      type: STRING(255),
      allowNull: false,
    },
    workTime: {
      type: STRING(255),
      allowNull: false,
    },
    weeklyWorkload: {
      type: TINYINT.UNSIGNED,
      allowNull: false,
    },
    employStart: {
      type: INTEGER.UNSIGNED,
      allowNull: false,
    },
    employEnd: {
      type: INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: TINYINT.UNSIGNED,
      allowNull: false,
    },
    log: {
      type: TEXT,
      allowNull: false,
    },
    departmentCode: {
      type: STRING(30),
      allowNull: true,
      defaultValue: null,
    },
    staffId: {
      type: STRING(16),
      allowNull: true,
      defaultValue: null,
    },
    cellphone: {
      type: STRING(20),
      allowNull: false,
    },
    teachingTaskId: {
      type: INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  },
  Sample: {
    id: 0,
    semester: 0,
    name: '',
    meta: 0,
    demand: '',
    demandAmount: 0,
    content: '',
    address: '',
    workTime: '',
    weeklyWorkload: 0,
    employStart: 0,
    employEnd: 0,
    status: 0,
    log: '',
    departmentCode: null,
    staffId: SUUID(16),
    cellphone: '',
    teachingTaskId: null,
  },
  Validator: yamlJoi(`
type: object
isSchema: true
limitation:
  - keys:
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
  const PostModel = app.model.define<Instance<Post>, Post>('Post', DefinePost.Attr, {
    indexes: [],
  });
  PostModel.associate = function PostAssociate() {
    app.model.Post.belongsTo(app.model.Department, {
      foreignKey: 'departmentCode',
      targetKey: 'code',
    });
    app.model.Post.belongsTo(app.model.Staff, {
      foreignKey: 'staffId',
      targetKey: 'id',
    });
  };
  return extendsModel(PostModel);
};
