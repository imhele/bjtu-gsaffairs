import React from 'react';
import router from 'umi/router';
import { Component } from 'react';
import classnames from 'classnames';
import LeftContent from './LeftContent';
import styles from '../BasicLayout.less';
import RightContent from './RightContent';
import { Layout, Menu, Icon } from 'antd';
import { ClickParam } from 'antd/es/menu';
import MenuItem from 'antd/es/menu/MenuItem';
import { LoginState } from '@/models/connect';
import { FormattedMessage } from 'umi-plugin-locale';
import { CheckAuth, Scope } from '@/components/Authorized';

export interface HeaderProps {
  collapsed?: boolean;
  currentScope?: Scope;
  isMobile?: boolean;
  location: Location;
  loading?: boolean;
  login: LoginState;
  menuSelectedKeys: string[];
  onLogout?: () => void;
  onOpenMenu: () => void;
  route: Route<string>;
}

export default class Header extends Component<HeaderProps> {
  static defaultProps = {
    collapsed: true,
    currentScope: [],
    isMobile: false,
    location: {},
    loading: false,
    login: {},
    menuSelectedKeys: [],
    onLogout: () => {},
    onOpenMenu: () => {},
    route: {},
  };

  menuArr: React.ReactNode[] = [];

  constructor(props: HeaderProps) {
    super(props);
    this.menuArr = this.routeToMenu(props.route.routes, props.currentScope);
  }

  handleClickMenu = ({ key, item }: ClickParam): void => {
    const { location } = this.props;
    if (item.props['data-type'] !== 'href' && key !== location.pathname) router.push(key);
  };

  routeToMenu = (routes: Route<string>[], currentScope: Scope): React.ReactNode[] => {
    return routes
      .filter(({ hideInMenu, path, href }) => !hideInMenu && (path || href))
      .filter(({ scope }) => CheckAuth(scope, currentScope))
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
  };

  render() {
    const {
      collapsed,
      isMobile,
      loading,
      login,
      menuSelectedKeys,
      onLogout,
      onOpenMenu,
    } = this.props;
    const className = classnames({
      [styles.headerContainer]: true,
      [styles.collapsed]: collapsed || isMobile,
    });
    return (
      <Layout.Header className={styles.header}>
        <div className={className}>
          <LeftContent onOpenMenu={onOpenMenu} isMobile={isMobile} />
          {isMobile ? (
            <div className={styles.centerContent} />
          ) : (
            <Menu
              theme="dark"
              mode="horizontal"
              onClick={this.handleClickMenu}
              selectedKeys={menuSelectedKeys}
            >
              {this.menuArr}
            </Menu>
          )}
          <RightContent loading={loading} login={login} onLogout={onLogout} />
        </div>
      </Layout.Header>
    );
  }
}
