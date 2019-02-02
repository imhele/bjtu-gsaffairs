import { Model } from 'dva';
import router from 'umi/router';
import { setSign } from '@/utils/auth';

const defaultState = {
  avatar: <null>null,
  redirect: '/',
  scope: <null>[
    'scope.position.manage.list',
    'scope.position.manage.create',
    'scope.position.manage.export',
    'scope.position.teach.list',
    'scope.position.teach.create',
    'scope.position.teach.export',
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
      const response = yield call(null, payload); // @TODO
      if (response && response.token) {
        yield put({
          type: 'setState',
          payload: {
            ...response,
            status: true,
          },
        });
        const redirect = yield select(({ login }: any) => login.redirect); // @TODO
        router.replace(redirect);
      } else {
        // @TODO
      }
    },
    *logout(_, { put }) {
      setSign(null);
      yield put({
        type: 'global/resetNamespace',
      });
      yield router.push('/user/login');
    },
  },
  reducers: {
    setState(state, { payload }) {
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
