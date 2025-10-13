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
  const { login, isAuthenticated, user, isAdmin, isTeamLeader, isLoggingOut } =
    useAuth();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    // Check if redirected due to inactive account
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("inactive") === "true") {
      message.error(
        "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ."
      );
      // Clean up URL
      window.history.replaceState({}, "", "/login");
    }
  }, []);

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

      const isUserTeamLeader =
        user.roles &&
        (user.roles.includes("Tổ trưởng") || user.roles.includes("TOTRUONG"));

      const isUserTechnicianManager =
        user.roles &&
        (user.roles.includes("Quản lý kỹ thuật") ||
          user.roles.includes("QUẢN LÝ KỸ THUẬT") ||
          user.roles.includes("QUANLYKYTHUAT"));

      const isUserTechnician =
        user.roles &&
        (user.roles.includes("Kỹ thuật viên") ||
          user.roles.includes("KỸ THUẬT VIÊN") ||
          user.roles.includes("KYTHUATVIEN"));

      console.log("Is admin:", isUserAdmin);
      console.log("Is team leader:", isUserTeamLeader);
      console.log("Is technician manager:", isUserTechnicianManager);
      console.log("Is technician:", isUserTechnician);

      if (isUserAdmin) {
        console.log("Redirecting to admin page");
        navigate("/admin");
      } else if (isUserTeamLeader) {
        console.log("Redirecting to team leader page");
        navigate("/team-leader");
      } else if (isUserTechnicianManager) {
        console.log("Redirecting to technician manager page");
        navigate("/technician-manager");
      } else if (isUserTechnician) {
        console.log("Redirecting to technician page");
        navigate("/technician");
      } else {
        console.log("Redirecting to default page");
        navigate("/technician");
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

      // Redirect based on user role
      console.log(
        "Login successful, checking user roles:",
        response.user?.roles
      );

      const isUserAdmin =
        response.user?.roles &&
        (response.user.roles.includes("Quản trị viên") ||
          response.user.roles.includes("QUANTRI"));

      const isUserTeamLeader =
        response.user?.roles &&
        (response.user.roles.includes("Tổ trưởng") ||
          response.user.roles.includes("TOTRUONG"));

      const isUserTechnicianManager =
        response.user?.roles &&
        (response.user.roles.includes("Quản lý kỹ thuật") ||
          response.user.roles.includes("QUẢN LÝ KỸ THUẬT") ||
          response.user.roles.includes("QUANLYKYTHUAT"));

      const isUserTechnician =
        response.user?.roles &&
        (response.user.roles.includes("Kỹ thuật viên") ||
          response.user.roles.includes("KỸ THUẬT VIÊN") ||
          response.user.roles.includes("KYTHUATVIEN"));

      if (isUserAdmin) {
        console.log("Redirecting to admin page");
        navigate("/admin");
      } else if (isUserTeamLeader) {
        console.log("Redirecting to team leader page");
        navigate("/team-leader");
      } else if (isUserTechnicianManager) {
        console.log("Redirecting to technician manager page");
        navigate("/technician-manager");
      } else if (isUserTechnician) {
        console.log("Redirecting to technician page");
        navigate("/technician");
      } else {
        console.log("Redirecting to default page");
        navigate("/technician");
      }
    } catch (error) {
      // Check if error is due to inactive account
      const errorMessage = error.message || "";

      if (
        errorMessage.includes("vô hiệu hóa") ||
        errorMessage.includes("inactive")
      ) {
        // Show specific message for inactive account
        setLoginError(
          "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ."
        );
      } else {
        // Determine if user entered email or employee code
        const isEmail = isEmailFormat(values.loginId);

        // Set specific error message based on input type
        if (isEmail) {
          setLoginError("Email hoặc mật khẩu không đúng!");
        } else {
          setLoginError("Mã nhân viên hoặc mật khẩu không đúng!");
        }
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
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
                className={styles.loginFormItem}
                label="Mật khẩu"
                // Let Form display validation errors (required/min) normally.
                // Only display server-side loginError in help when it exists.
                validateStatus={loginError ? "error" : undefined}
                help={loginError || undefined}
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
                    onClick={() => navigate("/forgot-password")}
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
