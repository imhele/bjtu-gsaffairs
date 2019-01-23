import Header from './Header';
import Footer from './Footer';
import { Layout, Spin } from 'antd';
import { connect } from 'dva';
import memoizeOne from 'memoize-one';
import { Route } from '@/utils/utils';
import styles from './BasicLayout.less';
import { pathToScope } from '../utils/utils';
import React, { PureComponent } from 'react';
import Authorized from '@/components/Authorized';
import Exception403 from '@/pages/Exception/403';
import { ConnectState, ConnectProps } from '@/models/connect';
const { Content } = Layout;

export interface BasicLayoutProps extends ConnectProps {
  route?: Route;
  loading?: boolean;
  currentScope?: Array<string | number>;
}

@connect(({ login, loading }: ConnectState) => ({
  currentScope: login.scope,
  loading: loading.effects['login/fetchUser'],
}))
class BasicLayout extends PureComponent<BasicLayoutProps> {
  pathToScope = memoizeOne(pathToScope);

  constructor(props: BasicLayoutProps) {
    super(props);
    props.dispatch({
      type: 'login/fetchUser',
    });
  }

  render() {
    const { route, location, children, currentScope, loading } = this.props;
    return (
      <Layout className={styles.layout}>
        <Header {...{ location, route }} />
        <Content className={styles.content}>
          {loading ? (
            <Spin size="large" />
          ) : (
            Authorized({
              children,
              currentScope,
              exception: <Exception403 />,
              scope: this.pathToScope(route, location.pathname),
            })
          )}
        </Content>
        <Footer />
      </Layout>
    );
  }
}

export default BasicLayout;
