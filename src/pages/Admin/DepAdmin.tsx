import { connect } from 'dva';
import styles from './Client.less';
import { GlobalId } from '@/global';
import { message, Modal } from 'antd';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import PageHeader from '@/layouts/PageHeader';
import { getUseMedia } from 'react-media-hook2';
import SimpleForm from '@/components/SimpleForm';
import { formatMessage } from 'umi-plugin-locale';
import MemorableModal from '@/components/MemorableModal';
import { CellAction, TopbarAction } from '@/pages/Position/consts';
import { ConnectProps, ConnectState, AdminState } from '@/models/connect';
import {
  FetchDepAdminListPayload,
  CreateDepAdminPayload,
  DeleteDepAdminPayload,
} from '@/api/admin';
import StandardTable, {
  PaginationConfig,
  StandardTableAction,
  StandardTableOperationAreaProps,
} from '@/components/StandardTable';

export interface ListProps extends ConnectProps {
  isMobile?: boolean;
  loading?: {
    createDepAdmin?: boolean;
    deleteDepAdmin?: boolean;
    fetchDepAdminList?: boolean;
    model?: boolean;
  };
  admin?: AdminState;
}

interface ListState {
  formModalVisible: boolean;
}

@connect(
  ({ loading, admin }: ConnectState): ListProps => ({
    loading: {
      createDepAdmin: loading.effects['admin/createDepAdmin'],
      deleteDepAdmin: loading.effects['admin/deleteDepAdmin'],
      fetchDepAdminList: loading.effects['admin/fetchDepAdminList'],
      model: loading.models.admin,
    },
    admin,
  }),
)
class List extends Component<ListProps, ListState> {
  state: ListState = {
    formModalVisible: false,
  };

  private deletingRows: Set<number | string> = new Set();
  private limit: number = 10;
  private offset: number = 0;

  constructor(props: ListProps) {
    super(props);
    this.fetchList();
  }

  fetchList = () => {
    const { dispatch } = this.props;
    const { limit, offset } = this;
    dispatch<FetchDepAdminListPayload>({
      type: 'admin/fetchDepAdminList',
      payload: { body: { limit, offset } },
      callback: this.correctOffset,
    });
  };

  deleteDepAdmin = (currentRowKey: string) => {
    const { dispatch } = this.props;
    this.deletingRows.add(currentRowKey);
    dispatch<DeleteDepAdminPayload>({
      type: 'admin/deleteDepAdmin',
      payload: { query: { key: currentRowKey } },
      callback: this.deleteCallback,
    });
  };

  deleteCallback = (payload: DeleteDepAdminPayload) => {
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

  onClickAction = (currentRowKey: string, actionType: CellAction) => {
    switch (actionType) {
      case CellAction.Delete:
        MemorableModal.confirm({
          defaultEnable: false,
          id: GlobalId.DeletePostion,
          onOk: this.deleteDepAdmin,
          payload: currentRowKey,
          title: '你确定要删除这条记录吗',
        });
        break;
      default:
        message.warn(formatMessage({ id: 'position.error.unknown.action' }));
    }
  };

  onClickOperation = (_: any, operationType: string) => {
    switch (operationType) {
      case TopbarAction.Create:
        this.setState({ formModalVisible: true });
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

  onCloseCreateModal = () => this.setState({ formModalVisible: false });

  submitCallback = () => {
    this.fetchList();
    this.onCloseCreateModal();
  };

  onCreateDepAdmin = (body: { [key: string]: any }) => {
    const { dispatch } = this.props;
    dispatch<CreateDepAdminPayload>({
      type: 'admin/createDepAdmin',
      payload: { body },
      callback: this.submitCallback,
    });
  };

  render() {
    const { formModalVisible } = this.state;
    const {
      loading,
      admin: { columns, dataSource, rowKey, form },
    } = this.props;
    return (
      <PageHeader>
        <div className={commonStyles.contentBody}>
          <StandardTable
            actionProps={this.renderActionProps}
            columns={columns}
            dataSource={dataSource}
            loading={loading.fetchDepAdminList}
            onClickAction={this.onClickAction}
            operationArea={this.getOperationArea()}
            pagination={this.getPagination()}
            rowKey={rowKey}
          />
        </div>
        <Modal
          className={styles.modal}
          destroyOnClose
          footer={null}
          onCancel={this.onCloseCreateModal}
          title="新增管理员"
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
            formItems={form}
            onSubmit={this.onCreateDepAdmin}
            resetText="重置"
            submitLoading={loading.createDepAdmin}
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
