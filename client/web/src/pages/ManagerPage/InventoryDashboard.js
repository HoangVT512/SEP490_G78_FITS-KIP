import React, { useState } from "react";
import { Card, Row, Col, Statistic, Progress, Table, Tag } from "antd";
import {
  InboxOutlined,
  WarningOutlined,
  RiseOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Pie, Column } from "@ant-design/plots";
import dayjs from "dayjs";
import styles from "../../styles/pages/InventoryDashboard.module.css";

const InventoryDashboard = () => {
  // Mock statistics
  const statistics = {
    totalItems: 156,
    lowStockItems: 8,
    totalValue: 450000000,
    monthlyConsumption: 75,
  };

  // Mock low stock alerts
  const lowStockData = [
    {
      id: 1,
      partNumber: "PT003",
      partName: "Ổ bi SKF 6205",
      currentStock: 5,
      minStock: 10,
      avgMonthlyUsage: 8,
      status: "warning",
    },
    {
      id: 2,
      partNumber: "PT005",
      partName: "Dầu thủy lực",
      currentStock: 3,
      minStock: 15,
      avgMonthlyUsage: 12,
      status: "critical",
    },
    {
      id: 3,
      partNumber: "PT007",
      partName: "Bộ lọc dầu",
      currentStock: 8,
      minStock: 12,
      avgMonthlyUsage: 6,
      status: "warning",
    },
  ];

  // Mock category distribution
  const categoryData = [
    { type: "Điện", value: 35 },
    { type: "Cơ khí", value: 45 },
    { type: "Thủy lực", value: 28 },
    { type: "Điện tử", value: 22 },
    { type: "Khác", value: 26 },
  ];

  // Mock monthly usage trend
  const usageTrendData = [
    { month: "T7/24", value: 65 },
    { month: "T8/24", value: 72 },
    { month: "T9/24", value: 68 },
    { month: "T10/24", value: 78 },
    { month: "T11/24", value: 82 },
    { month: "T12/24", value: 75 },
  ];

  const lowStockColumns = [
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 120,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: 200,
    },
    {
      title: "Tồn kho",
      dataIndex: "currentStock",
      key: "currentStock",
      width: 100,
      align: "center",
      render: (stock, record) => (
        <span
          style={{
            color: record.status === "critical" ? "#ff4d4f" : "#faad14",
            fontWeight: "bold",
          }}
        >
          {stock}
        </span>
      ),
    },
    {
      title: "Tồn kho tối thiểu",
      dataIndex: "minStock",
      key: "minStock",
      width: 150,
      align: "center",
    },
    {
      title: "TB sử dụng/tháng",
      dataIndex: "avgMonthlyUsage",
      key: "avgMonthlyUsage",
      width: 150,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "critical" ? "error" : "warning"}>
          {status === "critical" ? "Rất thấp" : "Thấp"}
        </Tag>
      ),
    },
  ];

  const pieConfig = {
    data: categoryData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    legend: {
      position: "bottom",
    },
  };

  const columnConfig = {
    data: usageTrendData,
    xField: "month",
    yField: "value",
    label: {
      position: "top",
      style: {
        fill: "#000000",
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: false,
        autoRotate: false,
      },
    },
  };

  return (
    <div className={styles.container}>
      <Card title="Bảng điều khiển tồn kho" bordered={false}>
        {/* Statistics Overview */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng số phụ tùng"
                value={statistics.totalItems}
                prefix={<InboxOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tồn kho thấp"
                value={statistics.lowStockItems}
                prefix={<WarningOutlined style={{ color: "#ff4d4f" }} />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Giá trị tồn kho"
                value={statistics.totalValue / 1000000}
                prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                suffix="triệu"
                valueStyle={{ color: "#52c41a" }}
                precision={0}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tiêu thụ tháng này"
                value={statistics.monthlyConsumption}
                prefix={<RiseOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Card title="Phân bố theo danh mục">
              <Pie {...pieConfig} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Xu hướng sử dụng 6 tháng">
              <Column {...columnConfig} />
            </Card>
          </Col>
        </Row>

        {/* Low Stock Alerts */}
        <Card
          title="Cảnh báo tồn kho thấp"
          headStyle={{ backgroundColor: "#fff2e8" }}
        >
          <Table
            columns={lowStockColumns}
            dataSource={lowStockData}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Card>
    </div>
  );
};

export default InventoryDashboard;
