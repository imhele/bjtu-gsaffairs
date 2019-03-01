import React, { Component } from 'react';
import { TooltipProps } from 'antd/es/tooltip';
import { RowProps, ColProps } from 'antd/es/grid';
import { FormComponentProps, FormItemProps } from 'antd/es/form';
import { GetFieldDecoratorOptions, WrappedFormUtils } from 'antd/es/form/Form';
import { Form, Input, InputNumber, Select, DatePicker, Radio, Switch, Tooltip } from 'antd';

export const enum SimpleFormItemType {
  ButtonRadio = 'ButtonRadio',
  DatePicker = 'DatePicker',
  Extra = 'Extra',
  Input = 'Input',
  InputNumber = 'InputNumber',
  MonthPicker = 'MonthPicker',
  Radio = 'Radio',
  RangePicker = 'RangePicker',
  Select = 'Select',
  Switch = 'Switch',
  TextArea = 'TextArea',
  WeekPicker = 'WeekPicker',
}

export interface SimpleFormItemProps<T = any> {
  id: string;
  itemProps?: T;
  colProps?: ColProps;
  decoratorOptions?: GetFieldDecoratorOptions;
  extra?: React.ReactNode;
  selectOptions?: Array<{
    disabled?: boolean;
    title?: React.ReactNode;
    value: string | number;
  }>;
  tip?: React.ReactNode | TooltipProps;
  title?: React.ReactNode;
  type: SimpleFormItemType;
  withoutWrap?: boolean;
}

export type OnFieldsChange<T = any> = (
  props: T,
  fields: object,
  allFields: any,
  add: string,
) => void;

export type OnValuesChange<T = any> = (props: T, changedValues: any, allValues: any) => void;

export const FormEventStore: {
  onFieldsChange: OnFieldsChange[];
  onValuesChange: OnValuesChange[];
} = {
  onFieldsChange: [],
  onValuesChange: [],
};

export interface BaseFormProps<P> extends FormComponentProps {
  changeFormItems?: (formItem: SimpleFormItemProps) => SimpleFormItemProps;
  className?: string;
  colProps?: ColProps;
  formItemProps?: FormItemProps;
  groupAmount?: number;
  initialFieldsValue?: object;
  onFieldsChange?: OnFieldsChange<P>;
  onReset?: (form: WrappedFormUtils) => void;
  onSubmit?: (fieldsValue: any, form: WrappedFormUtils) => void;
  onValuesChange?: OnValuesChange<P>;
  resetDisabled?: boolean;
  resetLoading?: boolean;
  resetText?: React.ReactNode;
  rowProps?: RowProps;
  style?: React.CSSProperties;
  submitDisabled?: boolean;
  submitLoading?: boolean;
  submitText?: React.ReactNode;
}

export default class BaseForm<P extends BaseFormProps<P>, S = {}> extends Component<P, S> {
  protected eventIndex: [number, number] = [null, null];
  protected wrappedFormUtils: WrappedFormUtils = null;
  protected tempFieldsValue: object = {};

  protected constructor(props: P) {
    super(props);
    this.wrappedFormUtils = {
      ...props.form,
      resetFields: this.resetFields,
    };
    this.eventIndex = [
      FormEventStore.onFieldsChange.push(this.onFieldsChange) - 1,
      FormEventStore.onValuesChange.push(this.onValuesChange) - 1,
    ];
    this.tempFieldsValue = props.initialFieldsValue || {};
  }

  componentWillUnmount = () => {
    FormEventStore.onFieldsChange.splice(this.eventIndex[0], 1);
    FormEventStore.onValuesChange.splice(this.eventIndex[1], 1);
  };

  onFieldsChange: OnFieldsChange<P> = (props, fields, allFields, add) => {
    const { onFieldsChange } = this.props;
    onFieldsChange(props, fields, allFields, add);
  };

  onValuesChange: OnValuesChange<P> = (props, changedValues, allValues) => {
    const { onValuesChange } = this.props;
    this.tempFieldsValue = allValues;
    onValuesChange(props, changedValues, allValues);
  };

  resetFields = (names?: string[]) => {
    const { form, initialFieldsValue = {} } = this.props;
    if (!Array.isArray(names)) {
      this.tempFieldsValue = initialFieldsValue;
    } else {
      names.forEach(key => (this.tempFieldsValue[key] = initialFieldsValue[key]));
    }
    form.resetFields(names);
  };

  onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const { form, onSubmit } = this.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      onSubmit(fieldsValue, this.wrappedFormUtils);
    });
  };
}

export const renderFormItem = (
  formItem: SimpleFormItemProps,
  form: WrappedFormUtils | null,
  formItemProps: FormItemProps,
  initialFieldsValue: object,
  changeFormItems?: (formItem: SimpleFormItemProps) => SimpleFormItemProps,
): React.ReactNode => {
  if (typeof formItem !== 'object') return null;
  if (changeFormItems) formItem = changeFormItems(formItem);
  let item: React.ReactNode;
  const { selectOptions = [] } = formItem;
  switch (formItem.type) {
    case SimpleFormItemType.Input:
      item = <Input {...formItem.itemProps} />;
      break;
    case SimpleFormItemType.Select:
      item = (
        <Select allowClear showSearch optionFilterProp="children" {...formItem.itemProps}>
          {selectOptions.map(value => (
            <Select.Option disabled={value.disabled} key={`${value.value}`} value={value.value}>
              {value.title || value.value}
            </Select.Option>
          ))}
        </Select>
      );
      break;
    case SimpleFormItemType.InputNumber:
      item = <InputNumber style={{ width: '100%' }} {...formItem.itemProps} />;
      break;
    case SimpleFormItemType.Extra:
      item = formItem.extra;
      break;
    case SimpleFormItemType.ButtonRadio:
      item = (
        <Radio.Group name={formItem.id} buttonStyle="solid" {...formItem.itemProps}>
          {selectOptions.map(value => (
            <Radio.Button disabled={value.disabled} key={`${value.value}`} value={value.value}>
              {value.title || value.value}
            </Radio.Button>
          ))}
        </Radio.Group>
      );
      break;
    case SimpleFormItemType.Radio:
      item = (
        <Radio.Group name={formItem.id} {...formItem.itemProps}>
          {selectOptions.map(value => (
            <Radio disabled={value.disabled} key={`${value.value}`} value={value.value}>
              {value.title || value.value}
            </Radio>
          ))}
        </Radio.Group>
      );
      break;
    case SimpleFormItemType.TextArea:
      item = <Input.TextArea autosize {...formItem.itemProps} />;
      break;
    case SimpleFormItemType.DatePicker:
      item = <DatePicker style={{ width: '100%' }} {...formItem.itemProps} />;
      break;
    case SimpleFormItemType.Switch:
      formItem.decoratorOptions = { valuePropName: 'checked', ...formItem.decoratorOptions };
      item = <Switch {...formItem.itemProps} />;
      break;
    case SimpleFormItemType.MonthPicker:
      item = <DatePicker.MonthPicker style={{ width: '100%' }} {...formItem.itemProps} />;
      break;
    case SimpleFormItemType.RangePicker:
      item = <DatePicker.RangePicker style={{ width: '100%' }} {...formItem.itemProps} />;
      break;
    case SimpleFormItemType.WeekPicker:
      item = <DatePicker.WeekPicker style={{ width: '100%' }} {...formItem.itemProps} />;
      break;
    default:
      item = null;
  }
  if (formItem.type !== SimpleFormItemType.Extra && form !== null) {
    item = form.getFieldDecorator(formItem.id, {
      initialValue: initialFieldsValue[formItem.id],
      ...formItem.decoratorOptions,
    })(item);
  }
  if (formItem.tip) {
    if (typeof formItem.tip === 'object' && 'title' in formItem.tip) {
      item = (
        <Tooltip trigger="focus" placement="topLeft" {...formItem.tip}>
          {item}
        </Tooltip>
      );
    } else {
      item = (
        <Tooltip trigger="focus" placement="topLeft" title={formItem.tip}>
          {item}
        </Tooltip>
      );
    }
  }
  if (!formItem.withoutWrap) {
    item = (
      <Form.Item label={formItem.title || formItem.id} {...formItemProps}>
        {item}
      </Form.Item>
    );
  }
  return item;
};
