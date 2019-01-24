import Header from './Header';
import Footer from './Footer';
import { connect } from 'dva';
import { Layout, Spin } from 'antd';
import memoizeOne from 'memoize-one';
import styles from './BasicLayout.less';
import React, { PureComponent } from 'react';
import SiderMenu from '@/components/SiderMenu';
import Authorized from '@/components/Authorized';
import Exception403 from '@/pages/Exception/403';
import DocumentTitle from '@/components/DocumentTitle';
import { pathnameToArr, pathToScope } from '@/utils/utils';
import { ConnectState, ConnectProps } from '@/models/connect';
const { Content } = Layout;

export interface BasicLayoutProps extends ConnectProps {
  collapsed?: boolean;
  currentScope?: Array<string | number>;
  loading?: boolean;
  route?: Route;
}

@connect(({ global, login, loading }: ConnectState) => ({
  collapsed: global.collapsed,
  currentScope: login.scope,
  loading: loading.effects['login/fetchUser'],
}))
class BasicLayout extends PureComponent<BasicLayoutProps> {
  pathnameToArr = memoizeOne(pathnameToArr);

  pathToScope = memoizeOne(pathToScope);

  constructor(props: BasicLayoutProps) {
    super(props);
    props.dispatch({
      type: 'login/fetchUser',
    });
  }

  onCollapse = (collapsed: boolean) => {
    this.props.dispatch({
      type: 'global/setCollapsed',
      payload: collapsed,
    });
  };

  render() {
    const { route, location, children, collapsed, currentScope, loading } = this.props;
    const menuSelectedKeys = this.pathnameToArr(location.pathname);
    return (
      <DocumentTitle location={location} route={route} defaultTitle="app.name">
        <Layout className={styles.layout}>
          <Header
            collapsed={collapsed}
            currentScope={currentScope}
            location={location}
            menuSelectedKeys={menuSelectedKeys}
            route={route}
          />
          <Layout>
            <SiderMenu
              collapsed={collapsed}
              currentScope={currentScope}
              location={location}
              menuSelectedKeys={menuSelectedKeys}
              onCollapse={this.onCollapse}
              route={route}
            />
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
          </Layout>
          <Footer />
        </Layout>
      </DocumentTitle>
    );
  }
}

export default BasicLayout;
