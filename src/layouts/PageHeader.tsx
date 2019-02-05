import React from 'react';
import Link from 'umi/link';
import { Breadcrumb } from 'antd';
import styles from './PageHeader.less';
import { pathnameToArr } from '@/utils/utils';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';

const PageHeader: React.SFC = props => {
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
                  defaultMessage={unknownMsg}
                />
              </Link>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <div className={styles.title}>
          <FormattedMessage id={`route${pathname.replace(/\//g, '.')}`} defaultMessage={unknownMsg} />
        </div>
      </div>
      {props.children}
    </React.Fragment>
  );
};

export default PageHeader;
