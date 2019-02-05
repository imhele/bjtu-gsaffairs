import React, { Component } from 'react';
import { RowProps, ColProps } from 'antd/es/grid';
import { FormComponentProps, FormItemProps } from 'antd/es/form';
import { GetFieldDecoratorOptions, WrappedFormUtils } from 'antd/es/form/Form';
import { Button, Col, Form, Icon, Row, Input, InputNumber, Select, DatePicker } from 'antd';

export const enum SimpleFormItemType {
  Input = 'Input',
  InputNumber = 'InputNumber',
  DatePicker = 'DatePicker',
  Extra = 'Extra',
  MonthPicker = 'MonthPicker',
  WeekPicker = 'WeekPicker',
  RangePicker = 'RangePicker',
  Select = 'Select',
}

export interface SimpleFormItemProps<T = any> {
  id: string;
  itemProps?: T;
  colProps?: ColProps;
  decoratorOptions?: GetFieldDecoratorOptions;
  extra?: React.ReactNode;
  selectOptions?: Array<{ title?: string; value: string | number }>;
  title?: React.ReactNode;
  type: SimpleFormItemType;
}

export const renderFormItem = (
  filter: SimpleFormItemProps,
  form: WrappedFormUtils,
  formItemProps: FormItemProps,
  initialFieldsValue: object,
): React.ReactNode => {
  let item: React.ReactNode;
  switch (filter.type) {
    case SimpleFormItemType.Select:
      item = (
        <Select allowClear showSearch optionFilterProp="children" {...filter.itemProps}>
          {filter.selectOptions.map(value => (
            <Select.Option key={`${value.value}`} value={value.value || value.title}>
              {value.title || value.value}
            </Select.Option>
          ))}
        </Select>
      );
      break;
    case SimpleFormItemType.Input:
      item = <Input {...filter.itemProps} />;
      break;
    case SimpleFormItemType.InputNumber:
      item = <InputNumber style={{ width: '100%' }} {...filter.itemProps} />;
      break;
    case SimpleFormItemType.Extra:
      return filter.extra;
    case SimpleFormItemType.DatePicker:
      item = <DatePicker {...filter.itemProps} />;
      break;
    case SimpleFormItemType.MonthPicker:
      item = <DatePicker.MonthPicker {...filter.itemProps} />;
      break;
    case SimpleFormItemType.RangePicker:
      item = <DatePicker.RangePicker {...filter.itemProps} />;
      break;
    case SimpleFormItemType.WeekPicker:
      item = <DatePicker.WeekPicker {...filter.itemProps} />;
      break;
    default:
      item = null;
  }
  return (
    <Form.Item colon={false} label={filter.title || filter.id} {...formItemProps}>
      {form.getFieldDecorator(filter.id, {
        initialValue: initialFieldsValue[filter.id],
        ...filter.decoratorOptions,
      })(item)}
    </Form.Item>
  );
};
