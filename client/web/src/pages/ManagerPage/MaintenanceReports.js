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
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/MaintenanceReports.module.css";
import * as maintenanceService from "../../services/maintenanceService";

const MaintenanceReports = () => {
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  // Fetch dữ liệu từ API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy tất cả work orders
      const response = await maintenanceService.getAllWorkOrders();
      const data = response?.data || [];
      setWorkOrders(data);

      // Tính thống kê đơn giản
      setStatistics({
        total: data.length,
        pending: data.filter((wo) => wo.status === "Chờ xử lý").length,
        inProgress: data.filter((wo) => wo.status === "Đang thực hiện").length,
        completed: data.filter(
          (wo) => wo.status === "Hoàn thành" || wo.status === "Đã đóng"
        ).length,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "workOrderId",
      key: "workOrderId",
      width: 100,
      render: (id) => `#${id}`,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 180,
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name || "N/A"}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {record.equipmentCode}
          </div>
        </div>
      ),
    },
    {
      title: "Loại bảo trì",
      dataIndex: "templateName",
      key: "templateName",
      width: 150,
      render: (name) => name || "Bảo trì định kỳ",
    },
    {
      title: "Ngày lên lịch",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Hạn hoàn thành",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => {
        const statusConfig = {
          "Chờ xử lý": { color: "gold", icon: <ClockCircleOutlined /> },
          "Đang thực hiện": { color: "blue", icon: <ToolOutlined /> },
          "Hoàn thành": { color: "green", icon: <CheckCircleOutlined /> },
          "Đã đóng": { color: "default", icon: <CheckCircleOutlined /> },
          "Đã hủy": { color: "red", icon: <ExclamationCircleOutlined /> },
        };
        const config = statusConfig[status] || { color: "default" };
        return (
          <Tag color={config.color} icon={config.icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "KTV Điện",
      dataIndex: "assignedToElectricalName",
      key: "assignedToElectricalName",
      width: 150,
      render: (name) => name || "-",
    },
    {
      title: "KTV Cơ khí",
      dataIndex: "assignedToMechanicalName",
      key: "assignedToMechanicalName",
      width: 150,
      render: (name) => name || "-",
    },
  ];

  return (
    <div className={styles.container}>
      <Spin spinning={loading}>
        <Card
          title="Báo cáo bảo trì"
          bordered={false}
          extra={
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchData}
              loading={loading}
            >
              Làm mới
            </Button>
          }
        >
          {/* Statistics Overview */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng phiếu bảo trì"
                  value={statistics.total}
                  prefix={<ToolOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Chờ xử lý"
                  value={statistics.pending}
                  prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Đang thực hiện"
                  value={statistics.inProgress}
                  prefix={
                    <ExclamationCircleOutlined style={{ color: "#1890ff" }} />
                  }
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Hoàn thành"
                  value={statistics.completed}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Danh sách phiếu bảo trì */}
          <Card title="Danh sách phiếu bảo trì">
            <Table
              columns={columns}
              dataSource={workOrders}
              rowKey="workOrderId"
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: 1100 }}
              locale={{ emptyText: "Chưa có phiếu bảo trì nào" }}
            />
          </Card>
        </Card>
      </Spin>
    </div>
  );
};

export default MaintenanceReports;
