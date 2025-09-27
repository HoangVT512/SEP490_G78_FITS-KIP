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
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  GroupOutlined,
  EnvironmentOutlined,
  DownOutlined,
  ReloadOutlined,
  FilterOutlined,
  BankOutlined,
  ToolOutlined,
  LineChartOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ThunderboltOutlined,
  TeamOutlined,
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

const LineGroupManagement = ({ showHeader = true }) => {
  const [lineGroups, setLineGroups] = useState([]);
  const [lines, setLines] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingLineGroup, setEditingLineGroup] = useState(null);
  const [viewingLineGroup, setViewingLineGroup] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    status: "all",
    room: "all",
    efficiency: "all",
  });

  // Mock data for rooms
  const mockRooms = [
    { id: 1, name: "Phòng sản xuất A", departmentId: 3 },
    { id: 2, name: "Phòng sản xuất B", departmentId: 3 },
    { id: 3, name: "Phòng lắp ráp", departmentId: 3 },
    { id: 4, name: "Phòng kiểm tra chất lượng", departmentId: 3 },
  ];

  // Mock data for line groups
  const mockLineGroups = [
    {
      id: 1,
      groupLineName: "Nhóm sản xuất chính",
      roomId: 1,
      roomName: "Phòng sản xuất A",
      status: "active",
      efficiency: 85,
      targetOutput: 1000,
      actualOutput: 850,
      lineCount: 4,
      operatingHours: 16,
      maintenanceStatus: "good",
      lastMaintenance: "2024-01-15T00:00:00Z",
      nextMaintenance: "2024-02-15T00:00:00Z",
      supervisor: "Nguyễn Văn Quản",
      shift: "Ca 1",
      createdDate: "2024-01-01T00:00:00Z",
      lines: [
        { id: 1, name: "Dây chuyền 1", status: "running", efficiency: 90 },
        { id: 2, name: "Dây chuyền 2", status: "running", efficiency: 85 },
        { id: 3, name: "Dây chuyền 3", status: "maintenance", efficiency: 0 },
        { id: 4, name: "Dây chuyền 4", status: "stopped", efficiency: 80 },
      ],
    },
    {
      id: 2,
      groupLineName: "Nhóm lắp ráp tự động",
      roomId: 3,
      roomName: "Phòng lắp ráp",
      status: "active",
      efficiency: 92,
      targetOutput: 800,
      actualOutput: 736,
      lineCount: 3,
      operatingHours: 12,
      maintenanceStatus: "excellent",
      lastMaintenance: "2024-01-10T00:00:00Z",
      nextMaintenance: "2024-02-10T00:00:00Z",
      supervisor: "Trần Thị Linh",
      shift: "Ca 2",
      createdDate: "2024-01-01T00:00:00Z",
      lines: [
        {
          id: 5,
          name: "Dây chuyền lắp ráp A",
          status: "running",
          efficiency: 95,
        },
        {
          id: 6,
          name: "Dây chuyền lắp ráp B",
          status: "running",
          efficiency: 90,
        },
        {
          id: 7,
          name: "Dây chuyền đóng gói",
          status: "running",
          efficiency: 91,
        },
      ],
    },
    {
      id: 3,
      groupLineName: "Nhóm kiểm tra chất lượng",
      roomId: 4,
      roomName: "Phòng kiểm tra chất lượng",
      status: "maintenance",
      efficiency: 0,
      targetOutput: 500,
      actualOutput: 0,
      lineCount: 2,
      operatingHours: 0,
      maintenanceStatus: "maintenance",
      lastMaintenance: "2024-01-20T00:00:00Z",
      nextMaintenance: "2024-01-25T00:00:00Z",
      supervisor: "Lê Văn Kiểm",
      shift: "Ca 1",
      createdDate: "2024-01-01T00:00:00Z",
      lines: [
        { id: 8, name: "Dây chuyền QC1", status: "maintenance", efficiency: 0 },
        { id: 9, name: "Dây chuyền QC2", status: "maintenance", efficiency: 0 },
      ],
    },
    {
      id: 4,
      groupLineName: "Nhóm sản xuất phụ",
      roomId: 2,
      roomName: "Phòng sản xuất B",
      status: "stopped",
      efficiency: 60,
      targetOutput: 600,
      actualOutput: 360,
      lineCount: 3,
      operatingHours: 8,
      maintenanceStatus: "warning",
      lastMaintenance: "2024-01-05T00:00:00Z",
      nextMaintenance: "2024-02-05T00:00:00Z",
      supervisor: "Phạm Thị Hoa",
      shift: "Ca 3",
      createdDate: "2024-01-01T00:00:00Z",
      lines: [
        { id: 10, name: "Dây chuyền phụ 1", status: "stopped", efficiency: 70 },
        { id: 11, name: "Dây chuyền phụ 2", status: "running", efficiency: 65 },
        { id: 12, name: "Dây chuyền phụ 3", status: "stopped", efficiency: 45 },
      ],
    },
  ];

  useEffect(() => {
    loadLineGroups();
    loadRooms();
  }, []);

  const loadLineGroups = async () => {
    setLoading(true);
    try {
      // API call would go here
      setTimeout(() => {
        setLineGroups(mockLineGroups);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading line groups:", error);
      message.error("Không thể tải danh sách nhóm dây chuyền");
      setLineGroups(mockLineGroups);
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      // API call would go here
      setRooms(mockRooms);
    } catch (error) {
      console.error("Error loading rooms:", error);
      message.error("Không thể tải danh sách phòng ban");
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
      stopped: "Dừng hoạt động",
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

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return "#52c41a";
    if (efficiency >= 70) return "#faad14";
    if (efficiency >= 50) return "#ff7a45";
    return "#ff4d4f";
  };

  const handleAction = (action, lineGroup) => {
    switch (action) {
      case "view":
        setViewingLineGroup(lineGroup);
        setIsViewModalVisible(true);
        break;
      case "edit":
        setEditingLineGroup(lineGroup);
        form.setFieldsValue({
          ...lineGroup,
          createdDate: lineGroup.createdDate
            ? dayjs(lineGroup.createdDate)
            : null,
        });
        setIsModalVisible(true);
        break;
      case "delete":
        message.success("Đã xóa nhóm dây chuyền thành công");
        break;
      case "start":
        message.success("Đã khởi động nhóm dây chuyền");
        break;
      case "stop":
        message.success("Đã dừng nhóm dây chuyền");
        break;
      case "maintenance":
        message.success("Đã chuyển sang chế độ bảo trì");
        break;
      default:
        break;
    }
  };

  const actionMenuItems = (lineGroup) => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "Xem chi tiết",
      onClick: () => handleAction("view", lineGroup),
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Chỉnh sửa",
      onClick: () => handleAction("edit", lineGroup),
    },
    {
      type: "divider",
    },
    {
      key: "start",
      icon: <PlayCircleOutlined />,
      label: "Khởi động",
      disabled: lineGroup.status === "active",
      onClick: () => handleAction("start", lineGroup),
    },
    {
      key: "stop",
      icon: <StopOutlined />,
      label: "Dừng hoạt động",
      disabled: lineGroup.status === "stopped",
      onClick: () => handleAction("stop", lineGroup),
    },
    {
      key: "maintenance",
      icon: <ToolOutlined />,
      label: "Bảo trì",
      onClick: () => handleAction("maintenance", lineGroup),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Xóa",
      danger: true,
      onClick: () => handleAction("delete", lineGroup),
    },
  ];

  const columns = [
    {
      title: "Nhóm dây chuyền",
      key: "lineGroup",
      width: 280,
      render: (_, record) => (
        <Space>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #334766 0%, #283652 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "16px",
            }}
          >
            <GroupOutlined />
          </div>
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>
              {record.groupLineName}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              <EnvironmentOutlined style={{ marginRight: "4px" }} />
              {record.roomName}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              {record.lineCount} dây chuyền • {record.operatingHours}h hoạt động
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
      key: "efficiency",
      width: 150,
      render: (_, record) => (
        <div>
          <Progress
            percent={record.efficiency}
            size="small"
            strokeColor={getEfficiencyColor(record.efficiency)}
            format={(percent) => `${percent}%`}
          />
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
            {record.actualOutput}/{record.targetOutput} sản phẩm
          </div>
        </div>
      ),
    },
    {
      title: "Quản lý",
      key: "supervisor",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "500" }}>
            <TeamOutlined style={{ marginRight: "4px", color: "#334766" }} />
            {record.supervisor}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            {record.shift}
          </div>
        </div>
      ),
    },
    {
      title: "Dây chuyền",
      key: "lines",
      width: 120,
      align: "center",
      render: (_, record) => (
        <div>
          <Badge
            count={record.lineCount}
            showZero
            style={{ backgroundColor: "#334766" }}
          />
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
            {record.lines.filter((l) => l.status === "running").length} hoạt
            động
          </div>
        </div>
      ),
    },
    {
      title: "Bảo trì tiếp theo",
      key: "nextMaintenance",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: "500" }}>
            {dayjs(record.nextMaintenance).format("DD/MM/YYYY")}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            {dayjs(record.nextMaintenance).fromNow()}
          </div>
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

  const filteredLineGroups = lineGroups.filter((group) => {
    const matchesSearch =
      group.groupLineName.toLowerCase().includes(searchText.toLowerCase()) ||
      group.roomName.toLowerCase().includes(searchText.toLowerCase()) ||
      group.supervisor.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      filters.status === "all" || group.status === filters.status;
    const matchesRoom =
      filters.room === "all" || group.roomId.toString() === filters.room;
    const matchesEfficiency =
      filters.efficiency === "all" ||
      (filters.efficiency === "high" && group.efficiency >= 80) ||
      (filters.efficiency === "medium" &&
        group.efficiency >= 60 &&
        group.efficiency < 80) ||
      (filters.efficiency === "low" && group.efficiency < 60);

    return matchesSearch && matchesStatus && matchesRoom && matchesEfficiency;
  });

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);

      if (editingLineGroup) {
        message.success("Cập nhật nhóm dây chuyền thành công!");
      } else {
        message.success("Tạo nhóm dây chuyền mới thành công!");
      }

      setIsModalVisible(false);
      setEditingLineGroup(null);
      form.resetFields();
      loadLineGroups();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingLineGroup(null);
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
              title="Tổng nhóm dây chuyền"
              value={lineGroups.length}
              prefix={<GroupOutlined style={{ color: "#334766" }} />}
              valueStyle={{ color: "#334766" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={lineGroups.filter((g) => g.status === "active").length}
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
                lineGroups.reduce((sum, g) => sum + g.efficiency, 0) /
                  lineGroups.length
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
              title="Tổng dây chuyền"
              value={lineGroups.reduce((sum, g) => sum + g.lineCount, 0)}
              prefix={<LineChartOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={cardStyle}>
        <div style={{ marginBottom: "24px" }}>
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>
            <GroupOutlined style={{ marginRight: "8px", color: "#334766" }} />
            Quản lý nhóm dây chuyền
          </Title>
          <Text type="secondary">
            Quản lý và giám sát các nhóm dây chuyền sản xuất
          </Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={8} md={6}>
            <Input.Group compact>
              <Input
                placeholder="Tìm kiếm nhóm dây chuyền..."
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
              <Option value="stopped">Dừng hoạt động</Option>
              <Option value="idle">Chờ</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              value={filters.room}
              onChange={(value) => setFilters({ ...filters, room: value })}
              style={{ width: "100%" }}
              placeholder="Phòng"
              size="large"
            >
              <Option value="all">Tất cả phòng</Option>
              {rooms.map((room) => (
                <Option key={room.id} value={room.id.toString()}>
                  {room.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              value={filters.efficiency}
              onChange={(value) =>
                setFilters({ ...filters, efficiency: value })
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
                  setEditingLineGroup(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                style={{ backgroundColor: "#334766", borderColor: "#334766" }}
              >
                Thêm nhóm dây chuyền
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadLineGroups}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredLineGroups}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredLineGroups.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nhóm dây chuyền`,
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          scroll={{ x: 1400 }}
          className="linegroup-management-table"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          editingLineGroup
            ? "Chỉnh sửa nhóm dây chuyền"
            : "Thêm nhóm dây chuyền mới"
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText={editingLineGroup ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        okButtonProps={{
          style: { backgroundColor: "#334766", borderColor: "#334766" },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="groupLineName"
                label="Tên nhóm dây chuyền"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên nhóm dây chuyền",
                  },
                ]}
              >
                <Input placeholder="Nhập tên nhóm dây chuyền" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roomId"
                label="Phòng"
                rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
              >
                <Select placeholder="Chọn phòng">
                  {rooms.map((room) => (
                    <Option key={room.id} value={room.id}>
                      {room.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="supervisor"
                label="Người quản lý"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên người quản lý",
                  },
                ]}
              >
                <Input placeholder="Nhập tên người quản lý" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="shift"
                label="Ca làm việc"
                rules={[
                  { required: true, message: "Vui lòng chọn ca làm việc" },
                ]}
              >
                <Select placeholder="Chọn ca làm việc">
                  <Option value="Ca 1">Ca 1 (06:00 - 14:00)</Option>
                  <Option value="Ca 2">Ca 2 (14:00 - 22:00)</Option>
                  <Option value="Ca 3">Ca 3 (22:00 - 06:00)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
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
                name="operatingHours"
                label="Giờ hoạt động/ngày"
                rules={[
                  { required: true, message: "Vui lòng nhập giờ hoạt động" },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập giờ hoạt động"
                  max={24}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
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
                  <Option value="stopped">Dừng hoạt động</Option>
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
            <GroupOutlined />
            Chi tiết nhóm dây chuyền: {viewingLineGroup?.groupLineName}
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
              handleAction("edit", viewingLineGroup);
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
        {viewingLineGroup && (
          <div>
            <Row gutter={[24, 16]} style={{ marginBottom: "24px" }}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Hiệu suất"
                    value={viewingLineGroup.efficiency}
                    suffix="%"
                    valueStyle={{
                      color: getEfficiencyColor(viewingLineGroup.efficiency),
                      fontSize: "24px",
                    }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Sản lượng hôm nay"
                    value={viewingLineGroup.actualOutput}
                    suffix={`/ ${viewingLineGroup.targetOutput}`}
                    valueStyle={{ fontSize: "20px" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Giờ hoạt động"
                    value={viewingLineGroup.operatingHours}
                    suffix="h"
                    valueStyle={{ fontSize: "20px" }}
                  />
                </Card>
              </Col>
            </Row>

            <Descriptions column={2} bordered style={{ marginBottom: "24px" }}>
              <Descriptions.Item label="Tên nhóm dây chuyền">
                {viewingLineGroup.groupLineName}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng">
                <Space>
                  <EnvironmentOutlined style={{ color: "#334766" }} />
                  {viewingLineGroup.roomName}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Người quản lý">
                <Space>
                  <TeamOutlined style={{ color: "#334766" }} />
                  {viewingLineGroup.supervisor}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ca làm việc">
                {viewingLineGroup.shift}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Space>
                  {getStatusIcon(viewingLineGroup.status)}
                  <Tag color={getStatusColor(viewingLineGroup.status)}>
                    {getStatusText(viewingLineGroup.status)}
                  </Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng bảo trì">
                <Tag
                  color={getMaintenanceStatusColor(
                    viewingLineGroup.maintenanceStatus
                  )}
                >
                  {getMaintenanceStatusText(viewingLineGroup.maintenanceStatus)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Bảo trì cuối">
                {dayjs(viewingLineGroup.lastMaintenance).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Bảo trì tiếp theo">
                {dayjs(viewingLineGroup.nextMaintenance).format("DD/MM/YYYY")}
              </Descriptions.Item>
            </Descriptions>

            <Card
              title={
                <span>
                  <LineChartOutlined
                    style={{ marginRight: "8px", color: "#334766" }}
                  />
                  Danh sách dây chuyền ({viewingLineGroup.lines?.length || 0})
                </span>
              }
              size="small"
            >
              <List
                dataSource={viewingLineGroup.lines || []}
                renderItem={(line) => (
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
                          <span>{line.name}</span>
                          {getStatusIcon(line.status)}
                          <Tag color={getStatusColor(line.status)} size="small">
                            {getStatusText(line.status)}
                          </Tag>
                        </Space>
                      }
                      description={
                        line.status === "running" ? (
                          <Progress
                            percent={line.efficiency}
                            size="small"
                            strokeColor={getEfficiencyColor(line.efficiency)}
                            format={(percent) => `${percent}% hiệu suất`}
                          />
                        ) : (
                          <Text type="secondary">Không hoạt động</Text>
                        )
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

export default LineGroupManagement;
