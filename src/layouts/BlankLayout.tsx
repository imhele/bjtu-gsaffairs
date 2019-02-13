import React from 'react';
import Footer from './Footer';
import { Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import styles from './BlankLayout.less';
import DocumentTitle from '@/components/DocumentTitle';

export type BlankLayoutComponent = React.SFC<{ route?: Route }>;

const BlankLayout: BlankLayoutComponent = ({ children, route }) => (
  <DocumentTitle location={location} route={route} defaultTitle="app.name">
    <Layout className={styles.container}>
      <QueueAnim type="top">
        <Layout.Content className={styles.content} key="Content">
          {children}
        </Layout.Content>
        <Footer key="Footer" />
      </QueueAnim>
    </Layout>
  </DocumentTitle>
);

export default BlankLayout;
