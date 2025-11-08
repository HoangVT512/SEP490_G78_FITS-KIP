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
} from "antd";
import {
  InboxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { sparePartService } from "../../services/sparePartService";
import replacementHistoryService from "../../services/replacementHistoryService";
import { purchaseRequestService } from "../../services/purchaseRequestService";

const WarehouseManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [spareParts, setSpareParts] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingReturns, setPendingReturns] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    pendingRequests: 0,
    pendingReturns: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch spare parts inventory
      const sparePartsData = await sparePartService.getAll();
      setSpareParts(sparePartsData || []);

      // Fetch pending spare parts requests
      const pendingRequestsData = await replacementHistoryService.getByStatus(
        "Chờ duyệt cấp phát"
      );
      setPendingRequests(pendingRequestsData || []);

      // Fetch pending returns
      const pendingReturnsData = await replacementHistoryService.getByStatus(
        "Đã thay thế"
      );
      setPendingReturns(pendingReturnsData || []);

      // Fetch purchase requests
      const purchaseRequestsData = await purchaseRequestService.getByStatus(
        "Pending"
      );
      setPurchaseRequests(purchaseRequestsData || []);

      // Calculate statistics
      const lowStockThreshold = 10;
      const lowStockCount = (sparePartsData || []).filter(
        (item) => item.quantity <= lowStockThreshold
      ).length;

      setStats({
        totalItems: (sparePartsData || []).length,
        lowStockItems: lowStockCount,
        pendingRequests: (pendingRequestsData || []).length,
        pendingReturns: (pendingReturnsData || []).length,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = spareParts
    .filter((item) => item.quantity <= 10)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 5);

  const lowStockColumns = [
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
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (quantity) => (
        <Tag color={quantity === 0 ? "red" : "orange"}>
          {quantity === 0 ? "Hết hàng" : `${quantity} cái`}
        </Tag>
      ),
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      width: 120,
    },
  ];

  const pendingRequestColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "historyId",
      key: "historyId",
      width: 100,
    },
    {
      title: "Phụ tùng",
      dataIndex: "partName",
      key: "partName",
    },
    {
      title: "Số lượng yêu cầu",
      dataIndex: "quantityRequested",
      key: "quantityRequested",
      width: 120,
      render: (qty) => `${qty} cái`,
    },
    {
      title: "Người yêu cầu",
      dataIndex: "requestedByName",
      key: "requestedByName",
      width: 150,
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
            navigate("/warehouse-manager/spare-parts-requests", {
              state: { selectedRequest: record },
            })
          }
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const pendingReturnColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "historyId",
      key: "historyId",
      width: 100,
    },
    {
      title: "Phụ tùng",
      dataIndex: "partName",
      key: "partName",
    },
    {
      title: "SL xuất",
      dataIndex: "quantityUsed",
      key: "quantityUsed",
      width: 80,
      render: (qty) => `${qty || 0}`,
    },
    {
      title: "SL thực tế",
      dataIndex: "actualQuantityUsed",
      key: "actualQuantityUsed",
      width: 100,
      render: (qty) => `${qty || 0}`,
    },
    {
      title: "Người thay thế",
      dataIndex: "replacedByName",
      key: "replacedByName",
      width: 150,
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
            navigate("/warehouse-manager/return-confirmation", {
              state: { selectedReturn: record },
            })
          }
        >
          Xác nhận trả
        </Button>
      ),
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
    <div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số phụ tùng"
              value={stats.totalItems}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Phụ tùng sắp hết"
              value={stats.lowStockItems}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Yêu cầu chờ duyệt"
              value={stats.pendingRequests}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chờ xác nhận trả"
              value={stats.pendingReturns}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {stats.lowStockItems > 0 && (
        <Alert
          message="Cảnh báo tồn kho"
          description={`Có ${stats.lowStockItems} phụ tùng sắp hết hoặc đã hết hàng. Vui lòng kiểm tra và tạo yêu cầu mua hàng.`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 24 }}
          action={
            <Button
              size="small"
              onClick={() => navigate("/warehouse-manager/inventory")}
            >
              Xem chi tiết
            </Button>
          }
        />
      )}

      {/* Low Stock Items Table */}
      <Card
        title="Phụ tùng sắp hết hàng"
        extra={
          <Button
            type="link"
            onClick={() => navigate("/warehouse-manager/inventory")}
          >
            Xem tất cả
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        {lowStockItems.length > 0 ? (
          <Table
            dataSource={lowStockItems}
            columns={lowStockColumns}
            rowKey="partId"
            pagination={false}
            size="small"
          />
        ) : (
          <Empty description="Không có phụ tùng sắp hết hàng" />
        )}
      </Card>

      {/* Pending Requests and Returns */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Yêu cầu phụ tùng chờ duyệt"
            extra={
              <Button
                type="link"
                onClick={() =>
                  navigate("/warehouse-manager/spare-parts-requests")
                }
              >
                Xem tất cả
              </Button>
            }
          >
            {pendingRequests.length > 0 ? (
              <Table
                dataSource={pendingRequests.slice(0, 5)}
                columns={pendingRequestColumns}
                rowKey="historyId"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="Không có yêu cầu chờ duyệt" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Chờ xác nhận trả lại"
            extra={
              <Button
                type="link"
                onClick={() =>
                  navigate("/warehouse-manager/return-confirmation")
                }
              >
                Xem tất cả
              </Button>
            }
          >
            {pendingReturns.length > 0 ? (
              <Table
                dataSource={pendingReturns.slice(0, 5)}
                columns={pendingReturnColumns}
                rowKey="historyId"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="Không có phụ tùng chờ xác nhận trả" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WarehouseManagerDashboard;
