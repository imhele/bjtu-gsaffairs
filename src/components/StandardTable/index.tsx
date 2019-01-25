import { SpinProps } from 'antd/es/spin';
import React, { Component } from 'react';
import { sandwichArray } from '@/utils/utils';
import { Divider, Table } from 'antd';
import { ColumnProps, PaginationConfig, TableRowSelection, TableSize } from 'antd/es/table';

interface StandardTableAction {
  text?: string | number | React.ReactNode;
  type: string;
}

export type StandardTableActionProps = StandardTableAction | StandardTableAction[];

export interface StandardTableProps<T> {
  actionKey?: string | ((record: T, index: number) => string);
  className?: string;
  columns?: ColumnProps<T>[];
  dataSource?: T[];
  footer?: false | ((currentPageData: Object[]) => React.ReactNode);
  footerLocale?: (currentLength: number, total: number) => React.ReactNode;
  loading?: boolean | SpinProps;
  onChangeSelection?: (
    selectedRowKeys: string[] | number[],
    selectedRows: T[],
  ) => string[] | number[];
  onClickAction?: (event: React.MouseEvent) => void;
  pagination?: PaginationConfig | false;
  rowKey?: string | ((record: T, index: number) => string);
  scroll?: {
    x?: boolean | number | string;
    y?: boolean | number | string;
  };
  selectable?: boolean | null;
  size?: TableSize;
  style?: React.CSSProperties;
  unSelectableKey?: string | ((record: T) => string);
}

export default class StandardTable<T> extends Component<StandardTableProps<T>> {
  static defaultProps = {
    actionKey: 'action',
    columns: [],
    dataSource: [],
    footerLocale: (c: number, t: number) => `Current ${c} / Total ${t}`,
    loading: false,
    pagination: false,
    rowKey: 'key',
    scroll: {
      x: 800,
    },
    selectable: null,
    size: 'default',
    unSelectableKey: 'selectable',
  };

  private selectedRowKeys: string[] | number[] = [];

  getRowSelection = (): TableRowSelection<T> | null => {
    const {
      onChangeSelection = (keys: string[] | number[]) => keys,
      selectable,
      unSelectableKey,
    } = this.props;
    if (!selectable) return null;
    const getCheckboxProps =
      typeof unSelectableKey === 'function'
        ? (record: T) => ({ disabled: !record[unSelectableKey(record)] })
        : (record: T) => ({ disabled: !record[unSelectableKey] });
    return {
      getCheckboxProps,
      selectedRowKeys: this.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.selectedRowKeys = onChangeSelection(selectedRowKeys, selectedRows);
      },
    };
  };

  renderFooter = (currentPageData: Object[]): React.ReactNode => {
    const { footer, footerLocale, pagination } = this.props;
    if (footer) return footer(currentPageData);
    if (typeof pagination === 'boolean')
      return footerLocale(currentPageData.length, currentPageData.length);
    else return footerLocale(currentPageData.length, pagination.total);
  };

  handleSandwichJoin = (Note: typeof Divider, _: any, index: number) => (
    <Note key={`Divider-${index}`} type="vertical" />
  );

  renderActionItem = (action: StandardTableAction, record: T, index: number) => {
    const { onClickAction } = this.props;
    const rowKey =
      typeof this.props.rowKey === 'function'
        ? this.props.rowKey(record, index)
        : this.props.rowKey;
    return (
      <a
        data-key={record[rowKey]}
        data-type={action.type}
        key={action.type}
        onClick={onClickAction}
      >
        {action.text || action.type}
      </a>
    );
  };

  renderAction = (actions: StandardTableActionProps, record: T, index: number): React.ReactNode => {
    if (!Array.isArray(actions)) {
      actions = [actions];
    }
    return sandwichArray(
      actions.map(action => this.renderActionItem(action, record, index)),
      Divider,
      1,
      false,
      this.handleSandwichJoin,
    );
  };

  render() {
    const {
      actionKey,
      className,
      columns,
      dataSource,
      footer,
      loading,
      pagination,
      rowKey,
      scroll,
      size,
      style,
    } = this.props;
    const actionColumn: ColumnProps<T> = columns.find(column => column.dataIndex === actionKey);
    if (actionColumn && !actionColumn.render) {
      actionColumn.render = this.renderAction;
    }
    return (
      <Table<T>
        className={className}
        columns={columns}
        dataSource={dataSource}
        footer={footer === false ? undefined : this.renderFooter}
        loading={loading}
        pagination={pagination}
        rowKey={rowKey}
        rowSelection={this.getRowSelection()}
        scroll={scroll}
        size={size}
        style={style}
      />
    );
  }
}
