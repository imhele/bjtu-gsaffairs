import React from 'react';
import { Icon } from 'antd';
import styles from '../BasicLayout.less';
import { FormattedMessage } from 'umi-plugin-locale';

export interface LeftContentProps {
  onOpenMenu: () => void;
  isMobile: boolean;
}

const LeftContent: React.SFC<LeftContentProps> = ({ isMobile, onOpenMenu }) =>
  isMobile ? (
    <div
      className={styles.leftContent}
      onClick={onOpenMenu}
      style={{
        width: 48,
        fontSize: 20,
        color: '#fff',
        margin: '16px',
        textAlign: 'left',
      }}
    >
      <Icon type="menu-unfold" />
    </div>
  ) : (
    <div className={styles.leftContent}>
      <FormattedMessage id="app.name" />
    </div>
  );

export default LeftContent;
