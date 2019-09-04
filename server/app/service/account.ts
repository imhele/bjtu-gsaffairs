import { Account, AccountScope, DefineAccount } from '@/model/account';
import { SUUID, validateAttr, validateModel } from '@/utils';
import { AccessDeny, NotFound } from '@/utils/errorcode';
import { Service } from 'egg';
import sequelize from 'sequelize';

/**
 * Service of auth
 */
export default class AccountService extends Service {
  static RedisKey = {
    secret: (accountId: string) => `secret:${accountId}`,
  };

  public authScope(scope: AccountScope, account: Account | null = this.ctx.request.account) {
    if (!account) return false;
    if (scope & account.scope) return true;
    /** 管理员放行 */
    if (account.scope & AccountScope.Admin) return true;
    return false;
  }

  public authScopeThrow(
    scope: AccountScope = AccountScope.Admin,
    message: string = '',
    account: Account | null = this.ctx.request.account,
  ) {
    if (!account) throw new NotFound('invalid token or account does not exists');
    if (scope & account.scope) return;
    /** 管理员放行 */
    if (account.scope & AccountScope.Admin) return;
    throw new AccessDeny(message);
  }

  public async bulkUpsert(accounts: Account[]) {
    accounts = accounts.map(account => validateModel(DefineAccount, account));
    const instances = await this.ctx.model.Account.bulkCreate(accounts, {
      updateOnDuplicate: Object.entries(DefineAccount.Attr)
        .filter(attr => !attr[1].primaryKey)
        .map(attr => attr[0]),
    });
    return { count: instances.length };
  }

  public async create(account: Account) {
    /** 密码默认生成随机字符串，也可手动指定 */
    account.password = account.password || SUUID(16);
    account = validateModel(DefineAccount, account);
    await this.ctx.model.Account.create(account);
    return account;
  }

  public async findOne(accountId: string) {
    const instance = await this.ctx.model.Account.findOne({
      where: validateAttr(DefineAccount, { accountId }),
    });
    return instance && instance.get();
  }

  public async list(scope: number = -1, limit?: number, offset?: number) {
    let where: sequelize.WhereOptions<Account & sequelize.Operators> | undefined = undefined;
    if (scope >= 0) {
      scope = validateAttr(DefineAccount, { scope }).scope;
      where = { [sequelize.Op.and]: [sequelize.literal(`(\`scope\` & ${scope})`)] };
    }
    const instances = await this.ctx.model.Account.findAndCountAll({ limit, offset, where });
    return {
      count: instances.count,
      rows: instances.rows.map(instance => instance.get()),
    };
  }

  public async remove(accountId: string) {
    const count = await this.ctx.model.Account.destroy({
      where: validateAttr(DefineAccount, { accountId }),
    });
    return { count };
  }

  public async update(accountId: string, updateAttrs: Partial<Account>) {
    const validatedAttrs = validateAttr(DefineAccount, { ...updateAttrs, id: accountId });
    const instances = await this.ctx.model.Account.update(
      this.app.lodash.omit(validatedAttrs, 'id'),
      { where: this.app.lodash.pick(validatedAttrs, 'id') },
    );
    return { count: instances.length };
  }
}
