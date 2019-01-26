import styles from './index.less';
import { SpinProps } from 'antd/es/spin';
import React, { Component } from 'react';
import { ButtonProps } from 'antd/es/button';
import { sandwichArray } from '@/utils/utils';
import { Button, Divider, Icon, Table } from 'antd';
import { ColumnProps, PaginationConfig, TableRowSelection, TableSize } from 'antd/es/table';

interface StandardTableAction {
  icon?: string;
  text?: string | number | React.ReactNode;
  type: string;
}

export { ColumnProps, PaginationConfig, TableRowSelection, TableSize };

export interface StandardTableOperation<T> extends StandardTableAction {
  buttonProps?: ButtonProps;
  disabled?: boolean | ((selectedRowKeys: string[] | number[], type: string) => boolean);
  loading?: boolean | ((selectedRowKeys: string[] | number[], type: string) => boolean);
  visible?: boolean | ((selectedRowKeys: string[] | number[], type: string) => boolean);
}

export interface StandardTableOperationAreaProps<T> {
  maxAmount?: number;
  moreText?: string | React.ReactNode;
  onClick?: (selectedRowKeys: string[] | number[], type: string, event: React.MouseEvent) => void;
  operation: StandardTableOperation<T> | StandardTableOperation<T>[];
}

export type StandardTableActionProps = StandardTableAction | StandardTableAction[];

export interface StandardTableMethods {
  clearSelectedRowKeys: () => void;
  getSelectedRowKeys: () => string[] | number[];
  setSelectedRowKeys: (rowKeys: string[] | number[]) => void;
}

export interface StandardTableProps<T> {
  actionKey?: string | string[];
  className?: string;
  columns?: ColumnProps<T>[];
  dataSource?: T[];
  footer?: false | ((currentPageData: Object[]) => React.ReactNode);
  footerLocale?: (currentLength: number, total: number) => React.ReactNode;
  getMenthods?: (methods: StandardTableMethods) => void;
  loading?: boolean | SpinProps;
  onChangeSelection?: (
    selectedRowKeys: string[] | number[],
    selectedRows: T[],
  ) => string[] | number[];
  onClickAction?: (event: React.MouseEvent) => void;
  operationArea?: StandardTableOperationAreaProps<T> | null;
  pagination?: PaginationConfig | false;
  rowKey?: string | ((record: T, index: number) => string);
  scroll?: {
    x?: boolean | number | string;
    y?: boolean | number | string;
  };
  selectable?: boolean;
  size?: TableSize;
  style?: React.CSSProperties;
  unSelectableKey?: string | ((record: T) => string);
}

interface StandardTableStates {
  selectedRowKeys: string[] | number[];
}

export default class StandardTable<T> extends Component<
  StandardTableProps<T>,
  StandardTableStates
> {
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
    selectable: false,
    size: 'default',
    unSelectableKey: 'unSelectable',
  };

  state = {
    selectedRowKeys: [],
  };

  constructor(props: StandardTableProps<T>) {
    super(props);
    const { getMenthods } = props;
    if (typeof getMenthods === 'function') {
      const { clearSelectedRowKeys, getSelectedRowKeys, setSelectedRowKeys } = this;
      getMenthods({ clearSelectedRowKeys, getSelectedRowKeys, setSelectedRowKeys });
    }
  }

  clearSelectedRowKeys = () => {
    this.setState({ selectedRowKeys: [] });
  };

  getSelectedRowKeys = () => {
    return this.state.selectedRowKeys;
  };

  setSelectedRowKeys = (rowKeys: string[] | number[]) => {
    this.setState({ selectedRowKeys: rowKeys });
  };

  getRowSelection = (): TableRowSelection<T> | null => {
    const {
      onChangeSelection = (keys: string[] | number[]) => keys,
      selectable,
      unSelectableKey,
    } = this.props;
    if (!selectable) return null;
    const getCheckboxProps =
      typeof unSelectableKey === 'function'
        ? (record: T) => ({ disabled: record[unSelectableKey(record)] })
        : (record: T) => ({ disabled: record[unSelectableKey] });
    return {
      getCheckboxProps,
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys: onChangeSelection(selectedRowKeys, selectedRows) });
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

  handleSandwichJoin = (Note: typeof Divider, _: any, index: number): React.ReactNode => (
    <Note key={`Divider-${index}`} type="vertical" />
  );

  renderActionItem = (action: StandardTableAction, record: T, index: number): React.ReactNode => {
    const { onClickAction } = this.props;
    const rowKey =
      typeof this.props.rowKey === 'function'
        ? this.props.rowKey(record, index)
        : this.props.rowKey;
    const icon = action.icon && <Icon type={action.icon} />;
    return (
      <a
        data-key={record[rowKey]}
        data-type={action.type}
        key={action.type}
        onClick={onClickAction}
      >
        {action.text || icon || action.type}
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

  addRenderToActionColumn = () => {
    const { actionKey, columns } = this.props;
    if (typeof actionKey === 'string') {
      const actionColumn: ColumnProps<T> = columns.find(column => column.dataIndex === actionKey);
      if (actionColumn && !actionColumn.render) {
        actionColumn.render = this.renderAction;
      }
    } else if (Array.isArray(actionKey)) {
      columns
        .reduce<ColumnProps<T>[]>(
          (pre, cur) => (actionKey.includes(cur.dataIndex) ? pre.concat(cur) : pre),
          [],
        )
        .forEach(actionColumn => {
          if (actionColumn && !actionColumn.render) {
            actionColumn.render = this.renderAction;
          }
        });
    }
  };

  onClickOperationItem = (event: any): void => {
    const { selectedRowKeys } = this.state;
    console.log(event.currentTarget.dataset, selectedRowKeys); // tslint:disable-line
  };

  renderOperationItem = (item: StandardTableOperation<T>, index: number): React.ReactNode => {
    const { selectedRowKeys } = this.state;
    const visible =
      typeof item.visible === 'function' ? item.visible(selectedRowKeys, item.type) : item.visible;
    if (visible !== undefined && !visible) return null;
    const disabled =
      typeof item.disabled === 'function'
        ? item.disabled(selectedRowKeys, item.type)
        : item.disabled;
    const loading =
      typeof item.loading === 'function' ? item.loading(selectedRowKeys, item.type) : item.loading;
    return (
      <Button
        className={styles.operation}
        data-type={item.type}
        disabled={disabled}
        icon={item.icon}
        key={item.type}
        loading={loading}
        onClick={this.onClickOperationItem}
        type={index ? 'default' : 'primary'}
        {...item.buttonProps}
      >
        {item.text || item.type}
      </Button>
    );
  };

  renderOperationArea = (): React.ReactNode => {
    const { operationArea } = this.props;
    if (!operationArea) return null;
    const { maxAmount = 3, moreText = 'More' } = operationArea;
    const operation = Array.isArray(operationArea.operation)
      ? operationArea.operation
      : [operationArea.operation];
    if (operation.length <= maxAmount) return operation.map(this.renderOperationItem);
    return operation.map(this.renderOperationItem);
  };

  render() {
    const {
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
    this.addRenderToActionColumn();
    return (
      <div className={className} style={style}>
        <div className={styles.operationArea}>{this.renderOperationArea()}</div>
        <Table<T>
          columns={columns}
          dataSource={dataSource}
          footer={footer === false ? undefined : this.renderFooter}
          loading={loading}
          pagination={pagination}
          rowKey={rowKey}
          rowSelection={this.getRowSelection()}
          scroll={scroll}
          size={size}
        />
      </div>
    );
  }
}
