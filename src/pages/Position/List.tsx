import { connect } from 'dva';
// import styles from './List.less';
import Media from 'react-media';
import QueueAnim from 'rc-queue-anim';
import { MediaQuery } from '@/global';
import React, { Component } from 'react';
import { RadioChangeEvent } from 'antd/es/radio';
import { FetchListBody } from '@/services/position';
import { FormattedMessage } from 'umi-plugin-locale';
import { message, Radio, Skeleton, Spin } from 'antd';
import StandardFilter from '@/components/StandardFilter';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';
import StandardTable, {
  PaginationConfig,
  StandardTableOperationAreaProps,
} from '@/components/StandardTable';

export interface ListProps extends ConnectProps {
  isMobile?: boolean;
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
class List extends Component<ListProps, ListState> {
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
  private filterExpandText = {
    expand: <FormattedMessage id="words.expand" />,
    retract: <FormattedMessage id="words.retract" />,
  };

  constructor(props: ListProps) {
    super(props);
    this.fetchList();
    if (props.isMobile) this.state.size = ListSize.Small;
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
  };

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
      size: this.state.size,
      total,
    };
  };

  onChangeListSize = (event: RadioChangeEvent) => {
    this.setState({ size: event.target.value });
  };

  renderTableFooter = (): React.ReactNode => {
    return (
      <div>
        <div style={{ display: 'inline-block', marginRight: 12 }}>
          <FormattedMessage id="position.list.tableSize" />
        </div>
        <Radio.Group
          onChange={this.onChangeListSize}
          size={this.state.size === ListSize.Small ? 'small' : 'default'}
          value={this.state.size}
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
      </div>
    );
  };

  onSubmitFilter = (filtersValue: object) => {
    this.filtersValue = filtersValue;
    this.fetchList();
  };

  onClickAction = (rowKey: string, actionType: string) => {
    message.info(`Click on row ${rowKey}, action ${actionType}`);
  };

  onClickOperation = (selectedRowKeys: string[] | number[], type: string) => {
    message.info(`Click on ${type}, selected keys ${selectedRowKeys}`);
  };

  render() {
    const { loading } = this.props;
    const { actionKey, columns, dataSource, filters, scroll, selectable } = this.props.position;
    const operationArea: StandardTableOperationAreaProps = {
      moreText: <FormattedMessage id="words.more" />,
      onClick: this.onClickOperation,
      ...this.props.position.operationArea,
    };
    return (
      <QueueAnim type="left">
        {filters && filters.length ? (
          <Spin key="StandardFilter" size="large" spinning={loading.fetchList}>
            <StandardFilter
              expandText={this.filterExpandText}
              filters={filters}
              onSubmit={this.onSubmitFilter}
              resetText={<FormattedMessage id="words.reset" />}
              submitText={<FormattedMessage id="words.query" />}
            />
          </Spin>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <Skeleton active />
          </div>
        )}
        <StandardTable
          actionKey={actionKey}
          columns={columns}
          dataSource={dataSource}
          footer={this.renderTableFooter}
          loading={loading.model}
          key="StandardTable"
          onClickAction={this.onClickAction}
          operationArea={operationArea}
          pagination={this.getPagination()}
          scroll={scroll}
          selectable={selectable}
          size={this.state.size}
        />
      </QueueAnim>
    );
  }
}

export default (props: ListProps) => (
  <Media query={MediaQuery}>{isMobile => <List {...props} isMobile={isMobile} />}</Media>
);
