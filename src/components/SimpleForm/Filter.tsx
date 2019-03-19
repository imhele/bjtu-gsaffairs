import React from 'react';
import styles from './Filter.less';
import classNames from 'classnames';
import { Button, Col, Form, Icon, Row } from 'antd';
import { groupByAmount, safeFun } from '@/utils/utils';
import BaseForm, {
  BaseFormProps,
  FormEventStore,
  OnFieldsChange,
  OnValuesChange,
  renderFormItem,
  SimpleFormItemProps as FilterItemProps,
  SimpleFormItemType as FilterType,
} from './BaseForm';

export { FilterItemProps, FilterType };

export interface FilterProps extends BaseFormProps<FilterProps> {
  animation?: boolean;
  expanded?: boolean;
  expandText?: {
    expand: React.ReactNode;
    retract: React.ReactNode;
  };
  filters?: FilterItemProps[];
  operationArea?: React.ReactNode | null;
  /**
   * save values of filters to SessionStorage onSubmit
   * @param saveToSession: key of SessionStorage
   */
  saveToSession?: string;
}

interface FilterStates {
  expanded: boolean;
}

class Filter extends BaseForm<FilterProps, FilterStates> {
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
    onFieldsChange: () => {},
    onSubmit: () => {},
    onValuesChange: () => {},
    resetDisabled: false,
    resetLoading: false,
    resetText: 'Reset',
    rowProps: {
      gutter: { md: 8, lg: 24, xl: 48 },
    },
    submitDisabled: false,
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

  constructor(props: FilterProps) {
    super(props);
    const { saveToSession } = props;
    if (saveToSession) {
      try {
        const savedValue = sessionStorage.getItem(saveToSession);
        if (savedValue) this.tempFieldsValue = JSON.parse(savedValue);
      } catch {
        this.tempFieldsValue = props.initialFieldsValue;
      }
    }
  }

  onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const { form, onSubmit, saveToSession } = this.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      onSubmit(fieldsValue, this.wrappedFormUtils);
      if (saveToSession) {
        sessionStorage.setItem(saveToSession, JSON.stringify(fieldsValue));
      }
    });
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
    const {
      filters,
      groupAmount,
      resetDisabled,
      resetLoading,
      submitDisabled,
      submitLoading,
    } = this.props;
    const expandVisible: boolean = filters.length > groupAmount;
    return (
      <Col>
        <div className={styles.operationArea}>
          <Button
            disabled={submitDisabled}
            htmlType="submit"
            loading={submitLoading}
            type="primary"
          >
            {submitText}
          </Button>
          <Button
            disabled={resetDisabled}
            loading={resetLoading}
            onClick={this.onReset}
            style={{ marginLeft: 8 }}
          >
            {resetText}
          </Button>
          {expandVisible && (
            <a style={{ marginLeft: 8 }} onClick={this.onChangeExpand}>
              {expandText[expanded ? 'retract' : 'expand']}{' '}
              <Icon type="up" className={styles.icon} />
            </a>
          )}
        </div>
      </Col>
    );
  };

  renderFilters = (): React.ReactNode[] => {
    const {
      changeFormItems,
      colProps,
      filters,
      form,
      formItemProps,
      groupAmount,
      rowProps,
    } = this.props;
    return groupByAmount<FilterItemProps>(filters, groupAmount)
      .map((value, index) => (
        <Row {...rowProps} key={index}>
          {value.map(item => (
            <Col {...colProps} {...item.colProps} key={item.id}>
              {renderFormItem(item, form, formItemProps, this.tempFieldsValue, changeFormItems)}
            </Col>
          ))}
        </Row>
      ))
      .concat(
        <Row {...rowProps} key="OperationArea">
          {this.renderOperationArea()}
        </Row>,
      );
  };

  onReset = () => {
    const { onReset, onSubmit, saveToSession, submitLoading } = this.props;
    if (saveToSession) sessionStorage.removeItem(saveToSession);
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

export default Form.create<FilterProps>({
  onFieldsChange: (...args: [FilterProps, object, any, string]) => {
    FormEventStore.onFieldsChange.forEach((fn: OnFieldsChange, index) => {
      const tmp = safeFun<[FilterProps, object, any, string], OnFieldsChange>(fn, void 0, ...args);
      if (tmp instanceof Error) FormEventStore.onFieldsChange.splice(index, 1);
    });
  },
  onValuesChange: (...args: [FilterProps, any, any]) => {
    FormEventStore.onValuesChange.forEach((fn: OnValuesChange, index) => {
      const tmp = safeFun<[FilterProps, any, any], OnValuesChange>(fn, void 0, ...args);
      if (tmp instanceof Error) FormEventStore.onValuesChange.splice(index, 1);
    });
  },
})(Filter);
