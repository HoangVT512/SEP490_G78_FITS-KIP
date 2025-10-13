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
  Timeline,
  Avatar,
  Empty,
} from "antd";
import {
  ToolOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import styles from "../../styles/pages/TechnicianDashboard.module.css";

const TechnicianDashboard = () => {
  const [loading, setLoading] = useState(false);

  // Mock data - sẽ thay bằng API call sau
  const dashboardStats = {
    totalIncidents: 8,
    pendingIncidents: 3,
    inProgressIncidents: 2,
    completedIncidents: 3,
    totalMaintenanceTasks: 5,
    completedTasks: 3,
    upcomingTasks: 2,
    todaySchedule: 3,
  };

  // Assigned Incidents
  const assignedIncidents = [
    {
      key: 1,
      incidentId: "INC-001",
      equipmentCode: "EQ-001",
      equipmentName: "Máy CNC 01",
      issue: "Lỗi động cơ không hoạt động",
      priority: "Cao",
      status: "Đang xử lý",
      assignedDate: "2025-10-13 08:30",
      dueDate: "2025-10-13 18:00",
    },
    {
      key: 2,
      incidentId: "INC-002",
      equipmentCode: "EQ-015",
      equipmentName: "Robot hàn 03",
      issue: "Lỗi cảm biến vị trí",
      priority: "Trung bình",
      status: "Chưa xử lý",
      assignedDate: "2025-10-13 09:00",
      dueDate: "2025-10-14 12:00",
    },
    {
      key: 3,
      incidentId: "INC-003",
      equipmentCode: "EQ-025",
      equipmentName: "Băng chuyền 05",
      issue: "Tiếng kêu bất thường",
      priority: "Thấp",
      status: "Chưa xử lý",
      assignedDate: "2025-10-13 10:15",
      dueDate: "2025-10-15 17:00",
    },
  ];

  // Today's Maintenance Schedule
  const todaySchedule = [
    {
      key: 1,
      planId: "PM-001",
      equipmentCode: "EQ-010",
      equipmentName: "Máy phay CNC",
      taskType: "Bảo trì định kỳ",
      scheduledTime: "14:00",
      estimatedDuration: "2 giờ",
      status: "Sắp tới",
    },
    {
      key: 2,
      planId: "PM-005",
      equipmentCode: "EQ-022",
      equipmentName: "Máy tiện tự động",
      taskType: "Kiểm tra an toàn",
      scheduledTime: "16:00",
      estimatedDuration: "1 giờ",
      status: "Sắp tới",
    },
  ];

  // Recent Activities
  const recentActivities = [
    {
      type: "completed",
      title: "Hoàn thành sửa chữa INC-005",
      description: "Máy CNC 03 - Thay thế động cơ",
      time: "30 phút trước",
    },
    {
      type: "started",
      title: "Bắt đầu xử lý INC-001",
      description: "Máy CNC 01 - Kiểm tra động cơ",
      time: "1 giờ trước",
    },
    {
      type: "assigned",
      title: "Nhận sự cố mới INC-003",
      description: "Băng chuyền 05 - Tiếng kêu bất thường",
      time: "2 giờ trước",
    },
    {
      type: "checklist",
      title: "Hoàn thành checklist PM-008",
      description: "Robot hàn 02 - Bảo trì định kỳ",
      time: "3 giờ trước",
    },
  ];

  const incidentColumns = [
    {
      title: "Mã sự cố",
      dataIndex: "incidentId",
      key: "incidentId",
      width: 100,
    },
    {
      title: "Thiết bị",
      key: "equipment",
      width: 150,
      render: (record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.equipmentCode}</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {record.equipmentName}
          </div>
        </div>
      ),
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
      render: (priority) => {
        let color = "default";
        if (priority === "Cao") color = "red";
        else if (priority === "Trung bình") color = "orange";
        else if (priority === "Thấp") color = "green";
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "default";
        let icon = null;
        if (status === "Đang xử lý") {
          color = "processing";
          icon = <ClockCircleOutlined />;
        } else if (status === "Chưa xử lý") {
          color = "warning";
          icon = <WarningOutlined />;
        } else if (status === "Hoàn thành") {
          color = "success";
          icon = <CheckCircleOutlined />;
        }
        return (
          <Tag icon={icon} color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Hạn xử lý",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 150,
    },
  ];

  const scheduleColumns = [
    {
      title: "Mã kế hoạch",
      dataIndex: "planId",
      key: "planId",
      width: 100,
    },
    {
      title: "Thiết bị",
      key: "equipment",
      width: 150,
      render: (record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.equipmentCode}</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {record.equipmentName}
          </div>
        </div>
      ),
    },
    {
      title: "Loại công việc",
      dataIndex: "taskType",
      key: "taskType",
      width: 150,
    },
    {
      title: "Thời gian",
      dataIndex: "scheduledTime",
      key: "scheduledTime",
      width: 100,
    },
    {
      title: "Thời lượng",
      dataIndex: "estimatedDuration",
      key: "estimatedDuration",
      width: 100,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color="blue" icon={<CalendarOutlined />}>
          {status}
        </Tag>
      ),
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
      {/* Header Actions */}
      <div className={styles.headerActions}>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Tổng sự cố được giao"
              value={dashboardStats.totalIncidents}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div className={styles.statFooter}>
              <span>
                Đang xử lý: {dashboardStats.inProgressIncidents} | Chưa xử lý:{" "}
                {dashboardStats.pendingIncidents}
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Nhiệm vụ bảo trì"
              value={dashboardStats.totalMaintenanceTasks}
              prefix={<ToolOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <div className={styles.statFooter}>
              <span>
                Hoàn thành: {dashboardStats.completedTasks} | Sắp tới:{" "}
                {dashboardStats.upcomingTasks}
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Lịch hôm nay"
              value={dashboardStats.todaySchedule}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
            <div className={styles.statFooter}>
              <span>Nhiệm vụ cần thực hiện trong ngày</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Hoàn thành hôm nay"
              value={dashboardStats.completedIncidents}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#722ed1" }}
              suffix={`/ ${dashboardStats.totalIncidents}`}
            />
            <Progress
              percent={Math.round(
                (dashboardStats.completedIncidents /
                  dashboardStats.totalIncidents) *
                  100
              )}
              size="small"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Grid */}
      <Row gutter={[16, 16]}>
        {/* Assigned Incidents */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <WarningOutlined />
                <span>Sự cố được giao gần đây</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => {}}>
                Xem tất cả
              </Button>
            }
            bordered={false}
          >
            <Table
              columns={incidentColumns}
              dataSource={assignedIncidents}
              pagination={false}
              scroll={{ x: 800 }}
              size="small"
            />
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>Hoạt động gần đây</span>
              </Space>
            }
            bordered={false}
            bodyStyle={{ maxHeight: "400px", overflowY: "auto" }}
          >
            <Timeline
              items={recentActivities.map((activity) => {
                let color = "blue";
                let icon = <ClockCircleOutlined />;

                if (activity.type === "completed") {
                  color = "green";
                  icon = <CheckCircleOutlined />;
                } else if (activity.type === "started") {
                  color = "blue";
                  icon = <ToolOutlined />;
                } else if (activity.type === "assigned") {
                  color = "orange";
                  icon = <WarningOutlined />;
                }

                return {
                  color: color,
                  dot: icon,
                  children: (
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        {activity.title}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#888",
                          marginBottom: 4,
                        }}
                      >
                        {activity.description}
                      </div>
                      <div style={{ fontSize: "11px", color: "#bbb" }}>
                        {activity.time}
                      </div>
                    </div>
                  ),
                };
              })}
            />
          </Card>
        </Col>
      </Row>

      {/* Today's Schedule */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Lịch bảo trì hôm nay</span>
              </Space>
            }
            extra={
              <Button type="primary" onClick={() => {}}>
                Xem lịch đầy đủ
              </Button>
            }
            bordered={false}
          >
            {todaySchedule.length > 0 ? (
              <Table
                columns={scheduleColumns}
                dataSource={todaySchedule}
                pagination={false}
                scroll={{ x: 800 }}
                size="small"
              />
            ) : (
              <Empty description="Không có lịch bảo trì nào hôm nay" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TechnicianDashboard;
