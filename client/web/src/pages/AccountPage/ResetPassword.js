import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Steps,
  Typography,
  Space,
  Result,
  Radio,
  Alert,
  Card,
} from "antd";
import {
  MailOutlined,
  SafetyOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  KeyOutlined,
  PhoneOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

const { Title, Text } = Typography;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [resetContact, setResetContact] = useState("");
  const [contactType, setContactType] = useState("email"); // "email" or "phone"
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Step 1: Request reset token
  const handleRequestReset = async (values) => {
    setLoading(true);
    try {
      // TODO: API call to request password reset
      const contact = contactType === "email" ? values.email : values.phone;
      console.log("Requesting reset for:", contact, "via", contactType);
      setResetContact(contact);

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
    background: "linear-gradient(135deg, #334766 0%, #283652 100%)",
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
    background: "#334766",
    borderColor: "#334766",
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
                <KeyOutlined style={{ fontSize: "36px", color: "#334766" }} />
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
                  Chọn phương thức nhận mã OTP để đặt lại mật khẩu
                </Text>
              </Space>
            </div>

            {/* Hướng dẫn các bước */}
            <Alert
              message="Hướng dẫn khôi phục mật khẩu"
              description={
                <div>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Bước 1:</strong> Chọn phương thức nhận mã OTP (Email
                    hoặc SMS)
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Bước 2:</strong> Nhập email hoặc số điện thoại đã
                    đăng ký
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <strong>Bước 3:</strong> Nhập mã OTP 6 số và đặt mật khẩu
                    mới
                  </p>
                </div>
              }
              type="info"
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: "24px" }}
            />

            {/* Chọn phương thức nhận OTP */}
            <Form.Item
              label="Chọn phương thức nhận mã OTP"
              style={{ marginBottom: "20px" }}
            >
              <Radio.Group
                value={contactType}
                onChange={(e) => {
                  setContactType(e.target.value);
                  form.resetFields(["email", "phone"]);
                }}
                style={{ width: "100%" }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Card
                    hoverable
                    style={{
                      border:
                        contactType === "email"
                          ? "2px solid #334766"
                          : "1px solid #e5e7eb",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setContactType("email");
                      form.resetFields(["email", "phone"]);
                    }}
                  >
                    <Radio value="email" style={{ marginRight: "12px" }} />
                    <MailOutlined
                      style={{ marginRight: "8px", color: "#334766" }}
                    />
                    <strong>Gửi OTP qua Email</strong>
                    <div
                      style={{
                        marginLeft: "32px",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      Mã OTP sẽ được gửi đến email của bạn
                    </div>
                  </Card>

                  <Card
                    hoverable
                    style={{
                      border:
                        contactType === "phone"
                          ? "2px solid #334766"
                          : "1px solid #e5e7eb",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setContactType("phone");
                      form.resetFields(["email", "phone"]);
                    }}
                  >
                    <Radio value="phone" style={{ marginRight: "12px" }} />
                    <PhoneOutlined
                      style={{ marginRight: "8px", color: "#059669" }}
                    />
                    <strong>Gửi OTP qua SMS</strong>
                    <div
                      style={{
                        marginLeft: "32px",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      Mã OTP sẽ được gửi đến số điện thoại của bạn
                    </div>
                  </Card>
                </Space>
              </Radio.Group>
            </Form.Item>

            {/* Input theo phương thức được chọn */}
            {contactType === "email" ? (
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
            ) : (
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại phải có 10-11 chữ số!",
                  },
                ]}
                style={{ marginBottom: "20px" }}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại đã đăng ký (VD: 0123456789)"
                  size="large"
                  maxLength={11}
                />
              </Form.Item>
            )}

            <Form.Item style={{ marginBottom: "16px" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={buttonStyle}
                icon={
                  contactType === "email" ? <MailOutlined /> : <PhoneOutlined />
                }
              >
                {loading
                  ? "Đang gửi mã OTP..."
                  : `Gửi mã OTP qua ${
                      contactType === "email" ? "Email" : "SMS"
                    }`}
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <Button
                type="link"
                onClick={() => navigate("/login")}
                style={{ color: "#334766" }}
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
                  Nhập mã OTP
                </Title>
                <Text style={{ color: "#64748b", fontSize: "14px" }}>
                  Mã OTP đã được gửi tới <strong>{resetContact}</strong>
                  <br />
                  qua {contactType === "email" ? "Email" : "SMS"}. Nhập mã OTP
                  và đặt mật khẩu mới.
                </Text>
              </Space>
            </div>

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
              style={{ marginBottom: "20px" }}
            />

            <Form.Item
              name="token"
              label="Mã OTP (6 số)"
              rules={[
                { required: true, message: "Vui lòng nhập mã OTP!" },
                {
                  pattern: /^[0-9]{6}$/,
                  message: "Mã OTP phải là 6 chữ số!",
                },
              ]}
              style={{ marginBottom: "20px" }}
            >
              <Input
                placeholder="Nhập mã OTP 6 số"
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
              <Space>
                <Button
                  type="link"
                  onClick={() => setCurrentStep(0)}
                  style={{ color: "#64748b" }}
                >
                  Gửi lại mã OTP
                </Button>
                <span style={{ color: "#e5e7eb" }}>|</span>
                <Button
                  type="link"
                  onClick={() => setCurrentStep(0)}
                  style={{ color: "#64748b" }}
                >
                  Thay đổi phương thức
                </Button>
              </Space>
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
                  ✓ Mã OTP được gửi qua Email/SMS
                </div>
                <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                  ✓ Mã OTP có hiệu lực trong 5 phút
                </div>
                <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                  ✓ Xác thực 2 lớp an toàn
                </div>
                <div style={{ fontSize: "14px" }}>
                  ✓ Mật khẩu được mã hóa bảo mật
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
                        Chọn phương thức
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
                        Email hoặc SMS
                      </div>
                    ),
                    icon: <KeyOutlined style={{ fontSize: "20px" }} />,
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
                        Nhập mã OTP
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
                        Và mật khẩu mới
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
