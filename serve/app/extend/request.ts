import { UserType } from '../service/user';
import { PostgraduateModel, StaffModel } from '../model';

interface RequestExtend {
  auth: {
    user: PostgraduateModel | StaffModel;
    scope: string[];
    type: UserType;
  };
}

export default {} as RequestExtend;
