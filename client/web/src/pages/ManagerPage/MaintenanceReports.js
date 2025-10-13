import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Progress,
  DatePicker,
  Select,
  Space,
  Button,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/MaintenanceReports.module.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const MaintenanceReports = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);
  const [selectedTechnician, setSelectedTechnician] = useState("all");

  // Mock statistics
  const statistics = {
    totalCompleted: 45,
    onTime: 38,
    overdue: 7,
    completionRate: 84.4,
  };

  // Mock overdue maintenance
  const overdueData = [
    {
      id: 1,
      equipmentId: "EQ001",
      equipmentName: "Máy dập 01",
      planType: "Bảo trì định kỳ",
      scheduledDate: "2025-01-05",
      assignedTo: "Nguyễn Văn A",
      daysOverdue: 5,
      priority: "High",
    },
    {
      id: 2,
      equipmentId: "EQ003",
      equipmentName: "Băng tải B",
      planType: "Kiểm tra an toàn",
      scheduledDate: "2025-01-08",
      assignedTo: "Trần Thị B",
      daysOverdue: 2,
      priority: "Medium",
    },
  ];

  // Mock technician performance
  const technicianPerformance = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      totalAssigned: 15,
      completed: 13,
      onTime: 11,
      overdue: 2,
      completionRate: 86.7,
      onTimeRate: 84.6,
    },
    {
      id: 2,
      name: "Trần Thị B",
      totalAssigned: 12,
      completed: 10,
      onTime: 9,
      overdue: 1,
      completionRate: 83.3,
      onTimeRate: 90.0,
    },
    {
      id: 3,
      name: "Phạm Văn C",
      totalAssigned: 18,
      completed: 15,
      onTime: 13,
      overdue: 2,
      completionRate: 83.3,
      onTimeRate: 86.7,
    },
  ];

  const overdueColumns = [
    {
      title: "Mã thiết bị",
      dataIndex: "equipmentId",
      key: "equipmentId",
      width: 120,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 150,
    },
    {
      title: "Loại bảo trì",
      dataIndex: "planType",
      key: "planType",
      width: 150,
    },
    {
      title: "Ngày dự kiến",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Kỹ thuật viên",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 150,
    },
    {
      title: "Số ngày trễ",
      dataIndex: "daysOverdue",
      key: "daysOverdue",
      width: 100,
      render: (days) => (
        <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
          {days} ngày
        </span>
      ),
    },
  ];

  const performanceColumns = [
    {
      title: "Kỹ thuật viên",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Tổng số",
      dataIndex: "totalAssigned",
      key: "totalAssigned",
      width: 100,
      align: "center",
    },
    {
      title: "Hoàn thành",
      dataIndex: "completed",
      key: "completed",
      width: 110,
      align: "center",
    },
    {
      title: "Đúng hạn",
      dataIndex: "onTime",
      key: "onTime",
      width: 100,
      align: "center",
    },
    {
      title: "Trễ hạn",
      dataIndex: "overdue",
      key: "overdue",
      width: 100,
      align: "center",
      render: (overdue) => (
        <span style={{ color: overdue > 0 ? "#ff4d4f" : "inherit" }}>
          {overdue}
        </span>
      ),
    },
    {
      title: "Tỷ lệ hoàn thành",
      dataIndex: "completionRate",
      key: "completionRate",
      width: 180,
      render: (rate) => (
        <Progress
          percent={rate}
          size="small"
          status={rate >= 85 ? "success" : rate >= 70 ? "normal" : "exception"}
          format={(percent) => `${percent.toFixed(1)}%`}
        />
      ),
    },
    {
      title: "Tỷ lệ đúng hạn",
      dataIndex: "onTimeRate",
      key: "onTimeRate",
      width: 180,
      render: (rate) => (
        <Progress
          percent={rate}
          size="small"
          status={rate >= 85 ? "success" : rate >= 70 ? "normal" : "exception"}
          format={(percent) => `${percent.toFixed(1)}%`}
          strokeColor="#52c41a"
        />
      ),
    },
  ];

  const handleExportReport = () => {
    console.log("Exporting maintenance report...");
  };

  return (
    <div className={styles.container}>
      <Card title="Báo cáo bảo trì" bordered={false}>
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
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
                placeholder="Chọn kỹ thuật viên"
                value={selectedTechnician}
                onChange={setSelectedTechnician}
              >
                <Option value="all">Tất cả kỹ thuật viên</Option>
                <Option value="1">Nguyễn Văn A</Option>
                <Option value="2">Trần Thị B</Option>
                <Option value="3">Phạm Văn C</Option>
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportReport}
                block
              >
                Xuất báo cáo
              </Button>
            </Col>
          </Row>
        </Space>

        {/* Statistics Overview */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng hoàn thành"
                value={statistics.totalCompleted}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đúng hạn"
                value={statistics.onTime}
                prefix={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Trễ hạn"
                value={statistics.overdue}
                prefix={
                  <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
                }
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tỷ lệ hoàn thành"
                value={statistics.completionRate}
                suffix="%"
                valueStyle={{
                  color:
                    statistics.completionRate >= 85
                      ? "#52c41a"
                      : statistics.completionRate >= 70
                      ? "#1890ff"
                      : "#ff4d4f",
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Overdue Maintenance */}
        <Card
          title="Bảo trì trễ hạn"
          style={{ marginBottom: 24 }}
          headStyle={{ backgroundColor: "#fff2e8", color: "#ff4d4f" }}
        >
          <Table
            columns={overdueColumns}
            dataSource={overdueData}
            rowKey="id"
            pagination={false}
            scroll={{ x: 900 }}
          />
        </Card>

        {/* Technician Performance */}
        <Card title="Hiệu suất kỹ thuật viên">
          <Table
            columns={performanceColumns}
            dataSource={technicianPerformance}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Card>
      </Card>
    </div>
  );
};

export default MaintenanceReports;
