// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAuth from '../../../app/middleware/auth';
import ExportChore from '../../../app/middleware/chore';
import ExportErrorcode from '../../../app/middleware/errorcode';
import ExportParser from '../../../app/middleware/parser';

declare module 'egg' {
  interface IMiddleware {
    auth: typeof ExportAuth;
    chore: typeof ExportChore;
    errorcode: typeof ExportErrorcode;
    parser: typeof ExportParser;
  }
}
