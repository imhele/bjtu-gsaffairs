import React from 'react';
import { Model } from 'dva';
import router from 'umi/router';
import { UUID } from '@/utils/utils';
import { ButtonProps } from 'antd/es/button';
import { StepsProps } from '@/components/Steps';

export const ResultStore: { [key: string]: ResultState } = {};

export interface ResultAction<T = any, U = (payload: T) => void> {
  buttonProps?: ButtonProps;
  dispatch?: {
    type: string;
    payload?: T;
    callback?: U;
  };
  href?: string;
  onClick?: (event: React.MouseEvent) => void;
  path?: string;
  text?: string | React.ReactNode;
  type: 'href' | 'push' | 'replace' | 'back' | 'onClick' | 'dispatch';
}

export interface ResultExtra {
  columns: Array<{
    dataIndex: string;
    title: string;
  }>;
  dataSource: object;
}

export interface ResultState {
  actions?: ResultAction[];
  description?: string;
  extra?: ResultExtra | null;
  id?: string;
  routerType?: 'replace' | 'push';
  stepsProps?: StepsProps | null;
  title: string;
  type: 'success';
}

const defaultState: ResultState = {
  actions: [],
  description: null,
  extra: null,
  id: null,
  stepsProps: null,
  title: null,
  type: 'success',
};

export interface ResultModel extends Model {
  state: ResultState;
}

const model: ResultModel = {
  namespace: 'result',
  state: defaultState,
  effects: {
    *success({ payload }, { put }) {
      if (payload) {
        const id = payload.id || UUID(32, '-');
        yield router[payload.routerType || 'replace'](`/result/${payload.type}/${id}`);
        ResultStore[id] = payload;
        yield put({
          type: 'newState',
          payload,
        });
      }
    },
  },
  reducers: {
    update(state: ResultState, { payload }): ResultState {
      if (payload.id === payload.id || !payload.id) {
        return {
          ...state,
          ...payload,
        };
      } else {
        ResultStore[payload.id] = payload;
        return state;
      }
    },
    newState(_, { payload }) {
      return {
        ...defaultState,
        ...payload,
      };
    },
    resetState() {
      return { ...defaultState };
    },
  },
};

export default model;
