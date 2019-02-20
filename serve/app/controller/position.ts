import { Controller } from 'egg';
import { PositionType } from '../model';
import { FetchDetailBody } from '../../../src/api/position';

export default class PositionController extends Controller {
  public async list() {
    const {
      ctx: { response },
      service,
    } = this;
    response.body = '0';
    await service.position.updateOne(3, { types: 2 });
  }

  public async detail() {
    const { ctx, service } = this;
    const { type } = ctx.params;
    if (!Object.keys(PositionType).includes(type)) return;
    const { key } = ctx.request.body as FetchDetailBody;
    if (!key) return;
    const position = await service.position.findOne(key);
    ctx.response.body = { a: 0 };
  }
}
