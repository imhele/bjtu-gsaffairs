import styles from './index.less';
import classNames from 'classnames';
import SubMenu from 'antd/es/menu/SubMenu';
import { SelectParam } from 'antd/es/menu';
import MenuItem from 'antd/es/menu/MenuItem';
import React, { PureComponent } from 'react';
import { ConnectProps } from '@/models/connect';
import { SiderProps } from 'antd/es/layout/Sider';
import { Drawer, Icon, Layout, Menu } from 'antd';
import { FormattedMessage } from 'umi-plugin-locale';
import { CheckAuth, Scope } from '@/components/Authorized';

export { SelectParam };

export interface SiderMenuProps extends SiderProps, ConnectProps {
  currentScope?: Scope;
  drawerTitle?: string;
  isMobile?: boolean;
  menuSelectedKeys?: string[];
  onSelectMenu?: (param: SelectParam) => void;
  route?: Route;
}

export default class SiderMenu extends PureComponent<SiderMenuProps> {
  static defaultProps = {
    isMobile: false,
    menuSelectedKeys: [],
    onSelectMenu: () => {},
    route: {},
  };

  menuArr: React.ReactNode[] = [];

  constructor(props: SiderMenuProps) {
    super(props);
    if (props.route && typeof props.route === 'object' && Array.isArray(props.route.routes))
      this.menuArr = this.routeToMenu(props.route.routes, props.currentScope);
  }

  onSelect = (param: SelectParam): void => {
    const { onSelectMenu } = this.props;
    if (onSelectMenu) {
      onSelectMenu(param);
    }
  };

  routeToMenu = (
    routes: Route[],
    currentScope: Scope,
    submenu: boolean = false,
  ): React.ReactNode[] => {
    return routes
      .filter(({ hideInMenu, path }) => !hideInMenu && path)
      .filter(({ scope }) => CheckAuth(scope, currentScope))
      .map(route =>
        submenu || !Array.isArray(route.routes) || !route.routes.length ? (
          route.name && (
            <MenuItem key={route.path} data-type="path">
              {route.icon && <Icon type={route.icon} />}
              <FormattedMessage id={route.name} />
            </MenuItem>
          )
        ) : (
          <SubMenu
            key={route.path}
            title={
              route.name && (
                <div>
                  <Icon type={route.icon} />
                  <FormattedMessage id={route.name} />
                </div>
              )
            }
          >
            {this.routeToMenu(route.routes, currentScope, true)}
          </SubMenu>
        ),
      );
  };

  render() {
    const {
      className,
      collapsed,
      currentScope,
      drawerTitle,
      isMobile,
      menuSelectedKeys,
      onCollapse,
      onSelectMenu,
      route,
      ...restProps
    } = this.props;
    const mixinClassName = classNames(styles.siderMenu, className || '');
    const Sider = (
      <Layout.Sider
        collapsible
        className={mixinClassName}
        collapsed={!isMobile && collapsed}
        onCollapse={onCollapse}
        theme="light"
        width={256}
        {...restProps}
      >
        <Menu
          defaultOpenKeys={menuSelectedKeys}
          mode="inline"
          onSelect={this.onSelect}
          selectedKeys={menuSelectedKeys}
        >
          {this.menuArr}
        </Menu>
      </Layout.Sider>
    );
    return isMobile ? (
      <Drawer
        width={256}
        closable={false}
        placement="left"
        visible={!collapsed}
        className={styles.drawer}
        bodyStyle={{ padding: 0 }}
        onClose={() => onCollapse(true, 'clickTrigger')}
        title={<FormattedMessage id={drawerTitle} defaultMessage={drawerTitle} />}
      >
        {Sider}
      </Drawer>
    ) : (
      Sider
    );
  }
}
