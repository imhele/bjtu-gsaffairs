// ref: https://umijs.org/config/
import routes from './routes';

export default {
  routes,
  treeShaking: true,
  ignoreMomentLocale: true,
  publicPath: 'https://cdn.imhele.com/bjtu-papms/',
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        hardSource: true,
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
    // ref: https://github.com/imhele/umi-plugin-oss
    ['umi-plugin-oss', {
      acl: 'public-read',
      bijection: true,
      bucket: {
        name: 'imhele',
        endpoint: 'oss-cn-beijing.aliyuncs.com',
      },
    }],
  ],
};
