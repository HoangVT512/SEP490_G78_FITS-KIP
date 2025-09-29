import React from "react";
import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Button,
  Space,
} from "antd";
import {
  ToolOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout";
import "../../styles/pages/Dashboard.css";

const { Title, Text } = Typography;

const Dashboard = () => {
  return (
    <Layout>
      <div className="dashboard-container">
        {/* Welcome Section */}
        <Card className="dashboard-welcome-card">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2}>🏭 Hệ thống quản lý bảo trì FITS-KIP</Title>
              <Text className="dashboard-welcome-text">
                Quản lý thiết bị, bảo trì và sự cố một cách hiệu quả
              </Text>
            </Col>
            <Col>
              <Button type="primary" size="large" icon={<EyeOutlined />}>
                Xem báo cáo
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Quick Stats */}
        <Row gutter={[24, 24]} className="dashboard-stats-row">
          <Col xs={24} sm={12} lg={6}>
            <Card className="dashboard-quick-stats-card equipment-card">
              <Statistic
                title={
                  <Space>
                    <ToolOutlined className="dashboard-icon-blue" />
                    <span>Tổng thiết bị</span>
                  </Space>
                }
                value={15}
                valueStyle={{ color: "#3b82f6", fontWeight: "bold" }}
                suffix="thiết bị"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="dashboard-quick-stats-card incident-card">
              <Statistic
                title={
                  <Space>
                    <ExclamationCircleOutlined className="dashboard-icon-red" />
                    <span>Sự cố đang xử lý</span>
                  </Space>
                }
                value={3}
                valueStyle={{ color: "#ef4444", fontWeight: "bold" }}
                suffix="sự cố"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="dashboard-quick-stats-card maintenance-card">
              <Statistic
                title={
                  <Space>
                    <CalendarOutlined className="dashboard-icon-green" />
                    <span>Bảo trì tuần này</span>
                  </Space>
                }
                value={8}
                valueStyle={{ color: "#10b981", fontWeight: "bold" }}
                suffix="công việc"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="dashboard-quick-stats-card completed-card">
              <Statistic
                title={
                  <Space>
                    <CheckCircleOutlined className="dashboard-icon-purple" />
                    <span>Hoàn thành hôm nay</span>
                  </Space>
                }
                value={12}
                valueStyle={{ color: "#8b5cf6", fontWeight: "bold" }}
                suffix="công việc"
              />
            </Card>
          </Col>
        </Row>

        {/* Charts and Progress */}
        <Row gutter={[24, 24]} className="dashboard-stats-row">
          <Col xs={24} lg={12}>
            <Card
              title="Hiệu suất thiết bị"
              className="dashboard-progress-card"
              extra={
                <Button type="text" icon={<EyeOutlined />}>
                  Chi tiết
                </Button>
              }
            >
              <div style={{ marginBottom: "16px" }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text strong>Máy ép plastic - Line A</Text>
                    <Progress percent={85} strokeColor="#52c41a" />
                  </div>
                  <div>
                    <Text strong>Máy hàn tự động - Line B</Text>
                    <Progress percent={72} strokeColor="#1890ff" />
                  </div>
                  <div>
                    <Text strong>Robot lắp ráp - Line C</Text>
                    <Progress percent={68} strokeColor="#faad14" />
                  </div>
                  <div>
                    <Text strong>Máy kiểm tra chất lượng</Text>
                    <Progress percent={45} strokeColor="#ff4d4f" />
                  </div>
                </Space>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title="Tình trạng bảo trì"
              className="dashboard-progress-card"
              extra={
                <Button type="text" icon={<EyeOutlined />}>
                  Xem tất cả
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Card size="small">
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space>
                        <ClockCircleOutlined style={{ color: "#faad14" }} />
                        <Text>Đang thực hiện</Text>
                      </Space>
                    </Col>
                    <Col>
                      <Text strong style={{ color: "#faad14" }}>
                        5 công việc
                      </Text>
                    </Col>
                  </Row>
                </Card>
                <Card size="small">
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space>
                        <WarningOutlined style={{ color: "#ff4d4f" }} />
                        <Text>Quá hạn</Text>
                      </Space>
                    </Col>
                    <Col>
                      <Text strong style={{ color: "#ff4d4f" }}>
                        2 công việc
                      </Text>
                    </Col>
                  </Row>
                </Card>
                <Card size="small">
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space>
                        <RiseOutlined style={{ color: "#1890ff" }} />
                        <Text>Sắp đến hạn</Text>
                      </Space>
                    </Col>
                    <Col>
                      <Text strong style={{ color: "#1890ff" }}>
                        3 công việc
                      </Text>
                    </Col>
                  </Row>
                </Card>
                <Card size="small">
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space>
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        <Text>Hoàn thành</Text>
                      </Space>
                    </Col>
                    <Col>
                      <Text strong style={{ color: "#52c41a" }}>
                        18 công việc
                      </Text>
                    </Col>
                  </Row>
                </Card>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default Dashboard;
