// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportUser from '../../../app/service/user';

declare module 'egg' {
  interface IService {
    user: ExportUser;
  }
}
