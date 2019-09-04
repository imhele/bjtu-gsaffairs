// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAccount from '../../../app/model/account';
import ExportCensus from '../../../app/model/census';
import ExportStaff from '../../../app/model/staff';

declare module 'egg' {
  interface IModel {
    Account: ReturnType<typeof ExportAccount>;
    Census: ReturnType<typeof ExportCensus>;
    Staff: ReturnType<typeof ExportStaff>;
  }
}
