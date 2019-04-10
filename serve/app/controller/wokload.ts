// import fs from 'fs';
// import path from 'path';
// import lodash from 'lodash';
import moment from 'moment';
import { Controller } from 'egg';
import { CellAction } from '../link';
// import HTML2PDF from '../utils/HTML2PDF';
import { Op, WhereOptions } from 'sequelize';
import { getFromIntEnum } from '../utils';
import { ValidationError, AuthorizeError } from '../errcode';
import { ScopeList, UserType } from '../service/user';
import { workloadColumns } from './stuapply.json';
import {
  attr as PositionAttr,
  PositionType,
  Position as PositionModel,
} from '../model/interships/position';
import {
  attr as StuapplyAttr,
  IntershipsStuapply as StuapplyModel,
} from '../model/interships/stuapply';
import { StuapplyWithFK } from '../service/stuapply';
import { AuthResult } from '../extend/request';

export default class WorkloadController extends Controller {
  public async list() {
    const { ctx, service } = this;
    const { auth, body } = ctx.request;
    const { limit = 10, offset = 0, time = moment().format('YYYYMM'), type } = body as {
      type: keyof typeof PositionType;
      [K: string]: any;
    };
    const isAdmin = auth.scope.includes(ScopeList.admin);
    const positionType = getFromIntEnum(PositionAttr, 'types', null, PositionType[type]);
    if (positionType === -1) return;

    /**
     * Qurey batabase
     */
    const options = { limit, offset, attributes: ['id'] };
    const applyFilters = [
      { audit: getFromIntEnum(StuapplyAttr, 'audit', null, '申请成功') },
    ] as WhereOptions<StuapplyModel>[];
    const include: any = [
      { model: ctx.model.School.Census, attributes: ['name', 'number'], where: {} },
      {
        model: ctx.model.Interships.Position,
        attributes: ['staff_jobnum', 'department_code', 'name', 'work_time_l'],
        where: { types: positionType },
      },
    ];

    if (auth.type === UserType.Postgraduate)
      applyFilters.push({ student_number: auth.user.loginname });
    else {
      if (!auth.scope.includes(ScopeList.admin)) {
        if (type === 'teach') {
          include[1].where[Op.or] = {
            staff_jobnum: auth.user.loginname,
            department_code: { [Op.or]: auth.auditableDep },
          } as WhereOptions<PositionModel>;
        } else include[1].where.staff_jobnum = auth.user.loginname;
      }
    }
    if (applyFilters.length) Object.assign(options, { where: applyFilters });
    const dbRes = await service.stuapply.findAndCountAll<true>(options, include);

    /**
     * Format dataSource
     */
    const dataSource: typeof dbRes.applications = [];
    for (const item of dbRes.applications) {
      const data = await this.getWorkloadFromApply(item, time);
      const actions = this.getAction(data, auth, isAdmin, type);
      data.editable = !!actions.get(CellAction.Edit);
      data.auditable = !!actions.get(CellAction.Audit);
      dataSource.push(data);
    }

    ctx.response.body = {
      rowKey: 'id',
      dataSource,
      total: dbRes.total,
      columns: workloadColumns,
    };
  }

  public async create() {
    const { ctx } = this;
    const { auth, body } = ctx.request;
    const { stuapplyId, amount, time, type } = body as {
      stuapplyId: number;
      amount: number;
      time: string;
      type: keyof typeof PositionType;
    };
    if (stuapplyId === void 0 || typeof amount !== 'number') throw new ValidationError();
    if (time.length !== 6) throw new ValidationError('工作量申报时间格式错误');
    const isAdmin = auth.scope.includes(ScopeList.admin);
    const stuapply = await this.getWorkloadFromApply(stuapplyId, time);
    if (stuapply.workload_id) throw new AuthorizeError('此记录本月工作量已申报，只允许修改');
    if (amount < 0 || amount > stuapply.position_work_time_l)
      throw new ValidationError(
        `此岗位允许申报的工作量区间为 0 ~ ${stuapply.position_work_time_l}`,
      );
    const actions = this.getAction(stuapply, auth, isAdmin, type);
    if (!actions.get(CellAction.Edit)) throw new AuthorizeError('你暂时不能申报此记录的工作量');
    const status = actions.get(CellAction.Audit) || type === 'manage' ? '已上报' : '待审核';
    await ctx.model.Interships.Workload.create({ amount, status, time, stuapply_id: stuapplyId });
    ctx.response.body = { errmsg: '申报成功' };
  }

  public async edit() {
    const { ctx, service } = this;
    const { auth, body } = ctx.request;
    const { id, amount, type } = body as {
      id: number;
      amount: number;
      type: keyof typeof PositionType;
    };
    if (id === void 0 || typeof amount !== 'number') throw new ValidationError();
    const isAdmin = auth.scope.includes(ScopeList.admin);
    const workloadRecord = await service.stuapply.findOneWorkload(id);
    const stuapply = await this.getWorkloadFromApply(
      workloadRecord.stuapply_id,
      workloadRecord.time,
    );
    if (amount < 0 || amount > stuapply.position_work_time_l)
      throw new ValidationError(
        `此岗位允许申报的工作量区间为 0 ~ ${stuapply.position_work_time_l}`,
      );
    const actions = this.getAction(stuapply, auth, isAdmin, type);
    if (!actions.get(CellAction.Edit)) throw new AuthorizeError('你暂时不能修改此记录的工作量');
    const status = actions.get(CellAction.Audit) || type === 'manage' ? '已上报' : '待审核';
    await ctx.model.Interships.Workload.update({ amount, status }, { where: { id } });
    ctx.response.body = { errmsg: '修改成功' };
  }

  public async audit() {
    const { ctx, service } = this;
    const { auth, body } = ctx.request;
    const { id, status, type } = body as {
      id: number;
      status: string;
      type: keyof typeof PositionType;
    };
    if (id === void 0 || typeof status !== 'string') throw new ValidationError();
    const isAdmin = auth.scope.includes(ScopeList.admin);
    const workloadRecord = await service.stuapply.findOneWorkload(id);
    const stuapply = await this.getWorkloadFromApply(
      workloadRecord.stuapply_id,
      workloadRecord.time,
    );
    const actions = this.getAction(stuapply, auth, isAdmin, type);
    if (!actions.get(CellAction.Audit)) throw new AuthorizeError('你暂时不能审核此记录的工作量');
    await ctx.model.Interships.Workload.update({ status }, { where: { id } });
    ctx.response.body = { errmsg: '审核成功' };
  }

  private async getWorkloadFromApply(stuapply: StuapplyWithFK | number, time: string) {
    const { model, service } = this.ctx;
    if (typeof stuapply === 'number') stuapply = await service.stuapply.findOne(stuapply);
    const workload: any = await model.Interships.Workload.findOne({
      where: { stuapply_id: stuapply.id, time },
    });
    const data = {
      ...stuapply,
      editable: false,
      auditable: false,
      position_work_time_l: (stuapply.position_work_time_l || 0) * 4,
      workload_id: workload ? workload.get('id') : void 0,
      workload_amount: workload ? workload.get('amount') : 0,
      workload_status: workload ? workload.get('status') : '未上报',
    };
    return data;
  }

  private getAction(
    stuapply: StuapplyWithFK & { workload_status: string },
    auth: AuthResult,
    isAdmin: boolean,
    type: keyof typeof PositionType,
  ) {
    const actions: Map<CellAction, boolean> = new Map();
    if (isAdmin) {
      actions.set(CellAction.Edit, ['未上报', '草稿'].includes(stuapply.workload_status!));
      actions.set(CellAction.Audit, !['未上报', '草稿'].includes(stuapply.workload_status!));
    } else {
      if (stuapply.position_staff_jobnum === auth.user.loginname)
        actions.set(CellAction.Edit, ['未上报', '草稿'].includes(stuapply.workload_status!));
      if (type === 'teach' && auth.auditableDep.includes(stuapply.position_department_code))
        actions.set(CellAction.Audit, stuapply.workload_status === '待审核');
    }
    return actions;
  }
}
