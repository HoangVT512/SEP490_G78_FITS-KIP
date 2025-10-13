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
  CheckCircleOutlined,
  ToolOutlined,
  SwapOutlined,
  InboxOutlined,
  FundOutlined,
  FileTextOutlined,
  WarningOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SafetyOutlined,
  EditOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../../styles/pages/ManagerLayout.module.css";

// Import manager pages
import ManagerDashboard from "./ManagerDashboard";
import PurchaseApproval from "./PurchaseApproval";
import MaintenanceReports from "./MaintenanceReports";
import ReplacementHistory from "./ReplacementHistory";
import InventoryDashboard from "./InventoryDashboard";
import ProductionManagement from "./ProductionManagement";
import ProductionDetailReport from "./ProductionDetailReport";
import ManagerIncidentList from "./ManagerIncidentList";

const { Header, Sider, Content } = AntLayout;
const { Title, Text } = Typography;

const ManagerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Get manager user info from context
  const managerUser = {
    name: user?.fullName || "Manager",
    email: user?.email || "manager@fitskip.com",
    avatar: null,
    role: user?.roles?.[0] || "Quản lý",
  };

  // Update selected key based on current route
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes("/purchase-approval")) {
      setSelectedKey("purchase-approval");
    } else if (path.includes("/maintenance-reports")) {
      setSelectedKey("maintenance-reports");
    } else if (path.includes("/replacement-history")) {
      setSelectedKey("replacement-history");
    } else if (path.includes("/inventory-dashboard")) {
      setSelectedKey("inventory-dashboard");
    } else if (path.includes("/production-management")) {
      setSelectedKey("production-management");
    } else if (path.includes("/production-report")) {
      setSelectedKey("production-report");
    } else if (path.includes("/incidents")) {
      setSelectedKey("incidents");
    } else {
      setSelectedKey("dashboard");
    }
  }, [location]);

  // Render page content based on path
  const renderContent = () => {
    const path = location.pathname;

    if (path.includes("/purchase-approval")) {
      return <PurchaseApproval />;
    } else if (path.includes("/maintenance-reports")) {
      return <MaintenanceReports />;
    } else if (path.includes("/replacement-history")) {
      return <ReplacementHistory />;
    } else if (path.includes("/inventory-dashboard")) {
      return <InventoryDashboard />;
    } else if (path.includes("/production-management")) {
      return <ProductionManagement />;
    } else if (path.includes("/production-report")) {
      return <ProductionDetailReport />;
    } else if (path.includes("/incidents")) {
      return <ManagerIncidentList />;
    } else if (path === "/manager" || path.includes("/dashboard")) {
      return <ManagerDashboard />;
    }

    // Default to dashboard
    return <ManagerDashboard />;
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "purchase-approval",
      icon: <ShoppingOutlined />,
      label: "Duyệt yêu cầu mua hàng",
    },
    {
      key: "maintenance-reports",
      icon: <ToolOutlined />,
      label: "Báo cáo bảo trì",
    },
    {
      key: "replacement-history",
      icon: <SwapOutlined />,
      label: "Lịch sử thay thế",
    },
    {
      key: "inventory-dashboard",
      icon: <InboxOutlined />,
      label: "Dashboard kho",
    },
    {
      key: "production-management",
      icon: <FundOutlined />,
      label: "Quản lý sản xuất",
    },
    {
      key: "production-report",
      icon: <FileTextOutlined />,
      label: "Báo cáo sản xuất",
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
        navigate("/manager/dashboard");
        break;
      case "purchase-approval":
        navigate("/manager/purchase-approval");
        break;
      case "maintenance-reports":
        navigate("/manager/maintenance-reports");
        break;
      case "replacement-history":
        navigate("/manager/replacement-history");
        break;
      case "inventory-dashboard":
        navigate("/manager/inventory-dashboard");
        break;
      case "production-management":
        navigate("/manager/production-management");
        break;
      case "production-report":
        navigate("/manager/production-report");
        break;
      case "incidents":
        navigate("/manager/incidents");
        break;
      default:
        navigate("/manager/dashboard");
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
    <AntLayout className={styles.managerLayout} style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
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
        <div className={styles.managerLogo}>
          {!collapsed && (
            <Title
              level={4}
              style={{ color: "#fff", margin: 0, fontSize: "16px" }}
            >
              📊 FITS-KIP Manager
            </Title>
          )}
          {collapsed && (
            <Text style={{ color: "#fff", fontSize: "20px" }}>📊</Text>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
              {menuItems.find((item) => item.key === selectedKey)?.label ||
                "Tổng quan"}
            </Title>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Notifications */}
            <Badge count={8} size="small" className={styles.notificationBadge}>
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
                  src={managerUser.avatar}
                  style={{ backgroundColor: "#334766" }}
                />
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{managerUser.name}</div>
                  <div className={styles.userRole}>{managerUser.role}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={contentStyle}>
          <div className={styles.managerContent}>{renderContent()}</div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default ManagerLayout;
