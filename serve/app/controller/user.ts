import moment from 'moment';
import { Controller } from 'egg';
import { AuthorizeError } from '../errcode';
// import { LoginPayload } from '../../../src/services/login';

export default class HomeController extends Controller {
  public async login() {
    const {
      config: {
        other: { loginRedirect: redirect },
      },
      ctx: { request, response },
      service,
    } = this;
    const { account = '', method = '', psw = '', timestamp = 0 } = request.query as any;
    if (method !== 'psw' || !psw || !timestamp) {
      return this.loginFail('登录参数缺失');
    }
    const timeDiff = moment().unix() - Math.floor(timestamp);
    if (timeDiff > 30 || timeDiff < 0) {
      return this.loginFail('密钥已失效，请重新登陆');
    }
    const { user } = await service.user.findOne(account);
    if (user === null) {
      return this.loginFail('账户不存在');
    }
    const resign = service.user.getSign(user.loginname, user.password, timestamp);
    if (resign !== psw) {
      return this.loginFail();
    }
    const token = service.user.getToken(user.loginname, user.password);
    response.body = { token, redirect };
  }

  private loginFail(message: string = '账户名或密码不正确') {
    throw new AuthorizeError(message);
  }
}
