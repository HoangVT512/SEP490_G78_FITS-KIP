import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Spin,
  message,
  Select,
} from "antd";
import {
  ToolOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { equipmentService } from "../../services/equipmentService";
import { incidentService } from "../../services/incidentService";
import {
  getAllMaintenancePlans,
  getUpcomingMaintenance,
} from "../../services/maintenanceService";
import lineService from "../../services/lineService";
import { useAuth } from "../../contexts/AuthContext";

const TeamLeaderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedLine, setSelectedLine] = useState(null);
  const [lines, setLines] = useState([]);

  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeEquipment: 0,
    inactiveEquipment: 0,
    pendingIncidents: 0,
    upcomingMaintenance: 0,
  });

  const [equipmentList, setEquipmentList] = useState([]);
  const [incidentList, setIncidentList] = useState([]);
  const [maintenanceList, setMaintenanceList] = useState([]);

  useEffect(() => {
    const userId = user?.id || user?.userId;
    if (userId) {
      fetchAssignedLines(userId);
    } else if (user) {
      console.warn("User object exists but no ID found:", user);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedLine) {
      fetchDashboardData();
    }
  }, [selectedLine]);

  const fetchAssignedLines = async (userId) => {
    if (!userId) {
      console.log("No user ID available");
      setLoading(false);
      return;
    }

    console.log("Fetching assigned lines for user:", userId);

    try {
      const assignedLines = await lineService.getLinesByUser(userId);
      console.log("Assigned lines received:", assignedLines);
      setLines(assignedLines || []);

      if (assignedLines && assignedLines.length > 0) {
        console.log("Setting selected line to:", assignedLines[0].lineId);
        setSelectedLine(assignedLines[0].lineId);
      } else {
        setLoading(false);
        message.warning("Bạn chưa được phân công dây chuyền nào");
      }
    } catch (error) {
      console.error("Error fetching assigned lines:", error);
      message.error("Không thể tải danh sách dây chuyền được phân công");
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!selectedLine) {
      console.log("No line selected, skipping fetch");
      return;
    }

    console.log("Fetching dashboard data for line:", selectedLine);

    try {
      setLoading(true);

      // Fetch equipment for the line
      let equipment = [];
      try {
        console.log("Fetching equipment...");
        const allEquipment = await equipmentService.getEquipments();
        equipment = (allEquipment || []).filter(
          (e) => e.lineId === selectedLine
        );
        console.log("Equipment fetched:", equipment.length);
      } catch (err) {
        console.error("Cannot fetch equipment:", err);
      }

      // Fetch incidents for the line
      let incidents = [];
      try {
        console.log("Fetching incidents...");
        const result = await incidentService.getActiveIncidentsByLine(
          selectedLine
        );
        incidents = result || [];
        console.log("Incidents fetched:", incidents.length);
      } catch (err) {
        console.error("Cannot fetch incidents:", err);
      }

      // Fetch maintenance plans
      let maintenancePlans = [];
      try {
        console.log("Fetching maintenance plans...");
        // Use getUpcomingMaintenance instead of getAllMaintenancePlans to avoid 403
        const upcomingPlans = await getUpcomingMaintenance(30); // Get plans for next 30 days

        // Filter by equipment in the selected line
        const lineEquipmentIds = equipment.map((e) => e.equipmentId);
        maintenancePlans = (upcomingPlans?.data || []).filter((plan) =>
          lineEquipmentIds.includes(plan.equipmentId)
        );
        console.log("Maintenance plans fetched:", maintenancePlans.length);
      } catch (err) {
        console.error("Cannot fetch maintenance plans:", err);
      }

      // Calculate stats
      const activeEquip = equipment.filter((e) => e.isActive).length;
      const inactiveEquip = equipment.filter((e) => !e.isActive).length;

      setEquipmentList(equipment.slice(0, 10));
      setIncidentList(incidents.slice(0, 10));
      setMaintenanceList(maintenancePlans.slice(0, 10));

      setStats({
        totalEquipment: equipment.length,
        activeEquipment: activeEquip,
        inactiveEquipment: inactiveEquip,
        pendingIncidents: incidents.length,
        upcomingMaintenance: maintenancePlans.length,
      });

      console.log("Dashboard data loaded successfully");
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const incidentColumns = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Thiết bị",
      key: "equipment",
      render: (record) =>
        record?.equipmentName || record?.equipment?.equipmentName || "N/A",
    },
    {
      title: "Công đoạn",
      key: "stage",
      render: (record) =>
        record?.stage || record?.equipment?.stage?.stageName || "N/A",
    },
    {
      title: "Vấn đề",
      key: "issue",
      ellipsis: true,
      render: (record) =>
        record?.issue || record?.description || "Chưa có mô tả",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          "Chờ xử lý": "warning",
          "Đang xử lý": "processing",
          "Hoàn thành": "success",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Ngày báo cáo",
      key: "reportedDate",
      render: (record) => {
        const date = record?.startTime || record?.reportedDate;
        return date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A";
      },
    },
  ];

  const equipmentColumns = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã thiết bị",
      dataIndex: "equipmentCode",
      key: "equipmentCode",
    },
    {
      title: "Tên thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
    },
    {
      title: "Công đoạn",
      key: "stage",
      render: (record) => record?.stageName || "N/A",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (record) => {
        const isActive = record.isActive;
        const status = isActive ? "Hoạt động" : "Không hoạt động";
        const statusConfig = {
          "Hoạt động": { color: "green", icon: <CheckCircleOutlined /> },
          "Không hoạt động": { color: "red", icon: <WarningOutlined /> },
        };
        const config = statusConfig[status] || { color: "default" };
        return (
          <Tag icon={config.icon} color={config.color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Ngày sử dụng",
      dataIndex: "dateUse",
      key: "dateUse",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
    },
  ];

  const maintenanceColumns = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Thiết bị",
      key: "equipment",
      render: (record) => record?.equipmentName || "N/A",
    },
    {
      title: "Ngày đến hạn",
      dataIndex: "nextDueDate",
      key: "nextDueDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Người thực hiện",
      key: "assignedTo",
      render: (record) => {
        const assigned = [];
        if (record.assignedToElectrical)
          assigned.push(record.assignedToElectrical);
        if (record.assignedToMechanical)
          assigned.push(record.assignedToMechanical);
        return assigned.length > 0 ? assigned.join(", ") : "Chưa phân công";
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (record) => {
        if (record.hasActiveWorkOrder)
          return <Tag color="processing">Đang thực hiện</Tag>;
        if (record.daysUntilDue < 0) return <Tag color="error">Quá hạn</Tag>;
        return <Tag color="warning">Sắp đến hạn</Tag>;
      },
    },
  ];

  if (loading && !selectedLine) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tổng thiết bị"
              value={stats.totalEquipment}
              prefix={<ToolOutlined />}
              valueStyle={{ color: "#1890ff" }}
              suffix={
                <span style={{ fontSize: 14, color: "#52c41a" }}>
                  ({stats.activeEquipment} hoạt động)
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Sự cố đang xử lý"
              value={stats.pendingIncidents}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Kế hoạch bảo trì"
              value={stats.upcomingMaintenance}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Incidents Table */}
      <Card
        title="Sự cố đang xử lý"
        extra={
          <Button
            type="link"
            onClick={() => navigate("/team-leader/incidents")}
          >
            Xem tất cả
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={incidentColumns}
          dataSource={incidentList}
          rowKey="incidentId"
          pagination={false}
          loading={loading}
        />
      </Card>

      {/* Equipment Status Table */}
      <Card
        title="Danh sách thiết bị"
        extra={
          <Button
            type="link"
            onClick={() => navigate("/team-leader/equipment")}
          >
            Xem tất cả
          </Button>
        }
      >
        <Table
          columns={equipmentColumns}
          dataSource={equipmentList}
          rowKey="equipmentId"
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default TeamLeaderDashboard;
