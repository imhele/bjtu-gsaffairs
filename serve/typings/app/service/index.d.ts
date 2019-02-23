// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportPosition from '../../../app/service/position';
import ExportStuapply from '../../../app/service/stuapply';
import ExportUser from '../../../app/service/user';

declare module 'egg' {
  interface IService {
    position: ExportPosition;
    stuapply: ExportStuapply;
    user: ExportUser;
  }
}
