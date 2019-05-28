import moment from 'moment';
import { Context } from 'egg';
import { Op } from 'sequelize';
import { SystemClosed } from '../errcode';

export default (): any => {
  return async ({ model, request }: Context, next: () => Promise<any>) => {
    const config = (await model.Interships.Config.findOne()) as any;
    if (config) request.config = config.get();
    if (!request.auth.scope.includes('scope.admin')) {
      const now = moment().unix();
      const where = { used: 1 };
      if (request.path.startsWith('/api/position')) {
        Object.assign(where, {
          [Op.or]: [{ position_end: { [Op.lt]: now } }, { position_start: { [Op.gt]: now } }],
        });
        const configs = await model.Interships.Config.findAll({ where });
        if (configs.length) throw new SystemClosed('岗位管理系统暂未开放');
      } else if (request.path.startsWith('/api/stuapply')) {
        Object.assign(where, {
          [Op.or]: [{ apply_end: { [Op.lt]: now } }, { apply_start: { [Op.gt]: now } }],
        });
        const configs = await model.Interships.Config.findAll({ where });
        if (configs.length) throw new SystemClosed('岗位申请系统暂未开放');
      }
    }
    await next();
  };
};
