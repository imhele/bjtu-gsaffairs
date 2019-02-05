import styles from './Filter.less';
import classNames from 'classnames';
import React, { Component } from 'react';
import { groupByAmount } from '@/utils/utils';
import { RowProps, ColProps } from 'antd/es/grid';
import { Button, Col, Form, Icon, Row } from 'antd';
import { WrappedFormUtils } from 'antd/es/form/Form';
import { FormComponentProps, FormItemProps } from 'antd/es/form';
import {
  SimpleFormItemProps as FilterItemProps,
  SimpleFormItemType as FilterType,
  renderFormItem,
} from './Form';

export { FilterItemProps, FilterType };

export interface FormCreateOptions {
  onFieldsChange?: (props: FilterProps, fields: object, allFields: any, add: string) => void;
  onValuesChange?: (props: FilterProps, changedValues: any, allValues: any) => void;
  mapPropsToFields?: (props: FilterProps) => void;
}

export interface FilterProps extends FormComponentProps {
  animation?: boolean;
  className?: string;
  colProps?: ColProps;
  expanded?: boolean;
  expandText?: {
    expand: React.ReactNode;
    retract: React.ReactNode;
  };
  filters?: FilterItemProps[];
  formCreateOptions?: FormCreateOptions;
  formItemProps?: FormItemProps;
  groupAmount?: number;
  onReset?: (form: WrappedFormUtils) => void;
  onSubmit?: (fieldsValue: any, form: WrappedFormUtils) => void;
  operationArea?: React.ReactNode | null;
  resetLoading?: boolean;
  resetText?: React.ReactNode;
  rowProps?: RowProps;
  style?: React.CSSProperties;
  submitLoading?: boolean;
  submitText?: React.ReactNode;
}

interface FilterStates {
  expanded: boolean;
}

class Filter extends Component<FilterProps, FilterStates> {
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
    submitText: 'Query',
  };

  static getDerivedStateFromProps(nextProps: FilterProps, prevState: FilterStates) {
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

  private wrappedFormUtils: WrappedFormUtils = null;

  private initialFieldsValue: object = {};

  constructor(props: FilterProps) {
    super(props);
    this.wrappedFormUtils = {
      ...props.form,
      resetFields: this.resetFields,
    };
  }

  resetFields = (names?: string[]) => {
    const { form } = this.props;
    if (!Array.isArray(names)) {
      this.initialFieldsValue = {};
    } else {
      names.forEach(key => (this.initialFieldsValue[key] = undefined));
    }
    form.resetFields(names);
  };

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
    return (
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
  };

  renderFilters = (): React.ReactNode[] => {
    const { colProps, filters, form, formItemProps, groupAmount, rowProps } = this.props;
    return groupByAmount<FilterItemProps>(filters, groupAmount)
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
      onSubmit(fieldsValue, this.wrappedFormUtils);
    });
  };

  onReset = () => {
    const { onReset, onSubmit, submitLoading } = this.props;
    if (onReset) return onReset(this.wrappedFormUtils);
    this.resetFields();
    if (!submitLoading) onSubmit({}, this.wrappedFormUtils);
  };

  render() {
    const { expanded } = this.state;
    const { animation, className, filters, style } = this.props;
    if (!Array.isArray(filters) || !filters.length) return null;
    return (
      <Form
        className={classNames({
          [styles.filter]: true,
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

const FilterWrapper: React.SFC<FilterProps> = props => {
  formCreateOptions = {
    ...defaultFormCreateOptions,
    ...props.formCreateOptions,
  };
  return <Filter {...props} />;
};

export default Form.create<FilterProps>({
  onFieldsChange: (...args) => formCreateOptions.onFieldsChange(...args),
  onValuesChange: (...args) => formCreateOptions.onValuesChange(...args),
  mapPropsToFields: (...args) => formCreateOptions.mapPropsToFields(...args),
})(FilterWrapper);
