import React, { Component } from 'react';
import { groupByAmount } from '@/utils/utils';
import { RowProps, ColProps } from 'antd/es/grid';
import { FormComponentProps, FormItemProps } from 'antd/es/form';
import { FormLayout, GetFieldDecoratorOptions, WrappedFormUtils } from 'antd/es/form/Form';
import { Button, Col, Form, Icon, Row, Input, InputNumber, Select, DatePicker, Radio } from 'antd';

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
    case SimpleFormItemType.Input:
      item = <Input {...filter.itemProps} />;
      break;
    case SimpleFormItemType.Select:
      item = (
        <Select allowClear showSearch optionFilterProp="children" {...filter.itemProps}>
          {filter.selectOptions.map(value => (
            <Select.Option disabled={value.disabled} key={`${value.value}`} value={value.value}>
              {value.title || value.value}
            </Select.Option>
          ))}
        </Select>
      );
      break;
    case SimpleFormItemType.InputNumber:
      item = <InputNumber style={{ width: '100%' }} {...filter.itemProps} />;
      break;
    case SimpleFormItemType.Extra:
      return filter.extra;
    case SimpleFormItemType.ButtonRadio:
      item = (
        <Radio.Group name={filter.id} buttonStyle="solid" {...filter.itemProps}>
          {filter.selectOptions.map(value => (
            <Radio.Button disabled={value.disabled} key={`${value.value}`} value={value.value}>
              {value.title || value.value}
            </Radio.Button>
          ))}
        </Radio.Group>
      );
      break;
    case SimpleFormItemType.Radio:
      item = (
        <Radio.Group name={filter.id} {...filter.itemProps}>
          {filter.selectOptions.map(value => (
            <Radio disabled={value.disabled} key={`${value.value}`} value={value.value}>
              {value.title || value.value}
            </Radio>
          ))}
        </Radio.Group>
      );
      break;
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

export interface FormCreateOptions {
  onFieldsChange?: (props: SimpleFormProps, fields: object, allFields: any, add: string) => void;
  onValuesChange?: (props: SimpleFormProps, changedValues: any, allValues: any) => void;
  mapPropsToFields?: (props: SimpleFormProps) => void;
}

export interface SimpleFormProps<T = any> extends FormComponentProps {
  className?: string;
  colProps?: ColProps;
  formCreateOptions?: FormCreateOptions;
  formItems?: SimpleFormItemProps<T>[];
  formItemProps?: FormItemProps;
  groupAmount?: number;
  hideRequiredMark?: boolean;
  layout?: FormLayout;
  onReset?: (form: WrappedFormUtils) => void;
  onSubmit?: (fieldsValue: T, form: WrappedFormUtils) => void;
  renderOperationArea?: null | ((form: WrappedFormUtils) => React.ReactNode);
  resetLoading?: boolean;
  resetText?: React.ReactNode;
  rowProps?: RowProps;
  style?: React.CSSProperties;
  submitLoading?: boolean;
  submitText?: React.ReactNode;
}

class SimpleForm<T = any> extends Component<SimpleFormProps> {
  static defaultProps = {
    colProps: {
      md: 8,
      sm: 24,
    },
    groupAmount: 1,
    onSubmit: () => {},
    resetLoading: false,
    resetText: 'Reset',
    rowProps: {
      gutter: { md: 8, lg: 24, xl: 48 },
    },
    submitLoading: false,
    submitText: 'Query',
  };

  private initialFieldsValue: object = {};

  renderOperationArea = (): React.ReactNode => {
    const {
      form,
      renderOperationArea,
      resetLoading,
      resetText,
      submitLoading,
      submitText,
    } = this.props;
    if (renderOperationArea === null) return null;
    if (renderOperationArea) return renderOperationArea(form);
    return (
      <React.Fragment>
        <Button htmlType="submit" loading={submitLoading} type="primary">
          {submitText}
        </Button>
        <Button loading={resetLoading} onClick={this.onReset} style={{ marginLeft: 8 }}>
          {resetText}
        </Button>
      </React.Fragment>
    );
  };

  renderFormItems = (): React.ReactNode[] => {
    const { colProps, form, formItems, formItemProps, groupAmount, rowProps } = this.props;
    return groupByAmount<SimpleFormItemProps<T>>(formItems, groupAmount)
      .map((value, index) => (
        <Row {...rowProps} key={index}>
          {value.map(item => (
            <Col {...colProps} {...item.colProps} key={item.id}>
              {renderFormItem(item, form, formItemProps, this.initialFieldsValue)}
            </Col>
          ))}
        </Row>
      ))
      .concat(
        <Row {...rowProps} key="OperationArea">
          <Col>{this.renderOperationArea()}</Col>
        </Row>,
      );
  };

  onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const { form, onSubmit } = this.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      this.initialFieldsValue = fieldsValue;
      onSubmit(fieldsValue, form);
    });
  };

  onReset = () => {
    const { form, onReset, onSubmit, submitLoading } = this.props;
    if (onReset) return onReset(form);
    form.resetFields();
    if (!submitLoading) onSubmit({}, form);
  };

  render() {
    const { className, formItems, hideRequiredMark, layout, style } = this.props;
    if (!Array.isArray(formItems) || !formItems.length) return null;
    return (
      <Form
        className={className}
        hideRequiredMark={hideRequiredMark}
        layout={layout}
        onSubmit={this.onSubmit}
        style={style}
      >
        {this.renderFormItems()}
      </Form>
    );
  }
}

const defaultFormCreateOptions: FormCreateOptions = {
  onFieldsChange: () => {},
  onValuesChange: () => {},
  mapPropsToFields: () => {},
};

let formCreateOptions: FormCreateOptions = defaultFormCreateOptions;

const FilterWrapper: React.SFC<SimpleFormProps> = props => {
  formCreateOptions = {
    ...defaultFormCreateOptions,
    ...props.formCreateOptions,
  };
  return <SimpleForm {...props} />;
};

export default Form.create<SimpleFormProps>({
  onFieldsChange: (...args) => formCreateOptions.onFieldsChange(...args),
  onValuesChange: (...args) => formCreateOptions.onValuesChange(...args),
  mapPropsToFields: (...args) => formCreateOptions.mapPropsToFields(...args),
})(FilterWrapper);
