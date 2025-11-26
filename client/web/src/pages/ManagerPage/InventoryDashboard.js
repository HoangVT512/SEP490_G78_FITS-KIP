import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Spin,
  message,
} from "antd";
import {
  InboxOutlined,
  WarningOutlined,
  RiseOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Pie, Column } from "@ant-design/plots";
import dayjs from "dayjs";
import styles from "../../styles/pages/InventoryDashboard.module.css";
import { sparePartService } from "../../services/sparePartService";

const InventoryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalItems: 0,
    lowStockItems: 0,
    activeItems: 0,
    inactiveItems: 0,
  });
  const [lowStockData, setLowStockData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [usageTrendData, setUsageTrendData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch all spare parts
      const allParts = await sparePartService.getAll();

      // Calculate statistics from allParts
      const totalItems = allParts.length;
      const lowStockItemsList = allParts.filter(
        (p) => p.quantity <= p.minQuantity
      );
      const lowStockCount = lowStockItemsList.length;

      // Calculate active/inactive count
      const activeCount = allParts.filter((p) => p.isActive).length;
      const inactiveCount = allParts.filter((p) => !p.isActive).length;

      // Calculate parts quantity distribution (top parts by quantity in stock)
      const partsWithQuantity = allParts
        .filter((p) => p.quantity > 0)
        .map((p) => ({
          type: p.partName,
          value: p.quantity,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Top 10 parts with highest quantity

      const categoryChartData = partsWithQuantity;

      // Calculate status distribution for chart
      const statusMap = {};
      allParts.forEach((p) => {
        const status = p.status || "Chưa xác định";
        statusMap[status] = (statusMap[status] || 0) + 1;
      });

      const statusChartData = Object.keys(statusMap).map((status) => ({
        name: status,
        value: statusMap[status],
      }));

      setStatistics({
        totalItems,
        lowStockItems: lowStockCount,
        activeItems: activeCount,
        inactiveItems: inactiveCount,
      });

      setLowStockData(
        allParts.map((item) => ({
          id: item.partId,
          partNumber: item.partNumber,
          partName: item.partName,
          partType: item.partType,
          currentStock: item.quantity,
          minStock: item.minQuantity,
          location: item.location,
          dateAdded: item.dateAdded,
          status: item.status,
          isActive: item.isActive,
        }))
      );

      setCategoryData(categoryChartData);
      setUsageTrendData(statusChartData);
    } catch (error) {
      console.error("Error fetching inventory dashboard data:", error);
      message.error("Không thể tải dữ liệu báo cáo kho");
    } finally {
      setLoading(false);
    }
  };

  const lowStockColumns = [
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 120,
      sorter: (a, b) => a.partNumber.localeCompare(b.partNumber),
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: 200,
      sorter: (a, b) => a.partName.localeCompare(b.partName),
    },
    {
      title: "Loại",
      dataIndex: "partType",
      key: "partType",
      width: 100,
      filters: [...new Set(lowStockData.map((item) => item.partType))].map(
        (type) => ({ text: type || "Khác", value: type })
      ),
      onFilter: (value, record) => record.partType === value,
    },
    {
      title: "Số lượng",
      dataIndex: "currentStock",
      key: "currentStock",
      width: 100,
      align: "center",
      sorter: (a, b) => a.currentStock - b.currentStock,
      render: (stock, record) => (
        <span
          style={{
            color:
              stock <= record.minStock
                ? "#ff4d4f"
                : stock <= record.minStock * 1.5
                ? "#faad14"
                : "#52c41a",
            fontWeight: "bold",
          }}
        >
          {stock}
        </span>
      ),
    },
    {
      title: "Tối thiểu",
      dataIndex: "minStock",
      key: "minStock",
      width: 100,
      align: "center",
      sorter: (a, b) => a.minStock - b.minStock,
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [...new Set(lowStockData.map((item) => item.status))].map(
        (status) => ({ text: status || "N/A", value: status })
      ),
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag
          color={
            status === "Còn hàng"
              ? "success"
              : status === "Hết hàng"
              ? "error"
              : "default"
          }
        >
          {status || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Hoạt động",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      align: "center",
      filters: [
        { text: "Đang hoạt động", value: true },
        { text: "Ngừng hoạt động", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Hoạt động" : "Ngừng"}
        </Tag>
      ),
    },
  ];

  const pieConfig = {
    data: categoryData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    legend: {
      position: "bottom",
    },
  };

  const columnConfig = {
    data: usageTrendData,
    xField: "name",
    yField: "value",
    label: {
      position: "top",
      style: {
        fill: "#000000",
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: false,
        autoRotate: true,
      },
    },
  };

  return (
    <div className={styles.container}>
      <Spin spinning={loading}>
        <Card title="Bảng điều khiển tồn kho" bordered={false}>
          {/* Statistics Overview */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng số phụ tùng"
                  value={statistics.totalItems}
                  prefix={<InboxOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tồn kho thấp"
                  value={statistics.lowStockItems}
                  prefix={<WarningOutlined style={{ color: "#ff4d4f" }} />}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Đang hoạt động"
                  value={statistics.activeItems}
                  prefix={<RiseOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Ngừng hoạt động"
                  value={statistics.inactiveItems}
                  prefix={<DollarOutlined style={{ color: "#8c8c8c" }} />}
                  valueStyle={{ color: "#8c8c8c" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Card title="Top 10 Linh kiện có số lượng lớn nhất trong kho">
                <Pie {...pieConfig} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Phân bố theo trạng thái">
                <Column {...columnConfig} />
              </Card>
            </Col>
          </Row>

          {/* Spare Parts Inventory List */}
          <Card title="Danh sách phụ tùng trong kho">
            <Table
              columns={lowStockColumns}
              dataSource={lowStockData}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} phụ tùng`,
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </Card>
      </Spin>
    </div>
  );
};

export default InventoryDashboard;
