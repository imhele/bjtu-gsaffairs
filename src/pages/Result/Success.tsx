import React from 'react';
import { Button } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Result from '@/components/Result';
import commonStyles from '../common.less';
import Steps, { StepsProps } from '@/components/Steps';
import { ResultAction, ResultExtra } from '@/models/result';
import DescriptionList, { DescriptionProps } from '@/components/DescriptionList';
import { ConnectProps, ConnectState, Dispatch, ResultState } from '@/models/connect';

export interface SuccessProps extends ConnectProps, ResultState {
  loading: { [key: string]: boolean };
}

const renderExtra = (extra: ResultExtra, stepsProps: StepsProps): React.ReactNode => (
  <React.Fragment>
    {extra && (
      <DescriptionList
        description={extra.columns.map(
          (col): DescriptionProps => ({
            children: extra.dataSource[col.dataIndex],
            key: col.dataIndex,
            term: col.title,
          }),
        )}
      />
    )}
    {stepsProps && (
      <Steps progressDot style={{ marginLeft: -42, width: 'calc(100% + 84px)' }} {...stepsProps} />
    )}
  </React.Fragment>
);

const renderAction = (
  action: ResultAction,
  dispatch: Dispatch,
  loading: { [key: string]: boolean },
): React.ReactNode => {
  switch (action.type) {
    case 'back':
      return (
        <Button onClick={router.goBack} {...action.buttonProps}>
          {action.text}
        </Button>
      );
    case 'path':
      return (
        <Button onClick={() => router.push(action.path)} {...action.buttonProps}>
          {action.text}
        </Button>
      );
    case 'dispatch':
      return (
        <Button
          loading={loading[action.dispatch.type]}
          onClick={() => dispatch(action.dispatch)}
          {...action.buttonProps}
        >
          {action.text}
        </Button>
      );
    case 'onClick':
      return (
        <Button onClick={action.onClick} {...action.buttonProps}>
          {action.text}
        </Button>
      );
    case 'href':
      return (
        <Button href={action.href} {...action.buttonProps}>
          {action.text}
        </Button>
      );
    default:
      return null;
  }
};

const addTypeForFirstButton = (action: ResultAction, index: number): ResultAction =>
  index ? action : { ...action, buttonProps: { type: 'primary', ...action.buttonProps } };

const Success: React.SFC<SuccessProps> = ({
  actions,
  description,
  dispatch,
  extra,
  loading,
  stepsProps,
  title,
}) => (
  <div className={commonStyles.contentBody}>
    <Result
      type="success"
      title={title}
      description={description}
      extra={renderExtra(extra, stepsProps)}
      actions={actions
        .map((action, index) =>
          renderAction(addTypeForFirstButton(action, index), dispatch, loading),
        )
        .filter(action => action)}
      style={{ marginTop: 48, marginBottom: 16 }}
    />
  </div>
);

export default connect(({ loading, result }: ConnectState) => ({
  ...result,
  loading: loading.effects,
}))(Success);
