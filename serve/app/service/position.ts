import moment from 'moment';
import { Service } from 'egg';
import { ScopeList } from './user';
import { CellAction } from '../link';
import { WhereOptions } from 'sequelize';
import { DataNotFound } from '../errcode';
import { AuthResult } from '../extend/request';
import { Staff as StaffModel } from '../model/client/staff';
import { Department as DepartmentModel } from '../model/dicts/department';
import { Position as PositionModel, PositionType } from '../model/interships/position';

export interface PositionWithFK<D extends boolean = false, S extends boolean = false>
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
    if (id === void 0) throw new DataNotFound('岗位信息不存在');
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

  public getAuditLogItem(auth: AuthResult, auditStatus: string, ...args: string[]) {
    return [moment().format('YYYY-MM-DD HH:mm:ss'), auditStatus, auth.user.username, ...args];
  }

  /**
   * 获取当前岗位有权限的操作列表
   */
  public getPositionAction(
    position: PositionModel,
    { auditableDep, auditLink, scope, user }: AuthResult,
    type: keyof typeof PositionType,
  ) {
    const action: Map<CellAction, boolean> = new Map();
    if (scope.includes(ScopeList.admin)) {
      action.set(CellAction.Apply, true);
      action.set(CellAction.Preview, true);
      action.set(CellAction.Delete, true);
      action.set(CellAction.Edit, true);
      action.set(CellAction.Audit, position.status === '待审核');
    } else {
      /* 已发布的岗位所有人可见 */
      if (position.status === '已发布') {
        action.set(CellAction.Preview, true);
        /* 学生可申请已发布的岗位 */
        if (scope.includes(ScopeList.position[type].apply)) {
          // @TODO 学生已申请岗位时，状态不可用，目前直接在用户进入申请页时判断权限
          action.set(CellAction.Apply, true);
        }
      }
      /* 有审核权限的管理员可以查看非 `已发布` 状态的岗位 */
      if (scope.includes(ScopeList.position[type].audit)) {
        action.set(CellAction.Preview, true);
      }
      /* 用户可以访问和删除自己发布的岗位 */
      if (position.staff_jobnum === user.loginname) {
        action.set(CellAction.Preview, true);
        action.set(CellAction.Delete, true);
        /* 草稿状态下可以编辑 */
        action.set(CellAction.Edit, position.status === '草稿');
      }
      /* 根据岗位审核进度设定审核权限可用状态 */
      if (auditableDep.includes(position.department_code!)) {
        action.set(
          CellAction.Audit,
          position.audit === '用人单位审核' && position.status === '待审核',
        );
      }
      if (auditLink.includes(position.audit)) {
        action.set(CellAction.Audit, position.status === '待审核');
      }
    }
    return action;
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
