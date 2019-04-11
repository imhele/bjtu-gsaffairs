import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import { MiddlewareAuthConfig } from '../app/middleware/auth';

export default (appInfo: EggAppInfo): PowerPartial<EggAppConfig> & typeof bizConfig => {
  const config = {} as PowerPartial<EggAppConfig>;

  /**
   * System configuration
   */
  // Key of cookies
  config.keys = appInfo.name + '_1550500108095_1703';

  // config.secretKey = 'test';

  // Nginx proxy
  config.proxy = true;

  /**
   * Middlewares and their configuration
   */
  // Enabled global middlewares
  config.middleware = ['errcode', 'auth', 'timerange'];

  config.errcode = {
    enable: true,
    successIgnore: ['/api/stuapply/:type/file/:id?', '/api/stuapply/workload/export'],
  };

  config.auth = {
    enable: true,
    loginAging: 7200,
    ignore: ['/api/login'],
  } as MiddlewareAuthConfig;

  config.timerange = {
    enable: true,
    ignore: [
      '/api/position/:type/list',
      '/api/stuapply/:type/list',
      '/api/position/:type/detail/:id',
    ],
  };

  // `bodyParser` will parse body to object automatically
  config.bodyParser = {
    jsonLimit: '1mb',
    formLimit: '1mb',
  };

  // 404 not found
  config.notfound = {
    pageUrl: '/exception/404',
  };

  // Security
  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: ['.bjtu.edu.cn'],
  };

  /**
   * Other configuration for controller or service
   */
  const bizConfig = {
    other: {
      loginRedirect: '/position/teach/list',
    },
  };

  return {
    ...config,
    ...bizConfig,
  };
};
