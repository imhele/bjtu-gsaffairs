import { connect } from 'dva';
import styles from './List.less';
import Edit from '../Position/Edit';
import { GlobalId } from '@/global';
import Detail from '../Position/Detail';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import PageHeader from '@/layouts/PageHeader';
import { RadioChangeEvent } from 'antd/es/radio';
import { formatMessage } from 'umi-plugin-locale';
import { FetchDetailPayload } from '@/api/position';
import InfiniteScroll from 'react-infinite-scroller';
import MemorableModal from '@/components/MemorableModal';
import DescriptionList from '@/components/DescriptionList';
import { CellAction, PositionType } from '../Position/consts';
import { Input, message, Radio, Row, Spin, Tabs } from 'antd';
import { StandardTableAction } from '@/components/StandardTable';
import { Button, Card, Checkbox, Col, Collapse, Icon } from 'antd';
import { renderFormItem, SimpleFormItemType } from '@/components/SimpleForm/BaseForm';
import { FetchListPayload, DeleteStuapplyPayload, EditStuapplyBody } from '@/api/stuapply';
import { ConnectProps, ConnectState, PositionState, StuapplyState } from '@/models/connect';

const filtersOptions = [
  { label: '全部', value: 'all' },
  { label: '可编辑', value: CellAction.Edit },
  { label: '可审核', value: CellAction.Audit },
  { label: '可删除', value: CellAction.Delete },
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
  activeTabKey: string;
  auditing: boolean;
  currentKey: string;
  detailVisible: boolean;
  editing: boolean;
  filterValue: string;
}

class List extends Component<ListProps, ListState> {
  state: ListState = {
    activeTabKey: null,
    auditing: false,
    currentKey: null,
    detailVisible: false,
    editing: false,
    filterValue: 'all',
  };

  auditForm = [];

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
  private formValue: { [key: string]: string | string[] } = {};

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

  correctOffset = () => {
    const { stuapply } = this.props;
    this.offset = stuapply.dataSource.length;
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
    this.loadingKeys.delete(payload.query.key);
    this.fetchList();
  };

  cancelEditAuditState = () => {
    this.formValue = {};
    this.setState({ auditing: false, editing: false });
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
        this.offset = parseInt(index, 10);
        MemorableModal.confirm({
          defaultEnable: false,
          id: GlobalId.DeleteStuapply,
          onOk: this.deleteStuapply,
          payload: currentKey,
          title: formatMessage({ id: 'stuapply.delete.confirm' }),
        });
        break;
      case CellAction.Edit:
        if (!editing && !auditing) {
          this.formValue = dataSource[parseInt(index, 10)][columnsKeys[0]];
          this.setState({ editing: true, activeTabKey: columnsKeys[0] });
        }
        break;
      case CellAction.Audit:
        if (!editing && !auditing) this.setState({ auditing: true, activeTabKey: columnsKeys[0] });
        break;
      case CellAction.Save:
        dispatch<EditStuapplyBody>({
          type: editing ? 'stuapply/editStuapply' : 'stuapply/auditStuapply',
          payload: { body: this.formValue, query: { type, key: currentKey } },
          callback: this.cancelEditAuditState,
        });
        break;
      case CellAction.Cancel:
        this.formValue = {};
        this.setState({ auditing: false, editing: false });
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

  renderAuditForm = () => {
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
        selectOptions: [{ value: '审核通过' }, { value: '审核不通过' }, { value: '退回' }],
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
        selectOptions: [{ value: '信息填写不准确' }, { value: '岗位人数过多' }],
      },
    ].map(item => ({
      children: renderFormItem(item, null, void 0, {}),
      key: item.id,
      term: item.title,
      sm: 24,
      md: 24,
    }));
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
            onTabChange={key => this.setState({ activeTabKey: key })}
            size="small"
            tabList={columnsKeys.map(col => ({ key: col, tab: columnsText[col] || col }))}
          >
            <DescriptionList
              description={columns[realActiveKey]
                .map(({ dataIndex, editDisabled, title, ...restProps }) => ({
                  children:
                    editing && realActiveKey === columnsKeys[0] && !editDisabled ? (
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
                .concat(this.renderAuditForm())}
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

  filterDataSource = (item: any) => {
    const { filterValue } = this.state;
    const {
      stuapply: { actionKey },
    } = this.props;
    if (filterValue === filtersOptions[0].value || !filterValue) return true;
    if (!Array.isArray(item[actionKey])) return false;
    return item[actionKey].some(
      (action: StandardTableAction) => action.type === filterValue && !action.disabled,
    );
  };

  renderFirstLoading = () => {
    const { currentKey } = this.state;
    const {
      loading: { fetchList },
      stuapply: { columnsKeys, dataSource },
    } = this.props;
    if (columnsKeys.length) {
      if (dataSource.length)
        return (
          <Collapse
            accordion
            activeKey={currentKey}
            bordered={false}
            className={styles.collapse}
            onChange={this.onChangeOpenKey}
          >
            {dataSource.filter(this.filterDataSource).map(this.renderCardItem)}
          </Collapse>
        );
      return Edit.Empty;
    }
    if (!fetchList) return Edit.Empty;
    return (
      <div style={{ width: '100%', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  };

  renderLoadButton = () => {
    const {
      stuapply: { dataSource, total },
    } = this.props;
    return (
      <div className={styles.load}>
        {dataSource.length >= total ? (
          formatMessage({ id: 'tip.loaded-all' })
        ) : (
          <Button onClick={this.fetchList} type="primary">
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

  onFilterStatusChange = ({ target: { value } }: RadioChangeEvent) => {
    this.status = value;
    this.offset = 0;
    this.fetchList();
  };

  onFilterActionChange = (values: (string | number | boolean)[]) => {
    const { filterValue } = this.state;
    const changedRes = values.find(item => item !== filterValue);
    if (changedRes) this.setState({ filterValue: changedRes as string });
  };

  renderFilters = () => {
    const { filterValue } = this.state;
    return (
      <Row gutter={24}>
        <Col className={styles.filtersCol} lg={12} md={24}>
          <span>状态：</span>
          <Radio.Group buttonStyle="solid" defaultValue="" onChange={this.onFilterStatusChange}>
            <Radio.Button value="">全部</Radio.Button>
            <Radio.Button value="草稿">草稿</Radio.Button>
            <Radio.Button value="待审核">待审核</Radio.Button>
            <Radio.Button value="审核通过">审核通过</Radio.Button>
            <Radio.Button value="审核不通过">审核不通过</Radio.Button>
          </Radio.Group>
        </Col>
        <Col className={styles.filtersCol} lg={12} md={24}>
          <span>只看：</span>
          <Checkbox.Group
            onChange={this.onFilterActionChange}
            options={filtersOptions}
            value={[filterValue]}
          />
        </Col>
      </Row>
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
