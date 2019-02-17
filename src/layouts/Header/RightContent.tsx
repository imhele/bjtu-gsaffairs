import Link from 'umi/link';
import router from 'umi/router';
import styles from '../BasicLayout.less';
import { ClickParam } from 'antd/es/menu';
import React, { Component } from 'react';
import { LoginState } from '@/models/connect';
import { FormattedMessage } from 'umi-plugin-locale';
import { Spin, Avatar, Dropdown, Menu, Icon, Button } from 'antd';

export interface RightContentProps {
  loading?: boolean;
  login: LoginState;
  onLogout?: () => void;
}

class RightContent extends Component<RightContentProps> {
  onLogout = () => {
    const { onLogout } = this.props;
    if (typeof onLogout === 'function') onLogout();
  };

  onClickMenu = ({ key }: ClickParam): void => {
    if (key === 'logout') this.onLogout();
    else if (key !== 'none') router.push(key);
  };

  render() {
    const { login, loading = false } = this.props;
    const UserMenu = (
      <Menu onClick={this.onClickMenu} className={styles.userMenu}>
        <Menu.Item key="none" className={styles.username}>
          {login.username}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout">
          <Icon type="logout" />
          <FormattedMessage id="user.logout" />
        </Menu.Item>
      </Menu>
    );
    return (
      <div className={styles.rightContent}>
        {loading ? (
          <Spin className={styles.spin} />
        ) : login.status ? (
          <Dropdown overlay={UserMenu} placement="bottomRight" trigger={['click', 'hover']}>
            <div className={styles.avatarContainer}>
              {login.avatar ? (
                <Avatar src={login.avatar} alt={login.username} className={styles.avatar} />
              ) : (
                <div className={styles.avatar} />
              )}
            </div>
          </Dropdown>
        ) : (
          <div>
            <Link to="/user/login">
              <Button type="primary">
                <FormattedMessage id="user.login" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  }
}

export default RightContent;
