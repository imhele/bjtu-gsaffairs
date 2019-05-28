import React from 'react';
import qs from 'querystring';
import { connect } from 'dva';
import styles from './Login.less';
import { LoginPayload } from '@/api/login';
import { FormComponentProps } from 'antd/es/form';
import { FormattedMessage } from 'umi-plugin-locale';
import { Button, Card, Form, Icon, Input } from 'antd';
import ConnectState, { ConnectProps } from '@/models/connect';

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
        })(<Input disabled={loading} prefix={<Icon type="user" />} size="large" />)}
      </Form.Item>
      <Form.Item>
        {form.getFieldDecorator('password', {
          rules: [{ required: true, message: <FormattedMessage id="login.password-required" /> }],
        })(<Input.Password disabled={loading} prefix={<Icon type="lock" />} size="large" />)}
      </Form.Item>
      <Button block htmlType="submit" loading={loading} size="large" type="primary">
        <FormattedMessage id="word.login" />
      </Button>
    </Form>
  );
};

export const LoginForm = Form.create()(UnwrappedLoginForm);

export interface LoginProps extends ConnectProps {
  loading?: boolean;
}

const Login: React.SFC<LoginProps> = ({ dispatch, loading, location: { search } }) => {
  if (search) {
    const { token, redirect } = qs.parse(search.slice(1));
    if (token)
      dispatch({
        type: 'login/loginWithToken',
        payload: { token, redirect },
      });
  }
  return (
    <Card className={styles.card}>
      <div className={styles.image} />
      <div className={styles.title}>
        <FormattedMessage id="app.name" />
      </div>
      <div className={styles.description}>
        <FormattedMessage id="app.developer" />
      </div>
      <LoginForm
        className={styles.form}
        loading={loading}
        onLogin={(account, psw) =>
          dispatch<LoginPayload>({
            type: 'login/login',
            payload: { account, method: 'psw', psw },
          })
        }
      />
    </Card>
  );
};

export default connect(({ loading }: ConnectState) => ({
  loading: loading.effects['login/login'] || loading.effects['login/loginWithToken'],
}))(Login);
