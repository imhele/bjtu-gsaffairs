import React from 'react';
import styles from './BasicLayout.less';
import { Icon, Layout, Tooltip } from 'antd';
import { FormattedMessage } from 'umi-plugin-locale';

export default () => (
  <Layout.Footer className={styles.footer}>
    <div>
      <Tooltip title={<FormattedMessage id="app.slogan" />}>
        <span>
          2019 北京交通大学 <Icon type="copyright" /> 研工部
        </span>
      </Tooltip>
    </div>
  </Layout.Footer>
);
