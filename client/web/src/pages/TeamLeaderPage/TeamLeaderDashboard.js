import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Alert,
  Badge,
  Space,
  Button,
  Select,
  DatePicker,
} from "antd";
import {
  ToolOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  LineChartOutlined,
  TeamOutlined,
  SafetyOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import styles from "../../styles/pages/TeamLeaderDashboard.module.css";

const { RangePicker } = DatePicker;

const TeamLeaderDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [selectedLine, setSelectedLine] = useState("all");

  // Mock data - sẽ thay bằng API call sau
  const dashboardStats = {
    totalEquipment: 45,
    activeEquipment: 42,
    inactiveEquipment: 2,
    problemEquipment: 1,
    totalErrors: 12,
    resolvedErrors: 10,
    pendingErrors: 2,
    oeeScore: 85.5,
    availabilityRate: 92.3,
    performanceRate: 88.7,
    qualityRate: 95.2,
  };

  const lines = [
    { id: "all", name: "Tất cả dây chuyền" },
    { id: 1, name: "Dây chuyền 1" },
    { id: 2, name: "Dây chuyền 2" },
    { id: 3, name: "Dây chuyền 3" },
  ];

  const recentErrors = [
    {
      id: 1,
      equipmentName: "Máy cắt CNC-001",
      lineName: "Dây chuyền 1",
      errorType: "Hư hỏng",
      description: "Lỗi động cơ chính",
      startTime: "2025-10-07 08:30",
      status: "pending",
      priority: "high",
    },
    {
      id: 2,
      equipmentName: "Máy hàn WLD-002",
      lineName: "Dây chuyền 2",
      errorType: "Bảo trì",
      description: "Bảo trì định kỳ",
      startTime: "2025-10-07 07:15",
      status: "in-progress",
      priority: "medium",
    },
    {
      id: 3,
      equipmentName: "Máy ép PRS-003",
      lineName: "Dây chuyền 1",
      errorType: "Sự cố",
      description: "Áp suất không đủ",
      startTime: "2025-10-07 06:00",
      status: "resolved",
      priority: "high",
    },
    {
      id: 4,
      equipmentName: "Máy kiểm tra QC-001",
      lineName: "Dây chuyền 3",
      errorType: "Điều chỉnh",
      description: "Cần hiệu chỉnh cảm biến",
      startTime: "2025-10-06 15:45",
      status: "resolved",
      priority: "low",
    },
  ];

  const equipmentStatus = [
    {
      id: 1,
      code: "CNC-001",
      name: "Máy cắt CNC-001",
      lineName: "Dây chuyền 1",
      status: "problem",
      lastCheck: "2 giờ trước",
      uptime: 78.5,
    },
    {
      id: 2,
      code: "WLD-002",
      name: "Máy hàn WLD-002",
      lineName: "Dây chuyền 2",
      status: "maintenance",
      lastCheck: "30 phút trước",
      uptime: 85.2,
    },
    {
      id: 3,
      code: "PRS-003",
      name: "Máy ép PRS-003",
      lineName: "Dây chuyền 1",
      status: "active",
      lastCheck: "5 phút trước",
      uptime: 95.8,
    },
    {
      id: 4,
      code: "QC-001",
      name: "Máy kiểm tra QC-001",
      lineName: "Dây chuyền 3",
      status: "active",
      lastCheck: "10 phút trước",
      uptime: 92.3,
    },
    {
      id: 5,
      code: "ASM-001",
      name: "Máy lắp ráp ASM-001",
      lineName: "Dây chuyền 2",
      status: "active",
      lastCheck: "15 phút trước",
      uptime: 88.7,
    },
  ];

  const errorColumns = [
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 180,
    },
    {
      title: "Dây chuyền",
      dataIndex: "lineName",
      key: "lineName",
      width: 130,
    },
    {
      title: "Loại sự cố",
      dataIndex: "errorType",
      key: "errorType",
      width: 120,
      render: (type) => {
        const colors = {
          "Hư hỏng": "red",
          "Bảo trì": "blue",
          "Sự cố": "orange",
          "Điều chỉnh": "green",
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Thời gian",
      dataIndex: "startTime",
      key: "startTime",
      width: 140,
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority) => {
        const config = {
          high: { text: "Cao", color: "red" },
          medium: { text: "Trung bình", color: "orange" },
          low: { text: "Thấp", color: "green" },
        };
        return (
          <Tag color={config[priority].color}>{config[priority].text}</Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => {
        const statusConfig = {
          pending: {
            text: "Chờ xử lý",
            color: "gold",
            icon: <ClockCircleOutlined />,
          },
          "in-progress": {
            text: "Đang xử lý",
            color: "blue",
            icon: <ClockCircleOutlined />,
          },
          resolved: {
            text: "Đã xử lý",
            color: "green",
            icon: <CheckCircleOutlined />,
          },
        };
        const config = statusConfig[status];
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
  ];

  const equipmentColumns = [
    {
      title: "Mã thiết bị",
      dataIndex: "code",
      key: "code",
      width: 120,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Dây chuyền",
      dataIndex: "lineName",
      key: "lineName",
      width: 130,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => {
        const statusConfig = {
          active: {
            text: "Hoạt động",
            color: "green",
            icon: <CheckCircleOutlined />,
          },
          inactive: {
            text: "Không hoạt động",
            color: "red",
            icon: <CloseCircleOutlined />,
          },
          maintenance: {
            text: "Bảo trì",
            color: "orange",
            icon: <ToolOutlined />,
          },
          problem: {
            text: "Có vấn đề",
            color: "red",
            icon: <WarningOutlined />,
          },
        };
        const config = statusConfig[status];
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Thời gian hoạt động",
      dataIndex: "uptime",
      key: "uptime",
      width: 180,
      render: (uptime) => (
        <Progress
          percent={uptime}
          size="small"
          status={
            uptime > 90 ? "success" : uptime > 70 ? "normal" : "exception"
          }
        />
      ),
    },
    {
      title: "Kiểm tra cuối",
      dataIndex: "lastCheck",
      key: "lastCheck",
      width: 130,
    },
  ];

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.dashboard}>
      {/* Header Section */}
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.title}>🏭 Dashboard Tổ trưởng</h1>
          <p className={styles.subtitle}>
            Tổng quan hoạt động sản xuất và thiết bị
          </p>
        </div>
        <Space>
          <Select
            value={selectedLine}
            onChange={setSelectedLine}
            style={{ width: 200 }}
            options={lines.map((line) => ({
              value: line.id,
              label: line.name,
            }))}
          />
          <RangePicker />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Tổng thiết bị"
              value={dashboardStats.totalEquipment}
              prefix={<ToolOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div className={styles.statDetail}>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />{" "}
              {dashboardStats.activeEquipment} hoạt động
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Thiết bị có vấn đề"
              value={dashboardStats.problemEquipment}
              prefix={<WarningOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
            <div className={styles.statDetail}>
              <CloseCircleOutlined style={{ color: "#d9d9d9" }} />{" "}
              {dashboardStats.inactiveEquipment} không hoạt động
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Sự cố hôm nay"
              value={dashboardStats.totalErrors}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
            <div className={styles.statDetail}>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />{" "}
              {dashboardStats.resolvedErrors} đã xử lý
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="OEE Score"
              value={dashboardStats.oeeScore}
              suffix="%"
              prefix={<LineChartOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
            <div className={styles.statDetail}>
              <RiseOutlined style={{ color: "#52c41a" }} /> +2.3% so với hôm qua
            </div>
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="Tỷ lệ khả dụng" className={styles.metricCard}>
            <Progress
              type="circle"
              percent={dashboardStats.availabilityRate}
              strokeColor="#52c41a"
              width={150}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Hiệu suất hoạt động" className={styles.metricCard}>
            <Progress
              type="circle"
              percent={dashboardStats.performanceRate}
              strokeColor="#1890ff"
              width={150}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Tỷ lệ chất lượng" className={styles.metricCard}>
            <Progress
              type="circle"
              percent={dashboardStats.qualityRate}
              strokeColor="#722ed1"
              width={150}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {dashboardStats.pendingErrors > 0 && (
        <Alert
          message={`Có ${dashboardStats.pendingErrors} sự cố đang chờ xử lý`}
          description="Vui lòng kiểm tra và xử lý các sự cố để đảm bảo hoạt động sản xuất."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Recent Errors Table */}
      <Card
        title={
          <Space>
            <WarningOutlined />
            <span>Sự cố gần đây</span>
            <Badge count={dashboardStats.pendingErrors} />
          </Space>
        }
        extra={
          <Button type="link" onClick={() => {}}>
            Xem tất cả
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Table
          columns={errorColumns}
          dataSource={recentErrors}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 1000 }}
          locale={{ emptyText: "Không có sự cố nào" }}
        />
      </Card>

      {/* Equipment Status Table */}
      <Card
        title={
          <Space>
            <SafetyOutlined />
            <span>Trạng thái thiết bị</span>
          </Space>
        }
        extra={
          <Button type="link" onClick={() => {}}>
            Xem tất cả
          </Button>
        }
      >
        <Table
          columns={equipmentColumns}
          dataSource={equipmentStatus}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 1000 }}
          locale={{ emptyText: "Không có dữ liệu thiết bị" }}
        />
      </Card>
    </div>
  );
};

export default TeamLeaderDashboard;
