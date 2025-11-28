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
  message,
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
  WifiOutlined,
  BellOutlined,
} from "@ant-design/icons";
import styles from "../../styles/pages/TechnicianDashboard.module.css";
import { useSignalR } from "../../contexts/SignalRContext";
import { getMyWorkOrders } from "../../services/maintenanceService";
import { incidentService } from "../../services/incidentService";
import dayjs from "dayjs";

const TechnicianDashboard = () => {
  const [loading, setLoading] = useState(false);
  const { isConnected, subscribe } = useSignalR();

  // State cho Work Orders và Incidents
  const [myWorkOrders, setMyWorkOrders] = useState([]);
  const [myIncidents, setMyIncidents] = useState([]);

  const [dashboardStats, setDashboardStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    todaySchedule: 0,
  });

  // State cho activities
  const [recentActivities, setRecentActivities] = useState([]);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [woResponse, incResponse] = await Promise.all([
        getMyWorkOrders(),
        incidentService.getAssignedToMe(),
      ]);

      const workOrders = woResponse?.data || woResponse?.Data || [];
      // incidentService.getAssignedToMe() already returns the data array (or unwraps .data)
      // so we should check if incResponse is an array, otherwise look for .data
      const incidents = Array.isArray(incResponse)
        ? incResponse
        : incResponse?.data || incResponse?.Data || [];

      setMyWorkOrders(workOrders);
      setMyIncidents(incidents);

      // Calculate stats
      const allTasks = [
        ...workOrders.map((w) => ({ ...w, type: "maintenance" })),
        ...incidents.map((i) => ({ ...i, type: "incident" })),
      ];

      const stats = {
        totalTasks: allTasks.length,
        pendingTasks: allTasks.filter(
          (t) => t.status === "Pending" || t.status === "Chờ xử lý"
        ).length,
        inProgressTasks: allTasks.filter(
          (t) => t.status === "InProgress" || t.status === "Đang xử lý"
        ).length,
        completedTasks: allTasks.filter(
          (t) => t.status === "Completed" || t.status === "Hoàn thành"
        ).length,
        overdueTasks: workOrders.filter((wo) => wo.status === "Overdue").length, // Incidents don't usually have "Overdue" status in the same way
        todaySchedule: workOrders.filter((wo) =>
          dayjs(wo.dueDate).isSame(dayjs(), "day")
        ).length,
      };
      setDashboardStats(stats);

      // Populate recent activities from data
      const activities = allTasks
        .sort((a, b) => {
          const dateA = a.createdDate || a.assignedDate;
          const dateB = b.createdDate || b.assignedDate;
          return dayjs(dateB).valueOf() - dayjs(dateA).valueOf();
        })
        .slice(0, 10)
        .map((task) => ({
          type: task.type === "incident" ? "assigned" : "assigned",
          title:
            task.type === "incident" ? "Sự cố được giao" : "Công việc bảo trì",
          description: `${
            task.equipmentCode || task.equipment?.equipmentCode
          } - ${task.issue || task.taskName || "Bảo trì định kỳ"}`,
          time: dayjs(task.createdDate || task.assignedDate).format(
            "DD/MM/YYYY HH:mm"
          ),
        }));

      setRecentActivities(activities);
    } catch (error) {
      console.error("Load dashboard data error:", error);
      message.error("Không thể tải dữ liệu dashboard: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== REAL-TIME SIGNALR INTEGRATION =====

  useEffect(() => {
    if (!isConnected) return;

    console.log("✅ Setting up SignalR listeners for Technician...");

    // 1. Lắng nghe khi được giao Work Order mới
    const unsubscribeAssigned = subscribe("WorkOrderAssigned", (workOrder) => {
      console.log("📢 Technician received: New Work Order assigned", workOrder);
      loadDashboardData();
    });

    // 2. Lắng nghe khi Work Order bị hủy
    const unsubscribeCancelled = subscribe(
      "WorkOrderCancelled",
      (workOrder) => {
        console.log("📢 Technician received: Work Order cancelled", workOrder);
        loadDashboardData();
      }
    );

    // 3. Lắng nghe khi có Work Order mới được tạo (cho tất cả technicians)
    const unsubscribeNewWO = subscribe("NewWorkOrderCreated", (workOrder) => {
      console.log("📢 Technician received: New Work Order created", workOrder);
      loadDashboardData();
    });

    // 4. Lắng nghe khi TechManager cập nhật phân công
    const unsubscribeReassigned = subscribe(
      "WorkOrderReassigned",
      (workOrder) => {
        console.log("📢 Technician received: Work Order reassigned", workOrder);
        message.info({
          content: `Công việc ${workOrder.equipmentName} đã được phân công lại`,
          duration: 5,
        });
        loadDashboardData();
      }
    );

    // Cleanup
    return () => {
      unsubscribeAssigned();
      unsubscribeCancelled();
      unsubscribeNewWO();
      unsubscribeReassigned();
      console.log("🧹 Cleaned up SignalR listeners for Technician");
    };
  }, [isConnected, subscribe]);

  // ===== AUTO REFRESH khi có thay đổi =====

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeDataUpdate = subscribe("DataUpdated", (data) => {
      console.log("📢 Technician received: Data updated", data.type);

      if (
        data.type === "WorkOrder" ||
        data.type === "MaintenanceAssignment" ||
        data.type === "incident"
      ) {
        loadDashboardData();
      }
    });

    return () => unsubscribeDataUpdate();
  }, [isConnected, subscribe]);

  // Helper function to add activity
  const addActivity = (activity) => {
    setRecentActivities((prev) => [activity, ...prev.slice(0, 9)]); // Keep only 10 items
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  // Get work orders for today
  const todayWorkOrders = myWorkOrders.filter(
    (wo) =>
      dayjs(wo.dueDate).isSame(dayjs(), "day") &&
      wo.status !== "Completed" &&
      wo.status !== "Cancelled"
  );

  // Get pending work orders
  const pendingWorkOrders = myWorkOrders
    .filter((wo) => wo.status === "Pending")
    .slice(0, 5);

  // Get pending incidents
  const pendingIncidents = myIncidents
    .filter((inc) => inc.status === "Chờ xử lý" || inc.status === "Đang xử lý")
    .slice(0, 5);

  const workOrderColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "workOrderId",
      key: "workOrderId",
      width: 100,
      render: (id) => `WO${String(id).padStart(3, "0")}`,
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
      key: "taskType",
      width: 150,
      render: (record) => {
        const hasElectrical = record.assignedToElectrical;
        const hasMechanical = record.assignedToMechanical;
        return (
          <div>
            {hasElectrical && <Tag color="blue">Điện</Tag>}
            {hasMechanical && <Tag color="green">Cơ khí</Tag>}
          </div>
        );
      },
    },
    {
      title: "Ngày đến hạn",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 130,
      render: (date) => {
        const isToday = dayjs(date).isSame(dayjs(), "day");
        const isPast = dayjs(date).isBefore(dayjs(), "day");
        return (
          <div
            style={{
              color: isPast ? "#ff4d4f" : isToday ? "#faad14" : "inherit",
            }}
          >
            {dayjs(date).format("DD/MM/YYYY")}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          Pending: {
            color: "gold",
            icon: <ClockCircleOutlined />,
            text: "Chờ xử lý",
          },
          InProgress: {
            color: "blue",
            icon: <ClockCircleOutlined />,
            text: "Đang thực hiện",
          },
          Completed: {
            color: "green",
            icon: <CheckCircleOutlined />,
            text: "Hoàn thành",
          },
          Cancelled: {
            color: "red",
            icon: <WarningOutlined />,
            text: "Đã hủy",
          },
          Overdue: {
            color: "error",
            icon: <WarningOutlined />,
            text: "Quá hạn",
          },
        };
        const config = statusConfig[status] || statusConfig.Pending;
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
  ];

  const incidentColumns = [
    {
      title: "Mã sự cố",
      dataIndex: "incidentId",
      key: "incidentId",
      width: 100,
      render: (id) => `INC${String(id).padStart(3, "0")}`,
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
      ellipsis: true,
    },
    {
      title: "Ngày báo cáo",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 130,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const colorMap = {
          "Chờ xử lý": "warning",
          "Đang xử lý": "processing",
          "Hoàn thành": "success",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Real-time Connection Status */}
      {isConnected && (
        <div style={{ position: "fixed", top: 70, right: 20, zIndex: 1000 }}>
          <Badge
            status="processing"
            text={
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                Real-time: Kết nối
                <WifiOutlined style={{ color: "#52c41a" }} />
              </span>
            }
          />
        </div>
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Tổng nhiệm vụ"
              value={dashboardStats.totalTasks}
              prefix={<ToolOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div className={styles.statFooter} style={{ marginTop: "auto" }}>
              <span>
                Đang làm: {dashboardStats.inProgressTasks} | Chờ:{" "}
                {dashboardStats.pendingTasks}
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Chờ xử lý"
              value={dashboardStats.pendingTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
            <div className={styles.statFooter} style={{ marginTop: "auto" }}>
              <span>Nhiệm vụ cần bắt đầu</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Lịch hôm nay"
              value={dashboardStats.todaySchedule}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
            <div className={styles.statFooter} style={{ marginTop: "auto" }}>
              <span>Nhiệm vụ cần thực hiện trong ngày</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Đã hoàn thành"
              value={dashboardStats.completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
              suffix={`/ ${dashboardStats.totalTasks}`}
            />
            <Progress
              percent={
                dashboardStats.totalTasks > 0
                  ? Math.round(
                      (dashboardStats.completedTasks /
                        dashboardStats.totalTasks) *
                        100
                    )
                  : 0
              }
              size="small"
              style={{ marginTop: "auto" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alert for overdue tasks */}
      {dashboardStats.overdueTasks > 0 && (
        <Alert
          message={`Bạn có ${dashboardStats.overdueTasks} công việc quá hạn`}
          description="Vui lòng ưu tiên hoàn thành các công việc quá hạn."
          type="error"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      {/* Main Content Grid */}
      <Row gutter={[16, 16]}>
        {/* Pending Work Orders */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Công việc bảo trì chờ xử lý</span>
                <Badge count={pendingWorkOrders.length} />
              </Space>
            }
            extra={
              <Button type="link" onClick={() => {}}>
                Xem tất cả
              </Button>
            }
            bordered={false}
            style={{ marginBottom: 16 }}
          >
            {pendingWorkOrders.length > 0 ? (
              <Table
                columns={workOrderColumns}
                dataSource={pendingWorkOrders}
                pagination={false}
                scroll={{ x: 800 }}
                size="small"
                loading={loading}
                rowKey="workOrderId"
              />
            ) : (
              <Empty
                description="Không có công việc chờ xử lý"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>

          {/* Pending Incidents */}
          <Card
            title={
              <Space>
                <WarningOutlined />
                <span>Sự cố chờ xử lý</span>
                <Badge count={pendingIncidents.length} />
              </Space>
            }
            extra={
              <Button type="link" onClick={() => {}}>
                Xem tất cả
              </Button>
            }
            bordered={false}
          >
            {pendingIncidents.length > 0 ? (
              <Table
                columns={incidentColumns}
                dataSource={pendingIncidents}
                pagination={false}
                scroll={{ x: 800 }}
                size="small"
                loading={loading}
                rowKey="incidentId"
              />
            ) : (
              <Empty
                description="Không có sự cố chờ xử lý"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <BellOutlined />
                <span>Hoạt động gần đây</span>
              </Space>
            }
            bordered={false}
            bodyStyle={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {recentActivities.length > 0 ? (
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
                    icon = <BellOutlined />;
                  } else if (activity.type === "cancelled") {
                    color = "red";
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
            ) : (
              <Empty
                description="Chưa có hoạt động nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
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
                <span>Lịch làm việc hôm nay</span>
                <Badge count={todayWorkOrders.length} />
              </Space>
            }
            extra={
              <Button type="primary" onClick={() => {}}>
                Xem lịch đầy đủ
              </Button>
            }
            bordered={false}
          >
            {todayWorkOrders.length > 0 ? (
              <Table
                columns={workOrderColumns}
                dataSource={todayWorkOrders}
                pagination={false}
                scroll={{ x: 800 }}
                size="small"
                loading={loading}
                rowKey="workOrderId"
              />
            ) : (
              <Empty description="Không có lịch làm việc nào hôm nay" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TechnicianDashboard;
