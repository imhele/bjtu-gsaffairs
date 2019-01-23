import { Model } from 'dva';

const resetNamespace: string[] = ['user'];
const defaultState = {
  stateKeep: null,
};

export type GlobalState = Readonly<typeof defaultState>;

export interface GlobalModel extends Model {
  state: GlobalState;
}

const model: GlobalModel = {
  namespace: 'global',
  state: defaultState,
  effects: {
    *resetNamespace(_, { put }) {
      yield put({
        type: 'resetState',
      });
      for (const namespace of resetNamespace) {
        yield put({
          type: `${namespace}/resetState`,
        });
      }
    },
  },
  reducers: {
    setState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

export default model;
