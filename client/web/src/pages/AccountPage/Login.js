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
import styles from "../../styles/pages/Login.module.css";

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, isAdmin, isLoggingOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [form] = Form.useForm();

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

  const isEmailFormat = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const onFinish = async (values) => {
    setLoading(true);
    setLoginError(""); // Clear previous errors
    
    try {
      const loginId = values.loginId; // Nhận cả email hoặc mã nhân viên
      const response = await login(loginId, values.password, values.remember);

      message.success("Đăng nhập thành công!");

      // Redirect all authenticated users to admin
      console.log("Redirecting to admin page for all users");
      navigate("/admin");
    } catch (error) {
      // Determine if user entered email or employee code
      const isEmail = isEmailFormat(values.loginId);
      
      // Set specific error message based on input type
      if (isEmail) {
        setLoginError("Email hoặc mật khẩu không đúng!");
      } else {
        setLoginError("Mã nhân viên hoặc mật khẩu không đúng!");
      }
      
      // Don't show the general error message - only show red text under input
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.loginContainer}>
        <div className={styles.loginWrapper}>
          {/* Logo Section */}
          <div className={styles.loginLogoSection}>
            <div className={styles.loginLogoContent}>
              <div className={styles.loginFactoryIcon}>🏭</div>
              <div className={styles.loginCompanyTitle}>FITS-KIP</div>
              <div className={styles.loginCompanySubtitle}>
                Hệ thống quản lý bảo trì nhà máy hiện đại
                <br />
                Giải pháp toàn diện cho doanh nghiệp
              </div>
            </div>
          </div>

          {/* Login Form Section */}
          <div className={styles.loginFormSection}>
            <Form
              form={form}
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
            >
              <div className={styles.loginFormHeader}>
                <Space direction="vertical" size="small">
                  <SafetyOutlined className={styles.loginHeaderIcon} />
                  <Title level={2} className={styles.loginTitle}>
                    Đăng nhập hệ thống
                  </Title>
                  <Typography.Text className={styles.loginHeaderSubtitle}>
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
                className={styles.loginFormItem}
                label="Email hoặc Mã nhân viên"
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập email hoặc mã nhân viên (VD: admin@company.com hoặc ADM001)"
                  size="large"
                  onChange={() => setLoginError("")} // Clear error when user types
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                className={styles.loginFormItem}
                label="Mật khẩu"
                validateStatus={loginError ? "error" : ""}
                help={loginError}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                  onChange={() => setLoginError("")} // Clear error when user types
                />
              </Form.Item>

              <Form.Item className={styles.loginFormItemCheckbox}>
                <div className={styles.loginRememberRow}>
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                  </Form.Item>
                  <Button
                    type="link"
                    onClick={() => navigate("/reset-password")}
                    className={styles.loginForgotLink}
                  >
                    Quên mật khẩu?
                  </Button>
                </div>
              </Form.Item>

              <Form.Item className={styles.loginFormItemSubmit}>
                <Button
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={!loading && <LoginOutlined />}
                  className={styles.loginSubmitButton}
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
