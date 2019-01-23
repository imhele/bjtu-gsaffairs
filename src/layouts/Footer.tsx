import React from 'react';
import styles from './BasicLayout.less';
import { Layout, Icon, Tooltip, Divider } from 'antd';
import { FormattedMessage } from 'umi-plugin-locale';

export default () => (
  <Layout.Footer className={styles.footer}>
    <div>
      <Tooltip title={<FormattedMessage id='apps.yuque' />}>
        <span><a href='//yuque.com/hele'>
          <Icon type='yuque' theme='filled' />
        </a></span>
      </Tooltip>
      <Divider type='vertical' />
      <Tooltip title={<FormattedMessage id='apps.github' />}>
        <span><a href='//github.com/imhele'>
          <Icon type='github' theme='filled' />
        </a></span>
      </Tooltip>
      <Divider type='vertical' />
      <Tooltip title={<FormattedMessage id='apps.mail' />}>
        <span><a href='mailto:work@imhele.com'>
          <Icon type='mail' theme='filled' />
        </a></span>
      </Tooltip>
    </div>
    <div>2018 <Icon type='copyright' /> Hele</div>
  </Layout.Footer>
);
