import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Alert,
  Space,
  Spin,
  Empty,
  Progress,
  Divider,
} from "antd";
import {
  InboxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  SwapOutlined,
  SafetyOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { sparePartService } from "../../services/sparePartService";
import replacementHistoryService from "../../services/replacementHistoryService";
import { purchaseRequestService } from "../../services/purchaseRequestService";

const WarehouseManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [spareParts, setSpareParts] = useState([]);
  const [allReplacements, setAllReplacements] = useState([]);
  const [pendingDistributions, setPendingDistributions] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [topUsedParts, setTopUsedParts] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    pendingDistributions: 0,
    pendingPurchases: 0,
    approvedPurchases: 0,
    totalInventoryValue: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch spare parts inventory
      const sparePartsData = await sparePartService.getAll();
      const activeParts = (sparePartsData || []).filter((p) => p.isActive);
      setSpareParts(activeParts);

      // Fetch all replacement histories to get pending distributions
      const allReplacementsData = await replacementHistoryService.getAll();
      setAllReplacements(allReplacementsData || []);

      // Filter pending distributions (status: "Chờ duyệt cấp phát")
      const pendingDist = (allReplacementsData || []).filter(
        (r) => r.status === "Chờ duyệt cấp phát"
      );
      setPendingDistributions(pendingDist);

      // Fetch all purchase requests
      const allPurchaseRequests = await purchaseRequestService.getAll();
      setPurchaseRequests(allPurchaseRequests || []);

      // Fetch top 5 most used parts
      const topUsed = await sparePartService.getTop5MostUsed();
      setTopUsedParts(topUsed || []);

      // Calculate statistics
      const lowStockCount = activeParts.filter(
        (item) => item.quantity > 0 && item.quantity <= item.minQuantity
      ).length;
      const outOfStockCount = activeParts.filter(
        (item) => item.quantity === 0
      ).length;

      const pendingPurchaseCount = (allPurchaseRequests || []).filter(
        (pr) => pr.status === "Pending"
      ).length;
      const approvedPurchaseCount = (allPurchaseRequests || []).filter(
        (pr) => pr.status === "Approved"
      ).length;

      // Calculate total inventory value (example: assume no unit price, just count)
      const totalValue = activeParts.reduce(
        (sum, part) => sum + part.quantity,
        0
      );

      setStats({
        totalItems: activeParts.length,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        pendingDistributions: pendingDist.length,
        pendingPurchases: pendingPurchaseCount,
        approvedPurchases: approvedPurchaseCount,
        totalInventoryValue: totalValue,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const criticalStockItems = spareParts
    .filter((item) => item.quantity === 0 || item.quantity <= item.minQuantity)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 10);

  const criticalStockColumns = [
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      width: "15%",
      ellipsis: true,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: "30%",
      ellipsis: true,
    },
    {
      title: "Số lượng hiện tại",
      dataIndex: "quantity",
      key: "quantity",
      width: "25%",
      render: (quantity, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Tag color={quantity === 0 ? "red" : "orange"}>
              {quantity === 0 ? "Hết hàng" : `${quantity} cái`}
            </Tag>
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Tối thiểu: {record.minQuantity} cái
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "15%",
      align: "center",
      render: (status) => (
        <Tag color={status === "Đủ hàng" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      width: "15%",
      ellipsis: true,
    },
  ];

  const pendingDistributionColumns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "replacementId",
      key: "replacementId",
      width: 100,
      render: (id) => `#${id}`,
    },
    {
      title: "Phụ tùng",
      dataIndex: "partName",
      key: "partName",
      ellipsis: true,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      render: (qty) => <Tag color="blue">{qty}</Tag>,
    },
    {
      title: "Người yêu cầu",
      dataIndex: "replacedByName",
      key: "replacedByName",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "replacedDate",
      key: "replacedDate",
      width: 120,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() =>
            navigate("/warehouse-manager/incident-distribution", {
              state: { selectedDistribution: record },
            })
          }
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const topUsedPartsColumns = [
    {
      title: "Thứ hạng",
      key: "rank",
      width: 80,
      render: (_, __, index) => (
        <Tag color={index === 0 ? "gold" : index === 1 ? "silver" : "default"}>
          #{index + 1}
        </Tag>
      ),
    },
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 120,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      ellipsis: true,
    },
    {
      title: "Số lần sử dụng",
      dataIndex: "totalReplacementHistory",
      key: "totalReplacementHistory",
      width: 120,
      render: (count) => <Tag color="cyan">{count || 0} lần</Tag>,
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (stock) => (
        <Tag color={stock === 0 ? "red" : stock <= 10 ? "orange" : "green"}>
          {stock || 0}
        </Tag>
      ),
    },
  ];

  const purchaseRequestColumns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "requestId",
      key: "requestId",
      width: 100,
      render: (id) => `#${id}`,
    },
    {
      title: "Phụ tùng",
      dataIndex: "partName",
      key: "partName",
      ellipsis: true,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      render: (qty) => <Tag color="blue">{qty}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          Pending: { color: "orange", text: "Chờ duyệt" },
          Approved: { color: "green", text: "Đã duyệt" },
          Rejected: { color: "red", text: "Từ chối" },
          Received: { color: "blue", text: "Đã nhận" },
        };
        const config = statusConfig[status] || {
          color: "default",
          text: status,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      width: 150,
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} xl={6}>
          <Card
            hoverable
            style={{
              borderRadius: "8px",
              height: "140px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            bodyStyle={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Statistic
              title={
                <span style={{ fontSize: "14px", color: "#666" }}>
                  Tổng số phụ tùng
                </span>
              }
              value={stats.totalItems}
              prefix={
                <InboxOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
              }
              valueStyle={{ color: "#52c41a", fontSize: "32px" }}
            />
            <div
              style={{
                marginTop: "auto",
                paddingTop: "12px",
                borderTop: "1px solid #f0f0f0",
                fontSize: "12px",
                color: "#999",
              }}
            >
              Tổng số lượng: <strong>{stats.totalInventoryValue}</strong> cái
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card
            hoverable
            onClick={() => navigate("/warehouse-manager/inventory")}
            style={{
              borderRadius: "8px",
              height: "140px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
            }}
            bodyStyle={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Statistic
              title={
                <span style={{ fontSize: "14px", color: "#666" }}>
                  Cảnh báo tồn kho
                </span>
              }
              value={stats.lowStockItems + stats.outOfStockItems}
              prefix={
                <WarningOutlined
                  style={{ fontSize: "24px", color: "#ff4d4f" }}
                />
              }
              valueStyle={{ color: "#ff4d4f", fontSize: "32px" }}
            />
            <div
              style={{
                marginTop: "auto",
                paddingTop: "12px",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Space size={4}>
                <Tag color="red" style={{ margin: 0 }}>
                  Hết: {stats.outOfStockItems}
                </Tag>
                <Tag color="orange" style={{ margin: 0 }}>
                  Sắp hết: {stats.lowStockItems}
                </Tag>
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card
            hoverable
            onClick={() => navigate("/warehouse-manager/incident-distribution")}
            style={{
              borderRadius: "8px",
              height: "140px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
            }}
            bodyStyle={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Statistic
              title={
                <span style={{ fontSize: "14px", color: "#666" }}>
                  Chờ cấp phát
                </span>
              }
              value={stats.pendingDistributions}
              prefix={
                <SwapOutlined style={{ fontSize: "24px", color: "#faad14" }} />
              }
              valueStyle={{ color: "#faad14", fontSize: "32px" }}
            />
            <div
              style={{
                marginTop: "auto",
                paddingTop: "12px",
                borderTop: "1px solid #f0f0f0",
                fontSize: "12px",
                color: "#999",
              }}
            >
              Yêu cầu cấp phát phụ tùng
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card
            hoverable
            onClick={() => navigate("/warehouse-manager/purchase-requests")}
            style={{
              borderRadius: "8px",
              height: "140px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
            }}
            bodyStyle={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Statistic
              title={
                <span style={{ fontSize: "14px", color: "#666" }}>
                  Yêu cầu mua hàng
                </span>
              }
              value={stats.pendingPurchases + stats.approvedPurchases}
              prefix={
                <ShoppingOutlined
                  style={{ fontSize: "24px", color: "#1890ff" }}
                />
              }
              valueStyle={{ color: "#1890ff", fontSize: "32px" }}
            />
            <div
              style={{
                marginTop: "auto",
                paddingTop: "12px",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Space size={4}>
                <Tag color="orange" style={{ margin: 0 }}>
                  Chờ: {stats.pendingPurchases}
                </Tag>
                <Tag color="green" style={{ margin: 0 }}>
                  Duyệt: {stats.approvedPurchases}
                </Tag>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Critical Stock Alert */}
      {(stats.outOfStockItems > 0 || stats.lowStockItems > 0) && (
        <Alert
          message={
            <Space>
              <WarningOutlined />
              <strong>Cảnh báo tồn kho nghiêm trọng</strong>
            </Space>
          }
          description={
            <div>
              <div style={{ marginBottom: 8 }}>
                {stats.outOfStockItems > 0 && (
                  <div style={{ marginBottom: 4 }}>
                    • <strong>{stats.outOfStockItems}</strong> phụ tùng đã hết
                    hàng
                  </div>
                )}
                {stats.lowStockItems > 0 && (
                  <div>
                    • <strong>{stats.lowStockItems}</strong> phụ tùng sắp hết
                    (dưới mức tối thiểu)
                  </div>
                )}
              </div>
              <div style={{ color: "#666", fontSize: "12px" }}>
                Vui lòng kiểm tra kho và tạo yêu cầu mua hàng nếu cần thiết
              </div>
            </div>
          }
          type="warning"
          showIcon
          style={{
            marginBottom: 24,
            borderRadius: "8px",
            border: "1px solid #ffa940",
          }}
          action={
            <Space>
              <Button
                size="small"
                onClick={() => navigate("/warehouse-manager/inventory")}
              >
                Xem kho
              </Button>
              <Button
                size="small"
                type="primary"
                danger
                onClick={() => navigate("/warehouse-manager/purchase-requests")}
              >
                Tạo yêu cầu mua
              </Button>
            </Space>
          }
        />
      )}

      {/* Critical Stock Items Table */}
      <Card
        title={
          <Space>
            <SafetyOutlined style={{ color: "#ff4d4f", fontSize: "18px" }} />
            <span style={{ fontSize: "16px", fontWeight: 500 }}>
              Phụ tùng cần chú ý ({criticalStockItems.length})
            </span>
          </Space>
        }
        extra={
          <Button
            type="link"
            onClick={() => navigate("/warehouse-manager/inventory")}
            icon={<InboxOutlined />}
          >
            Xem tất cả tồn kho
          </Button>
        }
        style={{
          marginBottom: 24,
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
        bodyStyle={{ padding: "16px" }}
      >
        {criticalStockItems.length > 0 ? (
          <Table
            dataSource={criticalStockItems}
            columns={criticalStockColumns}
            rowKey="partId"
            pagination={false}
            size="middle"
            scroll={{ x: 800 }}
            style={{ marginTop: "8px" }}
          />
        ) : (
          <Empty
            description="Tất cả phụ tùng đều ở mức tồn kho an toàn"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: "40px 0" }}
          />
        )}
      </Card>

      {/* Top Used Parts & Pending Distributions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} xl={12}>
          <Card
            title={
              <Space>
                <CheckCircleOutlined
                  style={{ color: "#52c41a", fontSize: "18px" }}
                />
                <span style={{ fontSize: "16px", fontWeight: 500 }}>
                  Top 5 phụ tùng được sử dụng nhiều nhất
                </span>
              </Space>
            }
            style={{
              height: "100%",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            {topUsedParts.length > 0 ? (
              <Table
                dataSource={topUsedParts}
                columns={topUsedPartsColumns}
                rowKey="partId"
                pagination={false}
                size="middle"
                scroll={{ x: 600 }}
                style={{ marginTop: "8px" }}
              />
            ) : (
              <Empty
                description="Chưa có dữ liệu sử dụng"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: "40px 0" }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined
                  style={{ color: "#faad14", fontSize: "18px" }}
                />
                <span style={{ fontSize: "16px", fontWeight: 500 }}>
                  Yêu cầu cấp phát chờ duyệt ({stats.pendingDistributions})
                </span>
              </Space>
            }
            extra={
              <Button
                type="link"
                onClick={() =>
                  navigate("/warehouse-manager/incident-distribution")
                }
                icon={<SwapOutlined />}
              >
                Xem tất cả
              </Button>
            }
            style={{
              height: "100%",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            {pendingDistributions.length > 0 ? (
              <Table
                dataSource={pendingDistributions.slice(0, 5)}
                columns={pendingDistributionColumns}
                rowKey="replacementId"
                pagination={false}
                size="middle"
                scroll={{ x: 700 }}
                style={{ marginTop: "8px" }}
              />
            ) : (
              <Empty
                description="Không có yêu cầu cấp phát chờ duyệt"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: "40px 0" }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Purchase Requests */}
      {purchaseRequests.length > 0 && (
        <Card
          title={
            <Space>
              <ShoppingOutlined
                style={{ color: "#1890ff", fontSize: "18px" }}
              />
              <span style={{ fontSize: "16px", fontWeight: 500 }}>
                Yêu cầu mua hàng gần đây
              </span>
            </Space>
          }
          extra={
            <Button
              type="link"
              onClick={() => navigate("/warehouse-manager/purchase-requests")}
              icon={<ShoppingOutlined />}
            >
              Xem tất cả
            </Button>
          }
          style={{
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Table
            dataSource={purchaseRequests.slice(0, 8)}
            columns={purchaseRequestColumns}
            rowKey="requestId"
            pagination={false}
            size="middle"
            scroll={{ x: 800 }}
            style={{ marginTop: "8px" }}
          />
        </Card>
      )}
    </div>
  );
};

export default WarehouseManagerDashboard;
