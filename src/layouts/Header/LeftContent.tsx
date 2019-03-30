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
        width: 32,
        fontSize: 20,
        margin: '16px',
        textAlign: 'left',
        color: 'rgba(0, 0, 0, 0.65)',
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
