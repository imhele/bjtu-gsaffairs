import { Service } from 'egg';
import { DataNotFound } from '../errcode';
import { DepartmentModel, PositionModel, StaffModel } from '../model';

interface PositionWithFK extends PositionModel {
  Department: DepartmentModel;
  Staff: StaffModel;
}

/**
 * Service of position
 */
export default class PositionService extends Service {
  public async findOne(id: number | string) {
    const { model } = this.ctx;
    const position: any = await model.Interships.Position.findByPk(id, {
      include: [{ model: model.Dicts.Department }, { model: model.Client.Staff }],
    });
    if (position === null) throw new DataNotFound('岗位信息不存在');
    return {
      ...position.dataValues,
      Department: position.dataValues.Department.dataValues,
      Staff: position.dataValues.Staff.dataValues,
    } as PositionWithFK;
  }

  public async updateOne(id: number | string, values: Partial<PositionModel>) {
    const { model } = this.ctx;
    await model.Interships.Position.update(values, {
      fields: Object.keys(values),
      where: { id },
    });
  }
}
