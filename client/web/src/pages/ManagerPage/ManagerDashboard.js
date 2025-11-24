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
} from "antd";
import {
  ShoppingOutlined,
  ToolOutlined,
  WarningOutlined,
  FundOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { purchaseRequestService } from "../../services/purchaseRequestService";
import { incidentService } from "../../services/incidentService";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    purchaseRequestsPending: 0,
    maintenanceDue: 0,
    incidentsActive: 0,
    productionOutput: 0,
  });

  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data with individual error handling
      let purchaseRequests = [];
      let incidents = [];

      // Try to fetch purchase requests
      try {
        const result = await purchaseRequestService.getByStatus("Chờ duyệt");
        purchaseRequests = result || [];
      } catch (err) {
        console.warn("Cannot fetch purchase requests:", err);
      }

      // Try to fetch incidents
      try {
        const result = await incidentService.getAll();
        incidents = result || [];
      } catch (err) {
        console.warn("Cannot fetch incidents:", err);
      }

      // Process purchase requests
      setPendingPurchases(purchaseRequests.slice(0, 5));

      // For maintenance - Manager doesn't have access, set to empty
      setUpcomingMaintenance([]);

      // Filter active incidents (exclude completed and closed)
      const active = incidents.filter(
        (inc) =>
          inc.status !== "Hoàn thành" &&
          inc.status !== "Đã đóng" &&
          inc.status !== "Closed"
      );
      setRecentIncidents(active.slice(0, 5));

      setStats({
        purchaseRequestsPending: purchaseRequests.length,
        maintenanceDue: 0, // Manager doesn't have access to maintenance data
        incidentsActive: active.length,
        productionOutput: 0, // Can be calculated from other sources if needed
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const purchaseColumns = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Phụ tùng",
      dataIndex: "sparePart",
      key: "sparePart",
      render: (sparePart) => sparePart?.name || "N/A",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: "Người yêu cầu",
      dataIndex: "requestedBy",
      key: "requestedBy",
      render: (requestedBy) => requestedBy?.fullName || "N/A",
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color="warning">{status}</Tag>,
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
      dataIndex: "equipment",
      key: "equipment",
      render: (equipment) => equipment?.name || "N/A",
    },
    {
      title: "Loại bảo trì",
      dataIndex: "maintenanceType",
      key: "maintenanceType",
    },
    {
      title: "Ngày lên lịch",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Người đảm nhiệm",
      dataIndex: "assignedTo",
      key: "assignedTo",
      render: (assignedTo) => assignedTo?.fullName || "Chưa phân công",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          "Chưa bắt đầu": "default",
          "Đang thực hiện": "processing",
          "Hoàn thành": "success",
          "Trễ hạn": "error",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
  ];

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
      title: "Dây chuyền",
      key: "line",
      render: (record) => record?.lineName || record?.line?.lineName || "N/A",
    },
    {
      title: "Vấn đề",
      key: "issue",
      ellipsis: true,
      render: (record) => {
        // Try multiple possible field names
        const issue =
          record?.issue ||
          record?.description ||
          record?.problemDescription ||
          record?.problemDetail;
        return issue || "Chưa có mô tả";
      },
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
          "Đã đóng": "default",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Ngày báo cáo",
      key: "reportedDate",
      render: (record) => {
        const date =
          record?.startTime || record?.reportedDate || record?.createdDate;
        return date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A";
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button icon={<ReloadOutlined />} onClick={fetchDashboardData}>
          Làm mới
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="YC mua hàng chờ duyệt"
              value={stats.purchaseRequestsPending}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bảo trì sắp đến hạn"
              value={stats.maintenanceDue}
              prefix={<ToolOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sự cố đang xử lý"
              value={stats.incidentsActive}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sản lượng tháng này"
              value={stats.productionOutput}
              prefix={<FundOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Yêu cầu mua hàng chờ duyệt"
        extra={
          <Button
            type="link"
            onClick={() => navigate("/manager/purchase-approval")}
          >
            Xem tất cả
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={purchaseColumns}
          dataSource={pendingPurchases}
          rowKey="purchaseRequestId"
          pagination={false}
        />
      </Card>

      <Card
        title="Bảo trì sắp đến hạn"
        extra={
          <Button
            type="link"
            onClick={() => navigate("/manager/maintenance-reports")}
          >
            Xem tất cả
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={maintenanceColumns}
          dataSource={upcomingMaintenance}
          rowKey="planId"
          pagination={false}
        />
      </Card>

      <Card
        title="Sự cố đang xử lý"
        extra={
          <Button type="link" onClick={() => navigate("/manager/incidents")}>
            Xem tất cả
          </Button>
        }
      >
        <Table
          columns={incidentColumns}
          dataSource={recentIncidents}
          rowKey="incidentId"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default ManagerDashboard;
