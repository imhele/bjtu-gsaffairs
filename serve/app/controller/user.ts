import moment from 'moment';
import { Controller } from 'egg';
import { AuthorizeError } from '../errcode';
// import { LoginPayload } from '../../../src/api/login';

export default class UserController extends Controller {
  public async login() {
    const {
      config: {
        other: { loginRedirect: redirect },
      },
      ctx: { request, response },
      service,
    } = this;
    const { account = '', method = '', psw = '', timestamp = 0 } = request.body as LoginPayload;
    if (method !== 'psw' || !psw || !timestamp) {
      return this.loginFail('登录参数缺失');
    }
    const timeDiff = moment().unix() - Math.floor(timestamp);
    // 服务器有 5 秒左右时差
    if (timeDiff > 30 || timeDiff < -5) {
      return this.loginFail('密钥已失效，请重新登陆');
    }
    const { user, type } = await service.user.findOne(account);
    if (user === null) {
      return this.loginFail('账户不存在');
    }
    const resign = service.user.getSign(user.loginname, user.password, timestamp);
    if (resign !== psw) {
      return this.loginFail();
    }
    const token = service.user.getToken(user.loginname, user.password);
    service.user.updateLastLogin(user.loginname, type);
    response.body = { token, redirect };
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
