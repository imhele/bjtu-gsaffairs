import { GlobalState } from './global';
import { LoginState } from './login';
import { ResultState } from './result';
import { PositionState } from '@/models/position';
import { AdminState } from '@/pages/Admin/models/admin';
import { StuapplyState } from '@/pages/Stuapply/models/stuapply';

export { AdminState, GlobalState, LoginState, PositionState, ResultState, StuapplyState };

export type Dispatch = <T = any, U = (payload: T) => void>(action: {
  type: string;
  payload?: T;
  callback?: U;
}) => any;

export interface Loading {
  global: boolean;
  effects: object;
  models: {
    admin?: boolean;
    global?: boolean;
    login?: boolean;
    position?: boolean;
    result?: boolean;
    stuapply?: boolean;
  };
}

export interface ConnectState {
  admin?: AdminState;
  global: GlobalState;
  login: LoginState;
  loading: Loading;
  position: PositionState;
  result: ResultState;
  stuapply?: StuapplyState;
}

export interface ConnectProps<T extends object = {}> extends React.Props<any> {
  dispatch?: Dispatch;
  location?: Location;
  match?: {
    isExact: boolean;
    params: { [key in keyof T]: T[key] };
    path: string;
    url: string;
  };
}

export default ConnectState;
