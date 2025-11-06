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
} from "antd";
import {
  DashboardOutlined,
  InboxOutlined,
  ShoppingOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  HistoryOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import signalRService from "../../services/signalRService";
import * as notificationService from "../../services/notificationService";
import styles from "../../styles/pages/WarehouseManagerLayout.module.css";

// Import warehouse manager pages
import WarehouseManagerDashboard from "./WarehouseManagerDashboard";
import InventoryManagement from "./InventoryManagement";
import PurchaseRequestManagement from "./PurchaseRequestManagement";
import SparePartsRequestApproval from "./SparePartsRequestApproval";
import ReturnConfirmation from "./ReturnConfirmation";
import InventoryReports from "./InventoryReports";
import TransactionHistory from "./TransactionHistory";
import NotificationsList from "./NotificationsList";

const { Header, Sider, Content } = AntLayout;
const { Title, Text } = Typography;

const WarehouseManagerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Get warehouse manager user info from context
  const warehouseManagerUser = {
    name: user?.fullName || "Warehouse Manager",
    email: user?.email || "warehouse@fitskip.com",
    avatar: null,
    role: user?.roles?.[0] || "Quản lý kho",
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

        // Listen for personal notifications
        signalRService.onReceiveNotification((notificationData) => {
          console.log("📩 Received notification:", notificationData);
          setNotificationCount((prev) => prev + 1);
        });

        // Listen for broadcast notifications
        signalRService.onReceiveBroadcast((broadcastData) => {
          console.log("📢 Received broadcast:", broadcastData);
          setNotificationCount((prev) => prev + 1);
        });

        console.log("✅ SignalR initialized successfully!");
      } catch (error) {
        console.error("❌ Failed to initialize SignalR:", error);
      }
    };

    initializeSignalR();

    // Cleanup on unmount
    return () => {
      signalRService.offReceiveNotification();
      signalRService.offReceiveBroadcast();
    };
  }, []);

  // Update selected key based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/inventory")) {
      setSelectedKey("inventory");
    } else if (path.includes("/purchase-requests")) {
      setSelectedKey("purchase-requests");
    } else if (path.includes("/spare-parts-requests")) {
      setSelectedKey("spare-parts-requests");
    } else if (path.includes("/return-confirmation")) {
      setSelectedKey("return-confirmation");
    } else if (path.includes("/reports")) {
      setSelectedKey("reports");
    } else if (path.includes("/history")) {
      setSelectedKey("history");
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
    } else if (path.includes("/spare-parts-requests")) {
      return <SparePartsRequestApproval />;
    } else if (path.includes("/return-confirmation")) {
      return <ReturnConfirmation />;
    } else if (path.includes("/reports")) {
      return <InventoryReports />;
    } else if (path.includes("/history")) {
      return <TransactionHistory />;
    } else if (path === "/warehouse-manager" || path.includes("/dashboard")) {
      return <WarehouseManagerDashboard />;
    }

    // Default to dashboard
    return <WarehouseManagerDashboard />;
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
      label: "Quản lý tồn kho",
    },
    {
      key: "spare-parts-requests",
      icon: <SwapOutlined />,
      label: "Duyệt yêu cầu phụ tùng",
    },
    {
      key: "return-confirmation",
      icon: <CheckCircleOutlined />,
      label: "Xác nhận trả lại",
    },
    {
      key: "purchase-requests",
      icon: <ShoppingOutlined />,
      label: "Yêu cầu mua hàng",
    },
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo kho",
    },
    {
      key: "history",
      icon: <HistoryOutlined />,
      label: "Lịch sử giao dịch",
    },
  ];

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    switch (key) {
      case "dashboard":
        navigate("/warehouse-manager/dashboard");
        break;
      case "inventory":
        navigate("/warehouse-manager/inventory");
        break;
      case "spare-parts-requests":
        navigate("/warehouse-manager/spare-parts-requests");
        break;
      case "return-confirmation":
        navigate("/warehouse-manager/return-confirmation");
        break;
      case "purchase-requests":
        navigate("/warehouse-manager/purchase-requests");
        break;
      case "reports":
        navigate("/warehouse-manager/reports");
        break;
      case "history":
        navigate("/warehouse-manager/history");
        break;
      default:
        navigate("/warehouse-manager/dashboard");
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
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: async () => {
        await logout();
        antdMessage.success("Đăng xuất thành công!");
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

  const menuStyle = {
    background: "transparent",
    border: "none",
    fontSize: "14px",
  };

  return (
    <App>
      <AntLayout
        className={styles.warehouseManagerLayout}
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
          <div className={styles.warehouseManagerLogo}>
            {!collapsed && (
              <Title
                level={4}
                style={{ color: "#fff", margin: 0, fontSize: "16px" }}
              >
                📦 FITS-KIP Quản lý kho
              </Title>
            )}
            {collapsed && (
              <Text style={{ color: "#fff", fontSize: "20px" }}>📦</Text>
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
            className={styles.collapseButton}
          />
        </Sider>

        <AntLayout>
          {/* Header */}
          <Header style={headerStyle}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
                {menuItems.find((item) => item.key === selectedKey)?.label ||
                  "Tổng quan"}
              </Title>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Notifications */}
              <Badge
                count={notificationCount}
                size="small"
                className={styles.notificationBadge}
              >
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{ color: "#6b7280" }}
                  onClick={() => {
                    setNotificationDrawerOpen(true);
                    notificationService.getUnreadCount().then((count) => {
                      setNotificationCount(count);
                    });
                  }}
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
                    src={warehouseManagerUser.avatar}
                    style={{ backgroundColor: "#334766" }}
                  />
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>
                      {warehouseManagerUser.name}
                    </div>
                    <div className={styles.userRole}>
                      {warehouseManagerUser.role}
                    </div>
                  </div>
                </div>
              </Dropdown>
            </div>
          </Header>

          {/* Content */}
          <Content style={contentStyle}>
            <div className={styles.warehouseManagerContent}>
              {renderContent()}
            </div>
          </Content>
        </AntLayout>

        {/* Notifications Drawer */}
        <Drawer
          title="Thông báo"
          placement="right"
          width={720}
          onClose={() => setNotificationDrawerOpen(false)}
          open={notificationDrawerOpen}
          styles={{ body: { padding: 0 } }}
        >
          <NotificationsList
            onClose={() => setNotificationDrawerOpen(false)}
            onNotificationCountChange={(newCount) =>
              setNotificationCount(newCount)
            }
          />
        </Drawer>
      </AntLayout>
    </App>
  );
};

export default WarehouseManagerLayout;
