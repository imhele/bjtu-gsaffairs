import { IConfig } from 'umi-types';

export default {
  proxy: {
    '/api': {
      target: 'http://gsaffairs.bjtu.edu.cn/',
      changeOrigin: true,
    },
  },
} as IConfig;
