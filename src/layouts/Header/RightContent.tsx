import Link from 'umi/link';
import styles from '../BasicLayout.less';
import React, { Component } from 'react';
import { Button, Spin, Tooltip } from 'antd';
import { LoginState } from '@/models/connect';
import { FormattedMessage } from 'umi-plugin-locale';

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

  render() {
    const { login, loading = false } = this.props;
    return (
      <div className={styles.rightContent}>
        {loading ? (
          <Spin className={styles.spin} />
        ) : login.status ? (
          <React.Fragment>
            <div className={styles.username} title={login.username}>
              {login.username}
            </div>
            <Tooltip placement="bottomRight" title={<FormattedMessage id="user.logout" />}>
              <Button icon="logout" onClick={this.onLogout} shape="circle" type="primary" />
            </Tooltip>
          </React.Fragment>
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
