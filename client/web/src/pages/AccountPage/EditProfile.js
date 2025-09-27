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

  // Inline styles for consistency
  const containerStyle = {
    padding: "24px",
    backgroundColor: "#f8fafc",
    minHeight: "calc(100vh - 70px)",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    color: "#fff",
    textAlign: "center",
  };

  const cardStyle = {
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
  };

  const avatarStyle = {
    width: "120px",
    height: "120px",
    fontSize: "40px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "4px solid rgba(255, 255, 255, 0.3)",
    marginBottom: "16px",
    position: "relative",
  };

  const uploadButtonStyle = {
    position: "absolute",
    bottom: "0",
    right: "0",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    border: "2px solid #fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
  };

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
      <div style={containerStyle}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            {/* Header */}
            <div style={headerStyle}>
              <Space direction="vertical" align="center">
                <div style={{ position: "relative" }}>
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    src={avatarUrl || currentUser.avatar}
                    style={avatarStyle}
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
                    <div style={uploadButtonStyle}>
                      <CameraOutlined />
                    </div>
                  </Upload>
                </div>
                <Title level={2} style={{ color: "#fff", marginBottom: "0" }}>
                  Chỉnh sửa thông tin cá nhân
                </Title>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "14px",
                  }}
                >
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
                  <EditOutlined style={{ color: "#2563eb" }} />
                  Thông tin cá nhân
                </Space>
              }
              style={cardStyle}
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
                    <p style={{ margin: "8px 0", fontWeight: "bold" }}>
                      ✅ Có thể chỉnh sửa:
                    </p>
                    <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                      <li>Họ và tên</li>
                      <li>Email</li>
                      <li>Số điện thoại</li>
                      <li>Giới tính</li>
                      <li>Ảnh đại diện</li>
                    </ul>
                    <p style={{ margin: "8px 0", fontWeight: "bold" }}>
                      👁️ Chỉ xem (do Admin quản lý):
                    </p>
                    <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                      <li>Mã nhân viên</li>
                      <li>Phòng ban</li>
                      <li>Chức vụ</li>
                    </ul>
                    <p style={{ margin: "8px 0", color: "#059669" }}>
                      💡 Liên hệ phòng Nhân sự nếu cần thay đổi thông tin do
                      Admin quản lý.
                    </p>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: "24px" }}
              />

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
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
                        style={{ backgroundColor: "#f8fafc", color: "#64748b" }}
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
                        style={{ backgroundColor: "#f8fafc", color: "#64748b" }}
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
                      style={{
                        background: "#2563eb",
                        borderColor: "#2563eb",
                      }}
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
