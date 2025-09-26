import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Avatar,
  Button,
  Tag,
  Divider,
  Row,
  Col,
  Typography,
  Space,
  Badge,
  Tabs,
  Timeline,
  Alert,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  SafetyOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  IdcardOutlined,
  SecurityScanOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

const { Title, Text } = Typography;

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    id: "user-123",
    fullName: "Nguyễn Văn Admin",
    employeeCode: "ADM001",
    email: "admin@congty.com",
    phoneNumber: "0123456789",
    position: "Quản trị viên hệ thống",
    gender: "Nam",
    department: "Phòng IT",
    role: "Quản trị viên",
    emailConfirmed: true,
    phoneNumberConfirmed: true,
    twoFactorEnabled: false,
    lockoutEnabled: false,
    accessFailedCount: 0,
    lastLoginDate: "2024-09-25 08:30:00",
    createdDate: "2024-01-15 09:00:00",
  });

  const [activityLog] = useState([
    {
      date: "2024-09-25 08:30:00",
      action: "Đăng nhập hệ thống",
      status: "success",
    },
    {
      date: "2024-09-24 17:45:00",
      action: "Cập nhật thông tin thiết bị TB001",
      status: "success",
    },
    {
      date: "2024-09-24 14:20:00",
      action: "Tạo yêu cầu bảo trì mới #MT-2024-001",
      status: "success",
    },
    {
      date: "2024-09-23 16:30:00",
      action: "Thay đổi mật khẩu",
      status: "success",
    },
  ]);

  // Inline styles for consistency
  const containerStyle = {
    padding: "24px",
    backgroundColor: "#f8fafc",
    minHeight: "calc(100vh - 70px)",
  };

  const profileHeaderStyle = {
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

  const avatarStyle = {
    width: "100px",
    height: "100px",
    fontSize: "36px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "4px solid rgba(255, 255, 255, 0.3)",
    marginBottom: "16px",
  };

  const statusColors = {
    success: "#059669",
    warning: "#d97706",
    error: "#dc2626",
    info: "#2563eb",
  };

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  const handleChangePassword = () => {
    navigate("/profile/change-password");
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("vi-VN");
  };

  const getUserStatusColor = () => {
    if (userInfo.lockoutEnabled && userInfo.accessFailedCount > 0)
      return "warning";
    if (!userInfo.emailConfirmed) return "error";
    return "success";
  };

  const getUserStatusText = () => {
    if (userInfo.lockoutEnabled && userInfo.accessFailedCount > 0)
      return "Cảnh báo bảo mật";
    if (!userInfo.emailConfirmed) return "Chưa xác thực email";
    return "Hoạt động";
  };

  return (
    <Layout>
      <div style={containerStyle}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            {/* Profile Header */}
            <div style={profileHeaderStyle}>
              <Avatar size={100} icon={<UserOutlined />} style={avatarStyle} />
              <Title level={2} style={{ color: "#fff", marginBottom: "8px" }}>
                {userInfo.fullName}
              </Title>
              <Text
                style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.9)" }}
              >
                {userInfo.position} • {userInfo.department}
              </Text>
              <br />
              <Space style={{ marginTop: "16px" }}>
                <Badge
                  status={getUserStatusColor()}
                  text={
                    <span style={{ color: "#fff" }}>{getUserStatusText()}</span>
                  }
                />
                <Tag
                  color="rgba(255, 255, 255, 0.2)"
                  style={{ color: "#fff", border: "none" }}
                >
                  {userInfo.role}
                </Tag>
              </Space>
            </div>
          </Col>

          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <IdcardOutlined style={{ color: "#2563eb" }} />
                  Thông tin cá nhân
                </Space>
              }
              style={cardStyle}
              extra={
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEditProfile}
                >
                  Chỉnh sửa
                </Button>
              }
            >
              <Tabs
                defaultActiveKey="1"
                items={[
                  {
                    key: "1",
                    label: (
                      <span>
                        <UserOutlined />
                        Thông tin chung
                      </span>
                    ),
                    children: (
                      <Descriptions column={2} bordered>
                        <Descriptions.Item label="Họ tên" span={2}>
                          <Text strong>{userInfo.fullName}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã nhân viên">
                          <Tag color="blue">{userInfo.employeeCode}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                          {userInfo.gender}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                          <Space>
                            <MailOutlined style={{ color: "#2563eb" }} />
                            {userInfo.email}
                            {userInfo.emailConfirmed && (
                              <CheckCircleOutlined
                                style={{ color: "#059669" }}
                              />
                            )}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                          <Space>
                            <PhoneOutlined style={{ color: "#2563eb" }} />
                            {userInfo.phoneNumber || "Chưa cập nhật"}
                            {userInfo.phoneNumberConfirmed &&
                              userInfo.phoneNumber && (
                                <CheckCircleOutlined
                                  style={{ color: "#059669" }}
                                />
                              )}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Chức vụ" span={2}>
                          <Text strong>{userInfo.position}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng ban" span={2}>
                          <Space>
                            <TeamOutlined style={{ color: "#2563eb" }} />
                            {userInfo.department}
                          </Space>
                        </Descriptions.Item>
                      </Descriptions>
                    ),
                  },
                  {
                    key: "2",
                    label: (
                      <span>
                        <SecurityScanOutlined />
                        Bảo mật
                      </span>
                    ),
                    children: (
                      <div>
                        <Alert
                          message="Tình trạng bảo mật tài khoản"
                          description={`Tài khoản của bạn đang ở trạng thái ${getUserStatusText().toLowerCase()}. Đăng nhập lần cuối: ${formatDateTime(
                            userInfo.lastLoginDate
                          )}`}
                          type={
                            getUserStatusColor() === "success"
                              ? "success"
                              : "warning"
                          }
                          showIcon
                          style={{ marginBottom: "24px" }}
                        />

                        <Descriptions column={2} bordered>
                          <Descriptions.Item label="Xác thực email">
                            <Badge
                              status={
                                userInfo.emailConfirmed ? "success" : "error"
                              }
                              text={
                                userInfo.emailConfirmed
                                  ? "Đã xác thực"
                                  : "Chưa xác thực"
                              }
                            />
                          </Descriptions.Item>
                          <Descriptions.Item label="Xác thực số điện thoại">
                            <Badge
                              status={
                                userInfo.phoneNumberConfirmed
                                  ? "success"
                                  : "default"
                              }
                              text={
                                userInfo.phoneNumberConfirmed
                                  ? "Đã xác thực"
                                  : "Chưa xác thực"
                              }
                            />
                          </Descriptions.Item>
                          <Descriptions.Item label="Xác thực 2 bước">
                            <Badge
                              status={
                                userInfo.twoFactorEnabled
                                  ? "success"
                                  : "default"
                              }
                              text={
                                userInfo.twoFactorEnabled
                                  ? "Đã bật"
                                  : "Chưa bật"
                              }
                            />
                          </Descriptions.Item>
                          <Descriptions.Item label="Khóa tài khoản">
                            <Badge
                              status={
                                userInfo.lockoutEnabled ? "warning" : "success"
                              }
                              text={
                                userInfo.lockoutEnabled
                                  ? "Có thể bị khóa"
                                  : "Không khóa"
                              }
                            />
                          </Descriptions.Item>
                          <Descriptions.Item
                            label="Số lần đăng nhập sai"
                            span={2}
                          >
                            <Text
                              style={{
                                color:
                                  userInfo.accessFailedCount > 0
                                    ? "#dc2626"
                                    : "#059669",
                              }}
                            >
                              {userInfo.accessFailedCount} lần
                            </Text>
                          </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Space>
                          <Button
                            type="primary"
                            icon={<SafetyOutlined />}
                            onClick={handleChangePassword}
                          >
                            Đổi mật khẩu
                          </Button>
                          <Button
                            icon={<SettingOutlined />}
                            disabled={userInfo.twoFactorEnabled}
                          >
                            Bật xác thực 2 bước
                          </Button>
                        </Space>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: "#2563eb" }} />
                  Hoạt động gần đây
                </Space>
              }
              style={cardStyle}
            >
              <Timeline
                items={activityLog.map((activity, index) => ({
                  color: statusColors[activity.status],
                  dot: <CheckCircleOutlined style={{ fontSize: "16px" }} />,
                  children: (
                    <div>
                      <Text strong>{activity.action}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {formatDateTime(activity.date)}
                      </Text>
                    </div>
                  ),
                }))}
              />

              <Divider />

              <div style={{ textAlign: "center" }}>
                <Button type="link">Xem tất cả hoạt động</Button>
              </div>
            </Card>

            <Card
              title="Thông tin hệ thống"
              style={{ ...cardStyle, marginTop: "24px" }}
              size="small"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="ID người dùng">
                  <Text code style={{ fontSize: "11px" }}>
                    {userInfo.id}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo tài khoản">
                  {formatDateTime(userInfo.createdDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Đăng nhập cuối">
                  {formatDateTime(userInfo.lastLoginDate)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default Profile;
