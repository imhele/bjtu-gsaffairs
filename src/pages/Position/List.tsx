import { connect } from 'dva';
import Detail from './Detail';
import Media from 'react-media';
import styles from './List.less';
import React, { Component } from 'react';
import { message, Radio, Skeleton } from 'antd';
import { RadioChangeEvent } from 'antd/es/radio';
import { AuthorizedId, MediaQuery } from '@/global';
import StandardFilter from '@/components/StandardFilter';
import { FormattedMessage, formatMessage } from 'umi-plugin-locale';
import { CheckAuth, getCurrentScope } from '@/components/Authorized';
import { FetchListPayload, FetchDetailPayload } from '@/services/position';
import { HideWithouSelection, PositionType, TopbarAction, CellAction } from './consts';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';
import StandardTable, {
  PaginationConfig,
  StandardTableOperationAreaProps,
} from '@/components/StandardTable';

export interface ListProps extends ConnectProps {
  isMobile?: boolean;
  loading?: {
    fetchList?: boolean;
    fetchDetail?: boolean;
    model?: boolean;
  };
  position?: PositionState;
  type?: PositionType;
}

const enum ListSize {
  Default = 'default',
  Middle = 'middle',
  Small = 'small',
}

interface ListState {
  currentRow: object;
  currentRowKey: string;
  detailVisible: boolean;
  size: ListSize;
}

@connect(
  ({ loading, position }: ConnectState): ListProps => ({
    loading: {
      fetchList: loading.effects['position/fetchList'],
      fetchDetail: loading.effects['position/fetchDetail'],
      model: loading.models.position,
    },
    position,
  }),
)
class List extends Component<ListProps, ListState> {
  state: ListState = {
    currentRow: null,
    currentRowKey: null,
    detailVisible: false,
    size: ListSize.Default,
  };
  /**
   * `filter` is not a state, but just data copy from StandardFilter
   */
  private filtersValue: object = {};
  /**
   * When user changes value of `limit` or `offset`,
   * `onShowSizeChange` and `onChangPage` will call `fetchList`
   * which makes `props` change and trigger component re-rendering.
   */
  private limit: number = 10;
  private offset: number = 0;
  private filterExpandText = {
    expand: <FormattedMessage id="words.expand" />,
    retract: <FormattedMessage id="words.retract" />,
  };

  constructor(props: ListProps) {
    super(props);
    this.fetchList();
    if (props.isMobile) this.state.size = ListSize.Small;
  }

  fetchList = () => {
    const { dispatch, type } = this.props;
    if (!Object.values(PositionType).includes(type)) return;
    dispatch<FetchListPayload>({
      type: 'position/fetchList',
      payload: {
        body: {
          filtersValue: this.filtersValue,
          limit: this.limit,
          offset: this.offset,
        },
        query: { type },
      },
      callback: this.correctOffset,
    });
  };

  correctOffset = () => {
    const {
      position: { dataSource, total },
    } = this.props;
    // exception: offset === 0
    if (this.offset && total <= this.offset) {
      this.offset = total - dataSource.length;
    }
  };

  onChangePage = (page: number, pageSize: number) => {
    this.limit = pageSize;
    this.offset = (page - 1) * pageSize;
    this.fetchList();
  };

  onShowSizeChange = (_: number, pageSize: number) => {
    this.limit = pageSize;
    this.fetchList();
  };

  getPagination = (): PaginationConfig => {
    const {
      isMobile,
      position: { total },
    } = this.props;
    return {
      current: parseInt((this.offset / this.limit + 1).toFixed(0), 10),
      onChange: this.onChangePage,
      onShowSizeChange: this.onShowSizeChange,
      pageSize: this.limit,
      showSizeChanger: true,
      simple: isMobile,
      total,
    };
  };

  onChangeListSize = (event: RadioChangeEvent) => {
    this.setState({ size: event.target.value });
  };

  renderTableFooter = (): React.ReactNode => {
    const { size } = this.state;
    return (
      <React.Fragment>
        <div style={{ display: 'inline-block', marginRight: 12 }}>
          <FormattedMessage id="position.list.tableSize" />
        </div>
        <Radio.Group
          onChange={this.onChangeListSize}
          size={size === ListSize.Small ? 'small' : 'default'}
          value={size}
        >
          <Radio.Button value={ListSize.Default}>
            <FormattedMessage id={`position.list.tableSize.${ListSize.Default}`} />
          </Radio.Button>
          <Radio.Button value={ListSize.Middle}>
            <FormattedMessage id={`position.list.tableSize.${ListSize.Middle}`} />
          </Radio.Button>
          <Radio.Button value={ListSize.Small}>
            <FormattedMessage id={`position.list.tableSize.${ListSize.Small}`} />
          </Radio.Button>
        </Radio.Group>
      </React.Fragment>
    );
  };

  onSubmitFilter = (filtersValue: object) => {
    this.filtersValue = filtersValue;
    this.fetchList();
  };

  onCloseDetail = () => {
    this.setState({
      currentRow: null,
      currentRowKey: null,
      detailVisible: false,
    });
  };

  onClickAction = (currentRowKey: string, actionType: CellAction) => {
    const {
      dispatch,
      position: { dataSource, rowKey = 'key' },
      type,
    } = this.props;
    if (!currentRowKey) {
      return message.error(formatMessage({ id: 'position.error.unknown.click' }));
    }
    switch (actionType) {
      case CellAction.Preview:
        const currentRow = dataSource.find(row => row[rowKey] === currentRowKey);
        this.setState({ currentRow, currentRowKey, detailVisible: true });
        dispatch<FetchDetailPayload>({
          type: 'position/fetchDetail',
          payload: {
            body: { key: currentRowKey },
            query: { type },
          },
        });
        break;
      default:
        message.warn(formatMessage({ id: 'position.error.unknown.action' }));
    }
  };

  onClickOperation = (selectedRowKeys: string[] | number[], type: string) => {
    message.info(`Click on ${type}, selected keys ${selectedRowKeys}`);
  };

  renderOperationVisible = (selectedRowKeys: string[] | number[], type: TopbarAction): boolean => {
    const { type: positionType } = this.props;
    if (HideWithouSelection.has(type) && !selectedRowKeys.length) return false;
    if (!(getCurrentScope instanceof Map)) return false;
    const getScope = getCurrentScope.get(AuthorizedId.BasicLayout);
    if (typeof getScope !== 'function') return false;
    return CheckAuth([`scope.position.${positionType}.${type}`, 'scope.admin'], getScope());
  };

  getOperationArea = (): StandardTableOperationAreaProps => {
    const {
      position: { operationArea },
    } = this.props;
    if (!operationArea || !operationArea.operation) return null;
    if (!Array.isArray(operationArea.operation)) {
      const operation = {
        ...operationArea.operation,
        visible: this.renderOperationVisible,
      };
      return {
        moreText: <FormattedMessage id="words.more" />,
        onClick: this.onClickOperation,
        ...operationArea,
        operation,
      };
    } else {
      const operation = operationArea.operation.map(item => ({
        ...item,
        visible: this.renderOperationVisible,
      }));
      return {
        moreText: <FormattedMessage id="words.more" />,
        onClick: this.onClickOperation,
        ...operationArea,
        operation,
      };
    }
  };

  render() {
    const { currentRow, currentRowKey, detailVisible, size } = this.state;
    const {
      loading,
      position: { actionKey, columns, dataSource, detail, filters = [], scroll, selectable },
    } = this.props;
    return (
      <React.Fragment>
        {filters.length || !loading.fetchList ? (
          <StandardFilter
            className={styles.filter}
            expandText={this.filterExpandText}
            filters={filters}
            onSubmit={this.onSubmitFilter}
            resetText={<FormattedMessage id="words.reset" />}
            submitLoading={loading.fetchList}
            submitText={<FormattedMessage id="words.query" />}
          />
        ) : (
          <div style={{ marginBottom: 24 }}>
            <Skeleton active paragraph={{ rows: 3 }} title={false} />
          </div>
        )}
        <StandardTable
          actionKey={actionKey}
          columns={columns}
          dataSource={dataSource}
          footer={this.renderTableFooter}
          loading={loading.fetchList}
          onClickAction={this.onClickAction}
          operationArea={this.getOperationArea()}
          pagination={this.getPagination()}
          scroll={scroll}
          selectable={selectable}
          size={size}
        />
        <Detail
          {...detail}
          currentRow={currentRow}
          currentRowKey={currentRowKey}
          loading={loading.fetchDetail}
          onClose={this.onCloseDetail}
          visible={detailVisible}
        />
      </React.Fragment>
    );
  }
}

export default (props: ListProps) => (
  <Media query={MediaQuery}>{isMobile => <List {...props} isMobile={isMobile} />}</Media>
);
