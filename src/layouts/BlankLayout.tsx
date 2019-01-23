import React from 'react';
import QueueAnim from 'rc-queue-anim';
import styles from './BlankLayout.less';

export type BlankLayoutComponent<P> = React.SFC<P>;

const BlankLayout: BlankLayoutComponent<{}> = props => {
  return (
    <div className={styles.container}>
      <QueueAnim type='top'>
        <div key='ani'>
          {props.children}
        </div>
      </QueueAnim>
    </div>
  );
};

export default BlankLayout;
