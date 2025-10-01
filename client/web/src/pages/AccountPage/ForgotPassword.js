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
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  KeyOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import authService from "../../services/authService";
import styles from "../../styles/pages/ForgotPassword.module.css";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); // 0: Enter Email, 1: Enter OTP, 2: Enter New Password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [form] = Form.useForm();

  // Step 1: Send OTP to email
  const handleSendOtp = async (values) => {
    setLoading(true);
    try {
      await authService.sendForgotPasswordOtp(values.email);
      setEmail(values.email);
      message.success("Mã OTP đã được gửi đến email của bạn!");
      setCurrentStep(1);
    } catch (error) {
      console.error("Error sending OTP:", error);
      message.error(
        error.message || "Không thể gửi mã OTP. Vui lòng kiểm tra lại email!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (values) => {
    setLoading(true);
    try {
      await authService.verifyOtp(email, values.otp);
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
      await authService.resetPasswordWithOtp(email, otp, values.newPassword);

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
        // Step 1: Enter Email
        return (
          <Form
            form={form}
            name="sendOtp"
            onFinish={handleSendOtp}
            layout="vertical"
            autoComplete="off"
          >
            <Alert
              message="Nhập email của bạn"
              description="Chúng tôi sẽ gửi mã OTP 6 số đến email này để xác thực danh tính của bạn."
              type="info"
              icon={<InfoCircleOutlined />}
              className={styles.forgotPasswordGuideAlert}
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name="email"
              label="Email công ty"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email đã đăng ký trong hệ thống"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                icon={<MailOutlined />}
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
              description={`Mã OTP đã được gửi đến email: ${email}. Vui lòng kiểm tra hộp thư và nhập mã OTP gồm 6 chữ số.`}
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
        <Card className={styles.forgotPasswordCard}>
          <div className={styles.authHeader}>
            <Space direction="vertical" size="small" align="center">
              <KeyOutlined className={styles.forgotPasswordIcon} />
              <Title level={2} className={styles.forgotPasswordTitle}>
                Quên mật khẩu
              </Title>
              <Text className={styles.forgotPasswordSubtitle}>
                Làm theo các bước để đặt lại mật khẩu của bạn
              </Text>
            </Space>
          </div>

          <Steps
            current={currentStep}
            style={{ marginBottom: 32 }}
            items={[
              {
                title: "Nhập Email",
                icon: <MailOutlined />,
              },
              {
                title: "Xác thực OTP",
                icon: <SafetyOutlined />,
              },
              {
                title: "Mật khẩu mới",
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
              {currentStep === 0 ? "Quay lại đăng nhập" : "Quay lại bước trước"}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
