import { Controller } from 'egg';
import { parseJSON } from '../utils';
import { CellAction } from '../link';
import { ScopeList } from '../service/user';
import { AuthorizeError, DataNotFound } from '../errcode';
import { PositionType } from '../model/interships/position';
import { excludeFormFields, applyReturn } from './stuapply.json';
import {
  ApplyAuditStatus,
  IntershipsStuapply as StuapplyModel,
} from '../model/interships/stuapply';

export default class UserController extends Controller {
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
