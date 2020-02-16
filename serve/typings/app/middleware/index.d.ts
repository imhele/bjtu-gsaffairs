// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAuth from '../../../app/middleware/auth';
import ExportErrcode from '../../../app/middleware/errcode';
import ExportTimerange from '../../../app/middleware/timerange';

declare module 'egg' {
  interface IMiddleware {
    auth: typeof ExportAuth;
    errcode: typeof ExportErrcode;
    timerange: typeof ExportTimerange;
  }
}
