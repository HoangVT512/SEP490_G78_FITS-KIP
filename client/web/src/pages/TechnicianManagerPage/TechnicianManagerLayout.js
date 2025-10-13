import React, { useState } from "react";
import {
  Layout as AntLayout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Button,
  message,
  Typography,
} from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  ToolOutlined,
  WarningOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SafetyOutlined,
  EditOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../../styles/components/TechnicianManagerLayout.module.css";

// Import technician manager pages
import TechnicianManagerDashboard from "./TechnicianManagerDashboard";
import InventoryManagement from "./InventoryManagement";
import PurchaseRequestManagement from "./PurchaseRequestManagement";
import MaintenanceManagement from "./MaintenanceManagement";
import IncidentList from "./IncidentList";

const { Header, Sider, Content } = AntLayout;
const { Title, Text } = Typography;

const TechnicianManagerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Get technician manager user info from context
  const techManagerUser = {
    name: user?.fullName || "Technician Manager",
    email: user?.email || "techmanager@fitskip.com",
    avatar: null,
    role: user?.roles?.[0] || "Quản lý kỹ thuật",
  };

  // Update selected key based on current route
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes("/inventory")) {
      setSelectedKey("inventory");
    } else if (path.includes("/purchase-requests")) {
      setSelectedKey("purchase-requests");
    } else if (path.includes("/maintenance")) {
      setSelectedKey("maintenance");
    } else if (path.includes("/incidents")) {
      setSelectedKey("incidents");
    } else {
      setSelectedKey("dashboard");
    }
  }, [location]);

  // Render page content based on path
  const renderContent = () => {
    const path = location.pathname;

    if (path.includes("/inventory")) {
      return <InventoryManagement />;
    } else if (path.includes("/purchase-requests")) {
      return <PurchaseRequestManagement />;
    } else if (path.includes("/maintenance")) {
      return <MaintenanceManagement />;
    } else if (path.includes("/incidents")) {
      return <IncidentList />;
    } else if (path === "/technician-manager" || path.includes("/dashboard")) {
      return <TechnicianManagerDashboard />;
    }

    // Default to dashboard
    return <TechnicianManagerDashboard />;
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "inventory",
      icon: <InboxOutlined />,
      label: "Quản lý kho phụ tùng",
    },
    {
      key: "purchase-requests",
      icon: <ShoppingOutlined />,
      label: "Yêu cầu mua hàng",
    },
    {
      key: "maintenance",
      icon: <ToolOutlined />,
      label: "Quản lý bảo trì",
    },
    {
      key: "incidents",
      icon: <WarningOutlined />,
      label: "Danh sách sự cố",
    },
  ];

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    switch (key) {
      case "dashboard":
        navigate("/technician-manager/dashboard");
        break;
      case "inventory":
        navigate("/technician-manager/inventory");
        break;
      case "purchase-requests":
        navigate("/technician-manager/purchase-requests");
        break;
      case "maintenance":
        navigate("/technician-manager/maintenance");
        break;
      case "incidents":
        navigate("/technician-manager/incidents");
        break;
      default:
        navigate("/technician-manager/dashboard");
    }
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
      onClick: async () => {
        await logout();
        message.success("Đăng xuất thành công!");
        navigate("/login");
      },
    },
  ];

  // Styles
  const siderStyle = {
    overflow: "auto",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    background: "linear-gradient(180deg, #283652 0%, #283652 100%)",
    boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
  };

  const SIDER_EXPANDED_WIDTH = 280;
  const SIDER_COLLAPSED_WIDTH = 64;

  const headerStyle = {
    background: "#fff",
    padding: "0 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft:
      collapsed && !hovered ? SIDER_COLLAPSED_WIDTH : SIDER_EXPANDED_WIDTH,
    transition: "margin-left 0.2s",
  };

  const contentStyle = {
    marginLeft:
      collapsed && !hovered ? SIDER_COLLAPSED_WIDTH : SIDER_EXPANDED_WIDTH,
    padding: 0,
    minHeight: "calc(100vh - 70px)",
    backgroundColor: "#f8fafc",
    transition: "margin-left 0.2s",
  };

  const logoStyle = {
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: collapsed && !hovered ? "center" : "flex-start",
    padding: collapsed && !hovered ? "0" : "0 16px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "8px",
  };

  const menuStyle = {
    background: "transparent",
    border: "none",
    fontSize: "14px",
  };

  return (
    <AntLayout
      className={styles.techManagerLayout}
      style={{ minHeight: "100vh" }}
    >
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed && !hovered}
        onCollapse={setCollapsed}
        onMouseEnter={() => {
          if (!collapsed) setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)}
        width={SIDER_EXPANDED_WIDTH}
        collapsedWidth={SIDER_COLLAPSED_WIDTH}
        style={siderStyle}
        trigger={null}
      >
        {/* Logo */}
        <div style={logoStyle}>
          {!collapsed && (
            <Title
              level={4}
              style={{ color: "#fff", margin: 0, fontSize: "16px" }}
            >
              ⚙️ FITS-KIP Quản lý KT
            </Title>
          )}
          {collapsed && (
            <Text style={{ color: "#fff", fontSize: "20px" }}>⚙️</Text>
          )}
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          inlineCollapsed={collapsed && !hovered}
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={menuStyle}
          items={menuItems}
        />

        {/* Collapse button */}
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() =>
              setCollapsed((prev) => {
                const next = !prev;
                if (next) setHovered(false);
                return next;
              })
            }
            style={{
              color: "#fff",
              border: "none",
              background: "rgba(255,255,255,0.1)",
              width: "40px",
              height: "40px",
            }}
          />
        </div>
      </Sider>

      <AntLayout>
        {/* Header */}
        <Header style={headerStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
              {menuItems.find((item) => item.key === selectedKey)?.label ||
                "Tổng quan"}
            </Title>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Notifications */}
            <Badge count={5} size="small" className={styles.notificationBadge}>
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ color: "#6b7280" }}
              />
            </Badge>

            {/* User dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className={styles.userDropdown}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={techManagerUser.avatar}
                  style={{ backgroundColor: "#334766" }}
                />
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{techManagerUser.name}</div>
                  <div className={styles.userRole}>{techManagerUser.role}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={contentStyle}>
          <div className={styles.techManagerContent}>{renderContent()}</div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default TechnicianManagerLayout;
