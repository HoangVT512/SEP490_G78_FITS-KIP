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

const { Title, Text } = Typography;

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Inline styles for consistency
  const containerStyle = {
    padding: "24px",
    backgroundColor: "#f8fafc",
    minHeight: "calc(100vh - 70px)",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    borderRadius: "12px",
    padding: "32px",
    marginBottom: "24px",
    color: "#fff",
    textAlign: "center",
  };

  const cardStyle = {
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
  };

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
      // TODO: API call to change password
      console.log("Changing password:", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      message.success("Đổi mật khẩu thành công!");

      // Show success modal
      Modal.success({
        title: "Đổi mật khẩu thành công!",
        content:
          "Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại với mật khẩu mới.",
        okText: "Đăng nhập lại",
        onOk: () => navigate("/login"),
      });
    } catch (error) {
      message.error("Có lỗi xảy ra khi đổi mật khẩu!");
      console.error("Change password error:", error);
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
      <div style={containerStyle}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            {/* Header */}
            <div style={headerStyle}>
              <Space direction="vertical" align="center">
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔐</div>
                <Title level={2} style={{ color: "#fff", marginBottom: "8px" }}>
                  Đổi mật khẩu
                </Title>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "14px",
                  }}
                >
                  Tạo mật khẩu mạnh để bảo vệ tài khoản của bạn
                </Text>
              </Space>
            </div>
          </Col>

          <Col xs={24} lg={14} push={5}>
            <Card
              title={
                <Space>
                  <SafetyOutlined style={{ color: "#2563eb" }} />
                  Thay đổi mật khẩu
                </Space>
              }
              style={cardStyle}
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
                style={{ marginBottom: "24px" }}
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
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <Text style={{ fontSize: "14px", fontWeight: "500" }}>
                        Độ mạnh mật khẩu:
                      </Text>
                      <Text
                        style={{
                          color: getPasswordStrengthColor(passwordStrength),
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
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
                    style={{ marginBottom: "24px", backgroundColor: "#f8fafc" }}
                  >
                    <Row gutter={[16, 8]}>
                      {requirements.map((req, index) => (
                        <Col xs={24} sm={12} key={index}>
                          <Space>
                            {req.met ? (
                              <CheckCircleOutlined
                                style={{ color: "#52c41a" }}
                              />
                            ) : (
                              <ExclamationCircleOutlined
                                style={{ color: "#ff4d4f" }}
                              />
                            )}
                            <Text
                              style={{
                                color: req.met ? "#52c41a" : "#8c8c8c",
                                fontSize: "13px",
                              }}
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
                      style={{
                        background: "#2563eb",
                        borderColor: "#2563eb",
                      }}
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
