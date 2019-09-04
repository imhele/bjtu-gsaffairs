// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAccount from '../../../app/service/account';
import ExportCollege from '../../../app/service/college';
import ExportDepartment from '../../../app/service/department';

declare module 'egg' {
  interface IService {
    account: ExportAccount;
    college: ExportCollege;
    department: ExportDepartment;
  }
}
