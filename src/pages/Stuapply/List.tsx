import { connect } from 'dva';
import router from 'umi/router';
import styles from './List.less';
import Edit from '../Position/Edit';
import Detail from '../Position/Detail';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import { FetchDetailPayload } from '@/api/position';
import InfiniteScroll from 'react-infinite-scroller';
import { message, Row, Col, Card, Spin } from 'antd';
import MemorableModal from '@/components/MemorableModal';
import { CellAction, PositionType } from '../Position/consts';
import { GlobalId, StorageId, TypeSpaceChar } from '@/global';
import { StandardTableAction } from '@/components/StandardTable';
import { FormattedMessage, formatMessage } from 'umi-plugin-locale';
import DescriptionList, { DescriptionProps } from '@/components/DescriptionList';
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
  currentKey: string | number;
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

  private loadingKeys: Set<string | number> = new Set();
  private expandText = {
    expand: <FormattedMessage id="word.expand" />,
    retract: <FormattedMessage id="word.retract" />,
  };
  /**
   * When user changes value of `limit` or `offset`,
   * `onShowSizeChange` and `onChangPage` will call `fetchList`
   * which makes `props` change and trigger component re-rendering.
   */
  private limit: number = 10;
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
      callback: this.correctOffset,
    });
  };

  deleteStuapply = (key: string | number) => {
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

  correctOffset = () => {
    const { stuapply } = this.props;
    this.offset = stuapply.dataSource.length;
  };

  onSearch = (value: string) => {
    // @TODO
  };

  onCloseDetail = () => {
    const { detailVisible } = this.state;
    if (detailVisible) {
      this.setState({
        currentKey: null,
        detailVisible: false,
      });
    }
  };

  onClickAction = (currentKey: string | number, actionType: CellAction) => {
    const { type } = this;
    const { dispatch } = this.props;
    switch (actionType) {
      /* Preview for post */
      case CellAction.Preview:
        this.setState({ currentKey, detailVisible: true, editing: false });
        dispatch<FetchDetailPayload>({
          type: 'position/fetchDetail',
          payload: { query: { type, key: currentKey } },
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

  renderActionProps = (
    action: StandardTableAction,
    record: object,
  ): Partial<StandardTableAction> => {
    const {
      stuapply: { rowKey = 'key' },
    } = this.props;
    if (this.loadingKeys.has(record[rowKey])) {
      return { ...action, loading: true };
    }
    return action;
  };

  renderCardItem = (item: any) => {
    const { currentKey, activeTabKey } = this.state;
    const {
      stuapply: { rowKey, columnsKeys, columnsText, columns },
    } = this.props;
    const realActiveKey = currentKey === item[rowKey] ? activeTabKey : columnsKeys[0];
    return (
      <Card
        activeTabKey={realActiveKey}
        className={styles.card}
        key={item[rowKey]}
        onTabChange={key => this.setState({ currentKey: item[rowKey], activeTabKey: key })}
        title={item.title}
        tabList={columnsKeys.map(col => ({ key: col, tab: columnsText[col] || col }))}
      >
        <DescriptionList
          col={4}
          description={columns[realActiveKey].map(({ dataIndex, title, ...restProps }) => ({
            children: item[realActiveKey][dataIndex],
            key: dataIndex,
            term: title,
            ...restProps,
          }))}
        />
      </Card>
    );
  };

  renderFirstLoading = () => {
    const {
      loading: { fetchList },
      stuapply: { columnsKeys, dataSource },
    } = this.props;
    if (columnsKeys.length) return dataSource.map(this.renderCardItem);
    if (!fetchList) return Edit.Empty;
    return (
      <div style={{ width: '100%', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  };

  render() {
    const { currentKey, detailVisible, editing, activeTabKey } = this.state;
    const {
      loading,
      position: { detail },
      stuapply: { actionKey, columns, columnsKeys, dataSource, rowKey, total },
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
          currentRowKey={currentKey}
          loading={loading.fetchPositionDetail}
          onClickAction={this.onClickAction}
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
