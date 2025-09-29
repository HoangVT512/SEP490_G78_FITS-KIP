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
import { styles } from "./forgotPassword.styles";

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
      <div style={styles.headerStyle}>
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
              style={styles.methodCardStyle(contactType === "email")}
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
              <div style={styles.methodCardDescriptionStyle}>
                Mã OTP sẽ được gửi đến email của bạn
              </div>
            </Card>

            <Card
              hoverable
              style={styles.methodCardStyle(contactType === "phone")}
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
              <div style={styles.methodCardDescriptionStyle}>
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
          style={styles.buttonStyle}
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
};

export default ForgotPassword;