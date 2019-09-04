// import { Account, DefineAccount } from '@/model/account';
// import { SUUID, validateAttr, ErrCode } from '@/utils';
import { Service } from 'egg';

/**
 * Service of auth
 */
export default class AccountService extends Service {
  static RedisKey = {
    secret: (accountId: string) => `secret:${accountId}`,
  };

  public async bulkUpsert() {}

  public async create() {}

  public async findOne() {}

  public async list() {}

  public async remove() {}

  public async update() {}
}
