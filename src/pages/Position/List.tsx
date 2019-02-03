import { connect } from 'dva';
import Detail from './Detail';
import Media from 'react-media';
import styles from './List.less';
import { safeFun } from '@/utils/utils';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import { message, Radio, Skeleton } from 'antd';
import { RadioChangeEvent } from 'antd/es/radio';
import { AuthorizedId, MediaQuery } from '@/global';
import { WrappedFormUtils } from 'antd/es/form/Form';
import StandardFilter from '@/components/StandardFilter';
import { FormattedMessage, formatMessage } from 'umi-plugin-locale';
import { CheckAuth, getCurrentScope } from '@/components/Authorized';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';
import { HideWithouSelection, PositionType, TopbarAction, CellAction } from './consts';
import { FetchListPayload, FetchDetailPayload, BatchDeletePayload } from '@/services/position';
import StandardTable, {
  PaginationConfig,
  StandardTableAction,
  StandardTableAlertProps,
  StandardTableMethods,
  StandardTableOperation,
  StandardTableOperationAreaProps,
  TableRowSelection,
} from '@/components/StandardTable';

export interface ListProps extends ConnectProps<{ type: PositionType }> {
  isMobile?: boolean;
  loading?: {
    batchDelete?: boolean;
    fetchList?: boolean;
    fetchDetail?: boolean;
    model?: boolean;
  };
  position?: PositionState;
}

const enum ListSize {
  Default = 'default',
  Middle = 'middle',
  Small = 'small',
}

interface ListState {
  currentRow: object;
  currentRowKey: string | number;
  detailVisible: boolean;
  size: ListSize;
}

@connect(
  ({ loading, position }: ConnectState): ListProps => ({
    loading: {
      batchDelete: loading.effects['position/batchDelete'],
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

  private deletingRowKeys: Set<string | number> = new Set();
  private filterExpandText = {
    expand: <FormattedMessage id="words.expand" />,
    retract: <FormattedMessage id="words.retract" />,
  };
  private filterFormUtils: WrappedFormUtils = null;
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
  private tableAlertProps: StandardTableAlertProps = {
    clearText: <FormattedMessage id="words.clear" />,
    format: (node: any) => (
      <FormattedMessage id="position.list.table.selected-alert" values={{ node }} />
    ),
  };
  private tableMethods: Partial<StandardTableMethods> = {};
  private type: PositionType = null;

  constructor(props: ListProps) {
    super(props);
    this.type = props.match.params.type;
    this.fetchList();
    if (props.isMobile) {
      this.state.size = ListSize.Small;
    }
  }

  componentDidUpdate = () => {
    const {
      match: { params },
    } = this.props;
    if (params.type !== this.type) {
      this.type = params.type;
      this.offset = 0;
      if (this.filterFormUtils) {
        safeFun(this.filterFormUtils.resetFields);
      }
      if (safeFun<string[] | number[]>(this.tableMethods.getSelectedRowKeys, []).length) {
        safeFun(this.tableMethods.clearSelectedRowKeys);
      }
      this.fetchList();
    }
  };

  fetchList = () => {
    const {
      dispatch,
      match: {
        params: { type },
      },
    } = this.props;
    if (!Object.values(PositionType).includes(type)) {
      return message.error(formatMessage({ id: 'position.error.unknown.type' }));
    }
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

  deleteCallback = (payload: BatchDeletePayload) => {
    payload.body.key.forEach(k => this.deletingRowKeys.delete(k));
    this.fetchList();
  };

  cancelSelection = (rowKeys: (string | number)[]) => {
    const selected = safeFun<(string | number)[]>(this.tableMethods.getSelectedRowKeys, []);
    if (selected.length) {
      const nextSelected = selected.filter(item => !rowKeys.includes(item));
      if (nextSelected.length !== selected.length) {
        safeFun(this.tableMethods.setSelectedRowKeys, null, nextSelected);
      }
    }
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

  onSubmitFilter = (filtersValue: object, form: WrappedFormUtils) => {
    this.filtersValue = filtersValue;
    this.filterFormUtils = form;
    this.fetchList();
  };

  onCloseDetail = () => {
    this.setState({
      currentRow: null,
      currentRowKey: null,
      detailVisible: false,
    });
  };

  onClickAction = (currentRowKey: string | number, actionType: CellAction) => {
    const {
      dispatch,
      match: {
        params: { type },
      },
      position: { dataSource, rowKey = 'key' },
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
      case CellAction.Delete:
        this.deletingRowKeys.add(currentRowKey);
        this.cancelSelection([currentRowKey]);
        dispatch<BatchDeletePayload>({
          type: 'position/batchDelete',
          payload: {
            body: { key: [currentRowKey] },
            query: { type },
          },
          callback: this.deleteCallback,
        });
        break;
      default:
        message.warn(formatMessage({ id: 'position.error.unknown.action' }));
    }
  };

  renderActionLoading = (action: StandardTableAction, record: object): boolean => {
    if (action.type !== CellAction.Delete) return action.loading;
    const {
      position: { rowKey = 'key' },
    } = this.props;
    if (this.deletingRowKeys.has(record[rowKey])) return true;
    return action.loading;
  };

  onClickOperation = (selectedRowKeys: (string | number)[], operationType: string) => {
    const {
      dispatch,
      match: {
        params: { type },
      },
    } = this.props;
    safeFun(this.tableMethods.clearSelectedRowKeys);
    switch (operationType) {
      case TopbarAction.Delete:
        selectedRowKeys.forEach(item => this.deletingRowKeys.add(item));
        dispatch<BatchDeletePayload>({
          type: 'position/batchDelete',
          payload: {
            body: { key: selectedRowKeys },
            query: { type },
          },
          callback: this.deleteCallback,
        });
        break;
      default:
        message.warn(formatMessage({ id: 'position.error.unknown.action' }));
    }
  };

  renderOperationLoading = (operation: StandardTableOperation): boolean => {
    if (operation.type !== TopbarAction.Delete) return operation.loading;
    const { loading } = this.props;
    if (loading.batchDelete) return true;
    return false;
  };

  renderOperationVisible = (
    operation: StandardTableOperation,
    selectedRowKeys: string[] | number[],
  ): boolean => {
    const {
      match: {
        params: { type: positionType },
      },
    } = this.props;
    if (operation.visible === false) return false;
    if (HideWithouSelection.has(operation.type as any) && !selectedRowKeys.length) return false;
    if (!(getCurrentScope instanceof Map)) return false;
    const getScope = getCurrentScope.get(AuthorizedId.BasicLayout);
    if (typeof getScope !== 'function') return false;
    return CheckAuth(
      [`scope.position.${positionType}.${operation.type}`, 'scope.admin'],
      getScope(),
    );
  };

  getOperationArea = (): StandardTableOperationAreaProps => {
    const {
      position: { operationArea },
    } = this.props;
    if (!operationArea || !operationArea.operation) return null;
    return {
      loading: this.renderOperationLoading,
      moreText: <FormattedMessage id="words.more" />,
      onClick: this.onClickOperation,
      visible: this.renderOperationVisible,
      ...operationArea,
    };
  };

  getTableMethods = (tableMethods: StandardTableMethods) => {
    this.tableMethods = tableMethods || {};
  };

  getSelectableProps = (): TableRowSelection<object> | null => {
    const {
      position: { rowKey, selectable, unSelectableKey = 'unSelectable' },
    } = this.props;
    if (!selectable) return null;
    return {
      ...(selectable === true ? {} : selectable),
      getCheckboxProps: record => ({
        disabled: record[unSelectableKey] || this.deletingRowKeys.has(record[rowKey]),
      }),
    };
  };

  render() {
    const { currentRow, currentRowKey, detailVisible, size } = this.state;
    const {
      loading,
      position: { actionKey, columns, dataSource, detail, filters = [], scroll },
    } = this.props;
    return (
      <div className={commonStyles.contentBody}>
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
          actionProps={{ loading: this.renderActionLoading }}
          alert={this.tableAlertProps}
          columns={columns}
          dataSource={dataSource}
          footer={this.renderTableFooter}
          getMenthods={this.getTableMethods}
          loading={loading.fetchList}
          onClickAction={this.onClickAction}
          operationArea={this.getOperationArea()}
          pagination={this.getPagination()}
          scroll={scroll}
          selectable={this.getSelectableProps()}
          size={size}
        />
        <Detail
          {...detail}
          currentRow={currentRow}
          currentRowKey={currentRowKey}
          loading={loading.fetchDetail}
          onClickAction={this.onClickAction}
          onClose={this.onCloseDetail}
          visible={detailVisible}
        />
      </div>
    );
  }
}

export default (props: ListProps) => (
  <Media query={MediaQuery}>{isMobile => <List {...props} isMobile={isMobile} />}</Media>
);
