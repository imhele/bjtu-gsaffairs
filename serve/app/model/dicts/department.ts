import { Application } from 'egg';
import { setModelInstanceMethods } from '../../utils';
import { filtersMap } from '../../controller/positionFilter';
import { DefineModelAttributes, INTEGER, TINYINT, STRING } from 'sequelize';

export interface Department {
  code: string;
  name: string;
  short_name: string;
  parent: string;
  level: number;
  used: number;
  szdwh: string;
}

export const attr: DefineModelAttributes<Department> = {
  code: {
    allowNull: false,
    primaryKey: true,
    comment: '单位代码',
    type: STRING(30),
  },
  name: {
    allowNull: false,
    comment: '单位名称',
    type: STRING(50),
  },
  short_name: {
    allowNull: false,
    comment: '单位简称',
    type: STRING(50),
  },
  parent: {
    allowNull: false,
    comment: '父单位号',
    type: STRING(30),
  },
  level: {
    allowNull: true,
    comment: '单位级别',
    type: INTEGER,
  },
  used: {
    allowNull: false,
    comment: '是否启用',
    type: TINYINT(1),
  },
  szdwh: {
    allowNull: false,
    type: STRING(30),
  },
};

export default (app: Application) => {
  const Model = setModelInstanceMethods(
    app.model.define('DictsDepartment', attr, {
      tableName: 'dicts_department',
    }),
    attr,
  );
  Model.associate = async () => {
    /* 后端启动时，从数据库取出所有部门的名称，添加到 `filtersMap` 中 */
    const departments = await app.model.Dicts.Department.findAll({ attributes: ['code', 'name'] });
    filtersMap.department_code!.selectOptions = departments.map((item: any) => ({
      title: item.get('name'),
      value: item.get('code'),
    }));
  };
  return Model;
};
