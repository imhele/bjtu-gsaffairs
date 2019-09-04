import { validatePagination } from '@/utils';
import { Controller } from 'egg';

export default class AccountController extends Controller {
  public async bulkUpsert() {
    this.service.account.authScopeThrow();
    this.ctx.body = await this.service.account.bulkUpsert(this.ctx.request.body);
  }

  public async create() {
    this.service.account.authScopeThrow();
    this.ctx.body = await this.service.account.create(this.ctx.request.body);
  }

  public async findOne() {
    this.service.account.authScopeThrow();
    const { accountId } = this.ctx.params;
    this.ctx.body = await this.service.account.findOne(accountId);
  }

  public async list() {
    this.service.account.authScopeThrow();
    const { limit, offset } = validatePagination(this.ctx);
    this.ctx.body = await this.service.account.list(this.ctx.query.scope, limit, offset);
  }

  public async remove() {
    this.service.account.authScopeThrow();
    const { accountId } = this.ctx.params;
    this.ctx.body = await this.service.account.remove(accountId);
  }

  public async update() {
    this.service.account.authScopeThrow();
    const { accountId } = this.ctx.params;
    this.ctx.body = await this.service.account.update(accountId, this.ctx.request.body);
  }
}
