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
import styles from "../../styles/pages/ForgotPassword.module.css";

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
      <div className={styles.authHeader}>
        <Space direction="vertical" size="small">
          <KeyOutlined className={styles.forgotPasswordIcon} />
          <Title level={2} className={styles.forgotPasswordTitle}>
            Quên mật khẩu
          </Title>
          <Text className={styles.forgotPasswordSubtitle}>
            Chọn phương thức nhận mã OTP để đặt lại mật khẩu
          </Text>
        </Space>
      </div>

      {/* Hướng dẫn các bước */}
      <Alert
        message="Hướng dẫn khôi phục mật khẩu"
        description={
          <div>
            <p className={styles.forgotPasswordGuideStep}>
              <strong>Bước 1:</strong> Chọn phương thức nhận mã OTP (Email hoặc
              SMS)
            </p>
            <p className={styles.forgotPasswordGuideStep}>
              <strong>Bước 2:</strong> Nhập email hoặc số điện thoại đã đăng ký
            </p>
            <p className={styles.forgotPasswordGuideStep}>
              <strong>Bước 3:</strong> Nhập mã OTP 6 số và đặt mật khẩu mới
            </p>
          </div>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        className={styles.forgotPasswordGuideAlert}
      />

      {/* Chọn phương thức nhận OTP */}
      <Form.Item
        label="Chọn phương thức nhận mã OTP"
        className={styles.forgotPasswordMethodLabel}
      >
        <Radio.Group
          value={contactType}
          onChange={(e) => {
            setContactType(e.target.value);
            form.resetFields(["email", "phone"]);
          }}
          className={styles.forgotPasswordMethodGroup}
        >
          <Space direction="vertical" className={styles.forgotPasswordMethodSpace}>
            <Card
              hoverable
              className={`${styles.methodCard} ${contactType === "email"
                  ? styles.methodCardSelected
                  : styles.methodCardDefault
                }`}
              onClick={() => {
                setContactType("email");
                form.resetFields(["email", "phone"]);
              }}
            >
              <Radio value="email" className={styles.forgotPasswordMethodRadio} />
              <MailOutlined className={styles.forgotPasswordMethodIcon} />
              <strong>Gửi OTP qua Email</strong>
              <div className={styles.methodCardDescription}>
                Mã OTP sẽ được gửi đến email của bạn
              </div>
            </Card>

            <Card
              hoverable
              className={`${styles.methodCard} ${contactType === "phone"
                  ? styles.methodCardSelected
                  : styles.methodCardDefault
                }`}
              onClick={() => {
                setContactType("phone");
                form.resetFields(["email", "phone"]);
              }}
            >
              <Radio value="phone" className={styles.forgotPasswordMethodRadio} />
              <PhoneOutlined className={styles.forgotPasswordMethodIcon} />
              <strong>Gửi OTP qua SMS</strong>
              <div className={styles.methodCardDescription}>
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
          name="phone"
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
            placeholder="Nhập số điện thoại đã đăng ký (VD: 0123456789)"
            size="large"
            maxLength={11}
          />
        </Form.Item>
      )}

      <Form.Item className={styles.forgotPasswordSubmitItem}>
        <Button
          style={{ backgroundColor: "#334766", borderColor: "#334766", color: "#fff" }}
          htmlType="submit"
          loading={loading}
          className={styles.authButton}
          icon={contactType === "email" ? <MailOutlined /> : <PhoneOutlined />}
        >
          {loading
            ? "Đang gửi mã OTP..."
            : `Gửi mã OTP qua ${contactType === "email" ? "Email" : "SMS"}`}
        </Button>
      </Form.Item>

      <div className={styles.forgotPasswordBackContainer}>
        <Button
          type="link"
          onClick={() => navigate("/login")}
          className={styles.forgotPasswordBackButton}
          icon={<ArrowLeftOutlined />}
        >
          Quay lại đăng nhập
        </Button>
      </div>
    </Form>
  );
};

export default ForgotPassword;
