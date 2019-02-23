import { Controller } from 'egg';
import { CellAction } from '../link';
import { AuthorizeError } from '../errcode';
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
}
