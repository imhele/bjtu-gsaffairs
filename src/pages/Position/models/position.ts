import { Model } from 'dva';
import { fetchList } from '@/services/position';
import { Filter } from '@/components/StandardFilter';
import { StandardTableOperationAreaProps } from '@/components/StandardTable';

export interface PositionState {
  columns: object[];
  dataSource: object[];
  total: number;
  actionKey?: string | string[];
  filters?: Filter[];
  operationArea?: StandardTableOperationAreaProps;
  rowKey?: string;
  scroll?: {
    x?: boolean | number | string;
    y?: boolean | number | string;
  };
  selectable?: boolean;
  unSelectableKey?: string;
}

const defaultState: PositionState = {
  columns: [],
  dataSource: [],
  total: 0,
  filters: [],
  scroll: {
    x: 1100,
  },
};

export interface PositionModel extends Model {
  state: PositionState;
}

const model: PositionModel = {
  namespace: 'position',
  state: defaultState,
  effects: {
    *fetchList({ callback, payload }, { call, put }) {
      const response = yield call(fetchList, payload);
      yield put({
        type: 'setState',
        payload: response,
      });
      if (typeof callback === 'function') callback();
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
