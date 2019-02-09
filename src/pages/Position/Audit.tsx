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
import { FetchFormPayload } from '@/services/position';
import { AuditPositionPayload } from '@/services/position';
import { buttonColProps, CellAction, PositionType } from './consts';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';

export interface AuditProps extends ConnectProps<{ type: PositionType }> {
  loading?: {
    auditPosition?: boolean;
    fetchForm?: boolean;
  };
  position?: PositionState;
}

const backToList = () => router.push('list');

class Audit extends Component<AuditProps> {
  /**
   * key of current position
   */
  private key: string | number = null;

  constructor(props: AuditProps) {
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
    } else {
      this.key = formatStrOrNumQuery.parse(search).get('key');
      dispatch<FetchFormPayload>({
        type: 'position/fetchForm',
        payload: {
          body: {
            action: CellAction.Audit,
            key: this.key,
          },
          query: { type },
        },
      });
    }
  }

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
    dispatch<AuditPositionPayload>({
      type: 'position/editPosition',
      payload: {
        body: {
          ...fieldsValue,
          key: this.key,
        },
        query: { type },
      },
    });
  };

  render() {
    const {
      loading,
      match: {
        params: { type },
      },
      position: { form: auditForm },
    } = this.props;
    const className = classNames(commonStyles.contentBody, commonStyles.verticalSpace);
    if (!Object.values(PositionType).includes(type)) {
      return <Exception404 />;
    }
    return (
      <QueueAnim type="left" className={className}>
        <Skeleton active key="Skeleton" loading={loading.fetchForm} paragraph={{ rows: 7 }}>
          <SimpleForm
            colProps={auditForm.colProps}
            formItemProps={auditForm.formItemProps}
            formItems={auditForm.formItems}
            groupAmount={auditForm.groupAmount}
            initialFieldsValue={auditForm.initialFieldsValue}
            onSubmit={this.onSubmit}
            renderOperationArea={this.renderOperationArea}
            rowProps={auditForm.rowProps}
            submitLoading={loading.auditPosition}
          />
        </Skeleton>
      </QueueAnim>
    );
  }
}

export default connect(
  ({ loading, position }: ConnectState): AuditProps => ({
    loading: {
      auditPosition: loading.effects['position/auditPosition'],
      fetchForm: loading.effects['position/fetchForm'],
    },
    position,
  }),
)(Audit);
