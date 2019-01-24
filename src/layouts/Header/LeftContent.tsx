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
        width: 72,
        height: 40,
        fontSize: 24,
        color: '#fff',
        lineHeight: '40px',
        margin: '12px 4px',
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
