import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Modal,
  Descriptions,
  Button,
  DatePicker,
  Select,
  Input,
  Row,
  Col,
  Statistic,
  Badge,
  Empty,
  Tabs,
  Tooltip,
  message,
  Dropdown,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ToolOutlined,
  FileTextOutlined,
  InboxOutlined,
  DownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import replacementHistoryService from "../../services/replacementHistoryService";
import sparePartService from "../../services/sparePartService";

const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionHistory = () => {
  const [loading, setLoading] = useState(false);
  const [allHistories, setAllHistories] = useState([]);
  const [filteredHistories, setFilteredHistories] = useState([]);
  const [incidentHistories, setIncidentHistories] = useState([]);
  const [workOrderHistories, setWorkOrderHistories] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [statistics, setStatistics] = useState({
    total: 0,
    approved: 0,
    returned: 0,
    pending: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    dateRange: null,
    status: null,
    searchText: "",
  });

  useEffect(() => {
    fetchAllHistories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allHistories, filters]);

  const fetchAllHistories = async () => {
    setLoading(true);
    try {
      const data = await replacementHistoryService.getAll();
      console.log("All histories:", data);

      const histories = Array.isArray(data) ? data : [];
      setAllHistories(histories);

      // Separate by type
      const incidents = histories.filter((h) => h.incidentId);
      const workOrders = histories.filter((h) => h.workOrderId);

      setIncidentHistories(incidents);
      setWorkOrderHistories(workOrders);

      // Calculate statistics
      calculateStatistics(histories);
    } catch (error) {
      console.error("Error fetching histories:", error);
      message.error("Không thể tải lịch sử giao dịch");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (histories) => {
    const stats = {
      total: histories.length,
      approved: histories.filter((h) => h.status === "Đã duyệt cấp phát")
        .length,
      returned: histories.filter((h) => h.status === "Đã trả lại").length,
      pending: histories.filter((h) => h.status === "Chờ duyệt cấp phát")
        .length,
    };
    setStatistics(stats);
  };

  const applyFilters = () => {
    let filtered = [...allHistories];

    // Filter by date range
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange;
      filtered = filtered.filter((h) => {
        const date = dayjs(h.replacedDate);
        return (
          date.isAfter(start.startOf("day")) && date.isBefore(end.endOf("day"))
        );
      });
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((h) => h.status === filters.status);
    }

    // Filter by search text
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.partName?.toLowerCase().includes(searchLower) ||
          h.partCode?.toLowerCase().includes(searchLower) ||
          h.equipmentName?.toLowerCase().includes(searchLower) ||
          h.equipmentCode?.toLowerCase().includes(searchLower) ||
          h.replacedByUserName?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredHistories(filtered);

    // Update tab-specific data
    const incidents = filtered.filter((h) => h.incidentId);
    const workOrders = filtered.filter((h) => h.workOrderId);
    setIncidentHistories(incidents);
    setWorkOrderHistories(workOrders);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: null,
      status: null,
      searchText: "",
    });
  };

  const showDetailModal = (record) => {
    setSelectedHistory(record);
    setIsDetailModalVisible(true);
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      "Chờ duyệt cấp phát": {
        color: "orange",
        icon: <ClockCircleOutlined />,
      },
      "Đã duyệt cấp phát": { color: "green", icon: <CheckCircleOutlined /> },
      "Chờ trả lại": { color: "blue", icon: <HistoryOutlined /> },
      "Đã trả lại": { color: "purple", icon: <CheckCircleOutlined /> },
    };

    const config = statusConfig[status] || { color: "default", icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {status}
      </Tag>
    );
  };

  // Common columns for all tables
  const getCommonColumns = (type) => [
    {
      title: type === "incident" ? "Mã sự cố" : "Mã phiếu BT",
      key: "refId",
      width: 100,
      fixed: "left",
      render: (_, record) =>
        type === "incident"
          ? `INC-${record.incidentId}`
          : `WO-${record.workOrderId}`,
    },
    {
      title: "Thiết bị",
      key: "equipment",
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: "13px" }}>
            {record.equipmentName}
          </div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.equipmentCode}
          </div>
        </div>
      ),
    },
    {
      title: "Phụ tùng",
      key: "sparePart",
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: "13px" }}>
            {record.partName}
          </div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.partCode}
          </div>
        </div>
      ),
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: 150,
      align: "center",
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>
            {record.quantity} cái
          </div>
          {record.actualQuantityUsed !== null &&
            record.actualQuantityUsed !== undefined && (
              <div style={{ fontSize: "12px", color: "#52c41a" }}>
                Sử dụng: {record.actualQuantityUsed} cái
              </div>
            )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 180,
      filters: [
        { text: "Chờ duyệt cấp phát", value: "Chờ duyệt cấp phát" },
        { text: "Đã duyệt cấp phát", value: "Đã duyệt cấp phát" },
        { text: "Chờ trả lại", value: "Chờ trả lại" },
        { text: "Đã trả lại", value: "Đã trả lại" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Người yêu cầu",
      key: "replacedBy",
      width: 150,
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
      title: "Ngày yêu cầu",
      dataIndex: "replacedDate",
      key: "replacedDate",
      width: 140,
      sorter: (a, b) =>
        dayjs(a.replacedDate).unix() - dayjs(b.replacedDate).unix(),
      render: (date) =>
        date ? (
          <div>
            <div style={{ fontSize: "13px" }}>
              {dayjs(date).format("DD/MM/YYYY")}
            </div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {dayjs(date).format("HH:mm")}
            </div>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => {
        const menuItems = [
          {
            key: "detail",
            label: "Xem chi tiết",
            icon: <EyeOutlined />,
            onClick: () => showDetailModal(record),
          },
        ];
        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="link"
              icon={<DownOutlined />}
              style={{ padding: "4px 8px", color: "#334766" }}
            />
          </Dropdown>
        );
      },
    },
  ];

  const allColumns = [
    {
      title: "Loại",
      key: "type",
      width: 100,
      fixed: "left",
      filters: [
        { text: "Sự cố", value: "incident" },
        { text: "Bảo trì", value: "workorder" },
      ],
      onFilter: (value, record) =>
        value === "incident" ? record.incidentId : record.workOrderId,
      render: (_, record) =>
        record.incidentId ? (
          <Tag color="red" icon={<WarningOutlined />}>
            Sự cố
          </Tag>
        ) : (
          <Tag color="blue" icon={<ToolOutlined />}>
            Bảo trì
          </Tag>
        ),
    },
    {
      title: "Mã tham chiếu",
      key: "refId",
      width: 110,
      render: (_, record) =>
        record.incidentId
          ? `INC-${record.incidentId}`
          : `WO-${record.workOrderId}`,
    },
    {
      title: "Thiết bị",
      key: "equipment",
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: "13px" }}>
            {record.equipmentName}
          </div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.equipmentCode}
          </div>
        </div>
      ),
    },
    {
      title: "Phụ tùng",
      key: "sparePart",
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: "13px" }}>
            {record.partName}
          </div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.partCode}
          </div>
        </div>
      ),
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: 150,
      align: "center",
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>
            {record.quantity} cái
          </div>
          {record.actualQuantityUsed !== null &&
            record.actualQuantityUsed !== undefined && (
              <div style={{ fontSize: "12px", color: "#52c41a" }}>
                Sử dụng: {record.actualQuantityUsed} cái
              </div>
            )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 180,
      filters: [
        { text: "Chờ duyệt cấp phát", value: "Chờ duyệt cấp phát" },
        { text: "Đã duyệt cấp phát", value: "Đã duyệt cấp phát" },
        { text: "Chờ trả lại", value: "Chờ trả lại" },
        { text: "Đã trả lại", value: "Đã trả lại" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Người yêu cầu",
      key: "replacedBy",
      width: 150,
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
      title: "Ngày yêu cầu",
      dataIndex: "replacedDate",
      key: "replacedDate",
      width: 140,
      sorter: (a, b) =>
        dayjs(a.replacedDate).unix() - dayjs(b.replacedDate).unix(),
      render: (date) =>
        date ? (
          <div>
            <div style={{ fontSize: "13px" }}>
              {dayjs(date).format("DD/MM/YYYY")}
            </div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {dayjs(date).format("HH:mm")}
            </div>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => {
        const menuItems = [
          {
            key: "detail",
            label: "Xem chi tiết",
            icon: <EyeOutlined />,
            onClick: () => showDetailModal(record),
          },
        ];
        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="link"
              icon={<DownOutlined />}
              style={{ padding: "4px 8px", color: "#334766" }}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ backgroundColor: "#f0f5ff" }}>
            <Statistic
              title={
                <span style={{ fontSize: "13px", color: "#1890ff" }}>
                  Tổng số giao dịch
                </span>
              }
              value={statistics.total}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ backgroundColor: "#f6ffed" }}>
            <Statistic
              title={
                <span style={{ fontSize: "13px", color: "#52c41a" }}>
                  Đã duyệt cấp phát
                </span>
              }
              value={statistics.approved}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ backgroundColor: "#f9f0ff" }}>
            <Statistic
              title={
                <span style={{ fontSize: "13px", color: "#722ed1" }}>
                  Đã trả lại
                </span>
              }
              value={statistics.returned}
              prefix={<InboxOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ backgroundColor: "#fff7e6" }}>
            <Statistic
              title={
                <span style={{ fontSize: "13px", color: "#fa8c16" }}>
                  Chờ duyệt
                </span>
              }
              value={statistics.pending}
              prefix={<ClockCircleOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16", fontSize: "24px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Card */}
      <Card
        title={
          <Space>
            <HistoryOutlined style={{ fontSize: "18px", color: "#283652" }} />
            <span style={{ fontSize: "16px", fontWeight: 600 }}>
              Lịch sử cấp phát linh kiện
            </span>
          </Space>
        }
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAllHistories}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        {/* Filters */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            backgroundColor: "#fafafa",
            borderRadius: "8px",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 4, fontSize: "13px", color: "#666" }}>
                Khoảng thời gian
              </div>
              <RangePicker
                style={{ width: "100%" }}
                value={filters.dateRange}
                onChange={(dates) => handleFilterChange("dateRange", dates)}
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 4, fontSize: "13px", color: "#666" }}>
                Trạng thái
              </div>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn trạng thái"
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
                allowClear
              >
                <Option value="Chờ duyệt cấp phát">Chờ duyệt cấp phát</Option>
                <Option value="Đã duyệt cấp phát">Đã duyệt cấp phát</Option>
                <Option value="Chờ trả lại">Chờ trả lại</Option>
                <Option value="Đã trả lại">Đã trả lại</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <div style={{ marginBottom: 4, fontSize: "13px", color: "#666" }}>
                Tìm kiếm
              </div>
              <Input
                placeholder="Tìm theo tên phụ tùng, thiết bị, người cấp phát..."
                prefix={<SearchOutlined />}
                value={filters.searchText}
                onChange={(e) =>
                  handleFilterChange("searchText", e.target.value)
                }
                allowClear
              />
            </Col>
          </Row>
          <Row style={{ marginTop: 12 }}>
            <Col span={24}>
              <Button size="small" onClick={handleResetFilters}>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "all",
              label: (
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  <FileTextOutlined
                    style={{ marginRight: 6, color: "#1890ff" }}
                  />
                  Tất cả giao dịch
                  <Badge
                    count={filteredHistories.length}
                    style={{
                      marginLeft: 8,
                      backgroundColor: "#1890ff",
                    }}
                  />
                </span>
              ),
              children: (
                <Table
                  dataSource={filteredHistories}
                  columns={allColumns}
                  rowKey="replacementID"
                  loading={loading}
                  pagination={{
                    total: filteredHistories.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} giao dịch`,
                  }}
                  scroll={{ x: 1600 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có lịch sử giao dịch nào"
                      />
                    ),
                  }}
                />
              ),
            },
            {
              key: "incident",
              label: (
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  <WarningOutlined
                    style={{ marginRight: 6, color: "#ff4d4f" }}
                  />
                  Từ sự cố
                  <Badge
                    count={incidentHistories.length}
                    style={{
                      marginLeft: 8,
                      backgroundColor: "#ff4d4f",
                    }}
                  />
                </span>
              ),
              children: (
                <Table
                  dataSource={incidentHistories}
                  columns={getCommonColumns("incident")}
                  rowKey="replacementID"
                  loading={loading}
                  pagination={{
                    total: incidentHistories.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} giao dịch từ sự cố`,
                  }}
                  scroll={{ x: 1500 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có giao dịch nào từ sự cố"
                      />
                    ),
                  }}
                />
              ),
            },
            {
              key: "maintenance",
              label: (
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  <ToolOutlined style={{ marginRight: 6, color: "#1890ff" }} />
                  Từ bảo trì
                  <Badge
                    count={workOrderHistories.length}
                    style={{
                      marginLeft: 8,
                      backgroundColor: "#1890ff",
                    }}
                  />
                </span>
              ),
              children: (
                <Table
                  dataSource={workOrderHistories}
                  columns={getCommonColumns("workorder")}
                  rowKey="replacementID"
                  loading={loading}
                  pagination={{
                    total: workOrderHistories.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} giao dịch từ bảo trì`,
                  }}
                  scroll={{ x: 1500 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có giao dịch nào từ bảo trì"
                      />
                    ),
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: "#283652" }} />
            <span>Chi tiết giao dịch cấp phát</span>
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setIsDetailModalVisible(false)}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedHistory && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Loại giao dịch" span={2}>
              {selectedHistory.incidentId ? (
                <Tag color="red" icon={<WarningOutlined />}>
                  Sự cố: INC-{selectedHistory.incidentId}
                </Tag>
              ) : (
                <Tag color="blue" icon={<ToolOutlined />}>
                  Bảo trì: WO-{selectedHistory.workOrderId}
                </Tag>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Thiết bị" span={2}>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {selectedHistory.equipmentName}
                </div>
                <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                  Mã: {selectedHistory.equipmentCode}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Phụ tùng" span={2}>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {selectedHistory.partName}
                </div>
                <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                  Mã: {selectedHistory.partCode}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Số lượng cấp phát">
              <strong>{selectedHistory.quantity} cái</strong>
            </Descriptions.Item>

            <Descriptions.Item label="Số lượng sử dụng">
              {selectedHistory.status === "Hoàn thành" ||
              selectedHistory.status === "Đã trả lại" ||
              (selectedHistory.actualQuantityUsed !== null &&
                selectedHistory.actualQuantityUsed !== undefined) ? (
                <strong style={{ color: "#52c41a" }}>
                  {selectedHistory.actualQuantityUsed ?? 0} cái
                </strong>
              ) : (
                <span style={{ color: "#8c8c8c", fontStyle: "italic" }}>
                  Chưa xác định
                </span>
              )}
            </Descriptions.Item>

            {(selectedHistory.status === "Hoàn thành" ||
              selectedHistory.status === "Đã trả lại" ||
              (selectedHistory.actualQuantityUsed !== null &&
                selectedHistory.actualQuantityUsed !== undefined)) && (
              <Descriptions.Item label="Số lượng trả lại" span={2}>
                <strong style={{ color: "#1890ff" }}>
                  {selectedHistory.quantityToReturn !== null &&
                  selectedHistory.quantityToReturn !== undefined
                    ? selectedHistory.quantityToReturn
                    : (selectedHistory.quantity || 0) -
                      (selectedHistory.actualQuantityUsed ?? 0)}{" "}
                  cái
                </strong>
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Trạng thái" span={2}>
              {getStatusTag(selectedHistory.status)}
            </Descriptions.Item>

            <Descriptions.Item label="Người yêu cầu">
              <div>
                <div style={{ fontWeight: 600 }}>
                  {selectedHistory.replacedByFullName ||
                    selectedHistory.replacedByUserName ||
                    "Chưa xác định"}
                </div>
                {selectedHistory.replacedByEmployeeCode && (
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                    Mã NV: {selectedHistory.replacedByEmployeeCode}
                  </div>
                )}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Ngày yêu cầu">
              {selectedHistory.replacedDate
                ? dayjs(selectedHistory.replacedDate).format("DD/MM/YYYY HH:mm")
                : "-"}
            </Descriptions.Item>

            {selectedHistory.returnDate && (
              <Descriptions.Item label="Ngày trả lại" span={2}>
                {dayjs(selectedHistory.returnDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            )}

            {selectedHistory.remarks && (
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedHistory.remarks}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TransactionHistory;
