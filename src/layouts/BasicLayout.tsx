import Header from './Header';
import Footer from './Footer';
import { connect } from 'dva';
import { Layout } from 'antd';
import router from 'umi/router';
import Media from 'react-media';
import debounce from 'debounce';
import memoizeOne from 'memoize-one';
import QueueAnim from 'rc-queue-anim';
import styles from './BasicLayout.less';
import React, { Component } from 'react';
import Authorized from '@/components/Authorized';
import Exception403 from '@/pages/Exception/403';
import { AuthorizedId, MediaQuery } from '@/global';
import DocumentTitle from '@/components/DocumentTitle';
import SiderMenu, { SelectParam } from '@/components/SiderMenu';
import { ConnectState, ConnectProps, LoginState } from '@/models/connect';
import { addWindowEvent, pathnameToArr, pathToScope } from '@/utils/utils';

const { Content } = Layout;

export interface BasicLayoutProps extends ConnectProps {
  collapsed?: boolean;
  currentScope?: Array<string | number>;
  isMobile?: boolean;
  loading?: boolean;
  login?: LoginState;
  route?: Route;
}

class BasicLayout extends Component<BasicLayoutProps> {

  pathnameToArr = memoizeOne(pathnameToArr);

  onCollapse = debounce((collapsed: boolean) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/setCollapsed',
      payload: collapsed,
    });
  }, 50);

  resize = debounce(() => {
    const { collapsed } = this.props;
    if (typeof this.onCollapse !== 'function') return;
    if (window.innerWidth <= 999) {
      if (!collapsed) {
        this.onCollapse(true);
      }
    } else {
      if (collapsed) {
        this.onCollapse(false);
      }
    }
  }, 200);
  private route: Route<string> = {};

  constructor(props: BasicLayoutProps) {
    super(props);
    props.dispatch({ type: 'login/fetchUser' });
    this.onCollapse(props.isMobile);
    addWindowEvent('resize', 'Component: BasicLayout', this.resize);
  }

  onLogout = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/logout',
    });
  };

  onSelectMenu = ({ key }: SelectParam): void => {
    const { location } = this.props;
    if (key !== location.pathname) {
      router.push(key);
      // if (this.props.isMobile) {
      //   /**
      //    * route changes will take about 300ms to render
      //    */
      //   setTimeout(() => this.onCollapse(true), 240);
      // }
    }
  };

  render() {
    const { route } = this;
    const { children, collapsed, currentScope, isMobile, loading, location, login } = this.props;
    const menuSelectedKeys = this.pathnameToArr(location.pathname);
    /**
     * `delay` in `<QueueAnim />` is setted to wait for `onCollapse` in constructor
     */
    return (
      <DocumentTitle location={location} route={route} defaultTitle="app.name">
        <Layout className={styles.layout}>
          <QueueAnim type="left" delay={200}>
            <Header
              collapsed={collapsed}
              currentScope={currentScope}
              isMobile={isMobile}
              key="Header"
              loading={loading}
              location={location}
              login={login}
              menuSelectedKeys={menuSelectedKeys}
              onLogout={this.onLogout}
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
                onSelectMenu={this.onSelectMenu}
                route={route}
              />
              <Content className={styles.content}>
                <Authorized
                  currentScope={currentScope}
                  exception={<Exception403 />}
                  id={AuthorizedId.BasicLayout}
                  scope={pathToScope(route, location.pathname)}
                >
                  {children}
                </Authorized>
                <Footer />
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
  login,
}))((props: BasicLayoutProps) => (
  <Media query={MediaQuery}>{isMobile => <BasicLayout {...props} isMobile={isMobile} />}</Media>
));
