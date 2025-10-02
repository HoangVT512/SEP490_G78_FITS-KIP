import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Space,
  Alert,
  Card,
  Steps,
  message,
  Modal,
  Radio,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  KeyOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import authService from "../../services/authService";
import styles from "../../styles/pages/ForgotPassword.module.css";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); // 0: Choose Method & Enter Contact, 1: Enter OTP, 2: Enter New Password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpMethod, setOtpMethod] = useState("email"); // "email" or "phone"
  const [otp, setOtp] = useState("");
  const [form] = Form.useForm();

  // Step 1: Send OTP to email or phone
  const handleSendOtp = async (values) => {
    setLoading(true);
    try {
      if (otpMethod === "email") {
        await authService.sendForgotPasswordOtp(values.email);
        setEmail(values.email);
        message.success("Mã OTP đã được gửi đến email của bạn!");
      } else {
        // TODO: Implement phone OTP service
        // await authService.sendForgotPasswordOtpByPhone(values.phoneNumber);
        setPhoneNumber(values.phoneNumber);
        message.success("Mã OTP đã được gửi đến số điện thoại của bạn!");
      }
      setCurrentStep(1);
    } catch (error) {
      console.error("Error sending OTP:", error);
      message.error(
        error.message ||
          `Không thể gửi mã OTP. Vui lòng kiểm tra lại ${
            otpMethod === "email" ? "email" : "số điện thoại"
          }!`
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (values) => {
    setLoading(true);
    try {
      const contactInfo = otpMethod === "email" ? email : phoneNumber;
      await authService.verifyOtp(contactInfo, values.otp);
      setOtp(values.otp);
      message.success("Xác thực OTP thành công!");
      setCurrentStep(2);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      message.error(error.message || "Mã OTP không hợp lệ hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      const contactInfo = otpMethod === "email" ? email : phoneNumber;
      await authService.resetPasswordWithOtp(
        contactInfo,
        otp,
        values.newPassword
      );

      Modal.success({
        title: "Đặt lại mật khẩu thành công!",
        content:
          "Mật khẩu của bạn đã được đặt lại. Vui lòng đăng nhập với mật khẩu mới.",
        okText: "Đăng nhập",
        onOk: () => {
          navigate("/login");
        },
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      message.error(
        error.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      form.resetFields();
    } else {
      navigate("/login");
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Step 1: Choose Method and Enter Contact Info
        return (
          <Form
            form={form}
            name="sendOtp"
            onFinish={handleSendOtp}
            layout="vertical"
            autoComplete="off"
            initialValues={{ otpMethod: "email" }}
          >
            <Alert
              message="Chọn phương thức nhận OTP"
              description="Chúng tôi sẽ gửi mã OTP 6 số để xác thực danh tính của bạn."
              type="info"
              icon={<InfoCircleOutlined />}
              className={styles.forgotPasswordGuideAlert}
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name="otpMethod"
              label="Phương thức nhận OTP"
              className={styles.forgotPasswordMethodLabel}
            >
              <Radio.Group
                onChange={(e) => {
                  setOtpMethod(e.target.value);
                  form.resetFields(["email", "phoneNumber"]);
                }}
                className={styles.forgotPasswordMethodGroup}
              >
                <Space
                  direction="vertical"
                  className={styles.forgotPasswordMethodSpace}
                >
                  <Radio
                    value="email"
                    className={styles.forgotPasswordMethodRadio}
                  >
                    <Space>
                      <MailOutlined
                        className={`${styles.forgotPasswordMethodIcon} ${styles.emailIcon}`}
                      />
                      <span>Gửi qua Email</span>
                    </Space>
                  </Radio>
                  <Radio
                    value="phone"
                    className={styles.forgotPasswordMethodRadio}
                  >
                    <Space>
                      <PhoneOutlined
                        className={`${styles.forgotPasswordMethodIcon} ${styles.phoneIcon}`}
                      />
                      <span>Gửi qua Số điện thoại</span>
                    </Space>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            {otpMethod === "email" ? (
              <Form.Item
                name="email"
                label="Email công ty"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
                className={styles.forgotPasswordInputItem}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Nhập email đã đăng ký trong hệ thống"
                  size="large"
                />
              </Form.Item>
            ) : (
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại phải có 10-11 chữ số!",
                  },
                ]}
                className={styles.forgotPasswordInputItem}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại đã đăng ký"
                  size="large"
                  maxLength={11}
                />
              </Form.Item>
            )}

            <Form.Item className={styles.forgotPasswordSubmitItem}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                icon={
                  otpMethod === "email" ? <MailOutlined /> : <PhoneOutlined />
                }
                style={{ backgroundColor: "#334766", borderColor: "#334766" }}
              >
                {loading ? "Đang gửi mã OTP..." : "Gửi mã OTP"}
              </Button>
            </Form.Item>
          </Form>
        );

      case 1:
        // Step 2: Enter OTP
        return (
          <Form
            form={form}
            name="verifyOtp"
            onFinish={handleVerifyOtp}
            layout="vertical"
            autoComplete="off"
          >
            <Alert
              message="Nhập mã OTP"
              description={
                otpMethod === "email"
                  ? `Mã OTP đã được gửi đến email: ${email}. Vui lòng kiểm tra hộp thư và nhập mã OTP gồm 6 chữ số.`
                  : `Mã OTP đã được gửi đến số điện thoại: ${phoneNumber}. Vui lòng kiểm tra tin nhắn và nhập mã OTP gồm 6 chữ số.`
              }
              type="success"
              icon={<CheckCircleOutlined />}
              className={styles.forgotPasswordGuideAlert}
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name="otp"
              label="Mã OTP"
              rules={[
                { required: true, message: "Vui lòng nhập mã OTP!" },
                {
                  pattern: /^[0-9]{6}$/,
                  message: "Mã OTP phải có 6 chữ số!",
                },
              ]}
            >
              <Input
                prefix={<SafetyOutlined />}
                placeholder="Nhập mã OTP 6 số"
                size="large"
                maxLength={6}
                style={{
                  fontSize: "20px",
                  letterSpacing: "8px",
                  textAlign: "center",
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                icon={<CheckCircleOutlined />}
                style={{ backgroundColor: "#334766", borderColor: "#334766" }}
              >
                {loading ? "Đang xác thực..." : "Xác thực OTP"}
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Text type="secondary">Không nhận được mã OTP? </Text>
              <Button
                type="link"
                onClick={() => {
                  setCurrentStep(0);
                  form.resetFields();
                }}
                style={{ padding: 0 }}
              >
                Gửi lại
              </Button>
            </div>
          </Form>
        );

      case 2:
        // Step 3: Enter New Password
        return (
          <Form
            form={form}
            name="resetPassword"
            onFinish={handleResetPassword}
            layout="vertical"
            autoComplete="off"
          >
            <Alert
              message="Đặt mật khẩu mới"
              description="Vui lòng nhập mật khẩu mới cho tài khoản của bạn. Mật khẩu phải có ít nhất 8 ký tự."
              type="info"
              icon={<KeyOutlined />}
              className={styles.forgotPasswordGuideAlert}
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới"
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
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
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập lại mật khẩu mới"
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                icon={<CheckCircleOutlined />}
                style={{ backgroundColor: "#334766", borderColor: "#334766" }}
              >
                {loading ? "Đang đặt lại mật khẩu..." : "Đặt lại mật khẩu"}
              </Button>
            </Form.Item>
          </Form>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className={styles.forgotPasswordContainer}>
        <div className={styles.forgotPasswordWrapper}>
          {/* Left Section - Info */}
          <div className={styles.forgotPasswordLogoSection}>
            <div className={styles.forgotPasswordLogoContent}>
              <div className={styles.forgotPasswordFactoryIcon}>🔐</div>
              <div className={styles.forgotPasswordCompanyTitle}>
                Khôi phục mật khẩu
              </div>
              <div className={styles.forgotPasswordCompanySubtitle}>
                Đừng lo lắng! Chúng tôi sẽ giúp bạn lấy lại quyền truy cập
                <br />
                <br />
                Làm theo 3 bước đơn giản để đặt lại mật khẩu của bạn một cách an
                toàn
              </div>

              {/* Steps indicator in left section */}
              <div className={styles.forgotPasswordStepsInfo}>
                <div
                  className={
                    currentStep === 0
                      ? styles.forgotPasswordStepActive
                      : currentStep > 0
                      ? styles.forgotPasswordStepCompleted
                      : styles.forgotPasswordStepInactive
                  }
                >
                  {otpMethod === "email" ? <MailOutlined /> : <PhoneOutlined />}{" "}
                  Bước 1: Chọn phương thức
                </div>
                <div
                  className={
                    currentStep === 1
                      ? styles.forgotPasswordStepActive
                      : currentStep > 1
                      ? styles.forgotPasswordStepCompleted
                      : styles.forgotPasswordStepInactive
                  }
                >
                  <SafetyOutlined /> Bước 2: Xác thực OTP
                </div>
                <div
                  className={
                    currentStep === 2
                      ? styles.forgotPasswordStepActive
                      : styles.forgotPasswordStepInactive
                  }
                >
                  <LockOutlined /> Bước 3: Mật khẩu mới
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className={styles.forgotPasswordFormSection}>
            <div className={styles.forgotPasswordFormHeader}>
              <Space direction="vertical" size="small">
                <KeyOutlined className={styles.forgotPasswordHeaderIcon} />
                <Title level={2} className={styles.forgotPasswordTitle}>
                  {currentStep === 0
                    ? "Chọn phương thức nhận OTP"
                    : currentStep === 1
                    ? "Xác thực OTP"
                    : "Đặt mật khẩu mới"}
                </Title>
                <Typography.Text
                  className={styles.forgotPasswordHeaderSubtitle}
                >
                  {currentStep === 0
                    ? "Chọn email hoặc số điện thoại để nhận mã xác thực"
                    : currentStep === 1
                    ? `Nhập mã OTP đã gửi đến ${
                        otpMethod === "email" ? "email" : "số điện thoại"
                      } của bạn`
                    : "Tạo mật khẩu mới cho tài khoản"}
                </Typography.Text>
              </Space>
            </div>

            <Steps
              current={currentStep}
              size="small"
              style={{ marginBottom: 24 }}
              items={[
                {
                  title: "Phương thức",
                  icon:
                    otpMethod === "email" ? (
                      <MailOutlined />
                    ) : (
                      <PhoneOutlined />
                    ),
                },
                {
                  title: "OTP",
                  icon: <SafetyOutlined />,
                },
                {
                  title: "Mật khẩu",
                  icon: <LockOutlined />,
                },
              ]}
            />

            {renderStepContent()}

            <div className={styles.forgotPasswordBackContainer}>
              <Button
                type="link"
                onClick={handleBack}
                className={styles.forgotPasswordBackButton}
                icon={<ArrowLeftOutlined />}
              >
                {currentStep === 0
                  ? "Quay lại đăng nhập"
                  : "Quay lại bước trước"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
