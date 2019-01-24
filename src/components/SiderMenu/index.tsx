import router from 'umi/router';
import { Layout, Menu, Icon } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import { SelectParam } from 'antd/lib/menu';
import React, { PureComponent } from 'react';
import MenuItem from 'antd/lib/menu/MenuItem';
import { ConnectProps } from '@/models/connect';
import { CollapseType } from 'antd/lib/layout/Sider';
import { FormattedMessage } from 'umi-plugin-locale';
import { CheckAuth, Scope } from '@/components/Authorized';

export interface SiderMenuProps extends ConnectProps {
  collapsed: boolean;
  currentScope: Array<string | number>;
  loading?: boolean;
  menuSelectedKeys: string[];
  onCollapse: (collapsed: boolean, type: CollapseType) => void;
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
    console.log(key);
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
    const { menuSelectedKeys, collapsed, onCollapse } = this.props;
    return (
      <Layout.Sider
        width={256}
        collapsible
        theme="light"
        collapsed={collapsed}
        onCollapse={onCollapse}
      >
        <Menu
          defaultOpenKeys={menuSelectedKeys}
          mode="inline"
          onSelect={this.handleClickMenu}
          selectedKeys={menuSelectedKeys}
        >
          {this.menuArr}
        </Menu>
      </Layout.Sider>
    );
  }
}
