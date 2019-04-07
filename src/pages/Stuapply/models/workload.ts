import { Model } from 'dva';
import { fetchList } from '@/api/workload';

export interface WorkloadState {
  actionKey: string;
  columns: object[];
  dataSource: object[];
  total: number;
  rowKey: string;
  selectable: boolean;
  unSelectableKey: string;
}

const defaultState: WorkloadState = {
  actionKey: 'action',
  columns: [],
  dataSource: [],
  total: 0,
  rowKey: 'key',
  selectable: true,
  unSelectableKey: 'unSelectable',
};

export interface WorkloadModel extends Model {
  state: WorkloadState;
}

const model: WorkloadModel = {
  namespace: 'workload',
  state: defaultState,
  effects: {
    *fetchList({ payload }, { call, put }) {
      const response = yield call(fetchList, payload);
      if (fetchList) {
        yield put({ type: 'setState', payload: response });
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
    resetState() {
      return { ...defaultState };
    },
  },
};

export default model;
