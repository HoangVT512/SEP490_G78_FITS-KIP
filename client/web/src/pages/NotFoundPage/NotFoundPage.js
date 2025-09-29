import React from "react";
import { Button, Typography, Space } from "antd";
import {
  HomeOutlined,
  ArrowLeftOutlined,
  SettingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../components/Layout";
import "../../styles/pages/NotFoundPage.css";

const { Title, Text, Paragraph } = Typography;

const NotFoundPage = ({
  message = "Trang bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập.",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Animated factory illustration
  const FactoryIllustration = () => (
    <div className="factory-illustration">🏭</div>
  );

  // Determine appropriate home route based on current path
  const getHomeRoute = () => {
    if (location.pathname.startsWith("/admin")) {
      return "/admin/dashboard";
    }
    return "/dashboard";
  };

  return (
    <Layout>
      <div className="not-found-container">
        <div className="not-found-content">
          <FactoryIllustration />

          <Title level={1} className="error-code">
            404
          </Title>

          <Title level={3} className="error-title">
            Oops! Không tìm thấy trang
          </Title>

          <Paragraph className="error-message">{message}</Paragraph>

          <div className="path-info">
            <Text strong className="notfound-path-label">
              Đường dẫn hiện tại:
            </Text>
            <Text code className="path-code">
              {location.pathname}
            </Text>
          </div>

          <Space
            direction="vertical"
            size="middle"
            className="notfound-full-width"
          >
            <Text className="notfound-suggestion-text">
              Bạn có thể thử các hành động sau:
            </Text>

            <div className="button-group">
              <Button
                type="primary"
                size="large"
                icon={<HomeOutlined />}
                onClick={() => navigate(getHomeRoute())}
                className="primary-button"
              >
                Về trang chủ
              </Button>

              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                className="secondary-button"
              >
                Quay lại
              </Button>
            </div>

            <div className="button-group">
              <Button
                size="large"
                icon={<SearchOutlined />}
                onClick={() => navigate("/search")}
                className="secondary-button"
              >
                Tìm kiếm
              </Button>

              <Button
                size="large"
                icon={<SettingOutlined />}
                onClick={() => navigate("/dashboard")}
                className="secondary-button"
              >
                Dashboard
              </Button>
            </div>
          </Space>

          <div className="brand-info">
            <Text className="brand-text">
              <strong>🏭 FITS-KIP Management System</strong>
              <br />
              Hệ thống quản lý bảo trì nhà máy
            </Text>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
