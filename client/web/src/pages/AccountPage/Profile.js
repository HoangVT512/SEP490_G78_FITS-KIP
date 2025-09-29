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
import "../../styles/pages/Profile.css";

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
      <div className="profile-container">
        <Row gutter={[24, 24]}>
          <Col span={24}>
            {/* Profile Header */}
            <div className="profile-header-card">
              <Avatar
                size={100}
                icon={<UserOutlined />}
                className="profile-header-avatar"
              />
              <Title level={2} className="profile-header-title">
                {userInfo.fullName}
              </Title>
              <Text className="profile-header-subtitle">
                {userInfo.position} • {userInfo.department}
              </Text>
              <Space className="profile-header-badges">
                <Badge
                  status={getUserStatusColor()}
                  text={
                    <span className="profile-badge-text">
                      {getUserStatusText()}
                    </span>
                  }
                />
                <Tag className="profile-role-tag">{userInfo.role}</Tag>
              </Space>
            </div>
          </Col>

          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <IdcardOutlined className="profile-icon-idcard" />
                  Thông tin cá nhân
                </Space>
              }
              className="profile-info-card"
              extra={
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEditProfile}
                  className="profile-edit-button"
                >
                  Chỉnh sửa
                </Button>
              }
            >
              <Tabs
                defaultActiveKey="1"
                className="profile-tabs"
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
                          <Tag className="profile-tag-employee-code">
                            {userInfo.employeeCode}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                          {userInfo.gender}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                          <Space>
                            <MailOutlined className="profile-icon-email" />
                            {userInfo.email}
                            {userInfo.emailConfirmed && (
                              <CheckCircleOutlined className="profile-icon-verified" />
                            )}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                          <Space>
                            <PhoneOutlined className="profile-icon-phone" />
                            {userInfo.phoneNumber || "Chưa cập nhật"}
                            {userInfo.phoneNumberConfirmed &&
                              userInfo.phoneNumber && (
                                <CheckCircleOutlined className="profile-icon-verified" />
                              )}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Chức vụ" span={2}>
                          <Text strong>{userInfo.position}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng ban" span={2}>
                          <Space>
                            <TeamOutlined className="profile-icon-team" />
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
                          className="profile-security-alert"
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
                              className={`profile-failed-count ${
                                userInfo.accessFailedCount > 0
                                  ? "error"
                                  : "success"
                              }`}
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
                            className="profile-change-password-button"
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
                  <ClockCircleOutlined className="profile-icon-clock" />
                  Hoạt động gần đây
                </Space>
              }
              className="profile-activity-card"
            >
              <Timeline
                items={activityLog.map((activity, index) => ({
                  color: activity.status === "success" ? "#059669" : "#d97706",
                  dot: (
                    <CheckCircleOutlined className="profile-timeline-icon" />
                  ),
                  children: (
                    <div>
                      <Text strong>{activity.action}</Text>
                      <br />
                      <Text type="secondary" className="profile-timeline-date">
                        {formatDateTime(activity.date)}
                      </Text>
                    </div>
                  ),
                }))}
              />

              <Divider />

              <div className="profile-view-all-container">
                <Button type="link">Xem tất cả hoạt động</Button>
              </div>
            </Card>

            <Card
              title="Thông tin hệ thống"
              className="profile-system-card"
              size="small"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="ID người dùng">
                  <Text code className="profile-user-id">
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
