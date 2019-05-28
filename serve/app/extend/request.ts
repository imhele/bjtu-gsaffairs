import { UserType } from '../service/user';
import { Staff as StaffModel } from '../model/client/staff';
import { Postgraduate as PostgraduateModel } from '../model/client/postgraduate';
import { IntershipsConfig } from '../model/interships/config';

export interface AuthResult {
  /* 用人单位审核 auditableDep: [`${department_code}`] */
  auditableDep: string[];
  /* 可审核的其他环节 */
  auditLink: string[];
  scope: string[];
  type: UserType;
  user: PostgraduateModel | StaffModel;
}

interface RequestExtend {
  auth: AuthResult;
  config: Partial<IntershipsConfig>;
}

export default {
  auth: {
    auditableDep: [],
    auditLink: [],
    scope: [],
    type: UserType.Postgraduate,
    user: {} as any,
  },
  config: {},
} as RequestExtend;
