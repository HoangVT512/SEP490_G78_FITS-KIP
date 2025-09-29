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
import "../../styles/pages/EditProfile.css";

const { Title, Text } = Typography;
const { Option } = Select;

const EditProfile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [fileList, setFileList] = useState([]);

  // Mock current user data - replace with real API call
  const [currentUser] = useState({
    id: "user-123",
    fullName: "Nguyễn Văn Admin",
    employeeCode: "ADM001",
    email: "admin@congty.com",
    phoneNumber: "0123456789",
    position: "Quản trị viên hệ thống",
    gender: "Nam",
    department: "Phòng IT",
    avatar: null,
  });

  // Department options - no longer needed for display only
  // const departmentOptions = [
  //   { value: "IT", label: "Phòng IT" },
  //   { value: "HR", label: "Phòng Nhân sự" },
  //   { value: "PRODUCTION", label: "Phòng Sản xuất" },
  //   { value: "QC", label: "Phòng Kiểm tra chất lượng" },
  //   { value: "MAINTENANCE", label: "Phòng Bảo trì" },
  //   { value: "FINANCE", label: "Phòng Tài chính" },
  // ];

  // Position options - no longer needed for display only
  // const positionOptions = [
  //   { value: "Quản trị viên hệ thống", label: "Quản trị viên hệ thống" },
  //   { value: "Quản lý", label: "Quản lý" },
  //   { value: "Kỹ sư", label: "Kỹ sư" },
  //   { value: "Kỹ thuật viên", label: "Kỹ thuật viên" },
  //   { value: "Nhân viên", label: "Nhân viên" },
  //   { value: "Thực tập sinh", label: "Thực tập sinh" },
  // ];

  useEffect(() => {
    // Initialize form with current user data
    form.setFieldsValue({
      fullName: currentUser.fullName,
      email: currentUser.email,
      phoneNumber: currentUser.phoneNumber,
      gender: currentUser.gender,
      // Note: department and position are disabled and managed by Admin
    });
  }, [currentUser, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Prepare data to update (exclude admin-managed fields)
      const updateData = {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        // Note: department and position are managed by Admin only
      };

      // TODO: API call to update profile
      console.log("Updating profile:", updateData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      message.success("Cập nhật thông tin cá nhân thành công!");
      navigate("/profile");
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật thông tin!");
      console.error("Update profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);

    if (info.file.status === "done") {
      // Get this url from response in real world.
      setAvatarUrl(info.file.response?.url);
      message.success("Tải ảnh đại diện thành công!");
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
      onOk: () => navigate("/profile"),
    });
  };

  return (
    <Layout>
      <div className="edit-profile-container edit-profile">
        <Row gutter={[24, 24]}>
          <Col span={24}>
            {/* Header */}
            <div className="edit-profile-header">
              <Space direction="vertical" align="center">
                <div className="edit-profile-avatar-container">
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    src={avatarUrl || currentUser.avatar}
                    className="edit-profile-avatar"
                  />
                  <Upload
                    name="avatar"
                    listType="picture"
                    className="avatar-uploader"
                    showUploadList={false}
                    action="/api/upload/avatar" // TODO: Replace with real API
                    beforeUpload={beforeUpload}
                    onChange={handleAvatarChange}
                  >
                    <div className="edit-profile-upload-button">
                      <CameraOutlined />
                    </div>
                  </Upload>
                </div>
                <Title level={2} className="edit-profile-header-title">
                  Chỉnh sửa thông tin cá nhân
                </Title>
                <Text className="edit-profile-header-subtitle">
                  Cập nhật thông tin cá nhân của bạn. Phòng ban và chức vụ do
                  Admin quản lý.
                </Text>
              </Space>
            </div>
          </Col>

          <Col xs={24} lg={16} push={4}>
            <Card
              title={
                <Space>
                  <EditOutlined className="edit-profile-card-title-icon" />
                  Thông tin cá nhân
                </Space>
              }
              className="edit-profile-card"
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
                    <p className="edit-profile-alert-title">
                      ✅ Có thể chỉnh sửa:
                    </p>
                    <ul className="edit-profile-alert-list">
                      <li>Họ và tên</li>
                      <li>Email</li>
                      <li>Số điện thoại</li>
                      <li>Giới tính</li>
                      <li>Ảnh đại diện</li>
                    </ul>
                    <p className="edit-profile-alert-title">
                      👁️ Chỉ xem (do Admin quản lý):
                    </p>
                    <ul className="edit-profile-alert-list">
                      <li>Mã nhân viên</li>
                      <li>Phòng ban</li>
                      <li>Chức vụ</li>
                    </ul>
                    <p className="edit-profile-alert-note">
                      💡 Liên hệ phòng Nhân sự nếu cần thay đổi thông tin do
                      Admin quản lý.
                    </p>
                  </div>
                }
                type="info"
                showIcon
                className="edit-profile-alert"
              />

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                className="edit-profile-form"
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Họ và tên"
                      name="fullName"
                      rules={[
                        { required: true, message: "Vui lòng nhập họ tên!" },
                        { min: 2, message: "Họ tên phải có ít nhất 2 ký tự!" },
                        {
                          max: 100,
                          message: "Họ tên không được vượt quá 100 ký tự!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Nhập họ và tên đầy đủ"
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
                        value={currentUser.employeeCode}
                        disabled
                        size="large"
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
                        { type: "email", message: "Email không hợp lệ!" },
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
                          pattern: /^[0-9]{10,11}$/,
                          message: "Số điện thoại không hợp lệ!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Nhập số điện thoại"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Giới tính"
                      name="gender"
                      rules={[
                        { required: true, message: "Vui lòng chọn giới tính!" },
                      ]}
                    >
                      <Select placeholder="Chọn giới tính" size="large">
                        <Option value="Nam">
                          <Space>
                            <ManOutlined />
                            Nam
                          </Space>
                        </Option>
                        <Option value="Nữ">
                          <Space>
                            <WomanOutlined />
                            Nữ
                          </Space>
                        </Option>
                        <Option value="Khác">
                          <Space>
                            <UserOutlined />
                            Khác
                          </Space>
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item label="Phòng ban" name="department">
                      <Input
                        prefix={<TeamOutlined />}
                        value={currentUser.department}
                        disabled
                        size="large"
                        className="edit-profile-disabled-field"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item label="Chức vụ" name="position">
                      <Input
                        prefix={<IdcardOutlined />}
                        value={currentUser.position}
                        disabled
                        size="large"
                        className="edit-profile-disabled-field"
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
                      className="edit-profile-submit-button"
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
