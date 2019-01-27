import { Model } from 'dva';
import { fetchList } from '@/services/position';
import { Filter } from '@/components/StandardFilter';
import { StandardTableOperationAreaProps } from '@/components/StandardTable';

export interface PositionState {
  columns: object[];
  dataSource: object[];
  total: number;
  actionKey?: string | string[];
  filterOptions?: Filter[];
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
  filterOptions: [],
};

export interface PositionModel extends Model {
  state: PositionState;
}

const model: PositionModel = {
  namespace: 'position',
  state: defaultState,
  effects: {
    *fetchList({ payload }, { call, put }) {
      const response = yield call(fetchList, payload);
      yield put({
        type: 'setState',
        payload: response,
      });
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
