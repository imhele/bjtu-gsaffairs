import Edit from './Edit';
import { connect } from 'dva';
import router from 'umi/router';
import classNames from 'classnames';
import QueueAnim from 'rc-queue-anim';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import SimpleForm from '@/components/SimpleForm';
import Exception404 from '@/pages/Exception/404';
import { FetchFormPayload } from '@/services/position';
import { AuditPositionPayload } from '@/services/position';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import { buttonColProps, CellAction, PositionType } from './consts';
import { GlobalId, SessionStorageId, TypeSpaceChar } from '@/global';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';
import { Button, Col, Dropdown, Icon, message, Menu, notification, Skeleton } from 'antd';

export interface AuditProps extends ConnectProps<{ type: PositionType }> {
  loading?: {
    auditPosition?: boolean;
    fetchForm?: boolean;
  };
  position?: PositionState;
}

class Audit extends Component<AuditProps> {
  /**
   * key of current position
   */
  private key: string | number = null;
  private keyQueue: string[] | number[] = [];
  private Skip = (
    <Menu onClick={this.nextPosition}>
      <Menu.Item>
        <Icon type="forward" />
        <FormattedMessage id="word.skip-this-item" />
      </Menu.Item>
    </Menu>
  );

  constructor(props: AuditProps) {
    super(props);
    const {
      dispatch,
      match: {
        params: { type },
      },
    } = props;
    if (!Object.values(PositionType).includes(type)) {
      message.error(formatMessage({ id: 'position.error.unknown.type' }));
      return this;
    }
    const keyStr = sessionStorage.getItem(SessionStorageId.PositionAuditRowKes);
    if (keyStr) {
      try {
        this.keyQueue = JSON.parse(keyStr);
        this.keyQueue = JSON.parse(keyStr).map((key: string) => {
          const keyArr = key.split(TypeSpaceChar, 2);
          if (keyArr[0] === 'number') return parseInt(keyArr[1], 10);
          if (keyArr[0] === 'string') return keyArr[1];
          return key;
        });
      } catch {
        this.keyQueue = [];
      }
    }
    if (!this.keyQueue.length) {
      this.promptNoMorePosition();
      return this;
    }
    this.key = this.keyQueue[0];
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

  componentWillUnmount = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'position/resetForm' });
    const auditRowKeys = (this.keyQueue as (string | number)[]).map(key => {
      return `${typeof key}${TypeSpaceChar}${key}`;
    });
    sessionStorage.setItem(SessionStorageId.PositionAuditRowKes, JSON.stringify(auditRowKeys));
    notification.close(`${GlobalId.PromptAuditAllDone}`);
  };

  backToList = () => {
    this.keyQueue = [];
    router.push('list');
  };

  promptNoMorePosition = () => {
    const done = formatMessage({ id: 'word.audit-P', defaultMessage: '审核' });
    const thing = formatMessage({ id: 'word.position', defaultMessage: '岗位' });
    const title = formatMessage({ id: 'tip.no-more-thing-to-be-done' }, { done, thing });
    notification.info({
      btn: (
        <Button type="primary" onClick={this.backToList}>
          {formatMessage({ id: 'tip.go-to-position-list' })}
        </Button>
      ),
      description: formatMessage({ id: 'tip.position.audit.batch', defaultMessage: ' ' }),
      duration: 9,
      key: `${GlobalId.PromptAuditAllDone}`,
      message: title,
    });
  };

  nextPosition = () => {
    const {
      dispatch,
      match: {
        params: { type },
      },
    } = this.props;
    this.keyQueue = this.keyQueue.slice(1);
    if (!this.keyQueue.length) return this.promptNoMorePosition();
    this.key = this.keyQueue[0];
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
  };

  renderOperationArea = (_: any, submitLoading: boolean) => {
    const {
      position: {
        form: { groupAmount },
      },
    } = this.props;
    return (
      <Col {...(groupAmount === 1 ? buttonColProps[0] : buttonColProps[1])}>
        <Button htmlType="submit" loading={submitLoading} style={{ marginRight: 8 }} type="primary">
          <FormattedMessage id="word.submit" />
        </Button>
        {this.keyQueue.length > 1 ? (
          <Dropdown.Button onClick={this.backToList} overlay={this.Skip}>
            <FormattedMessage id="word.quit" />
          </Dropdown.Button>
        ) : (
          <Button onClick={this.backToList}>
            <FormattedMessage id="word.quit" />
          </Button>
        )}
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
    const callback = this.keyQueue.length > 1 ? this.nextPosition : this.backToList;
    dispatch<AuditPositionPayload>({
      type: 'position/auditPosition',
      payload: {
        body: {
          ...fieldsValue,
          key: this.key,
        },
        query: { type },
      },
      callback,
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
        <Skeleton active key="Skeleton" loading={loading.fetchForm} paragraph={{ rows: 7 }}>
          <SimpleForm
            colProps={auditForm.colProps}
            empty={Edit.Empty}
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
