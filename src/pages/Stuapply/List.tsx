import { connect } from 'dva';
import styles from './List.less';
import Edit from '../Position/Edit';
import { GlobalId } from '@/global';
import Detail from '../Position/Detail';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import { formatMessage } from 'umi-plugin-locale';
import { FetchDetailPayload } from '@/api/position';
import InfiniteScroll from 'react-infinite-scroller';
import MemorableModal from '@/components/MemorableModal';
import DescriptionList from '@/components/DescriptionList';
import { CellAction, PositionType } from '../Position/consts';
import { StandardTableAction } from '@/components/StandardTable';
import { Card, Collapse, Icon, Input, message, Spin } from 'antd';
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
  auditing: boolean;
  currentKey: string;
  detailVisible: boolean;
  editing: boolean;
  formValue: { [key: string]: string | number };
}

class List extends Component<ListProps, ListState> {
  state: ListState = {
    activeTabKey: null,
    auditing: false,
    currentKey: null,
    detailVisible: false,
    editing: false,
    formValue: {},
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

  cancelEditAuditState = () => {
    this.setState({ auditing: false, editing: false, formValue: {} });
    this.fetchList();
  };

  onCloseDetail = () => this.setState({ detailVisible: false });

  onClickAction = ({ currentTarget }: React.MouseEvent) => {
    const { type } = this;
    const { dispatch } = this.props;
    const { editing, auditing, formValue } = this.state;
    const {
      dataset: { index, key, type: actionType, position },
    } = currentTarget as HTMLElement;
    const currentKey = `${key}`;
    switch (actionType) {
      /* Preview for post */
      case CellAction.Preview:
        this.setState({
          detailVisible: true,
          auditing: false,
          editing: false,
        });
        dispatch<FetchDetailPayload>({
          type: 'position/fetchDetail',
          payload: { query: { type, key: position } },
        });
        break;
      case CellAction.Delete:
        this.offset = parseInt(index, 10);
        MemorableModal.confirm({
          defaultEnable: false,
          id: GlobalId.DeletePostion,
          onOk: this.deleteStuapply,
          payload: currentKey,
          title: formatMessage({ id: 'stuapply.delete.confirm' }),
        });
        break;
      case CellAction.Edit:
        if (!editing && !auditing) this.setState({ editing: true });
        break;
      case CellAction.Audit:
        if (!editing && !auditing) this.setState({ auditing: true });
        break;
      case CellAction.Save:
        dispatch<EditStuapplyBody>({
          type: editing ? 'stuapply/editStuapply' : 'stuapply/auditStuapply',
          payload: { body: formValue, query: { type, key: currentKey } },
          callback: this.cancelEditAuditState,
        });
        break;
      default:
        message.warn(formatMessage({ id: 'position.error.unknown.action' }));
    }
  };

  renderActionItem = (
    action: StandardTableAction,
    record: { [key: string]: any },
    cardIndex: number,
  ): Partial<StandardTableAction> => {
    const {
      stuapply: { rowKey = 'key' },
    } = this.props;
    return (
      <a
        className={action.disabled ? styles.disabled : void 0}
        data-index={cardIndex}
        data-key={record[rowKey]}
        data-position={record.positionKey}
        data-type={action.type}
        onClick={this.onClickAction}
      >
        {action.text || <Icon type={action.icon} />}
      </a>
    );
  };

  renderCardItem = (item: any, cardIndex: number) => {
    const { activeTabKey, editing, auditing } = this.state;
    const {
      stuapply: { actionKey, rowKey, columnsKeys, columnsText, columns },
    } = this.props;
    let header = item.title;
    const itemKey = `${item[rowKey]}`;
    const loading = this.loadingKeys.has(itemKey);
    const realActiveKey = activeTabKey || columnsKeys[0];
    let actions: (StandardTableAction)[] = item[actionKey] || [];
    if (editing || auditing)
      actions = [{ type: CellAction.Save, text: formatMessage({ id: 'word.save' }) }];
    if (loading)
      header = (
        <span>
          <Icon type="loading" />
          {`\xa0\xa0${header}`}
        </span>
      );
    return (
      <Collapse.Panel header={header} key={itemKey}>
        <Spin spinning={loading}>
          <Card
            actions={actions.map(a => this.renderActionItem(a, item, cardIndex))}
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
    const { currentKey, editing, auditing } = this.state;
    if ((editing || auditing) && key !== currentKey)
      message.warn(formatMessage({ id: 'stuapply.trigger-other-action-while-editing' }));
    else this.setState({ currentKey: key });
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
    const { detailVisible } = this.state;
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
