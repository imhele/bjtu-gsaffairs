import { Model } from 'dva';

export interface GlobalState {
  collapsed: boolean;
}

const resetNamespace: string[] = ['login', 'result', 'position'];
const defaultState: GlobalState = {
  collapsed: true,
};

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
