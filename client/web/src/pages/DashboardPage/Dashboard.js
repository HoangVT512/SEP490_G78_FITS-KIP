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
import {
  dashboardContainer,
  welcomeCard,
  statsCard,
  quickStatsCard,
  progressCard,
} from "./dashboard.style";

const { Title, Text } = Typography;

const Dashboard = () => {
  return (
    <Layout>
      <div
        css={dashboardContainer}
        style={{
          background: "#f8fafc",
          minHeight: "calc(100vh - 70px)",
          padding: "32px",
        }}
      >
        {/* Welcome Section */}
        <Card css={welcomeCard}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0, color: "#283652" }}>
                🏭 Hệ thống quản lý bảo trì FITS-KIP
              </Title>
              <Text
                style={{
                  fontSize: "16px",
                  color: "#64748b",
                  marginTop: "8px",
                  display: "block",
                }}
              >
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
        <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card css={quickStatsCard} className="equipment-card">
              <Statistic
                title={
                  <Space>
                    <ToolOutlined style={{ color: "#3b82f6" }} />
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
            <Card css={quickStatsCard} className="incident-card">
              <Statistic
                title={
                  <Space>
                    <ExclamationCircleOutlined style={{ color: "#ef4444" }} />
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
            <Card css={quickStatsCard} className="maintenance-card">
              <Statistic
                title={
                  <Space>
                    <CalendarOutlined style={{ color: "#10b981" }} />
                    <span>Bảo trì hôm nay</span>
                  </Space>
                }
                value={2}
                valueStyle={{ color: "#10b981", fontWeight: "bold" }}
                suffix="công việc"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card css={quickStatsCard} className="completed-card">
              <Statistic
                title={
                  <Space>
                    <CheckCircleOutlined style={{ color: "#8b5cf6" }} />
                    <span>Hoàn thành tuần này</span>
                  </Space>
                }
                value={12}
                valueStyle={{ color: "#8b5cf6", fontWeight: "bold" }}
                suffix="nhiệm vụ"
              />
            </Card>
          </Col>
        </Row>

        {/* Progress and Status Cards */}
        <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
          <Col xs={24} lg={12}>
            <Card
              css={progressCard}
              title={
                <Space>
                  <RiseOutlined style={{ color: "#3b82f6" }} />
                  <span>Tiến độ bảo trì tháng này</span>
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Kế hoạch: 85% hoàn thành</Text>
                  <Progress
                    percent={85}
                    status="active"
                    strokeColor="#3b82f6"
                  />
                </div>
                <div>
                  <Text strong>Sửa chữa khẩn cấp: 60% hoàn thành</Text>
                  <Progress
                    percent={60}
                    status="active"
                    strokeColor="#f59e0b"
                  />
                </div>
                <div>
                  <Text strong>Kiểm tra định kỳ: 92% hoàn thành</Text>
                  <Progress percent={92} strokeColor="#10b981" />
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              css={progressCard}
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: "#f59e0b" }} />
                  <span>Cảnh báo và thông báo</span>
                </Space>
              }
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <Card
                  size="small"
                  style={{
                    backgroundColor: "#fef3c7",
                    border: "1px solid #f59e0b",
                  }}
                >
                  <Space>
                    <WarningOutlined style={{ color: "#f59e0b" }} />
                    <div>
                      <Text strong>Máy CNC-001</Text>
                      <div style={{ fontSize: "12px", color: "#92400e" }}>
                        Cần bảo trì định kỳ trong 2 ngày
                      </div>
                    </div>
                  </Space>
                </Card>
                <Card
                  size="small"
                  style={{
                    backgroundColor: "#fee2e2",
                    border: "1px solid #ef4444",
                  }}
                >
                  <Space>
                    <ExclamationCircleOutlined style={{ color: "#ef4444" }} />
                    <div>
                      <Text strong>Máy hàn laser WL-02</Text>
                      <div style={{ fontSize: "12px", color: "#991b1b" }}>
                        Sự cố về hệ thống làm mát
                      </div>
                    </div>
                  </Space>
                </Card>
                <Card
                  size="small"
                  style={{
                    backgroundColor: "#dcfce7",
                    border: "1px solid #10b981",
                  }}
                >
                  <Space>
                    <CheckCircleOutlined style={{ color: "#10b981" }} />
                    <div>
                      <Text strong>Máy phay FM-05</Text>
                      <div style={{ fontSize: "12px", color: "#166534" }}>
                        Bảo trì hoàn thành thành công
                      </div>
                    </div>
                  </Space>
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
