import { Model } from 'dva';
import { message } from 'antd';
import * as Utils from '@/utils/utils';
import { DescriptionProps } from '@/components/DescriptionList';
import {
  fetchList,
  editStuapply,
  auditStuapply,
  deleteStuapply,
  FetchListPayload,
} from '@/api/stuapply';

export interface StuapplyState {
  actionKey?: string;
  columns: { [key: string]: (DescriptionProps & { dataIndex: string; editDisabled: boolean })[] };
  columnsKeys: string[];
  columnsText: { [key: string]: string };
  dataSource: object[];
  total: number;
  rowKey?: string;
}

const defaultState: StuapplyState = {
  actionKey: 'action',
  columns: {},
  columnsKeys: [],
  columnsText: {},
  dataSource: [],
  total: 0,
  rowKey: 'key',
};

export interface StuapplyModel extends Model {
  state: StuapplyState;
}

const model: StuapplyModel = {
  namespace: 'stuapply',
  state: defaultState,
  effects: {
    *fetchList({ callback, payload }, { call, put, select }) {
      let updatedDataSource: object[] = [];
      const response = yield call(fetchList, payload);
      const {
        body: { offset },
      } = payload as FetchListPayload;
      if (response && 'dataSource' in response) {
        const { dataSource } = response;
        if (Array.isArray(dataSource)) {
          updatedDataSource = dataSource;
          const prevSource: object[] = yield select(({ stuapply }) => stuapply.dataSource);
          response.dataSource = prevSource.slice(0, offset).concat(dataSource);
        } else delete response.dataSource;
      }
      yield put({
        type: 'setState',
        payload: response,
      });
      Utils.safeFun(callback, null, payload, updatedDataSource);
    },
    *deleteStuapply({ callback, payload }, { call }) {
      const response = yield call(deleteStuapply, payload);
      if (response && !response.errcode) {
        message.success(response.errmsg);
      }
      Utils.safeFun(callback, null, payload);
    },
    *editStuapply({ callback, payload }, { call }) {
      payload.body = Utils.formatMomentInFieldsValue(payload.body, Utils.formatMoment.YMDHms);
      const response = yield call(editStuapply, payload);
      if (response && !response.errcode) {
        message.success(response.errmsg);
        Utils.safeFun(callback, null, payload);
      }
    },
    *auditStuapply({ callback, payload }, { call }) {
      payload.body = Utils.formatMomentInFieldsValue(payload.body, Utils.formatMoment.YMDHms);
      const response = yield call(auditStuapply, payload);
      if (response && !response.errcode) {
        message.success(response.errmsg);
        Utils.safeFun(callback, null, payload);
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
