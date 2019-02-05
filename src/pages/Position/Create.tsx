import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import styles from './Create.less';
import { PositionType } from './consts';
import commonStyles from '../common.less';
import Exception404 from '@/pages/Exception/404';
import { Button, Col, message, Skeleton } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import SimpleForm, { SimpleFormItemType } from '@/components/SimpleForm';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';

export interface CreateProps extends ConnectProps<{ type: PositionType }> {
  loading?: {
    createPosition?: boolean;
    fetchForm?: boolean;
  };
  position?: PositionState;
}

const formItemProps = {
  labelCol: {
    sm: 24,
    md: 5,
  },
  wrapperCol: {
    sm: 24,
    md: 19,
  },
};

const backToList = () => router.push(window.location.pathname.replace('create', 'list'));

const renderOperationArea = (_: any, submitLoading: boolean) => (
  <Col>
    <Button htmlType="submit" loading={submitLoading} type="primary">
      <FormattedMessage id="word.create" />
    </Button>
    <Button onClick={backToList} style={{ marginLeft: 8 }}>
      <FormattedMessage id="word.back" />
    </Button>
  </Col>
);

const Create: React.SFC<CreateProps> = ({
  loading,
  match: {
    params: { type },
  },
  position,
}) => {
  if (!Object.values(PositionType).includes(type)) {
    message.error(formatMessage({ id: 'position.error.unknown.type' }));
    return <Exception404 />;
  }
  return (
    <div className={commonStyles.contentBody}>
      <Skeleton active loading={loading.fetchForm} paragraph={{ rows: 7 }}>
        <SimpleForm
          className={styles.form}
          colProps={{ md: 12, sm: 24 }}
          formItemProps={formItemProps}
          formItems={[
            { id: 'a', type: SimpleFormItemType.Extra, extra: 'HHH' },
            { id: 'test', type: SimpleFormItemType.Input },
            { id: '负责人工号', type: SimpleFormItemType.InputNumber },
          ]}
          groupAmount={2}
          renderOperationArea={renderOperationArea}
          rowProps={{ gutter: { md: 8, lg: 24 } }}
          submitLoading={loading.createPosition}
        />
      </Skeleton>
    </div>
  );
};

export default connect(
  ({ loading, position }: ConnectState): CreateProps => ({
    loading: {
      createPosition: loading.effects['position/createPosition'],
      fetchForm: loading.effects['position/fetchForm'],
    },
    position,
  }),
)(Create);
