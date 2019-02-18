import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1550500108095_1703';

  // Nginx proxy
  config.proxy = true;

  // Middleware
  config.middleware = [];

  // `bodyParser` will parse body to object automatically
  config.bodyParser = {
    jsonLimit: '1mb',
    formLimit: '1mb',
  };

  // `listen.path` supports unix sock path
  config.cluster = {
    listen: {
      path: '',
      port: 7001,
    },
  };

  // 404 not found
  config.notfound = {
    pageUrl: '/exception/404',
  };

  const bizConfig = {};

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
