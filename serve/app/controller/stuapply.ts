import { Controller } from 'egg';
import { CellAction } from '../link';
import { ActionText } from './position';
import { ScopeList } from '../service/user';
import { Op, WhereOptions } from 'sequelize';
import { getFromIntEnum, parseJSON } from '../utils';
import { AuthorizeError, DataNotFound } from '../errcode';
import { excludeFormFields, applyReturn } from './stuapply.json';
import { SchoolCensus as SchoolCensusModel } from '../model/school/census';
import {
  ApplyAuditStatus,
  IntershipsStuapply as StuapplyModel,
  ApplyStatus,
} from '../model/interships/stuapply';
import {
  attr as PositionAttr,
  PositionType,
  Position as PositionModel,
} from '../model/interships/position';

export default class UserController extends Controller {
  public async list() {
    const { ctx, service } = this;
    const { auth, body } = ctx.request;
    const { type } = ctx.params as { type: keyof typeof PositionType };
    const positionType = getFromIntEnum(PositionAttr, 'types', null, PositionType[type]);
    if (positionType === -1) return;
    const { limit = 10, offset = 0, status = null } = body;
    const applyFilters = [] as WhereOptions<StuapplyModel>[];
    const positionFilters = [{ types: positionType }] as WhereOptions<PositionModel>[];
    let search: any = typeof body.search === 'string' && body.search ? body.search : '';
    if (search) search = { [Op.like]: `%${search}%` };
    if (search) positionFilters.push({ name: search, address: search, work_time_d: search });
    if (!auth.scope.includes(ScopeList.admin)) {
      if (auth.auditLink.length)
        applyFilters.push({
          [Op.or]: auth.auditLink
            .map(i => ({ audit: ApplyAuditStatus.indexOf(i) }))
            .filter(i => i.audit !== -1),
        });
      if (auth.auditableDep.length)
        positionFilters.push({ [Op.or]: auth.auditableDep.map(i => ({ department_code: i })) });
      if (auth.scope.includes(ScopeList.position[type].create))
        positionFilters.push({ staff_jobnum: auth.user.loginname });
      if (auth.scope.includes(ScopeList.position[type].apply))
        applyFilters[0].student_number = auth.user.loginname;
    }

    /**
     * Qurey batabase
     */
    const options = {
      limit,
      offset,
      where: { [Op.or]: applyFilters } as WhereOptions<StuapplyModel>,
    };
    const include = [
      { model: ctx.model.School.Census },
      { model: ctx.model.Interships.Position, where: { [Op.and]: positionFilters } },
    ];
    if (status && Object.keys(ApplyStatus).includes(status))
      Object.assign(options.where, ctx.model.Interships.Stuapply.formatBack({ status }));
    if (search) {
      options.where.student_number = search;
      Object.assign(include[0], { where: { name: search } as WhereOptions<SchoolCensusModel> });
    }
    const { positions, total } = await service.stuapply.findAndCountAll(options, include);

    /**
     * Format dataSource
     */
    const dataSource = positions.map(item => {
      const availableActions = service.stuapply.authorize(item, auth, type);
      const action: StandardTableActionProps = Array.from(availableActions.entries())
        .filter(([_, enable]) => enable)
        .map(([actionItem]) => ({
          text: ActionText[actionItem],
          type: actionItem,
        }));
      return { ...item, action };
    });

    /**
     * Construct result
     */
    const result: Partial<PositionState> = {
      columns: Object.values(service.stuapply.getColumnsObj()),
      dataSource,
      total,
      rowKey: 'id',
    };

    ctx.response.body = result;
  }

  public async form() {
    const {
      ctx: { request, response, model, params },
      service,
    } = this;
    /* position id */
    const { type, id } = params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;
    const position = await service.position.findOne(parseInt(id, 10));
    const availableAction = service.position.getPositionAction(position, request.auth, type);
    if (!availableAction.get(CellAction.Apply)) throw new AuthorizeError('你暂时无法申请此岗位');
    if (service.stuapply.hasApplied(parseInt(id, 10), request.auth.user.loginname))
      throw new AuthorizeError('你已经申请过这个岗位了，去找找其他岗位吧');

    const formItems = model.Interships.Stuapply.toForm(excludeFormFields as any, true);
    response.body = { formItems };
  }

  public async create() {
    const {
      ctx: { request, response, model, params },
      service,
    } = this;
    /* position id */
    const { type, id } = params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;
    const position = await service.position.findOne(parseInt(id, 10));
    const availableAction = service.position.getPositionAction(position, request.auth, type);
    if (!availableAction.get(CellAction.Apply)) throw new AuthorizeError('你暂时无法申请此岗位');
    if (service.stuapply.hasApplied(parseInt(id, 10), request.auth.user.loginname))
      throw new AuthorizeError('你已经申请过这个岗位了，去找找其他岗位吧');

    const values = model.Interships.Stuapply.formatBack({
      ...request.body,
      position_id: position.id,
      student_number: request.auth.user.loginname,
      status: '待审核',
      audit: ApplyAuditStatus[1],
      audit_log: JSON.stringify([
        service.position.getAuditLogItem(request.auth, ApplyAuditStatus[0]),
      ]),
    } as StuapplyModel<true>);
    await service.stuapply.addOne(values as any);

    response.body = {
      ...applyReturn,
      stepsProps: {
        current: 1,
        steps: ApplyAuditStatus.map(title => ({ title })),
      },
      extra: {
        ...applyReturn.extra,
        dataSource: {
          name: position.name,
          phone: request.body.phone,
          work_time_l: position.work_time_l,
        },
      },
    };
  }

  public async delete() {
    const {
      ctx: { request, response, params },
      service,
    } = this;
    /* apply id */
    const { type, id } = params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;
    const apply = await service.stuapply.findOne(parseInt(id, 10));
    if (
      apply.student_number !== request.auth.user.loginname &&
      !request.auth.scope.includes(ScopeList.admin)
    )
      throw new AuthorizeError('你暂时没有权限删除这条申请记录');

    await service.stuapply.deleteOne(parseInt(id, 10));
    response.body = { errmsg: '删除成功' };
  }

  public async edit() {
    const {
      ctx: { request, response, model, params },
      service,
    } = this;
    const { type, id } = params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;
    const apply = await service.stuapply.findOne(parseInt(id, 10));
    if (
      apply.student_number !== request.auth.user.loginname &&
      !request.auth.scope.includes(ScopeList.admin)
    )
      throw new AuthorizeError('你暂时没有权限编辑这条申请记录');

    delete request.body.id;
    delete request.body.position_id;
    delete request.body.student_number;
    const values = model.Interships.Stuapply.formatBack({
      ...request.body,
      status: '待审核',
      audit: ApplyAuditStatus[1],
      audit_log: JSON.stringify([
        ...parseJSON(apply.audit_log),
        service.position.getAuditLogItem(request.auth, ApplyAuditStatus[0]),
      ]),
    } as StuapplyModel<true>);

    await service.stuapply.updateOne(parseInt(id, 10), values);
    response.body = { errmsg: '修改成功' };
  }

  public async audit() {
    const {
      ctx: { request, response, model, params },
      service,
    } = this;
    const { type, id } = params as { type: keyof typeof PositionType; id: string };
    if (!Object.keys(PositionType).includes(type) || id === void 0) return;
    const apply = await service.stuapply.findOne(parseInt(id, 10));
    const availableActions = service.stuapply.authorize(apply, request.auth, type);
    if (!availableActions.get(CellAction.Audit))
      throw new AuthorizeError('你暂时没有权限审核这条申请记录');
    let values = { status: request.body.status } as StuapplyModel;
    let auditStatusIndex: number = ApplyAuditStatus.indexOf(apply.audit);
    switch (request.body.status) {
      case '审核通过':
        auditStatusIndex++;
        break;
      case '审核不通过':
        values.status = '审核不通过';
        break;
      case '退回':
        auditStatusIndex = 0;
        values.status = '草稿';
        break;
      default:
        throw new DataNotFound('无效的审核选项');
    }
    values.audit = ApplyAuditStatus[auditStatusIndex];
    const opinion = Array.isArray(request.body.opinion) ? request.body.opinion : [];
    values.audit_log = JSON.stringify([
      ...parseJSON(apply.audit_log),
      service.position.getAuditLogItem(request.auth, apply.audit, request.body.status, ...opinion),
    ]);
    values = model.Interships.Stuapply.formatBack(values);
    await service.stuapply.updateOne(parseInt(id, 10), values as any);
    response.body = { errmsg: '审核成功' };
  }
}
