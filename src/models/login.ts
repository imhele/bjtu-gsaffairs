import { Model } from 'dva';
import router from 'umi/router';
import { setSign } from '@/utils/auth';

const defaultState = {
  scope: <null>[
    'scope.position.manage.list',
    'scope.position.manage.create',
    'scope.position.manage.export',
    'scope.position.teach.create',
    'scope.position.teach.export',
  ], // @DEBUG
  status: false,
  nickname: 'NULL',
  avatar: <null>null,
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
    *login({ payload }, { call, put }) {
      const { scope } = yield call(); // @TODO
      yield put({
        type: 'setState',
        payload: {
          scope,
          status: true,
        },
      });
    },
    *logout(_, { put }) {
      setSign(null);
      yield put({
        type: 'resetNamespace',
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
