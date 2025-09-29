import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Steps,
  Typography,
  Space,
  Result,
  Alert,
} from "antd";
import {
  MailOutlined,
  SafetyOutlined,
  LockOutlined,
  CheckCircleOutlined,
  KeyOutlined,
  PhoneOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import ForgotPassword from "./ForgotPassword";
import "../../styles/pages/ForgotPassword.css";
import "../../styles/pages/ResetPassword.css";

const { Title, Text } = Typography;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [resetContact, setResetContact] = useState("");
  const [contactType, setContactType] = useState("email"); // "email" or "phone"
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [form] = Form.useForm();

  // Step 1: Handle request reset from ForgotPassword component
  const handleRequestReset = (contact, type) => {
    setResetContact(contact);
    setContactType(type);
    setCurrentStep(1);
  };

  // Handle OTP verification
  const handleOtpVerification = async (otp) => {
    setLoading(true);
    try {
      // TODO: API call to verify OTP
      console.log("Verifying OTP:", otp);

      // Simulate API delay
      setTimeout(() => {
        setOtpVerified(true);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (e) => {
    const value = e.target.value;
    setOtpValue(value);

    // Auto-verify when 6 digits are entered
    if (value.length === 6) {
      handleOtpVerification(value);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ForgotPassword onRequestReset={handleRequestReset} />;

      case 1:
        return (
          <Form
            form={form}
            name="resetPassword"
            onFinish={handleResetPassword}
            layout="vertical"
            autoComplete="off"
          >
            <div className="auth-header">
              <Space direction="vertical" size="small">
                <SafetyOutlined className="reset-password-icon" />
                <Title level={2} className="reset-password-title">
                  {!otpVerified ? "Nhập mã OTP" : "Đặt mật khẩu mới"}
                </Title>
                <Text className="reset-password-description">
                  {!otpVerified ? (
                    <>
                      Mã OTP đã được gửi tới <strong>{resetContact}</strong>
                      <br />
                      qua {contactType === "email" ? "Email" : "SMS"}. Nhập mã
                      OTP để xác thực.
                    </>
                  ) : (
                    "Mã OTP đã được xác thực. Vui lòng đặt mật khẩu mới."
                  )}
                </Text>
              </Space>
            </div>

            {!otpVerified && (
              <Alert
                message={
                  <span>
                    <InfoCircleOutlined className="reset-password-alert-icon" />
                    Kiểm tra{" "}
                    {contactType === "email" ? "hộp thư" : "tin nhắn SMS"}
                  </span>
                }
                description={
                  contactType === "email"
                    ? "Mã OTP có thể nằm trong thư mục spam/junk. Mã có hiệu lực trong 5 phút."
                    : "Mã OTP 6 số đã được gửi đến số điện thoại của bạn. Mã có hiệu lực trong 5 phút."
                }
                type="warning"
                className={`alert-with-animation ${
                  otpVerified ? "alert-fade-out" : ""
                }`}
              />
            )}

            {/* OTP Section - Initially visible, hidden after verification */}
            <div
              className={`otp-container ${
                otpVerified ? "otp-container-hidden" : "otp-container-visible"
              }`}
            >
              <Form.Item
                name="token"
                label="Mã OTP (6 số)"
                rules={[
                  { required: !otpVerified, message: "Vui lòng nhập mã OTP!" },
                  {
                    pattern: /^[0-9]{6}$/,
                    message: "Mã OTP phải là 6 chữ số!",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập mã OTP 6 số"
                  size="large"
                  maxLength={6}
                  value={otpValue}
                  onChange={handleOtpChange}
                  loading={loading}
                  className={`otp-input ${
                    otpVerified
                      ? "otp-input-verified"
                      : loading
                      ? "otp-input-loading"
                      : "otp-input-default"
                  }`}
                  suffix={
                    otpVerified ? (
                      <CheckCircleOutlined className="reset-password-otp-verified-icon" />
                    ) : null
                  }
                />
              </Form.Item>
            </div>

            {/* Password Fields - Hidden initially, slide up after OTP verification */}
            <div
              className={`password-fields-container ${
                otpVerified
                  ? "password-fields-visible"
                  : "password-fields-hidden"
              }`}
            >
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  {
                    required: otpVerified,
                    message: "Vui lòng nhập mật khẩu mới!",
                  },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
                className={`password-field-item ${
                  otpVerified
                    ? "password-field-visible"
                    : "password-field-hidden"
                } reset-password-form-item-spacing`}
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
                  {
                    required: otpVerified,
                    message: "Vui lòng xác nhận mật khẩu!",
                  },
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
                className={`password-field-item ${
                  otpVerified
                    ? "password-field-visible"
                    : "password-field-hidden"
                } reset-password-form-item-large-spacing`}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu mới"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                className={`password-field-item ${
                  otpVerified ? "submit-button-visible" : "submit-button-hidden"
                } reset-password-form-item-small-spacing`}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="auth-button"
                  icon={<CheckCircleOutlined />}
                >
                  Đặt lại mật khẩu
                </Button>
              </Form.Item>
            </div>

            <div
              className={`navigation-buttons ${
                otpVerified ? "alert-fade-out" : ""
              }`}
            >
              {!otpVerified && (
                <Space>
                  <Button
                    type="link"
                    onClick={() => {
                      setCurrentStep(0);
                      setOtpVerified(false);
                      setOtpValue("");
                      form.resetFields();
                    }}
                    className="reset-password-nav-button"
                  >
                    Gửi lại mã OTP
                  </Button>
                  <span className="reset-password-nav-separator">|</span>
                  <Button
                    type="link"
                    onClick={() => {
                      setCurrentStep(0);
                      setOtpVerified(false);
                      setOtpValue("");
                      form.resetFields();
                    }}
                    className="reset-password-nav-button"
                  >
                    Thay đổi phương thức
                  </Button>
                </Space>
              )}
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
                className="auth-button"
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
      <div className="auth-container">
        <div className="auth-wrapper">
          {/* Logo Section */}
          <div className="auth-logo-section">
            <div className="auth-logo-content">
              <div className="logo-emoji">🔐</div>
              <div className="logo-title">Khôi phục tài khoản</div>
              <div className="logo-subtitle">
                Hệ thống bảo mật FITS-KIP
                <br />
                Đặt lại mật khẩu an toàn và bảo mật
              </div>

              {/* Security features */}
              <div className="security-features">
                <div className="security-feature-item">
                  ✓ Mã OTP được gửi qua Email/SMS
                </div>
                <div className="security-feature-item">
                  ✓ Mã OTP có hiệu lực trong 5 phút
                </div>
                <div className="security-feature-item">
                  ✓ Xác thực 2 lớp an toàn
                </div>
                <div className="security-feature-item">
                  ✓ Mật khẩu được mã hóa bảo mật
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="auth-form-section">
            <div className="auth-steps">
              <Steps
                current={currentStep}
                direction="horizontal"
                size="default"
                className="auth-steps-config"
                items={[
                  {
                    title: <div className="step-title">Chọn phương thức</div>,
                    description: (
                      <div className="step-description">Email hoặc SMS</div>
                    ),
                    icon: <KeyOutlined className="step-icon" />,
                  },
                  {
                    title: <div className="step-title">Nhập mã OTP</div>,
                    description: (
                      <div className="step-description">Và mật khẩu mới</div>
                    ),
                    icon: <SafetyOutlined className="step-icon" />,
                  },
                  {
                    title: <div className="step-title">Hoàn thành</div>,
                    description: (
                      <div className="step-description">Thành công</div>
                    ),
                    icon: <CheckCircleOutlined className="step-icon" />,
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
