import { Controller } from 'egg';
import { CellAction } from '../link';
import { AuthorizeError } from '../errcode';
import { excludeFormFields } from './stuapply.json';
import { PositionType } from '../model/interships/position';

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
}
