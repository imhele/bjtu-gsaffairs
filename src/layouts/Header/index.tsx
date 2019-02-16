import React from 'react';
import router from 'umi/router';
import { Component } from 'react';
import classNames from 'classnames';
import LeftContent from './LeftContent';
import styles from '../BasicLayout.less';
import RightContent from './RightContent';
import { Layout, Menu, Icon } from 'antd';
import { ClickParam } from 'antd/es/menu';
import MenuItem from 'antd/es/menu/MenuItem';
import { LoginState } from '@/models/connect';
import { FormattedMessage } from 'umi-plugin-locale';

export interface HeaderProps {
  collapsed?: boolean;
  isMobile?: boolean;
  location: Location;
  loading?: boolean;
  login: LoginState;
  menuSelectedKeys: string[];
  onLogout?: () => void;
  onOpenMenu: () => void;
  route: Route;
}

export default class Header extends Component<HeaderProps> {
  static defaultProps = {
    collapsed: true,
    isMobile: false,
    location: {},
    loading: false,
    login: {},
    menuSelectedKeys: [],
    onLogout: () => {},
    onOpenMenu: () => {},
    route: {},
  };

  handleClickMenu = ({ key, item }: ClickParam): void => {
    const { location } = this.props;
    if (item.props['data-type'] !== 'href' && key !== location.pathname) router.push(key);
  };

  routeToMenu = (routes: Route[]): React.ReactNode[] =>
    routes
      .filter(route => !route.hideInMenu && (route.path || route.href) && route.routes !== null)
      .map(route =>
        route.href
          ? route.name && (
              <MenuItem key={route.href} data-type="href">
                <a href={route.href} target="_blank" rel="noopener noreferrer">
                  {route.icon && <Icon type={route.icon} />}
                  <FormattedMessage id={route.name} />
                </a>
              </MenuItem>
            )
          : route.name && (
              <MenuItem key={route.path} data-type="path">
                {route.icon && <Icon type={route.icon} />}
                <FormattedMessage id={route.name} />
              </MenuItem>
            ),
      );

  render() {
    const {
      collapsed,
      isMobile,
      loading,
      login,
      menuSelectedKeys,
      onLogout,
      onOpenMenu,
      route = {},
    } = this.props;
    const className = classNames({
      [styles.headerContainer]: true,
      [styles.collapsed]: collapsed || isMobile,
    });
    return (
      <Layout.Header className={styles.header}>
        <div className={className}>
          <LeftContent onOpenMenu={onOpenMenu} isMobile={isMobile} />
          {isMobile ? (
            <div className={styles.centerContentMobile}>
              <FormattedMessage id="app.name" />
            </div>
          ) : (
            <Menu
              theme="dark"
              mode="horizontal"
              onClick={this.handleClickMenu}
              selectedKeys={menuSelectedKeys}
            >
              {this.routeToMenu(route.routes || [])}
            </Menu>
          )}
          <RightContent loading={loading} login={login} onLogout={onLogout} />
        </div>
      </Layout.Header>
    );
  }
}
