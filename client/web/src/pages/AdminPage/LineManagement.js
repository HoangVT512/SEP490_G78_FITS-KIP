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
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import { lineService } from "../../services/lineService";
import { departmentService } from "../../services/departmentService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

// Enable relative time plugin and Vietnamese locale
dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const LineManagement = ({ showHeader = true }) => {
  const [lines, setLines] = useState([]);
  const [departments, setDepartments] = useState([]); // Changed from rooms to departments
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [viewingLine, setViewingLine] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    status: "all",
    department: "all",
  });

  const [showArchive, setShowArchive] = useState(() => {
    // Persist archive view state in localStorage
    const saved = localStorage.getItem("lineArchiveView");
    return saved ? saved === "true" : false;
  });

  // Archive icon component
  function ArchiveIcon() {
    return (
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}>
        <rect x="3" y="7" width="18" height="13" rx="2" stroke="#334766" strokeWidth="2" />
        <rect x="2" y="3" width="20" height="4" rx="1" stroke="#334766" strokeWidth="2" />
        <path d="M9 12h6" stroke="#334766" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  useEffect(() => {
    loadLines();
    loadDepartments();
  }, []);

  // Persist archive view state on change
  useEffect(() => {
    localStorage.setItem("lineArchiveView", showArchive ? "true" : "false");
  }, [showArchive]);

  const loadLines = async () => {
    setLoading(true);
    try {
      const response = await lineService.getLines();
      if (response.success) {
        setLines(response.data || []); // Ensure data is array
      } else {
        message.error(response.message || "Không thể tải danh sách dây chuyền");
        setLines([]); // Set empty array on error
      }
    } catch (error) {
      console.error("Error loading lines:", error);
      message.error("Không thể tải danh sách dây chuyền");
      setLines([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getDepartments();
      // DepartmentsController trả về trực tiếp array, không có success/data wrapper
      if (Array.isArray(response)) {
        setDepartments(response);
      } else if (response.success && Array.isArray(response.data)) {
        setDepartments(response.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
      message.error("Không thể tải danh sách phòng ban");
      setDepartments([]);
    }
  };

  const handleAction = async (action, line) => {
    switch (action) {
      case "view":
        setViewingLine(line);
        setIsViewModalVisible(true);
        break;
      case "edit":
        setEditingLine(line);
        form.setFieldsValue({
          lineName: line.lineName,
          departmentId: line.departmentId,
          isActive: line.isActive,
        });
        setIsModalVisible(true);
        break;
      case "toggle-status":
        Modal.confirm({
          title: line.isActive
            ? "Xác nhận khóa dây chuyền"
            : "Xác nhận mở khóa dây chuyền",
          content: (
            <div>
              <p>
                <strong>Tên dây chuyền:</strong> {line.lineName}
              </p>
              <p>
                <strong>Phòng ban:</strong>{" "}
                {line.department?.departmentName || "Chưa phân phòng"}
              </p>
              <p>
                <strong>Trạng thái hiện tại:</strong>{" "}
                {line.isActive ? "Hoạt động" : "Dừng hoạt động"}
              </p>
              <p
                style={{
                  color: line.isActive ? "#ff4d4f" : "#52c41a",
                  marginTop: "16px",
                }}
              >
                {line.isActive ? (
                  <LockOutlined style={{ marginRight: "8px" }} />
                ) : (
                  <UnlockOutlined style={{ marginRight: "8px" }} />
                )}
                Bạn có chắc chắn muốn {line.isActive ? "khóa" : "mở khóa"} dây
                chuyền này không?
              </p>
            </div>
          ),
          okText: line.isActive ? "Khóa" : "Mở khóa",
          cancelText: "Hủy",
          okButtonProps: { danger: line.isActive },
          onOk: async () => {
            try {
              const response = await lineService.toggleLineStatus(line.lineId);
              if (response.success) {
                message.success(
                  `Đã ${line.isActive ? "khóa" : "mở khóa"
                  } dây chuyền thành công`
                );
                loadLines();
              } else {
                message.error(
                  response.message || "Thay đổi trạng thái dây chuyền thất bại"
                );
              }
            } catch (error) {
              console.error("Toggle line status error:", error);
              message.error("Thay đổi trạng thái dây chuyền thất bại");
            }
          },
        });
        break;
      default:
        break;
    }
  };

  const actionMenuItems = (line) => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "Xem chi tiết",
      onClick: () => handleAction("view", line),
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Chỉnh sửa",
      onClick: () => handleAction("edit", line),
    },
    {
      type: "divider",
    },
    {
      key: "toggle-status",
      icon: line.isActive ? <LockOutlined /> : <UnlockOutlined />,
      label: line.isActive ? "Khóa dây chuyền" : "Mở khóa dây chuyền",
      onClick: () => handleAction("toggle-status", line),
    },
  ];

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingLine) {
        // Update existing line
        try {
          const response = await lineService.updateLine(
            editingLine.lineId,
            values
          );
          if (response.success) {
            message.success("Cập nhật dây chuyền thành công!");
            setIsModalVisible(false);
            setEditingLine(null);
            form.resetFields();
            loadLines(); // Reload data
          } else {
            message.error(response.message || "Cập nhật dây chuyền thất bại");
          }
        } catch (error) {
          console.error("Update line error:", error);
          if (
            error.message &&
            error.message.includes("đã tồn tại trong phòng ban")
          ) {
            message.error(`Tên dây chuyền đã tồn tại trong phòng ban này`);
          } else {
            message.error("Cập nhật dây chuyền thất bại");
          }
        }
      } else {
        // Create new line
        try {
          const response = await lineService.createLine(values);
          if (response.success) {
            message.success("Tạo dây chuyền mới thành công!");
            setIsModalVisible(false);
            form.resetFields();
            loadLines(); // Reload data
          } else {
            message.error(response.message || "Tạo dây chuyền thất bại");
          }
        } catch (error) {
          console.error("Create line error:", error);
          if (
            error.message &&
            error.message.includes("đã tồn tại trong phòng ban")
          ) {
            message.error(`Tên dây chuyền đã tồn tại trong phòng ban này`);
          } else {
            message.error("Tạo dây chuyền thất bại");
          }
        }
      }
    } catch (error) {
      console.error("Form validation error:", error);
      message.error("Vui lòng kiểm tra lại thông tin nhập vào");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingLine(null);
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

  const columns = [
    {
      title: "Dây chuyền",
      key: "line",
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
              {record.lineName}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              <EnvironmentOutlined style={{ marginRight: "4px" }} />
              {record.department?.departmentName || "Chưa phân phòng"}
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
        <Tag color={record.isActive ? "success" : "error"}>
          {record.isActive ? "Hoạt động" : "Dừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Phòng ban",
      key: "department",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "500" }}>
            <TeamOutlined style={{ marginRight: "4px", color: "#334766" }} />
            {record.department?.departmentName || "Chưa phân phòng"}
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

  const filteredLines = lines.filter((line) => {
    const matchesSearch =
      line.lineName?.toLowerCase().includes(searchText.toLowerCase()) ||
      line.department?.departmentName
        ?.toLowerCase()
        .includes(searchText.toLowerCase());

    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "active" && line.isActive) ||
      (filters.status === "inactive" && !line.isActive);

    const matchesDepartment =
      filters.department === "all" ||
      line.departmentId?.toString() === filters.department;

    // Archive filter: only show inactive lines in archive, hide them in main list
    if (showArchive) {
      return matchesSearch && matchesDepartment && !line.isActive;
    } else {
      return matchesSearch && matchesStatus && matchesDepartment && line.isActive;
    }
  });

  const content = (
    <div style={contentStyle}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng dây chuyền"
              value={lines.length}
              prefix={<GroupOutlined style={{ color: "#334766" }} />}
              valueStyle={{ color: "#334766" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={lines.filter((g) => g.isActive).length}
              prefix={<PlayCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Hiệu suất trung bình"
              value={
                lines.length > 0
                  ? Math.round(
                    lines.reduce((sum, g) => sum + (g.efficiency || 0), 0) /
                    lines.length
                  )
                  : 0
              }
              suffix="%"
              prefix={<ThunderboltOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng thiết bị"
              value={lines.reduce((sum, g) => sum + (g.equipmentCount || 0), 0)}
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
            Quản lý dây chuyền
          </Title>
          <Text type="secondary">
            Quản lý và giám sát các dây chuyền sản xuất
          </Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={8} md={6}>
            <Input.Group compact>
              <Input
                placeholder="Tìm kiếm dây chuyền..."
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
              <Option value="inactive">Dừng hoạt động</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              value={filters.department}
              onChange={(value) =>
                setFilters({ ...filters, department: value })
              }
              style={{ width: "100%" }}
              placeholder="Phòng"
              size="large"
            >
              <Option value="all">Tất cả phòng ban</Option>
              {departments.map((department) => (
                <Option
                  key={department.departmentId}
                  value={department.departmentId.toString()}
                >
                  {department.departmentName}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingLine(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                style={{ backgroundColor: "#334766", borderColor: "#334766" }}
              >
                Thêm dây chuyền
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadLines}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col>
            <Space>
               <Button
                type={showArchive ? "default" : "dashed"}
                icon={<ArchiveIcon />}
                onClick={() => setShowArchive(!showArchive)}
              >
                {showArchive ? "Hiển thị tất cả" : "Lưu trữ (Ngừng hoạt động)"}
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredLines}
          rowKey="lineId"
          loading={loading}
          pagination={{
            total: filteredLines.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} dây chuyền`,
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          scroll={{ x: 1400 }}
          className="linegroup-management-table"
          locale={{
            emptyText: (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <GroupOutlined
                  style={{
                    fontSize: "48px",
                    color: "#d9d9d9",
                    marginBottom: "16px",
                  }}
                />
                <div
                  style={{
                    fontSize: "16px",
                    color: "#595959",
                    marginBottom: "8px",
                  }}
                >
                  Chưa có dây chuyền nào
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#8c8c8c",
                    marginBottom: "16px",
                  }}
                >
                  Hãy thêm dây chuyền đầu tiên để bắt đầu quản lý sản xuất
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingLine(null);
                    form.resetFields();
                    setIsModalVisible(true);
                  }}
                  style={{ backgroundColor: "#334766", borderColor: "#334766" }}
                >
                  Thêm dây chuyền đầu tiên
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingLine ? "Chỉnh sửa dây chuyền" : "Thêm dây chuyền mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={1000}
        okText={editingLine ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        okButtonProps={{
          style: {
            backgroundColor: "#334766",
            borderColor: "#334766",
            width: 100,
          },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lineName"
                label="Tên dây chuyền"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên dây chuyền",
                  },
                ]}
              >
                <Input placeholder="Nhập tên dây chuyền" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="departmentId"
                label="Phòng ban"
                rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
              >
                <Select
                  placeholder="Chọn phòng ban"
                  loading={departments.length === 0}
                  notFoundContent={
                    departments.length === 0
                      ? "Đang tải..."
                      : "Không có phòng ban nào"
                  }
                >
                  {departments.map((department) => (
                    <Option
                      key={department.departmentId}
                      value={department.departmentId}
                    >
                      {department.departmentName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value={true}>Hoạt động</Option>
                  <Option value={false}>Dừng hoạt động</Option>
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
            Chi tiết dây chuyền: {viewingLine?.lineName}
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
              handleAction("edit", viewingLine);
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
        {viewingLine && (
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: "24px" }}>
              <Descriptions.Item label="Tên dây chuyền">
                {viewingLine.lineName}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng ban">
                <Space>
                  <EnvironmentOutlined style={{ color: "#334766" }} />
                  {viewingLine.department?.departmentName || "Chưa phân phòng"}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={viewingLine.isActive ? "success" : "error"}>
                  {viewingLine.isActive ? "Hoạt động" : "Dừng hoạt động"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số giai đoạn">
                <Badge
                  count={viewingLine.stages?.length || 0}
                  showZero
                  style={{ backgroundColor: "#334766" }}
                />
              </Descriptions.Item>
            </Descriptions>

            {/* Stages Section */}
            <Card
              title={
                <span>
                  <SettingOutlined
                    style={{ marginRight: "8px", color: "#334766" }}
                  />
                  Danh sách giai đoạn ({viewingLine.stages?.length || 0})
                </span>
              }
              size="small"
              style={{ marginBottom: "16px" }}
            >
              {viewingLine.stages && viewingLine.stages.length > 0 ? (
                <List
                  dataSource={viewingLine.stages}
                  renderItem={(stage, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{
                              backgroundColor: "#334766",
                              color: "#fff",
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        }
                        title={
                          <Space>
                            <span style={{ fontWeight: "600" }}>
                              {stage.stageName}
                            </span>
                            <Tag color="blue" size="small">
                              Giai đoạn {index + 1}
                            </Tag>
                            <Tag
                              color={stage.isActive ? "success" : "error"}
                              size="small"
                            >
                              {stage.isActive ? "Hoạt động" : "Dừng hoạt động"}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <Typography.Text type="secondary">
                              ID: {stage.stageId} • Thuộc dây chuyền:{" "}
                              {viewingLine.lineName}
                            </Typography.Text>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: "12px" }}
                            >
                              Trạng thái:{" "}
                              {stage.isActive ? "Hoạt động" : "Dừng hoạt động"}
                            </Typography.Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#8c8c8c",
                  }}
                >
                  <SettingOutlined
                    style={{ fontSize: "24px", marginBottom: "8px" }}
                  />
                  <div>Chưa có giai đoạn nào trong dây chuyền này</div>
                </div>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );

  return showHeader ? <Layout>{content}</Layout> : content;
};

export default LineManagement;
