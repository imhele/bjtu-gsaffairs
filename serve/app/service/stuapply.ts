import { Service } from 'egg';
import { ScopeList } from './user';
import { CellAction } from '../link';
import { DataNotFound } from '../errcode';
import { AuthResult } from '../extend/request';
import { FindOptions, IncludeOptions, Model } from 'sequelize';
import { attr as SchoolCensusAttr, SchoolCensus as CensusModel } from '../model/school/census';
import {
  attr as StuapplyAttr,
  IntershipsStuapply as StuapplyModel,
} from '../model/interships/stuapply';
import {
  PositionType,
  attr as PositionAttr,
  Position as PositionModel,
} from '../model/interships/position';

export interface StuapplyWithFK<D extends boolean = false, S extends boolean = false>
  extends StuapplyModel {
  IntershipsPosition: D extends true ? PositionModel : never;
  SchoolCensus: S extends true ? CensusModel : never;
  [key: string]: any;
}

/**
 * Service of stuapply
 */
export default class StuapplyService extends Service {
  public async findOne(id: number): Promise<StuapplyWithFK> {
    const { model } = this.ctx;
    const stuapply: any = await model.Interships.Stuapply.findByPk(id, {
      include: [model.School.Census, model.Interships.Position],
    });
    if (stuapply === null) throw new DataNotFound('申请信息不存在');
    return this.formatStuapply(stuapply) as StuapplyWithFK;
  }

  public async updateOne(id: number, values: Partial<StuapplyModel<true>>) {
    const { model } = this.ctx;
    await model.Interships.Stuapply.update(values, {
      fields: Object.keys(values),
      where: { id },
    });
  }

  public async addOne(values: Required<StuapplyModel<true>>) {
    const { model } = this.ctx;
    delete values.id;
    await model.Interships.Stuapply.create(values);
  }

  public async deleteOne(id: number) {
    const { model } = this.ctx;
    await model.Interships.Stuapply.destroy({ where: { id } });
  }

  public async hasApplied(positionId: number, student: string) {
    const { model } = this.ctx;
    const stuapply = await model.Interships.Stuapply.findAll({
      limit: 1,
      attributes: ['id'],
      where: { student_number: student, position_id: positionId },
    });
    return stuapply.length ? true : false;
  }

  /**
   * 不包含 CellAction.Preview 的判断
   */
  public authorize(
    stuapply: StuapplyWithFK,
    { auditableDep, auditLink, scope, user }: AuthResult,
    type: keyof typeof PositionType,
  ) {
    const action: Map<CellAction, boolean> = new Map();
    if (scope.includes(ScopeList.admin)) {
      action.set(CellAction.Delete, true);
      action.set(CellAction.Edit, true);
      action.set(CellAction.Audit, stuapply.status === '待审核');
    } else {
      if (scope.includes(ScopeList.position[type].apply)) action.set(CellAction.Apply, true);
      /* 用户可以访问和删除自己发布的岗位 */
      if (stuapply.student_number === user.loginname) {
        action.set(CellAction.Delete, true);
        /* 草稿状态下可以编辑 */
        action.set(CellAction.Edit, stuapply.status === '草稿');
      }
      /* 根据岗位审核进度设定审核权限可用状态 */
      if (auditableDep.includes(stuapply.position_department_code!)) {
        action.set(
          CellAction.Audit,
          stuapply.audit === '用人单位审核' && stuapply.status === '待审核',
        );
      }
      if (auditLink.includes(stuapply.audit))
        action.set(CellAction.Audit, stuapply.status === '待审核');
      if (
        stuapply.student_teacher_code === user.loginname ||
        stuapply.student_teacher2_code === user.loginname
      )
        action.set(CellAction.Audit, stuapply.audit === '导师确认' && stuapply.status === '待审核');
    }
    return action;
  }

  public async findAndCountAll<TCustomAttributes>(
    options: FindOptions<StuapplyModel<true> & TCustomAttributes>,
    include?: Array<Model<any, any> | IncludeOptions>,
  ) {
    const { model } = this.ctx;
    const result = await model.Interships.Stuapply.findAndCountAll({ ...options, include });
    return {
      positions: result.rows.map((item: any) => this.formatStuapply(item)) as StuapplyWithFK[],
      total: result.count,
    };
  }

  public getColumnsObj() {
    const columnsObj: { [key: string]: { dataIndex: string; title: string } } = {};
    Object.entries(StuapplyAttr).forEach(([dataIndex, value]: any) => {
      columnsObj[dataIndex] = { dataIndex, title: value.comment };
    });
    Object.entries(PositionAttr).forEach(([dataIndex, value]: any) => {
      dataIndex = `position_${dataIndex}`;
      columnsObj[dataIndex] = { dataIndex, title: value.comment };
    });
    Object.entries(SchoolCensusAttr).forEach(([dataIndex, value]: any) => {
      dataIndex = `student_${dataIndex}`;
      columnsObj[dataIndex] = { dataIndex, title: value.comment };
    });
    return columnsObj;
  }

  private formatStuapply(stuapply: any) {
    const formatted = stuapply.format();
    if (formatted.IntershipsPosition) {
      formatted.IntershipsPosition = formatted.IntershipsPosition.format();
      Object.entries(formatted.IntershipsPosition).forEach(([key, value]) => {
        formatted[`position_${key}`] = value;
      });
      delete formatted.IntershipsPosition;
    }
    if (formatted.SchoolCensus) {
      formatted.SchoolCensus = formatted.SchoolCensus.format();
      Object.entries(formatted.SchoolCensus).forEach(([key, value]) => {
        formatted[`student_${key}`] = value;
      });
      delete formatted.SchoolCensus;
    }
    return formatted as any;
  }
}
