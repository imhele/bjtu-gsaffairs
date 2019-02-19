// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAuth from '../../../app/middleware/auth';
import ExportErrcode from '../../../app/middleware/errcode';

declare module 'egg' {
  interface IMiddleware {
    auth: typeof ExportAuth;
    errcode: typeof ExportErrcode;
  }
}
