import { Model } from 'dva';
import { message } from 'antd';
import * as Utils from '@/utils/utils';
import { DescriptionProps } from '@/components/DescriptionList';
import { fetchList, editStuapply, auditStuapply, deleteStuapply } from '@/api/stuapply';

export interface StuapplyState {
  actionKey?: string | string[];
  columns: { [key: string]: (DescriptionProps & { dataIndex: string })[] };
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
    *fetchList({ callback, payload }, { call, put }) {
      const response = yield call(fetchList, payload);
      yield put({
        type: 'setState',
        payload: response,
      });
      Utils.safeFun(callback, null, payload);
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
