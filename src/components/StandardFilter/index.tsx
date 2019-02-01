import styles from './index.less';
import classnames from 'classnames';
import React, { Component } from 'react';
import { groupByAmount } from '@/utils/utils';
import { RowProps, ColProps } from 'antd/es/grid';
import { FormComponentProps, FormItemProps } from 'antd/es/form';
import { GetFieldDecoratorOptions, WrappedFormUtils } from 'antd/es/form/Form';
import { Button, Col, Form, Icon, Row, Input, InputNumber, Select, DatePicker } from 'antd';

export const enum FilterType {
  Input = 'Input',
  InputNumber = 'InputNumber',
  DatePicker = 'DatePicker',
  Extra = 'Extra',
  MonthPicker = 'MonthPicker',
  WeekPicker = 'WeekPicker',
  RangePicker = 'RangePicker',
  Select = 'Select',
}

export interface Filter<T = any> {
  id: string;
  itemProps?: T;
  colProps?: ColProps;
  decoratorOptions?: GetFieldDecoratorOptions;
  extra?: React.ReactNode;
  selectOptions?: Array<{ title?: string; value: string | number }>;
  title?: string | React.ReactNode;
  type: FilterType;
}

export interface FormCreateOptions {
  onFieldsChange?: (
    props: StandardFilterProps,
    fields: object,
    allFields: any,
    add: string,
  ) => void;
  onValuesChange?: (props: StandardFilterProps, changedValues: any, allValues: any) => void;
  mapPropsToFields?: (props: StandardFilterProps) => void;
}

export interface StandardFilterProps extends FormComponentProps {
  animation?: boolean;
  className?: string;
  colProps?: ColProps;
  expanded?: boolean;
  expandText?: {
    expand: string | React.ReactNode;
    retract: string | React.ReactNode;
  };
  filters?: Filter[];
  formCreateOptions?: FormCreateOptions;
  formItemProps?: FormItemProps;
  groupAmount?: number;
  onReset?: (form: WrappedFormUtils) => void;
  onSubmit?: (fieldsValue: any, form: WrappedFormUtils) => void;
  operationArea?: React.ReactNode | null;
  resetLoading?: boolean;
  resetText?: string | React.ReactNode;
  rowProps?: RowProps;
  style?: React.CSSProperties;
  submitLoading?: boolean;
  submitText?: string | React.ReactNode;
}

interface StandardFilterStates {
  expanded: boolean;
}

class StandardFilter extends Component<StandardFilterProps, StandardFilterStates> {
  static defaultProps = {
    animation: true,
    colProps: {
      md: 8,
      sm: 24,
    },
    expandText: {
      retract: 'Retract',
      expand: 'Expand',
    },
    filters: [],
    groupAmount: 3,
    onSubmit: () => {},
    resetLoading: false,
    resetText: 'Reset',
    rowProps: {
      gutter: { md: 8, lg: 24, xl: 48 },
    },
    submitLoading: false,
    submitText: 'Confirm',
  };

  static getDerivedStateFromProps(nextProps: StandardFilterProps, prevState: StandardFilterStates) {
    if (typeof nextProps.expanded !== 'boolean') return null;
    if (nextProps.expanded === prevState.expanded) return null;
    return {
      ...prevState,
      expanded: nextProps.expanded,
    };
  }

  state = {
    expanded: false,
  };

  private initialFieldsValue = {};

  onChangeExpand = () => {
    const { expanded } = this.props;
    const { expanded: stateExpanded } = this.state;
    if (typeof expanded !== 'undefined') return;
    this.setState({
      expanded: !stateExpanded,
    });
  };

  renderOperationArea = (): React.ReactNode => {
    const { expandText, operationArea, resetText, submitText } = this.props;
    if (operationArea || operationArea === null) return operationArea;
    const { expanded } = this.state;
    const { filters, groupAmount, resetLoading, submitLoading } = this.props;
    const expandVisible: boolean = filters.length >= groupAmount;
    const defaultOperationArea = (
      <div className={styles.operationArea}>
        <Button htmlType="submit" loading={submitLoading} type="primary">
          {submitText}
        </Button>
        <Button loading={resetLoading} onClick={this.onReset} style={{ marginLeft: 8 }}>
          {resetText}
        </Button>
        {expandVisible && (
          <a style={{ marginLeft: 8 }} onClick={this.onChangeExpand}>
            {expandText[expanded ? 'retract' : 'expand']} <Icon type="up" className={styles.icon} />
          </a>
        )}
      </div>
    );
    return defaultOperationArea;
  };

  renderFormItem = (filter: Filter): React.ReactNode => {
    let item: React.ReactNode;
    const { form, formItemProps } = this.props;
    switch (filter.type) {
      case FilterType.Select:
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
      case FilterType.Input:
        item = <Input {...filter.itemProps} />;
        break;
      case FilterType.InputNumber:
        item = <InputNumber style={{ width: '100%' }} {...filter.itemProps} />;
        break;
      case FilterType.Extra:
        return filter.extra;
      case FilterType.DatePicker:
        item = <DatePicker {...filter.itemProps} />;
        break;
      case FilterType.MonthPicker:
        item = <DatePicker.MonthPicker {...filter.itemProps} />;
        break;
      case FilterType.RangePicker:
        item = <DatePicker.RangePicker {...filter.itemProps} />;
        break;
      case FilterType.WeekPicker:
        item = <DatePicker.WeekPicker {...filter.itemProps} />;
        break;
      default:
        item = null;
    }
    return (
      <Form.Item colon={false} label={filter.title || filter.id} {...formItemProps}>
        {form.getFieldDecorator(filter.id, {
          initialValue: this.initialFieldsValue[filter.id],
          ...filter.decoratorOptions,
        })(item)}
      </Form.Item>
    );
  };

  renderFilters = (): React.ReactNode[] => {
    const { colProps, filters, groupAmount, rowProps } = this.props;
    return groupByAmount<Filter>(filters, groupAmount)
      .map((value, index) => (
        <Row {...rowProps} key={index}>
          {value.map(item => (
            <Col {...colProps} {...item.colProps} key={item.id}>
              {this.renderFormItem(item)}
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
    this.initialFieldsValue = {};
    if (onReset) return onReset(form);
    form.resetFields();
    if (!submitLoading) onSubmit({}, form);
  };

  render() {
    const { expanded } = this.state;
    const { animation, className, filters, style } = this.props;
    if (!Array.isArray(filters) || !filters.length) return null;
    return (
      <Form
        className={classnames({
          [styles.standardFilter]: true,
          [styles.animation]: animation,
          [styles.unexpanded]: !expanded,
          [className]: true,
        })}
        layout="inline"
        onSubmit={this.onSubmit}
        style={style}
      >
        {this.renderFilters()}
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

const StandardFilterWrapper: React.SFC<StandardFilterProps> = props => {
  formCreateOptions = {
    ...defaultFormCreateOptions,
    ...props.formCreateOptions,
  };
  return <StandardFilter {...props} />;
};

export default Form.create<StandardFilterProps>({
  onFieldsChange: (...args) => formCreateOptions.onFieldsChange(...args),
  onValuesChange: (...args) => formCreateOptions.onValuesChange(...args),
  mapPropsToFields: (...args) => formCreateOptions.mapPropsToFields(...args),
})(StandardFilterWrapper);
