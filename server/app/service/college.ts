import { DefineCollege } from '@/model/college';
import { validateAttr } from '@/utils';
import { Service } from 'egg';
import { Op } from 'sequelize';
import { promisify } from 'util';

export default class CollegeService extends Service {
  static RedisKey = {
    name: (code: string) => `college:name:${code}`,
  };

  public async getCollegesName(...codeList: string[]) {
    codeList = codeList.map(code => validateAttr(DefineCollege, { code }).code);
    const batch = this.app.redis.$.batch();
    codeList.forEach(code => {
      code = validateAttr(DefineCollege, { code }).code;
      batch.get(CollegeService.RedisKey.name(code));
    });
    const collegesName: (string | null)[] = await promisify(batch.exec.bind(this.app.redis.$))();
    if (collegesName.some(name => name === null)) {
      const codeOfNameIsNull = codeList.filter((_, index) => collegesName[index] === null);
      /** try query from mysql */
      const instances = await this.ctx.model.College.findAll({
        attributes: ['code', 'name'],
        where: { code: { [Op.or]: codeOfNameIsNull } },
      });
      instances.forEach(instance => {
        const index = codeList.indexOf(instance.get('code'));
        if (index < 0) return;
        collegesName[index] = instance.get('name');
      });
      /** redis 中不存在但 mysql 中查询成功，则异步加载缓存 */
      if (instances.length) this.protectedLoadCache();
    }
    return collegesName;
  }

  public async loadCache() {
    let offset = 0;
    const batch = this.app.redis.$.batch();
    const count = await this.ctx.model.College.count({});
    while (offset < count) {
      const chunk = await this.ctx.model.College.findAll({
        attributes: ['code', 'name'],
        limit: 100,
        offset,
      });
      chunk.forEach(instance => {
        const value = instance.get('name');
        const key = CollegeService.RedisKey.name(instance.get('code'));
        batch.set(key, value);
      });
      await promisify(batch.exec.bind(this.app.redis.$))();
      offset = offset + 100;
    }
  }

  public async protectedLoadCache() {
    try {
      return this.loadCache();
    } catch (error) {
      return console.error(error);
    }
  }
}
