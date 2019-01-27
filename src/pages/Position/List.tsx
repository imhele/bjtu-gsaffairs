import { connect } from 'dva';
import { message } from 'antd';
// import styles from './List.less';
import QueueAnim from 'rc-queue-anim';
import React, { Component } from 'react';
import { FetchListBody } from '@/services/position';
import StandardFilter from '@/components/StandardFilter';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';
import StandardTable, {
  PaginationConfig,
  StandardTableOperationAreaProps,
} from '@/components/StandardTable';

const operationArea: StandardTableOperationAreaProps = {
  moreText: '更多',
  onClick: (rowKeys, type) =>
    message.info(
      `Click on ${type}, selected key(s): ${rowKeys.length ? rowKeys.join(' ') : 'None'}`,
    ),
  operation: [
    { icon: 'plus', text: '新建', type: 'create' },
    { icon: 'cloud-download', text: '导出', type: 'export', loading: true },
    { text: '删除', type: 'delete' },
    { text: '示例', type: 'exmaple', loading: true },
  ],
};

export interface ListProps extends ConnectProps {
  loading?: {
    fetchList?: boolean;
    model?: boolean;
  };
  position?: PositionState;
  type?: 'manage' | 'teach';
}

enum ListSize {
  Default = 'default',
  Middle = 'middle',
  Small = 'small',
}

interface ListState {
  size: ListSize;
}

@connect(({ loading, position }: ConnectState) => ({
  loading: {
    fetchList: loading.effects['position/fetchList'],
    model: loading.models.position,
  },
  position,
}))
export default class List extends Component<ListProps, ListState> {

  state: ListState = {
    size: ListSize.Default,
  };
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

  constructor(props: ListProps) {
    super(props);
    this.fetchList();
  }

  fetchList = () => {
    if (!['manage', 'teach'].includes(this.props.type)) return;
    this.props.dispatch<FetchListBody>({
      type: 'position/fetchList',
      payload: {
        filtersValue: this.filtersValue,
        limit: this.limit,
        offset: this.offset,
        type: this.props.type,
      },
      callback: this.correctOffset,
    });
  };

  correctOffset = () => {
    const { dataSource, total } = this.props.position;
    // exception: offset === 0
    if (this.offset && total <= this.offset) {
      this.offset = total - dataSource.length;
    }
  };

  onChangePage = (page: number, pageSize: number) => {
    this.limit = pageSize;
    this.offset = (page - 1) * pageSize;
    this.fetchList();
  }

  onShowSizeChange = (_: number, pageSize: number) => {
    this.limit = pageSize;
    this.fetchList();
  };

  getPagination = (): PaginationConfig => {
    const { total } = this.props.position;
    return {
      current: parseInt((this.offset / this.limit + 1).toFixed(0), 10),
      onChange: this.onChangePage,
      onShowSizeChange: this.onShowSizeChange,
      pageSize: this.limit,
      showSizeChanger: true,
      size: this.state.size === ListSize.Default ? '' : 'small',
      total,
    };
  };

  onClickAction = (rowKey: string, actionType: string) => {
    message.info(`Click on row ${rowKey}, action ${actionType}`);
  };

  render() {
    const { actionKey, columns, dataSource, scroll } = this.props.position;
    return (
      <QueueAnim type="left">
        <StandardFilter key="StandardFilter" />
        <StandardTable
          actionKey={actionKey}
          columns={columns}
          dataSource={dataSource}
          loading={this.props.loading.model}
          key="StandardTable"
          onClickAction={this.onClickAction}
          operationArea={operationArea}
          pagination={this.getPagination()}
          scroll={scroll}
          size={this.state.size}
        />
      </QueueAnim>
    );
  }
}
