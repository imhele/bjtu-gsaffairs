import React from 'react';
import { Layout, Tooltip } from 'antd';
import styles from './BasicLayout.less';
import { FormattedMessage } from 'umi-plugin-locale';

export default () => (
  <Layout.Footer className={styles.footer}>
    <div>
      <Tooltip title={<FormattedMessage id="app.mis" />}>
        <span>
          <a href="//mis.bjtu.edu.cn/">MIS</a>
        </span>
      </Tooltip>
    </div>
    <div>
      <Tooltip title={<FormattedMessage id="app.slogan" />}>
        <span>Made with ❤ by BJTU</span>
      </Tooltip>
    </div>
  </Layout.Footer>
);
