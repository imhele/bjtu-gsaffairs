// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportClientPostgraduate from '../../../app/model/client/postgraduate';
import ExportClientStaff from '../../../app/model/client/staff';
import ExportDictsDepartment from '../../../app/model/dicts/department';
import ExportIntershipsAdmins from '../../../app/model/interships/admins';
import ExportIntershipsPosition from '../../../app/model/interships/position';

declare module 'sequelize' {
  interface Sequelize {
    Client: {
      Postgraduate: ReturnType<typeof ExportClientPostgraduate>;
      Staff: ReturnType<typeof ExportClientStaff>;
    }
    Dicts: {
      Department: ReturnType<typeof ExportDictsDepartment>;
    }
    Interships: {
      Admins: ReturnType<typeof ExportIntershipsAdmins>;
      Position: ReturnType<typeof ExportIntershipsPosition>;
    }
  }
}
