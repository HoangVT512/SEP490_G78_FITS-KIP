import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Avatar,
  Upload,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Alert,
  message,
  Modal,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  CameraOutlined,
  EditOutlined,
  IdcardOutlined,
  TeamOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { authService } from "../../services/authService";
import styles from "../../styles/pages/EditProfile.module.css";

const { Title, Text } = Typography;
const { Option } = Select;

const EditProfile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First try to get user from localStorage
        let user = authService.getStoredUser();

        if (!user && authService.isLoggedIn()) {
          // If no user in localStorage but token exists, fetch from API
          user = await authService.getCurrentUser();
          if (user) {
            localStorage.setItem("currentUser", JSON.stringify(user));
          }
        }

        if (user) {
          setCurrentUser(user);
          const initialData = {
            fullName: user.fullName || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            employeeCode: user.employeeCode || "",
            department: user.department || "N/A",
          };
          form.setFieldsValue(initialData);
          setInitialValues(initialData);
          setAvatarUrl(user.profileImageUrl || null);
        } else {
          // If no user data and not logged in, redirect to login
          navigate("/login");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        // If error getting user data, redirect to login
        navigate("/login");
      }
    };

    loadUserData();
  }, [form, navigate]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Prepare data to update (only editable fields)
      const updateData = {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber || "",
        profileImageUrl: avatarUrl, // Include avatar if uploaded
      };

      console.log("Updating profile:", updateData);

      const response = await authService.updateProfile(updateData);

      if (response.success) {
        // Navigate to profile page with success parameter
        navigate("/profile?updated=true");
      } else {
        throw new Error(response.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Update profile error:", error);

      let errorMessage = "Có lỗi xảy ra khi cập nhật thông tin!";

      if (error.message.includes("Đã có người dùng sử dụng email này")) {
        errorMessage = "Đã có người dùng sử dụng email này, không được dùng.";
        form.setFields([
          {
            name: "email",
            errors: ["Đã có người dùng sử dụng email này, không được dùng"],
          },
        ]);
      } else if (
        error.message.includes("Đã có người dùng sử dụng số điện thoại này")
      ) {
        errorMessage =
          "Đã có người dùng sử dụng số điện thoại này, không được dùng.";
        form.setFields([
          {
            name: "phoneNumber",
            errors: [
              "Đã có người dùng sử dụng số điện thoại này, không được dùng",
            ],
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

  const checkForChanges = () => {
    if (!initialValues) return;

    const currentValues = form.getFieldsValue();
    const currentAvatarUrl = avatarUrl;
    const initialAvatarUrl = currentUser?.profileImageUrl || null;

    // Check if any editable field has changed
    const hasFullNameChanged =
      currentValues.fullName !== initialValues.fullName;
    const hasEmailChanged = currentValues.email !== initialValues.email;
    const hasPhoneChanged =
      currentValues.phoneNumber !== initialValues.phoneNumber;
    const hasAvatarChanged = currentAvatarUrl !== initialAvatarUrl;

    const changed =
      hasFullNameChanged ||
      hasEmailChanged ||
      hasPhoneChanged ||
      hasAvatarChanged;
    setHasChanges(changed);
  };

  const handleAvatarChange = (info) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);

    if (info.file.status === "done") {
      // Get this url from response in real world.
      setAvatarUrl(info.file.response?.url);
      message.success("Tải ảnh đại diện thành công!");
      checkForChanges();
    } else if (info.file.status === "error") {
      message.error("Tải ảnh thất bại!");
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Chỉ cho phép tải lên file JPG/PNG!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Kích thước ảnh phải nhỏ hơn 2MB!");
      return false;
    }
    return true;
  };

  const handleCancel = () => {
    Modal.confirm({
      title: "Xác nhận hủy",
      content: "Bạn có chắc chắn muốn hủy? Các thay đổi chưa lưu sẽ bị mất.",
      okText: "Xác nhận",
      cancelText: "Tiếp tục chỉnh sửa",
      okButtonProps: { className: styles.customOkButton },
      onOk: () => navigate("/profile"),
    });
  };

  if (!currentUser) {
    return (
      <Layout>
        <div>Đang tải...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.editProfileContainer}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            {/* Header */}
            <div className={styles.editProfileHeader}>
              <Space direction="vertical" align="center">
                <div className={styles.editProfileAvatarContainer}>
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    src={avatarUrl || currentUser?.avatar}
                    className={styles.editProfileAvatar}
                  />
                  {/* <Upload
                    name="avatar"
                    listType="picture"
                    className={styles.avatarUploader}
                    showUploadList={false}
                    action="/api/upload/avatar" // TODO: Replace with real API
                    beforeUpload={beforeUpload}
                    onChange={handleAvatarChange}
                  >
                    <div className={styles.editProfileUploadButton}>
                      <CameraOutlined />
                    </div>
                  </Upload> */}
                </div>
                <Title level={2} className={styles.editProfileHeaderTitle}>
                  Chỉnh sửa thông tin cá nhân
                </Title>
                <Text className={styles.editProfileHeaderSubtitle}>
                  Cập nhật thông tin cá nhân của bạn. Phòng ban và chức vụ do
                  Admin quản lý.
                </Text>
              </Space>
            </div>
          </Col>

          <Col span={24}>
            <Card
              title={
                <Space>
                  <EditOutlined className={styles.editProfileCardTitleIcon} />
                  Thông tin cá nhân
                </Space>
              }
              className={styles.editProfileCard}
              extra={
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/profile")}
                >
                  Quay lại
                </Button>
              }
            >
              <Alert
                message="Hướng dẫn chỉnh sửa thông tin"
                description={
                  <div>
                    <p className={styles.editProfileAlertTitle}>
                      Có thể chỉnh sửa:
                    </p>
                    <ul className={styles.editProfileAlertList}>
                      <li>Họ và tên</li>
                      <li>Email</li>
                      <li>Số điện thoại (10 số bắt đầu bằng 0)</li>
                    </ul>
                    <p className={styles.editProfileAlertTitle}>
                      Chỉ xem (do Admin quản lý):
                    </p>
                    <ul className={styles.editProfileAlertList}>
                      <li>Mã nhân viên</li>
                      <li>Phòng ban</li>
                      <li>Chức vụ</li>
                    </ul>
                    <p className={styles.editProfileAlertNote}>
                      Liên hệ phòng Nhân sự nếu cần thay đổi thông tin do Admin
                      quản lý.
                    </p>
                  </div>
                }
                type="info"
                showIcon
                className={styles.editProfileAlert}
              />

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                className={styles.editProfileForm}
                onValuesChange={checkForChanges}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Họ và tên"
                      name="fullName"
                      rules={[
                        { required: true, message: "Vui lòng nhập họ và tên!" },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Nhập họ và tên"
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Mã nhân viên"
                      name="employeeCode"
                      tooltip="Mã nhân viên không thể thay đổi"
                    >
                      <Input
                        prefix={<IdcardOutlined />}
                        value={currentUser?.employeeCode || ""}
                        disabled
                        size="large"
                        className={styles.editProfileDisabledField}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        {
                          type: "email",
                          message: "Email không đúng định dạng!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="Nhập email công ty"
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Số điện thoại"
                      name="phoneNumber"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số điện thoại!",
                        },
                        {
                          pattern: /^0[0-9]{9}$/,
                          message:
                            "Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Nhập số điện thoại (VD: 0123456789)"
                        size="large"
                        maxLength={10}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Phòng ban" name="department">
                      <Input
                        prefix={<TeamOutlined />}
                        value={currentUser?.department || "N/A"}
                        disabled
                        size="large"
                        className={styles.editProfileDisabledField}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item label="Chức vụ" name="position">
                      <Input
                        prefix={<IdcardOutlined />}
                        value={currentUser?.position || "N/A"}
                        disabled
                        size="large"
                        className={styles.editProfileDisabledField}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

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
                      icon={<SaveOutlined />}
                      className={styles.editProfileSubmitButton}
                      disabled={!hasChanges}
                    >
                      Lưu thay đổi
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

export default EditProfile;
