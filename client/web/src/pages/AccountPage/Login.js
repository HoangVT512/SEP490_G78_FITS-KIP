import React, { useState } from 'react';
import { Form, Input, Button, Radio, Checkbox, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import {
  loginContainer,
  loginForm,
  title,
  toggleGroup,
  inputField,
  rememberGroup,
  loginBtn,
} from './login.style';

const { Title } = Typography;

const Login = () => {
  const [useEmail, setUseEmail] = useState(false);

  const onFinish = (values) => {
    // TODO: Implement login logic here
    const loginId = useEmail ? values.email : values.employeeCode;
    alert(`Logging in with ${useEmail ? 'Email' : 'Employee Code'}: ${loginId}`);
  };

  return (
    <div css={loginContainer}>
      <Form
        css={loginForm}
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        layout="vertical"
      >
        <Title level={3} css={title}>Factory Login</Title>
        <div css={toggleGroup}>
          <Radio.Group
            value={useEmail ? 'email' : 'employeeCode'}
            onChange={e => setUseEmail(e.target.value === 'email')}
            style={{ width: '100%' }}
          >
            <Radio value="employeeCode">Employee Code</Radio>
            <Radio value="email">Email</Radio>
          </Radio.Group>
        </div>
        {!useEmail ? (
          <Form.Item
            name="employeeCode"
            rules={[{ required: true, message: 'Please input your Employee Code!' }]}
            css={inputField}
          >
            <Input prefix={<UserOutlined />} placeholder="Employee Code" />
          </Form.Item>
        ) : (
          <Form.Item
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please input a valid Email!' }]}
            css={inputField}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
        )}
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your Password!' }]}
          css={inputField}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>
        <Form.Item css={rememberGroup}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember Me</Checkbox>
          </Form.Item>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" css={loginBtn}>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
