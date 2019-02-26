import React from 'react';
import Link from 'umi/link';
import { Breadcrumb } from 'antd';
import styles from './PageHeader.less';
import { pathnameToArr } from '@/utils/utils';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';

export interface PageHeaderProps {
  defaultMessage?: string | ((path: string) => string);
  headerExtra?: React.ReactNode;
}

const PageHeader: React.SFC<PageHeaderProps> = ({ children, defaultMessage, headerExtra }) => {
  const { pathname } = window.location;
  const paths = pathnameToArr(pathname);
  const unknownMsg = formatMessage({ id: 'word.unknown-page', defaultMessage: 'Unknown page' });
  return (
    <React.Fragment>
      <div className={styles.pageHeader}>
        <Breadcrumb className={styles.breadcrumb} separator=">">
          {paths.map(path => (
            <Breadcrumb.Item key={path}>
              <Link to={path}>
                <FormattedMessage
                  id={`route${path.replace(/\//g, '.')}`}
                  defaultMessage={
                    typeof defaultMessage === 'function'
                      ? defaultMessage(path)
                      : defaultMessage || unknownMsg
                  }
                />
              </Link>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <div className={styles.title}>
          <FormattedMessage
            id={`route${pathname.replace(/\//g, '.')}-title`}
            defaultMessage={
              typeof defaultMessage === 'function'
                ? defaultMessage(pathname)
                : defaultMessage || unknownMsg
            }
          />
        </div>
        {headerExtra}
      </div>
      {children}
    </React.Fragment>
  );
};

export default PageHeader;
