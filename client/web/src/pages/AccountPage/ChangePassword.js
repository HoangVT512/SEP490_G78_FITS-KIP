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
  message,
  Modal,
} from "antd";
import {
  LockOutlined,
  SafetyOutlined,
  ArrowLeftOutlined,
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
  const [isFormTouched, setIsFormTouched] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await authService.changePassword(
        values.currentPassword,
        values.newPassword,
        values.confirmPassword
      );

      if (response.success) {
        //message.success("Đổi mật khẩu thành công!");

        // Show success modal and auto logout
        // Reset form and touched state before showing success modal
        form.resetFields();
        setIsFormTouched(false);

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
            }

            // Always clear client-side auth data
            authService.clearAuthData();

            // Force redirect to login page
            window.location.href = "/login";
          },
        });
      } else {
        throw new Error(response.message || "Đổi mật khẩu thất bại");
      }
    } catch (error) {
      console.error("Change password error:", error);

      // Display error message from backend
      const errorMessage = error.message || "Có lỗi xảy ra khi đổi mật khẩu!";

      // Check if error is related to current password
      if (
        errorMessage.toLowerCase().includes("current password") ||
        errorMessage.toLowerCase().includes("mật khẩu hiện tại") ||
        errorMessage.toLowerCase().includes("incorrect password")
      ) {
        form.setFields([
          {
            name: "currentPassword",
            errors: [errorMessage],
          },
        ]);
      }

      //message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Check if form has been touched (user has entered any data)
    if (isFormTouched) {
      Modal.confirm({
        title: "Bạn có chắc chắn muốn rời khỏi trang này?",
        content: "Các thay đổi bạn đã nhập sẽ không được lưu.",
        okText: "Rời khỏi",
        cancelText: "Ở lại",
        okButtonProps: { danger: true },
        onOk: () => {
          form.resetFields();
          setIsFormTouched(false);
          navigate("/profile");
        },
      });
    } else {
      // If form is not touched, navigate directly
      navigate("/profile");
    }
  };

  const newPassword = Form.useWatch("newPassword", form);

  return (
    <Layout>
      <div className={styles.changePasswordContainer}>
        <Row gutter={[24, 24]} justify="center">
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

          <Col xs={24} sm={24} md={18} lg={18} xl={18}>
            <Card
              title={
                <Space>
                  <SafetyOutlined
                    className={styles.changePasswordCardTitleIcon}
                  />
                  Thay đổi mật khẩu
                </Space>
              }
              className={styles.changePasswordCard}
              extra={
                <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
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
                onValuesChange={() => setIsFormTouched(true)}
                data-form-type="change-password"
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
                    autoComplete="current-password"
                  />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  dependencies={["currentPassword"]}
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value) {
                          return Promise.resolve();
                        }
                        const currentPassword =
                          getFieldValue("currentPassword");
                        if (currentPassword && value === currentPassword) {
                          return Promise.reject(
                            new Error(
                              "Mật khẩu mới khác với mật khẩu hiện tại."
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu mới"
                    size="large"
                    autoComplete="off"
                  />
                </Form.Item>

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
                    autoComplete="off"
                  />
                </Form.Item>

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
