import { Controller } from 'egg';
// import { LoginPayload } from '../../../src/services/login';

export default class PositionController extends Controller {
  public async list() {
    const {
      ctx: { response },
      service,
    } = this;
    response.body = await service.position.findOne(3);
  }
}
