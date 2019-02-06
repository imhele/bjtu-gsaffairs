import { Model } from 'dva';
import { message } from 'antd';
import { safeFun } from '@/utils/utils';
import { FormItemProps } from 'antd/es/form';
import { ColProps, RowProps } from 'antd/es/grid';
import { StandardTableOperationAreaProps } from '@/components/StandardTable';
import { FilterItemProps, SimpleFormItemProps } from '@/components/SimpleForm';
import { deletePosition, fetchDetail, fetchForm, fetchList } from '@/services/position';

export interface PositionDetailProps {
  columns: Array<{
    dataIndex: string;
    title: string;
  }>;
  dataSource: object;
  actionKey: string | string[];
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
    columns: [],
    dataSource: {},
    actionKey: 'action',
  },
  form: {
    formItems: [],
    formItemProps: {
      labelCol: {
        sm: 24,
        md: 5,
      },
      wrapperCol: {
        sm: 24,
        md: 19,
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
      yield put({
        type: 'setForm',
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
    setForm(state: PositionState, { payload }): PositionState {
      return {
        ...state,
        form: {
          ...state.form,
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
