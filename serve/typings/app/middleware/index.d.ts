// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportErrcode from '../../../app/middleware/errcode';

declare module 'egg' {
  interface IMiddleware {
    errcode: typeof ExportErrcode;
  }
}
