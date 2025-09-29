import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Space,
  Radio,
  Alert,
  Card,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  KeyOutlined,
  PhoneOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "../../styles/pages/ForgotPassword.css";

const { Title, Text } = Typography;

const ForgotPassword = ({ onRequestReset }) => {
  const navigate = useNavigate();
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

      // Simulate API delay
      setTimeout(() => {
        onRequestReset(contact, contactType);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error requesting reset:", error);
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      name="requestReset"
      onFinish={handleRequestReset}
      layout="vertical"
      autoComplete="off"
    >
      <div className="auth-header">
        <Space direction="vertical" size="small">
          <KeyOutlined className="forgot-password-icon" />
          <Title level={2} className="forgot-password-title">
            Quên mật khẩu
          </Title>
          <Text className="forgot-password-subtitle">
            Chọn phương thức nhận mã OTP để đặt lại mật khẩu
          </Text>
        </Space>
      </div>

      {/* Hướng dẫn các bước */}
      <Alert
        message="Hướng dẫn khôi phục mật khẩu"
        description={
          <div>
            <p className="forgot-password-guide-step">
              <strong>Bước 1:</strong> Chọn phương thức nhận mã OTP (Email hoặc
              SMS)
            </p>
            <p className="forgot-password-guide-step">
              <strong>Bước 2:</strong> Nhập email hoặc số điện thoại đã đăng ký
            </p>
            <p className="forgot-password-guide-step">
              <strong>Bước 3:</strong> Nhập mã OTP 6 số và đặt mật khẩu mới
            </p>
          </div>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        className="forgot-password-guide-alert"
      />

      {/* Chọn phương thức nhận OTP */}
      <Form.Item
        label="Chọn phương thức nhận mã OTP"
        className="forgot-password-method-label"
      >
        <Radio.Group
          value={contactType}
          onChange={(e) => {
            setContactType(e.target.value);
            form.resetFields(["email", "phone"]);
          }}
          className="forgot-password-method-group"
        >
          <Space direction="vertical" className="forgot-password-method-space">
            <Card
              hoverable
              className={`method-card ${
                contactType === "email"
                  ? "method-card-selected"
                  : "method-card-default"
              }`}
              onClick={() => {
                setContactType("email");
                form.resetFields(["email", "phone"]);
              }}
            >
              <Radio value="email" className="forgot-password-method-radio" />
              <MailOutlined className="forgot-password-method-icon email-icon" />
              <strong>Gửi OTP qua Email</strong>
              <div className="method-card-description">
                Mã OTP sẽ được gửi đến email của bạn
              </div>
            </Card>

            <Card
              hoverable
              className={`method-card ${
                contactType === "phone"
                  ? "method-card-selected"
                  : "method-card-default"
              }`}
              onClick={() => {
                setContactType("phone");
                form.resetFields(["email", "phone"]);
              }}
            >
              <Radio value="phone" className="forgot-password-method-radio" />
              <PhoneOutlined className="forgot-password-method-icon phone-icon" />
              <strong>Gửi OTP qua SMS</strong>
              <div className="method-card-description">
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
          className="forgot-password-input-item"
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
          className="forgot-password-input-item"
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder="Nhập số điện thoại đã đăng ký (VD: 0123456789)"
            size="large"
            maxLength={11}
          />
        </Form.Item>
      )}

      <Form.Item className="forgot-password-submit-item">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="auth-button"
          icon={contactType === "email" ? <MailOutlined /> : <PhoneOutlined />}
        >
          {loading
            ? "Đang gửi mã OTP..."
            : `Gửi mã OTP qua ${contactType === "email" ? "Email" : "SMS"}`}
        </Button>
      </Form.Item>

      <div className="forgot-password-back-container">
        <Button
          type="link"
          onClick={() => navigate("/login")}
          className="forgot-password-back-button"
          icon={<ArrowLeftOutlined />}
        >
          Quay lại đăng nhập
        </Button>
      </div>
    </Form>
  );
};

export default ForgotPassword;
