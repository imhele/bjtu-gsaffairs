import { Model } from 'dva';
import { StorageId } from '@/global';

export type NTKeys = 'NTPLSelectAll';
export type NTType = { [key in NTKeys]: boolean };
export interface GlobalState {
  collapsed: boolean;
  NT: NTType;
}

const resetNamespace: string[] = ['login', 'result'];
const defaultState: GlobalState = {
  collapsed: true,
  NT: {
    NTPLSelectAll: false,
  },
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
    *triggerNT({ payload }, { put }) {
      if (!localStorage.getItem(StorageId[payload])) {
        yield put({
          type: 'setNT',
          payload: { [payload]: true },
        });
      }
    },
    *closeNT({ payload }, { put }) {
      localStorage.removeItem(StorageId[payload]);
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
