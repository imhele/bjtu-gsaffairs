import React from 'react';
import List from './List';
import { PositionType } from './consts';
import commonStyles from '../common.less';

export default () => (
  <div className={commonStyles.contentBody}>
    <List type={PositionType.Manage} />
  </div>
);
