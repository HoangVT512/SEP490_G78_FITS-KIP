import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Space,
  Badge,
  Tag,
  Progress,
  Timeline,
  List,
  Avatar,
  Button,
  Select,
  DatePicker,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  SettingOutlined,
  BellOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import { Line, Column, Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import styles from "../../styles/pages/AdminDashboard.module.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AdminDashboard = ({ showHeader = true }) => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);

  // Mock statistics data
  const stats = {
    totalUsers: 1247,
    activeUsers: 1089,
    newUsersToday: 23,
    lockedAccounts: 12,
    totalSessions: 3456,
    activeSessions: 145,
    systemUptime: "99.9%",
    errorRate: "0.1%",
  };

  // Mock user activity data for charts
  const userActivityData = [
    { date: "2024-01-14", users: 120, logins: 340 },
    { date: "2024-01-15", users: 132, logins: 380 },
    { date: "2024-01-16", users: 145, logins: 420 },
    { date: "2024-01-17", users: 158, logins: 390 },
    { date: "2024-01-18", users: 167, logins: 445 },
    { date: "2024-01-19", users: 178, logins: 520 },
    { date: "2024-01-20", users: 189, logins: 498 },
  ];

  // Mock user distribution by role
  const roleDistribution = [
    { type: "User", value: 856, percent: 68.7 },
    { type: "Manager", value: 234, percent: 18.8 },
    { type: "Supervisor", value: 123, percent: 9.9 },
    { type: "Developer", value: 23, percent: 1.8 },
    { type: "Admin", value: 11, percent: 0.9 },
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      user: "Nguyễn Văn A",
      action: "Đăng nhập vào hệ thống",
      time: "2024-01-20 09:30:15",
      type: "login",
      status: "success",
    },
    {
      id: 2,
      user: "Trần Thị B",
      action: "Thay đổi thông tin cá nhân",
      time: "2024-01-20 09:28:42",
      type: "update",
      status: "success",
    },
    {
      id: 3,
      user: "Lê Minh C",
      action: "Đăng nhập thất bại (3 lần)",
      time: "2024-01-20 09:25:18",
      type: "failed_login",
      status: "warning",
    },
    {
      id: 4,
      user: "Phạm Thị D",
      action: "Đăng xuất khỏi hệ thống",
      time: "2024-01-20 09:20:33",
      type: "logout",
      status: "info",
    },
    {
      id: 5,
      user: "Hoàng Văn E",
      action: "Tài khoản bị khóa tự động",
      time: "2024-01-20 09:15:07",
      type: "account_locked",
      status: "error",
    },
  ];

  // Mock system alerts
  const systemAlerts = [
    {
      id: 1,
      title: "Đăng nhập bất thường từ IP lạ",
      description: "Phát hiện 5 lần đăng nhập thất bại từ IP 192.168.1.100",
      level: "high",
      time: "2024-01-20 09:35:00",
    },
    {
      id: 2,
      title: "Dung lượng database đạt 85%",
      description: "Database chính đang sử dụng 85% dung lượng, cần dọn dẹp",
      level: "medium",
      time: "2024-01-20 08:20:00",
    },
    {
      id: 3,
      title: "Backup tự động thành công",
      description: "Backup dữ liệu lúc 02:00 đã hoàn tất thành công",
      level: "low",
      time: "2024-01-20 02:00:00",
    },
  ];

  const getActivityIcon = (type) => {
    const icons = {
      login: <CheckCircleOutlined className={styles.activityIconLogin} />,
      logout: <ClockCircleOutlined className={styles.activityIconLogout} />,
      update: <SettingOutlined className={styles.activityIconUpdate} />,
      failed_login: <WarningOutlined className={styles.activityIconFailedLogin} />,
      account_locked: <SafetyOutlined className={styles.activityIconAccountLocked} />,
    };
    return icons[type] || <UserOutlined />;
  };

  const getAlertColor = (level) => {
    const colors = {
      high: "#ff4d4f",
      medium: "#fa8c16",
      low: "#52c41a",
    };
    return colors[level] || "#d9d9d9";
  };

  const userActivityConfig = {
    data: userActivityData,
    xField: "date",
    yField: "users",
    point: {
      size: 5,
      shape: "diamond",
    },
    color: "#334766",
    label: {
      style: {
        fill: "#aaa",
      },
    },
  };

  const roleDistributionConfig = {
    data: roleDistribution,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: false, // Tắt label để tránh lỗi
    interactions: [{ type: "element-selected" }, { type: "element-active" }],
    color: ["#334766", "#7c3aed", "#dc2626", "#ea580c", "#16a34a"],
    legend: {
      position: "right",
    },
  };

  const content = (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3} className={styles.title}>
          <DashboardOutlined className={styles.titleIcon} />
          Dashboard quản trị viên
        </Title>
        <Text type="secondary">
          Tổng quan về tình trạng hệ thống và hoạt động của người dùng
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card}>
            <Statistic
              title="Tổng người dùng"
              value={stats.totalUsers}
              prefix={<UserOutlined className={styles.statsIconUsers} />}
              valueStyle={{ color: "#1f2937" }}
            />
            <Text type="secondary" className={styles.statDescription}>
              <RiseOutlined className={styles.trendPositive} />+
              {stats.newUsersToday} hôm nay
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card}>
            <Statistic
              title="Đang hoạt động"
              value={stats.activeUsers}
              prefix={<CheckCircleOutlined className={styles.statsIconActive} />}
              valueStyle={{ color: "#1f2937" }}
            />
            <Text type="secondary" className={styles.statDescription}>
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% tổng
              số
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card}>
            <Statistic
              title="Phiên đang kết nối"
              value={stats.activeSessions}
              prefix={<TeamOutlined className={styles.statsIconDepartments} />}
              valueStyle={{ color: "#1f2937" }}
            />
            <Text type="secondary" className={styles.statDescription}>
              Từ {stats.totalSessions} phiên
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card}>
            <Statistic
              title="Tài khoản bị khóa"
              value={stats.lockedAccounts}
              prefix={<SafetyOutlined className={styles.statsIconSecurity} />}
              valueStyle={{ color: "#1f2937" }}
            />
            <Text type="secondary" className={styles.statDescription}>
              Cần xem xét
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Hoạt động người dùng theo thời gian"
            className={styles.card}
          >
            <Line {...userActivityConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Phân bố vai trò người dùng"
            className={styles.card}
          >
            <Pie {...roleDistributionConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Activity & Alerts Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Hoạt động gần đây"
            className={styles.card}
            extra={
              <Button type="link" icon={<EyeOutlined />}>
                Xem tất cả
              </Button>
            }
          >
            <List
              dataSource={recentActivities}
              renderItem={(activity) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getActivityIcon(activity.type)}
                    title={
                      <Space>
                        <Text strong>{activity.user}</Text>
                        <Text
                          type="secondary"
                          className={styles.activityTime}
                        >
                          {dayjs(activity.time).format("HH:mm:ss")}
                        </Text>
                      </Space>
                    }
                    description={activity.action}
                  />
                </List.Item>
              )}
              className={styles.activityList}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Cảnh báo hệ thống"
            className={styles.card}
            extra={
              <Button type="link" icon={<BellOutlined />}>
                Xem tất cả
              </Button>
            }
          >
            <List
              dataSource={systemAlerts}
              renderItem={(alert) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge
                        status={
                          alert.level === "high"
                            ? "error"
                            : alert.level === "medium"
                            ? "warning"
                            : "success"
                        }
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{alert.title}</Text>
                        <Text
                          type="secondary"
                          className={styles.alertTime}
                        >
                          {dayjs(alert.time).format("DD/MM HH:mm")}
                        </Text>
                      </Space>
                    }
                    description={alert.description}
                  />
                </List.Item>
              )}
              className={styles.activityList}
            />
          </Card>
        </Col>
      </Row>

      {/* System Status Row */}
      <Row gutter={[16, 16]} className={styles.systemStatusRow}>
        <Col xs={24}>
          <Card title="Tình trạng hệ thống" className={styles.card}>
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div className={styles.progressContainer}>
                  <Progress
                    type="circle"
                    percent={99.9}
                    format={(percent) => `${percent}%`}
                    strokeColor="#52c41a"
                    size={80}
                  />
                  <div className={styles.progressLabel}>
                    <Text strong className={styles.progressTitle}>
                      Thời gian hoạt động
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className={styles.progressContainer}>
                  <Progress
                    type="circle"
                    percent={15}
                    format={(percent) => `${100 - percent}%`}
                    strokeColor="#1890ff"
                    size={80}
                  />
                  <div className={styles.progressLabel}>
                    <Text strong className={styles.progressTitle}>
                      Sử dụng CPU
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className={styles.progressContainer}>
                  <Progress
                    type="circle"
                    percent={68}
                    format={(percent) => `${percent}%`}
                    strokeColor="#fa8c16"
                    size={80}
                  />
                  <div className={styles.progressLabel}>
                    <Text strong className={styles.progressTitle}>
                      Sử dụng RAM
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className={styles.progressContainer}>
                  <Progress
                    type="circle"
                    percent={85}
                    format={(percent) => `${percent}%`}
                    strokeColor="#ff4d4f"
                    size={80}
                  />
                  <div className={styles.progressLabel}>
                    <Text strong className={styles.progressTitle}>
                      Dung lượng ổ cứng
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return showHeader ? <Layout>{content}</Layout> : content;
};

export default AdminDashboard;
