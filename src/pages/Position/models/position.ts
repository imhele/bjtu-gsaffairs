import { Model } from 'dva';
import { message } from 'antd';
import router from 'umi/router';
import * as Utils from '@/utils/utils';
import { FormItemProps } from 'antd/es/form';
import { ResultState } from '@/models/result';
import { StepsProps } from '@/components/Steps';
import { formatMessage } from 'umi-plugin-locale';
import { ColProps, RowProps } from 'antd/es/grid';
import { StandardTableOperationAreaProps } from '@/components/StandardTable';
import { FilterItemProps, SimpleFormItemProps } from '@/components/SimpleForm';
import {
  applyPosition,
  auditPosition,
  createPosition,
  deletePosition,
  editPosition,
  fetchApplyForm,
  fetchDetail,
  fetchForm,
  fetchList,
} from '@/api/position';

export interface PositionDetailProps {
  actionKey: string | string[];
  columns: Array<{
    dataIndex: string;
    title: string;
    [key: string]: any;
  }>;
  dataSource: object;
  stepsProps?: StepsProps;
}

export interface Form {
  formItems: SimpleFormItemProps[];
  formItemProps?: FormItemProps;
  colProps?: ColProps;
  groupAmount?: number;
  initialFieldsValue?: object;
  rowProps?: RowProps;
}

export interface PositionState {
  /**
   * Position list
   */
  columns: object[];
  dataSource: object[];
  total: number;
  actionKey?: string | string[];
  filters?: FilterItemProps[];
  operationArea?: StandardTableOperationAreaProps;
  rowKey?: string;
  scroll?: {
    x?: boolean | number | string;
    y?: boolean | number | string;
  };
  selectable?: boolean | object;
  unSelectableKey?: string;
  /**
   * Position detail
   */
  detail: PositionDetailProps;
  /**
   * Form
   */
  form: Form;
}

const defaultState: PositionState = {
  actionKey: 'action',
  columns: [],
  dataSource: [],
  total: 0,
  filters: [],
  rowKey: 'key',
  scroll: {
    x: 1100,
  },
  unSelectableKey: 'unSelectable',
  detail: {
    actionKey: 'action',
    columns: [],
    dataSource: {},
    stepsProps: null,
  },
  form: {
    formItems: [],
    formItemProps: {
      labelCol: {
        sm: 24,
        md: 6,
      },
      wrapperCol: {
        sm: 24,
        md: 18,
      },
    },
    colProps: {},
    groupAmount: 1,
    initialFieldsValue: {},
    rowProps: {},
  },
};

const SuccessActions = payload => [
  {
    text: formatMessage({ id: 'word.back-to-list' }),
    type: 'replace',
    path: `/position/${payload.query.type}/list`,
  },
  {
    text: formatMessage({ id: 'position.create.continue-create' }),
    type: 'replace',
    path: `/position/${payload.query.type}/create`,
  },
];

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
      Utils.safeFun(callback, null, payload);
    },
    *fetchDetail({ payload }, { call, put }) {
      const response = yield call(fetchDetail, payload);
      yield put({
        type: 'setDetail',
        payload: response,
      });
    },
    *deletePosition({ callback, payload }, { call }) {
      const response = yield call(deletePosition, payload);
      if (response && !response.errcode) {
        message.success(response.errmsg);
      }
      Utils.safeFun(callback, null, payload);
    },
    *fetchForm({ payload }, { call, put }) {
      const response = yield call(fetchForm, payload);
      if (response && typeof response === 'object') {
        response.initialFieldsValue = Utils.safeFun(
          Utils.formatMomentInSimpleFormInitValue,
          {},
          response.formItems,
          response.initialFieldsValue,
        );
        yield put({ type: 'setForm', payload: response });
      }
    },
    *fetchApplyForm({ payload }, { call, put }) {
      const response = yield call(fetchApplyForm, payload);
      if (response && typeof response === 'object') {
        response.initialFieldsValue = Utils.safeFun(
          Utils.formatMomentInSimpleFormInitValue,
          {},
          response.formItems,
          response.initialFieldsValue,
        );
        yield put({ type: 'setForm', payload: response });
      }
    },
    *createPosition({ payload }, { call, put }) {
      payload.body = Utils.formatMomentInFieldsValue(payload.body, Utils.formatMoment.YMDHms);
      const response = yield call(createPosition, payload);
      if (response) {
        yield put<{ type: string; payload: ResultState }>({
          type: 'result/success',
          payload: {
            type: 'success',
            actions: SuccessActions(payload),
            ...response,
          },
        });
      }
    },
    *editPosition({ payload }, { call }) {
      payload.body = Utils.formatMomentInFieldsValue(payload.body, Utils.formatMoment.YMDHms);
      const response = yield call(editPosition, payload);
      if (response && !response.errcode) {
        message.success(response.errmsg);
        router.replace('list');
      }
    },
    *auditPosition({ callback, payload }, { call }) {
      payload.body = Utils.formatMomentInFieldsValue(payload.body, Utils.formatMoment.YMDHms);
      const response = yield call(auditPosition, payload);
      if (response && !response.errcode) {
        message.success(response.errmsg);
        Utils.safeFun(callback, null, payload);
      }
    },
    *applyPosition({ payload }, { call, put }) {
      payload.body = Utils.formatMomentInFieldsValue(payload.body, Utils.formatMoment.YMDHms);
      const response = yield call(applyPosition, payload);
      if (response) {
        yield put<{ type: string; payload: ResultState }>({
          type: 'result/success',
          payload: {
            type: 'success',
            actions: SuccessActions(payload),
            ...response,
          },
        });
      }
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
          ...defaultState.detail,
          ...payload,
        },
      };
    },
    setForm(state: PositionState, { payload }): PositionState {
      return {
        ...state,
        form: {
          ...defaultState.form,
          ...payload,
        },
      };
    },
    resetForm(state: PositionState): PositionState {
      return {
        ...state,
        form: {
          ...defaultState.form,
        },
      };
    },
    resetState() {
      return { ...defaultState };
    },
  },
};

export default model;
