import React, { useState } from "react";
import {
  Layout as AntLayout,
  Menu,
  Typography,
  Avatar,
  Dropdown,
  Button,
  Badge,
  message,
} from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BellOutlined,
  SafetyOutlined,
  EditOutlined,
  GroupOutlined,
  NodeIndexOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../../styles/components/AdminLayout.module.css";

// Import admin pages
import AdminDashboard from "../AdminPage/AdminDashboard";
import UserManagement from "../AdminPage/UserManagement";
import DepartmentManagement from "../AdminPage/DepartmentManagement";
import LineGroupManagement from "./LineManagement";
import StageManagement from "../AdminPage/StageManagement";
import RoleManagement from "../AdminPage/RoleManagement";
import EquipmentManagement from "../AdminPage/EquipmentManagement";
import SystemSettings from "../AdminPage/SystemSettings";
import AdminReports from "../AdminPage/AdminReports";
import AdminGuidePanel from "../GuidePage/AdminGuidePanel";

const { Header, Sider, Content } = AntLayout;
const { Title, Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  // hovered allows temporary expand when mouse is over the sider
  const [hovered, setHovered] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Get admin user info from context
  const adminUser = {
    name: user?.fullName || "Admin User",
    email: user?.email || "admin@fitskip.com",
    avatar: null,
    role: user?.roles?.[0] || "System Administrator",
  };

  // Menu items cho sidebar
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Bảng điều khiển",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
    },
    {
      key: "departments",
      icon: <TeamOutlined />,
      label: "Quản lý phòng ban",
    },
    {
      key: "linegroups",
      icon: <GroupOutlined />,
      label: "Quản lý dây chuyền",
    },
    {
      key: "stages",
      icon: <NodeIndexOutlined />,
      label: "Quản lý công đoạn",
    },
    {
      key: "equipment",
      icon: <ToolOutlined />,
      label: "Quản lý thiết bị",
    },
    {
      key: "roles",
      icon: <SafetyOutlined />,
      label: "Quản lý vai trò",
    },
    {
      key: "guide",
      icon: <EditOutlined />,
      label: "Hướng dẫn sử dụng",
    },
    // {
    //   key: "reports",
    //   icon: <BarChartOutlined />,
    //   label: "Báo cáo & Thống kê",
    // },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt hệ thống",
    },
  ];

  // User dropdown menu
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => navigate("/profile"),
    },
    // {
    //   key: "edit-profile",
    //   icon: <EditOutlined />,
    //   label: "Chỉnh sửa thông tin",
    //   onClick: () => navigate("/profile/edit"),
    // },
    // {
    //   key: "change-password",
    //   icon: <SafetyOutlined />,
    //   label: "Đổi mật khẩu",
    //   onClick: () => navigate("/profile/change-password"),
    // },
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

  // Render content based on selected menu
  const renderContent = () => {
    switch (selectedKey) {
      case "dashboard":
        return <AdminDashboard showHeader={false} />;
      case "users":
        return <UserManagement showHeader={false} />;
      case "departments":
        return <DepartmentManagement showHeader={false} />;
      case "linegroups":
        return <LineGroupManagement showHeader={false} />;
      case "stages":
        return <StageManagement showHeader={false} />;
      case "equipment":
        return <EquipmentManagement showHeader={false} />;
      case "roles":
        return <RoleManagement showHeader={false} />;
      case "guide":
        return <AdminGuidePanel />;
      case "reports":
        return <AdminReports showHeader={false} />;
      case "settings":
        return <SystemSettings showHeader={false} />;
      default:
        return <AdminDashboard showHeader={false} />;
    }
  };

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

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

  // Get breadcrumb items
  const getBreadcrumbItems = () => {
    const currentMenu = menuItems.find((item) => item.key === selectedKey);
    return [
      {
        href: "/dashboard",
        title: <HomeOutlined />,
      },
      {
        title: "Admin Panel",
      },
      {
        title: currentMenu?.label || "Bảng điều khiển",
      },
    ];
  };

  return (
    <AntLayout className={styles.adminLayout} style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        // collapsed visually when user collapsed and not hovering
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
        <div style={logoStyle}>
          {!collapsed && (
            <Title
              level={4}
              style={{ color: "#fff", margin: 0, fontSize: "16px" }}
            >
              🏭 FITS-KIP Quản trị
            </Title>
          )}
          {collapsed && (
            <Text style={{ color: "#fff", fontSize: "20px" }}>🏭</Text>
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
                "Admin Dashboard"}
            </Title>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Notifications */}
            <Badge count={0} size="small" className={styles.notificationBadge}>
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
                  src={adminUser.avatar}
                  style={{ backgroundColor: "#334766" }}
                />
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{adminUser.name}</div>
                  <div className={styles.userRole}>{adminUser.role}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={contentStyle}>
          <div className={styles.adminContent}>{renderContent()}</div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default AdminLayout;
