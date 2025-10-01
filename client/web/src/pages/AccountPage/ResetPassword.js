import React, { useState, useEffect, useRef } from "react";
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
import styles from "../../styles/pages/ForgotPassword.module.css";
import resetStyles from "../../styles/pages/ResetPassword.module.css";

const { Title, Text } = Typography;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [resetContact, setResetContact] = useState("");
  const [contactType, setContactType] = useState("email"); // "email" or "phone"
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  // For 6-digit OTP input boxes
  const otpInputs = Array(6).fill(0);
  const otpRefs = Array.from({ length: 6 }, () => useRef());
  const [form] = Form.useForm();
  // Timer state for OTP countdown
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds
  const timerRef = useRef(null);

  // Step 1: Handle request reset from ForgotPassword component
  const handleRequestReset = (contact, type) => {
    setResetContact(contact);
    setContactType(type);
    setCurrentStep(1);
    setOtpTimer(300); // Reset timer to 5 minutes
  };
  // Start/clear timer when entering OTP step
  useEffect(() => {
    if (currentStep === 1 && !otpVerified) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStep, otpVerified]);

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

  // Handle OTP input change for each box
  const handleOtpBoxChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;
    let newOtp = otpValue.split("");
    newOtp[idx] = val[val.length - 1]; // Only last digit
    // Fill empty for others
    newOtp = Array(6).fill("").map((_, i) => newOtp[i] || "");
    setOtpValue(newOtp.join(""));
    // Move focus to next
    if (idx < 5 && val) {
      otpRefs[idx + 1].current && otpRefs[idx + 1].current.focus();
    }
    // Auto-verify when 6 digits are entered
    if (newOtp.join("").length === 6) {
      handleOtpVerification(newOtp.join(""));
    }
  };

  // Handle backspace for OTP boxes
  const handleOtpBoxKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      let newOtp = otpValue.split("");
      if (newOtp[idx]) {
        newOtp[idx] = "";
        setOtpValue(newOtp.join(""));
      } else if (idx > 0) {
        otpRefs[idx - 1].current && otpRefs[idx - 1].current.focus();
        let prevOtp = otpValue.split("");
        prevOtp[idx - 1] = "";
        setOtpValue(prevOtp.join(""));
      }
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
            <div className={styles.authHeader}>
              <Space direction="vertical" size="small">
                <SafetyOutlined className={resetStyles.resetPasswordIcon} />
                <Title level={2} className={resetStyles.resetPasswordTitle}>
                  {!otpVerified ? "Nhập mã OTP" : "Đặt mật khẩu mới"}
                </Title>
                <Text className={resetStyles.resetPasswordDescription}>
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
              <>
                <Alert
                  message={
                    <span>
                      <InfoCircleOutlined className={resetStyles.resetPasswordAlertIcon} />
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
                  className={`${resetStyles.alertWithAnimation} ${
                    otpVerified ? resetStyles.alertFadeOut : ""
                  }`}
                />
                {/* Countdown Timer UI */}
                <div style={{ marginTop: 12, textAlign: "center", fontWeight: 500, color: "#d97706", fontSize: 16 }}>
                  Thời gian còn lại để nhập mã OTP: {`${String(Math.floor(otpTimer / 60)).padStart(2, "0")}:${String(otpTimer % 60).padStart(2, "0")}`}
                </div>
              </>
            )}

            {/* OTP Section - Initially visible, hidden after verification */}
            <div
              className={`${resetStyles.otpContainer} ${
                otpVerified ? resetStyles.otpContainerHidden : resetStyles.otpContainerVisible
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
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
                  {otpInputs.map((_, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otpValue[idx] || ""}
                      onChange={e => handleOtpBoxChange(e, idx)}
                      onKeyDown={e => handleOtpBoxKeyDown(e, idx)}
                      disabled={otpVerified || loading}
                      style={{
                        width: 40,
                        height: 48,
                        fontSize: 24,
                        textAlign: "center",
                        border: otpVerified ? "2px solid #52c41a" : "1.5px solid #bdbdbd",
                        borderRadius: 8,
                        background: otpVerified ? "#f0fff4" : "#fff",
                        outline: "none",
                        transition: "border 0.2s, background 0.2s",
                        boxShadow: loading ? "0 0 0 2px #fde68a" : undefined,
                        color: otpVerified ? "#16a34a" : "#1f2937",
                        caretColor: "#334766",
                      }}
                      autoFocus={idx === 0}
                    />
                  ))}
                  {otpVerified && (
                    <CheckCircleOutlined style={{ color: "#16a34a", fontSize: 28, marginLeft: 8, alignSelf: "center" }} />
                  )}
                </div>
              </Form.Item>
            </div>

            {/* Password Fields - Hidden initially, slide up after OTP verification */}
            <div
              className={`${resetStyles.passwordFieldsContainer} ${
                otpVerified
                  ? resetStyles.passwordFieldsVisible
                  : resetStyles.passwordFieldsHidden
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
                className={`${resetStyles.passwordFieldItem} ${
                  otpVerified
                    ? resetStyles.passwordFieldVisible
                    : resetStyles.passwordFieldHidden
                } ${resetStyles.resetPasswordFormItemSmallSpacing}`}
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
                className={`${resetStyles.passwordFieldItem} ${
                  otpVerified
                    ? resetStyles.passwordFieldVisible
                    : resetStyles.passwordFieldHidden
                } ${resetStyles.resetPasswordFormItemLargeSpacing}`}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu mới"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                className={`${resetStyles.passwordFieldItem} ${
                  otpVerified ? resetStyles.submitButtonVisible : resetStyles.submitButtonHidden
                } ${resetStyles.resetPasswordFormItemSmallSpacing}`}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className={styles.authButton}
                  icon={<CheckCircleOutlined />}
                >
                  Đặt lại mật khẩu
                </Button>
              </Form.Item>
            </div>

            <div
              className={`${resetStyles.navigationButtons} ${
                otpVerified ? resetStyles.alertFadeOut : ""
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
                    className={resetStyles.resetPasswordNavButton}
                  >
                    Gửi lại mã OTP
                  </Button>
                  <span className={resetStyles.resetPasswordNavSeparator}>|</span>
                  <Button
                    type="link"
                    onClick={() => {
                      setCurrentStep(0);
                      setOtpVerified(false);
                      setOtpValue("");
                      form.resetFields();
                    }}
                    className={resetStyles.resetPasswordNavButton}
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
                className={styles.authButton}
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
      <div className={styles.authContainer}>
        <div className={styles.authWrapper}>
          {/* Logo Section */}
          <div className={styles.authLogoSection}>
            <div className={styles.authLogoContent}>
              <div className={styles.logoEmoji}>🔐</div>
              <div className={styles.logoTitle}>Khôi phục tài khoản</div>
              <div className={styles.logoSubtitle}>
                Hệ thống bảo mật FITS-KIP
                <br />
                Đặt lại mật khẩu an toàn và bảo mật
              </div>

              {/* Security features */}
              <div className={styles.securityFeatures}>
                <div className={styles.securityFeatureItem}>
                  ✓ Mã OTP được gửi qua Email/SMS
                </div>
                <div className={styles.securityFeatureItem}>
                  ✓ Mã OTP có hiệu lực trong 5 phút
                </div>
                <div className={styles.securityFeatureItem}>
                  ✓ Xác thực 2 lớp an toàn
                </div>
                <div className={styles.securityFeatureItem}>
                  ✓ Mật khẩu được mã hóa bảo mật
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className={styles.authFormSection}>
            <div className={styles.authSteps}>
              <Steps
                current={currentStep}
                direction="horizontal"
                size="default"
                className={styles.authStepsConfig}
                items={[
                  {
                    title: <div className={styles.stepTitle}>Chọn phương thức</div>,
                    description: (
                      <div className={styles.stepDescription}>Email hoặc SMS</div>
                    ),
                    icon: <KeyOutlined className={styles.stepIcon} />,
                  },
                  {
                    title: <div className={styles.stepTitle}>Nhập mã OTP</div>,
                    description: (
                      <div className={styles.stepDescription}>Và mật khẩu mới</div>
                    ),
                    icon: <SafetyOutlined className={styles.stepIcon} />,
                  },
                  {
                    title: <div className={styles.stepTitle}>Hoàn thành</div>,
                    description: (
                      <div className={styles.stepDescription}>Thành công</div>
                    ),
                    icon: <CheckCircleOutlined className={styles.stepIcon} />,
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
