import React from 'react';
import List from './List';
import commonStyles from '../common.less';

export default () => (
  <div className={commonStyles.contentBody}>
    <List type="manage" />
  </div>
);
