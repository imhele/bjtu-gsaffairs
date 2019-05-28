import moment from 'moment';
import { Context } from 'egg';
import { AuthorizeError } from '../errcode';

export interface MiddlewareAuthConfig {
  header?: string;
  loginAging?: number;
  message?: string;
  tokenAging?: number;
}

const defaultConfig: MiddlewareAuthConfig = {
  header: 'Authorization',
  loginAging: 7200,
  tokenAging: 86400,
};

export default (): any => {
  return async (ctx: Context, next: () => Promise<any>) => {
    const timConfig = (await ctx.model.Interships.Config.findOne()) as any;
    if (timConfig) ctx.request.config = timConfig.get();

    const config: Required<MiddlewareAuthConfig> = { ...defaultConfig, ...ctx.app.config.auth };
    const { header, loginAging, message, tokenAging } = config;
    // Token: `${timestamp} ${loginname} ${signature}`
    const tokenArr = ctx.request.get(header).split(' ');
    if (tokenArr.length !== 3) throw new AuthorizeError(message);
    const [timestamp, loginname, signature] = tokenArr;
    // The token obtained at the time of logging in `tokenAging` seconds ago is invalid.
    const tokenTimeDiff = moment().unix() - parseInt(timestamp, 10);
    if (tokenTimeDiff < -5 || tokenTimeDiff > tokenAging) throw new AuthorizeError(message);
    const userInfo = await ctx.service.user.findOne(loginname);
    if (userInfo.user === null) throw new AuthorizeError(message);
    // If the user's last login distance is now more than `loginAging` seconds, the token will be invalid.
    if (!userInfo.user.last_login) throw new AuthorizeError(message);
    const loginTimeDiff = moment().diff(userInfo.user.last_login, 'seconds');
    if (loginTimeDiff < 0 || loginTimeDiff > loginAging) throw new AuthorizeError(message);
    // Check the signature
    const resign = ctx.service.user.getSign(
      userInfo.user.loginname,
      userInfo.user.password,
      timestamp,
    );
    if (resign !== signature) throw new AuthorizeError(message);
    ctx.request.auth = userInfo;
    await next();
  };
};
