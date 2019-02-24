import Edit from './Edit';
import { connect } from 'dva';
import router from 'umi/router';
import classNames from 'classnames';
import QueueAnim from 'rc-queue-anim';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import SimpleForm from '@/components/SimpleForm';
import Exception404 from '@/pages/Exception/404';
import { formatStrOrNumQuery } from '@/utils/format';
import { Button, Col, message, Skeleton } from 'antd';
import { buttonColProps, PositionType } from './consts';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import { ApplyPositionPayload, ApplyFormPayload } from '@/api/position';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';

export interface ApplyProps extends ConnectProps<{ type: PositionType }> {
  loading?: {
    applyPosition?: boolean;
    fetchApplyForm?: boolean;
  };
  position?: PositionState;
}

const backToList = () => router.push('list');

class Apply extends Component<ApplyProps> {
  /**
   * key of current position
   */
  private key: string | number = null;

  constructor(props: ApplyProps) {
    super(props);
    const {
      dispatch,
      location: { search },
      match: {
        params: { type },
      },
    } = props;
    if (!Object.values(PositionType).includes(type)) {
      message.error(formatMessage({ id: 'position.error.unknown.type' }));
      return this;
    }
    this.key = formatStrOrNumQuery.parse(search).get('key');
    if (!this.key) return this;
    dispatch<ApplyFormPayload>({
      type: 'position/fetchApplyForm',
      payload: { query: { type, key: this.key } },
    });
  }

  componentWillUnmount = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'position/resetForm' });
  };

  renderOperationArea = (_: any, submitLoading: boolean) => {
    const {
      position: {
        form: { groupAmount },
      },
    } = this.props;
    return (
      <Col {...(groupAmount === 1 ? buttonColProps[0] : buttonColProps[1])}>
        <Button htmlType="submit" loading={submitLoading} type="primary">
          <FormattedMessage id="word.submit" />
        </Button>
        <Button onClick={backToList} style={{ marginLeft: 8 }}>
          <FormattedMessage id="word.back" />
        </Button>
      </Col>
    );
  };

  onSubmit = (fieldsValue: object) => {
    const {
      dispatch,
      match: {
        params: { type },
      },
    } = this.props;
    dispatch<ApplyPositionPayload>({
      type: 'position/applyPosition',
      payload: {
        body: fieldsValue,
        query: { type, key: this.key },
      },
    });
  };

  render() {
    const {
      loading,
      match: {
        params: { type },
      },
      position: { form: applyForm },
    } = this.props;
    const className = classNames(
      commonStyles.contentBody,
      commonStyles.verticalSpace,
      commonStyles.compactFormItem,
    );
    if (!Object.values(PositionType).includes(type)) {
      return <Exception404 />;
    }
    return (
      <QueueAnim type="left" className={className}>
        <Skeleton active key="Skeleton" loading={loading.fetchApplyForm} paragraph={{ rows: 7 }}>
          <SimpleForm
            colProps={applyForm.colProps}
            empty={Edit.Empty}
            formItemProps={applyForm.formItemProps}
            formItems={applyForm.formItems}
            groupAmount={applyForm.groupAmount}
            initialFieldsValue={applyForm.initialFieldsValue}
            onSubmit={this.onSubmit}
            renderOperationArea={this.renderOperationArea}
            rowProps={applyForm.rowProps}
            submitLoading={loading.applyPosition}
          />
        </Skeleton>
      </QueueAnim>
    );
  }
}

export default connect(
  ({ loading, position }: ConnectState): ApplyProps => ({
    loading: {
      applyPosition: loading.effects['position/applyPosition'],
      fetchApplyForm: loading.effects['position/fetchApplyForm'],
    },
    position,
  }),
)(Apply);
