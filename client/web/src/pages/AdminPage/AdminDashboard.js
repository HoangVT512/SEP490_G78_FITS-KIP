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
} from "@ant-design/icons";
import { Pie } from "@ant-design/plots";
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

  // Cấu hình biểu đồ phân bố vai trò
  const getRoleDistributionConfig = () => {
    if (!statistics?.summary || !statistics?.usersByRole) {
      console.log("No data for chart:", {
        summary: statistics?.summary,
        usersByRole: statistics?.usersByRole,
      });
      return null;
    }

    const data = statistics.usersByRole.map((role) => ({
      type: role.roleName,
      value: role.userCount,
    }));

    console.log("Chart data:", data);

    return {
      data,
      angleField: "value",
      colorField: "type",
      radius: 0.8,
      label: {
        formatter: (datum) => (datum ? `${datum.type}: ${datum.value}` : ""),
      },
      tooltip: {
        customContent: (title, data) => {
          // Robust tooltip rendering: accept multiple possible shapes from the plotting lib
          console.log("Tooltip data:", { title, data });
          if (!data || data.length === 0) return "";
          const item = data[0];
          console.log("Tooltip item:", item);

          // Try multiple places for the role name and value to avoid nulls
          const roleName =
            item?.data?.type ??
            item?.data?.name ??
            item?.name ??
            item?.title ??
            title ??
            "";
          const userCount =
            item?.data?.value ?? item?.value ?? item?.y ?? item?.count ?? 0;
          const color =
            item?.color ?? (item?.data && item.data.color) ?? "#1890ff";

          return `
            <div style="padding: 8px 12px; background: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
              <div style="margin-bottom: 4px; font-weight: 600; color: #333;">${
                roleName || ""
              }</div>
              <div style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${color}; margin-right: 8px;"></span>
                <span style="color: #666;">Số lượng: <strong style="color: #333;">${userCount} người dùng</strong></span>
              </div>
            </div>
          `;
        },
      },
      interactions: [{ type: "element-selected" }, { type: "element-active" }],
      color: ["#334766", "#7c3aed", "#dc2626", "#ea580c", "#16a34a"],
      legend: {
        position: "bottom",
      },
    };
  };

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

  const roleDistributionConfig = getRoleDistributionConfig();

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
        <Col xs={24} sm={12} lg={6}>
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
        <Col xs={24} sm={12} lg={6}>
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
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.card} hoverable>
            <Statistic
              title="Chuyền sản xuất"
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
        <Col xs={24} sm={12} lg={6}>
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
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Phân bố vai trò người dùng" className={styles.card}>
            {roleDistributionConfig &&
            roleDistributionConfig.data &&
            roleDistributionConfig.data.length > 0 ? (
              <Pie {...roleDistributionConfig} height={300} />
            ) : (
              <Empty description="Không có dữ liệu vai trò" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Tình trạng tài khoản" className={styles.card}>
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
