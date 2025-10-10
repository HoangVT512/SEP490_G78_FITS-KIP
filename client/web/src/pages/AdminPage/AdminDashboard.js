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
  Spin,
  Alert,
  Empty,
  Button,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  ApartmentOutlined,
  ClusterOutlined,
  BlockOutlined,
  CheckCircleOutlined,
  LockOutlined,
  DashboardOutlined,
  PlusOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import styles from "../../styles/pages/AdminDashboard.module.css";
import { dashboardService } from "../../services/dashboardService";

const { Title, Text } = Typography;

const AdminDashboard = ({ showHeader = true }) => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [stats, users] = await Promise.all([
          dashboardService.getStatistics(),
          dashboardService.getRecentUsers(5),
        ]);

        console.log("Dashboard stats response:", stats);
        console.log("Dashboard users response:", users);

        setStatistics(stats);
        setRecentUsers(users);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Columns cho bảng phòng ban
  const departmentColumns = [
    {
      title: "Tên phòng ban",
      dataIndex: "departmentName",
      key: "departmentName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Số chuyền",
      dataIndex: "lineCount",
      key: "lineCount",
      align: "center",
      render: (count) => <Badge count={count} showZero color="#334766" />,
    },
    {
      title: "Quản lý",
      dataIndex: "managerName",
      key: "managerName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
  ];

  // Columns cho bảng người dùng mới
  const recentUsersColumns = [
    {
      title: "Tên đăng nhập",
      dataIndex: "userName",
      key: "userName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      key: "roles",
      render: (roles) => (
        <>
          {roles &&
            roles.map((role, index) => (
              <Tag key={index} color="blue">
                {role}
              </Tag>
            ))}
        </>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isLocked",
      key: "isLocked",
      align: "center",
      render: (isLocked) => (
        <Tag
          color={isLocked ? "red" : "green"}
          icon={isLocked ? <LockOutlined /> : <CheckCircleOutlined />}
        >
          {isLocked ? "Bị khóa" : "Hoạt động"}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang tải dữ liệu dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "50px" }}>
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!statistics || !statistics.summary) {
    return (
      <div style={{ padding: "50px" }}>
        <Empty description="Không có dữ liệu" />
      </div>
    );
  }

  const content = (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3} className={styles.title}>
          <DashboardOutlined className={styles.titleIcon} />
          Bảng điều khiển quản trị viên
        </Title>
        <Text type="secondary">
          Tổng quan về hệ thống quản lý sản xuất FITS-KIP
        </Text>
      </div>

      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} md={8} lg={8} xl={4.8}>
          <Card className={styles.card} hoverable>
            <Statistic
              title="Tổng người dùng"
              value={statistics.summary.totalUsers}
              prefix={<UserOutlined className={styles.statsIconUsers} />}
              valueStyle={{
                color: "#334766",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
            <Text type="secondary" className={styles.statDescription}>
              <CheckCircleOutlined
                style={{ color: "#52c41a", marginRight: 4 }}
              />
              {statistics.summary.activeUsers} hoạt động
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={4.8}>
          <Card className={styles.card} hoverable>
            <Statistic
              title="Phòng ban"
              value={statistics.summary.totalDepartments}
              prefix={
                <ApartmentOutlined className={styles.statsIconDepartments} />
              }
              valueStyle={{
                color: "#7c3aed",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
            <Text type="secondary" className={styles.statDescription}>
              <CheckCircleOutlined
                style={{ color: "#52c41a", marginRight: 4 }}
              />
              {statistics.statusStats?.activeDepartments || 0} đang hoạt động
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={4.8}>
          <Card className={styles.card} hoverable>
            <Statistic
              title="Dây chuyền sản xuất"
              value={statistics.summary.totalLines}
              prefix={<ClusterOutlined style={{ color: "#16a34a" }} />}
              valueStyle={{
                color: "#16a34a",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
            <Text type="secondary" className={styles.statDescription}>
              <CheckCircleOutlined
                style={{ color: "#52c41a", marginRight: 4 }}
              />
              {statistics.statusStats?.activeLines || 0} đang hoạt động
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8} xl={4.8}>
          <Card className={styles.card} hoverable>
            <Statistic
              title="Công đoạn"
              value={statistics.summary.totalStages}
              prefix={<BlockOutlined style={{ color: "#ea580c" }} />}
              valueStyle={{
                color: "#ea580c",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
            <Text type="secondary" className={styles.statDescription}>
              Trên {statistics.summary.totalLines} chuyền
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8} xl={4.8}>
          <Card className={styles.card} hoverable>
            <Statistic
              title="Thiết bị"
              value={statistics.summary.totalEquipments || 0}
              prefix={<ToolOutlined style={{ color: "#0891b2" }} />}
              valueStyle={{
                color: "#0891b2",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
            <Text type="secondary" className={styles.statDescription}>
              <CheckCircleOutlined
                style={{ color: "#52c41a", marginRight: 4 }}
              />
              {statistics.statusStats?.activeEquipments || 0} hoạt động
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12} style={{ display: "flex" }}>
          <Card
            title="Phân bố vai trò người dùng"
            className={styles.card}
            style={{ width: "100%" }}
          >
            <Row gutter={[8, 8]}>
              {statistics.usersByRole &&
                statistics.usersByRole.map((role, index) => (
                  <Col span={24} key={index}>
                    <Card
                      size="small"
                      style={{
                        background: [
                          "#f0f5ff",
                          "#f9f0ff",
                          "#fff7e6",
                          "#f6ffed",
                          "#fff1f0",
                        ][index % 5],
                        border: `1px solid ${
                          [
                            "#91d5ff",
                            "#d3adf7",
                            "#ffd591",
                            "#b7eb8f",
                            "#ffa39e",
                          ][index % 5]
                        }`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <Text strong style={{ fontSize: "16px" }}>
                            {role.roleName}
                          </Text>
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {role.percentage.toFixed(1)}% tổng số người dùng
                            </Text>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "24px",
                              fontWeight: "bold",
                              color: [
                                "#1890ff",
                                "#722ed1",
                                "#fa8c16",
                                "#52c41a",
                                "#f5222d",
                              ][index % 5],
                            }}
                          >
                            {role.userCount}
                          </div>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            người dùng
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12} style={{ display: "flex" }}>
          <Card
            title="Tình trạng tài khoản"
            className={styles.card}
            style={{ width: "100%" }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card
                  style={{ background: "#f6ffed", border: "1px solid #b7eb8f" }}
                >
                  <Statistic
                    title="Hoạt động"
                    value={statistics.summary.activeUsers}
                    valueStyle={{ color: "#52c41a" }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  style={{ background: "#fff2e8", border: "1px solid #ffbb96" }}
                >
                  <Statistic
                    title="Bị khóa"
                    value={statistics.summary.lockedUsers}
                    valueStyle={{ color: "#ff4d4f" }}
                    prefix={<LockOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  style={{ background: "#e6f7ff", border: "1px solid #91d5ff" }}
                >
                  <Statistic
                    title="Phòng ban hoạt động"
                    value={statistics.statusStats?.activeDepartments || 0}
                    valueStyle={{ color: "#1890ff" }}
                    prefix={<ApartmentOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  style={{ background: "#f9f0ff", border: "1px solid #d3adf7" }}
                >
                  <Statistic
                    title="Chuyền hoạt động"
                    value={statistics.statusStats?.activeLines || 0}
                    valueStyle={{ color: "#722ed1" }}
                    prefix={<ClusterOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Thống kê phòng ban" className={styles.card}>
            <Table
              dataSource={statistics.departmentStats || []}
              columns={departmentColumns}
              rowKey="departmentName"
              pagination={{ pageSize: 5 }}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Người dùng mới nhất" className={styles.card}>
            <Table
              dataSource={recentUsers || []}
              columns={recentUsersColumns}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  return content;
};

export default AdminDashboard;
