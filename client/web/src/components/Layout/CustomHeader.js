import React from "react";
import {
  Layout as AntLayout,
  Typography,
  Button,
  Dropdown,
  Avatar,
  message,
} from "antd";
import {
  HomeOutlined,
  LoginOutlined,
  ToolOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  SafetyOutlined,
  EditOutlined,
  DashboardOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Header } = AntLayout;
const { Text } = Typography;

const CustomHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      await logout();
      console.log('Logout completed, navigating to /login');
      message.success("Đăng xuất thành công!");
      // Add small delay before navigating to ensure logout state has propagated
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 200);
    } catch (error) {
      console.error('Logout error:', error);
      message.error("Đã có lỗi xảy ra khi đăng xuất!");
    }
  };

  const headerStyles = {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    height: "70px",
    padding: "0 32px",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const titleStyles = {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "600",
    letterSpacing: "0.5px",
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    margin: 0,
  };

  const buttonStyles = {
    color: "rgba(255, 255, 255, 0.9)",
    borderColor: "transparent",
    fontWeight: "500",
    fontSize: "14px",
    height: "40px",
    borderRadius: "8px",
    marginRight: "8px",
  };

  const loginButtonStyles = {
    background: "#fff",
    color: "#2563eb",
    border: "1px solid #fff",
    fontWeight: "600",
    fontSize: "14px",
    padding: "0 20px",
    height: "40px",
    borderRadius: "8px",
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => navigate("/profile"),
    },
    {
      key: "edit-profile",
      icon: <EditOutlined />,
      label: "Chỉnh sửa thông tin",
      onClick: () => navigate("/profile/edit"),
    },
    {
      key: "change-password",
      icon: <SafetyOutlined />,
      label: "Đổi mật khẩu",
      onClick: () => navigate("/profile/change-password"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <Header style={headerStyles}>
      <Text style={titleStyles}>🏭 FITS-KIP Factory Management</Text>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Button
          type={
            location.pathname === "/dashboard" || location.pathname === "/"
              ? "primary"
              : "text"
          }
          icon={<HomeOutlined />}
          onClick={() => navigate("/dashboard")}
          style={buttonStyles}
        >
          Trang chủ
        </Button>
        <Button
          type={location.pathname === "/maintenance" ? "primary" : "text"}
          icon={<ToolOutlined />}
          onClick={() => navigate("/maintenance")}
          style={buttonStyles}
        >
          Bảo trì
        </Button>
        {isAdmin && (
          <Button
            type={location.pathname.startsWith("/admin") ? "primary" : "text"}
            icon={<SettingOutlined />}
            onClick={() => navigate("/admin")}
            style={buttonStyles}
          >
            Admin Panel
          </Button>
        )}
        {user ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#fff",
              }}
            >
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ backgroundColor: "#fff", color: "#2563eb" }}
              />
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                {user.fullName || user.email}
              </span>
            </div>
          </Dropdown>
        ) : (
          <Button
            type="default"
            icon={<LoginOutlined />}
            onClick={() => navigate("/login")}
            style={loginButtonStyles}
          >
            Đăng nhập
          </Button>
        )}
      </div>
    </Header>
  );
};

export default CustomHeader;
