import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  message,
  Empty,
  Tag,
  Button,
  Space,
  Select,
  Input,
  Row,
  Col,
  Statistic,
} from "antd";
import dayjs from "dayjs";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { replacementHistoryService } from "../../services/replacementHistoryService";

const ReplacementHistoryPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    returning: 0,
  });

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, searchText, statusFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await replacementHistoryService.getAll();
      const historyData = Array.isArray(res) ? res : res?.data || [];

      setData(historyData);

      // Calculate statistics
      const completed = historyData.filter(
        (h) => h.status === "Hoàn thành"
      ).length;
      const pending = historyData.filter(
        (h) => h.status === "Chờ trả lại"
      ).length;
      const returning = historyData.filter(
        (h) => h.status === "Đã trả lại"
      ).length;

      setStats({
        total: historyData.length,
        completed,
        pending,
        returning,
      });
    } catch (err) {
      console.error("Failed to load replacement history:", err);
      message.error(
        "Không thể tải lịch sử thay thế: " + (err?.message || String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = data;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((h) => h.status === statusFilter);
    }

    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.partName?.toLowerCase().includes(search) ||
          h.partNumber?.toLowerCase().includes(search) ||
          h.equipmentName?.toLowerCase().includes(search) ||
          h.equipmentCode?.toLowerCase().includes(search) ||
          h.replacedByFullName?.toLowerCase().includes(search) ||
          h.replacedByUserName?.toLowerCase().includes(search)
      );
    }

    setFilteredData(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Hoàn thành":
        return "green";
      case "Chờ trả lại":
        return "orange";
      case "Đã trả lại":
        return "blue";
      case "Đã xuất":
        return "cyan";
      case "Chờ duyệt cấp phát":
        return "purple";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "replacementID",
      key: "replacementID",
      width: 80,
      fixed: "left",
    },
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 140,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: 200,
    },
    {
      title: "Thiết bị",
      key: "equipment",
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 500 }}>
            {record.equipmentName || "Chưa xác định"}
          </div>
          {record.equipmentCode && (
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {record.equipmentCode}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (qty, record) => (
        <div>
          <div>Cấp phát: {qty}</div>
          {record.actualQuantityUsed !== null && (
            <div style={{ color: "#52c41a" }}>
              Dùng: {record.actualQuantityUsed}
            </div>
          )}
          {record.quantityToReturn > 0 && (
            <div style={{ color: "#faad14" }}>
              Còn: {record.quantityToReturn}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Ngày thay thế",
      dataIndex: "replacedDate",
      key: "replacedDate",
      width: 160,
      render: (d) =>
        d ? (
          <div>
            <div style={{ fontSize: "13px" }}>
              {dayjs(d).format("DD/MM/YYYY")}
            </div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {dayjs(d).format("HH:mm")}
            </div>
          </div>
        ) : (
          ""
        ),
    },
    {
      title: "Người cấp phát",
      key: "replacedBy",
      width: 160,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 500 }}>
            {record.replacedByFullName ||
              record.replacedByUserName ||
              "Chưa xác định"}
          </div>
          {record.replacedByEmployeeCode && (
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {record.replacedByEmployeeCode}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (s) => (
        <Tag
          color={getStatusColor(s)}
          style={{ minWidth: "100px", textAlign: "center" }}
        >
          {s}
        </Tag>
      ),
      filters: [
        { text: "Hoàn thành", value: "Hoàn thành" },
        { text: "Chờ trả lại", value: "Chờ trả lại" },
        { text: "Đã trả lại", value: "Đã trả lại" },
        { text: "Đã xuất", value: "Đã xuất" },
        { text: "Chờ duyệt cấp phát", value: "Chờ duyệt cấp phát" },
      ],
    },
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless">
            <Statistic
              title="Tổng cộng"
              value={stats.total}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless">
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless">
            <Statistic
              title="Chờ trả lại"
              value={stats.pending}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless">
            <Statistic
              title="Đã trả lại"
              value={stats.returning}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Lịch sử thay thế phụ tùng"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={loadHistory}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        }
        bordered={false}
      >
        {/* Filter Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm kiếm phụ tùng, thiết bị..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
              <Select.Option value="Chờ trả lại">Chờ trả lại</Select.Option>
              <Select.Option value="Đã trả lại">Đã trả lại</Select.Option>
              <Select.Option value="Đã xuất">Đã xuất</Select.Option>
              <Select.Option value="Chờ duyệt cấp phát">
                Chờ duyệt cấp phát
              </Select.Option>
            </Select>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={(r) => r.replacementID || r.replacementId}
          loading={loading}
          locale={{
            emptyText: <Empty description="Không có bản ghi thay thế" />,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default ReplacementHistoryPage;
