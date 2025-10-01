import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Alert,
  Progress,
  message,
  Modal,
} from "antd";
import {
  LockOutlined,
  SafetyOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { authService } from "../../services/authService";
import styles from "../../styles/pages/ChangePassword.module.css";

const { Title, Text } = Typography;

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) return 0;

    let score = 0;

    // Length check
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;

    return Math.min(score, 100);
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 30) return "#ff4d4f";
    if (strength < 60) return "#faad14";
    if (strength < 80) return "#1890ff";
    return "#52c41a";
  };

  const getPasswordStrengthClass = (strength) => {
    if (strength < 30) return styles.passwordStrengthWeak;
    if (strength < 60) return styles.passwordStrengthMedium;
    if (strength < 80) return styles.passwordStrengthStrong;
    return styles.passwordStrengthVeryStrong;
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 30) return "Yếu";
    if (strength < 60) return "Trung bình";
    if (strength < 80) return "Mạnh";
    return "Rất mạnh";
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    const strength = checkPasswordStrength(password);
    setPasswordStrength(strength);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await authService.changePassword(
        values.currentPassword,
        values.newPassword,
        values.confirmPassword
      );

      if (response.success) {
        message.success("Đổi mật khẩu thành công!");

        // Show success modal and auto logout
        Modal.success({
          title: "Đổi mật khẩu thành công!",
          content:
            "Mật khẩu của bạn đã được cập nhật. Hệ thống sẽ đăng xuất để bảo mật. Vui lòng đăng nhập lại với mật khẩu mới.",
          okText: "Đăng nhập lại",
          onOk: async () => {
            try {
              // Call logout API to clear server-side session
              await authService.logout();
            } catch (error) {
              console.log("Logout API error:", error);
              // Continue with client-side cleanup even if server logout fails
            } finally {
              // Always clear client-side auth data and redirect
              authService.clearAuthData();
              navigate("/login");
            }
          },
        });
      } else {
        throw new Error(response.message || "Đổi mật khẩu thất bại");
      }
    } catch (error) {
      console.error("Change password error:", error);
      
      // Handle specific error messages
      let errorMessage = "Có lỗi xảy ra khi đổi mật khẩu!";
      
      if (error.message.includes("Mật khẩu hiện tại không chính xác")) {
        errorMessage = "Mật khẩu hiện tại không chính xác!";
        // Highlight the current password field with error
        form.setFields([
          {
            name: "currentPassword",
            errors: ["Mật khẩu hiện tại không chính xác"],
          },
        ]);
      } else if (error.message.includes("HTTP error! status: 400")) {
        // Parse error response for 400 Bad Request
        errorMessage = "Mật khẩu hiện tại không đúng hoặc mật khẩu mới không hợp lệ!";
        form.setFields([
          {
            name: "currentPassword",
            errors: ["Vui lòng kiểm tra lại mật khẩu hiện tại"],
          },
        ]);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Modal.confirm({
      title: "Xác nhận hủy",
      content: "Bạn có chắc chắn muốn hủy thay đổi mật khẩu?",
      okText: "Xác nhận",
      cancelText: "Tiếp tục",
      okButtonProps: { className: styles.customOkButton },
      onOk: () => navigate("/profile"),
    });
  };

  const passwordRequirements = [
    { text: "Ít nhất 8 ký tự", regex: /.{8,}/ },
    { text: "Có chữ thường (a-z)", regex: /[a-z]/ },
    { text: "Có chữ hoa (A-Z)", regex: /[A-Z]/ },
    { text: "Có số (0-9)", regex: /[0-9]/ },
    { text: "Có ký tự đặc biệt (!@#$%...)", regex: /[^A-Za-z0-9]/ },
  ];

  const validatePassword = (password) => {
    return passwordRequirements.map((req) => ({
      ...req,
      met: req.regex.test(password || ""),
    }));
  };

  const newPassword = Form.useWatch("newPassword", form);
  const requirements = validatePassword(newPassword);

  return (
    <Layout>
      <div className={styles.changePasswordContainer}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            {/* Header */}
            <div className={styles.changePasswordHeader}>
              <Space direction="vertical" align="center">
                <div className={styles.changePasswordHeaderEmoji}>🔐</div>
                <Title level={2} className={styles.changePasswordHeaderTitle}>
                  Đổi mật khẩu
                </Title>
                <Text className={styles.changePasswordHeaderText}>
                  Tạo mật khẩu mạnh để bảo vệ tài khoản của bạn
                </Text>
              </Space>
            </div>
          </Col>

          <Col xs={24} lg={14} push={5}>
            <Card
              title={
                <Space>
                  <SafetyOutlined className={styles.changePasswordCardTitleIcon} />
                  Thay đổi mật khẩu
                </Space>
              }
              className={styles.changePasswordCard}
              extra={
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/profile")}
                >
                  Quay lại Profile
                </Button>
              }
            >
              <Alert
                message="Lưu ý bảo mật"
                description="Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại. Đảm bảo nhớ mật khẩu mới trước khi lưu thay đổi."
                type="warning"
                showIcon
                className={styles.changePasswordAlert}
              />

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
              >
                <Form.Item
                  label="Mật khẩu hiện tại"
                  name="currentPassword"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu hiện tại!",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<KeyOutlined />}
                    placeholder="Nhập mật khẩu hiện tại"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                    { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const strength = checkPasswordStrength(value);
                        if (strength < 60) {
                          return Promise.reject(
                            new Error("Mật khẩu chưa đủ mạnh!")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu mới"
                    size="large"
                    onChange={handlePasswordChange}
                  />
                </Form.Item>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className={styles.changePasswordStrengthContainer}>
                    <div className={styles.changePasswordStrengthHeader}>
                      <Text className={styles.changePasswordStrengthLabel}>
                        Độ mạnh mật khẩu:
                      </Text>
                      <Text
                        className={`${styles.changePasswordStrengthText} ${getPasswordStrengthClass(
                          passwordStrength
                        )}`}
                      >
                        {getPasswordStrengthText(passwordStrength)}
                      </Text>
                    </div>
                    <Progress
                      percent={passwordStrength}
                      strokeColor={getPasswordStrengthColor(passwordStrength)}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                )}

                <Form.Item
                  label="Xác nhận mật khẩu mới"
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng xác nhận mật khẩu mới!",
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
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập lại mật khẩu mới"
                    size="large"
                  />
                </Form.Item>

                {/* Password Requirements */}
                {newPassword && (
                  <Card
                    size="small"
                    title="Yêu cầu mật khẩu"
                    className={styles.changePasswordRequirementsCard}
                  >
                    <Row gutter={[16, 8]}>
                      {requirements.map((req, index) => (
                        <Col xs={24} sm={12} key={index}>
                          <Space>
                            {req.met ? (
                              <CheckCircleOutlined className={styles.changePasswordRequirementIconMet} />
                            ) : (
                              <ExclamationCircleOutlined className={styles.changePasswordRequirementIconUnmet} />
                            )}
                            <Text
                              className={`${styles.changePasswordRequirementText} ${
                                req.met ? styles.changePasswordRequirementTextMet : styles.changePasswordRequirementTextUnmet
                              }`}
                            >
                              {req.text}
                            </Text>
                          </Space>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                )}

                <Row justify="end" gutter={16}>
                  <Col>
                    <Button size="large" onClick={handleCancel}>
                      Hủy
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      icon={<SafetyOutlined />}
                      className={styles.changePasswordSubmitButton}
                    >
                      Đổi mật khẩu
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default ChangePassword;
