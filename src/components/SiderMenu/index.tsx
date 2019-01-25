import router from 'umi/router';
import styles from './index.less';
import classnames from 'classnames';
import { Layout, Menu, Icon, Drawer } from 'antd';
import SubMenu from 'antd/es/menu/SubMenu';
import { SelectParam } from 'antd/es/menu';
import React, { PureComponent } from 'react';
import MenuItem from 'antd/es/menu/MenuItem';
import { ConnectProps } from '@/models/connect';
import { SiderProps } from 'antd/es/layout/Sider';
import { FormattedMessage } from 'umi-plugin-locale';
import { CheckAuth, Scope } from '@/components/Authorized';

export interface SiderMenuProps extends SiderProps, ConnectProps {
  currentScope: Array<string | number>;
  drawerTitle?: string;
  isMobile: boolean;
  menuSelectedKeys: string[];
  route: Route;
}

export default class SiderMenu extends PureComponent<SiderMenuProps> {
  menuArr: React.ReactNode[] = [];

  constructor(props: SiderMenuProps) {
    super(props);
    this.menuArr = this.routeToMenu(props.route.routes, props.currentScope);
  }

  handleClickMenu = ({ key }: SelectParam): void => {
    const { location } = this.props;
    if (key !== location.pathname) router.push(key);
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
    const { collapsed, drawerTitle, isMobile, onCollapse } = this.props;
    const className = classnames(styles.siderMenu, this.props.className || '');
    const Sider = (
      <Layout.Sider
        width={256}
        collapsible
        className={className}
        collapsed={!isMobile && collapsed}
        onCollapse={onCollapse}
        style={this.props.style}
        theme="light"
      >
        <Menu
          defaultOpenKeys={this.props.menuSelectedKeys}
          mode="inline"
          onSelect={this.handleClickMenu}
          selectedKeys={this.props.menuSelectedKeys}
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
