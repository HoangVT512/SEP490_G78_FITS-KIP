import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Row,
  Col,
  Typography,
  Badge,
  Dropdown,
  Divider,
  Popconfirm,
  message,
  Tooltip,
  Descriptions,
  List,
  Avatar,
  Progress,
  Statistic,
  Alert,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  EnvironmentOutlined,
  DownOutlined,
  ReloadOutlined,
  FilterOutlined,
  BankOutlined,
  ToolOutlined,
  LineChartOutlined,
  GroupOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ApiOutlined,
  NodeIndexOutlined,
  BranchesOutlined,
  OrderedListOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

// Enable relative time plugin and Vietnamese locale
dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const StageManagement = ({ showHeader = true }) => {
  const [stages, setStages] = useState([]);
  const [lines, setLines] = useState([]);
  const [lineGroups, setLineGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [viewingStage, setViewingStage] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    status: "all",
    line: "all",
    lineGroup: "all",
    performance: "all",
  });

  // Mock data for lines
  const mockLines = [
    {
      id: 1,
      name: "Dây chuyền 1",
      groupLineId: 1,
      groupLineName: "Nhóm sản xuất chính",
    },
    {
      id: 2,
      name: "Dây chuyền 2",
      groupLineId: 1,
      groupLineName: "Nhóm sản xuất chính",
    },
    {
      id: 3,
      name: "Dây chuyền lắp ráp A",
      groupLineId: 2,
      groupLineName: "Nhóm lắp ráp tự động",
    },
    {
      id: 4,
      name: "Dây chuyền lắp ráp B",
      groupLineId: 2,
      groupLineName: "Nhóm lắp ráp tự động",
    },
    {
      id: 5,
      name: "Dây chuyền QC1",
      groupLineId: 3,
      groupLineName: "Nhóm kiểm tra chất lượng",
    },
  ];

  // Mock data for stages
  const mockStages = [
    {
      id: 1,
      stageName: "Chuẩn bị nguyên liệu",
      lineId: 1,
      lineName: "Dây chuyền 1",
      groupLineName: "Nhóm sản xuất chính",
      status: "active",
      performance: 92,
      equipmentCount: 3,
      errorCount: 2,
      outputToday: 450,
      targetOutput: 500,
      efficiency: 90,
      cycleTime: 120, // seconds
      lastError: "2024-01-20T14:30:00Z",
      description: "Giai đoạn chuẩn bị và kiểm tra nguyên liệu đầu vào",
      order: 1,
      isBottleneck: false,
      maintenanceStatus: "good",
      operatorCount: 2,
      qualityScore: 95,
      createdDate: "2024-01-01T00:00:00Z",
      equipment: [
        { id: 1, name: "Máy kiểm tra chất lượng", status: "running" },
        { id: 2, name: "Máy phân loại", status: "running" },
        { id: 3, name: "Cân điện tử", status: "maintenance" },
      ],
    },
    {
      id: 2,
      stageName: "Gia công sơ bộ",
      lineId: 1,
      lineName: "Dây chuyền 1",
      groupLineName: "Nhóm sản xuất chính",
      status: "active",
      performance: 88,
      equipmentCount: 4,
      errorCount: 1,
      outputToday: 420,
      targetOutput: 500,
      efficiency: 84,
      cycleTime: 180,
      lastError: "2024-01-19T09:15:00Z",
      description: "Gia công và xử lý sơ bộ sản phẩm",
      order: 2,
      isBottleneck: true,
      maintenanceStatus: "warning",
      operatorCount: 3,
      qualityScore: 88,
      createdDate: "2024-01-01T00:00:00Z",
      equipment: [
        { id: 4, name: "Máy cắt CNC", status: "running" },
        { id: 5, name: "Máy khoan", status: "running" },
        { id: 6, name: "Máy mài", status: "stopped" },
        { id: 7, name: "Máy đo 3D", status: "running" },
      ],
    },
    {
      id: 3,
      stageName: "Lắp ráp chính",
      lineId: 3,
      lineName: "Dây chuyền lắp ráp A",
      groupLineName: "Nhóm lắp ráp tự động",
      status: "active",
      performance: 95,
      equipmentCount: 5,
      errorCount: 0,
      outputToday: 380,
      targetOutput: 400,
      efficiency: 95,
      cycleTime: 200,
      lastError: "2024-01-18T16:45:00Z",
      description: "Lắp ráp các thành phần chính của sản phẩm",
      order: 1,
      isBottleneck: false,
      maintenanceStatus: "excellent",
      operatorCount: 4,
      qualityScore: 98,
      createdDate: "2024-01-01T00:00:00Z",
      equipment: [
        { id: 8, name: "Robot lắp ráp 1", status: "running" },
        { id: 9, name: "Robot lắp ráp 2", status: "running" },
        { id: 10, name: "Máy vặn vít tự động", status: "running" },
        { id: 11, name: "Máy kiểm tra lực kẹp", status: "running" },
        { id: 12, name: "Máy đóng gói", status: "running" },
      ],
    },
    {
      id: 4,
      stageName: "Kiểm tra chất lượng cuối",
      lineId: 5,
      lineName: "Dây chuyền QC1",
      groupLineName: "Nhóm kiểm tra chất lượng",
      status: "maintenance",
      performance: 0,
      equipmentCount: 2,
      errorCount: 5,
      outputToday: 0,
      targetOutput: 300,
      efficiency: 0,
      cycleTime: 300,
      lastError: "2024-01-20T11:20:00Z",
      description: "Kiểm tra chất lượng sản phẩm hoàn thành",
      order: 1,
      isBottleneck: false,
      maintenanceStatus: "maintenance",
      operatorCount: 2,
      qualityScore: 85,
      createdDate: "2024-01-01T00:00:00Z",
      equipment: [
        { id: 13, name: "Máy kiểm tra điện", status: "maintenance" },
        { id: 14, name: "Máy test độ bền", status: "maintenance" },
      ],
    },
    {
      id: 5,
      stageName: "Hoàn thiện và đóng gói",
      lineId: 2,
      lineName: "Dây chuyền 2",
      groupLineName: "Nhóm sản xuất chính",
      status: "stopped",
      performance: 60,
      equipmentCount: 3,
      errorCount: 8,
      outputToday: 150,
      targetOutput: 400,
      efficiency: 37.5,
      cycleTime: 150,
      lastError: "2024-01-20T15:00:00Z",
      description: "Hoàn thiện sản phẩm và đóng gói xuất kho",
      order: 3,
      isBottleneck: true,
      maintenanceStatus: "warning",
      operatorCount: 2,
      qualityScore: 78,
      createdDate: "2024-01-01T00:00:00Z",
      equipment: [
        { id: 15, name: "Máy in nhãn", status: "stopped" },
        { id: 16, name: "Máy đóng hộp", status: "running" },
        { id: 17, name: "Máy dán băng keo", status: "stopped" },
      ],
    },
  ];

  useEffect(() => {
    loadStages();
    loadLines();
  }, []);

  const loadStages = async () => {
    setLoading(true);
    try {
      // API call would go here
      setTimeout(() => {
        setStages(mockStages);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading stages:", error);
      message.error("Không thể tải danh sách giai đoạn");
      setStages(mockStages);
      setLoading(false);
    }
  };

  const loadLines = async () => {
    try {
      // API call would go here
      setLines(mockLines);
    } catch (error) {
      console.error("Error loading lines:", error);
      message.error("Không thể tải danh sách dây chuyền");
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active: "success",
      maintenance: "warning",
      stopped: "error",
      idle: "default",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      active: "Hoạt động",
      maintenance: "Bảo trì",
      stopped: "Dừng",
      idle: "Chờ",
    };
    return statusTexts[status] || "Không xác định";
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      active: <PlayCircleOutlined style={{ color: "#52c41a" }} />,
      maintenance: <ToolOutlined style={{ color: "#faad14" }} />,
      stopped: <StopOutlined style={{ color: "#ff4d4f" }} />,
      idle: <PauseCircleOutlined style={{ color: "#d9d9d9" }} />,
    };
    return statusIcons[status] || <ExclamationCircleOutlined />;
  };

  const getMaintenanceStatusColor = (status) => {
    const colors = {
      excellent: "success",
      good: "processing",
      warning: "warning",
      maintenance: "error",
    };
    return colors[status] || "default";
  };

  const getMaintenanceStatusText = (status) => {
    const texts = {
      excellent: "Tuyệt vời",
      good: "Tốt",
      warning: "Cần chú ý",
      maintenance: "Đang bảo trì",
    };
    return texts[status] || "Không xác định";
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 90) return "#52c41a";
    if (performance >= 70) return "#faad14";
    if (performance >= 50) return "#ff7a45";
    return "#ff4d4f";
  };

  const handleAction = (action, stage) => {
    switch (action) {
      case "view":
        setViewingStage(stage);
        setIsViewModalVisible(true);
        break;
      case "edit":
        setEditingStage(stage);
        form.setFieldsValue({
          ...stage,
          createdDate: stage.createdDate ? dayjs(stage.createdDate) : null,
        });
        setIsModalVisible(true);
        break;
      case "delete":
        message.success("Đã xóa giai đoạn thành công");
        break;
      case "start":
        message.success("Đã khởi động giai đoạn");
        break;
      case "stop":
        message.success("Đã dừng giai đoạn");
        break;
      case "maintenance":
        message.success("Đã chuyển sang chế độ bảo trì");
        break;
      default:
        break;
    }
  };

  const actionMenuItems = (stage) => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "Xem chi tiết",
      onClick: () => handleAction("view", stage),
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Chỉnh sửa",
      onClick: () => handleAction("edit", stage),
    },
    {
      type: "divider",
    },
    {
      key: "start",
      icon: <PlayCircleOutlined />,
      label: "Khởi động",
      disabled: stage.status === "active",
      onClick: () => handleAction("start", stage),
    },
    {
      key: "stop",
      icon: <StopOutlined />,
      label: "Dừng hoạt động",
      disabled: stage.status === "stopped",
      onClick: () => handleAction("stop", stage),
    },
    {
      key: "maintenance",
      icon: <ToolOutlined />,
      label: "Bảo trì",
      onClick: () => handleAction("maintenance", stage),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Xóa",
      danger: true,
      onClick: () => handleAction("delete", stage),
    },
  ];

  const columns = [
    {
      title: "Giai đoạn",
      key: "stage",
      width: 300,
      render: (_, record) => (
        <Space>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              background: record.isBottleneck
                ? "linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)"
                : "linear-gradient(135deg, #334766 0%, #283652 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "16px",
            }}
          >
            {record.isBottleneck ? <WarningOutlined /> : <NodeIndexOutlined />}
          </div>
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>
              {record.stageName}
              {record.isBottleneck && (
                <Tag color="red" size="small" style={{ marginLeft: "8px" }}>
                  Nút thắt cổ chai
                </Tag>
              )}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              <BranchesOutlined style={{ marginRight: "4px" }} />
              {record.lineName}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              Thứ tự: {record.order} • {record.equipmentCount} thiết bị
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Space>
            {getStatusIcon(record.status)}
            <Tag color={getStatusColor(record.status)}>
              {getStatusText(record.status)}
            </Tag>
          </Space>
          <Tag
            color={getMaintenanceStatusColor(record.maintenanceStatus)}
            size="small"
          >
            {getMaintenanceStatusText(record.maintenanceStatus)}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Hiệu suất",
      key: "performance",
      width: 150,
      render: (_, record) => (
        <div>
          <Progress
            percent={record.performance}
            size="small"
            strokeColor={getPerformanceColor(record.performance)}
            format={(percent) => `${percent}%`}
          />
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
            {record.outputToday}/{record.targetOutput} sản phẩm
          </div>
        </div>
      ),
    },
    {
      title: "Chất lượng",
      key: "quality",
      width: 120,
      align: "center",
      render: (_, record) => (
        <div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color:
                record.qualityScore >= 95
                  ? "#52c41a"
                  : record.qualityScore >= 85
                  ? "#faad14"
                  : "#ff4d4f",
            }}
          >
            {record.qualityScore}%
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            Điểm chất lượng
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian chu kỳ",
      key: "cycleTime",
      width: 120,
      align: "center",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "500" }}>
            {Math.floor(record.cycleTime / 60)}:
            {(record.cycleTime % 60).toString().padStart(2, "0")}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>phút</div>
        </div>
      ),
    },
    {
      title: "Lỗi",
      key: "errors",
      width: 100,
      align: "center",
      render: (_, record) => (
        <div>
          <Badge
            count={record.errorCount}
            showZero
            style={{
              backgroundColor:
                record.errorCount === 0
                  ? "#52c41a"
                  : record.errorCount <= 2
                  ? "#faad14"
                  : "#ff4d4f",
            }}
          />
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
            {record.errorCount === 0 ? "Không có lỗi" : "lỗi hôm nay"}
          </div>
        </div>
      ),
    },
    {
      title: "Nhân viên",
      key: "operators",
      width: 100,
      align: "center",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "500" }}>
            <TeamOutlined style={{ marginRight: "4px", color: "#334766" }} />
            {record.operatorCount}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>nhân viên</div>
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Dropdown menu={{ items: actionMenuItems(record) }} trigger={["click"]}>
          <Button type="text" icon={<DownOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const filteredStages = stages.filter((stage) => {
    const matchesSearch =
      stage.stageName.toLowerCase().includes(searchText.toLowerCase()) ||
      stage.lineName.toLowerCase().includes(searchText.toLowerCase()) ||
      stage.groupLineName.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      filters.status === "all" || stage.status === filters.status;
    const matchesLine =
      filters.line === "all" || stage.lineId.toString() === filters.line;
    const matchesPerformance =
      filters.performance === "all" ||
      (filters.performance === "high" && stage.performance >= 80) ||
      (filters.performance === "medium" &&
        stage.performance >= 60 &&
        stage.performance < 80) ||
      (filters.performance === "low" && stage.performance < 60);

    return matchesSearch && matchesStatus && matchesLine && matchesPerformance;
  });

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);

      if (editingStage) {
        message.success("Cập nhật giai đoạn thành công!");
      } else {
        message.success("Tạo giai đoạn mới thành công!");
      }

      setIsModalVisible(false);
      setEditingStage(null);
      form.resetFields();
      loadStages();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingStage(null);
    form.resetFields();
  };

  const cardStyle = {
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
  };

  const contentStyle = {
    padding: "24px",
    backgroundColor: "#f8fafc",
    minHeight: "calc(100vh - 70px)",
  };

  const content = (
    <div style={contentStyle}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng giai đoạn"
              value={stages.length}
              prefix={<NodeIndexOutlined style={{ color: "#334766" }} />}
              valueStyle={{ color: "#334766" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stages.filter((s) => s.status === "active").length}
              prefix={<PlayCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Hiệu suất trung bình"
              value={Math.round(
                stages.reduce((sum, s) => sum + s.performance, 0) /
                  stages.length
              )}
              suffix="%"
              prefix={<ThunderboltOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Nút thắt cổ chai"
              value={stages.filter((s) => s.isBottleneck).length}
              prefix={<WarningOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bottleneck Alert */}
      {stages.some((s) => s.isBottleneck) && (
        <Alert
          message="Cảnh báo nút thắt cổ chai"
          description={`Phát hiện ${
            stages.filter((s) => s.isBottleneck).length
          } giai đoạn đang gây cản trở cho dây chuyền sản xuất. Hãy kiểm tra và xử lý ngay.`}
          type="warning"
          showIcon
          style={{ marginBottom: "24px" }}
          action={
            <Button size="small" danger>
              Xem chi tiết
            </Button>
          }
        />
      )}

      <Card style={cardStyle}>
        <div style={{ marginBottom: "24px" }}>
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>
            <NodeIndexOutlined
              style={{ marginRight: "8px", color: "#334766" }}
            />
            Quản lý giai đoạn sản xuất
          </Title>
          <Text type="secondary">
            Quản lý và giám sát các giai đoạn trong dây chuyền sản xuất
          </Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={8} md={6}>
            <Input.Group compact>
              <Input
                placeholder="Tìm kiếm giai đoạn..."
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "calc(100% - 40px)" }}
              />
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                style={{
                  backgroundColor: "#334766",
                  borderColor: "#334766",
                  width: "40px",
                }}
              />
            </Input.Group>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: "100%" }}
              placeholder="Trạng thái"
              size="large"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="maintenance">Bảo trì</Option>
              <Option value="stopped">Dừng</Option>
              <Option value="idle">Chờ</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              value={filters.line}
              onChange={(value) => setFilters({ ...filters, line: value })}
              style={{ width: "100%" }}
              placeholder="Dây chuyền"
              size="large"
            >
              <Option value="all">Tất cả dây chuyền</Option>
              {lines.map((line) => (
                <Option key={line.id} value={line.id.toString()}>
                  {line.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              value={filters.performance}
              onChange={(value) =>
                setFilters({ ...filters, performance: value })
              }
              style={{ width: "100%" }}
              placeholder="Hiệu suất"
              size="large"
            >
              <Option value="all">Tất cả hiệu suất</Option>
              <Option value="high">Cao (≥80%)</Option>
              <Option value="medium">Trung bình (60-79%)</Option>
              <Option value="low">Thấp (&lt;60%)</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingStage(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                style={{ backgroundColor: "#334766", borderColor: "#334766" }}
              >
                Thêm giai đoạn
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadStages}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredStages}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredStages.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} giai đoạn`,
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          scroll={{ x: 1400 }}
          className="stage-management-table"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingStage ? "Chỉnh sửa giai đoạn" : "Thêm giai đoạn mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={1000}
        okText={editingStage ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        okButtonProps={{
          style: { backgroundColor: "#334766", borderColor: "#334766", width: 100 },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stageName"
                label="Tên giai đoạn"
                rules={[
                  { required: true, message: "Vui lòng nhập tên giai đoạn" },
                ]}
              >
                <Input placeholder="Nhập tên giai đoạn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lineId"
                label="Dây chuyền"
                rules={[
                  { required: true, message: "Vui lòng chọn dây chuyền" },
                ]}
              >
                <Select placeholder="Chọn dây chuyền">
                  {lines.map((line) => (
                    <Option key={line.id} value={line.id}>
                      {line.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="Mô tả">
                <Input.TextArea placeholder="Nhập mô tả giai đoạn" rows={3} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="order"
                label="Thứ tự"
                rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}
              >
                <Input
                  type="number"
                  placeholder="Nhập thứ tự giai đoạn"
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="targetOutput"
                label="Mục tiêu sản lượng"
                rules={[{ required: true, message: "Vui lòng nhập mục tiêu" }]}
              >
                <Input type="number" placeholder="Nhập mục tiêu sản lượng" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="cycleTime"
                label="Thời gian chu kỳ (giây)"
                rules={[
                  { required: true, message: "Vui lòng nhập thời gian chu kỳ" },
                ]}
              >
                <Input type="number" placeholder="Nhập thời gian chu kỳ" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="operatorCount"
                label="Số lượng nhân viên"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số lượng nhân viên",
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập số lượng nhân viên"
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="active">Hoạt động</Option>
                  <Option value="maintenance">Bảo trì</Option>
                  <Option value="stopped">Dừng</Option>
                  <Option value="idle">Chờ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={
          <Space>
            <NodeIndexOutlined />
            Chi tiết giai đoạn: {viewingStage?.stageName}
          </Space>
        }
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setIsViewModalVisible(false);
              handleAction("edit", viewingStage);
            }}
            style={{ backgroundColor: "#334766", borderColor: "#334766" }}
          >
            Chỉnh sửa
          </Button>,
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={1000}
      >
        {viewingStage && (
          <div>
            <Row gutter={[24, 16]} style={{ marginBottom: "24px" }}>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Hiệu suất"
                    value={viewingStage.performance}
                    suffix="%"
                    valueStyle={{
                      color: getPerformanceColor(viewingStage.performance),
                      fontSize: "24px",
                    }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Sản lượng hôm nay"
                    value={viewingStage.outputToday}
                    suffix={`/ ${viewingStage.targetOutput}`}
                    valueStyle={{ fontSize: "20px" }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Chất lượng"
                    value={viewingStage.qualityScore}
                    suffix="%"
                    valueStyle={{
                      fontSize: "20px",
                      color:
                        viewingStage.qualityScore >= 90 ? "#52c41a" : "#faad14",
                    }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Chu kỳ"
                    value={`${Math.floor(viewingStage.cycleTime / 60)}:${(
                      viewingStage.cycleTime % 60
                    )
                      .toString()
                      .padStart(2, "0")}`}
                    valueStyle={{ fontSize: "20px" }}
                  />
                </Card>
              </Col>
            </Row>

            <Descriptions column={2} bordered style={{ marginBottom: "24px" }}>
              <Descriptions.Item label="Tên giai đoạn">
                {viewingStage.stageName}
              </Descriptions.Item>
              <Descriptions.Item label="Dây chuyền">
                <Space>
                  <BranchesOutlined style={{ color: "#334766" }} />
                  {viewingStage.lineName}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Nhóm dây chuyền">
                {viewingStage.groupLineName}
              </Descriptions.Item>
              <Descriptions.Item label="Thứ tự">
                {viewingStage.order}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Space>
                  {getStatusIcon(viewingStage.status)}
                  <Tag color={getStatusColor(viewingStage.status)}>
                    {getStatusText(viewingStage.status)}
                  </Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Nút thắt cổ chai">
                {viewingStage.isBottleneck ? (
                  <Tag color="red">
                    <WarningOutlined /> Có
                  </Tag>
                ) : (
                  <Tag color="green">
                    <CheckCircleOutlined /> Không
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Số nhân viên">
                <Space>
                  <TeamOutlined style={{ color: "#334766" }} />
                  {viewingStage.operatorCount} người
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Số lỗi hôm nay">
                <Badge
                  count={viewingStage.errorCount}
                  showZero
                  style={{
                    backgroundColor:
                      viewingStage.errorCount === 0 ? "#52c41a" : "#ff4d4f",
                  }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {viewingStage.description}
              </Descriptions.Item>
            </Descriptions>

            <Card
              title={
                <span>
                  <ToolOutlined
                    style={{ marginRight: "8px", color: "#334766" }}
                  />
                  Thiết bị ({viewingStage.equipment?.length || 0})
                </span>
              }
              size="small"
            >
              <List
                dataSource={viewingStage.equipment || []}
                renderItem={(equipment) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: "#334766",
                            color: "#fff",
                          }}
                          icon={<SettingOutlined />}
                        />
                      }
                      title={
                        <Space>
                          <span>{equipment.name}</span>
                          {getStatusIcon(equipment.status)}
                          <Tag
                            color={getStatusColor(equipment.status)}
                            size="small"
                          >
                            {getStatusText(equipment.status)}
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );

  return showHeader ? <Layout>{content}</Layout> : content;
};

export default StageManagement;
