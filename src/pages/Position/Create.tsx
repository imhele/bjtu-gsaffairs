import { connect } from 'dva';
import router from 'umi/router';
import styles from './Create.less';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import SimpleForm from '@/components/SimpleForm';
import Exception404 from '@/pages/Exception/404';
import { PositionType, TopbarAction } from './consts';
import { Button, Col, message, Skeleton } from 'antd';
import { FetchFormPayload } from '@/services/position';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';

export interface CreateProps extends ConnectProps<{ type: PositionType }> {
  loading?: {
    createPosition?: boolean;
    fetchForm?: boolean;
  };
  position?: PositionState;
}

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

class Create extends Component<CreateProps> {
  constructor(props: CreateProps) {
    super(props);
    const {
      dispatch,
      match: {
        params: { type },
      },
    } = props;
    dispatch<FetchFormPayload>({
      type: 'position/fetchForm',
      payload: {
        body: { action: TopbarAction.Create },
        query: { type },
      },
    });
  }
  render() {
    const {
      loading,
      match: {
        params: { type },
      },
      position: { form: createForm },
    } = this.props;
    if (!Object.values(PositionType).includes(type)) {
      message.error(formatMessage({ id: 'position.error.unknown.type' }));
      return <Exception404 />;
    }
    return (
      <div className={commonStyles.contentBody}>
        <Skeleton active loading={loading.fetchForm} paragraph={{ rows: 7 }}>
          <SimpleForm
            className={styles.form}
            colProps={createForm.colProps}
            formItemProps={createForm.formItemProps}
            formItems={createForm.formItems}
            groupAmount={createForm.groupAmount}
            initialFieldsValue={createForm.initialFieldsValue}
            onSubmit={values => console.log(values) /* tslint:disable-line */}
            renderOperationArea={renderOperationArea}
            rowProps={createForm.rowProps}
            submitLoading={loading.createPosition}
          />
        </Skeleton>
      </div>
    );
  }
}

export default connect(
  ({ loading, position }: ConnectState): CreateProps => ({
    loading: {
      createPosition: loading.effects['position/createPosition'],
      fetchForm: loading.effects['position/fetchForm'],
    },
    position,
  }),
)(Create);
