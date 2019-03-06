import moment from 'moment';
import { Controller } from 'egg';
import { AuthorizeError } from '../errcode';
// import { LoginPayload } from '../../../src/api/login';

export default class UserController extends Controller {
  public async login() {
    const {
      config: {
        other: { loginRedirect },
      },
      ctx: { request, response, ...ctx },
      service,
    } = this;
    const { method = '' } = request.body;
    if (method === 'psw') {
      const { account = '', psw = '', timestamp = 0 } = request.body as LoginPayload;
      if (!account || !psw || !timestamp) return this.loginFail('登录参数缺失');

      // check timestamp
      const timeDiff = moment().unix() - Math.floor(timestamp);
      if (timeDiff > 60 || timeDiff < -60) return this.loginFail('密钥已失效，请重新登陆');

      // find account and check signature
      const { user, type } = await service.user.findOne(account);
      if (user === null) return this.loginFail('账户不存在');
      const resign = service.user.getSign(user.loginname, user.password, timestamp);
      if (resign !== psw) return this.loginFail();

      // return token
      const token = service.user.getToken(user.loginname, user.password);
      service.user.updateLastLogin(user.loginname, type);
      response.body = { token, redirect: loginRedirect };
    } else {
      const { uid, md5, ts, redirect = loginRedirect } = request.body;
      if (!uid || !md5 || !ts) return this.loginFail('登录参数缺失');

      // check timestamp
      const timeDiff = moment().unix() - Math.floor(parseInt(ts, 10));
      if (timeDiff > 300 || timeDiff < -300) return this.loginFail('密钥已失效，请重新登陆');

      // find account and check signature
      const { user, type } = await service.user.findOne(uid);
      if (user === null) return this.loginFail('账户不存在');
      const resign = service.user.getMd5(user.loginname, ts);
      if (resign !== md5) return this.loginFail();

      const token = service.user.getToken(user.loginname, user.password);
      service.user.updateLastLogin(user.loginname, type);
      response.body = { errmsg: '登陆成功' };
      ctx.status = 302;
      ctx.set(
        'Location',
        `http://gsaffairs.bjtu.edu.cn/user/login?token=${token}&redirect=${redirect}`,
      );
    }
  }

  public async scope() {
    const {
      ctx: { request, response },
      service,
    } = this;
    const { user, scope, type } = request.auth;
    const token = service.user.getToken(user.loginname, user.password);
    service.user.updateLastLogin(user.loginname, type);
    response.body = { scope, token, username: user.username };
  }

  private loginFail(message: string = '账户名或密码不正确') {
    throw new AuthorizeError(message);
  }
}
