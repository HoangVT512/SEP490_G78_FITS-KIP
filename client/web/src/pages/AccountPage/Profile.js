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
  Form,
  Input,
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
  const [phoneVerifyModalVisible, setPhoneVerifyModalVisible] = useState(false);
  const [phoneVerifyStep, setPhoneVerifyStep] = useState(1); // 1: Send OTP, 2: Verify OTP
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
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

  const handleSendPhoneVerification = async () => {
    setSendingOtp(true);
    try {
      // Convert phone number to +84 format
      const phoneNumber = userInfo.phoneNumber.startsWith("0")
        ? "+84" + userInfo.phoneNumber.substring(1)
        : userInfo.phoneNumber;

      const response = await authService.sendPhoneVerificationOtp(phoneNumber);
      if (response.success) {
        message.success("Mã OTP đã được gửi đến số điện thoại của bạn");
        setPhoneVerifyStep(2);
      } else {
        message.error(response.message || "Không thể gửi mã OTP");
      }
    } catch (error) {
      message.error(error.message || "Đã có lỗi xảy ra khi gửi mã OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      message.error("Vui lòng nhập mã OTP gồm 6 chữ số");
      return;
    }

    setVerifyingOtp(true);
    try {
      // Convert phone number to +84 format
      const phoneNumber = userInfo.phoneNumber.startsWith("0")
        ? "+84" + userInfo.phoneNumber.substring(1)
        : userInfo.phoneNumber;

      const response = await authService.verifySmsOtp(phoneNumber, otpCode);
      if (response.success) {
        message.success("Xác thực số điện thoại thành công!");
        
        // Update user info to reflect phone confirmation
        setUserInfo({ ...userInfo, phoneNumberConfirmed: true });
        
        // Refresh user data from server
        const updatedUser = await authService.getCurrentUser();
        if (updatedUser) {
          setUserInfo({
            ...userInfo,
            phoneNumberConfirmed: updatedUser.phoneNumberConfirmed || true,
          });
        }
        
        setPhoneVerifyModalVisible(false);
        setPhoneVerifyStep(1);
        setOtpCode("");
      } else {
        message.error(response.message || "Mã OTP không hợp lệ hoặc đã hết hạn");
      }
    } catch (error) {
      message.error(error.message || "Xác thực thất bại");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOpenPhoneVerifyModal = () => {
    setPhoneVerifyModalVisible(true);
    setPhoneVerifyStep(1);
    setOtpCode("");
  };

  const handleClosePhoneVerifyModal = () => {
    setPhoneVerifyModalVisible(false);
    setPhoneVerifyStep(1);
    setOtpCode("");
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
                          <Space direction="vertical" style={{ width: "100%" }}>
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
                            {!userInfo.phoneNumberConfirmed && userInfo.phoneNumber && (
                              <Button
                                type="primary"
                                size="small"
                                icon={<VerifiedOutlined />}
                                onClick={handleOpenPhoneVerifyModal}
                              >
                                Xác thực số điện thoại
                              </Button>
                            )}
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

      {/* Phone Verification Modal */}
      <Modal
        title="Xác thực số điện thoại"
        open={phoneVerifyModalVisible}
        onCancel={handleClosePhoneVerifyModal}
        footer={null}
        width={500}
      >
        {phoneVerifyStep === 1 ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <PhoneOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }} />
            <Title level={4}>Xác thực số điện thoại</Title>
            <Text>
              Chúng tôi sẽ gửi mã OTP đến số điện thoại{" "}
              <Text strong>{userInfo?.phoneNumber}</Text>
            </Text>
            <div style={{ marginTop: 24 }}>
              <Button
                type="primary"
                size="large"
                loading={sendingOtp}
                onClick={handleSendPhoneVerification}
                block
              >
                Gửi mã OTP
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "20px 0" }}>
            <Title level={4} style={{ textAlign: "center" }}>
              Nhập mã OTP
            </Title>
            <Text style={{ display: "block", textAlign: "center", marginBottom: 24 }}>
              Mã OTP đã được gửi đến {userInfo?.phoneNumber}
            </Text>
            <Form layout="vertical">
              <Form.Item
                label="Mã OTP (6 chữ số)"
                required
              >
                <Input
                  size="large"
                  placeholder="Nhập mã OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  style={{ textAlign: "center", fontSize: 20, letterSpacing: 8 }}
                />
              </Form.Item>
              <Form.Item>
                <Space style={{ width: "100%" }} direction="vertical">
                  <Button
                    type="primary"
                    size="large"
                    loading={verifyingOtp}
                    onClick={handleVerifyPhoneOtp}
                    block
                  >
                    Xác thực
                  </Button>
                  <Button
                    size="large"
                    loading={sendingOtp}
                    onClick={handleSendPhoneVerification}
                    block
                  >
                    Gửi lại mã OTP
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Profile;
