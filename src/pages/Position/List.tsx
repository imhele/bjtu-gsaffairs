import { message } from 'antd';
import styles from './List.less';
import QueueAnim from 'rc-queue-anim';
import React, { Component } from 'react';
import StandardFilter, { FilterType } from '@/components/StandardFilter';
import StandardTable, {
  ColumnProps,
  StandardTableActionProps,
  StandardTableOperationAreaProps,
} from '@/components/StandardTable';

interface Test {
  key: string;
  name: StandardTableActionProps;
  age: number;
  address: string;
  action: StandardTableActionProps;
}

const dataSource: Test[] = [
  {
    key: '1',
    name: [{ type: '胡彦斌' }],
    age: 32,
    address: '西湖区湖底公园1号',
    action: [{ type: '编辑' }, { type: '删除' }],
  },
  {
    key: '2',
    name: [{ type: '胡彦祖' }],
    age: 42,
    address: '西湖区湖底公园1号',
    action: [{ type: '编辑' }, { type: '删除' }],
  },
];

const columns: ColumnProps<Test>[] = [
  {
    title: '姓名',
    dataIndex: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
  },
  {
    title: '住址',
    dataIndex: 'address',
  },
  {
    title: '操作',
    dataIndex: 'action',
  },
];

const operationArea: StandardTableOperationAreaProps = {
  moreText: '更多',
  onClick: (rowKeys, type) =>
    message.info(`Click on ${type}, selected key(s): ${rowKeys.length ? rowKeys.join(' ') : 'None'}`),
  operation: [
    { icon: 'plus', text: '新建', type: 'create' },
    { icon: 'cloud-download', text: '导出', type: 'export', loading: true },
    { text: '删除', type: 'delete' },
    { text: '示例', type: 'exmaple', loading: true },
  ],
};

export default class List extends Component {
  onClickAction = (event: any) => {
    const { currentTarget: { dataset: { key = '', type = '' } = {} } = {} } = event;
  };

  render() {
    return (
      <QueueAnim type="left">
        <StandardFilter
          key="StandardFilter"
          filters={[
            { id: 'test1', type: FilterType.Input },
            { id: 'test2', type: FilterType.InputNumber },
            { id: 'test3', type: FilterType.InputNumber },
            {
              id: 'test4',
              type: FilterType.Select,
              selectOptions: [
                { value: 'Option1', title: 'bbb' },
                { value: 'Option2', title: 'aaa' },
              ],
            },
          ]}
        />
        <StandardTable
          actionKey={['action', 'name']}
          key="StandardTable"
          columns={columns}
          dataSource={dataSource}
          onClickAction={this.onClickAction}
          operationArea={operationArea}
          selectable
        />
      </QueueAnim>
    );
  }
}
