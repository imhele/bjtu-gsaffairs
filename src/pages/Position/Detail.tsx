import React from 'react';
import styles from './Detail.less';
import { Button, Modal } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { FormattedMessage } from 'umi-plugin-locale';
import { PositionDetailProps } from './models/position';
import DescriptionList from '@/components/DescriptionList';
import { StandardTableAction } from '@/components/StandardTable';

const DescriptionListItem = DescriptionList.Item;

export interface DetailProps extends PositionDetailProps {
  currentRow?: object;
  currentRowKey?: string;
  onClickAction?: (rowKey: string, actionType: string, event: React.MouseEvent) => void;
  onClose?: () => void;
  visible?: boolean;
}

const renderFooter = (props: DetailProps): React.ReactNode => {
  const actionKey = Array.isArray(props.actionKey) ? props.actionKey : [props.actionKey];
  let actionArr: StandardTableAction[] = [];
  if (props.currentRow) {
    actionKey.forEach(key => {
      if (props.currentRow[key]) {
        actionArr = actionArr.concat(props.currentRow[key]);
      }
    });
  }
  return (
    <QueueAnim delay={[0, 500]} type="right">
      {actionArr
        .map(action => (
          <div className={styles.footerButton} key={action.type}>
            <Button
              icon={action.icon}
              onClick={(event: React.MouseEvent) =>
                props.onClickAction(props.currentRowKey, action.type, event)
              }
            >
              {action.text || action.type}
            </Button>
          </div>
        ))
        .concat(
          <div className={styles.footerButton} key="Close">
            <Button onClick={props.onClose} type="primary">
              <FormattedMessage id="words.close" />
            </Button>
          </div>,
        )}
    </QueueAnim>
  );
};

const Detail: React.SFC<DetailProps> = props => (
  <Modal
    className={styles.modal}
    footer={renderFooter(props)}
    onCancel={props.onClose}
    visible={props.visible}
  >
    <DescriptionList title="User Info">
      <DescriptionListItem label="UserName">Zhou Maomao</DescriptionListItem>
      <DescriptionListItem label="Telephone">1810000000</DescriptionListItem>
      <DescriptionListItem label="Live">Hangzhou, Zhejiang</DescriptionListItem>
      <DescriptionListItem label="Remark">empty</DescriptionListItem>
      <DescriptionListItem label="Address">
        No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China
      </DescriptionListItem>
    </DescriptionList>
  </Modal>
);

export default Detail;
