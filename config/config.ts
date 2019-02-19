// ref: https://umijs.org/config/
import routes from './routes';
import { IConfig, IRoute } from 'umi-types';

const config: IConfig = {
  // Reference: https://github.com/umijs/umi/pull/2001
  routes: routes as IRoute[],
  treeShaking: true,
  ignoreMomentLocale: true,
  targets: {
    ie: 11,
    android: 4,
  },
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        // hardSource: true,
        title: 'bjtu-papms',
        dva: {
          hmr: true,
          immer: true,
        },
        dynamicImport: {
          level: 5,
          webpackChunkName: true,
          loadingComponent: './components/PageLoading',
        },
        locale: {
          enable: true,
          default: 'zh-CN',
        },
      },
    ],
    // ref: https://github.com/imhele/umi-plugin-nprogress
    'umi-plugin-nprogress',
  ],
};

export default config;
