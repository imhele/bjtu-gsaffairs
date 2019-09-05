import { SUUID, extendsModel } from '@/utils';
import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { Instance, STRING } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface Depadmin {
  departmentCode?: string;
  staffId?: string;
}

export const DefineDepadmin: DefineModel<Depadmin> = {
  Attr: {
    departmentCode: {
      type: STRING(30),
      allowNull: false,
    },
    staffId: {
      type: STRING(16),
      allowNull: false,
    },
  },
  Sample: {
    departmentCode: SUUID(30),
    staffId: SUUID(16),
  },
  Validator: yamlJoi(`
type: object
isSchema: true
limitation:
  - keys:
      departmentCode:
        type: string
        isSchema: true
        limitation:
          - max: 30
          - token: []
      staffId:
        type: string
        isSchema: true
        limitation:
          - max: 16
          - token: []
  `),
};

export default (app: Application) => {
  const DepadminModel = app.model.define<Instance<Depadmin>, Depadmin>(
    'Depadmin',
    DefineDepadmin.Attr,
    {
      indexes: [
        { name: 'departmentCodeIndex', fields: ['departmentCode'] },
        { name: 'staffIdIndex', fields: ['staffId'] },
      ],
    },
  );
  DepadminModel.removeAttribute('id');
  DepadminModel.associate = function DepadminAssociate() {
    app.model.Depadmin.belongsTo(app.model.Department, {
      foreignKey: 'departmentCode',
      targetKey: 'code',
    });
    app.model.Depadmin.belongsTo(app.model.Staff, {
      foreignKey: 'staffId',
      targetKey: 'id',
    });
  };
  return extendsModel(DepadminModel);
};
