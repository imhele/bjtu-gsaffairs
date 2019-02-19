// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportClientPostgraduate from '../../../app/model/client/postgraduate';
import ExportClientStaff from '../../../app/model/client/staff';

declare module 'sequelize' {
  interface Sequelize {
    Client: {
      Postgraduate: ReturnType<typeof ExportClientPostgraduate>;
      Staff: ReturnType<typeof ExportClientStaff>;
    }
  }
}
