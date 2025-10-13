import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Space,
  Button,
  Table,
} from "antd";
import {
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Line, Column, Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import styles from "../../styles/pages/ProductionDetailReport.module.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const ProductionDetailReport = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);
  const [selectedLine, setSelectedLine] = useState("all");

  // Mock statistics
  const statistics = {
    totalOutput: 25400,
    targetOutput: 28000,
    defectRate: 1.2,
    efficiency: 90.7,
    outputChange: 8.5,
    defectChange: -0.3,
  };

  // Mock output vs target data
  const outputComparisonData = [
    { date: "2025-01-04", type: "Mục tiêu", value: 1000 },
    { date: "2025-01-04", type: "Thực tế", value: 920 },
    { date: "2025-01-05", type: "Mục tiêu", value: 1000 },
    { date: "2025-01-05", type: "Thực tế", value: 980 },
    { date: "2025-01-06", type: "Mục tiêu", value: 1000 },
    { date: "2025-01-06", type: "Thực tế", value: 950 },
    { date: "2025-01-07", type: "Mục tiêu", value: 1000 },
    { date: "2025-01-07", type: "Thực tế", value: 1050 },
    { date: "2025-01-08", type: "Mục tiêu", value: 1000 },
    { date: "2025-01-08", type: "Thực tế", value: 990 },
    { date: "2025-01-09", type: "Mục tiêu", value: 1000 },
    { date: "2025-01-09", type: "Thực tế", value: 1020 },
    { date: "2025-01-10", type: "Mục tiêu", value: 1000 },
    { date: "2025-01-10", type: "Thực tế", value: 980 },
  ];

  // Mock defect rate trend
  const defectTrendData = [
    { date: "2025-01-04", rate: 1.8 },
    { date: "2025-01-05", rate: 1.5 },
    { date: "2025-01-06", rate: 1.3 },
    { date: "2025-01-07", rate: 1.1 },
    { date: "2025-01-08", rate: 1.2 },
    { date: "2025-01-09", rate: 0.9 },
    { date: "2025-01-10", rate: 1.0 },
  ];

  // Mock defect distribution
  const defectDistributionData = [
    { type: "Vỡ/Nứt", value: 35 },
    { type: "Lệch kích thước", value: 28 },
    { type: "Bề mặt xấu", value: 22 },
    { type: "Thiếu chi tiết", value: 10 },
    { type: "Khác", value: 5 },
  ];

  // Mock line performance
  const linePerformance = [
    {
      id: 1,
      lineId: "LINE-A",
      lineName: "Dây chuyền A",
      target: 10000,
      actual: 9200,
      defects: 115,
      efficiency: 92.0,
      defectRate: 1.25,
    },
    {
      id: 2,
      lineId: "LINE-B",
      lineName: "Dây chuyền B",
      target: 8000,
      actual: 7600,
      defects: 76,
      efficiency: 95.0,
      defectRate: 1.0,
    },
    {
      id: 3,
      lineId: "LINE-C",
      lineName: "Dây chuyền C",
      target: 10000,
      actual: 8600,
      defects: 120,
      efficiency: 86.0,
      defectRate: 1.4,
    },
  ];

  const lineColumns = [
    {
      title: "Dây chuyền",
      dataIndex: "lineId",
      key: "lineId",
      width: 120,
    },
    {
      title: "Tên dây chuyền",
      dataIndex: "lineName",
      key: "lineName",
      width: 150,
    },
    {
      title: "Mục tiêu",
      dataIndex: "target",
      key: "target",
      width: 120,
      align: "center",
      render: (value) => value.toLocaleString(),
    },
    {
      title: "Thực tế",
      dataIndex: "actual",
      key: "actual",
      width: 120,
      align: "center",
      render: (value, record) => (
        <span
          style={{
            color: value >= record.target ? "#52c41a" : "#faad14",
            fontWeight: "bold",
          }}
        >
          {value.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Lỗi",
      dataIndex: "defects",
      key: "defects",
      width: 100,
      align: "center",
    },
    {
      title: "Hiệu suất",
      dataIndex: "efficiency",
      key: "efficiency",
      width: 120,
      align: "center",
      render: (value) => (
        <span
          style={{
            color:
              value >= 90 ? "#52c41a" : value >= 80 ? "#faad14" : "#ff4d4f",
            fontWeight: "bold",
          }}
        >
          {value}%
        </span>
      ),
    },
    {
      title: "Tỷ lệ lỗi",
      dataIndex: "defectRate",
      key: "defectRate",
      width: 120,
      align: "center",
      render: (value) => (
        <span
          style={{
            color:
              value <= 1 ? "#52c41a" : value <= 1.5 ? "#faad14" : "#ff4d4f",
          }}
        >
          {value}%
        </span>
      ),
    },
  ];

  const lineChartConfig = {
    data: outputComparisonData,
    xField: "date",
    yField: "value",
    seriesField: "type",
    xAxis: {
      label: {
        formatter: (text) => dayjs(text).format("DD/MM"),
      },
    },
    yAxis: {
      label: {
        formatter: (text) => `${text}`,
      },
    },
    smooth: true,
    animation: {
      appear: {
        animation: "path-in",
        duration: 1000,
      },
    },
  };

  const defectLineConfig = {
    data: defectTrendData,
    xField: "date",
    yField: "rate",
    xAxis: {
      label: {
        formatter: (text) => dayjs(text).format("DD/MM"),
      },
    },
    yAxis: {
      label: {
        formatter: (text) => `${text}%`,
      },
    },
    smooth: true,
    color: "#ff4d4f",
    point: {
      size: 5,
      shape: "circle",
    },
  };

  const pieConfig = {
    data: defectDistributionData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    legend: {
      position: "bottom",
    },
  };

  const handleExportReport = () => {
    console.log("Exporting production detail report...");
  };

  return (
    <div className={styles.container}>
      <Card
        title="Báo cáo chi tiết sản xuất"
        bordered={false}
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportReport}
          >
            Xuất báo cáo
          </Button>
        }
      >
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn dây chuyền"
                value={selectedLine}
                onChange={setSelectedLine}
              >
                <Option value="all">Tất cả dây chuyền</Option>
                <Option value="LINE-A">LINE-A - Dây chuyền A</Option>
                <Option value="LINE-B">LINE-B - Dây chuyền B</Option>
                <Option value="LINE-C">LINE-C - Dây chuyền C</Option>
              </Select>
            </Col>
          </Row>
        </Space>

        {/* Key Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Sản lượng thực tế"
                value={statistics.totalOutput}
                prefix={<CheckCircleOutlined style={{ color: "#1890ff" }} />}
                suffix={
                  <span style={{ fontSize: "14px", color: "#52c41a" }}>
                    <RiseOutlined /> {statistics.outputChange}%
                  </span>
                }
                valueStyle={{ color: "#1890ff" }}
              />
              <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: 8 }}>
                Mục tiêu: {statistics.targetOutput.toLocaleString()}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Hiệu suất"
                value={statistics.efficiency}
                suffix="%"
                valueStyle={{
                  color: statistics.efficiency >= 90 ? "#52c41a" : "#faad14",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tỷ lệ lỗi"
                value={statistics.defectRate}
                suffix="%"
                prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                valueStyle={{ color: "#ff4d4f" }}
              />
              <div style={{ fontSize: "14px", color: "#52c41a", marginTop: 8 }}>
                <FallOutlined /> {Math.abs(statistics.defectChange)}%
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đạt mục tiêu"
                value={(
                  (statistics.totalOutput / statistics.targetOutput) *
                  100
                ).toFixed(1)}
                suffix="%"
                valueStyle={{
                  color:
                    statistics.totalOutput >= statistics.targetOutput
                      ? "#52c41a"
                      : "#faad14",
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={16}>
            <Card title="Sản lượng thực tế vs Mục tiêu">
              <Line {...lineChartConfig} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Phân bố lỗi theo loại">
              <Pie {...pieConfig} />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card title="Xu hướng tỷ lệ lỗi">
              <Line {...defectLineConfig} />
            </Card>
          </Col>
        </Row>

        {/* Line Performance Table */}
        <Card title="Hiệu suất theo dây chuyền">
          <Table
            columns={lineColumns}
            dataSource={linePerformance}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Card>
    </div>
  );
};

export default ProductionDetailReport;
