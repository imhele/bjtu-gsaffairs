import React from 'react';
import { Button, Col, Empty, Form, Row } from 'antd';
import { groupByAmount, safeFun } from '@/utils/utils';
import { FormLayout, WrappedFormUtils } from 'antd/es/form/Form';
import BaseForm, {
  BaseFormProps,
  FormEventStore,
  renderFormItem,
  SimpleFormItemProps,
} from './BaseForm';

export interface SimpleFormProps extends BaseFormProps<SimpleFormProps> {
  empty?: React.ReactNode;
  formItems?: SimpleFormItemProps[];
  hideRequiredMark?: boolean;
  layout?: FormLayout;
  renderOperationArea?:
    | null
    | ((
        form: WrappedFormUtils,
        submitLoading: boolean,
        submitDisabled: boolean,
        resetLoading: boolean,
        resetDisabled: boolean,
      ) => React.ReactNode);
  save?: Storage | boolean;
}

class SimpleForm extends BaseForm<SimpleFormProps> {
  static defaultProps = {
    groupAmount: 1,
    initialFieldsValue: {},
    onFieldsChange: () => {},
    onSubmit: () => {},
    onValuesChange: () => {},
    resetDisabled: false,
    resetLoading: false,
    resetText: 'Reset',
    save: true,
    submitDisabled: false,
    submitLoading: false,
    submitText: 'Submit',
  };

  constructor(props: SimpleFormProps) {
    super(props);
    this.getSavedValue();
  }

  getSavedValue = () => {
    if (!props.save) return;
    try {
      const { form, save } = this.props;
      const storage = save === true ? sessionStorage : save;
      const savedValue = storage.getItem(this.getStorageId());
      if (!savedValue) return;
      form.setFieldsValue(JSON.parse(savedValue));
    } catch () {}
  }
  
  getStorageId = (): string => {
    const { formItems = [] } = this.props;
    const identity = formItems.map(item => item.id).join('');
    return `simpleform-${identity}`;
  }
  
  saveValue = (value: object) => {
    if (!props.save) return;
    try {
      const { save } = this.props;
      const storage = save === true ? sessionStorage : save;
      storage.setItem(this.getStorageId(), JSON.stringify(value));
    }
  }

  renderOperationArea = (): React.ReactNode => {
    const {
      renderOperationArea,
      resetDisabled,
      resetLoading,
      resetText,
      submitDisabled,
      submitLoading,
      submitText,
    } = this.props;
    if (renderOperationArea === null) return null;
    if (renderOperationArea)
      return renderOperationArea(
        this.wrappedFormUtils,
        submitLoading,
        submitDisabled,
        resetLoading,
        resetDisabled,
      );
    return (
      <Col>
        <Form.Item
          wrapperCol={{
            xs: { span: 24, offset: 0 },
            sm: { span: 10, offset: 7 },
          }}
        >
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
        </Form.Item>
      </Col>
    );
  };

  renderFormItems = (): React.ReactNode[] => {
    const {
      changeFormItems,
      colProps,
      formItems,
      formItemProps,
      groupAmount,
      resetLoading,
      rowProps,
      submitLoading,
    } = this.props;
    return groupByAmount<SimpleFormItemProps>(formItems, groupAmount)
      .map((value, index) => (
        <Row {...rowProps} key={index}>
          {value.map(item => (
            <Col {...colProps} {...item.colProps} key={item.id}>
              {renderFormItem(
                {
                  ...item,
                  itemProps: {
                    disabled: resetLoading || submitLoading,
                    ...item.itemProps,
                  },
                },
                this.wrappedFormUtils,
                formItemProps,
                this.tempFieldsValue,
                changeFormItems,
              )}
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

  onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const { form, onSubmit } = this.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      this.saveValue(fieldsValue);
      onSubmit(fieldsValue, this.wrappedFormUtils);
    });
  };

  render() {
    const {
      className,
      empty,
      formItems,
      groupAmount,
      hideRequiredMark,
      layout,
      style,
    } = this.props;
    if (!Array.isArray(formItems) || !formItems.length) {
      return empty === void 0 ? <Empty /> : empty;
    }
    return (
      <Form
        className={className}
        hideRequiredMark={hideRequiredMark}
        layout={layout}
        onSubmit={this.onSubmit}
        style={{
          margin: 'auto',
          maxWidth: groupAmount < 2 ? '900px' : void 0,
          ...style,
        }}
      >
        {this.renderFormItems()}
      </Form>
    );
  }
}

export default Form.create<SimpleFormItemProps>({
  onFieldsChange: (...args: any[]) => {
    FormEventStore.onFieldsChange.forEach((fn, index) => {
      if (safeFun(fn, void 0, ...args) instanceof Error) {
        FormEventStore.onFieldsChange.splice(index, 1);
      }
    });
  },
  onValuesChange: (...args: any[]) => {
    FormEventStore.onValuesChange.forEach((fn, index) => {
      if (safeFun(fn, void 0, ...args) instanceof Error) {
        FormEventStore.onValuesChange.splice(index, 1);
      }
    });
  },
})(SimpleForm);
