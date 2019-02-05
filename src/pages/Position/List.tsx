import Detail from './Detail';
import { connect } from 'dva';
import Media from 'react-media';
import router from 'umi/router';
import styles from './List.less';
import { safeFun } from '@/utils/utils';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import { ButtonProps } from 'antd/es/button';
import { message, Radio, Skeleton } from 'antd';
import { Filter } from '@/components/SimpleForm';
import { RadioChangeEvent } from 'antd/es/radio';
import { WrappedFormUtils } from 'antd/es/form/Form';
import MemorableModal from '@/components/MemorableModal';
import { FormattedMessage, formatMessage } from 'umi-plugin-locale';
import { CheckAuth, getCurrentScope } from '@/components/Authorized';
import { AuthorizedId, MediaQuery, MemorableModalId } from '@/global';
import { HideWithouSelection, PositionType, CellAction, TopbarAction } from './consts';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';
import { FetchListPayload, FetchDetailPayload, DeletePositionPayload } from '@/services/position';
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
    deletePosition?: boolean;
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
      deletePosition: loading.effects['position/deletePosition'],
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
    expand: <FormattedMessage id="word.expand" />,
    retract: <FormattedMessage id="word.retract" />,
  };
  private filterFormUtils: WrappedFormUtils = null;
  /**
   * `filter` is not a state, but just data copy from Filter
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
    clearText: <FormattedMessage id="word.clear" />,
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

  deletePosition = (currentRowKey: string | number) => {
    const {
      dispatch,
      match: {
        params: { type },
      },
    } = this.props;
    this.deletingRowKeys.add(currentRowKey);
    this.cancelSelection(currentRowKey);
    dispatch<DeletePositionPayload>({
      type: 'position/deletePosition',
      payload: {
        body: { key: currentRowKey },
        query: { type },
      },
      callback: this.deleteCallback,
    });
  };

  deleteCallback = (payload: DeletePositionPayload) => {
    this.deletingRowKeys.delete(payload.body.key);
    this.onCloseDetail();
    this.fetchList();
  };

  cancelSelection = (rowKey: string | number) => {
    const selected = safeFun<(string | number)[]>(this.tableMethods.getSelectedRowKeys, []);
    if (selected.length) {
      const findIndex = selected.findIndex(item => item === rowKey);
      if (findIndex !== -1) {
        selected.splice(findIndex, 1);
        safeFun(this.tableMethods.setSelectedRowKeys, null, selected);
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
    const { detailVisible } = this.state;
    if (detailVisible) {
      this.setState({
        currentRow: null,
        currentRowKey: null,
        detailVisible: false,
      });
    }
  };

  onClickAction = (currentRowKey: string | number, actionType: CellAction, currentRow: object) => {
    const {
      dispatch,
      match: {
        params: { type },
      },
    } = this.props;
    switch (actionType) {
      case CellAction.Preview:
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
        MemorableModal.confirm({
          defaultEnable: false,
          id: MemorableModalId.DeletePostion,
          onOk: this.deletePosition,
          payload: currentRowKey,
          title: formatMessage({ id: 'position.delete.confirm' }),
        });
        break;
      default:
        message.warn(formatMessage({ id: 'position.error.unknown.action' }));
    }
  };

  renderActionProps = (
    action: StandardTableAction,
    record: object,
  ): Partial<StandardTableAction> => {
    const {
      position: { rowKey = 'key' },
    } = this.props;
    if (this.deletingRowKeys.has(record[rowKey])) {
      if (action.type === CellAction.Delete) {
        return { loading: true };
      }
      return { disabled: true };
    }
    return action;
  };

  onClickOperation = (selectedRowKeys: (string | number)[], operationType: string) => {
    const {
      // dispatch,
      match: {
        params: { type },
      },
    } = this.props;
    safeFun(this.tableMethods.clearSelectedRowKeys);
    switch (operationType) {
      case TopbarAction.Create:
        router.push(`/position/${type}/create`);
        break;
      default:
        message.warn(formatMessage({ id: 'position.error.unknown.action' }));
    }
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
      moreText: <FormattedMessage id="word.more" />,
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

  renderDetailFooterProps = (
    action: StandardTableAction,
    currentRowKey: string | number,
  ): ButtonProps => {
    const { loading } = this.props;
    const isDeleting = this.deletingRowKeys.has(currentRowKey);
    switch (action.type) {
      case CellAction.Delete:
        return {
          disabled: loading.fetchDetail || isDeleting,
          loading: loading.deletePosition && isDeleting,
        };
      default:
        return {
          disabled: loading.fetchDetail || isDeleting,
        };
    }
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
          <Filter
            className={styles.filter}
            expandText={this.filterExpandText}
            filters={filters}
            onSubmit={this.onSubmitFilter}
            resetText={<FormattedMessage id="word.reset" />}
            submitLoading={loading.fetchList}
            submitText={<FormattedMessage id="word.query" />}
          />
        ) : (
          <div style={{ marginBottom: 24 }}>
            <Skeleton active paragraph={{ rows: 3 }} title={false} />
          </div>
        )}
        <StandardTable
          actionKey={actionKey}
          actionProps={this.renderActionProps}
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
          renderFooterProps={this.renderDetailFooterProps}
          visible={detailVisible}
        />
      </div>
    );
  }
}

export default (props: ListProps) => (
  <Media query={MediaQuery}>{isMobile => <List {...props} isMobile={isMobile} />}</Media>
);
