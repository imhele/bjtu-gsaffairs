import { GlobalState } from './global';
import { LoginState } from './login';
import { PositionState } from '@/pages/Position/models/position';

export { GlobalState, LoginState, PositionState };

export type Dispatch = <T = any, U = () => void>(
  action: {
    type: string;
    payload?: T;
    callback?: U;
  },
) => any;

export interface Loading {
  global: boolean;
  effects: object;
  models: {
    globale?: boolean;
    login?: boolean;
    position?: boolean;
  };
}

export interface ConnectState {
  global: GlobalState;
  login: LoginState;
  loading: Loading;
  position?: PositionState;
}

export interface ConnectProps extends React.Props<any> {
  dispatch?: Dispatch;
  location?: Location;
}

export default ConnectState;
