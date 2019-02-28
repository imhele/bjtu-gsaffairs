import { Model } from 'dva';
import { message } from 'antd';
import * as Utils from '@/utils/utils';
import { SimpleFormItemProps } from '@/components/SimpleForm';
import { DescriptionProps } from '@/components/DescriptionList';
import { fetchClientList, createClient, deleteClient, editClient } from '@/api/admin';

export interface AdminState {
  columns: (DescriptionProps & { dataIndex: string })[];
  dataSource: object[];
  form: SimpleFormItemProps[];
  rowKey: string;
  total: number;
}

const defaultState: AdminState = {
  columns: [],
  dataSource: [],
  total: 0,
  rowKey: 'key',
  form: [],
};

export interface AdminModel extends Model {
  state: AdminState;
}

const model: AdminModel = {
  namespace: 'admin',
  state: defaultState,
  effects: {
    *fetchClientList({ callback, payload }, { call, put, select }) {
      const response = yield call(fetchClientList, payload);
      yield put({
        type: 'setState',
        payload: response,
      });
      Utils.safeFun(callback, null, payload);
    },
    *deleteClient({ callback, payload }, { call }) {
      const response = yield call(deleteClient, payload);
      if (response && !response.errcode) {
        message.success(response.errmsg);
      }
      Utils.safeFun(callback, null, payload);
    },
    *createClient({ callback, payload }, { call }) {
      // payload.body = Utils.formatMomentInFieldsValue(payload.body, Utils.formatMoment.YMDHms);
      const response = yield call(createClient, payload);
      if (response && !response.errcode) {
        message.success(response.errmsg);
        Utils.safeFun(callback, null, payload);
      }
    },
    *editClient({ callback, payload }, { call }) {
      // payload.body = Utils.formatMomentInFieldsValue(payload.body, Utils.formatMoment.YMDHms);
      const response = yield call(editClient, payload);
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
