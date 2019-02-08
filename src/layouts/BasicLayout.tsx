import Header from './Header';
import Footer from './Footer';
import { connect } from 'dva';
import { Layout } from 'antd';
import router from 'umi/router';
import debounce from 'debounce';
import { GlobalId } from '@/global';
import QueueAnim from 'rc-queue-anim';
import * as Utils from '@/utils/utils';
import styles from './BasicLayout.less';
import useMedia from '@/components/UseMedia';
import Authorized from '@/components/Authorized';
import Exception403 from '@/pages/Exception/403';
import React, { useMemo, useState } from 'react';
import DocumentTitle from '@/components/DocumentTitle';
import SiderMenu, { SelectParam } from '@/components/SiderMenu';
import { ConnectState, ConnectProps, LoginState } from '@/models/connect';

const { Content } = Layout;

export interface BasicLayoutProps extends ConnectProps {
  collapsed?: boolean;
  currentScope?: Array<string | number>;
  loading?: boolean;
  login?: LoginState;
  route?: Route<string | string[], Array<string | number> | Array<string | number>[]>;
}

const BasicLayout: React.SFC<BasicLayoutProps> = ({
  children,
  collapsed,
  currentScope,
  dispatch,
  loading,
  location,
  login,
  ...restProps
}) => {
  /**
   * Constructor
   * These functions will be called during the first render only.
   */
  const route = useState(() => Utils.formatDynamicRoute(restProps.route))[0];
  const isMobile = useMedia({ id: GlobalId.BasicLayout, query: { maxWidth: 600 } })[0];
  const onCollapse = useState(() => {
    dispatch({ type: 'login/fetchUser' });
    dispatch({ type: 'global/setCollapsed', payload: isMobile });
    return debounce((payload: boolean) => dispatch({ type: 'global/setCollapsed', payload }), 50);
  })[0];
  /**
   * Initialization
   */
  const { pathname } = location;
  const onLogout = () => dispatch({ type: 'login/logout' });
  const menuSelectedKeys = useMemo(() => Utils.pathnameToArr(pathname), [pathname]);
  const onSelectMenu = ({ key }: SelectParam) => key !== pathname && router.push(key);
  useMedia({ query: { maxWidth: 1000 }, onChange: onCollapse });
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
            onLogout={onLogout}
            onOpenMenu={() => onCollapse(false)}
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
              onCollapse={onCollapse}
              onSelectMenu={onSelectMenu}
              route={route}
            />
            <Content className={styles.content}>
              <Authorized
                currentScope={currentScope}
                exception={<Exception403 />}
                id={GlobalId.BasicLayout}
                scope={Utils.pathToScope(route, location.pathname)}
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
};

export default connect(({ global, login, loading }: ConnectState) => ({
  collapsed: global.collapsed,
  currentScope: login.scope,
  loading: loading.effects['login/fetchUser'],
  login,
}))(BasicLayout);
