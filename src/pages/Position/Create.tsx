import { connect } from 'dva';
import router from 'umi/router';
import debounce from 'debounce';
import classNames from 'classnames';
import QueueAnim from 'rc-queue-anim';
import React, { Component } from 'react';
import commonStyles from '../common.less';
import Exception404 from '@/pages/Exception/404';
import { Button, Col, message, Skeleton } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import { buttonColProps, PositionType, TopbarAction } from './consts';
import SimpleForm, { SimpleFormItemProps } from '@/components/SimpleForm';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';
import { CreatePositionPayload, FetchFormPayload, TeachingTaskPayload } from '@/api/position';

export interface CreateProps extends ConnectProps<{ type: PositionType }> {
  loading?: {
    createPosition?: boolean;
    fetchForm?: boolean;
    getTeachingTask?: boolean;
  };
  position?: PositionState;
}

const backToList = () => router.push('list');

class Create extends Component<CreateProps> {
  search: string = '';

  onTeachingTaskSearch = debounce((search: string) => {
    this.search = search;
    const { dispatch } = this.props;
    dispatch<TeachingTaskPayload>({
      type: 'position/getTeachingTask',
      payload: { query: { search } },
    });
  }, 200);

  constructor(props: CreateProps) {
    super(props);
    const {
      dispatch,
      match: {
        params: { type },
      },
    } = props;
    if (!Object.values(PositionType).includes(type)) {
      message.error(formatMessage({ id: 'position.error.unknown.type' }));
      return this;
    }
    dispatch<FetchFormPayload>({
      type: 'position/fetchForm',
      payload: {
        body: { action: TopbarAction.Create },
        query: { type },
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
          <FormattedMessage id="word.create" />
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
      selectOptions: teachingTaskSelections,
      itemProps: {
        ...item.itemProps,
        loading,
        onSearch: this.onTeachingTaskSearch,
        notFoundContent: this.search ? '暂无数据' : '输入以查询',
      },
    };
  };

  onSubmit = (fieldsValue: object) => {
    const {
      dispatch,
      match: {
        params: { type },
      },
    } = this.props;
    dispatch<CreatePositionPayload>({
      type: 'position/createPosition',
      payload: {
        body: fieldsValue,
        query: { type },
      },
    });
  };

  render() {
    const {
      loading,
      match: {
        params: { type },
      },
      position: { form: createForm },
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
            colProps={createForm.colProps}
            formItemProps={createForm.formItemProps}
            formItems={createForm.formItems}
            groupAmount={createForm.groupAmount}
            initialFieldsValue={createForm.initialFieldsValue}
            onSubmit={this.onSubmit}
            renderOperationArea={this.renderOperationArea}
            rowProps={createForm.rowProps}
            submitLoading={loading.createPosition}
          />
        </Skeleton>
      </QueueAnim>
    );
  }
}

export default connect(
  ({ loading, position }: ConnectState): CreateProps => ({
    loading: {
      createPosition: loading.effects['position/createPosition'],
      fetchForm: loading.effects['position/fetchForm'],
      getTeachingTask: loading.effects['position/getTeachingTask'],
    },
    position,
  }),
)(Create);
