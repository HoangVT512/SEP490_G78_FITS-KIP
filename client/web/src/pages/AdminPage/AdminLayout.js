import React, { useState } from "react";
import {
  Layout as AntLayout,
  Menu,
  Typography,
  Avatar,
  Dropdown,
  Button,
  Badge,
  Breadcrumb,
} from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BellOutlined,
  SafetyOutlined,
  EditOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminLayout.css";

// Import admin pages
import AdminDashboard from "../AdminPage/AdminDashboard";
import UserManagement from "../AdminPage/UserManagement";
import SystemSettings from "../AdminPage/SystemSettings";
import AdminReports from "../AdminPage/AdminReports";

const { Header, Sider, Content } = AntLayout;
const { Title, Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const navigate = useNavigate();

  // Mock admin user info
  const adminUser = {
    name: "Nguyễn Văn Admin",
    email: "admin@fitskip.com",
    avatar: null,
    role: "System Administrator",
  };

  // Menu items cho sidebar
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
    },
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo & Thống kê",
    },
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
      onClick: () => {
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
    background: "linear-gradient(180deg, #1e40af 0%, #1d4ed8 100%)",
    boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
  };

  const headerStyle = {
    background: "#fff",
    padding: "0 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: collapsed ? 80 : 200,
    transition: "margin-left 0.2s",
  };

  const contentStyle = {
    marginLeft: collapsed ? 80 : 200,
    padding: 0,
    minHeight: "calc(100vh - 70px)",
    backgroundColor: "#f8fafc",
    transition: "margin-left 0.2s",
  };

  const logoStyle = {
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: collapsed ? "center" : "flex-start",
    padding: collapsed ? "0" : "0 16px",
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
        title: currentMenu?.label || "Dashboard",
      },
    ];
  };

  return (
    <AntLayout className="admin-layout" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={200}
        collapsedWidth={80}
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
              🏭 FITS-KIP Admin
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
            onClick={() => setCollapsed(!collapsed)}
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
            <Breadcrumb items={getBreadcrumbItems()} />
            <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
              {menuItems.find((item) => item.key === selectedKey)?.label ||
                "Admin Dashboard"}
            </Title>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Notifications */}
            <Badge count={5} size="small" className="notification-badge">
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
              <div className="user-dropdown">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={adminUser.avatar}
                  style={{ backgroundColor: "#2563eb" }}
                />
                <div className="user-info">
                  <div className="user-name">{adminUser.name}</div>
                  <div className="user-role">{adminUser.role}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={contentStyle}>
          <div className="admin-content">{renderContent()}</div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default AdminLayout;
