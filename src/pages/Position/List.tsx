import { connect } from 'dva';
import { message } from 'antd';
// import styles from './List.less';
import QueueAnim from 'rc-queue-anim';
import React, { Component } from 'react';
import { FetchListBody } from '@/services/position';
import StandardFilter from '@/components/StandardFilter';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';
import StandardTable, { StandardTableOperationAreaProps } from '@/components/StandardTable';

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

interface ListState {
  limit: number;
  offset: number;
}

@connect(({ loading, position }: ConnectState) => ({
  loading: {
    fetchList: loading.effects['position/fetchList'],
    model: loading.models.position,
  },
  position,
}))
export default class List extends Component<ListProps, ListState> {
  // `filter` is not a state, but just data copy from StandardFilter
  filtersValue: object = {};

  state: ListState = {
    limit: 10,
    offset: 0,
  };

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
        limit: this.state.limit,
        offset: this.state.offset,
        type: this.props.type,
      },
    });
  };

  onClickAction = (rowKey: string, actionType: string) => {
    message.info(`Click on row ${rowKey}, action ${actionType}`);
  };

  render() {
    const { actionKey, columns, dataSource } = this.props.position;
    return (
      <QueueAnim type="left">
        <StandardFilter key="StandardFilter" />
        <StandardTable
          actionKey={actionKey}
          columns={columns}
          dataSource={dataSource}
          key="StandardTable"
          onClickAction={this.onClickAction}
          operationArea={operationArea}
        />
      </QueueAnim>
    );
  }
}
