import { Model } from 'dva';
import { message } from 'antd';
import { safeFun } from '@/utils/utils';
import { FormItemProps } from 'antd/es/form';
import { ResultState } from '@/models/result';
import { StepsProps } from '@/components/Steps';
import { formatMessage } from 'umi-plugin-locale';
import { ColProps, RowProps } from 'antd/es/grid';
import { StandardTableOperationAreaProps } from '@/components/StandardTable';
import { FilterItemProps, SimpleFormItemProps } from '@/components/SimpleForm';
import {
  createPosition,
  deletePosition,
  editPosition,
  fetchDetail,
  fetchForm,
  fetchList,
} from '@/services/position';
import {
  formatMoment,
  formatMomentInFieldsValue,
  formatMomentInSimpleFormInitValue as formatFormInitValue,
} from '@/utils/format';

export interface PositionDetailProps {
  actionKey: string | string[];
  columns: Array<{
    dataIndex: string;
    title: string;
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
  selectable?: boolean;
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
      safeFun(callback, null, payload);
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
      safeFun(callback, null, payload);
    },
    *fetchForm({ payload }, { call, put }) {
      const response = yield call(fetchForm, payload);
      if (response && typeof response === 'object') {
        response.initialFieldsValue = safeFun(
          formatFormInitValue,
          {},
          response.formItems,
          response.initialFieldsValue,
        );
        yield put({
          type: 'setForm',
          payload: response,
        });
      }
    },
    *createPosition({ payload }, { call, put }) {
      payload.body = formatMomentInFieldsValue(payload.body, formatMoment.YMD);
      const response = yield call(createPosition, payload);
      if (response) {
        yield put<{ type: string; payload: ResultState }>({
          type: 'result/success',
          payload: {
            type: 'success',
            actions: [
              {
                text: formatMessage({ id: 'position.create.back-to-list' }),
                type: 'replace',
                path: `/position/${payload.query.type}/list`,
              },
              {
                text: formatMessage({ id: 'position.create.continue-create' }),
                type: 'replace',
                path: `/position/${payload.query.type}/create`,
              },
            ],
            ...response,
          },
        });
      }
    },
    *editPosition({ payload }, { call, put }) {
      payload.body = formatMomentInFieldsValue(payload.body, formatMoment.YMD);
      const response = yield call(editPosition, payload);
      if (response && !response.errcode) {
        message.success(response.errmsg);
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
    resetState() {
      return { ...defaultState };
    },
  },
};

export default model;
