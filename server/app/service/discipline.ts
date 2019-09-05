import { DefineDiscipline } from '@/model/discipline';
import { validateAttr } from '@/utils';
import { Service } from 'egg';
import { Op } from 'sequelize';
import { promisify } from 'util';

export default class DisciplineService extends Service {
  public async getDisciplinesName(...codeList: string[]) {
    codeList = codeList.map(code => validateAttr(DefineDiscipline, { code }).code);
    const fallabck = codeList.concat().fill(null!);
    const disciplinesName = (await this.app.redis.hmget('discipline:name', codeList)) || fallabck;
    if (!disciplinesName || disciplinesName.includes(null)) {
      const codeOfNameIsNull = codeList.filter((_, index) => disciplinesName[index] === null);
      /** try query from mysql */
      const instances = await this.ctx.model.Discipline.findAll({
        attributes: ['code', 'name'],
        where: { code: { [Op.or]: codeOfNameIsNull } },
      });
      if (instances.length) {
        /** redis 中不存在但 mysql 中查询成功，则异步加载缓存 */
        this.protectedLoadCache();
        instances.forEach(instance => {
          const index = codeList.indexOf(instance.get('code'));
          if (index >= 0) disciplinesName[index] = instance.get('name');
        });
      }
    }
    return disciplinesName;
  }

  public async loadCache() {
    const batch = this.app.redis.$.batch();
    const count = await this.ctx.model.Discipline.count({});
    for (let offset = 0; offset < count; offset += 500) {
      const chunk = await this.ctx.model.Discipline.findAll({
        attributes: ['code', 'name'],
        limit: 500,
        offset,
      });
      const hashMap = chunk
        .map(instance => [instance.get('code'), instance.get('name')])
        .reduce<string[]>((prev, curr) => [...prev, ...curr], []);
      batch.hmset('discipline:name', ...hashMap);
    }
    await promisify(batch.exec.bind(this.app.redis.$))();
  }

  public async protectedLoadCache() {
    try {
      return this.loadCache();
    } catch (error) {
      return console.error(error);
    }
  }
}
