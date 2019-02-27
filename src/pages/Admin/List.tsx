import { connect } from 'dva';
import styles from './List.less';
import { GlobalId } from '@/global';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import { ButtonProps } from 'antd/es/button';
import PageHeader from '@/layouts/PageHeader';
import { getUseMedia } from 'react-media-hook2';
import SimpleForm from '@/components/SimpleForm';
import { RadioChangeEvent } from 'antd/es/radio';
import { message, Modal, Radio, Tabs } from 'antd';
import MemorableModal from '@/components/MemorableModal';
import { CellAction, TopbarAction } from '@/pages/Position/consts';
import { FormattedMessage, formatMessage } from 'umi-plugin-locale';
import { ConnectProps, ConnectState, AdminState } from '@/models/connect';
import { FetchClientListPayload, CreateClientPayload, DeleteClientPayload } from '@/api/admin';
import StandardTable, {
  PaginationConfig,
  StandardTableAction,
  StandardTableMethods,
  StandardTableOperationAreaProps,
} from '@/components/StandardTable';

export interface ListProps extends ConnectProps {
  isMobile?: boolean;
  loading?: {
    createClient?: boolean;
    deleteClient?: boolean;
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
  createVisible: boolean;
  currentRow: object;
  currentRowKey: string | number;
  size: ListSize;
}

@connect(
  ({ loading, admin }: ConnectState): ListProps => ({
    loading: {
      createClient: loading.effects['admin/createClient'],
      deleteClient: loading.effects['admin/deleteClient'],
      fetchClientList: loading.effects['admin/fetchClientList'],
      model: loading.models.admin,
    },
    admin,
  }),
)
class List extends Component<ListProps, ListState> {
  state: ListState = {
    createVisible: false,
    currentRow: null,
    currentRowKey: null,
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
  private tableMethods: Partial<StandardTableMethods> = {};
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
    const { type, limit, offset } = this;
    dispatch<FetchClientListPayload>({
      type: 'admin/fetchClientList',
      payload: {
        body: { limit, offset },
        query: { type },
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

  onClickAction = (currentRowKey: string | number, actionType: CellAction) => {
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
      default:
        message.warn(formatMessage({ id: 'position.error.unknown.action' }));
    }
  };

  onClickOperation = (_: any, operationType: string) => {
    switch (operationType) {
      case TopbarAction.Create:
        this.setState({ createVisible: true });
        break;
      default:
        message.warn(formatMessage({ id: 'position.error.unknown.action' }));
    }
  };

  getOperationArea = (): StandardTableOperationAreaProps => ({
    onClick: this.onClickOperation,
    operation: { text: '创建', icon: 'plus', type: TopbarAction.Create },
  });

  renderDetailFooterProps = (
    action: StandardTableAction,
    currentRowKey: string | number,
  ): ButtonProps => {
    const { loading } = this.props;
    const isDeleting = this.deletingRows.has(currentRowKey);
    switch (action.type) {
      case CellAction.Delete:
        return {
          disabled: loading.fetchClientList || isDeleting,
          loading: loading.deleteClient && isDeleting,
        };
      default:
        return {
          disabled: loading.fetchClientList || isDeleting,
        };
    }
  };

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

  onCloseCreateModal = () => this.setState({ createVisible: false });

  headerExtra = (): React.ReactNode => (
    <Tabs className={styles.tabs} onChange={this.onPageHeaderTabChange}>
      <Tabs.TabPane key="staff" tab="教职工" />
      <Tabs.TabPane key="postgraduate" tab="研究生" />
    </Tabs>
  );

  createCallback = () => {
    this.fetchList();
    this.onCloseCreateModal();
  }

  onCreateClient = (body: { [key: string]: any }) => {
    const { type } = this;
    const { dispatch } = this.props;
    dispatch<CreateClientPayload>({
      type: 'admin/createClient',
      payload: { query: { type }, body },
      callback: this.createCallback,
    });
  };

  render() {
    const { size, createVisible } = this.state;
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
          footer={null}
          onCancel={this.onCloseCreateModal}
          title="创建账户"
          visible={createVisible}
        >
          <SimpleForm
            formItemProps={{
              labelCol: { xs: { span: 24 }, sm: { span: 7 } },
              wrapperCol: {
                xs: { span: 24 },
                sm: { span: 10 },
              },
            }}
            formItems={form}
            onSubmit={this.onCreateClient}
            resetText="重置"
            submitLoading={loading.createClient}
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
