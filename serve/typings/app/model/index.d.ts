// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportIndex from '../../../app/model/index';
import ExportClientIndex from '../../../app/model/client/index';
import ExportClientPostgraduate from '../../../app/model/client/postgraduate';
import ExportClientStaff from '../../../app/model/client/staff';
import ExportDictsDepartment from '../../../app/model/dicts/department';
import ExportDictsIndex from '../../../app/model/dicts/index';
import ExportIntershipsAdmins from '../../../app/model/interships/admins';
import ExportIntershipsIndex from '../../../app/model/interships/index';
import ExportIntershipsPosition from '../../../app/model/interships/position';
import ExportPeopleIndex from '../../../app/model/people/index';
import ExportPeopleStaff from '../../../app/model/people/staff';

declare module 'sequelize' {
  interface Sequelize {
    Index: ReturnType<typeof ExportIndex>;
    Client: {
      Index: ReturnType<typeof ExportClientIndex>;
      Postgraduate: ReturnType<typeof ExportClientPostgraduate>;
      Staff: ReturnType<typeof ExportClientStaff>;
    }
    Dicts: {
      Department: ReturnType<typeof ExportDictsDepartment>;
      Index: ReturnType<typeof ExportDictsIndex>;
    }
    Interships: {
      Admins: ReturnType<typeof ExportIntershipsAdmins>;
      Index: ReturnType<typeof ExportIntershipsIndex>;
      Position: ReturnType<typeof ExportIntershipsPosition>;
    }
    People: {
      Index: ReturnType<typeof ExportPeopleIndex>;
      Staff: ReturnType<typeof ExportPeopleStaff>;
    }
  }
}
