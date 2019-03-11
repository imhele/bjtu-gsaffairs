// This file is created by egg-ts-helper@1.24.1
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportPosition from '../../../app/service/position';
import ExportStuapply from '../../../app/service/stuapply';
import ExportTeaching from '../../../app/service/teaching';
import ExportUser from '../../../app/service/user';

declare module 'egg' {
  interface IService {
    position: ExportPosition;
    stuapply: ExportStuapply;
    teaching: ExportTeaching;
    user: ExportUser;
  }
}
