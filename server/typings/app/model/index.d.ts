// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAccount from '../../../app/model/account';
import ExportCensus from '../../../app/model/census';
import ExportCollege from '../../../app/model/college';
import ExportDepartment from '../../../app/model/department';
import ExportDiscipline from '../../../app/model/discipline';
import ExportStaff from '../../../app/model/staff';

declare module 'egg' {
  interface IModel {
    Account: ReturnType<typeof ExportAccount>;
    Census: ReturnType<typeof ExportCensus>;
    College: ReturnType<typeof ExportCollege>;
    Department: ReturnType<typeof ExportDepartment>;
    Discipline: ReturnType<typeof ExportDiscipline>;
    Staff: ReturnType<typeof ExportStaff>;
  }
}
