import moment from 'moment';
import { Service } from 'egg';
import { WhereOptions } from 'sequelize';
import { DataNotFound } from '../errcode';
import { AuthResult } from '../extend/request';
import { DepartmentModel, PositionModel, StaffModel } from '../model';

interface PositionWithFK<D extends boolean = false, S extends boolean = false>
  extends PositionModel {
  DictsDepartment: D extends true ? DepartmentModel : never;
  PeopleStaff: S extends true ? StaffModel : never;
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
  public async findOne(id: number): Promise<PositionWithFK> {
    const { model } = this.ctx;
    const position: any = await model.Interships.Position.findByPk(id, {
      include: [model.Dicts.Department, model.People.Staff],
    });
    if (position === null) throw new DataNotFound('岗位信息不存在');
    return this.formatPosition(position) as PositionWithFK;
  }

  public async updateOne(id: number, values: Partial<PositionModel<true>>) {
    const { model } = this.ctx;
    await model.Interships.Position.update(values, {
      fields: Object.keys(values),
      where: { id },
    });
  }

  public async addOne(values: Required<PositionModel<true>>) {
    const { model } = this.ctx;
    delete values.id;
    await model.Interships.Position.create(values);
  }

  public async deleteOne(id: number) {
    const { model } = this.ctx;
    await model.Interships.Position.destroy({ where: { id } });
  }

  /**
   * Find some of positions with department information.
   */
  public async findSomeWithDep<C extends boolean, TCustomAttributes>({
    limit,
    offset,
    attributes,
    where,
    depAttributes,
    count,
  }: {
    limit: number;
    offset: number;
    attributes?: string[];
    where?: WhereOptions<PositionModel & TCustomAttributes>;
    depAttributes?: (keyof DepartmentModel)[];
    count?: C;
  }) {
    const { model } = this.ctx;
    const result = await (model.Interships.Position[count ? 'findAndCountAll' : 'findAll'] as any)({
      limit,
      offset,
      attributes,
      where,
      include: [{ model: model.Dicts.Department, attributes: depAttributes }],
    });
    return {
      positions: (count ? result.rows : result).map(item =>
        this.formatPosition(item),
      ) as PositionWithFK[],
      total: result.count as (C extends true ? number : undefined),
    };
  }

  public getAuditLogItem(auth: AuthResult, auditStatus: string) {
    return [moment().format('YYYY-MM-DD HH:mm:ss'), auditStatus, auth.user.username];
  }

  private formatPosition(position: any) {
    const formatted = position.format();
    if (formatted.DictsDepartment) {
      formatted.DictsDepartment = formatted.DictsDepartment.format();
      Object.entries(formatted.DictsDepartment).forEach(([key, value]) => {
        formatted[`department_${key}`] = value;
      });
      delete formatted.DictsDepartment;
    }
    if (formatted.PeopleStaff) {
      formatted.PeopleStaff = formatted.PeopleStaff.format();
      Object.entries(formatted.PeopleStaff).forEach(([key, value]) => {
        formatted[`staff_${key}`] = value;
      });
      delete formatted.PeopleStaff;
    }
    return formatted as any;
  }
}
