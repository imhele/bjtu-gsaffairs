// ref: https://umijs.org/config/
import routes from './routes';

export default {
  routes,
  treeShaking: true,
  ignoreMomentLocale: true,
  // Remove the following two lines and umi-plugin-oss when deploying formally
  // Preview site at https://imhele.com/bjtu-papms/
  base: 'bjtu-papms',
  publicPath: 'https://cdn.imhele.com/bjtu-papms/',
  targets: {
    ie: 11,
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
