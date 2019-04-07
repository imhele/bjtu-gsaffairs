// import fs from 'fs';
// import path from 'path';
// import lodash from 'lodash';
import moment from 'moment';
import { Controller } from 'egg';
// import HTML2PDF from '../utils/HTML2PDF';
import { Op, WhereOptions } from 'sequelize';
import { getFromIntEnum } from '../utils';
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

export default class WorkloadController extends Controller {
  public async list() {
    const { ctx, service } = this;
    const { auth, body } = ctx.request;
    const { limit = 10, offset = 0, time = moment().format('YYYYMM'), type } = body as {
      type: keyof typeof PositionType;
      [K: string]: any;
    };
    const positionType = getFromIntEnum(PositionAttr, 'types', null, PositionType[type]);
    if (positionType === -1) return;

    /**
     * Qurey batabase
     */
    const options = { limit, offset };
    const applyFilters = [
      { audit: getFromIntEnum(StuapplyAttr, 'audit', null, '申请成功') },
    ] as WhereOptions<StuapplyModel>[];
    const include: any = [
      { model: ctx.model.School.Census, where: {} },
      { model: ctx.model.Interships.Position, where: { types: positionType } },
    ];

    if (auth.type === UserType.Postgraduate)
      applyFilters.push({ student_number: auth.user.loginname });
    else {
      if (!auth.scope.includes(ScopeList.admin)) {
        include[1].where[Op.or] = {
          staff_jobnum: auth.user.loginname,
          department_code: { [Op.or]: auth.auditableDep },
        } as WhereOptions<PositionModel>;
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
      dataSource.push({
        ...item,
        position_work_time_l: (item.position_work_time_l || 0) * 4,
        workload_amount: workload ? workload.get('amount') : 0,
        workload_status: workload ? workload.get('status') : '未上报',
      });
    }

    const result = {
      rowKey: 'id',
      dataSource,
      total: dbRes.total,
      columns: workloadColumns,
    };

    ctx.response.body = result;
  }
}
