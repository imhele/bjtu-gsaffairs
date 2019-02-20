import { Service } from 'egg';
import { Department, Position } from '../model';

interface PositionWithFK extends Position {
  Department: Department;
}

/**
 * Service of position
 */
export default class PositionService extends Service {
  public async findOne(id: number) {
    const { model } = this.ctx;
    const position: any = await model.Interships.Position.findByPk(id, {
      include: [{ model: model.Dicts.Department }],
    });
    if (position === null) return null;
    const formattedPosition = {
      ...position.dataValues,
      Department: position.dataValues.Department.dataValues,
    } as PositionWithFK;
    Object.entries(formattedPosition.Department).forEach(([key, value]) => {
      formattedPosition[`department_${key}`] = value;
    });
    delete formattedPosition.Department;
    return formattedPosition;
  }
}
