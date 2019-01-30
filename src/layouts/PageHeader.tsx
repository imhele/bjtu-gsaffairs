import React from 'react';
import Link from 'umi/link';
import { Breadcrumb } from 'antd';
import styles from './PageHeader.less';
import { pathnameToArr } from '@/utils/utils';
import { FormattedMessage } from 'umi-plugin-locale';

const PageHeader: React.SFC = props => {
  const { pathname } = window.location;
  const paths = pathnameToArr(pathname);
  return (
    <React.Fragment>
      <div className={styles.pageHeader}>
        <Breadcrumb className={styles.breadcrumb} separator=">">
          {paths.map(path => (
            <Breadcrumb.Item key={path}>
              <Link to={path}>
                <FormattedMessage id={`app${path.replace(/\//g, '.')}`} />
              </Link>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <div className={styles.title}>
          <FormattedMessage id={`app${pathname.replace(/\//g, '.')}`} />
        </div>
      </div>
      {props.children}
    </React.Fragment>
  );
};

export default PageHeader;
