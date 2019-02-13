import { Model } from 'dva';
import { message } from 'antd';
import router from 'umi/router';
import { setSign } from '@/utils/auth';
import { formatMessage } from 'umi-plugin-locale';
import { fetchScope, FetchScopePayload } from '@/services/login';

const defaultState = {
  avatar: <null>null,
  redirect: '/',
  scope: <null>[
    'scope.position.manage.list',
    'scope.position.manage.create',
    'scope.position.manage.edit',
    'scope.position.manage.export',
    'scope.position.manage.audit',
    'scope.position.teach.list',
    'scope.position.teach.create',
    'scope.position.teach.edit',
    'scope.position.teach.export',
    'scope.position.teach.audit',
  ], // @DEBUG
  status: false,
  token: '',
  userName: 'NULL',
};

export type LoginState = Readonly<typeof defaultState> & {
  avatar: string;
  scope: Array<string | number>;
};

export interface LoginModel extends Model {
  state: LoginState;
}

const model: LoginModel = {
  namespace: 'login',
  state: defaultState,
  effects: {
    *login({ payload }, { call, put, select }) {
      const response = yield call(fetchScope, payload);
      if (response && response.token) {
        yield put({
          type: 'setState',
          payload: { ...response, status: true },
        });
        const redirect = yield select(({ login }: any) => login.redirect);
        router.replace(redirect);
      } else {
        message.error(formatMessage({ id: 'login.failed' }));
      }
    },
    *logout(_, { put }) {
      setSign(null);
      yield put({ type: 'global/resetNamespace' });
      yield router.push('/user/login');
    },
    *fetchUser(_, { call, put }) {
      const response = yield call(fetchScope, { method: 'token' } as FetchScopePayload);
      if (response && response.token) {
        yield put({
          type: 'setState',
          payload: { ...response, status: true },
        });
      } else {
        message.error(formatMessage({ id: 'login.failed' }));
      }
    },
  },
  reducers: {
    setState(state, { payload }) {
      if (payload.token) setSign(payload.token);
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
