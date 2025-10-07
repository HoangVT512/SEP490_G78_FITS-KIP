import React, { useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Space,
  Button,
  message,
} from "antd";
import {
  DashboardOutlined,
  ToolOutlined,
  WarningOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SafetyOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../../styles/components/TeamLeaderLayout.module.css";

// Import team leader pages
import TeamLeaderDashboard from "./TeamLeaderDashboard";
import TeamLeaderEquipment from "./TeamLeaderEquipment";

const { Header, Sider, Content } = Layout;

const TeamLeaderLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Update selected key based on current route
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes("/equipment")) {
      setSelectedKey("equipment");
    } else if (path.includes("/line-monitoring")) {
      setSelectedKey("line-monitoring");
    } else if (path.includes("/errors")) {
      setSelectedKey("errors");
    } else if (path.includes("/reports")) {
      setSelectedKey("reports");
    } else {
      setSelectedKey("dashboard");
    }
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      message.success("Đăng xuất thành công!");
      navigate("/login");
    } catch (error) {
      message.error("Đăng xuất thất bại!");
    }
  };

  // Render page content based on selectedKey
  const renderPageContent = () => {
    const path = location.pathname;

    if (path.includes("/equipment")) {
      return <TeamLeaderEquipment />;
    } else if (path === "/team-leader" || path.includes("/dashboard")) {
      return <TeamLeaderDashboard />;
    }

    // Default to dashboard
    return <TeamLeaderDashboard />;
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      onClick: () => {
        setSelectedKey("dashboard");
        navigate("/team-leader/dashboard");
      },
    },
    {
      key: "line-monitoring",
      icon: <SafetyOutlined />,
      label: "Giám sát dây chuyền",
      onClick: () => {
        setSelectedKey("line-monitoring");
        navigate("/team-leader/line-monitoring");
      },
    },
    {
      key: "equipment",
      icon: <ToolOutlined />,
      label: "Thiết bị",
      onClick: () => {
        setSelectedKey("equipment");
        navigate("/team-leader/equipment");
      },
    },
    {
      key: "errors",
      icon: <WarningOutlined />,
      label: "Quản lý sự cố",
      onClick: () => {
        setSelectedKey("errors");
        navigate("/team-leader/errors");
      },
    },
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo",
      onClick: () => {
        setSelectedKey("reports");
        navigate("/team-leader/reports");
      },
    },
  ];

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
      label: "Chỉnh sửa hồ sơ",
      onClick: () => navigate("/profile/edit"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/team-leader/settings"),
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
    <Layout className={styles.teamLeaderLayout}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: "linear-gradient(180deg, #283652 0%, #283652 100%)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
        }}
      >
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🏭</div>
          {!collapsed && (
            <div className={styles.logoText}>
              <div className={styles.logoTitle}>FITS-KIP</div>
              <div className={styles.logoSubtitle}>Tổ trưởng</div>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className={styles.menu}
        />
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className={styles.collapseButton}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 280,
          transition: "margin-left 0.2s",
        }}
      >
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Space size="large">
            <Badge count={5} size="small">
              <BellOutlined className={styles.headerIcon} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className={styles.userDropdown}>
                <Avatar
                  style={{ backgroundColor: "#334766" }}
                  icon={<UserOutlined />}
                />
                <div className={styles.userInfo}>
                  <div className={styles.userName}>
                    {user?.fullName || "Tổ trưởng"}
                  </div>
                  <div className={styles.userRole}>Tổ trưởng</div>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>
        <Content className={styles.content}>
          <div className={styles.contentWrapper}>{renderPageContent()}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeamLeaderLayout;
