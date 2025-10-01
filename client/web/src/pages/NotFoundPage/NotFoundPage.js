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
import styles from "../../styles/pages/NotFoundPage.module.css";

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
      return "/admin";
    }
    return "/login";
  };

  return (
    <Layout>
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundContent}>
          <FactoryIllustration />

          <Title level={1} className={styles.errorCode}>
            404
          </Title>

          <Title level={3} className={styles.errorTitle}>
            Oops! Không tìm thấy trang
          </Title>

          <Paragraph className={styles.errorMessage}>{message}</Paragraph>

          <div className={styles.pathInfo}>
            <Text strong className={styles.notfoundPathLabel}>
              Đường dẫn hiện tại:
            </Text>
            <Text code className={styles.pathCode}>
              {location.pathname}
            </Text>
          </div>

          <Space
            direction="vertical"
            size="middle"
            className={styles.notfoundFullWidth}
          >
            <Text className={styles.notfoundSuggestionText}>
              Bạn có thể thử các hành động sau:
            </Text>

            <div className={styles.buttonGroup}>
              <Button
                size="large"
                icon={<HomeOutlined />}
                onClick={() => navigate(getHomeRoute())}
                className={styles.primaryButton}
              >
                Về trang chủ
              </Button>

              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                className={styles.secondaryButton}
              >
                Quay lại
              </Button>
            </div>

            <div className={styles.buttonGroup}>
              <Button
                size="large"
                icon={<SearchOutlined />}
                onClick={() => navigate("/search")}
                className={styles.secondaryButton}
              >
                Tìm kiếm
              </Button>

              <Button
                size="large"
                icon={<SettingOutlined />}
                onClick={() => navigate("/admin")}
                className={styles.secondaryButton}
              >
                Tìm kiếm
              </Button>

              <Button
                size="large"
                icon={<SettingOutlined />}
                onClick={() => navigate("/admin")}
                className={styles.secondaryButton}
              >
                Quản trị
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
