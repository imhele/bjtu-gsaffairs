import styles from './index.less';
import classNames from 'classnames';
import { SpinProps } from 'antd/es/spin';
import React, { Component } from 'react';
import { ClickParam } from 'antd/es/menu';
import { AlertProps } from 'antd/es/alert';
import { ButtonProps } from 'antd/es/button';
import { sandwichArray } from '@/utils/utils';
import { TooltipProps } from 'antd/es/tooltip';
import { DropDownProps } from 'antd/es/dropdown';
import QueueAnim, { IProps as QueueAnimProps } from 'rc-queue-anim';
import { Alert, Button, Divider, Dropdown, Icon, Menu, Table, Tooltip } from 'antd';
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
  onMouseEnter?: (e: { key: string; domEvent: MouseEvent }) => void;
  onMouseLeave?: (e: { key: string; domEvent: MouseEvent }) => void;
}

export interface StandardTableAction {
  disabled?: boolean;
  icon?: string;
  loading?: boolean;
  text?: string | number | React.ReactNode;
  tooltip?: string | React.ReactNode | ((action: StandardTableAction) => React.ReactNode);
  tooltipProps?: TooltipProps;
  type: string;
  visible?: boolean;
}

export { ColumnProps, PaginationConfig, TableRowSelection, TableSize };

export interface StandardTableOperation extends StandardTableAction {
  buttonProps?: ButtonProps;
  menuItemProps?: MenuItemProps;
  tooltip?: string | React.ReactNode | ((action: StandardTableOperation) => React.ReactNode);
}

export interface StandardTableOperationAreaProps {
  animationProps?: QueueAnimProps<Element>;
  disabled?: (operation: StandardTableOperation, selectedRowKeys: string[] | number[]) => boolean;
  dropdownProps?: DropDownProps;
  loading?: (operation: StandardTableOperation, selectedRowKeys: string[] | number[]) => boolean;
  maxAmount?: number;
  moreText?: React.ReactNode;
  onClick?: (
    selectedRowKeys: string[] | number[],
    type: string,
    event: React.MouseEvent | ClickParam,
  ) => void;
  operation?: StandardTableOperation | StandardTableOperation[];
  visible?: (operation: StandardTableOperation, selectedRowKeys: string[] | number[]) => boolean;
}

export type StandardTableActionProps = StandardTableAction | StandardTableAction[];

export interface StandardTableMethods {
  clearSelectedRowKeys: () => void;
  getSelectedRowKeys: () => string[] | number[];
  setSelectedRowKeys: (rowKeys: string[] | number[]) => void;
}

export type StandardTableAlertProps = {
  clearText?: string | React.ReactNode;
  format?: (
    selectedRowsNumNode: React.ReactNode,
    selectedRowKeys: string[] | number[],
  ) => React.ReactNode;
  render?: (
    selectedRowsNum: number,
    clearSelectedRowKeys: () => void,
    selectedRowKeys: string[] | number[],
  ) => React.ReactNode;
} & {
  [P in
    | 'type'
    | 'closable'
    | 'closeText'
    | 'description'
    | 'onClose'
    | 'afterClose'
    | 'showIcon'
    | 'iconType'
    | 'style'
    | 'className'
    | 'banner'
    | 'icon']?: AlertProps[P]
};

export interface StandardTableProps<T> {
  actionKey?: string | string[];
  actionProps?:
    | StandardTableAction
    | ((
        action: StandardTableAction,
        record: T,
        index: number,
      ) => Partial<StandardTableAction> | null);
  alert?: boolean | StandardTableAlertProps;
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
  onClickAction?: (
    rowKey: string | number,
    actionType: string,
    record: T,
    event: React.MouseEvent,
  ) => void;
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

export default class StandardTable<T = object> extends Component<
  StandardTableProps<T>,
  StandardTableStates
> {
  static defaultProps = {
    actionKey: 'action',
    alert: true,
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
    if (getMenthods) {
      const { clearSelectedRowKeys, getSelectedRowKeys, setSelectedRowKeys } = this;
      getMenthods({ clearSelectedRowKeys, getSelectedRowKeys, setSelectedRowKeys });
    }
  }

  clearSelectedRowKeys = () => {
    this.setState({ selectedRowKeys: [] });
  };

  getSelectedRowKeys = () => {
    const { selectedRowKeys } = this.state;
    return [...selectedRowKeys];
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

  handleSandwichJoin = (Node: typeof Divider, _: any, index: number): React.ReactNode => (
    <Node key={`Divider-${index}`} type="vertical" />
  );

  getActionItemProps = (
    item: StandardTableAction,
    record: T,
    index: number,
  ): StandardTableAction => {
    const { actionProps } = this.props;
    if (!actionProps) return item;
    if (typeof actionProps === 'function') {
      return {
        ...item,
        ...actionProps(item, record, index),
      };
    } else {
      return {
        ...actionProps,
        ...item,
      };
    }
  };

  renderActionItem = (item: StandardTableAction, record: T, index: number): React.ReactNode => {
    const { onClickAction, rowKey } = this.props;
    if (item.loading) return <Icon key={item.type} type="loading" />;
    const icon = item.icon && <Icon type={item.icon} />;
    if (item.disabled)
      return (
        <span className={styles.disabled} key={item.type}>
          {item.text || icon || item.type}
        </span>
      );
    const computedRowKey = typeof rowKey === 'function' ? rowKey(record, index) : rowKey;
    return (
      <a
        key={item.type}
        onClick={event => onClickAction(record[computedRowKey], item.type, record, event)}
      >
        {item.text || icon || item.type}
      </a>
    );
  };

  renderAction = (actions: StandardTableActionProps, record: T, index: number): React.ReactNode => {
    if (typeof actions === 'string') return actions;
    if (!Array.isArray(actions)) actions = [actions];
    return sandwichArray(
      actions
        .map(item => this.getActionItemProps(item, record, index))
        .filter(item => item.visible === void 0 || item.visible)
        .map(item => this.renderTooltipWrapper(item, this.renderActionItem(item, record, index))),
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
    const { operationArea } = this.props;
    if (!operationArea) return item;
    const visible = operationArea.visible
      ? operationArea.visible(item, selectedRowKeys)
      : item.visible;
    if (typeof visible !== 'undefined' && !visible) return null;
    const disabled = operationArea.disabled
      ? operationArea.disabled(item, selectedRowKeys)
      : item.disabled;
    const loading = operationArea.loading
      ? operationArea.loading(item, selectedRowKeys)
      : item.loading;
    return {
      ...item,
      disabled,
      loading,
      visible: true,
    };
  };

  renderTooltipWrapper = (item: StandardTableAction, children: React.ReactNode) => {
    if (!item.tooltip && !item.tooltipProps) return children;
    const title = typeof item.tooltip === 'function' ? item.tooltip(item) : item.tooltip;
    return (
      <Tooltip title={title} {...item.tooltipProps}>
        {children}
      </Tooltip>
    );
  };

  renderOperationButtonItem = (item: StandardTableOperation, index: number): React.ReactNode => {
    /**
     * Add a layer of `<div />` to avoid `transition` contamination from `<Button />`
     */
    const button = (
      <Button
        data-type={item.type}
        disabled={item.disabled}
        icon={item.icon}
        loading={item.loading}
        onClick={this.onClickOperationItem}
        type={index ? 'default' : 'primary'}
        {...item.buttonProps}
      >
        {item.text || item.type}
      </Button>
    );
    return (
      <div className={styles.operation} key={item.type} style={{ display: 'inline-block' }}>
        {this.renderTooltipWrapper(item, button)}
      </div>
    );
  };

  renderOperationMenuItem = (item: StandardTableOperation): React.ReactNode => {
    return (
      <Menu.Item key={item.type} disabled={item.disabled || item.loading} {...item.menuItemProps}>
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

  renderAlertMessage = (): React.ReactNode => {
    const { alert } = this.props;
    const { selectedRowKeys } = this.state;
    if (typeof alert === 'object') {
      if (alert.render) {
        return alert.render(selectedRowKeys.length, this.clearSelectedRowKeys, selectedRowKeys);
      }
      return (
        <span className={styles.alertMessage}>
          {(alert.format ||
            ((node: React.ReactNode) => <span>{node} item(s) have been selected</span>))(
            <a className={styles.selectedRowsNum}>{selectedRowKeys.length}</a>,
            selectedRowKeys,
          )}
          <a
            className={classNames({
              [styles.clear]: true,
              [styles.hide]: !selectedRowKeys.length,
            })}
            onClick={this.clearSelectedRowKeys}
          >
            {alert.clearText || 'Clear'}
          </a>
        </span>
      );
    }
    return (
      <span className={styles.alertMessage}>
        <a className={styles.selectedRowsNum}>{selectedRowKeys.length}</a>
        <span> item(s) have been selected</span>
        <a
          className={classNames({
            [styles.clear]: true,
            [styles.hide]: !selectedRowKeys.length,
          })}
          onClick={this.clearSelectedRowKeys}
        >
          Clear
        </a>
      </span>
    );
  };

  render() {
    const {
      alert,
      className,
      dataSource,
      footer,
      loading,
      operationArea,
      pagination,
      rowKey,
      scroll,
      selectable,
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
        {selectable && alert && (
          <Alert
            message={this.renderAlertMessage()}
            showIcon
            style={{ marginBottom: 16 }}
            type="info"
            {...alert}
          />
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
