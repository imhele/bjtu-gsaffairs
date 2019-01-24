import React from 'react';
import router from 'umi/router';
import classnames from 'classnames';
import { PureComponent } from 'react';
import LeftContent from './LeftContent';
import styles from '../BasicLayout.less';
import RightContent from './RightContent';
import { Layout, Menu, Icon } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import MenuItem from 'antd/lib/menu/MenuItem';
import { FormattedMessage } from 'umi-plugin-locale';
import { CheckAuth, Scope } from '@/components/Authorized';

export interface HeaderProps {
  collapsed: boolean;
  currentScope: Scope;
  isMobile: boolean;
  location: Location;
  menuSelectedKeys: string[];
  onOpenMenu: () => void;
  route: Route;
}

export default class Header extends PureComponent<HeaderProps> {
  menuArr: React.ReactNode[] = [];

  constructor(props: HeaderProps) {
    super(props);
    this.menuArr = this.routeToMenu(props.route.routes, props.currentScope);
  }

  handleClickMenu = ({ key, item }: ClickParam): void => {
    const { location } = this.props;
    if (item.props['data-type'] !== 'href' && key !== location.pathname) router.push(key);
  };

  routeToMenu = (routes: Route[], currentScope: Scope): React.ReactNode[] => {
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
    const { collapsed, isMobile, menuSelectedKeys, onOpenMenu } = this.props;
    const className = classnames({
      [styles.headerContainer]: true,
      [styles.collapsed]: collapsed || isMobile,
    });
    return (
      <Layout.Header className={styles.header}>
        <div className={className}>
          <LeftContent onOpenMenu={onOpenMenu} isMobile={isMobile} />
          <Menu
            theme="dark"
            mode="horizontal"
            onClick={this.handleClickMenu}
            selectedKeys={menuSelectedKeys}
          >
            {this.menuArr}
          </Menu>
          <RightContent />
        </div>
      </Layout.Header>
    );
  }
}
