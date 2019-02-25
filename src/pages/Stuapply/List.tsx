import { connect } from 'dva';
import router from 'umi/router';
import styles from './List.less';
import Edit from '../Position/Edit';
import Detail from '../Position/Detail';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import { formatMessage } from 'umi-plugin-locale';
import { FetchDetailPayload } from '@/api/position';
import InfiniteScroll from 'react-infinite-scroller';
import MemorableModal from '@/components/MemorableModal';
import DescriptionList from '@/components/DescriptionList';
import { Card, Collapse, Icon, message, Spin } from 'antd';
import { CellAction, PositionType } from '../Position/consts';
import { GlobalId, StorageId, TypeSpaceChar } from '@/global';
import { StandardTableAction } from '@/components/StandardTable';
import { FetchListPayload, DeleteStuapplyPayload, EditStuapplyBody } from '@/api/stuapply';
import { ConnectProps, ConnectState, PositionState, StuapplyState } from '@/models/connect';

export interface ListProps extends ConnectProps<{ type: PositionType }> {
  loading?: {
    auditStuapply?: boolean;
    deleteStuapply?: boolean;
    editStuapply?: boolean;
    fetchList?: boolean;
    fetchPositionDetail?: boolean;
    model?: boolean;
  };
  position?: PositionState;
  stuapply?: StuapplyState;
}

interface ListState {
  activeTabKey: string;
  currentKey: string;
  detailVisible: boolean;
  editing: boolean;
}

class List extends Component<ListProps, ListState> {
  state: ListState = {
    activeTabKey: null,
    currentKey: null,
    detailVisible: false,
    editing: false,
  };

  private loadingKeys: Set<string> = new Set();
  /**
   * When user changes value of `limit` or `offset`,
   * `onShowSizeChange` and `onChangPage` will call `fetchList`
   * which makes `props` change and trigger component re-rendering.
   */
  private limit: number = 20;
  private offset: number = 0;
  private type: PositionType = null;
  private status: string = '';

  constructor(props: ListProps) {
    super(props);
    this.type = PositionType.Manage;
    this.fetchList();
  }

  fetchList = () => {
    const { dispatch } = this.props;
    const { limit, offset, status, type } = this;
    if (!Object.values(PositionType).includes(type)) {
      return message.error(formatMessage({ id: 'position.error.unknown.type' }));
    }
    dispatch<FetchListPayload>({
      type: 'stuapply/fetchList',
      payload: {
        body: { limit, offset, status },
        query: { type },
      },
    });
  };

  deleteStuapply = (key: string) => {
    const { type } = this;
    const { dispatch } = this.props;
    this.loadingKeys.add(key);
    // this.cancelSelection(key);
    dispatch<DeleteStuapplyPayload>({
      type: 'stuapply/deleteStuapply',
      payload: { query: { type, key } },
      callback: this.deleteCallback,
    });
  };

  deleteCallback = (payload: DeleteStuapplyPayload) => {
    this.loadingKeys.delete(payload.query.key);
    this.fetchList();
  };

  onSearch = (value: string) => {
    // @TODO
  };

  onCloseDetail = () => this.setState({ detailVisible: false });

  onClickAction = ({ currentTarget }: React.MouseEvent) => {
    const { type } = this;
    const { dispatch } = this.props;
    const {
      dataset: { key, type: actionType, position },
    } = currentTarget as HTMLElement;
    let currentKey = `${key}`;
    switch (actionType) {
      /* Preview for post */
      case CellAction.Preview:
        this.setState({ currentKey, detailVisible: true, editing: false });
        dispatch<FetchDetailPayload>({
          type: 'position/fetchDetail',
          payload: { query: { type, key: position } },
        });
        break;
      // @TODO
      case CellAction.Delete:
        MemorableModal.confirm({
          defaultEnable: false,
          id: GlobalId.DeletePostion,
          onOk: this.deleteStuapply,
          payload: currentKey,
          title: formatMessage({ id: 'stuapply.delete.confirm' }),
        });
        break;
      case CellAction.Edit:
        dispatch<EditStuapplyBody>({
          type: 'stuapply/fetchDetail',
          payload: { query: { type, key: currentKey } },
        });
        this.setState({ editing: true, currentKey });
        break;
      case CellAction.Audit:
        currentKey = `${typeof currentKey}${TypeSpaceChar}${currentKey}`;
        sessionStorage.setItem(StorageId.PARowKes, JSON.stringify([currentKey]));
        router.push('audit');
        break;
      default:
        message.warn(formatMessage({ id: 'position.error.unknown.action' }));
    }
  };

  renderActionItem = (
    action: StandardTableAction,
    record: { [key: string]: any },
  ): Partial<StandardTableAction> => {
    const {
      stuapply: { rowKey = 'key' },
    } = this.props;
    return (
      <a
        className={action.disabled ? styles.disabled : void 0}
        data-key={record[rowKey]}
        data-type={action.type}
        data-position={record.positionKey}
        onClick={this.onClickAction}
      >
        {action.text || <Icon type={action.icon} />}
      </a>
    );
  };

  renderCardItem = (item: any) => {
    const { activeTabKey } = this.state;
    const {
      stuapply: { actionKey, rowKey, columnsKeys, columnsText, columns },
    } = this.props;
    const itemKey = `${item[rowKey]}`;
    const realActiveKey = activeTabKey || columnsKeys[0];
    const actions: StandardTableAction[] = item[actionKey] || [];
    return (
      <Collapse.Panel header={item.title} key={itemKey}>
        <Spin spinning={this.loadingKeys.has(itemKey)}>
          <Card
            actions={actions.map(i => this.renderActionItem(i, item))}
            activeTabKey={realActiveKey}
            bordered={false}
            className={styles.card}
            onTabChange={key => this.setState({ activeTabKey: key })}
            size="small"
            tabList={columnsKeys.map(col => ({ key: col, tab: columnsText[col] || col }))}
          >
            <DescriptionList
              description={columns[realActiveKey].map(({ dataIndex, title, ...restProps }) => ({
                children: item[realActiveKey][dataIndex],
                key: dataIndex,
                term: title,
                ...restProps,
              }))}
            />
          </Card>
        </Spin>
      </Collapse.Panel>
    );
  };

  onChangeOpenKey = (key: string) => {
    this.setState({ currentKey: key });
  };

  renderFirstLoading = () => {
    const { currentKey } = this.state;
    const {
      loading: { fetchList },
      stuapply: { columnsKeys, dataSource },
    } = this.props;
    if (columnsKeys.length)
      return (
        <Collapse
          accordion
          activeKey={currentKey}
          bordered={false}
          className={styles.collapse}
          onChange={this.onChangeOpenKey}
        >
          {dataSource.map(this.renderCardItem)}
        </Collapse>
      );
    if (!fetchList) return Edit.Empty;
    return (
      <div style={{ width: '100%', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  };

  render() {
    const { currentKey, detailVisible } = this.state;
    const {
      loading,
      position: { detail },
      stuapply: { dataSource, total },
    } = this.props;
    return (
      <div className={commonStyles.contentBody}>
        <InfiniteScroll
          initialLoad={false}
          pageStart={0}
          loadMore={this.fetchList}
          hasMore={!loading.fetchList && dataSource.length < total}
          useWindow={false}
        >
          {this.renderFirstLoading()}
          {loading.fetchList && dataSource.length < total && (
            <div className={styles.loadingContainer}>
              <Spin />
            </div>
          )}
        </InfiniteScroll>
        <Detail
          {...detail}
          loading={loading.fetchPositionDetail}
          onClose={this.onCloseDetail}
          visible={detailVisible}
        />
      </div>
    );
  }
}

export default connect(
  ({ loading, position, stuapply }: ConnectState): ListProps => ({
    loading: {
      auditStuapply: loading.effects['stuapply/auditStuapply'],
      deleteStuapply: loading.effects['stuapply/deleteStuapply'],
      editStuapply: loading.effects['stuapply/editStuapply'],
      fetchList: loading.effects['stuapply/fetchList'],
      fetchPositionDetail: loading.effects['position/fetchDetail'],
      model: loading.models.stuapply,
    },
    position,
    stuapply,
  }),
)(List);
