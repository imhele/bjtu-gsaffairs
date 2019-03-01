import { Model } from 'dva';
import { message } from 'antd';
import * as Utils from '@/utils/utils';
import { CellAction } from '@/pages/Position/consts';
import { SimpleFormItemProps } from '@/components/SimpleForm';
import { DescriptionProps } from '@/components/DescriptionList';
import {
  fetchClientList,
  createClient,
  deleteClient,
  editClient,
  timeConfig,
  TimeConfig,
} from '@/api/admin';

export interface AdminState {
  columns: (DescriptionProps & { dataIndex: string })[];
  dataSource: object[];
  form: SimpleFormItemProps[];
  rowKey: string;
  timeConfig: TimeConfig;
  total: number;
}

const defaultState: AdminState = {
  columns: [],
  dataSource: [],
  form: [],
  rowKey: 'key',
  timeConfig: null,
  total: 0,
};

export interface AdminModel extends Model {
  state: AdminState;
}

const model: AdminModel = {
  namespace: 'admin',
  state: defaultState,
  effects: {
    *fetchClientList({ callback, payload }, { call, put }) {
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
    *fetchTime({ callback }, { call, put }) {
      const response = yield call(timeConfig, { action: CellAction.Preview });
      yield put({
        type: 'setState',
        payload: { timeConfig: response },
      });
      Utils.safeFun(callback, null, { action: CellAction.Preview });
    },
    *editTime({ callback, payload }, { call }) {
      // payload.body = Utils.formatMomentInFieldsValue(payload.body, Utils.formatMoment.YMDHms);
      const response = yield call(timeConfig, { action: CellAction.Edit, body: payload });
      if (response && !response.errcode) {
        message.success(response.errmsg);
        Utils.safeFun(callback, null, { action: CellAction.Edit, body: payload });
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
