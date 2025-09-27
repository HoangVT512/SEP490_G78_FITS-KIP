import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Radio,
  Checkbox,
  Typography,
  Card,
  Space,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  LoginOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout";
import {
  loginContainer,
  loginWrapper,
  logoSection,
  loginForm,
  title,
  toggleGroup,
  inputField,
  rememberGroup,
  loginBtn,
} from "./login.style";

const { Title } = Typography;

const Login = () => {
  const [useEmail, setUseEmail] = useState(false);

  const onFinish = (values) => {
    // TODO: Implement login logic here
    const loginId = useEmail ? values.email : values.employeeCode;
    console.log("Thông tin đăng nhập:", {
      loaiDangNhap: useEmail ? "Email" : "Mã nhân viên",
      taiKhoan: loginId,
      matKhau: values.password,
      ghinhoMatKhau: values.remember,
    });
  };

  return (
    <Layout>
      <div css={loginContainer}>
        <div css={loginWrapper}>
          {/* Logo Section */}
          <div css={logoSection}>
            <div className="logo-content">
              <div className="factory-icon">🏭</div>
              <div className="company-title">FITS-KIP</div>
              <div className="company-subtitle">
                Hệ thống quản lý bảo trì nhà máy hiện đại
                <br />
                Giải pháp toàn diện cho doanh nghiệp
              </div>
            </div>
          </div>

          {/* Login Form Section */}
          <div css={loginForm}>
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
            >
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <Space direction="vertical" size="small">
                  <SafetyOutlined
                    style={{ fontSize: "36px", color: "#334766" }}
                  />
                  <Title level={2} css={title}>
                    Đăng nhập hệ thống
                  </Title>
                  <Typography.Text
                    style={{ color: "#64748b", fontSize: "14px" }}
                  >
                    Vui lòng đăng nhập để tiếp tục
                  </Typography.Text>
                </Space>
              </div>
              <div css={toggleGroup}>
                <Radio.Group
                  value={useEmail ? "email" : "employeeCode"}
                  onChange={(e) => setUseEmail(e.target.value === "email")}
                  style={{ width: "100%" }}
                >
                  <Radio value="employeeCode">Mã nhân viên</Radio>
                  <Radio value="email">Email</Radio>
                </Radio.Group>
              </div>
              {!useEmail ? (
                <Form.Item
                  name="employeeCode"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã nhân viên!" },
                  ]}
                  css={inputField}
                  label="Mã nhân viên"
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập mã nhân viên (VD: ADM001)"
                    size="large"
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                  css={inputField}
                  label="Email"
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Nhập email công ty"
                    size="large"
                  />
                </Form.Item>
              )}
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                css={inputField}
                label="Mật khẩu"
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                />
              </Form.Item>
              <Form.Item css={rememberGroup}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
              </Form.Item>
              <Form.Item style={{ marginBottom: "0" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  css={loginBtn}
                  size="large"
                  icon={<LoginOutlined />}
                  style={{
                    width: "100%",
                    height: "44px",
                    fontSize: "15px",
                    fontWeight: "600",
                    background: "#334766",
                    borderColor: "#334766",
                  }}
                >
                  Đăng nhập vào hệ thống
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
