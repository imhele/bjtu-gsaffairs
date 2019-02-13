import { Model } from 'dva';
import { message } from 'antd';
import router from 'umi/router';
import { LoginSignExpiresIn } from '@/global';
import { Scope } from '@/components/Authorized';
import { formatMessage } from 'umi-plugin-locale';
import { hmacSha256, setSign } from '@/utils/auth';
import { fetchScope, login } from '@/services/login';

export interface LoginState {
  avatar?: string;
  redirect?: string;
  scope?: Scope;
  status?: boolean;
  userName?: string;
}

const defaultState: LoginState = {
  avatar: null,
  redirect: '/',
  scope: null,
  status: false,
  userName: 'NULL',
};

export interface LoginModel extends Model {
  state: LoginState;
}

const model: LoginModel = {
  namespace: 'login',
  state: defaultState,
  effects: {
    *login({ payload }, { call, put, select }) {
      payload.timestamp = (Date.now() / 1000).toFixed(0) + LoginSignExpiresIn;
      payload.psw = hmacSha256(`${payload.timestamp}${payload.account}`, payload.psw);
      const response = yield call(login, payload);
      if (response && response.token) {
        yield put({
          type: 'setState',
          payload: { ...response, status: true },
        });
        const redirect = yield select((state: any) => state.login.redirect);
        router.replace(redirect);
      }
    },
    *logout(_, { put }) {
      setSign(null);
      yield put({ type: 'global/resetNamespace' });
      yield router.push('/user/login');
    },
    *fetchScope(_, { call, put }) {
      const response = yield call(fetchScope, true);
      if (response && response.scope) {
        yield put({
          type: 'setState',
          payload: { ...response, status: true },
        });
      } else {
        router.push('/user/login');
      }
    },
  },
  reducers: {
    setState(state, { payload }) {
      if (payload.token) {
        setSign(payload.token);
        delete payload.token;
      }
      return {
        ...state,
        ...payload,
      };
    },
    resetState() {
      return { ...defaultState };
    },
  },
};

export default model;
