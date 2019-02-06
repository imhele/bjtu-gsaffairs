import React from 'react';
import { Button, Col, Form, Row } from 'antd';
import { groupByAmount, safeFun } from '@/utils/utils';
import { FormLayout, WrappedFormUtils } from 'antd/es/form/Form';
import BaseForm, {
  BaseFormProps,
  FormEventStore,
  renderFormItem,
  SimpleFormItemProps,
} from './BaseForm';

export interface SimpleFormProps extends BaseFormProps<SimpleFormProps> {
  formItems?: SimpleFormItemProps[];
  hideRequiredMark?: boolean;
  layout?: FormLayout;
  renderOperationArea?:
    | null
    | ((form: WrappedFormUtils, submitLoading: boolean, resetLoading: boolean) => React.ReactNode);
}

class SimpleForm extends BaseForm<SimpleFormProps> {
  static defaultProps = {
    groupAmount: 1,
    initialFieldsValue: {},
    onFieldsChange: () => {},
    onSubmit: () => {},
    onValuesChange: () => {},
    resetLoading: false,
    resetText: 'Reset',
    submitLoading: false,
    submitText: 'Submit',
  };

  renderOperationArea = (): React.ReactNode => {
    const { renderOperationArea, resetLoading, resetText, submitLoading, submitText } = this.props;
    if (renderOperationArea === null) {
      return null;
    }
    if (renderOperationArea) {
      return renderOperationArea(this.wrappedFormUtils, submitLoading, resetLoading);
    }
    return (
      <Col>
        <Form.Item
          wrapperCol={{
            xs: { span: 24, offset: 0 },
            sm: { span: 10, offset: 7 },
          }}
        >
          <Button htmlType="submit" loading={submitLoading} type="primary">
            {submitText}
          </Button>
          <Button loading={resetLoading} onClick={this.onReset} style={{ marginLeft: 8 }}>
            {resetText}
          </Button>
        </Form.Item>
      </Col>
    );
  };

  renderFormItems = (): React.ReactNode[] => {
    const { colProps, formItems, formItemProps, groupAmount, rowProps } = this.props;
    return groupByAmount<SimpleFormItemProps>(formItems, groupAmount)
      .map((value, index) => (
        <Row {...rowProps} key={index}>
          {value.map(item => (
            <Col {...colProps} {...item.colProps} key={item.id}>
              {renderFormItem(item, this.wrappedFormUtils, formItemProps, this.tempFieldsValue)}
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
    const { onReset } = this.props;
    if (onReset) return onReset(this.wrappedFormUtils);
    this.resetFields();
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

export default Form.create<SimpleFormItemProps>({
  onFieldsChange: (...args: any[]) => {
    FormEventStore.onFieldsChange.forEach((fn, index) => {
      if (safeFun(fn, undefined, ...args) instanceof Error) {
        FormEventStore.onFieldsChange.splice(index, 1);
      }
    });
  },
  onValuesChange: (...args: any[]) => {
    FormEventStore.onValuesChange.forEach((fn, index) => {
      if (safeFun(fn, undefined, ...args) instanceof Error) {
        FormEventStore.onValuesChange.splice(index, 1);
      }
    });
  },
})(SimpleForm);
