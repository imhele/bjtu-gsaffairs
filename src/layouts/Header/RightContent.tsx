import Link from 'umi/link';
import { connect } from 'dva';
import router from 'umi/router';
import styles from '../BasicLayout.less';
import { ClickParam } from 'antd/es/menu';
import React, { Component } from 'react';
import { FormattedMessage } from 'umi-plugin-locale';
import { Spin, Avatar, Dropdown, Menu, Icon, Button } from 'antd';
import { ConnectState, ConnectProps, LoginState } from '@/models/connect';

export interface RightContentProps extends ConnectProps {
  login?: LoginState;
  loading?: boolean | undefined;
}

@connect(({ login, loading }: ConnectState) => ({
  login,
  loading: loading.effects['login/fetchUser'],
}))
class RightContent extends Component<RightContentProps> {
  onLogout = () => {
    this.props.dispatch({
      type: 'login/logout',
    });
  };

  onClickMenu = ({ key }: ClickParam): void => {
    if (key === 'logout') this.onLogout();
    else if (key) router.push(key);
  };

  render() {
    const { login, loading = false } = this.props;
    const UserMenu = (
      <Menu onClick={this.onClickMenu} className={styles.userMenu}>
        <Menu.Item key="/account" className={styles.nickname}>
          {login.nickname}
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
          <Spin delay={100} className={styles.spin} />
        ) : login.status ? (
          <Dropdown overlay={UserMenu} placement="bottomRight" trigger={['click', 'hover']}>
            <div className={styles.avatarContainer}>
              {login.avatar ? (
                <Avatar src={login.avatar} alt={login.nickname} className={styles.avatar} />
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
