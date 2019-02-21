import { Application } from 'egg';
import { DefineModelAttributes } from 'sequelize';
import { setModelInstanceMethods } from '../../utils';

export interface IntershipsAdmin {
  id?: number;
  department_code?: string;
  staff_jobnum?: string;
}

export const attr: DefineModelAttributes<IntershipsAdmin> = {};

export default (app: Application) => {
  const IntershipsAdminModel = app.model.define('IntershipsAdmins', attr, {
    tableName: 'interships_admins',
  });
  IntershipsAdminModel.associate = () => {
    app.model.Interships.Admins.belongsTo(app.model.Dicts.Department, {
      foreignKey: 'department_code',
    });
    app.model.Interships.Admins.belongsTo(app.model.People.Staff, {
      foreignKey: 'staff_jobnum',
    });
  };
  return setModelInstanceMethods(IntershipsAdminModel, attr);
};
