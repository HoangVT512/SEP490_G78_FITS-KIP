import React, { useState } from "react";
import { Form, Input, Button, Steps, Typography, Space, Result } from "antd";
import {
  MailOutlined,
  SafetyOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

const { Title, Text } = Typography;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Step 1: Request reset token
  const handleRequestReset = async (values) => {
    setLoading(true);
    try {
      // TODO: API call to request password reset
      console.log("Requesting reset for:", values.email);
      setResetEmail(values.email);

      // Simulate API delay
      setTimeout(() => {
        setCurrentStep(1);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error requesting reset:", error);
      setLoading(false);
    }
  };

  // Step 2: Verify token and set new password
  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      // TODO: API call to reset password with token
      console.log("Resetting password with:", values);

      // Simulate API delay
      setTimeout(() => {
        setCurrentStep(2);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setLoading(false);
    }
  };

  // Inline styles to maintain consistency
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 70px)",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  };

  const wrapperStyle = {
    display: "flex",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(37, 99, 235, 0.15)",
    width: "100%",
    maxWidth: "1100px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    minHeight: "650px",
  };

  const logoSectionStyle = {
    flex: "1",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    color: "#fff",
    minWidth: "350px",
  };

  const logoContentStyle = {
    textAlign: "center",
  };

  const formSectionStyle = {
    flex: "1.5",
    padding: "40px 50px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minWidth: "550px",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "32px",
  };

  const stepsStyle = {
    marginBottom: "50px",
    padding: "10px 30px",
  };

  const backButtonStyle = {
    marginBottom: "24px",
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            form={form}
            name="requestReset"
            onFinish={handleRequestReset}
            layout="vertical"
            autoComplete="off"
          >
            <div style={headerStyle}>
              <Space direction="vertical" size="small">
                <KeyOutlined style={{ fontSize: "36px", color: "#2563eb" }} />
                <Title
                  level={2}
                  style={{
                    marginBottom: "8px",
                    color: "#262626",
                    fontSize: "22px",
                  }}
                >
                  Quên mật khẩu
                </Title>
                <Text style={{ color: "#64748b", fontSize: "14px" }}>
                  Nhập email để nhận liên kết đặt lại mật khẩu
                </Text>
              </Space>
            </div>

            <Form.Item
              name="email"
              label="Email công ty"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
              style={{ marginBottom: "20px" }}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email đã đăng ký trong hệ thống"
                size="large"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: "16px" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={buttonStyle}
                icon={<MailOutlined />}
              >
                Gửi liên kết đặt lại mật khẩu
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <Button
                type="link"
                onClick={() => navigate("/login")}
                style={{ color: "#2563eb" }}
                icon={<ArrowLeftOutlined />}
              >
                Quay lại đăng nhập
              </Button>
            </div>
          </Form>
        );

      case 1:
        return (
          <Form
            name="resetPassword"
            onFinish={handleResetPassword}
            layout="vertical"
            autoComplete="off"
          >
            <div style={headerStyle}>
              <Space direction="vertical" size="small">
                <SafetyOutlined
                  style={{ fontSize: "36px", color: "#059669" }}
                />
                <Title
                  level={2}
                  style={{
                    marginBottom: "8px",
                    color: "#262626",
                    fontSize: "22px",
                  }}
                >
                  Đặt lại mật khẩu
                </Title>
                <Text style={{ color: "#64748b", fontSize: "14px" }}>
                  Email đã được gửi tới <strong>{resetEmail}</strong>
                  <br />
                  Nhập mã xác thực và mật khẩu mới
                </Text>
              </Space>
            </div>

            <Form.Item
              name="token"
              label="Mã xác thực"
              rules={[
                { required: true, message: "Vui lòng nhập mã xác thực!" },
                { len: 6, message: "Mã xác thực phải có 6 ký tự!" },
              ]}
              style={{ marginBottom: "20px" }}
            >
              <Input
                placeholder="Nhập mã 6 ký tự từ email"
                size="large"
                maxLength={6}
                style={{
                  textAlign: "center",
                  fontSize: "18px",
                  letterSpacing: "4px",
                }}
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
              style={{ marginBottom: "20px" }}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
              style={{ marginBottom: "24px" }}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu mới"
                size="large"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: "16px" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={buttonStyle}
                icon={<CheckCircleOutlined />}
              >
                Đặt lại mật khẩu
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <Button
                type="link"
                onClick={() => setCurrentStep(0)}
                style={{ color: "#64748b" }}
              >
                Gửi lại mã xác thực
              </Button>
            </div>
          </Form>
        );

      case 2:
        return (
          <Result
            status="success"
            title="Đặt lại mật khẩu thành công!"
            subTitle="Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới."
            extra={[
              <Button
                type="primary"
                key="login"
                onClick={() => navigate("/login")}
                style={buttonStyle}
              >
                Đăng nhập ngay
              </Button>,
            ]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div style={containerStyle}>
        <div style={wrapperStyle}>
          {/* Logo Section */}
          <div style={logoSectionStyle}>
            <div style={logoContentStyle}>
              <div
                style={{
                  fontSize: "64px",
                  marginBottom: "20px",
                  color: "#fff",
                }}
              >
                🔐
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  marginBottom: "12px",
                  color: "#fff",
                }}
              >
                Khôi phục tài khoản
              </div>
              <div
                style={{
                  fontSize: "15px",
                  color: "rgba(255, 255, 255, 0.9)",
                  lineHeight: "1.5",
                }}
              >
                Hệ thống bảo mật FITS-KIP
                <br />
                Đặt lại mật khẩu an toàn và bảo mật
              </div>

              {/* Security features */}
              <div style={{ marginTop: "40px", textAlign: "left" }}>
                <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                  ✓ Mã xác thực được gửi qua email
                </div>
                <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                  ✓ Liên kết có hiệu lực trong 15 phút
                </div>
                <div style={{ fontSize: "14px" }}>
                  ✓ Mật khẩu được mã hóa an toàn
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div style={formSectionStyle}>
            <div style={stepsStyle}>
              <Steps
                current={currentStep}
                direction="horizontal"
                size="default"
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
                items={[
                  {
                    title: (
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          whiteSpace: "normal",
                          overflow: "visible",
                          textAlign: "center",
                          minHeight: "20px",
                        }}
                      >
                        Nhập email
                      </div>
                    ),
                    description: (
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#6b7280",
                          lineHeight: "1.3",
                          marginTop: "6px",
                          textAlign: "center",
                          minHeight: "18px",
                        }}
                      >
                        Gửi mã xác thực
                      </div>
                    ),
                    icon: <MailOutlined style={{ fontSize: "20px" }} />,
                  },
                  {
                    title: (
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          whiteSpace: "normal",
                          overflow: "visible",
                          textAlign: "center",
                          minHeight: "20px",
                        }}
                      >
                        Xác thực
                      </div>
                    ),
                    description: (
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#6b7280",
                          lineHeight: "1.3",
                          marginTop: "6px",
                          textAlign: "center",
                          minHeight: "18px",
                        }}
                      >
                        Đặt mật khẩu mới
                      </div>
                    ),
                    icon: <SafetyOutlined style={{ fontSize: "20px" }} />,
                  },
                  {
                    title: (
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          whiteSpace: "normal",
                          overflow: "visible",
                          textAlign: "center",
                          minHeight: "20px",
                        }}
                      >
                        Hoàn thành
                      </div>
                    ),
                    description: (
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#6b7280",
                          lineHeight: "1.3",
                          marginTop: "6px",
                          textAlign: "center",
                          minHeight: "18px",
                        }}
                      >
                        Thành công
                      </div>
                    ),
                    icon: <CheckCircleOutlined style={{ fontSize: "20px" }} />,
                  },
                ]}
              />
            </div>

            {renderStepContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
