import { LoginState } from './login';

export type LoginState = LoginState;

export type Dispatch = (action: {
  type: string;
  payload?: any;
}) => any;

export interface Loading {
  global: boolean;
  effects: object;
  models: {
    login?: boolean;
  };
}

export interface ConnectState {
  login: LoginState;
  loading: Loading;
}

export interface ConnectProps extends React.Props<any> {
  dispatch?: Dispatch;
  location?: Location;
}

export default ConnectState;
