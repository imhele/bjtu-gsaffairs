import { DefineDepartment } from '@/model/department';
import { validateAttr } from '@/utils';
import { Service } from 'egg';
import { Op } from 'sequelize';
import { promisify } from 'util';

export default class DepartmentService extends Service {
  public async getDepartmentsName(...codeList: string[]) {
    codeList = codeList.map(code => validateAttr(DefineDepartment, { code }).code);
    const fallabck = codeList.concat().fill(null!);
    const departmentsName = (await this.app.redis.hmget('department:name', codeList)) || fallabck;
    if (!departmentsName || departmentsName.includes(null)) {
      const codeOfNameIsNull = codeList.filter((_, index) => departmentsName[index] === null);
      /** try query from mysql */
      const instances = await this.ctx.model.Department.findAll({
        attributes: ['code', 'name'],
        where: { code: { [Op.or]: codeOfNameIsNull } },
      });
      if (instances.length) {
        /** redis 中不存在但 mysql 中查询成功，则异步加载缓存 */
        this.protectedLoadCache();
        instances.forEach(instance => {
          const index = codeList.indexOf(instance.get('code'));
          if (index >= 0) departmentsName[index] = instance.get('name');
        });
      }
    }
    return departmentsName;
  }

  public async loadCache() {
    const batch = this.app.redis.$.batch();
    const count = await this.ctx.model.Department.count({});
    for (let offset = 0; offset < count; offset += 500) {
      const chunk = await this.ctx.model.Department.findAll({
        attributes: ['code', 'name'],
        limit: 500,
        offset,
      });
      const hashMap = chunk
        .map(instance => [instance.get('code'), instance.get('name')])
        .reduce<string[]>((prev, curr) => [...prev, ...curr], []);
      batch.hmset('department:name', ...hashMap);
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
