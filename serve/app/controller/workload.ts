import fs from 'fs';
import path from 'path';
import lodash from 'lodash';
import moment from 'moment';
import { Controller } from 'egg';
import { CellAction } from '../link';
import HTML2PDF from '../utils/HTML2PDF';
import { Op, WhereOptions } from 'sequelize';
import { getFromIntEnum } from '../utils';
import { ValidationError, AuthorizeError, CreateFileFailed } from '../errcode';
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
import { getFilters } from './positionFilter';
import XLSX from '../../jslib/xlsx';

export default class WorkloadController extends Controller {
  public async list() {
    const { ctx, service } = this;
    const { auth, body } = ctx.request;
    const initTime = moment()
      .subtract(1, 'M')
      .format('YYYYMM');
    const { limit = 10, offset = 0, time = initTime, type, student } = body as {
      type: keyof typeof PositionType;
      [K: string]: any;
    };
    const isAdmin = auth.scope.includes(ScopeList.admin);
    const positionType = getFromIntEnum(PositionAttr, 'types', null, PositionType[type]);
    if (positionType === -1) return;

    if (body.status) {
      const res = await service.stuapply.findAndCountWorkload(
        { time, student, status: body.status, type: positionType as number },
        { limit, offset },
        item => {
          const actions = this.getAction(item, auth, isAdmin, type, time);
          return {
            ...item,
            editable: !!actions.get(CellAction.Edit),
            auditable: !!actions.get(CellAction.Audit),
            position_work_time_l: (item.position_work_time_l || 0) * 4,
            position_end_t: void 0,
            position_start_t: void 0,
            position_staff_jobnum: void 0,
          };
        },
      );
      ctx.response.body = {
        ...res,
        rowKey: 'id',
        columns: workloadColumns,
        selectable: isAdmin || !!auth.auditableDep.length,
      };
      return;
    }

    /**
     * Qurey batabase
     */
    const options = { limit, offset, attributes: ['id'] };
    const applyFilters = [
      { audit: getFromIntEnum(StuapplyAttr, 'audit', null, '申请成功') },
    ] as WhereOptions<StuapplyModel>[];
    const include: any = [
      {
        model: ctx.model.School.Census,
        attributes: ['name', 'number'],
        where: {},
      },
      {
        model: ctx.model.Interships.Position,
        attributes: ['staff_jobnum', 'department_code', 'name', 'work_time_l', 'start_t', 'end_t'],
        where: { types: positionType },
      },
    ];

    if (student) {
      include[0].where[Op.or] = {
        name: { [Op.like]: `%${student}%` },
        number: { [Op.like]: `%${student}%` },
      };
    }
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
    const depMap: { title: string; value: string }[] = getFilters(['department_code'])[0]
      .selectOptions;
    const dataSource: typeof dbRes.applications = [];
    for (const item of dbRes.applications) {
      const data = await this.getWorkloadFromApply(item, time);
      const actions = this.getAction(data, auth, isAdmin, type, time);
      const dep = depMap.find(i => i.value === (data as any).position_department_code);
      dataSource.push({
        ...data,
        editable: !!actions.get(CellAction.Edit),
        auditable: !!actions.get(CellAction.Audit),
        position_department_code: dep && dep.title,
        position_end_t: void 0,
        position_start_t: void 0,
        position_staff_jobnum: void 0,
      });
    }

    ctx.response.body = {
      rowKey: 'id',
      dataSource,
      selectable: isAdmin || !!auth.auditableDep.length,
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
    const actions = this.getAction(stuapply, auth, isAdmin, type, time);
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

  public async export() {
    const {
      ctx: { request, model },
      service,
    } = this;
    const { body, auth } = request;
    if (!auth.scope.includes(ScopeList.admin) && !auth.auditableDep.length)
      throw new AuthorizeError('你暂时没有权限下载岗位协议书');

    const idList: number[] = body.workloadIdList.filter((i: number) => i);
    if (!idList.length || !body.type) return;
    const dbRes = await Promise.all(idList.map(i => service.stuapply.findOneWorkloadForExport(i)));
    const workloadList = dbRes.filter(i => i);
    const year = workloadList[0]!.time.slice(0, 4);
    const month = workloadList[0]!.time.slice(4);
    const type = PositionType[body.type];
    const dep: any = await (auth.auditableDep[0] &&
      model.Dicts.Department.findByPk(auth.auditableDep[0], { attributes: ['name'] }));
    const data = { year, month, type, workloadList, dep: dep ? dep.get('name') : '' };
    if (body.fileType === 'excel') this.toExcel(data);
    else this.toPDF(data);
  }

  private async toPDF(data: {
    year: string;
    month: string;
    type: string;
    workloadList: {
      amount: number;
      time: string;
      position_name: string;
      student_name: string;
      student_number: string;
      student_college_name: string;
    }[];
    dep: string;
  }) {
    const templatePath = path.join(__dirname, './workloadTemplate.html');
    const compiled = lodash.template(fs.readFileSync(templatePath, 'utf8'));
    const template = compiled(data);
    try {
      this.ctx.set('Content-Type', 'application/octet-stream');
      this.ctx.attachment(`workload_${data.workloadList[0]!.time}.pdf`);
      this.ctx.response.body = HTML2PDF(template);
    } catch {
      throw new CreateFileFailed();
    }
  }

  private async toExcel(data: {
    year: string;
    month: string;
    type: string;
    workloadList: {
      amount: number;
      time: string;
      position_name: string;
      student_name: string;
      student_number: string;
      student_college_name: string;
    }[];
    dep: string;
  }) {
    try {
      this.ctx.set('Content-Type', 'application/octet-stream');
      this.ctx.attachment(`workload_${data.workloadList[0]!.time}.xlsx`);
      const workloadArray = data.workloadList.map((item, index) => [
        index + 1,
        item.position_name,
        item.student_number,
        item.student_name,
        item.student_college_name,
        item.amount,
      ]);
      workloadArray.unshift(['序号', '岗位名称', '学号', '姓名', '学生所在学院', '实际月工作量']);
      workloadArray.unshift([`用人单位名称（盖章）：${data.dep}`]);
      workloadArray.unshift([`${data.year} 年 ${data.month} 月研究生“${data.type}”考核汇总表`]);
      workloadArray.push(['负责人签字：']);
      const workload = XLSX.utils.aoa_to_sheet(workloadArray);
      workload['!merges'] = [{ s: { c: 0, r: 0 }, e: { c: 5, r: 0 } }];
      workload['!merges'].push({ s: { c: 0, r: 1 }, e: { c: 5, r: 1 } });
      workload['!merges'].push({
        s: { c: 0, r: workloadArray.length - 1 },
        e: { c: 5, r: workloadArray.length - 1 },
      });
      this.ctx.response.body = XLSX.write(
        { Sheets: { workload }, SheetNames: ['workload'] },
        { type: 'buffer' },
      );
    } catch {
      throw new CreateFileFailed();
    }
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
    return data as typeof data & { [K: string]: any };
  }

  private getAction(
    stuapply: StuapplyWithFK & { workload_status: string },
    auth: AuthResult,
    isAdmin: boolean,
    type: keyof typeof PositionType,
    time?: string,
  ) {
    time = time && `${time.slice(0, 4)}-${time.slice(4)}`;
    const actions: Map<CellAction, boolean> = new Map();
    const timeRange = [stuapply.position_start_t || '0', stuapply.position_end_t || '9'];
    timeRange[0] = timeRange[0].slice(0, 7);
    timeRange[1] = timeRange[1].slice(0, 7);
    const editDisabled =
      !['未上报', '草稿'].includes(stuapply.workload_status!) ||
      (!!time && (timeRange[0] > time || time > timeRange[1]));
    if (isAdmin) {
      actions.set(CellAction.Edit, !editDisabled);
      actions.set(CellAction.Audit, !['未上报', '草稿'].includes(stuapply.workload_status!));
    } else {
      if (type === 'teach' && auth.auditableDep.includes(stuapply.position_department_code)) {
        actions.set(CellAction.Edit, !editDisabled);
        actions.set(CellAction.Audit, stuapply.workload_status === '待审核');
      } else if (stuapply.position_staff_jobnum === auth.user.loginname)
        actions.set(CellAction.Edit, !editDisabled);
    }
    return actions;
  }
}
