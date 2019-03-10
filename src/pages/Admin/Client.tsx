import { connect } from 'dva';
import styles from './Client.less';
import { GlobalId } from '@/global';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import PageHeader from '@/layouts/PageHeader';
import { getUseMedia } from 'react-media-hook2';
import { RadioChangeEvent } from 'antd/es/radio';
import MemorableModal from '@/components/MemorableModal';
import { Input, message, Modal, Radio, Tabs } from 'antd';
import { CellAction, TopbarAction } from '@/pages/Position/consts';
import { FormattedMessage, formatMessage } from 'umi-plugin-locale';
import { ConnectProps, ConnectState, AdminState } from '@/models/connect';
import SimpleForm, { SimpleFormItemProps } from '@/components/SimpleForm';
import { FetchClientListPayload, CreateClientPayload, DeleteClientPayload } from '@/api/admin';
import StandardTable, {
  PaginationConfig,
  StandardTableAction,
  StandardTableOperationAreaProps,
} from '@/components/StandardTable';

export interface ListProps extends ConnectProps {
  isMobile?: boolean;
  loading?: {
    createClient?: boolean;
    deleteClient?: boolean;
    editClient?: boolean;
    fetchClientList?: boolean;
    model?: boolean;
  };
  admin?: AdminState;
}

const enum ListSize {
  Default = 'default',
  Middle = 'middle',
  Small = 'small',
}

interface ListState {
  currentRowKey: string;
  formModalVisible: boolean;
  formType: CellAction.Edit | TopbarAction.Create;
  initailValue: { [key: string]: any };
  size: ListSize;
}

@connect(
  ({ loading, admin }: ConnectState): ListProps => ({
    loading: {
      createClient: loading.effects['admin/createClient'],
      deleteClient: loading.effects['admin/deleteClient'],
      editClient: loading.effects['admin/editClient'],
      fetchClientList: loading.effects['admin/fetchClientList'],
      model: loading.models.admin,
    },
    admin,
  }),
)
class List extends Component<ListProps, ListState> {
  state: ListState = {
    currentRowKey: null,
    formModalVisible: false,
    formType: TopbarAction.Create,
    initailValue: {},
    size: ListSize.Default,
  };

  /**
   * When user changes value of `limit` or `offset`,
   * `onShowSizeChange` and `onChangPage` will call `fetchList`
   * which makes `props` change and trigger component re-rendering.
   */
  private deletingRows: Set<number | string> = new Set();
  private limit: number = 10;
  private offset: number = 0;
  private search: string = '';
  private type: 'staff' | 'postgraduate' = 'staff';

  constructor(props: ListProps) {
    super(props);
    this.fetchList();
    if (props.isMobile) {
      this.state.size = ListSize.Small;
    }
  }

  fetchList = () => {
    const { dispatch } = this.props;
    const { search, type, limit, offset } = this;
    dispatch<FetchClientListPayload>({
      type: 'admin/fetchClientList',
      payload: {
        body: { limit, offset },
        query: { search, type },
      },
      callback: this.correctOffset,
    });
  };

  deleteClient = (currentRowKey: string) => {
    const { dispatch } = this.props;
    const { type } = this;
    this.deletingRows.add(currentRowKey);
    dispatch<DeleteClientPayload>({
      type: 'admin/deleteClient',
      payload: { query: { type, key: currentRowKey } },
      callback: this.deleteCallback,
    });
  };

  deleteCallback = (payload: DeleteClientPayload) => {
    this.fetchList();
    this.deletingRows.delete(payload.query.key);
  };

  correctOffset = () => {
    const {
      admin: { dataSource, total },
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
      admin: { total },
    } = this.props;
    return {
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

  onClickAction = (currentRowKey: string, actionType: CellAction, record: object) => {
    switch (actionType) {
      case CellAction.Delete:
        MemorableModal.confirm({
          defaultEnable: false,
          id: GlobalId.DeletePostion,
          onOk: this.deleteClient,
          payload: currentRowKey,
          title: '你确定要删除这个账户吗',
        });
        break;
      case CellAction.Edit:
        this.setState({
          currentRowKey,
          formModalVisible: true,
          formType: CellAction.Edit,
          initailValue: record,
        });
        break;
      default:
        message.warn(formatMessage({ id: 'position.error.unknown.action' }));
    }
  };

  onClickOperation = (_: any, operationType: string) => {
    switch (operationType) {
      case TopbarAction.Create:
        this.setState({
          currentRowKey: null,
          formModalVisible: true,
          formType: TopbarAction.Create,
        });
        break;
      default:
        message.warn(formatMessage({ id: 'position.error.unknown.action' }));
    }
  };

  getOperationArea = (): StandardTableOperationAreaProps => ({
    onClick: this.onClickOperation,
    operation: { text: '创建', icon: 'user-add', type: TopbarAction.Create },
  });

  renderActionProps = (
    action: StandardTableAction,
    record: object,
  ): Partial<StandardTableAction> => {
    const {
      admin: { rowKey = 'key' },
    } = this.props;
    if (this.deletingRows.has(record[rowKey])) {
      if (action.type === CellAction.Delete) {
        return { loading: true };
      }
      return { disabled: true };
    }
    return action;
  };

  onPageHeaderTabChange = (tabKey: string) => {
    this.type = tabKey as 'staff' | 'postgraduate';
    this.offset = 0;
    this.fetchList();
  };

  onCloseCreateModal = () =>
    this.setState({
      currentRowKey: null,
      formModalVisible: false,
      initailValue: {},
    });

  onSearch = (search: string) => {
    this.search = search;
    this.fetchList();
  };

  headerExtra = (): React.ReactNode => (
    <React.Fragment>
      <div style={{ margin: '32px auto 16px', textAlign: 'center' }}>
        <Input.Search
          allowClear
          defaultValue={this.search}
          enterButton
          onSearch={this.onSearch}
          placeholder="输入工号、姓名、权限以查找用户"
          style={{ maxWidth: 480 }}
        />
      </div>
      <Tabs className={styles.tabs} onChange={this.onPageHeaderTabChange}>
        <Tabs.TabPane key="staff" tab="教职工" />
        <Tabs.TabPane key="postgraduate" tab="研究生" />
      </Tabs>
    </React.Fragment>
  );

  submitCallback = () => {
    this.fetchList();
    this.onCloseCreateModal();
  };

  onSubmitClient = (body: { [key: string]: any }) => {
    const { type } = this;
    const { dispatch } = this.props;
    const { currentRowKey, formType } = this.state;
    const actionType = formType === TopbarAction.Create ? 'admin/createClient' : 'admin/editClient';
    dispatch<CreateClientPayload>({
      type: actionType,
      payload: { query: { type, key: currentRowKey }, body },
      callback: this.submitCallback,
    });
  };

  getFormItemProps = (item: SimpleFormItemProps): SimpleFormItemProps => {
    const { formType } = this.state;
    const {
      admin: { rowKey },
    } = this.props;
    if (item.id === rowKey && formType === CellAction.Edit)
      return { ...item, itemProps: { disabled: true } };
    return item;
  };

  render() {
    const { size, formModalVisible, formType, initailValue } = this.state;
    const {
      loading,
      admin: { columns, dataSource, rowKey, form },
    } = this.props;
    return (
      <PageHeader headerExtra={this.headerExtra()}>
        <div className={commonStyles.contentBody}>
          <StandardTable
            actionProps={this.renderActionProps}
            columns={columns}
            dataSource={dataSource}
            footer={this.renderTableFooter}
            loading={loading.fetchClientList}
            onClickAction={this.onClickAction}
            operationArea={this.getOperationArea()}
            pagination={this.getPagination()}
            rowKey={rowKey}
            size={size}
          />
        </div>
        <Modal
          className={styles.modal}
          destroyOnClose
          footer={null}
          onCancel={this.onCloseCreateModal}
          title={formType === TopbarAction.Create ? '创建账户' : '修改账户'}
          visible={formModalVisible}
        >
          <SimpleForm
            formItemProps={{
              labelCol: { xs: { span: 24 }, sm: { span: 7 } },
              wrapperCol: {
                xs: { span: 24 },
                sm: { span: 10 },
              },
            }}
            formItems={form.map(this.getFormItemProps)}
            initialFieldsValue={initailValue}
            onSubmit={this.onSubmitClient}
            resetText="重置"
            submitLoading={loading.createClient || loading.editClient}
            submitText="提交"
          />
        </Modal>
      </PageHeader>
    );
  }
}

export default (props: ListProps) => (
  <List {...props} isMobile={getUseMedia(GlobalId.BasicLayout)[0]} />
);
