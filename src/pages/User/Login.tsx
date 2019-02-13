import React from 'react';
import styles from './Login.less';
import { FormComponentProps } from 'antd/es/form';
import { FormattedMessage } from 'umi-plugin-locale';
import { Button, Card, Form, Icon, Input } from 'antd';

export interface LoginFormProps extends FormComponentProps {
  className?: string;
  loading?: boolean;
  onLogin?: (account: string, password: string) => void;
}

const UnwrappedLoginForm: React.SFC<LoginFormProps> = ({
  className,
  form,
  loading = false,
  onLogin = () => {},
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onLogin(fieldsValue.account, fieldsValue.password);
    });
  };
  return (
    <Form className={className} onSubmit={handleSubmit}>
      <Form.Item>
        {form.getFieldDecorator('account', {
          rules: [{ required: true, message: <FormattedMessage id="login.account-required" /> }],
        })(<Input prefix={<Icon type="user" />} size="large" />)}
      </Form.Item>
      <Form.Item>
        {form.getFieldDecorator('password', {
          rules: [{ required: true, message: <FormattedMessage id="login.password-required" /> }],
        })(<Input.Password prefix={<Icon type="lock" />} size="large" />)}
      </Form.Item>
      <Button block htmlType="submit" loading={loading} size="large" type="primary">
        <FormattedMessage id="word.login" />
      </Button>
    </Form>
  );
};

export const LoginForm = Form.create()(UnwrappedLoginForm);

export default () => (
  <Card className={styles.card}>
    <div className={styles.image} />
    <div className={styles.title}><FormattedMessage id='app.name' /></div>
    <div className={styles.description}><FormattedMessage id='app.developer' /></div>
    <LoginForm className={styles.form} />
  </Card>
);
