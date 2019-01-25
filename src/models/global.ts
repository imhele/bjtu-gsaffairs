import { Model } from 'dva';

const resetNamespace: string[] = ['login'];
const defaultState = {
  collapsed: true,
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
    setCollapsed(state: GlobalState, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    setState(state: GlobalState, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

export default model;
