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
  AppstoreOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../../styles/components/TeamLeaderLayout.module.css";

// Import team leader pages
import TeamLeaderDashboard from "./TeamLeaderDashboard";
import TeamLeaderEquipment from "./TeamLeaderEquipment";
import ProductionManagement from "./ProductionManagement";
import ReplacementComponents from "./ReplacementComponents";
import IncidentManagement from "./IncidentManagement";
import EFormSystem from "./EFormSystem";
import FactoryMap from "./FactoryMap";

const { Header, Sider, Content } = AntLayout;
const { Title, Text } = Typography;

const TeamLeaderLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Get team leader user info from context
  const teamLeaderUser = {
    name: user?.fullName || "Team Leader",
    email: user?.email || "teamleader@fitskip.com",
    avatar: null,
    role: user?.roles?.[0] || "Tổ trưởng",
  };

  // Update selected key based on current route
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes("/equipment")) {
      setSelectedKey("equipment");
    } else if (path.includes("/EFormProductionInput")) {
      setSelectedKey("EFormProductionInput");
    } else if (path.includes("/production")) {
      setSelectedKey("production");
    } else if (path.includes("/replacement")) {
      setSelectedKey("replacement");
    } else if (path.includes("/incidents")) {
      setSelectedKey("incidents");
    } else if (path.includes("/factory-map")) {
      setSelectedKey("factory-map");
    } else if (path.includes("/line-monitoring")) {
      setSelectedKey("line-monitoring");
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
    } else if (path.includes("/production")) {
      return <ProductionManagement />;
    } else if (path.includes("/EFormProductionInput")) {
      return <EFormSystem />;
    } else if (path.includes("/replacement")) {
      return <ReplacementComponents />;
    } else if (path.includes("/incidents")) {
      return <IncidentManagement />;
    } else if (path.includes("/factory-map")) {
      return <FactoryMap />;
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
    },
    {
      key: "factory-map",
      icon: <AppstoreOutlined />,
      label: "Sơ đồ nhà máy",
    },
    {
      key: "EFormProductionInput",
      icon: <EditOutlined />,
      label: "E-Form Nhập liệu sản lượng",
    },
    {
      key: "production",
      icon: <BarChartOutlined />,
      label: "Quản lý sản xuất",
    },
    {
      key: "equipment",
      icon: <ToolOutlined />,
      label: "Quản lý thiết bị",
    },
    {
      key: "replacement",
      icon: <SwapOutlined />,
      label: "Linh kiện thay thế",
    },
    {
      key: "incidents",
      icon: <WarningOutlined />,
      label: "Quản lý sự cố",
    },
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo",
    },
  ];

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    switch (key) {
      case "dashboard":
        navigate("/team-leader/dashboard");
        break;
      case "factory-map":
        navigate("/team-leader/factory-map");
        break;
      case "EFormProductionInput":
        navigate("/team-leader/EFormProductionInput");
        break;
      case "production":
        navigate("/team-leader/production");
        break;
      case "equipment":
        navigate("/team-leader/equipment");
        break;
      case "replacement":
        navigate("/team-leader/replacement");
        break;
      case "incidents":
        navigate("/team-leader/incidents");
        break;
      case "reports":
        navigate("/team-leader/reports");
        break;
      default:
        navigate("/team-leader/dashboard");
    }
  };

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
      className={styles.teamLeaderLayout}
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
              🏭 FITS-KIP Tổ trưởng
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
                  src={teamLeaderUser.avatar}
                  style={{ backgroundColor: "#334766" }}
                />
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{teamLeaderUser.name}</div>
                  <div className={styles.userRole}>{teamLeaderUser.role}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={contentStyle}>
          <div className={styles.teamLeaderContent}>{renderPageContent()}</div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default TeamLeaderLayout;
