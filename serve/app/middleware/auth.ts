import moment from 'moment';
import { Context } from 'egg';
import { AuthorizeError } from '../errcode';

export interface MiddlewareAuthConfig {
  expiresIn?: number;
  header?: string;
  message?: string;
}

const defaultConfig: MiddlewareAuthConfig = {
  expiresIn: 7200,
  header: 'Authorization',
};

export default (): any => {
  return async (ctx: Context, next: () => Promise<any>) => {
    const config: Required<MiddlewareAuthConfig> = { ...defaultConfig, ...ctx.app.config.auth };
    const { expiresIn, header, message } = config;
    const tokenArr = ctx.request.get(header).split(' ');
    if (tokenArr.length !== 3) throw new AuthorizeError(message);
    const [timestamp, loginname, signature] = tokenArr;
    const userInfo = await ctx.service.user.findOne(loginname);
    if (userInfo.user === null) throw new AuthorizeError(message);
    if (userInfo.user.last_login) {
      const timeDiff = moment().diff(userInfo.user.last_login, 'seconds');
      if (timeDiff < 0 || timeDiff > expiresIn) throw new AuthorizeError(message);
    }
    const resign = ctx.service.user.getSign(
      userInfo.user.loginname,
      userInfo.user.password,
      timestamp,
    );
    if (resign !== signature) throw new AuthorizeError(message);
    Object.assign(ctx.request, { auth: userInfo });
    await next();
  };
};
