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
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import signalRService from "../../services/signalRService";
import * as notificationService from "../../services/notificationService";
import styles from "../../styles/pages/TechnicianManagerLayout.module.css";

// Import technician manager pages
import TechnicianManagerDashboard from "./TechnicianManagerDashboard";
import IncidentManagement from "./IncidentList";
import MaintenancePlanManagement from "./MaintenanceManagement";
import NotificationsList from "./NotificationsList";
import ReplacementReturnPage from "./ReplacementReturnPage";
import ReplacementHistoryPage from "./ReplacementHistoryPage";
import KtvReturnConfirmPage from "../TechnicianPage/KtvReturnConfirmPage";

const { Header, Sider, Content } = AntLayout;
const { Title, Text } = Typography;

const TechnicianManagerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
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

  // Fetch notifications list
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const data = await notificationService.getNotifications(false); // Get all notifications
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Initialize SignalR connection
  useEffect(() => {
    let notificationHandler = null;

    const initializeSignalR = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.warn("No token found, skipping SignalR connection");
          return;
        }

        // Check if already connected to avoid duplicate connections
        if (signalRService.isConnected) {
          console.log("SignalR already connected, setting up listener only");
        } else {
          // Start SignalR connection
          await signalRService.startConnection(token);
        }

        // Define notification handler
        notificationHandler = (notificationData) => {
          console.log(
            "📩 [TechnicianManagerLayout] Received notification:",
            notificationData
          );

          // Tăng số lượng notification badge NGAY LẬP TỨC
          setNotificationCount((prev) => {
            const newCount = prev + 1;
            console.log(`📊 Badge count updated: ${prev} -> ${newCount}`);
            return newCount;
          });

          // Tự động refresh danh sách nếu drawer đang mở
          if (notificationDrawerOpen) {
            fetchNotifications();
          }

          // Note: Toast message removed to avoid duplicate notifications
          // User can see notifications in the notification drawer (bell icon)
        };

        // Lắng nghe thông báo cá nhân (listener được track trong service để tránh duplicate)
        signalRService.onReceiveNotification(notificationHandler);
      } catch (error) {
        console.error("❌ Error initializing SignalR:", error);
      }
    };

    initializeSignalR();

    // Cleanup function - pass the specific handler to remove
    return () => {
      console.log(
        "🧹 Cleaning up SignalR listeners in TechnicianManagerLayout"
      );
      if (notificationHandler) {
        signalRService.offReceiveNotification(notificationHandler);
      }
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
      key: "maintenance",
      icon: <SafetyOutlined />,
      label: "Kế hoạch bảo trì",
      onClick: () => navigate("/technician-manager/maintenance-plans"),
    },
    {
      key: "replacement-history",
      icon: <FileTextOutlined />,
      label: "Lịch sử thay thế",
      onClick: () => navigate("/technician-manager/replacement-history"),
    },
    // {
    //   key: "returns",
    //   icon: <EditOutlined />,
    //   label: "Xác nhận trả lại",
    //   onClick: () => navigate("/technician-manager/replacement-returns"),
    // },
    // {
    //   key: "ktv-confirm-return",
    //   icon: <CheckCircleOutlined />,
    //   label: "Xác nhận đã giao kho",
    //   onClick: () => navigate("/technician-manager/ktv-confirm-return"),
    // },
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
    } else if (path.includes("maintenance-plans")) {
      return <MaintenancePlanManagement />;
    } else if (path.includes("replacement-history")) {
      return <ReplacementHistoryPage />;
    } else if (path.includes("replacement-returns")) {
      return <ReplacementReturnPage />;
    } else if (path.includes("ktv-confirm-return")) {
      return <KtvReturnConfirmPage />;
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
      label: "Thông tin cá nhân",
      onClick: () => navigate("/profile"),
    },
    // {
    //   key: "notifications",
    //   icon: <BellOutlined />,
    //   label: "Thông báo",
    //   onClick: () => setNotificationDrawerOpen(true),
    // },
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
                // Tự động load danh sách thông báo khi mở drawer
                fetchNotifications();
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
        <NotificationsList
          onClose={() => setNotificationDrawerOpen(false)}
          onNotificationCountChange={(newCount) =>
            setNotificationCount(newCount)
          }
          initialNotifications={notifications}
          initialLoading={notificationsLoading}
          onRefresh={fetchNotifications}
        />
      </Drawer>
    </AntLayout>
  );
};

export default TechnicianManagerLayout;
