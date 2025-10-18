import React, { useState, useEffect } from "react";
import {
  Layout as AntLayout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Button,
  Typography,
  Drawer,
  App,
  message as antdMessage,
  notification as antdNotification,
} from "antd";
import {
  DashboardOutlined,
  ToolOutlined,
  FileTextOutlined,
  WarningOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SafetyOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import signalRService from "../../services/signalRService";
import * as notificationService from "../../services/notificationService";
import styles from "../../styles/pages/TechnicianManagerLayout.module.css";

// Import technician manager pages
import TechnicianManagerDashboard from "./TechnicianManagerDashboard";
import IncidentManagement from "./IncidentList";
import InventoryManagement from "./InventoryManagement";
import PurchaseRequestManagement from "./PurchaseRequestManagement";
import MaintenancePlanManagement from "./MaintenanceManagement";
import NotificationsList from "../ManagerPage/NotificationsList";

const { Header, Sider, Content } = AntLayout;
const { Title, Text } = Typography;

const TechnicianManagerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Get technician manager user info from context
  const technicianManagerUser = {
    name: user?.fullName || "Quản lý kỹ thuật",
    email: user?.email || "tech-manager@fitskip.com",
    avatar: null,
    role: user?.roles?.[0] || "Quản lý kỹ thuật",
  };

  // Fetch initial unread notification count from DB
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setNotificationCount(count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
  }, []);

  // Initialize SignalR connection
  useEffect(() => {
    const initializeSignalR = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.warn("No token found, skipping SignalR connection");
          return;
        }

        // Start SignalR connection
        await signalRService.startConnection(token);

        // Lắng nghe thông báo cá nhân
        signalRService.onReceiveNotification((notificationData) => {
          console.log("📩 Received notification:", notificationData);

          // Tăng số lượng notification badge
          setNotificationCount((prev) => prev + 1);

          // Hiển thị message toast (LUÔN LUÔN hiển thị)
          antdMessage.success({
            content: `🔔 ${
              notificationData.title ||
              notificationData.message ||
              "Bạn có thông báo mới"
            }`,
            duration: 5,
          });
        });
      } catch (error) {
        console.error("❌ Error initializing SignalR:", error);
      }
    };

    initializeSignalR();

    // Cleanup function
    return () => {
      signalRService.offReceiveNotification();
    };
  }, []); // Empty dependency array - only run once on mount

  // Menu items for technician manager
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Bảng điều khiển",
      onClick: () => navigate("/technician-manager/dashboard"),
    },
    {
      key: "incidents",
      icon: <WarningOutlined />,
      label: "Quản lý sự cố",
      onClick: () => navigate("/technician-manager/incidents"),
    },
    {
      key: "inventory",
      icon: <ToolOutlined />,
      label: "Quản lý phụ tùng",
      onClick: () => navigate("/technician-manager/inventory"),
    },
    {
      key: "purchase",
      icon: <FileTextOutlined />,
      label: "Yêu cầu mua hàng",
      onClick: () => navigate("/technician-manager/purchase-requests"),
    },
    {
      key: "maintenance",
      icon: <SafetyOutlined />,
      label: "Kế hoạch bảo trì",
      onClick: () => navigate("/technician-manager/maintenance-plans"),
    },
  ];

  // Handle menu click
  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      antdMessage.error("Lỗi khi đăng xuất");
    }
  };

  // Get current content based on selected menu
  const getContent = () => {
    const path = location.pathname;

    if (path.includes("dashboard")) {
      return <TechnicianManagerDashboard />;
    } else if (path.includes("incidents")) {
      return <IncidentManagement />;
    } else if (path.includes("inventory")) {
      return <InventoryManagement />;
    } else if (path.includes("purchase-requests")) {
      return <PurchaseRequestManagement />;
    } else if (path.includes("maintenance-plans")) {
      return <MaintenancePlanManagement />;
    } else if (path.includes("notifications")) {
      return <NotificationsList />;
    }

    return <TechnicianManagerDashboard />;
  };

  const SIDER_EXPANDED_WIDTH = 280;
  const SIDER_COLLAPSED_WIDTH = 64;

  const siderStyle = {
    background: "linear-gradient(180deg, #283652 0%, #283652 100%)",
    overflow: "auto",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
  };

  const contentWrapperStyle = {
    marginLeft:
      collapsed && !hovered ? SIDER_COLLAPSED_WIDTH : SIDER_EXPANDED_WIDTH,
    transition: "margin-left 0.2s",
  };

  const menuStyle = {
    background: "transparent",
    border: "none",
    fontSize: "14px",
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ",
      onClick: () => navigate("/profile"),
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: "Thông báo",
      onClick: () => setNotificationDrawerOpen(true),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout
      className={styles.technicianManagerLayout}
      style={{ minHeight: "100vh" }}
    >
      {/* Sider */}
      <Sider
        collapsible
        theme="dark"
        collapsed={collapsed && !hovered}
        onCollapse={setCollapsed}
        onMouseEnter={() => {
          // Only enable temporary hover-expand when the sider is not in collapsed state.
          // This prevents a collapsed sider from auto-expanding on hover; user must click to expand.
          if (!collapsed) setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)}
        width={SIDER_EXPANDED_WIDTH}
        collapsedWidth={SIDER_COLLAPSED_WIDTH}
        style={siderStyle}
        trigger={null}
      >
        {/* Logo */}
        <div className={styles.technicianManagerLogo}>
          {!collapsed && (
            <Title
              level={4}
              style={{ color: "#fff", margin: 0, fontSize: "16px" }}
            >
              🔧 FITS-KIP QLKT
            </Title>
          )}
          {collapsed && (
            <Text style={{ color: "#fff", fontSize: "20px" }}>🔧</Text>
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
                // If collapsing (next === true), clear hovered so visual collapse is immediate
                if (next) setHovered(false);
                return next;
              })
            }
            className={styles.collapseButton}
          />
        </div>
      </Sider>

      {/* Layout */}
      <AntLayout style={contentWrapperStyle}>
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
              {menuItems.find((item) => item.key === selectedKey)?.label ||
                "Bảng điều khiển QLKT"}
            </Title>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* Notifications Badge */}
            <Badge
              count={notificationCount}
              onClick={() => {
                setNotificationDrawerOpen(true);
                // Refresh unread count from server
                notificationService.getUnreadCount().then((count) => {
                  setNotificationCount(count);
                });
              }}
              style={{ cursor: "pointer" }}
            >
              <BellOutlined style={{ fontSize: "18px", cursor: "pointer" }} />
            </Badge>

            {/* User Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
              <div className={styles.userDropdown}>
                <Avatar size={32} icon={<UserOutlined />} />
                <div className={styles.userInfo}>
                  <div className={styles.userName}>
                    {technicianManagerUser.name}
                  </div>
                  <div className={styles.userRole}>
                    {technicianManagerUser.role}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: "#fff",
            borderRadius: "8px",
            minHeight: "calc(100vh - 112px)",
          }}
        >
          {getContent()}
        </Content>
      </AntLayout>

      {/* Notifications Drawer */}
      <Drawer
        title="Thông báo"
        placement="right"
        onClose={() => setNotificationDrawerOpen(false)}
        open={notificationDrawerOpen}
        width={720}
        styles={{ body: { padding: 0 } }}
      >
        <NotificationsList onClose={() => setNotificationDrawerOpen(false)} />
      </Drawer>
    </AntLayout>
  );
};

export default TechnicianManagerLayout;
