import React from 'react';
import styles from '../BasicLayout.less';
import { FormattedMessage } from 'umi-plugin-locale';

const LeftContent: React.SFC = () => (
  <div className={styles.leftContent}>
    <FormattedMessage id='app.name' />
  </div>
);

export default LeftContent;
