import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import styles from './Create.less';
import { PositionType } from './consts';
import commonStyles from '../common.less';
import Exception404 from '@/pages/Exception/404';
import { Button, Col, message, Skeleton } from 'antd';
import { formatMessage, FormattedMessage } from 'umi-plugin-locale';
import SimpleForm, { SimpleFormItemType } from '@/components/SimpleForm';
import { ConnectProps, ConnectState, PositionState } from '@/models/connect';

export interface CreateProps extends ConnectProps<{ type: PositionType }> {
  loading?: {
    createPosition?: boolean;
    fetchForm?: boolean;
  };
  position?: PositionState;
}

const formItemProps = {
  labelCol: {
    sm: 24,
    md: 5,
  },
  wrapperCol: {
    sm: 24,
    md: 19,
  },
};

const backToList = () => router.push(window.location.pathname.replace('create', 'list'));

const renderOperationArea = (_: any, submitLoading: boolean) => (
  <Col>
    <Button htmlType="submit" loading={submitLoading} type="primary">
      <FormattedMessage id="word.create" />
    </Button>
    <Button onClick={backToList} style={{ marginLeft: 8 }}>
      <FormattedMessage id="word.back" />
    </Button>
  </Col>
);

const Create: React.SFC<CreateProps> = ({
  loading,
  match: {
    params: { type },
  },
  position,
}) => {
  if (!Object.values(PositionType).includes(type)) {
    message.error(formatMessage({ id: 'position.error.unknown.type' }));
    return <Exception404 />;
  }
  return (
    <div className={commonStyles.contentBody}>
      <Skeleton active loading={loading.fetchForm} paragraph={{ rows: 7 }}>
        <SimpleForm
          className={styles.form}
          colProps={{ md: 12, sm: 24 }}
          formItemProps={formItemProps}
          formItems={[
            {
              id: 'sess',
              title: '申报学期',
              type: SimpleFormItemType.Extra,
              extra: '2018-2019学年第一学期',
            },
            {
              id: 'depName',
              title: '用工单位',
              type: SimpleFormItemType.Extra,
              extra: '校机关',
            },
            {
              id: 'name',
              title: '岗位名称',
              type: SimpleFormItemType.Input,
              decoratorOptions: {
                rules: [
                  { required: true, message: '必填项' },
                  { max: 255, message: '长度不能超过 255 个字符' },
                ],
              },
            },
            {
              id: 'needNum',
              title: '岗位人数',
              type: SimpleFormItemType.InputNumber,
              decoratorOptions: { rules: [{ required: true, message: '必填项' }] },
              itemProps: { min: 1, max: 50 },
            },
            {
              id: 'adminId',
              title: '负责人工号',
              type: SimpleFormItemType.InputNumber,
              decoratorOptions: { rules: [{ required: true, message: '必填项' }] },
              itemProps: { min: 10000000, max: 99999999 },
            },
            {
              id: 'adminName',
              title: '负责人姓名',
              type: SimpleFormItemType.Input,
              decoratorOptions: {
                rules: [
                  { required: true, message: '必填项' },
                  { max: 255, message: '长度不能超过 255 个字符' },
                ],
              },
            },
            {
              id: 'need',
              title: '基本要求',
              type: SimpleFormItemType.TextArea,
              decoratorOptions: {
                rules: [{ max: 500, message: '长度不能超过 500 个字符' }],
              },
            },
            {
              id: 'content',
              title: '工作内容',
              type: SimpleFormItemType.TextArea,
              decoratorOptions: {
                rules: [{ max: 500, message: '长度不能超过 500 个字符' }],
              },
            },
            {
              id: 'workTimeL',
              title: '计划工作量',
              tip: '单位：小时 / 人周',
              type: SimpleFormItemType.InputNumber,
              decoratorOptions: { rules: [{ required: true, message: '必填项' }] },
              itemProps: { min: 0, max: 12 },
            },
            {
              id: 'workTimeD',
              title: '工作时间',
              type: SimpleFormItemType.Input,
              decoratorOptions: {
                rules: [
                  { required: true, message: '必填项' },
                  { max: 255, message: '长度不能超过 255 个字符' },
                ],
              },
            },
            {
              id: 'address',
              title: '工作地点',
              type: SimpleFormItemType.Input,
              decoratorOptions: {
                rules: [
                  { required: true, message: '必填项' },
                  { max: 255, message: '长度不能超过 255 个字符' },
                ],
              },
            },
            {
              id: 'campus',
              title: '校区',
              type: SimpleFormItemType.ButtonRadio,
              decoratorOptions: {
                rules: [{ required: true, message: '必填项' }],
              },
              selectOptions: [{ value: '主校区' }, { value: '东校区' }],
            },
            {
              id: 'way',
              title: '聘用方式',
              type: SimpleFormItemType.ButtonRadio,
              decoratorOptions: {
                rules: [{ required: true, message: '必填项' }],
              },
              selectOptions: [{ value: '固定' }, { value: '临时' }],
            },
            {
              id: 'timeRange',
              title: '聘用时间',
              type: SimpleFormItemType.RangePicker,
              decoratorOptions: {
                rules: [{ required: true, message: '必填项' }],
              },
              itemProps: {},
            },
          ]}
          groupAmount={2}
          renderOperationArea={renderOperationArea}
          rowProps={{ gutter: { md: 8, lg: 24 } }}
          submitLoading={loading.createPosition}
        />
      </Skeleton>
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
