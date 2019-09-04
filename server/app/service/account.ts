import { Account, DefineAccount } from '@/model/account';
import { SUUID, validateAttr, ErrCode } from '@/utils';
import { Service } from 'egg';

/**
 * Service of auth
 */
export default class AccountService extends Service {
  static RedisKey = {
    secret: (accountId: string) => `secret:${accountId}`,
  };
  public async create() {
    const instance: Account = {
      accountId: SUUID(18),
      secret: SUUID(22),
    };
    await Promise.all([
      this.ctx.model.Account.create(instance),
      this.app.redis.set(AccountService.RedisKey.secret(instance.accountId), instance.secret),
    ]);
    return instance;
  }

  public async remove(accountId: string) {
    const where = validateAttr(DefineAccount, { accountId });
    await Promise.all([
      this.app.redis.del(AccountService.RedisKey.secret(where.accountId)),
      this.ctx.model.Account.destroy({ where }),
    ]);
    return ErrCode.Succeed;
  }
}
