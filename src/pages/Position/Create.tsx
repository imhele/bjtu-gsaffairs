import React from 'react';
import { connect } from 'dva';
import commonStyles from '../common.less';
import SimpleForm, { SimpleFormItemType } from '@/components/SimpleForm';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';

export interface CreateProps extends ConnectProps {
  loading?: {
    createPosition?: boolean;
    fetchForm?: boolean;
  };
  position?: PositionState;
}

const Create: React.SFC<CreateProps> = props => {
  return (
    <div className={commonStyles.contentBody}>
      <SimpleForm
        formItems={[
          { id: 'test', type: SimpleFormItemType.Input },
          { id: 'test2', type: SimpleFormItemType.Input },
        ]}
      />
    </div>
  );
};

export default connect(
  ({ loading, position }: ConnectState): CreateProps => ({
    loading: {
      createPosition: loading.effects['position/createPosition'],
      fetchForm: loading.effects['position/fetchForm'],
    },
    position,
  }),
)(Create);
