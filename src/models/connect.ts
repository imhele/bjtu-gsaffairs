import { GlobalState } from './global';
import { LoginState } from './login';

export { LoginState, GlobalState };

export type Dispatch = (
  action: {
    type: string;
    payload?: any;
  },
) => any;

export interface Loading {
  global: boolean;
  effects: object;
  models: {
    globale?: boolean;
    login?: boolean;
  };
}

export interface ConnectState {
  global: GlobalState;
  login: LoginState;
  loading: Loading;
}

export interface ConnectProps extends React.Props<any> {
  dispatch?: Dispatch;
  location?: Location;
}

export default ConnectState;
