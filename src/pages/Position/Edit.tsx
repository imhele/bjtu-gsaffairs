import { connect } from 'dva';
import router from 'umi/router';
import debounce from 'debounce';
import classNames from 'classnames';
import QueueAnim from 'rc-queue-anim';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import Exception404 from '@/pages/Exception/404';
import { formatStrOrNumQuery } from '@/utils/format';
import { Button, Col, Empty, message, Skeleton } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import { buttonColProps, CellAction, PositionType } from './consts';
import SimpleForm, { SimpleFormItemProps } from '@/components/SimpleForm';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';
import { EditPositionPayload, FetchFormPayload, TeachingTaskPayload } from '@/api/position';

export interface EditProps extends ConnectProps<{ type: PositionType }> {
  loading?: {
    editPosition?: boolean;
    fetchForm?: boolean;
    getTeachingTask?: boolean;
  };
  position?: PositionState;
}

const backToList = () => router.push('/position/manage/list');

class Edit extends Component<EditProps> {
  static Empty = (
    <Empty style={{ margin: '48px 0 64px' }}>
      <Button onClick={backToList} type="primary">
        {formatMessage({ id: 'word.back-to-list' })}
      </Button>
    </Empty>
  );

  onTeachingTaskSearch = debounce((search: string) => {
    const { dispatch } = this.props;
    dispatch<TeachingTaskPayload>({
      type: 'position/getTeachingTask',
      payload: { query: { search } },
    });
  }, 500);

  /**
   * key of current position
   */
  private key: string | number = null;

  constructor(props: EditProps) {
    super(props);
    const {
      dispatch,
      location: { search },
      match: {
        params: { type },
      },
    } = props;
    if (!Object.values(PositionType).includes(type)) {
      message.error(formatMessage({ id: 'position.error.unknown.type' }));
      return this;
    }
    this.key = formatStrOrNumQuery.parse(search).get('key');
    if (!this.key) return this;
    dispatch<FetchFormPayload>({
      type: 'position/fetchForm',
      payload: {
        body: { action: CellAction.Edit },
        query: { type, key: this.key },
      },
    });
  }

  componentWillUnmount = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'position/resetForm' });
  };

  renderOperationArea = (_: any, submitLoading: boolean) => {
    const {
      position: {
        form: { groupAmount },
      },
    } = this.props;
    return (
      <Col {...(groupAmount === 1 ? buttonColProps[0] : buttonColProps[1])}>
        <Button htmlType="submit" loading={submitLoading} type="primary">
          <FormattedMessage id="word.submit" />
        </Button>
        <Button onClick={backToList} style={{ marginLeft: 8 }}>
          <FormattedMessage id="word.back" />
        </Button>
      </Col>
    );
  };

  setTeachingTask = (item: SimpleFormItemProps): SimpleFormItemProps => {
    const {
      loading: { getTeachingTask: loading },
      position: { teachingTaskSelections },
    } = this.props;
    if (item.id !== 'task_teaching_id') return item;
    return {
      ...item,
      itemProps: { loading, onSearch: this.onTeachingTaskSearch },
      selectOptions: teachingTaskSelections,
    };
  };

  onSubmit = (fieldsValue: object) => {
    const {
      dispatch,
      match: {
        params: { type },
      },
    } = this.props;
    dispatch<EditPositionPayload>({
      type: 'position/editPosition',
      payload: {
        body: fieldsValue,
        query: { type, key: this.key },
      },
    });
  };

  render() {
    const {
      loading,
      match: {
        params: { type },
      },
      position: { form: editForm },
    } = this.props;
    const className = classNames(
      commonStyles.contentBody,
      commonStyles.verticalSpace,
      commonStyles.compactFormItem,
    );
    if (!Object.values(PositionType).includes(type)) {
      return <Exception404 />;
    }
    return (
      <QueueAnim type="left" className={className}>
        <Skeleton active key="Skeleton" loading={loading.fetchForm} paragraph={{ rows: 7 }}>
          <SimpleForm
            changeFormItems={this.setTeachingTask}
            colProps={editForm.colProps}
            empty={Edit.Empty}
            formItemProps={editForm.formItemProps}
            formItems={editForm.formItems}
            groupAmount={editForm.groupAmount}
            initialFieldsValue={editForm.initialFieldsValue}
            onSubmit={this.onSubmit}
            renderOperationArea={this.renderOperationArea}
            rowProps={editForm.rowProps}
            submitLoading={loading.editPosition}
          />
        </Skeleton>
      </QueueAnim>
    );
  }
}

export default connect(
  ({ loading, position }: ConnectState): EditProps => ({
    loading: {
      editPosition: loading.effects['position/editPosition'],
      fetchForm: loading.effects['position/fetchForm'],
      getTeachingTask: loading.effects['position/getTeachingTask'],
    },
    position,
  }),
)(Edit);
