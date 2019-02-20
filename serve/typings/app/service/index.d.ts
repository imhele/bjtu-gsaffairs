// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportPosition from '../../../app/service/position';
import ExportUser from '../../../app/service/user';

declare module 'egg' {
  interface IService {
    position: ExportPosition;
    user: ExportUser;
  }
}
