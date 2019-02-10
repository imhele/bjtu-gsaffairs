import { Model } from 'dva';

const resetNamespace: string[] = ['login', 'result'];
const defaultState = {
  collapsed: true,
  NT: {
    PLSelectAll: false,
  },
};

export type GlobalState = Readonly<typeof defaultState>;
export type NTType = Readonly<typeof defaultState.NT>;

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
    *triggerNT({ payload }, { put }) {
      if (!localStorage.getItem(payload)) {
        yield put({
          type: 'setNT',
          payload: { [payload]: true },
        });
      }
    },
    *closeNT({ payload }, { put }) {
      localStorage.removeItem(payload);
      yield put({
        type: 'setNT',
        payload: { [payload]: false },
      });
    },
  },
  reducers: {
    setCollapsed(state: GlobalState, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    setNT(state: GlobalState, { payload }) {
      return {
        ...state,
        NT: {
          ...state.NT,
          ...payload,
        },
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
