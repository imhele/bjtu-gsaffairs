// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAdmin from '../../../app/controller/admin';
import ExportPosition from '../../../app/controller/position';
import ExportPositionFilter from '../../../app/controller/positionFilter';
import ExportStuapply from '../../../app/controller/stuapply';
import ExportUser from '../../../app/controller/user';

declare module 'egg' {
  interface IController {
    admin: ExportAdmin;
    position: ExportPosition;
    positionFilter: ExportPositionFilter;
    stuapply: ExportStuapply;
    user: ExportUser;
  }
}
