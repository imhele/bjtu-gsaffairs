// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportPosition from '../../../app/controller/position';
import ExportPositionFilter from '../../../app/controller/positionFilter';
import ExportUser from '../../../app/controller/user';

declare module 'egg' {
  interface IController {
    position: ExportPosition;
    positionFilter: ExportPositionFilter;
    user: ExportUser;
  }
}
