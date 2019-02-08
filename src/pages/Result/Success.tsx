import React from 'react';
import { Button } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Result from '@/components/Result';
import useMedia from 'react-media-hook2';
import commonStyles from '../common.less';
import PageHeader from '@/layouts/PageHeader';
import { formatMessage } from 'umi-plugin-locale';
import Steps, { StepsProps } from '@/components/Steps';
import { ResultAction, ResultExtra, ResultStore } from '@/models/result';
import DescriptionList, { DescriptionProps } from '@/components/DescriptionList';
import { ConnectProps, ConnectState, Dispatch, ResultState } from '@/models/connect';

export interface SuccessProps extends ConnectProps<{ id: string }>, ResultState {
  loading?: { [key: string]: boolean };
}

const defaultActions: ResultAction[] = [
  {
    path: '/',
    text: formatMessage({ id: 'word.back-to-home' }),
    type: 'replace',
  },
];

const renderExtra = (
  extra: ResultExtra,
  stepsProps: StepsProps,
  isMobile: boolean,
): React.ReactNode => (
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
        style={{ marginBottom: 16 }}
      />
    )}
    {stepsProps && (
      <Steps
        direction={isMobile ? 'vertical' : 'horizontal'}
        progressDot
        style={isMobile ? {} : { marginLeft: -42, width: 'calc(100% + 84px)' }}
        {...stepsProps}
      />
    )}
  </React.Fragment>
);

const renderAction = (
  action: ResultAction,
  dispatch: Dispatch,
  loading: { [key: string]: boolean },
  index: number,
): React.ReactNode => {
  switch (action.type) {
    case 'back':
      return (
        <Button key={index} onClick={router.goBack} {...action.buttonProps}>
          {action.text}
        </Button>
      );
    case 'push':
      return (
        <Button key={index} onClick={() => router.push(action.path)} {...action.buttonProps}>
          {action.text}
        </Button>
      );
    case 'replace':
      return (
        <Button key={index} onClick={() => router.replace(action.path)} {...action.buttonProps}>
          {action.text}
        </Button>
      );
    case 'dispatch':
      return (
        <Button
          key={index}
          loading={loading[action.dispatch.type]}
          onClick={() => dispatch(action.dispatch)}
          {...action.buttonProps}
        >
          {action.text}
        </Button>
      );
    case 'onClick':
      return (
        <Button key={index} onClick={action.onClick} {...action.buttonProps}>
          {action.text}
        </Button>
      );
    case 'href':
      return (
        <Button key={index} href={action.href} {...action.buttonProps}>
          {action.text}
        </Button>
      );
    default:
      return null;
  }
};

const addTypeForFirstButton = (action: ResultAction, index: number): ResultAction =>
  index ? action : { ...action, buttonProps: { type: 'primary', ...action.buttonProps } };

const Success: React.SFC<SuccessProps> = props => {
  const isMobile = useMedia({ query: { maxWidth: 768 } })[0];
  const {
    dispatch,
    loading,
    match: {
      params: { id: currentId },
    },
  } = props;
  const { actions, description, extra, stepsProps, title } =
    props.id === currentId ? props : ResultStore[currentId] || props;
  return (
    <PageHeader defaultMessage={title}>
      <div className={commonStyles.contentBody}>
        <Result
          type="success"
          title={title}
          description={description}
          extra={(extra || stepsProps) && renderExtra(extra, stepsProps, isMobile)}
          actions={(actions === null ? null : actions || defaultActions)
            .map((action, index) =>
              renderAction(addTypeForFirstButton(action, index), dispatch, loading, index),
            )
            .filter(action => action)}
          style={{ marginTop: 48, marginBottom: 16 }}
        />
      </div>
    </PageHeader>
  );
};

export default connect(({ loading, result }: ConnectState) => ({
  ...result,
  loading: loading.effects,
}))(Success);
