import styles from './index.less';
import classnames from 'classnames';
import React, { Component } from 'react';
import { groupByAmount } from '@/utils/utils';
import { RowProps, ColProps } from 'antd/es/grid';
import { GetFieldDecoratorOptions } from 'antd/es/form/Form';
import { FormComponentProps, FormItemProps } from 'antd/es/form';
import QueueAnim, { IProps as QueueAnimProps } from 'rc-queue-anim';
import { Button, Col, Form, Icon, Row, Input, InputNumber, Select, DatePicker } from 'antd';

export enum FilterType {
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
  animation?: boolean | QueueAnimProps;
  colProps?: ColProps;
  expanded?: boolean;
  expandText?: [string, string] | [React.ReactNode, React.ReactNode];
  filters?: Array<Filter>;
  formCreateOptions?: FormCreateOptions;
  formItemProps?: FormItemProps;
  groupAmount?: number;
  onReset?: React.MouseEventHandler<HTMLButtonElement>;
  onSubmit?: React.FormEventHandler<any>;
  operationArea?: React.ReactNode | null;
  resetText?: string | React.ReactNode;
  rowProps?: RowProps;
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
    expandText: ['Open', 'Close'],
    filters: [],
    groupAmount: 3,
    onReset: () => {},
    onSubmit: () => {},
    resetText: 'Reset',
    rowProps: {
      gutter: { md: 8, lg: 24, xl: 48 },
    },
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

  onChangeExpand = () => {
    if (this.props.expanded !== undefined) return;
    this.setState({
      expanded: !this.state.expanded,
    });
  };

  renderOperationArea = (): Filter => {
    if (this.props.operationArea)
      return {
        id: 'operationArea',
        extra: this.props.operationArea,
        type: FilterType.Extra,
      };
    const { expanded } = this.state;
    const { filters, groupAmount } = this.props;
    const onlyChild: boolean = !(filters.length % groupAmount) && expanded;
    const expandVisible: boolean = filters.length >= groupAmount;
    const operationArea = (
      <div className={classnames(styles.submitButtons, { [styles.expanded]: expanded })}>
        <Button type="primary" htmlType="submit">
          {this.props.submitText}
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={this.props.onReset}>
          {this.props.resetText}
        </Button>
        {expandVisible && (
          <a style={{ marginLeft: 8 }} onClick={this.onChangeExpand}>
            {this.props.expandText[expanded ? 1 : 0]} <Icon type={expanded ? 'up' : 'down'} />
          </a>
        )}
      </div>
    );
    return {
      id: 'operationArea',
      colProps: onlyChild ? { md: 24 } : {},
      extra: operationArea,
      type: FilterType.Extra,
    };
  };

  getGroup = (): Filter[][] => {
    const { filters, groupAmount } = this.props;
    if (this.state.expanded) {
      return groupByAmount<Filter>(filters.concat(this.renderOperationArea()), groupAmount);
    } else return [filters.slice(0, groupAmount - 1).concat(this.renderOperationArea())];
  };

  renderFormItem = (filter: Filter): React.ReactNode => {
    let item: React.ReactNode;
    switch (filter.type) {
      case FilterType.Select:
        item = (
          <Select showSearch optionFilterProp="children" {...filter.itemProps}>
            {filter.selectOptions.map(value => (
              <Select.Option key={`${value.value}`} value={value.value || value.title}>
                {value.title}
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
      <Form.Item label={filter.title || filter.id} {...this.props.formItemProps}>
        {this.props.form.getFieldDecorator(filter.id, filter.decoratorOptions)(item)}
      </Form.Item>
    );
  };

  renderFilters = (): React.ReactNode[] => {
    const { colProps, rowProps } = this.props;
    return this.getGroup().map((value, index) => (
      <Row {...rowProps} key={index}>
        {value.map(item => (
          <Col {...colProps} {...item.colProps} key={item.id}>
            {this.renderFormItem(item)}
          </Col>
        ))}
      </Row>
    ));
  };

  render() {
    const { animation, filters } = this.props;
    if (!Array.isArray(filters) || !filters.length) return <div />;
    return (
      <Form onSubmit={this.props.onSubmit} layout="inline" className={styles.standardFilter}>
        {animation ? (
          <QueueAnim type="top" duration={240} {...animation}>
            {this.renderFilters()}
          </QueueAnim>
        ) : (
          this.renderFilters()
        )}
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
