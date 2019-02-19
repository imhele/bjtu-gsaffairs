import { UserType } from '../service/user';
import { Postgraduate, Staff } from '../model';

interface RequestExtend {
  auth: {
    user: Postgraduate | Staff;
    scope: string[];
    type: UserType;
  };
}

export default {} as RequestExtend;
