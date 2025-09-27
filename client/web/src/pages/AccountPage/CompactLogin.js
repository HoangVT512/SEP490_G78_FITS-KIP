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

const { Title } = Typography;

const CompactLogin = () => {
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
        console.log("Redirecting to dashboard");
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate, isLoggingOut]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const loginId = values.loginId; // Nhận cả email hoặc mã nhân viên
      const response = await login(loginId, values.password, values.remember);

      message.success("Đăng nhập thành công!");

      // Redirect based on user role
      console.log("Checking roles for redirect:", response.user?.roles);
      const isAdmin =
        response.user.roles &&
        (response.user.roles.includes("Quản trị viên") ||
          response.user.roles.includes("QUANTRI"));
      console.log("Is admin:", isAdmin);

      if (isAdmin) {
        console.log("Redirecting to admin page");
        navigate("/admin");
      } else {
        console.log("Redirecting to dashboard");
        navigate("/dashboard");
      }
    } catch (error) {
      message.error(error.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Inline styles to bypass cache
  const loginContainerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 70px)",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  };

  const loginWrapperStyle = {
    display: "flex",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(37, 99, 235, 0.15)",
    width: "100%",
    maxWidth: "800px",
    maxHeight: "600px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  };

  const logoSectionStyle = {
    flex: "1",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "32px",
    color: "#fff",
    minWidth: "350px",
  };

  const logoContentStyle = {
    textAlign: "center",
  };

  const factoryIconStyle = {
    fontSize: "64px",
    marginBottom: "20px",
    color: "#fff",
  };

  const companyTitleStyle = {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#fff",
  };

  const companySubtitleStyle = {
    fontSize: "15px",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: "1.5",
  };

  const loginFormStyle = {
    flex: "1",
    padding: "36px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minWidth: "380px",
    maxWidth: "450px",
  };

  const formHeaderStyle = {
    textAlign: "center",
    marginBottom: "24px",
  };

  const titleStyle = {
    textAlign: "center",
    marginBottom: "24px !important",
    color: "#262626 !important",
    fontWeight: "700",
    fontSize: "22px !important",
  };

  const inputStyle = {
    marginBottom: "16px",
  };

  const buttonStyle = {
    width: "100%",
    height: "44px",
    fontSize: "15px",
    fontWeight: "600",
    background: "#2563eb",
    borderColor: "#2563eb",
    borderRadius: "8px",
  };

  return (
    <Layout>
      <div style={loginContainerStyle}>
        <div style={loginWrapperStyle}>
          {/* Logo Section */}
          <div style={logoSectionStyle}>
            <div style={logoContentStyle}>
              <div style={factoryIconStyle}>🏭</div>
              <div style={companyTitleStyle}>FITS-KIP</div>
              <div style={companySubtitleStyle}>
                Hệ thống quản lý bảo trì nhà máy hiện đại
                <br />
                Giải pháp toàn diện cho doanh nghiệp
              </div>
            </div>
          </div>

          {/* Login Form Section */}
          <div style={loginFormStyle}>
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
            >
              <div style={formHeaderStyle}>
                <Space direction="vertical" size="small">
                  <SafetyOutlined
                    style={{ fontSize: "36px", color: "#2563eb" }}
                  />
                  <Title level={2} style={titleStyle}>
                    Đăng nhập hệ thống
                  </Title>
                  <Typography.Text
                    style={{ color: "#64748b", fontSize: "14px" }}
                  >
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
                style={inputStyle}
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
                style={inputStyle}
                label="Mật khẩu"
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                  </Form.Item>
                  <Button
                    type="link"
                    onClick={() => navigate("/reset-password")}
                    style={{
                      padding: 0,
                      height: "auto",
                      color: "#2563eb",
                      fontSize: "14px",
                    }}
                  >
                    Quên mật khẩu?
                  </Button>
                </div>
              </Form.Item>

              <Form.Item style={{ marginBottom: "0" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={!loading && <LoginOutlined />}
                  style={buttonStyle}
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

export default CompactLogin;
