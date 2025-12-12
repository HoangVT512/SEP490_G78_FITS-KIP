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
  Modal,
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
  VerifiedOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { authService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../../styles/pages/Profile.module.css";

const { Title, Text } = Typography;

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const {
    isAdmin,
    isTeamLeader,
    isTechnician,
    isTechnicianManager,
    isManager,
    isWarehouseManager,
  } = useAuth();

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

        // Prefer fetching fresh user data from server so verification flags are up-to-date
        const currentUser = await authService.getCurrentUser();

        if (currentUser) {
          setUserInfo({
            id: currentUser.id,
            fullName:
              currentUser.fullName || currentUser.fullName || "Chưa cập nhật",
            employeeCode: currentUser.employeeCode || "Chưa có",
            email: currentUser.email || "Chưa cập nhật",
            phoneNumber: currentUser.phoneNumber || null,
            department: currentUser.department || "Chưa phân phòng ban",
            role: currentUser.roles
              ? currentUser.roles.join(", ")
              : "Chưa có vai trò",
            isActive:
              currentUser.isActive !== undefined ? currentUser.isActive : true,
            emailConfirmed: currentUser.emailConfirmed || false,
            phoneNumberConfirmed: currentUser.phoneNumberConfirmed || false,
            twoFactorEnabled: currentUser.twoFactorEnabled || false,
            lockoutEnabled: currentUser.lockoutEnabled || false,
            accessFailedCount: currentUser.accessFailedCount || 0,
            lastLoginDate: new Date().toISOString(),
            createdDate: currentUser.createdDate || "",
          });
        } else {
          // If API didn't return user, fallback to stored user or redirect to login
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
              isActive:
                storedUser.isActive !== undefined ? storedUser.isActive : true,
              emailConfirmed: storedUser.emailConfirmed || false,
              phoneNumberConfirmed: storedUser.phoneNumberConfirmed || false,
              twoFactorEnabled: storedUser.twoFactorEnabled || false,
              lockoutEnabled: storedUser.lockoutEnabled || false,
              accessFailedCount: storedUser.accessFailedCount || 0,
              lastLoginDate: new Date().toISOString(),
              createdDate: "",
            });
          } else {
            navigate("/login");
          }
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

  const handleSendEmailVerification = () => {
    Modal.confirm({
      title: "Xác thực Email",
      content:
        "Bạn có muốn gửi email xác thực đến địa chỉ email của bạn không?",
      okText: "Gửi",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await authService.sendEmailVerification();
          if (response.success) {
            message.success(
              response.message ||
                "Email xác thực đã được gửi. Vui lòng kiểm tra hộp thư của bạn."
            );
          } else {
            message.error(response.message || "Không thể gửi email xác thực");
          }
        } catch (error) {
          message.error(
            error.message || "Đã có lỗi xảy ra khi gửi email xác thực"
          );
        }
      },
    });
  };

  const getDashboardPath = () => {
    // Check role priority: Admin > Manager > TechnicianManager > WarehouseManager > TeamLeader > Technician
    if (isAdmin()) {
      return "/admin";
    }
    if (isManager()) {
      return "/manager";
    }
    if (isTechnicianManager()) {
      return "/technician-manager";
    }
    if (isWarehouseManager()) {
      return "/warehouse-manager";
    }
    if (isTeamLeader()) {
      return "/team-leader";
    }
    if (isTechnician()) {
      return "/technician";
    }
    // Default fallback
    return "/";
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
                <Space>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEditProfile}
                    className={styles.profileEditButton}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    type="default"
                    icon={<SafetyOutlined />}
                    onClick={handleChangePassword}
                    className={styles.profileChangePasswordButton}
                  >
                    Đổi mật khẩu
                  </Button>
                </Space>
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
                        <Descriptions.Item label="Email" span={2}>
                          <Space direction="vertical" style={{ width: "100%" }}>
                            <Space>
                              <MailOutlined
                                className={styles.profileIconEmail}
                              />
                              {userInfo.email || "Chưa cập nhật"}
                              {userInfo.emailConfirmed ? (
                                <CheckCircleOutlined
                                  className={styles.profileIconVerified}
                                />
                              ) : (
                                <Tag color="orange" style={{ marginLeft: 8 }}>
                                  Chưa xác thực
                                </Tag>
                              )}
                            </Space>
                            {!userInfo.emailConfirmed && userInfo.email && (
                              <Button
                                type="primary"
                                size="small"
                                icon={<VerifiedOutlined />}
                                onClick={handleSendEmailVerification}
                              >
                                Gửi email xác thực
                              </Button>
                            )}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                          <Space>
                            <PhoneOutlined
                              className={styles.profileIconPhone}
                            />
                            {userInfo.phoneNumber || "Chưa cập nhật"}
                            {userInfo.phoneNumber ? (
                              userInfo.phoneNumberConfirmed ? (
                                <CheckCircleOutlined
                                  className={styles.profileIconVerified}
                                />
                              ) : (
                                <Tag color="orange" style={{ marginLeft: 8 }}>
                                  Chưa xác thực
                                </Tag>
                              )
                            ) : null}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng ban">
                          <Space>
                            <TeamOutlined className={styles.profileIconTeam} />
                            {userInfo.department}
                          </Space>
                        </Descriptions.Item>
                      </Descriptions>
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
