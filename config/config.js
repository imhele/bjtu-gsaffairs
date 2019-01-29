// ref: https://umijs.org/config/
import { join } from 'path';
import routes from './routes';

export default {
  routes,
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
  alias: {
    'isomorphic-fetch': join(__dirname, './mock.js'),
  },
};
