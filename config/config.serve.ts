import { IConfig } from 'umi-types';

export default {
  proxy: {
    '/api': {
      target: 'http://localhost:7001/',
      changeOrigin: true,
    },
  },
} as IConfig;
