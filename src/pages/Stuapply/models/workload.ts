import { fetchList, createWorkload, editWorkload, auditWorkload } from '@/api/workload';
import { safeFun } from '@/utils/utils';
import { message } from 'antd';
import { ColumnProps } from 'antd/es/table';
import { Model } from 'dva';

export interface WorkloadState {
  actionKey: string;
  columns: ColumnProps<object>[];
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
      if (response) {
        yield put({ type: 'setState', payload: response });
      }
    },
    *createWorkload({ payload, callback }, { call }) {
      const response = yield call(createWorkload, payload);
      if (response) {
        message.success(response.errmsg);
        safeFun(callback);
      }
    },
    *editWorkload({ payload, callback }, { call }) {
      const response = yield call(editWorkload, payload);
      if (response) {
        message.success(response.errmsg);
        safeFun(callback);
      }
    },
    *auditWorkload({ payload, callback }, { call }) {
      const response = yield call(auditWorkload, payload);
      if (response) {
        message.success(response.errmsg);
        safeFun(callback);
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
