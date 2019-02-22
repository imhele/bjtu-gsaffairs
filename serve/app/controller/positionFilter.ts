import { SimpleFormItemType } from '../link';
import { DefineAttributeColumnOptions } from 'sequelize';
import { attr as PositionAttr, PositionType } from '../model/interships/position';
// import { FilterItemProps, SimpleFormItemType } from '../../../src/components/SimpleForm';

const NewPositionAttr = PositionAttr as {
  [key: string]: DefineAttributeColumnOptions;
};

export const filtersMap: { [K in keyof Partial<typeof PositionAttr>]: FilterItemProps } = {
  semester: {
    id: 'semester',
    title: '学年学期',
    type: SimpleFormItemType.Select,
    selectOptions: ['2018-2019学年 第一学期', '2018-2019学年 第二学期'].map(value => ({ value })),
  },
  department_code: {
    id: 'department_code',
    title: '用工单位',
    type: SimpleFormItemType.Select,
    selectOptions: [],
  },
  name: {
    id: 'name',
    title: '岗位名称',
    type: SimpleFormItemType.Input,
  },
  campus: {
    id: 'campus',
    selectOptions: NewPositionAttr.campus.values!.map((title, index) => ({ value: index, title })),
    title: '校区',
    type: SimpleFormItemType.Select,
  },
  status: {
    id: 'status',
    selectOptions: NewPositionAttr.status.values!.map((title, index) => ({ value: index, title })),
    title: '岗位状态',
    type: SimpleFormItemType.Select,
  },
  way: {
    id: 'way',
    selectOptions: NewPositionAttr.way.values!.map((title, index) => ({ value: index, title })),
    title: '聘用方式',
    type: SimpleFormItemType.Select,
  },
  class_type: {
    id: 'class_type',
    selectOptions: NewPositionAttr.class_type.values!.map((title, index) => ({
      value: index,
      title,
    })),
    title: '课程类型',
    type: SimpleFormItemType.Select,
  },
};

export const filtersKeyMap: {
  [K in keyof typeof PositionType]: {
    [T in 'withStatus' | 'withoutStatus']: (keyof typeof filtersMap)[]
  }
} = {
  manage: {
    withStatus: ['semester', 'department_code', 'name', 'campus', 'status', 'way'],
    withoutStatus: ['semester', 'department_code', 'name', 'campus', 'way'],
  },
  teach: {
    withStatus: ['semester', 'department_code', 'name', 'campus', 'status', 'way', 'class_type'],
    withoutStatus: ['semester', 'department_code', 'name', 'campus', 'way', 'class_type'],
  },
};

export const getFilters = (keys: (keyof typeof filtersMap)[]): FilterItemProps[] =>
  keys.map(key => filtersMap[key]!);
