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
      const workload: any = await ctx.model.Interships.Workload.findOne({
        where: { stuapply_id: item.id, time },
      });
      const data = {
        ...item,
        editable: false,
        auditable: false,
        position_work_time_l: (item.position_work_time_l || 0) * 4,
        workload_amount: workload ? workload.get('amount') : 0,
        workload_status: workload ? workload.get('status') : '未上报',
      };
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
    const { ctx, service } = this;
    const { auth, body } = ctx.request;
    const { id, amount, type } = body as {
      id: number;
      amount: number;
      type: keyof typeof PositionType;
    };
    if (id === void 0 || amount === void 0) throw new ValidationError();
    const isAdmin = auth.scope.includes(ScopeList.admin);
    const stuapply = await service.stuapply.findOne(id);
    const actions = this.getAction(stuapply, auth, isAdmin, type);
    if (!actions.get(CellAction.Edit)) throw new AuthorizeError('你暂时不能申报此记录的工作量');

    ctx.response.body = { errmsg: '申报成功' };
  }

  private getAction(
    stuapply: StuapplyWithFK & { workload_status?: string },
    auth: AuthResult,
    isAdmin: boolean,
    type: keyof typeof PositionType,
  ) {
    const actions: Map<CellAction, boolean> = new Map();
    if (isAdmin) {
      actions.set(CellAction.Edit, ['未上报', '草稿'].includes(stuapply.workload_status!));
      actions.set(CellAction.Audit, stuapply.workload_status === '待审核');
    } else {
      if (stuapply.position_staff_jobnum === auth.user.loginname)
        actions.set(CellAction.Edit, ['未上报', '草稿'].includes(stuapply.workload_status!));
      if (type === 'teach' && auth.auditableDep.includes(stuapply.position_department_code))
        actions.set(CellAction.Audit, stuapply.workload_status === '待审核');
    }
    return actions;
  }
}
