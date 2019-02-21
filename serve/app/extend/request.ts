import { UserType } from '../service/user';
import { PostgraduateModel, StaffModel } from '../model';

interface RequestExtend {
  auth: {
    /* auditableDep: [`${department_code}`] */
    auditableDep: string[];
    scope: string[];
    type: UserType;
    user: PostgraduateModel | StaffModel;
  };
}

export default {
  auth: {
    auditableDep: [],
    scope: [],
    type: UserType.Postgraduate,
    user: {} as any,
  },
} as RequestExtend;
