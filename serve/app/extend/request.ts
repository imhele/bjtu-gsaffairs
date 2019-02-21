import { UserType } from '../service/user';
import { PostgraduateModel, StaffModel } from '../model';

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
}

export default {
  auth: {
    auditableDep: [],
    auditLink: [],
    scope: [],
    type: UserType.Postgraduate,
    user: {} as any,
  },
} as RequestExtend;
