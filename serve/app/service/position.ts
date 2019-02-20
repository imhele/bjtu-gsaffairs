import { Service } from 'egg';
import { DataNotFound } from '../errcode';
import { DepartmentModel, PositionModel, StaffModel } from '../model';

interface PositionWithFK<D extends boolean = false, S extends boolean = false>
  extends PositionModel {
  Department: D extends true ? DepartmentModel : never;
  Staff: S extends true ? StaffModel : never;
  [key: string]: any;
}

/**
 * Service of position
 */
export default class PositionService extends Service {
  /**
   * Return information of a position with staff and department information
   * formatted as `staff_${key}` and `department_${key}`
   */
  public async findOne(id: number | string): Promise<PositionWithFK> {
    const { model } = this.ctx;
    const position: any = await model.Interships.Position.findByPk(id, {
      include: [model.Dicts.Department, model.Client.Staff],
    });
    if (position === null) throw new DataNotFound('岗位信息不存在');
    return this.formatPosition(position) as PositionWithFK;
  }

  public async updateOne(id: number | string, values: Partial<PositionModel>) {
    const { model } = this.ctx;
    await model.Interships.Position.update(values, {
      fields: Object.keys(values),
      where: { id },
    });
  }

  /**
   * Find some of positions with department information.
   */
  public async findSomeWithDep(
    limit: number,
    offset: number,
    attributes?: string[],
    where?: Partial<PositionModel>,
  ) {
    const { model } = this.ctx;
    const positions: any[] = await model.Interships.Position.findAll({
      limit,
      offset,
      attributes,
      where,
      include: [model.Dicts.Department],
    });
    return positions.map(item => this.formatPosition(item)) as PositionWithFK[];
  }

  private formatPosition(position: any) {
    const formattedPosition = {
      ...position.dataValues,
      Department: (position.dataValues.Department || {}).dataValues,
      Staff: (position.dataValues.Staff || {}).dataValues,
    } as PositionWithFK<true, true>;
    if (formattedPosition.Department) {
      Object.entries(formattedPosition.Department).forEach(([key, value]) => {
        formattedPosition[`department_${key}`] = value;
      });
      delete formattedPosition.Department;
    }
    if (formattedPosition.Staff) {
      Object.entries(formattedPosition.Staff).forEach(([key, value]) => {
        formattedPosition[`staff_${key}`] = value;
      });
      delete formattedPosition.Staff;
    }
    return formattedPosition as any;
  }
}
