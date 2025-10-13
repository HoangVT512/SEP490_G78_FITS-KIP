import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Button, Space } from "antd";
import {
  InboxOutlined,
  ShoppingOutlined,
  ToolOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/pages/TechnicianManagerDashboard.module.css";

const TechnicianManagerDashboard = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const stats = {
    totalSpareParts: 156,
    lowStock: 12,
    pendingRequests: 8,
    activeMaintenance: 24,
    pendingIncidents: 6,
  };

  const recentRequests = [
    {
      id: "REQ001",
      partName: "Motor điện 5HP",
      quantity: 2,
      status: "Chờ duyệt",
      requestedBy: "Nguyễn Văn A",
      date: "2025-01-10",
    },
    {
      id: "REQ002",
      partName: "Băng tải 10m",
      quantity: 1,
      status: "Đã duyệt",
      requestedBy: "Trần Thị B",
      date: "2025-01-09",
    },
  ];

  const upcomingMaintenance = [
    {
      id: "PLAN001",
      equipment: "Máy dập 01",
      dueDate: "2025-01-15",
      type: "Bảo trì định kỳ",
      status: "Sắp đến hạn",
    },
    {
      id: "PLAN002",
      equipment: "Máy cắt 02",
      dueDate: "2025-01-20",
      type: "Kiểm tra an toàn",
      status: "Đúng lịch",
    },
  ];

  const requestColumns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "Phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: 200,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: "Người yêu cầu",
      dataIndex: "requestedBy",
      key: "requestedBy",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "Chờ duyệt" ? "warning" : "success"}>
          {status}
        </Tag>
      ),
    },
  ];

  const maintenanceColumns = [
    {
      title: "Mã kế hoạch",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipment",
      key: "equipment",
      width: 150,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 150,
    },
    {
      title: "Ngày đến hạn",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "Sắp đến hạn" ? "warning" : "processing"}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Tổng phụ tùng"
              value={stats.totalSpareParts}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Phụ tùng sắp hết"
              value={stats.lowStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Yêu cầu chờ duyệt"
              value={stats.pendingRequests}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Kế hoạch bảo trì"
              value={stats.activeMaintenance}
              prefix={<ToolOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Purchase Requests */}
      <Card
        title="Yêu cầu mua hàng gần đây"
        extra={
          <Button
            type="link"
            onClick={() => navigate("/technician-manager/purchase-requests")}
          >
            Xem tất cả
          </Button>
        }
        bordered={false}
        className={styles.tableCard}
      >
        <Table
          columns={requestColumns}
          dataSource={recentRequests}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Upcoming Maintenance */}
      <Card
        title="Bảo trì sắp đến hạn"
        extra={
          <Button
            type="link"
            onClick={() => navigate("/technician-manager/maintenance")}
          >
            Xem tất cả
          </Button>
        }
        bordered={false}
        className={styles.tableCard}
        style={{ marginTop: 16 }}
      >
        <Table
          columns={maintenanceColumns}
          dataSource={upcomingMaintenance}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default TechnicianManagerDashboard;
