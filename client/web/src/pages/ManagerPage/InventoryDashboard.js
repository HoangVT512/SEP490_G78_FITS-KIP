import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Spin, message } from "antd";
import {
  InboxOutlined,
  WarningOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Pie, Column } from "@ant-design/plots";
import styles from "../../styles/pages/InventoryDashboard.module.css";
import { sparePartService } from "../../services/sparePartService";

const InventoryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [spareParts, setSpareParts] = useState([]);
  const [allParts, setAllParts] = useState([]);
  const [statistics, setStatistics] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalQuantity: 0,
    activeItems: 0,
  });
  const [top5StockData, setTop5StockData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all spare parts (including inactive)
        const parts = await sparePartService.getAll();
        const allPartsArray = Array.isArray(parts) ? parts : [];
        setAllParts(allPartsArray);

        const activeParts = allPartsArray.filter((p) => p.isActive);
        const inactiveParts = allPartsArray.filter((p) => !p.isActive);
        setSpareParts(activeParts);

        // Calculate statistics
        const totalItems = allPartsArray.length;
        const lowStockItems = activeParts.filter(
          (p) => p.quantity < p.minQuantity
        ).length;
        const totalQuantity = activeParts.reduce(
          (sum, p) => sum + (p.quantity || 0),
          0
        );
        const activeItems = activeParts.length;

        setStatistics({
          totalItems,
          lowStockItems,
          totalQuantity,
          activeItems,
        });

        // Calculate status distribution (Active vs Inactive)
        const statusDistribution = [
          { status: "Đang hoạt động", count: activeParts.length },
          { status: "Ngưng hoạt động", count: inactiveParts.length },
        ];
        setStatusData(statusDistribution);

        // Get top 5 spare parts with highest stock quantity
        const top5Stock = [...activeParts]
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5)
          .map((p) => ({
            partName:
              p.partName?.length > 20
                ? p.partName.substring(0, 20) + "..."
                : p.partName,
            quantity: p.quantity || 0,
          }));
        setTop5StockData(top5Stock);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
        message.error("Không thể tải dữ liệu tồn kho");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Table columns for spare parts list
  const sparePartsColumns = [
    {
      title: "Mã",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 80,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: 180,
      ellipsis: true,
    },
    {
      title: "Loại",
      dataIndex: "partType",
      key: "partType",
      width: 120,
      ellipsis: true,
      render: (type) => type || "-",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 90,
      align: "center",
      render: (qty, record) => {
        const isLow = qty < record.minQuantity;
        return (
          <span
            style={{ color: isLow ? "#ff4d4f" : "#52c41a", fontWeight: "bold" }}
          >
            {qty}
          </span>
        );
      },
    },
    {
      title: "Tối thiểu",
      dataIndex: "minQuantity",
      key: "minQuantity",
      width: 80,
      align: "center",
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      width: 80,
      render: (loc) => loc || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status, record) => {
        // Ưu tiên hiển thị status từ DB, nếu không có thì tính theo quantity
        if (status) {
          // Status từ DB: "Đủ hàng", "Sắp hết", "Hết hàng"
          const isWarning = status === "Sắp hết";
          const isDanger = status === "Hết hàng";
          return (
            <Tag color={isDanger ? "error" : isWarning ? "warning" : "success"}>
              {status}
            </Tag>
          );
        }
        // Fallback: tính theo quantity nếu chưa có status
        if (record.quantity === 0) {
          return <Tag color="error">Hết hàng</Tag>;
        } else if (record.quantity <= record.minQuantity) {
          return <Tag color="warning">Sắp hết</Tag>;
        }
        return <Tag color="success">Đủ hàng</Tag>;
      },
    },
  ];

  // Màu sắc khác nhau cho từng thanh bar
  const barColors = ["#1890ff", "#52c41a", "#faad14", "#722ed1", "#13c2c2"];

  const barConfig = {
    data: top5StockData,
    xField: "partName",
    yField: "quantity",
    colorField: "partName",
    legend: false,
    height: 250,
    style: {
      fill: ({ partName }) => {
        const index = top5StockData.findIndex((d) => d.partName === partName);
        return barColors[index % barColors.length];
      },
    },
    label: {
      text: "quantity",
      position: "inside",
      style: {
        fill: "#fff",
        fontWeight: "bold",
      },
    },
    axis: {
      x: {
        labelFormatter: (text) =>
          text?.length > 12 ? text.substring(0, 12) + "..." : text,
      },
      y: {
        title: "Số lượng",
      },
    },
  };

  const pieConfig = {
    data: statusData,
    angleField: "count",
    colorField: "status",
    radius: 0.7,
    innerRadius: 0.4,
    height: 250,
    scale: {
      color: {
        range: ["#52c41a", "#ff4d4f"],
      },
    },
    legend: {
      color: {
        position: "bottom",
        layout: { justifyContent: "center" },
      },
    },
    label: {
      text: (d) => `${d.status}: ${d.count}`,
      position: "outside",
      style: {
        fontWeight: "bold",
        fontSize: 12,
      },
    },
    tooltip: {
      title: "status",
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
                  title="Tổng số lượng"
                  value={statistics.totalQuantity}
                  prefix={<AppstoreOutlined style={{ color: "#52c41a" }} />}
                  suffix="cái"
                  valueStyle={{ color: "#52c41a" }}
                  precision={0}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Đang hoạt động"
                  value={statistics.activeItems}
                  prefix={<CheckCircleOutlined style={{ color: "#722ed1" }} />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Card
                title="Top 5 phụ tùng tồn kho nhiều nhất"
                style={{ height: 350 }}
              >
                {top5StockData.length > 0 ? (
                  <div style={{ height: 260 }}>
                    <Column {...barConfig} />
                  </div>
                ) : (
                  <div
                    style={{ textAlign: "center", padding: 50, color: "#999" }}
                  >
                    Chưa có dữ liệu
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="Phân bố theo trạng thái hoạt động"
                style={{ height: 350 }}
              >
                {statusData.length > 0 ? (
                  <div style={{ height: 260 }}>
                    <Pie {...pieConfig} />
                  </div>
                ) : (
                  <div
                    style={{ textAlign: "center", padding: 50, color: "#999" }}
                  >
                    Không có dữ liệu
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* Spare Parts List */}
          <Card title="Danh sách phụ tùng trong kho">
            <Table
              columns={sparePartsColumns}
              dataSource={spareParts}
              rowKey="partId"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} phụ tùng`,
              }}
              size="small"
              scroll={{ x: 800 }}
            />
          </Card>
        </Card>
      </Spin>
    </div>
  );
};

export default InventoryDashboard;
