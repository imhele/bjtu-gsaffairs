import { Model } from 'dva';
import { Filter } from '@/components/StandardFilter';
import { fetchDetail, fetchList } from '@/services/position';
import { StandardTableOperationAreaProps } from '@/components/StandardTable';

export interface PositionDetailProps {
  columns: Array<{
    dataIndex: string;
    span?: number;
    title: string;
  }>;
  dataSource: object;
  actionKey: string | string[];
}

export interface PositionState {
  /**
   * Position list
   */
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
  /**
   * Position detail
   */
  detail: PositionDetailProps;
}

const defaultState: PositionState = {
  columns: [],
  dataSource: [],
  total: 0,
  filters: [],
  rowKey: 'key',
  scroll: {
    x: 1100,
  },
  detail: {
    columns: [],
    dataSource: {},
    actionKey: 'action',
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
    *fetchDetail({ payload }, { call, put }) {
      const response = yield call(fetchDetail, payload);
      yield put({
        type: 'setDetail',
        payload: response,
      });
    },
  },
  reducers: {
    setState(state: PositionState, { payload }): PositionState {
      return {
        ...state,
        ...payload,
        detail: state.detail,
      };
    },
    setDetail(state: PositionState, { payload }): PositionState {
      return {
        ...state,
        detail: {
          ...state.detail,
          ...payload,
        },
      };
    },
    resetState() {
      return { ...defaultState };
    },
  },
};

export default model;
