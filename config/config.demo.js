// ref: https://umijs.org/config/
import { join } from 'path';

export default {
  alias: {
    'isomorphic-fetch': join(__dirname, './mock.js'),
  },
};
