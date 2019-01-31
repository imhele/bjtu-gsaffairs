import styles from './index.less';
import React, { Component } from 'react';
import { SpinProps } from 'antd/es/spin';
import { ClickParam } from 'antd/es/menu';
import { ButtonProps } from 'antd/es/button';
import { sandwichArray } from '@/utils/utils';
import { DropDownProps } from 'antd/es/dropdown';
import QueueAnim, { IProps as QueueAnimProps } from 'rc-queue-anim';
import { Button, Divider, Dropdown, Icon, Menu, Table } from 'antd';
import { ColumnProps, PaginationConfig, TableRowSelection, TableSize } from 'antd/es/table';

// Ref `antd/es/menu/MenuItem`
interface MenuItemProps {
  rootPrefixCls?: string;
  disabled?: boolean;
  level?: number;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (param: ClickParam) => void;
  onMouseEnter?: (event: string, e: MouseEvent) => void;
  onMouseLeave?: (event: string, e: MouseEvent) => void;
}

interface StandardTableAction {
  icon?: string;
  text?: string | number | React.ReactNode;
  type: string;
}

export { ColumnProps, PaginationConfig, TableRowSelection, TableSize };

export interface StandardTableOperation extends StandardTableAction {
  buttonProps?: ButtonProps;
  disabled?: boolean | ((selectedRowKeys: string[] | number[], type: string) => boolean);
  loading?: boolean | ((selectedRowKeys: string[] | number[], type: string) => boolean);
  menuProps?: MenuItemProps;
  visible?: boolean | ((selectedRowKeys: string[] | number[], type: string) => boolean);
}

export interface StandardTableOperationAreaProps {
  animationProps?: QueueAnimProps;
  dropdownProps?: DropDownProps;
  maxAmount?: number;
  moreText?: string | React.ReactNode;
  onClick?: (
    selectedRowKeys: string[] | number[],
    type: string,
    event: React.MouseEvent | ClickParam,
  ) => void;
  operation?: StandardTableOperation | StandardTableOperation[];
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
  onClickAction?: (rowKey: string, actionType: string, event: React.MouseEvent) => void;
  operationArea?: StandardTableOperationAreaProps | null;
  pagination?: PaginationConfig | false;
  rowKey?: string | ((record: T, index: number) => string);
  scroll?: {
    x?: boolean | number | string;
    y?: boolean | number | string;
  };
  selectable?: boolean | TableRowSelection<T>;
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
    const { selectedRowKeys } = this.state;
    return selectedRowKeys;
  };

  setSelectedRowKeys = (rowKeys: string[] | number[]) => {
    this.setState({ selectedRowKeys: rowKeys });
  };

  getRowSelection = (): TableRowSelection<T> | null => {
    const { selectedRowKeys } = this.state;
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
      selectedRowKeys,
      ...(selectable === true ? {} : selectable),
      onChange: (nextSelectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys: onChangeSelection(nextSelectedRowKeys, selectedRows) });
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

  onClickActionItem = (event: React.MouseEvent) => {
    const { onClickAction } = this.props;
    if (!onClickAction || !event) return;
    const { currentTarget: { dataset: { key = '', type = '' } = {} } = {} } = event as any;
    return onClickAction(key, type, event);
  };

  renderActionItem = (action: StandardTableAction, record: T, index: number): React.ReactNode => {
    const { rowKey } = this.props;
    const computedRowKey = typeof rowKey === 'function' ? rowKey(record, index) : rowKey;
    const icon = action.icon && <Icon type={action.icon} />;
    return (
      <a
        data-key={record[computedRowKey]}
        data-type={action.type}
        key={action.type}
        onClick={this.onClickActionItem}
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

  addRenderToActionColumn = (): ColumnProps<T>[] => {
    const { actionKey, columns } = this.props;
    const actionKeyArr = Array.isArray(actionKey) ? actionKey : [actionKey];
    return columns.map(actionColumn => {
      if (!actionKeyArr.includes(actionColumn.dataIndex)) return actionColumn;
      return {
        ...actionColumn,
        render: this.renderAction,
      };
    });
  };

  onClickOperationItem = (event: React.MouseEvent | ClickParam): void => {
    const { selectedRowKeys } = this.state;
    const { operationArea } = this.props;
    if (!operationArea || !operationArea.onClick) return;
    if ('currentTarget' in event) {
      const { dataset: { type = '' } = {} } = event.currentTarget as any;
      operationArea.onClick(selectedRowKeys, type, event);
    } else {
      operationArea.onClick(selectedRowKeys, event.key, event);
    }
  };

  getOperationItemProps = (item: StandardTableOperation): StandardTableOperation => {
    const { selectedRowKeys } = this.state;
    const visible =
      typeof item.visible === 'function' ? item.visible(selectedRowKeys, item.type) : item.visible;
    if (typeof visible !== 'undefined' && !visible) return null;
    const disabled =
      typeof item.disabled === 'function'
        ? item.disabled(selectedRowKeys, item.type)
        : item.disabled;
    const loading =
      typeof item.loading === 'function' ? item.loading(selectedRowKeys, item.type) : item.loading;
    return {
      ...item,
      disabled,
      loading,
    };
  };

  renderOperationButtonItem = (item: StandardTableOperation, index: number): React.ReactNode => {
    /**
     * Add a layer of `<div />` to avoid `transition` contamination from `<Button />`
     */
    return (
      <div className={styles.operation} key={item.type} style={{ display: 'inline-block' }}>
        <Button
          data-type={item.type}
          disabled={item.disabled as boolean}
          icon={item.icon}
          loading={item.loading as boolean}
          onClick={this.onClickOperationItem}
          type={index ? 'default' : 'primary'}
          {...item.buttonProps}
        >
          {item.text || item.type}
        </Button>
      </div>
    );
  };

  renderOperationMenuItem = (item: StandardTableOperation): React.ReactNode => {
    return (
      <Menu.Item
        key={item.type}
        disabled={(item.disabled || item.loading) as boolean}
        {...item.menuProps}
      >
        {item.loading ? <Icon type="loading" /> : <Icon type={item.icon} />}
        {item.text || item.type}
      </Menu.Item>
    );
  };

  renderOperationArea = (): React.ReactNode => {
    const { operationArea } = this.props;
    const { maxAmount = 3, moreText = 'More' } = operationArea;
    if (!operationArea.operation) return null;
    const operation = (Array.isArray(operationArea.operation)
      ? operationArea.operation
      : [operationArea.operation]
    )
      .map(this.getOperationItemProps)
      .filter(item => item);
    if (!operation.length) return null;
    if (operation.length <= maxAmount) return operation.map(this.renderOperationButtonItem);
    const overlay = (
      <Menu onClick={this.onClickOperationItem}>
        {operation.slice(maxAmount - 1).map(this.renderOperationMenuItem)}
      </Menu>
    );
    return operation
      .slice(0, maxAmount - 1)
      .map(this.renderOperationButtonItem)
      .concat(
        <div key="Dropdown" style={{ display: 'inline-block' }}>
          <Dropdown overlay={overlay} {...operationArea.dropdownProps}>
            <Button className={styles.operation}>
              {moreText} <Icon type="down" />
            </Button>
          </Dropdown>
        </div>,
      );
  };

  render() {
    const {
      className,
      dataSource,
      footer,
      loading,
      operationArea,
      pagination,
      rowKey,
      scroll,
      size,
      style,
    } = this.props;
    return (
      <div className={className} style={style}>
        {operationArea && (
          <div className={styles.operationArea}>
            <QueueAnim type="left" {...operationArea.animationProps}>
              {this.renderOperationArea()}
            </QueueAnim>
          </div>
        )}
        <Table<T>
          columns={this.addRenderToActionColumn()}
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
