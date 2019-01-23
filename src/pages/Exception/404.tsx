import React from 'react';
import { Button } from 'antd';
import router from 'umi/router';
import styles from './styles.less';
import { ExceptionProps } from './index';
import { FormattedMessage } from 'umi-plugin-locale';

export default ({ type = 'goback' }: ExceptionProps) => {
  const handleRouter = () => {
    if (type === 'gohome') router.push('/');
    else router.goBack();
  };
  return (
    <div className={styles.container}>
      <div className={styles.leftContent}>
        <div className={styles.title}>404</div>
        <div className={styles.describe}>
          <FormattedMessage id='exception.404' />
        </div>
        <Button type='primary' onClick={handleRouter}>
          <FormattedMessage id={`exception.${type}`} />
        </Button>
      </div>
      <div className={styles.rightContent} />
    </div>
  );
};
