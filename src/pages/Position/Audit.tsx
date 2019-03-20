import Edit from './Edit';
import { connect } from 'dva';
import router from 'umi/router';
import debounce from 'debounce';
import classNames from 'classnames';
import QueueAnim from 'rc-queue-anim';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import { scrollToTop } from '@/utils/utils';
import SimpleForm from '@/components/SimpleForm';
import Exception404 from '@/pages/Exception/404';
import { GlobalId, StorageId, TypeSpaceChar } from '@/global';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import { buttonColProps, CellAction, PositionType } from './consts';
import { AuditPositionPayload, FetchFormPayload } from '@/api/position';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';
import {
  Button,
  Col,
  Dropdown,
  Icon,
  message,
  Menu,
  notification,
  Progress,
  Skeleton,
  Tooltip,
} from 'antd';

export interface AuditProps extends ConnectProps<{ type: PositionType }> {
  loading?: {
    auditPosition?: boolean;
    fetchForm?: boolean;
  };
  position?: PositionState;
}

interface AuditState {
  hoverProgress: boolean;
}

class Audit extends Component<AuditProps, AuditState> {
  state: AuditState = {
    hoverProgress: false,
  };

  handleHoverProgress = debounce((hoverProgress: boolean) => {
    this.setState({ hoverProgress });
  }, 50);
  /**
   * key of current position
   */
  private key: string | number = null;
  private keyQueue: string[] | number[] = [];
  private progressBase: number = 0;
  private showProgress: boolean = false;

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
    const keyStr = sessionStorage.getItem(StorageId.PARowKes);
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
    this.progressBase = this.keyQueue.length;
    this.showProgress = this.progressBase > 1;
    this.key = this.keyQueue[0];
    dispatch<FetchFormPayload>({
      type: 'position/fetchForm',
      payload: {
        body: { action: CellAction.Audit },
        query: { type, key: this.key },
      },
    });
  }

  Skip = () => (
    <Menu onClick={this.nextPosition}>
      <Menu.Item>
        <Icon type="forward" />
        <FormattedMessage id="word.skip-this-item" />
      </Menu.Item>
    </Menu>
  );

  componentWillUnmount = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'position/resetForm' });
    notification.close(`${GlobalId.PromptAuditAllDone}`);
  };

  backToList = () => {
    router.push('list');
    sessionStorage.removeItem(StorageId.PARowKes);
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
    scrollToTop();
    this.keyQueue = this.keyQueue.slice(1);
    if (!this.keyQueue.length) return this.promptNoMorePosition();
    this.key = this.keyQueue[0];
    dispatch<FetchFormPayload>({
      type: 'position/fetchForm',
      payload: {
        body: { action: CellAction.Audit },
        query: { type, key: this.key },
      },
    });
    const auditRowKeys = (this.keyQueue as (string | number)[]).map(key => {
      return `${typeof key}${TypeSpaceChar}${key}`;
    });
    sessionStorage.setItem(StorageId.PARowKes, JSON.stringify(auditRowKeys));
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
        body: fieldsValue,
        query: { type, key: this.key },
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
    const { hoverProgress } = this.state;
    const progressTipText = {
      done: this.progressBase - this.keyQueue.length,
      left: this.keyQueue.length,
    };
    // Related pull request: https://github.com/ant-design/ant-design/pull/14769
    const successPercent = `${(progressTipText.done * 100) / this.progressBase}` as any;
    if (!Object.values(PositionType).includes(type)) {
      return <Exception404 />;
    }
    return (
      <QueueAnim type="left" className={className} style={{ position: 'relative' }}>
        {this.showProgress && (
          <Tooltip title={formatMessage({ id: 'position.audit.progress' }, progressTipText)}>
            <div
              className={commonStyles.topProgressBar}
              onMouseEnter={() => this.handleHoverProgress(true)}
              onMouseLeave={() => this.handleHoverProgress(false)}
            >
              <Progress
                percent={100}
                showInfo={false}
                status="normal"
                strokeLinecap="square"
                strokeWidth={hoverProgress ? 8 : 4}
                successPercent={successPercent}
              />
            </div>
          </Tooltip>
        )}
        <Skeleton active key="Skeleton" loading={loading.fetchForm} paragraph={{ rows: 16 }}>
          <SimpleForm
            colProps={auditForm.colProps}
            empty={Edit.Empty(type)}
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
