import { connect } from 'dva';
import styles from './List.less';
import Edit from '../Position/Edit';
import Detail from '../Position/Detail';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import PageHeader from '@/layouts/PageHeader';
import { GlobalId, StorageId } from '@/global';
import { RadioChangeEvent } from 'antd/es/radio';
import { formatMessage } from 'umi-plugin-locale';
import { CheckAuth } from '@/components/Authorized';
import { FetchDetailPayload } from '@/api/position';
import InfiniteScroll from 'react-infinite-scroller';
import MemorableModal from '@/components/MemorableModal';
import DescriptionList from '@/components/DescriptionList';
import { CellAction, PositionType } from '../Position/consts';
import { StandardTableAction } from '@/components/StandardTable';
import { Filter, FilterItemProps } from '@/components/SimpleForm';
import { Button, Card, Collapse, Icon, Input, message, Spin, Tabs } from 'antd';
import { renderFormItem, SimpleFormItemType } from '@/components/SimpleForm/BaseForm';
import { FetchListPayload, DeleteStuapplyPayload, EditStuapplyBody } from '@/api/stuapply';
import { ConnectProps, ConnectState, PositionState, StuapplyState } from '@/models/connect';

const allFilters: FilterItemProps[] = [
  {
    id: 'mode',
    title: '模式',
    type: SimpleFormItemType.Select,
    itemProps: { allowClear: false },
    selectOptions: [{ value: '导师模式' }, { value: '普通模式' }],
  },
  {
    id: 'status',
    title: '状态',
    type: SimpleFormItemType.Select,
    itemProps: { allowClear: false },
    selectOptions: [
      { value: '', title: '全部' },
      { value: '草稿' },
      { value: '待审核' },
      { value: '审核通过' },
      { value: '废除' },
    ],
  },
  {
    id: 'actionFilter',
    title: '只看',
    type: SimpleFormItemType.Select,
    itemProps: { allowClear: false },
    selectOptions: [
      { title: '全部', value: '' },
      { title: '可编辑', value: CellAction.Edit },
      { title: '可审核', value: CellAction.Audit },
      { title: '可删除', value: CellAction.Delete },
    ],
  },
];

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
  activeCardKeys: Set<string>;
  actionFilter: string;
  activeTabKey: string;
  auditing: boolean;
  currentKey: string;
  detailVisible: boolean;
  editing: boolean;
}

class List extends Component<ListProps, ListState> {
  state: ListState = {
    activeCardKeys: new Set(),
    actionFilter: '',
    activeTabKey: null,
    auditing: false,
    currentKey: null,
    detailVisible: false,
    editing: false,
  };

  filters: FilterItemProps[] = allFilters;

  /**
   * When user changes value of `limit` or `offset`,
   * `onShowSizeChange` and `onChangPage` will call `fetchList`
   * which makes `props` change and trigger component re-rendering.
   */
  private limit: number = 40;
  private offset: number = 0;
  private status: string = '';
  private type: PositionType = null;
  private loadingKeys: Set<string> = new Set();
  private mode: string = '普通模式';
  private formValue: { [key: string]: string | string[] } = {};

  constructor(props: ListProps) {
    super(props);
    this.type = PositionType.Manage;
    try {
      const savedString = sessionStorage.getItem(StorageId.SLFilter);
      if (savedString) {
        const savedValue = JSON.parse(savedString);
        if (savedValue.mode) this.mode = savedValue.mode;
        if (savedValue.status) this.status = savedValue.status;
        if (savedValue.actionFilter) this.state.actionFilter = savedValue.actionFilter;
      }
    } catch {}
    this.fetchList();
  }

  componentDidUpdate = () => {
    this.filterFilter();
  };

  componentDidMount = () => {
    this.filterFilter();
  };

  filterFilter = () => {
    // student and admin need not to use this filter
    const auth = !CheckAuth(
      [`scope.position.${this.type}.apply`, 'scope.admin'],
      null,
      GlobalId.BasicLayout,
    );
    if (auth) {
      if (this.filters.length === allFilters.length) return;
      this.filters = allFilters;
    } else {
      if (this.filters.length !== allFilters.length) return;
      this.filters = allFilters.slice(1);
    }
    this.forceUpdate();
  };

  fetchList = () => {
    const { dispatch } = this.props;
    const { limit, mode, offset, status, type } = this;
    if (!Object.values(PositionType).includes(type)) {
      return message.error(formatMessage({ id: 'position.error.unknown.type' }));
    }
    dispatch<FetchListPayload, (payload: FetchListPayload, dataSource: object[]) => void>({
      type: 'stuapply/fetchList',
      payload: {
        body: { limit, mode, offset, status },
        query: { type },
      },
      callback: this.correctOffset,
    });
  };

  correctOffset = (_: FetchListPayload) => {
    const { stuapply } = this.props;
    // const { activeCardKeys } = this.state;
    this.offset = stuapply.dataSource.length;
    // dataSource.forEach(item => activeCardKeys.add(`${item[stuapply.rowKey]}`));
    // this.setState({ activeCardKeys });
  };

  deleteStuapply = (key: string) => {
    const { type } = this;
    const { dispatch } = this.props;
    this.loadingKeys.add(key);
    dispatch<DeleteStuapplyPayload>({
      type: 'stuapply/deleteStuapply',
      payload: { query: { type, key } },
      callback: this.deleteCallback,
    });
  };

  deleteCallback = (payload: DeleteStuapplyPayload) => {
    this.loadingKeys.delete(payload.query.key as string);
    this.fetchList();
  };

  cancelEditAuditState = (extra?: Partial<ListState>) => {
    this.formValue = {};
    this.setState({ auditing: false, editing: false, ...extra } as ListState);
  };

  cancelEditAuditStateAndRefresh = () => {
    this.cancelEditAuditState();
    this.fetchList();
  };

  onCloseDetail = () => this.setState({ detailVisible: false });

  onClickAction = ({ currentTarget }: React.MouseEvent) => {
    const { type } = this;
    const {
      dispatch,
      stuapply: { dataSource, columnsKeys },
    } = this.props;
    const { editing, auditing } = this.state;
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
        if (!editing && !auditing) {
          this.offset = parseInt(index, 10);
          MemorableModal.confirm({
            defaultEnable: false,
            id: GlobalId.DeleteStuapply,
            onOk: this.deleteStuapply,
            payload: currentKey,
            title: formatMessage({ id: 'stuapply.delete.confirm' }),
          });
        } else message.info('你有未保存的内容，请先保存或取消操作');
        break;
      case CellAction.Edit:
        if (!editing && !auditing) {
          this.formValue = dataSource[parseInt(index, 10)][columnsKeys[0]];
          this.setState({ editing: true, activeTabKey: columnsKeys[0], currentKey });
        } else message.info('你有未保存的内容，请先保存或取消操作');
        break;
      case CellAction.Audit:
        if (!editing && !auditing)
          this.setState({ auditing: true, activeTabKey: columnsKeys[0], currentKey });
        else message.info('你有未保存的内容，请先保存或取消操作');
        break;
      case CellAction.Save:
        this.offset = parseInt(index, 10);
        dispatch<EditStuapplyBody>({
          type: editing ? 'stuapply/editStuapply' : 'stuapply/auditStuapply',
          payload: { body: this.formValue, query: { type, key: currentKey } },
          callback: this.cancelEditAuditStateAndRefresh,
        });
        break;
      case CellAction.Cancel:
        this.cancelEditAuditState();
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
        data-index={cardIndex}
        data-key={record[rowKey]}
        data-position={record.positionKey}
        data-type={action.type}
        onClick={action.disabled ? void 0 : this.onClickAction}
        style={action.disabled ? { color: 'rgba(0, 0, 0, 0.45)', cursor: 'not-allowed' } : {}}
      >
        {action.text || <Icon type={action.icon} />}
      </a>
    );
  };

  onFormValueChange = ({ target: { id, value } }) => {
    if (id) this.formValue[id] = value;
  };

  renderAuditForm = (enable: boolean) => {
    if (!enable) return [];
    const { activeTabKey, auditing } = this.state;
    const {
      stuapply: { columnsKeys },
    } = this.props;
    if (activeTabKey && activeTabKey !== columnsKeys[0]) return [];
    if (!auditing) return [];
    if (!this.formValue.status) {
      this.formValue = { status: '审核通过', opinion: [] };
    }
    return [
      {
        id: 'status_FORM',
        title: '审核结果',
        type: SimpleFormItemType.ButtonRadio,
        withoutWrap: true,
        itemProps: {
          defaultValue: '审核通过',
          onChange: ({ target: { value } }: RadioChangeEvent) => (this.formValue.status = value),
        },
        selectOptions: [{ value: '审核通过' }, { value: '废除' }, { value: '退回' }],
      },
      {
        id: 'opinion_FORM',
        tip: '回车进行多选，可以输入自定义文案',
        title: '审核意见',
        type: SimpleFormItemType.Select,
        withoutWrap: true,
        itemProps: {
          mode: 'tags',
          placeholder: '键入文字查询常用语',
          onChange: (values: string[]) => (this.formValue.opinion = values),
          style: { width: '100%' },
        },
        selectOptions: [{ value: '信息填写不准确' }, { value: '不符合岗位条件' }],
      },
    ].map(item => ({
      children: renderFormItem(item, null, void 0, {}),
      key: item.id,
      term: item.title,
      sm: 24,
      md: 24,
    }));
  };

  onCardTabChange = (key: string, itemKey: string) => {
    this.cancelEditAuditState({ activeTabKey: key, currentKey: itemKey });
  };

  renderCardItem = (item: any, cardIndex: number) => {
    const { activeTabKey, currentKey, editing, auditing } = this.state;
    const {
      stuapply: { actionKey, rowKey, columnsKeys, columnsText, columns },
    } = this.props;
    let header = item.title;
    const itemKey = `${item[rowKey]}`;
    const loading = this.loadingKeys.has(itemKey);
    let actions: (StandardTableAction)[] = item[actionKey] || [];
    const realActiveKey = activeTabKey && currentKey === itemKey ? activeTabKey : columnsKeys[0];
    if (currentKey === itemKey && (editing || auditing))
      actions = [
        { type: CellAction.Save, text: formatMessage({ id: 'word.save' }) },
        { type: CellAction.Cancel, text: formatMessage({ id: 'word.cancel' }) },
      ];
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
            onTabChange={key => this.onCardTabChange(key, itemKey)}
            size="small"
            tabList={columnsKeys.map(col => ({ key: col, tab: columnsText[col] || col }))}
          >
            <DescriptionList
              description={columns[realActiveKey]
                .map(({ dataIndex, editDisabled, title, ...restProps }) => ({
                  children:
                    editing &&
                    currentKey === itemKey &&
                    realActiveKey === columnsKeys[0] &&
                    !editDisabled ? (
                      <Input.TextArea
                        autosize
                        defaultValue={this.formValue[dataIndex]}
                        id={dataIndex}
                        onChange={this.onFormValueChange}
                      />
                    ) : (
                      item[realActiveKey][dataIndex]
                    ),
                  key: dataIndex,
                  term: title,
                  ...restProps,
                }))
                .concat(this.renderAuditForm(currentKey === itemKey))}
            />
          </Card>
        </Spin>
      </Collapse.Panel>
    );
  };

  // onChangeOpenKey = (key: string | string[]) => {
  //   const { currentKey, editing, auditing } = this.state;
  //   if (!Array.isArray(key)) key = [key];
  //   if ((editing || auditing) && !key.includes(currentKey)) {
  //     this.cancelEditAuditState({ activeCardKeys: new Set(key) });
  //   } else {
  //     this.setState({ activeCardKeys: new Set(key) });
  //   }
  // };

  filterDataSource = (item: any) => {
    const { actionFilter } = this.state;
    const {
      stuapply: { actionKey },
    } = this.props;
    if (!actionFilter) return true;
    if (!Array.isArray(item[actionKey])) return false;
    return item[actionKey].some(
      (action: StandardTableAction) => action.type === actionFilter && !action.disabled,
    );
  };

  renderFirstLoading = () => {
    // const { activeCardKeys } = this.state;
    const {
      loading: { fetchList },
      stuapply: { columnsKeys, dataSource },
    } = this.props;
    if (columnsKeys.length) {
      if (dataSource.length)
        return (
          <Collapse
            // activeKey={[...activeCardKeys]}
            bordered={false}
            className={styles.collapse}
            // onChange={this.onChangeOpenKey}
          >
            {dataSource.filter(this.filterDataSource).map(this.renderCardItem)}
          </Collapse>
        );
      return Edit.Empty();
    }
    if (!fetchList) return Edit.Empty();
    return (
      <div style={{ width: '100%', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  };

  renderLoadButton = () => {
    const {
      loading,
      stuapply: { dataSource, total },
    } = this.props;
    return (
      <div className={styles.load}>
        {dataSource.length >= total ? (
          formatMessage({ id: 'tip.loaded-all' })
        ) : (
          <Button loading={loading.fetchList} onClick={this.fetchList} type="primary">
            {formatMessage({ id: 'word.load-more' })}
          </Button>
        )}
      </div>
    );
  };

  onPageHeaderTabChange = (tabKey: string) => {
    this.type = tabKey as PositionType;
    this.offset = 0;
    this.fetchList();
  };

  headerExtra = (): React.ReactNode => (
    <Tabs className={styles.tabs} onChange={this.onPageHeaderTabChange}>
      <Tabs.TabPane key="manage" tab={formatMessage({ id: 'position.manage' })} />
      <Tabs.TabPane key="teach" tab={formatMessage({ id: 'position.teach' })} />
    </Tabs>
  );

  onFilterChange = (value: { status: string; actionFilter: string; mode: string }) => {
    const { actionFilter } = this.state;
    if (value.actionFilter !== actionFilter) {
      this.setState({ actionFilter: value.actionFilter });
    }
    this.status = value.status;
    this.mode = value.mode;
    this.offset = 0;
    this.fetchList();
  };

  renderFilters = () => {
    const { filters } = this;
    const { loading } = this.props;
    return (
      <Filter
        filters={filters}
        initialFieldsValue={{ actionFilter: '', status: '', mode: '普通模式' }}
        onSubmit={this.onFilterChange}
        resetText={formatMessage({ id: 'word.reset' })}
        saveToSession={StorageId.SLFilter}
        submitLoading={loading.fetchList}
        submitText={formatMessage({ id: 'word.query' })}
      />
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
      <PageHeader headerExtra={this.headerExtra()}>
        <div className={commonStyles.contentBody}>
          {this.renderFilters()}
          <InfiniteScroll
            className={styles.scrollContainer}
            initialLoad={false}
            pageStart={0}
            loadMore={this.fetchList}
            hasMore={!loading.fetchList && dataSource.length < total}
          >
            {this.renderFirstLoading()}
            {loading.fetchList && dataSource.length < total && (
              <div className={styles.loadingContainer}>
                <Spin />
              </div>
            )}
            {this.renderLoadButton()}
          </InfiniteScroll>
          <Detail
            {...detail}
            loading={loading.fetchPositionDetail}
            onClose={this.onCloseDetail}
            visible={detailVisible}
          />
        </div>
      </PageHeader>
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
