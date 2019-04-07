import { Application } from 'egg';
import { setModelInstanceMethods } from '../../utils';
import { DefineModelAttributes, STRING, INTEGER } from 'sequelize';

export interface IntershipsWorkload {
  id?: number;
  amount: number;
  status: string;
  time: string;
  stuapply_id?: number;
}

export const WorkloadStatus = ['待审核', '草稿', '已上报'];

export const attr: DefineModelAttributes<IntershipsWorkload> = {
  status: {
    allowNull: false,
    comment: '上报状态',
    type: STRING(50),
    validate: { len: [0, 50], notEmpty: true },
  },
  time: {
    allowNull: false,
    comment: '月份',
    type: STRING(6),
    validate: { len: [0, 6], notEmpty: true },
  },
  amount: {
    allowNull: false,
    comment: '工作量',
    type: INTEGER(11),
    validate: { isNumeric: true, notEmpty: true },
  },
};

export default (app: Application) => {
  const Model = app.model.define('IntershipsWorkload', attr, {
    tableName: 'interships_workload',
  });
  Model.associate = () => {
    app.model.Interships.Workload.belongsTo(app.model.Interships.Stuapply, {
      foreignKey: 'stuapply_id',
    });
  };
  return setModelInstanceMethods(Model, attr);
};
