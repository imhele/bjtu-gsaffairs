import styles from './List.less';
import QueueAnim from 'rc-queue-anim';
import React, { Component } from 'react';
import StandardTable, { StandardTableActionProps } from '@/components/StandardTable';
import StandardFilter, { FilterType } from '@/components/StandardFilter';

interface Test {
  key: string;
  name: string;
  age: number;
  address: string;
  action: StandardTableActionProps;
}

const dataSource: Test[] = [
  {
    key: '1',
    name: '胡彦斌',
    age: 32,
    address: '西湖区湖底公园1号',
    action: [{ type: '编辑' }, { type: '删除' }],
  },
  {
    key: '2',
    name: '胡彦祖',
    age: 42,
    address: '西湖区湖底公园1号',
    action: [{ type: '编辑' }, { type: '删除' }],
  },
];

const columns = [
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

export default class List extends Component {
  onClickAction = (event: any) => {
    const { currentTarget: { dataset: { type = '' } = {} } = {} } = event;
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
          key="StandardTable"
          columns={columns}
          dataSource={dataSource}
          onClickAction={this.onClickAction}
        />
      </QueueAnim>
    );
  }
}
