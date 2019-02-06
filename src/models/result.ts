import React from 'react';
import { Model } from 'dva';
import { ButtonProps } from 'antd/es/button';
import { StepsProps } from '@/components/Steps';

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
  type: 'href' | 'path' | 'back' | 'onClick' | 'dispatch';
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
  stepsProps?: StepsProps | null;
  title?: string;
  type: 'success';
}

const defaultState: ResultState = {
  actions: [],
  description: null,
  extra: null,
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
  effects: {},
  reducers: {
    setState(state: ResultState, { payload }): ResultState {
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
