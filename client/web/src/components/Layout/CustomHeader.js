import React from "react";
import { Layout as AntLayout, Typography, Button } from "antd";
import {
  HomeOutlined,
  LoginOutlined,
  ToolOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Header } = AntLayout;
const { Text } = Typography;

const CustomHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
        <Button
          type={location.pathname === "/settings" ? "primary" : "text"}
          icon={<SettingOutlined />}
          onClick={() => navigate("/settings")}
          style={buttonStyles}
        >
          Cài đặt
        </Button>
        <Button
          type="default"
          icon={<LoginOutlined />}
          onClick={() => navigate("/login")}
          style={loginButtonStyles}
        >
          Đăng nhập
        </Button>
      </div>
    </Header>
  );
};

export default CustomHeader;
