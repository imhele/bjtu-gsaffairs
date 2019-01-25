import Header from './Header';
import Footer from './Footer';
import { connect } from 'dva';
import Media from 'react-media';
import { Layout, Spin } from 'antd';
import memoizeOne from 'memoize-one';
import QueueAnim from 'rc-queue-anim';
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
  isMobile?: boolean;
  loading?: boolean;
  route?: Route;
}

class BasicLayout extends PureComponent<BasicLayoutProps> {
  pathnameToArr = memoizeOne(pathnameToArr);

  pathToScope = memoizeOne(pathToScope);

  private isMobile = false;

  constructor(props: BasicLayoutProps) {
    super(props);
    props.dispatch({ type: 'login/fetchUser' });
    this.onCollapse(props.isMobile);
  }

  componentDidUpdate = () => {
    if (this.props.isMobile !== this.isMobile) {
      this.isMobile = this.props.isMobile;
      this.onCollapse(this.props.isMobile);
    }
  };

  onCollapse = (collapsed: boolean) => {
    this.props.dispatch({
      type: 'global/setCollapsed',
      payload: collapsed,
    });
  };

  render() {
    const { children, collapsed, currentScope, isMobile, location, loading, route } = this.props;
    const menuSelectedKeys = this.pathnameToArr(location.pathname);
    return (
      <DocumentTitle location={location} route={route} defaultTitle="app.name">
        <Layout className={styles.layout}>
          <QueueAnim type="left" delay={200}>
            <Header
              collapsed={collapsed}
              currentScope={currentScope}
              isMobile={isMobile}
              key="Header"
              location={location}
              menuSelectedKeys={menuSelectedKeys}
              onOpenMenu={() => this.onCollapse(false)}
              route={route}
            />
            <Layout key="Layout">
              <SiderMenu
                collapsed={collapsed}
                currentScope={currentScope}
                drawerTitle="app.name"
                isMobile={isMobile}
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
                <Footer key="Footer" />
              </Content>
            </Layout>
          </QueueAnim>
        </Layout>
      </DocumentTitle>
    );
  }
}

export default connect(({ global, login, loading }: ConnectState) => ({
  collapsed: global.collapsed,
  currentScope: login.scope,
  loading: loading.effects['login/fetchUser'],
}))((props: BasicLayoutProps) => (
  <Media query="(max-width: 599px)">
    {isMobile => <BasicLayout {...props} isMobile={isMobile} />}
  </Media>
));
