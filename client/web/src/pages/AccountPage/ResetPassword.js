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
import { styles } from "./forgotPassword.styles";
import { resetPasswordStyles } from "./resetPassword.styles";

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
        return (
          <ForgotPassword onRequestReset={handleRequestReset} />
        );

      case 1:
        return (
          <Form
            form={form}
            name="resetPassword"
            onFinish={handleResetPassword}
            layout="vertical"
            autoComplete="off"
          >
            <div style={styles.headerStyle}>
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
                  {!otpVerified ? "Nhập mã OTP" : "Đặt mật khẩu mới"}
                </Title>
                <Text style={{ color: "#64748b", fontSize: "14px" }}>
                  {!otpVerified ? (
                    <>
                      Mã OTP đã được gửi tới <strong>{resetContact}</strong>
                      <br />
                      qua {contactType === "email" ? "Email" : "SMS"}. Nhập mã OTP để xác thực.
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
                    <InfoCircleOutlined style={{ marginRight: "8px" }} />
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
                style={{
                  ...resetPasswordStyles.alertWithAnimation,
                  ...(otpVerified ? resetPasswordStyles.alertFadeOut : {}),
                }}
              />
            )}

            {/* OTP Section - Initially visible, hidden after verification */}
            <div 
              style={{
                ...resetPasswordStyles.otpContainer,
                ...(otpVerified 
                  ? resetPasswordStyles.otpContainerHidden 
                  : resetPasswordStyles.otpContainerVisible
                )
              }}
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
                  style={{
                    ...styles.otpInputStyle,
                    ...(otpVerified 
                      ? resetPasswordStyles.otpInputVerified
                      : loading 
                      ? resetPasswordStyles.otpInputLoading 
                      : resetPasswordStyles.otpInputDefault
                    ),
                  }}
                  suffix={
                    otpVerified ? (
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    ) : null
                  }
                />
              </Form.Item>
            </div>

            {/* Password Fields - Hidden initially, slide up after OTP verification */}
            <div 
              style={{
                ...resetPasswordStyles.passwordFieldsContainer,
                ...(otpVerified 
                  ? resetPasswordStyles.passwordFieldsVisible 
                  : resetPasswordStyles.passwordFieldsHidden
                )
              }}
            >
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: otpVerified, message: "Vui lòng nhập mật khẩu mới!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
                style={{
                  ...resetPasswordStyles.passwordFieldItem(0),
                  ...(otpVerified 
                    ? resetPasswordStyles.passwordFieldVisible(0)
                    : resetPasswordStyles.passwordFieldHidden(0)
                  ),
                  marginBottom: "20px",
                }}
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
                  { required: otpVerified, message: "Vui lòng xác nhận mật khẩu!" },
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
                style={{
                  ...resetPasswordStyles.passwordFieldItem(1),
                  ...(otpVerified 
                    ? resetPasswordStyles.passwordFieldVisible(1)
                    : resetPasswordStyles.passwordFieldHidden(1)
                  ),
                  marginBottom: "24px",
                }}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu mới"
                  size="large"
                />
              </Form.Item>

              <Form.Item 
                style={{
                  ...resetPasswordStyles.passwordFieldItem(2),
                  ...(otpVerified 
                    ? resetPasswordStyles.submitButtonVisible
                    : resetPasswordStyles.submitButtonHidden
                  ),
                  marginBottom: "16px",
                }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={styles.buttonStyle}
                  icon={<CheckCircleOutlined />}
                >
                  Đặt lại mật khẩu
                </Button>
              </Form.Item>
            </div>

            <div 
              style={{
                ...resetPasswordStyles.navigationButtons,
                ...(otpVerified ? resetPasswordStyles.alertFadeOut : {})
              }}
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
                    style={{ color: "#64748b" }}
                  >
                    Gửi lại mã OTP
                  </Button>
                  <span style={{ color: "#e5e7eb" }}>|</span>
                  <Button
                    type="link"
                    onClick={() => {
                      setCurrentStep(0);
                      setOtpVerified(false);
                      setOtpValue("");
                      form.resetFields();
                    }}
                    style={{ color: "#64748b" }}
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
                style={styles.buttonStyle}
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
      <div style={styles.containerStyle}>
        <div style={styles.wrapperStyle}>
          {/* Logo Section */}
          <div style={styles.logoSectionStyle}>
            <div style={styles.logoContentStyle}>
              <div style={styles.logoEmojiStyle}>
                🔐
              </div>
              <div style={styles.logoTitleStyle}>
                Khôi phục tài khoản
              </div>
              <div style={styles.logoSubtitleStyle}>
                Hệ thống bảo mật FITS-KIP
                <br />
                Đặt lại mật khẩu an toàn và bảo mật
              </div>

              {/* Security features */}
              <div style={styles.securityFeaturesStyle}>
                <div style={styles.securityFeatureItemStyle}>
                  ✓ Mã OTP được gửi qua Email/SMS
                </div>
                <div style={styles.securityFeatureItemStyle}>
                  ✓ Mã OTP có hiệu lực trong 5 phút
                </div>
                <div style={styles.securityFeatureItemStyle}>
                  ✓ Xác thực 2 lớp an toàn
                </div>
                <div style={styles.securityFeatureItemStyle}>
                  ✓ Mật khẩu được mã hóa bảo mật
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div style={styles.formSectionStyle}>
            <div style={styles.stepsStyle}>
              <Steps
                current={currentStep}
                direction="horizontal"
                size="default"
                style={styles.stepsConfig}
                items={[
                  {
                    title: (
                      <div style={styles.stepTitleStyle}>
                        Chọn phương thức
                      </div>
                    ),
                    description: (
                      <div style={styles.stepDescriptionStyle}>
                        Email hoặc SMS
                      </div>
                    ),
                    icon: <KeyOutlined style={styles.stepIconStyle} />,
                  },
                  {
                    title: (
                      <div style={styles.stepTitleStyle}>
                        Nhập mã OTP
                      </div>
                    ),
                    description: (
                      <div style={styles.stepDescriptionStyle}>
                        Và mật khẩu mới
                      </div>
                    ),
                    icon: <SafetyOutlined style={styles.stepIconStyle} />,
                  },
                  {
                    title: (
                      <div style={styles.stepTitleStyle}>
                        Hoàn thành
                      </div>
                    ),
                    description: (
                      <div style={styles.stepDescriptionStyle}>
                        Thành công
                      </div>
                    ),
                    icon: <CheckCircleOutlined style={styles.stepIconStyle} />,
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
