import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  message,
  Spin,
  Typography,
} from "antd";
import {
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  AlertOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  getAllMaintenancePlans,
  getUpcomingMaintenance,
  getAllWorkOrders,
} from "../../services/maintenanceService";
import { incidentService } from "../../services/incidentService";
import styles from "../../styles/pages/TechnicianManagerDashboard.module.css";

const { Text } = Typography;

const TechnicianManagerDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    activeMaintenance: 0,
    pendingIncidents: 0,
    completedMaintenance: 0,
    resolvedIncidents: 0,
    overdueMaintenance: 0,
  });
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([]);
  const navigate = useNavigate();

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch maintenance plans
      const maintenancePlans = await getUpcomingMaintenance(7); // Next 7 days
      const activePlans = maintenancePlans?.data || [];

      // Fetch all work orders for statistics
      const allWorkOrders = await getAllWorkOrders();
      const workOrders = allWorkOrders?.data || [];

      // Count completed maintenance this month
      const startOfMonth = dayjs().startOf("month");
      const completedThisMonth = workOrders.filter(
        (wo) =>
          wo.status === "Completed" &&
          dayjs(wo.completedDate).isAfter(startOfMonth)
      ).length;

      // Count overdue maintenance
      const today = dayjs();
      const overduePlans = activePlans.filter((plan) => {
        const dueDate = dayjs(plan.nextMaintenanceDate || plan.dueDate);
        return dueDate.isBefore(today) && plan.status !== "Completed";
      }).length;

      // Transform maintenance data for table
      const upcomingPlans = activePlans.slice(0, 5).map((plan) => ({
        planId: plan.planId,
        equipmentName: plan.equipmentName,
        equipmentCode: plan.equipmentCode,
        maintenanceType: plan.maintenanceType,
        dueDate: plan.nextMaintenanceDate || plan.dueDate,
        status: plan.status,
      }));

      // Fetch incidents that need tech support (IsTechSupport = 1)
      const techSupportResponse =
        await incidentService.getTechSupportPendingIncidents();
      const techSupportData = techSupportResponse?.data || [];

      // Flatten incidents from grouped data (API returns grouped by lineId)
      const techSupportIncidents = techSupportData.flatMap(
        (group) =>
          group.incidents?.map((inc) => ({
            ...inc,
            lineName: group.lineName || inc.line,
          })) || []
      );

      // Fetch all incidents for resolved count
      const allIncidents = await incidentService.getAll();

      // Count resolved incidents this month
      const resolvedThisMonth =
        allIncidents?.filter(
          (inc) =>
            inc.status === "Resolved" &&
            dayjs(inc.resolvedDate).isAfter(startOfMonth)
        ).length || 0;

      // Transform tech support incidents for display
      const sortedIncidents = (techSupportIncidents || [])
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .map((inc) => ({
          incidentId: inc.incidentId,
          equipmentName: inc.equipmentName || "",
          equipmentCode: inc.equipmentCode || "",
          description: inc.issue || "",
          status: inc.status || "Pending",
          reportedDate: inc.startTime,
          assignedToName: inc.assignedTo || "",
          lineName: inc.lineName || inc.line || "",
          stageName: inc.stage || "",
        }));

      const pendingIncidents = techSupportIncidents || [];

      // Update stats
      setStats({
        activeMaintenance: activePlans.length,
        pendingIncidents: pendingIncidents.length,
        completedMaintenance: completedThisMonth,
        resolvedIncidents: resolvedThisMonth,
        overdueMaintenance: overduePlans,
      });

      setRecentIncidents(sortedIncidents);
      setUpcomingMaintenance(upcomingPlans);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const incidentColumns = [
    {
      title: "#",
      key: "index",
      width: "5%",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: "18%",
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: "#999" }}>
            {record.equipmentCode}
          </div>
        </div>
      ),
    },
    {
      title: "Dây chuyền",
      dataIndex: "lineName",
      key: "lineName",
      width: "12%",
    },
    {
      title: "Công đoạn",
      dataIndex: "stageName",
      key: "stageName",
      width: "12%",
    },
    {
      title: "Vấn đề",
      dataIndex: "description",
      key: "description",
      width: "20%",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "12%",
      render: (status) => {
        const statusMap = {
          Pending: { color: "warning", text: "Chờ xử lý" },
          InProgress: { color: "processing", text: "Đang xử lý" },
          Resolved: { color: "success", text: "Đã giải quyết" },
          Closed: { color: "default", text: "Đã đóng" },
        };
        const statusInfo = statusMap[status] || {
          color: "default",
          text: status,
        };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: "Ngày báo cáo",
      dataIndex: "reportedDate",
      key: "reportedDate",
      width: "11%",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Người đảm nhiệm",
      dataIndex: "assignedToName",
      key: "assignedToName",
      width: "10%",
      render: (name) => (
        <span>
          {name ? <Text>{name}</Text> : <Text type="secondary">-</Text>}
        </span>
      ),
    },
  ];

  const maintenanceColumns = [
    {
      title: "Mã kế hoạch",
      dataIndex: "planId",
      key: "planId",
      width: "15%",
      render: (id) => <span style={{ fontWeight: 500 }}>PLAN{id}</span>,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: "30%",
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: "#999" }}>
            {record.equipmentCode}
          </div>
        </div>
      ),
    },
    {
      title: "Loại bảo trì",
      dataIndex: "maintenanceType",
      key: "maintenanceType",
      width: "20%",
      render: (type) => {
        const typeMap = {
          Routine: { color: "blue", text: "Định kỳ" },
          Preventive: { color: "cyan", text: "Phòng ngừa" },
          Corrective: { color: "orange", text: "Khắc phục" },
          Emergency: { color: "red", text: "Khẩn cấp" },
        };
        const typeInfo = typeMap[type] || { color: "default", text: type };
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
      },
    },
    {
      title: "Ngày đến hạn",
      dataIndex: "dueDate",
      key: "dueDate",
      width: "15%",
      render: (date) => {
        const dueDate = dayjs(date);
        const today = dayjs();
        const daysUntilDue = dueDate.diff(today, "day");

        return (
          <div>
            <div>{dueDate.format("DD/MM/YYYY")}</div>
            {daysUntilDue <= 3 && daysUntilDue >= 0 && (
              <div style={{ fontSize: 11, color: "#faad14" }}>
                Còn {daysUntilDue} ngày
              </div>
            )}
            {daysUntilDue < 0 && (
              <div style={{ fontSize: 11, color: "#ff4d4f" }}>
                Quá hạn {Math.abs(daysUntilDue)} ngày
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "20%",
      render: (status) => {
        const statusMap = {
          Active: { color: "processing", text: "Đang hoạt động" },
          Scheduled: { color: "warning", text: "Đã lên lịch" },
          InProgress: { color: "blue", text: "Đang thực hiện" },
          Completed: { color: "success", text: "Hoàn thành" },
          Overdue: { color: "error", text: "Quá hạn" },
          Postponed: { color: "default", text: "Đã hoãn" },
        };
        const statusInfo = statusMap[status] || {
          color: "default",
          text: status,
        };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
  ];

  return (
    <Spin spinning={loading} tip="Đang tải dữ liệu...">
      <div>
        {/* Header with refresh button */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchDashboardData}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Bảo trì sắp tới (7 ngày)"
                value={stats.activeMaintenance}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Sự cố đang xử lý"
                value={stats.pendingIncidents}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Bảo trì quá hạn"
                value={stats.overdueMaintenance}
                prefix={<AlertOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Bảo trì hoàn thành (tháng)"
                value={stats.completedMaintenance}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Sự cố đã giải quyết (tháng này)"
                value={stats.resolvedIncidents}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Recent Incidents */}
        <Card
          title={`Sự cố cần hỗ trợ kỹ thuật (${recentIncidents.length})`}
          extra={
            <Button
              type="link"
              onClick={() => navigate("/technician-manager/incidents")}
            >
              Xem tất cả
            </Button>
          }
          style={{ marginBottom: 16 }}
        >
          <Table
            columns={incidentColumns}
            dataSource={recentIncidents}
            rowKey="incidentId"
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
              showTotal: (total) => `Tổng ${total} sự cố`,
            }}
            size="middle"
            scroll={{ x: 1200 }}
            locale={{
              emptyText: "Không có sự cố nào cần hỗ trợ kỹ thuật",
            }}
          />
        </Card>

        {/* Upcoming Maintenance */}
        <Card
          title="Bảo trì sắp đến hạn (7 ngày tới)"
          extra={
            <Button
              type="link"
              onClick={() => navigate("/technician-manager/maintenance")}
            >
              Xem tất cả
            </Button>
          }
        >
          <Table
            columns={maintenanceColumns}
            dataSource={upcomingMaintenance}
            rowKey="planId"
            pagination={false}
            size="middle"
            locale={{
              emptyText: "Không có kế hoạch bảo trì nào sắp đến hạn",
            }}
          />
        </Card>
      </div>
    </Spin>
  );
};

export default TechnicianManagerDashboard;
