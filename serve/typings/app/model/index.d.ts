// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportClientPostgraduate from '../../../app/model/client/postgraduate';
import ExportClientStaff from '../../../app/model/client/staff';
import ExportDictsCollege from '../../../app/model/dicts/college';
import ExportDictsDepartment from '../../../app/model/dicts/department';
import ExportIntershipsAdmins from '../../../app/model/interships/admins';
import ExportIntershipsConfig from '../../../app/model/interships/config';
import ExportIntershipsPosition from '../../../app/model/interships/position';
import ExportIntershipsStuapply from '../../../app/model/interships/stuapply';
import ExportPeopleStaff from '../../../app/model/people/staff';
import ExportSchoolCensus from '../../../app/model/school/census';
import ExportTaskTeacher from '../../../app/model/task/teacher';
import ExportTaskTeaching from '../../../app/model/task/teaching';

declare module 'sequelize' {
  interface Sequelize {
    Client: {
      Postgraduate: ReturnType<typeof ExportClientPostgraduate>;
      Staff: ReturnType<typeof ExportClientStaff>;
    }
    Dicts: {
      College: ReturnType<typeof ExportDictsCollege>;
      Department: ReturnType<typeof ExportDictsDepartment>;
    }
    Interships: {
      Admins: ReturnType<typeof ExportIntershipsAdmins>;
      Config: ReturnType<typeof ExportIntershipsConfig>;
      Position: ReturnType<typeof ExportIntershipsPosition>;
      Stuapply: ReturnType<typeof ExportIntershipsStuapply>;
    }
    People: {
      Staff: ReturnType<typeof ExportPeopleStaff>;
    }
    School: {
      Census: ReturnType<typeof ExportSchoolCensus>;
    }
    Task: {
      Teacher: ReturnType<typeof ExportTaskTeacher>;
      Teaching: ReturnType<typeof ExportTaskTeaching>;
    }
  }
}
