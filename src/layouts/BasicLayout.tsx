import Header from './Header';
import Footer from './Footer';
import { connect } from 'dva';
import router from 'umi/router';
import debounce from 'debounce';
import { Layout, Spin } from 'antd';
import QueueAnim from 'rc-queue-anim';
import * as Utils from '@/utils/utils';
import styles from './BasicLayout.less';
import useMedia from 'react-media-hook2';
import Authorized from '@/components/Authorized';
import Exception403 from '@/pages/Exception/403';
import { formatMessage } from 'umi-plugin-locale';
import DocumentTitle from '@/components/DocumentTitle';
import { GlobalId, NTElement, StorageId } from '@/global';
import SiderMenu, { SelectParam } from '@/components/SiderMenu';
import { ConnectState, ConnectProps, LoginState } from '@/models/connect';
import React, { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import NoviceTutorial, { NoviceTutorialMethods } from '@/components/NoviceTutorial';

const { Content } = Layout;

export interface BasicLayoutProps extends ConnectProps {
  collapsed?: boolean;
  currentScope?: {
    include?: Array<string | number>;
    exclude?: Array<string | number>;
  };
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
  const [route, setRoute] = useState<Route>(null);
  const isMobile = useMedia({ id: GlobalId.BasicLayout, query: '(max-width: 600px)' })[0];
  const NTMethods = useRef<NoviceTutorialMethods<StorageId, MouseEvent>>({
    getTrigger: () => void 0,
  });
  const onCollapse = useState(() => {
    dispatch({ type: 'login/fetchScope' });
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
  useMedia({ query: '(max-width: 1300px)', onChange: onCollapse });
  useEffect(() => {
    setRoute(Utils.filterScopeRoute(restProps.route, currentScope));
  }, [currentScope.include, currentScope.exclude]);
  /**
   * `delay` in `<QueueAnim />` is setted to wait for `onCollapse` in constructor
   */
  return (
    <DocumentTitle location={location} route={route} defaultTitle="app.name">
      <NoviceTutorial<StorageId, MouseEvent>
        closeText={formatMessage({ id: 'word.got-it' })}
        element={NTElement}
        getMethods={methods => (NTMethods.current = methods)}
        title={formatMessage({ id: 'word.NT' })}
      >
        <Layout className={styles.layout} onClick={NTMethods.current.getTrigger()}>
          <QueueAnim delay={200} type="left">
            <Header
              collapsed={collapsed}
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
            {loading ? (
              <div className={styles.loading} key="Spin">
                <Spin size="large" spinning />
              </div>
            ) : (
              <Layout key="Layout">
                <SiderMenu
                  collapsed={collapsed}
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
            )}
          </QueueAnim>
        </Layout>
      </NoviceTutorial>
    </DocumentTitle>
  );
};

export default connect(
  ({ global, login, loading }: ConnectState): BasicLayoutProps => ({
    collapsed: global.collapsed,
    currentScope: login.scope,
    loading: loading.effects['login/fetchScope'],
    login,
  }),
)(BasicLayout);
