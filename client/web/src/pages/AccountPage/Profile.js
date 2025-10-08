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
  Alert,
  Spin,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  IdcardOutlined,
  SecurityScanOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { authService } from "../../services/authService";
import styles from "../../styles/pages/Profile.module.css";

const { Title, Text } = Typography;

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  // Check for update success parameter - only runs once on mount
  useEffect(() => {
    const hasUpdatedParam = searchParams.get("updated") === "true";

    if (hasUpdatedParam) {
      // Use setTimeout to ensure message only shows once
      const timer = setTimeout(() => {
        message.success(
          "Cập nhật thành công! Thông tin cá nhân của bạn đã được cập nhật."
        );
      }, 0);

      // Remove the parameter from URL immediately
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("updated");
      const newUrl = newSearchParams.toString()
        ? `${window.location.pathname}?${newSearchParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);

        const storedUser = authService.getStoredUser();

        if (storedUser) {
          setUserInfo({
            id: storedUser.id,
            fullName: storedUser.fullName || "Chưa cập nhật",
            employeeCode: storedUser.employeeCode || "Chưa có",
            email: storedUser.email || "Chưa cập nhật",
            phoneNumber: storedUser.phoneNumber || null,
            department: "Chưa phân phòng ban",
            role: storedUser.roles
              ? storedUser.roles.join(", ")
              : "Chưa có vai trò",
            emailConfirmed: storedUser.emailConfirmed || false,
            phoneNumberConfirmed: storedUser.phoneNumberConfirmed || false,
            twoFactorEnabled: storedUser.twoFactorEnabled || false,
            lockoutEnabled: storedUser.lockoutEnabled || false,
            accessFailedCount: storedUser.accessFailedCount || 0,
            lastLoginDate: new Date().toISOString(),
            createdDate: "2024-01-15T09:00:00",
          });
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        if (!authService.isLoggedIn()) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  const handleChangePassword = () => {
    navigate("/profile/change-password");
  };

  const getDashboardPath = () => {
    if (authService.isAdmin()) {
      return "/admin";
    }
    // Default dashboard for regular users
    return "/dashboard"; // You can change this to appropriate user dashboard
  };

  const handleBackToDashboard = () => {
    const dashboardPath = getDashboardPath();
    navigate(dashboardPath);
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

  if (loading) {
    return (
      <Layout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <Spin size="large" />
          <Text style={{ marginLeft: 16 }}>
            Đang tải thông tin người dùng...
          </Text>
        </div>
      </Layout>
    );
  }

  if (!userInfo) {
    return (
      <Layout>
        <Alert
          message="Không thể tải thông tin người dùng"
          description="Vui lòng thử đăng nhập lại."
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate("/login")}>
              Đăng nhập lại
            </Button>
          }
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.profileContainer}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <div className={styles.profileHeaderCard}>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                className={styles.profileHeaderAvatar}
              />
              <Title level={2} className={styles.profileHeaderTitle}>
                {userInfo.fullName}
              </Title>
              <Text className={styles.profileHeaderSubtitle}>
                {userInfo.department}
              </Text>
              <Space className={styles.profileHeaderBadges}>
                <Badge
                  status={getUserStatusColor()}
                  text={
                    <span className={styles.profileBadgeText}>
                      {getUserStatusText()}
                    </span>
                  }
                />
                <Tag className={styles.profileRoleTag}>{userInfo.role}</Tag>
              </Space>
              <div style={{ marginTop: 16 }}>
                <Button
                  type="default"
                  icon={<DashboardOutlined />}
                  onClick={handleBackToDashboard}
                  style={{
                    borderColor: "#334766",
                    color: "#334766",
                  }}
                >
                  Quay về trang quản lý
                </Button>
              </div>
            </div>
          </Col>

          <Col xs={24}>
            <Card
              title={
                <Space>
                  <IdcardOutlined className={styles.profileIconIdcard} />
                  Thông tin cá nhân
                </Space>
              }
              className={styles.profileInfoCard}
              extra={
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEditProfile}
                  className={styles.profileEditButton}
                >
                  Chỉnh sửa
                </Button>
              }
            >
              <Tabs
                defaultActiveKey="1"
                className={styles.profileTabs}
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
                          <Tag className={styles.profileTagEmployeeCode}>
                            {userInfo.employeeCode}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                          <Space>
                            <MailOutlined className={styles.profileIconEmail} />
                            {userInfo.email}
                            {userInfo.emailConfirmed && (
                              <CheckCircleOutlined
                                className={styles.profileIconVerified}
                              />
                            )}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                          <Space>
                            <PhoneOutlined
                              className={styles.profileIconPhone}
                            />
                            {userInfo.phoneNumber || "Chưa cập nhật"}
                            {userInfo.phoneNumberConfirmed &&
                              userInfo.phoneNumber && (
                                <CheckCircleOutlined
                                  className={styles.profileIconVerified}
                                />
                              )}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Chức vụ" span={2}>
                          <Text strong>{userInfo.position}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng ban" span={2}>
                          <Space>
                            <TeamOutlined className={styles.profileIconTeam} />
                            {userInfo.department}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo tài khoản" span={2}>
                          {formatDateTime(userInfo.createdDate)}
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
                          className={styles.profileSecurityAlert}
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
                          <Descriptions.Item label="Khóa tài khoản" span={2}>
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
                        </Descriptions>

                        <Divider />

                        <Button
                          type="primary"
                          icon={<SafetyOutlined />}
                          onClick={handleChangePassword}
                          className={styles.profileChangePasswordButton}
                        >
                          Đổi mật khẩu
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default Profile;
