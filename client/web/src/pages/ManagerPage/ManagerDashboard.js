import React, { useState } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Button, Progress } from "antd";
import {
  ShoppingOutlined,
  ToolOutlined,
  WarningOutlined,
  FundOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/pages/ManagerDashboard.module.css";

const ManagerDashboard = () => {
  const navigate = useNavigate();

  const stats = {
    purchaseRequestsPending: 8,
    maintenanceDue: 5,
    incidentsActive: 3,
    productionOutput: 1250,
    purchaseChange: 12,
    maintenanceChange: -5,
    incidentChange: -25,
    productionChange: 8,
  };

  const pendingPurchases = [
    {
      id: "REQ001",
      partName: "Motor điện 5HP",
      quantity: 2,
      requestedBy: "Nguyễn Văn A",
      date: "2025-01-10",
      priority: "High",
      status: "Chờ duyệt",
    },
    {
      id: "REQ002",
      partName: "Băng tải 10m",
      quantity: 1,
      requestedBy: "Trần Thị B",
      date: "2025-01-09",
      priority: "Medium",
      status: "Chờ duyệt",
    },
  ];

  const upcomingMaintenance = [
    {
      id: "PLAN001",
      equipment: "Máy dập 01",
      dueDate: "2025-01-15",
      assignedTo: "Nguyễn Văn C",
      status: "Sắp đến hạn",
      completion: 65,
    },
    {
      id: "PLAN002",
      equipment: "Máy cắt 02",
      dueDate: "2025-01-20",
      assignedTo: "Trần Thị D",
      status: "Đúng lịch",
      completion: 30,
    },
  ];

  const recentIncidents = [
    {
      id: "INC001",
      equipment: "Máy dập 01",
      issue: "Máy không khởi động",
      priority: "High",
      status: "Đang xử lý",
      reportedAt: "2025-01-11 09:00",
    },
    {
      id: "INC002",
      equipment: "Máy cắt 02",
      issue: "Lưỡi cắt mòn",
      priority: "Medium",
      status: "Đang xử lý",
      reportedAt: "2025-01-10 14:00",
    },
  ];

  const purchaseColumns = [
    {
      title: "Mã YC",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: 200,
    },
    {
      title: "Người yêu cầu",
      dataIndex: "requestedBy",
      key: "requestedBy",
      width: 150,
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority) => (
        <Tag color={priority === "High" ? "error" : "warning"}>{priority}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: () => (
        <Button
          type="primary"
          size="small"
          onClick={() => navigate("/manager/purchase-approval")}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const maintenanceColumns = [
    {
      title: "Thiết bị",
      dataIndex: "equipment",
      key: "equipment",
      width: 150,
    },
    {
      title: "Ngày đến hạn",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
    },
    {
      title: "Tiến độ",
      dataIndex: "completion",
      key: "completion",
      width: 150,
      render: (completion) => (
        <Progress
          percent={completion}
          size="small"
          status={completion < 50 ? "exception" : "active"}
        />
      ),
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

  const incidentColumns = [
    {
      title: "Mã SC",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipment",
      key: "equipment",
      width: 150,
    },
    {
      title: "Vấn đề",
      dataIndex: "issue",
      key: "issue",
      width: 200,
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority) => (
        <Tag color={priority === "High" ? "error" : "warning"}>{priority}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => <Tag color="processing">{status}</Tag>,
    },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="YC mua hàng chờ duyệt"
              value={stats.purchaseRequestsPending}
              prefix={<ShoppingOutlined />}
              suffix={
                <span
                  style={{
                    fontSize: "14px",
                    color: stats.purchaseChange > 0 ? "#52c41a" : "#ff4d4f",
                  }}
                >
                  {stats.purchaseChange > 0 ? (
                    <RiseOutlined />
                  ) : (
                    <FallOutlined />
                  )}
                  {Math.abs(stats.purchaseChange)}%
                </span>
              }
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Bảo trì sắp đến hạn"
              value={stats.maintenanceDue}
              prefix={<ToolOutlined />}
              suffix={
                <span
                  style={{
                    fontSize: "14px",
                    color: stats.maintenanceChange > 0 ? "#52c41a" : "#ff4d4f",
                  }}
                >
                  {stats.maintenanceChange > 0 ? (
                    <RiseOutlined />
                  ) : (
                    <FallOutlined />
                  )}
                  {Math.abs(stats.maintenanceChange)}%
                </span>
              }
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Sự cố đang xử lý"
              value={stats.incidentsActive}
              prefix={<WarningOutlined />}
              suffix={
                <span
                  style={{
                    fontSize: "14px",
                    color: stats.incidentChange > 0 ? "#ff4d4f" : "#52c41a",
                  }}
                >
                  {stats.incidentChange > 0 ? (
                    <RiseOutlined />
                  ) : (
                    <FallOutlined />
                  )}
                  {Math.abs(stats.incidentChange)}%
                </span>
              }
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Sản lượng tháng này"
              value={stats.productionOutput}
              prefix={<FundOutlined />}
              suffix={
                <span
                  style={{
                    fontSize: "14px",
                    color: stats.productionChange > 0 ? "#52c41a" : "#ff4d4f",
                  }}
                >
                  {stats.productionChange > 0 ? (
                    <RiseOutlined />
                  ) : (
                    <FallOutlined />
                  )}
                  {Math.abs(stats.productionChange)}%
                </span>
              }
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Pending Purchase Requests */}
      <Card
        title="Yêu cầu mua hàng chờ duyệt"
        extra={
          <Button
            type="link"
            onClick={() => navigate("/manager/purchase-approval")}
          >
            Xem tất cả
          </Button>
        }
        bordered={false}
        className={styles.tableCard}
      >
        <Table
          columns={purchaseColumns}
          dataSource={pendingPurchases}
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
            onClick={() => navigate("/manager/maintenance-reports")}
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

      {/* Recent Incidents */}
      <Card
        title="Sự cố gần đây"
        extra={
          <Button type="link" onClick={() => navigate("/manager/incidents")}>
            Xem tất cả
          </Button>
        }
        bordered={false}
        className={styles.tableCard}
        style={{ marginTop: 16 }}
      >
        <Table
          columns={incidentColumns}
          dataSource={recentIncidents}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default ManagerDashboard;
