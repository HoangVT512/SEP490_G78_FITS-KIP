import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Table,
  Typography,
  Space,
  Statistic,
  Tag,
  Progress,
  Alert,
  Tooltip,
  Empty,
  Spin,
} from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  CalendarOutlined,
  UserOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  ExportOutlined,
  FilterOutlined,
  ReloadOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import { Line, Column, Pie, Area } from "@ant-design/plots";
import dayjs from "dayjs";
import styles from "../../styles/pages/AdminReports.module.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminReports = ({ showHeader = true }) => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("user_activity");
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Mock report data
  const [reportData, setReportData] = useState({
    userActivity: {
      summary: {
        totalLogins: 2340,
        uniqueUsers: 189,
        avgSessionTime: "24 phút",
        peakHour: "09:00 - 10:00",
      },
      chartData: [
        { date: "2024-01-14", logins: 89, users: 34 },
        { date: "2024-01-15", logins: 92, users: 38 },
        { date: "2024-01-16", logins: 78, users: 29 },
        { date: "2024-01-17", logins: 85, users: 32 },
        { date: "2024-01-18", logins: 94, users: 41 },
        { date: "2024-01-19", logins: 102, users: 45 },
        { date: "2024-01-20", logins: 98, users: 43 },
      ],
    },
    securityEvents: {
      summary: {
        totalEvents: 156,
        failedLogins: 23,
        lockedAccounts: 4,
        suspiciousIPs: 2,
      },
      eventTypes: [
        { type: "Đăng nhập thất bại", count: 23, color: "#ff4d4f" },
        { type: "Tài khoản bị khóa", count: 4, color: "#fa8c16" },
        { type: "IP đáng ngờ", count: 2, color: "#722ed1" },
        { type: "Thay đổi mật khẩu", count: 67, color: "#52c41a" },
        { type: "Xác thực 2FA", count: 34, color: "#1890ff" },
      ],
    },
    departmentUsage: {
      summary: {
        activeDepartments: 5,
        mostActive: "IT",
        leastActive: "Nhân sự",
      },
      data: [
        { department: "IT", users: 45, sessions: 234, avgTime: 32 },
        { department: "Sản xuất", users: 78, sessions: 189, avgTime: 18 },
        {
          department: "Kiểm soát chất lượng",
          users: 34,
          sessions: 156,
          avgTime: 25,
        },
        { department: "Quản lý", users: 12, sessions: 87, avgTime: 45 },
        { department: "Nhân sự", users: 20, sessions: 67, avgTime: 15 },
      ],
    },
    systemPerformance: {
      summary: {
        uptime: "99.9%",
        avgResponseTime: "245ms",
        errorRate: "0.1%",
        totalRequests: 45678,
      },
      performanceData: [
        { time: "00:00", cpu: 15, memory: 45, response: 180 },
        { time: "04:00", cpu: 12, memory: 42, response: 165 },
        { time: "08:00", cpu: 45, memory: 68, response: 320 },
        { time: "12:00", cpu: 78, memory: 85, response: 450 },
        { time: "16:00", cpu: 56, memory: 72, response: 380 },
        { time: "20:00", cpu: 34, memory: 58, response: 280 },
      ],
    },
  });

  const reportTypes = [
    { value: "user_activity", label: "Hoạt động người dùng" },
    { value: "security_events", label: "Sự kiện bảo mật" },
    { value: "department_usage", label: "Sử dụng theo phòng ban" },
    { value: "system_performance", label: "Hiệu suất hệ thống" },
  ];

  const departments = [
    { value: "all", label: "Tất cả phòng ban" },
    { value: "it", label: "IT" },
    { value: "production", label: "Sản xuất" },
    { value: "qa", label: "Kiểm soát chất lượng" },
    { value: "management", label: "Quản lý" },
    { value: "hr", label: "Nhân sự" },
  ];

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [reportType, dateRange, departmentFilter]);

  const handleExportReport = (format) => {
    const filename = `fitskip-report-${reportType}-${dayjs().format(
      "YYYY-MM-DD"
    )}.${format}`;
    // Simulate export
    console.log(`Exporting report as ${format}:`, filename);
    // message.success(`Đã xuất báo cáo định dạng ${format.toUpperCase()}`);
  };

  const renderUserActivityReport = () => {
    const data = reportData.userActivity;

    const chartConfig = {
      data: data.chartData,
      xField: "date",
      yField: "logins",
      point: { size: 5, shape: "diamond" },
      color: "#334766",
      smooth: true,
    };

    return (
      <>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Tổng đăng nhập"
                value={data.summary.totalLogins}
                prefix={<UserOutlined style={{ color: "#334766" }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Người dùng duy nhất"
                value={data.summary.uniqueUsers}
                prefix={<UserOutlined style={{ color: "#52c41a" }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Thời gian phiên TB"
                value={data.summary.avgSessionTime}
                prefix={<ClockCircleOutlined style={{ color: "#fa8c16" }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Giờ cao điểm"
                value={data.summary.peakHour}
                prefix={<RiseOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ fontSize: 16 }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Xu hướng đăng nhập theo thời gian">
          <Line {...chartConfig} height={300} />
        </Card>
      </>
    );
  };

  const renderSecurityEventsReport = () => {
    const data = reportData.securityEvents;

    const pieConfig = {
      data: data.eventTypes,
      angleField: "count",
      colorField: "type",
      radius: 0.8,
      label: false, // Tắt label để tránh lỗi
      color: data.eventTypes.map((item) => item.color),
      legend: {
        position: "right",
      },
    };

    const columns = [
      {
        title: "Loại sự kiện",
        dataIndex: "type",
        key: "type",
        render: (text, record) => (
          <Space>
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: record.color,
                borderRadius: 2,
              }}
            />
            <Text>{text}</Text>
          </Space>
        ),
      },
      {
        title: "Số lượng",
        dataIndex: "count",
        key: "count",
        align: "right",
        render: (count) => <Text strong>{count}</Text>,
      },
      {
        title: "Mức độ",
        key: "severity",
        render: (_, record) => {
          const severity =
            record.count > 20 ? "high" : record.count > 10 ? "medium" : "low";
          const colors = { high: "error", medium: "warning", low: "success" };
          const texts = { high: "Cao", medium: "Trung bình", low: "Thấp" };
          return <Tag color={colors[severity]}>{texts[severity]}</Tag>;
        },
      },
    ];

    return (
      <>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Tổng sự kiện"
                value={data.summary.totalEvents}
                prefix={<SafetyOutlined style={{ color: "#334766" }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Đăng nhập thất bại"
                value={data.summary.failedLogins}
                prefix={<SafetyOutlined style={{ color: "#ff4d4f" }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Tài khoản bị khóa"
                value={data.summary.lockedAccounts}
                prefix={<SafetyOutlined style={{ color: "#fa8c16" }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="IP đáng ngờ"
                value={data.summary.suspiciousIPs}
                prefix={<SafetyOutlined style={{ color: "#722ed1" }} />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={14}>
            <Card title="Phân bố sự kiện bảo mật">
              <Pie {...pieConfig} height={300} />
            </Card>
          </Col>
          <Col span={10}>
            <Card title="Chi tiết sự kiện">
              <Table
                dataSource={data.eventTypes}
                columns={columns}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderDepartmentUsageReport = () => {
    const data = reportData.departmentUsage;

    const columnConfig = {
      data: data.data,
      xField: "department",
      yField: "users",
      color: "#334766",
      columnWidthRatio: 0.6,
    };

    const columns = [
      {
        title: "Phòng ban",
        dataIndex: "department",
        key: "department",
      },
      {
        title: "Số người dùng",
        dataIndex: "users",
        key: "users",
        align: "right",
      },
      {
        title: "Phiên đăng nhập",
        dataIndex: "sessions",
        key: "sessions",
        align: "right",
      },
      {
        title: "Thời gian TB (phút)",
        dataIndex: "avgTime",
        key: "avgTime",
        align: "right",
      },
      {
        title: "Mức độ hoạt động",
        key: "activity",
        render: (_, record) => {
          const ratio =
            (record.sessions / Math.max(...data.data.map((d) => d.sessions))) *
            100;
          return (
            <Progress
              percent={ratio}
              size="small"
              strokeColor={
                ratio > 70 ? "#52c41a" : ratio > 40 ? "#fa8c16" : "#ff4d4f"
              }
              showInfo={false}
            />
          );
        },
      },
    ];

    return (
      <>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Phòng ban hoạt động"
                value={data.summary.activeDepartments}
                suffix="/ 5"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Hoạt động nhất"
                value={data.summary.mostActive}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Ít hoạt động nhất"
                value={data.summary.leastActive}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={14}>
            <Card title="Số người dùng theo phòng ban">
              <Column {...columnConfig} height={300} />
            </Card>
          </Col>
          <Col span={10}>
            <Card title="Thống kê chi tiết">
              <Table
                dataSource={data.data}
                columns={columns}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderSystemPerformanceReport = () => {
    const data = reportData.systemPerformance;

    const areaConfig = {
      data: data.performanceData,
      xField: "time",
      yField: "cpu",
      smooth: true,
      color: "#334766",
      areaStyle: {
        fillOpacity: 0.3,
      },
    };

    return (
      <>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Uptime"
                value={data.summary.uptime}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Thời gian phản hồi TB"
                value={data.summary.avgResponseTime}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Tỷ lệ lỗi"
                value={data.summary.errorRate}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Tổng requests"
                value={data.summary.totalRequests}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Hiệu suất CPU theo thời gian">
          <Area {...areaConfig} height={300} />
        </Card>
      </>
    );
  };

  const renderReportContent = () => {
    switch (reportType) {
      case "user_activity":
        return renderUserActivityReport();
      case "security_events":
        return renderSecurityEventsReport();
      case "department_usage":
        return renderDepartmentUsageReport();
      case "system_performance":
        return renderSystemPerformanceReport();
      default:
        return <Empty description="Chọn loại báo cáo để xem chi tiết" />;
    }
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
    marginBottom: "24px",
  };

  const contentStyle = {
    padding: "24px",
    backgroundColor: "#f8fafc",
    minHeight: "calc(100vh - 70px)",
  };

  const content = (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3} className={styles.title}>
          <BarChartOutlined className={styles.titleIcon} />
          Báo cáo & Thống kê
        </Title>
        <Text type="secondary">
          Phân tích dữ liệu và tạo báo cáo chi tiết về hoạt động hệ thống
        </Text>
      </div>

      <Card className={styles.card}>
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={8} md={6}>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: "100%" }}
              placeholder="Chọn loại báo cáo"
            >
              {reportTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: "100%" }}
              placeholder="Lọc theo phòng ban"
            >
              {departments.map((dept) => (
                <Option key={dept.value} value={dept.value}>
                  {dept.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadReportData}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                style={{ backgroundColor: "#334766", borderColor: "#334766", color: "#fff" }}
                icon={<DownloadOutlined />}
                onClick={() => handleExportReport("pdf")}
              >
                Xuất PDF
              </Button>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>{renderReportContent()}</Spin>
      </Card>
    </div>
  );

  return showHeader ? <Layout>{content}</Layout> : content;
};

export default AdminReports;
