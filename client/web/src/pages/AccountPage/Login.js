import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Space,
  message,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/pages/Login.css";

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, isAdmin, isLoggingOut } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Don't auto-redirect if currently logging out
    if (isLoggingOut) {
      console.log("Logout in progress, skipping auto-redirect");
      return;
    }

    // Only redirect if both isAuthenticated is true AND user data exists with roles
    // This prevents redirect during logout process when isAuthenticated becomes false
    if (isAuthenticated && user && user.roles) {
      console.log("Auto-redirecting authenticated user...");
      console.log("Checking roles for redirect:", user.roles);
      const isUserAdmin =
        user.roles &&
        (user.roles.includes("Quản trị viên") ||
          user.roles.includes("QUANTRI"));
      console.log("Is admin:", isUserAdmin);

      if (isUserAdmin) {
        console.log("Redirecting to admin page");
        navigate("/admin");
      } else {
        console.log("Redirecting to admin");
        navigate("/admin");
      }
    }
  }, [isAuthenticated, user, navigate, isLoggingOut]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const loginId = values.loginId; // Nhận cả email hoặc mã nhân viên
      const response = await login(loginId, values.password, values.remember);

      message.success("Đăng nhập thành công!");

      // Redirect all authenticated users to admin
      console.log("Redirecting to admin page for all users");
      navigate("/admin");
    } catch (error) {
      message.error(error.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="login-container">
        <div className="login-wrapper">
          {/* Logo Section */}
          <div className="login-logo-section">
            <div className="login-logo-content">
              <div className="login-factory-icon">🏭</div>
              <div className="login-company-title">FITS-KIP</div>
              <div className="login-company-subtitle">
                Hệ thống quản lý bảo trì nhà máy hiện đại
                <br />
                Giải pháp toàn diện cho doanh nghiệp
              </div>
            </div>
          </div>

          {/* Login Form Section */}
          <div className="login-form-section">
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
            >
              <div className="login-form-header">
                <Space direction="vertical" size="small">
                  <SafetyOutlined className="login-header-icon" />
                  <Title level={2} className="login-title">
                    Đăng nhập hệ thống
                  </Title>
                  <Typography.Text className="login-header-subtitle">
                    Vui lòng đăng nhập để tiếp tục
                  </Typography.Text>
                </Space>
              </div>

              <Form.Item
                name="loginId"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email hoặc mã nhân viên!",
                  },
                ]}
                className="login-form-item"
                label="Email hoặc Mã nhân viên"
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập email hoặc mã nhân viên (VD: admin@company.com hoặc ADM001)"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                className="login-form-item"
                label="Mật khẩu"
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                />
              </Form.Item>

              <Form.Item className="login-form-item-checkbox">
                <div className="login-remember-row">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                  </Form.Item>
                  <Button
                    type="link"
                    onClick={() => navigate("/reset-password")}
                    className="login-forgot-link"
                  >
                    Quên mật khẩu?
                  </Button>
                </div>
              </Form.Item>

              <Form.Item className="login-form-item-submit">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={!loading && <LoginOutlined />}
                  className="login-submit-button"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập vào hệ thống"}
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
