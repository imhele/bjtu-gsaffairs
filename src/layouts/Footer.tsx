import React from 'react';
import styles from './BasicLayout.less';
import { Layout, Icon, Tooltip } from 'antd';
import { FormattedMessage } from 'umi-plugin-locale';

export default () => (
  <Layout.Footer className={styles.footer}>
    <div>
      <Tooltip title={<FormattedMessage id='app.mis' />}>
        <span><a href='//mis.bjtu.edu.cn/'>MIS</a></span>
      </Tooltip>
    </div>
    <div>2019 <Icon type='copyright' /> BJTU</div>
  </Layout.Footer>
);
