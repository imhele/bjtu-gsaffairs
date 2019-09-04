import { Controller } from 'egg';

export default class AccountController extends Controller {
  public async create() {
    this.ctx.body = await this.service.account.create();
  }

  public async remove() {
    const { accountId } = this.ctx.params;
    this.ctx.body = await this.service.account.remove(accountId);
  }
}
