// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportPosition from '../../../app/controller/position';
import ExportUser from '../../../app/controller/user';

declare module 'egg' {
  interface IController {
    position: ExportPosition;
    user: ExportUser;
  }
}
