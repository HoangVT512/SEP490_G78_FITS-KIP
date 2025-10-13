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
  message,
  Descriptions,
  List,
  Avatar,
  Statistic,
  Switch,
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
  GroupOutlined,
  ToolOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  LineChartOutlined,
  LockOutlined,
  UnlockOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { ArchiveIcon } from "../../assets/icons";
import Layout from "../../components/Layout/Layout";
import { stageService } from "../../services/stageService";
import { lineService } from "../../services/lineService";
import { departmentService } from "../../services/departmentService";
import { equipmentService } from "../../services/equipmentService";

const { Title, Text } = Typography;
const { Option } = Select;

const StageManagement = ({ showHeader = true }) => {
  const [stages, setStages] = useState([]);
  const [lines, setLines] = useState([]);
  const [lineActive, setLineActive] = useState([]);
  const [filteredLines, setFilteredLines] = useState([]);
  const [filteredActiveLines, setFilteredActiveLines] = useState([]);
  const [departmentActive, setDepartmentActive] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [equipmentByStage, setEquipmentByStage] = useState([]);
  const [equipments, setEquipments] = useState([]); // Added for equipment count calculation
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [viewingStage, setViewingStage] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    line: "all",
  });

  const [showArchive, setShowArchive] = useState(() => {
    // Persist archive view state in localStorage
    const saved = localStorage.getItem("stageArchiveView");
    return saved ? saved === "true" : false;
  });

  useEffect(() => {
    loadStages();
    loadLines();
    loadLineActive();
    loadDepartmentActive();
    loadEquipments(); // Added to load equipments for count calculation
  }, []);

  // Persist archive view state on change
  useEffect(() => {
    localStorage.setItem("stageArchiveView", showArchive ? "true" : "false");
  }, [showArchive]);

  // Filter active lines based on selected department in form
  useEffect(() => {
    if (selectedDepartmentId) {
      setFilteredActiveLines(
        lineActive.filter((line) => line.departmentId === selectedDepartmentId)
      );
    } else {
      setFilteredActiveLines(lineActive);
    }
  }, [lineActive, selectedDepartmentId]);

  const loadStages = async () => {
    setLoading(true);
    try {
      const response = await stageService.getStages();
      if (response.success) {
        setStages(response.data || []);
      } else {
        message.error(response.message || "Không thể tải danh sách công đoạn");
        setStages([]);
      }
    } catch (error) {
      console.error("Error loading stages:", error);
      message.error("Không thể tải danh sách công đoạn");
      setStages([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLines = async () => {
    try {
      const response = await lineService.getLines();
      console.log("Lines response:", response); // Debug log

      // Handle different response formats from API
      if (Array.isArray(response)) {
        setLines(response);
      } else if (response && response.success && Array.isArray(response.data)) {
        setLines(response.data);
      } else if (response && response.data) {
        setLines(Array.isArray(response.data) ? response.data : []);
      } else {
        console.warn("Unexpected lines response format:", response);
        setLines([]);
      }
    } catch (error) {
      console.error("Error loading lines:", error);
      message.error("Không thể tải danh sách dây chuyền");
      setLines([]);
    }
  };

  const loadLineActive = async () => {
    try {
      const response = await lineService.getActiveLines();
      if (Array.isArray(response)) {
        setLineActive(response);
      } else {
        console.warn("Unexpected active lines response format:", response);
        setLineActive([]);
      }
    } catch (error) {
      console.error("Error loading active lines:", error);
      message.error("Không thể tải danh sách dây chuyền hoạt động");
      setLineActive([]);
    }
  };

  const loadDepartmentActive = async () => {
    try {
      const response = await departmentService.getActiveDepartments();
      if (Array.isArray(response)) {
        setDepartmentActive(response);
      } else {
        console.warn(
          "Unexpected active departments response format:",
          response
        );
        setDepartmentActive([]);
      }
    } catch (error) {
      console.error("Error loading active departments:", error);
      message.error("Không thể tải danh sách phòng ban hoạt động");
      setDepartmentActive([]);
    }
  };

  const loadEquipments = async () => {
    try {
      const response = await equipmentService.getEquipments();
      if (Array.isArray(response)) {
        setEquipments(response);
      } else if (response.success && Array.isArray(response.data)) {
        setEquipments(response.data);
      } else {
        setEquipments([]);
      }
    } catch (error) {
      console.error("Error loading equipments:", error);
      setEquipments([]);
    }
  };

  const loadEquipmentByStage = async (stageId) => {
    try {
      const response = await equipmentService.getEquipmentsByStage(stageId);
      setEquipmentByStage(response.data || []);
    } catch (error) {
      console.error("Error loading equipment by stage:", error);
      message.error("Không thể tải danh sách thiết bị theo công đoạn");
      setEquipmentByStage([]);
    }
  };

  const handleAction = async (action, stage) => {
    switch (action) {
      case "view":
        setViewingStage(stage);
        // Load equipment for this stage
        await loadEquipmentByStage(stage.stageId);
        setIsViewModalVisible(true);
        break;
      case "edit":
        setEditingStage(stage);
        const departmentId = stage.line?.departmentId;
        form.setFieldsValue({
          stageName: stage.stageName,
          departmentId: departmentId,
          lineId: stage.lineId,
          isActive: stage.isActive,
        });
        setSelectedDepartmentId(departmentId);
        setIsModalVisible(true);
        break;
      case "toggle-status":
        const actionText = stage.isActive ? "khóa" : "mở khóa";
        Modal.confirm({
          title: `Xác nhận ${actionText} công đoạn`,
          content: (
            <div>
              <p>
                <strong>Tên công đoạn:</strong> {stage.stageName}
              </p>
              <p>
                <strong>Dây chuyền:</strong>{" "}
                {stage.line?.lineName || "Không xác định"}
              </p>
              <p>
                <strong>Phòng ban:</strong>{" "}
                {stage.line?.department?.departmentName || "Không xác định"}
              </p>
              <p>
                <strong>Trạng thái hiện tại:</strong>{" "}
                {stage.isActive ? "Hoạt động" : "Đã khóa"}
              </p>
              <p style={{ color: "#1890ff", marginTop: "16px" }}>
                <ExclamationCircleOutlined style={{ marginRight: "8px" }} />
                Bạn có chắc chắn muốn {actionText} công đoạn này không?
              </p>
            </div>
          ),
          okText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          cancelText: "Hủy",
          okButtonProps: { type: "primary" },
          onOk: async () => {
            try {
              const response = await stageService.toggleStageStatus(
                stage.stageId
              );
              if (response.success) {
                message.success(
                  response.message || `Đã ${actionText} công đoạn thành công`
                );
                loadStages();
              } else {
                message.error(
                  response.message ||
                  `${actionText.charAt(0).toUpperCase() + actionText.slice(1)
                  } công đoạn thất bại`
                );
              }
            } catch (error) {
              console.error("Toggle stage status error:", error);
              message.error(
                `${actionText.charAt(0).toUpperCase() + actionText.slice(1)
                } công đoạn thất bại`
              );
            }
          },
        });
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
      key: "toggle-status",
      icon: stage.isActive ? <LockOutlined /> : <UnlockOutlined />,
      label: stage.isActive ? "Khóa công đoạn" : "Mở khóa công đoạn",
      danger: stage.isActive,
      onClick: () => handleAction("toggle-status", stage),
    },
  ];

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // Remove departmentId from API payload since it's not needed (lineId contains department info)
      const { departmentId, ...apiValues } = values;

      if (editingStage) {
        // Update existing stage
        try {
          const response = await stageService.updateStage(
            editingStage.stageId,
            apiValues
          );
          if (response.success) {
            message.success("Cập nhật công đoạn thành công!");
            setIsModalVisible(false);
            setEditingStage(null);
            form.resetFields();
            loadStages();
          } else {
            message.error(response.message || "Cập nhật công đoạn thất bại");
          }
        } catch (error) {
          console.error("Update stage error:", error);
          // Hiển thị thông báo lỗi chi tiết từ API
          message.error(error.message || "Cập nhật công đoạn thất bại");
        }
      } else {
        // Create new stage
        try {
          const response = await stageService.createStage(apiValues);
          if (response.success) {
            message.success("Tạo công đoạn mới thành công!");
            setIsModalVisible(false);
            form.resetFields();
            loadStages();
          } else {
            message.error(response.message || "Tạo công đoạn thất bại");
          }
        } catch (error) {
          console.error("Create stage error:", error);
          // Hiển thị thông báo lỗi chi tiết từ API
          message.error(error.message || "Tạo công đoạn thất bại");
        }
      }
    } catch (error) {
      console.error("Form validation error:", error);
      message.error("Vui lòng kiểm tra lại thông tin nhập vào");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingStage(null);
    setSelectedDepartmentId(null);
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
      title: "Công đoạn",
      key: "stage",
      width: 280,
      render: (_, record) => (
        <Space>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #4c566aff 0%, #283652 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "16px",
            }}
          >
            <SettingOutlined />
          </div>
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>
              {record.stageName}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              <GroupOutlined style={{ marginRight: "4px" }} />
              {record.line?.lineName || "Chưa phân dây chuyền"}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Dây chuyền",
      key: "line",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "500" }}>
            {record.line?.lineName || "Chưa phân dây chuyền"}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            <EnvironmentOutlined style={{ marginRight: "4px" }} />
            {record.line?.department?.departmentName || "Không xác định"}
          </div>
        </div>
      ),
    },
    // {
    //   title: "Phòng ban",
    //   key: "department",
    //   width: 150,
    //   render: (_, record) => (
    //     <div>
    //       <div style={{ fontWeight: "500" }}>
    //         <TeamOutlined style={{ marginRight: "4px", color: "#334766" }} />
    //         {record.line.department?.departmentName || "Chưa phân phòng"}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: "Số thiết bị",
      key: "equipmentCount",
      width: 120,
      align: "center",
      render: (_, record) => {
        const equipmentCount = equipments.filter(equipment => equipment.stageId === record.stageId).length;
        return (
          <Badge
            count={equipmentCount}
            showZero
            style={{ backgroundColor: "#52c41a" }}
          />
        );
      },
    },
    {
      title: "Trạng thái",
      key: "isActive",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Badge
          status={record.isActive ? "success" : "error"}
          text={record.isActive ? "Hoạt động" : "Ngừng hoạt động"}
        />
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
      stage.stageName?.toLowerCase().includes(searchText.toLowerCase()) ||
      stage.line?.lineName?.toLowerCase().includes(searchText.toLowerCase()) ||
      stage.line?.department?.departmentName
        ?.toLowerCase()
        .includes(searchText.toLowerCase());

    const matchesLine =
      filters.line === "all" || stage.lineId?.toString() === filters.line;

    // Archive filter: only show inactive stages in archive, hide them in main list
    if (showArchive) {
      return matchesSearch && matchesLine && !stage.isActive;
    } else {
      return matchesSearch && matchesLine && stage.isActive;
    }
  });

  const content = (
    <div style={contentStyle}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng công đoạn"
              value={stages.length}
              prefix={<SettingOutlined style={{ color: "#334766" }} />}
              valueStyle={{ color: "#334766" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Dây chuyền có công đoạn"
              value={new Set(stages.map((s) => s.lineId)).size}
              prefix={<GroupOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Thiết bị"
              value={equipmentByStage?.length || 0}
              prefix={<ToolOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        {/* <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Trung bình công đoạn/dây chuyền"
              value={
                lines.length > 0
                  ? (
                    stages.length / new Set(stages.map((s) => s.lineId)).size
                  ).toFixed(1)
                  : 0
              }
              prefix={<LineChartOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col> */}
      </Row>

      <Card style={cardStyle}>
        <div style={{ marginBottom: "24px" }}>
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>
            <SettingOutlined style={{ marginRight: "8px", color: "#334766" }} />
            Quản lý công đoạn
          </Title>
          <Text type="secondary">
            Quản lý các công đoạn sản xuất trong dây chuyền
          </Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={8}>
            <Input.Group compact>
              <Input
                placeholder="Tìm kiếm công đoạn..."
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
          <Col xs={24} sm={6} md={4}>
            <Select
              value={filters.line}
              onChange={(value) => setFilters({ ...filters, line: value })}
              style={{ width: "100%" }}
              placeholder="Dây chuyền"
              size="large"
            >
              <Option value="all">Tất cả dây chuyền</Option>
              {lines.map((line) => (
                <Option key={line.lineId} value={line.lineId.toString()}>
                  {line.lineName}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6} md={12}>
            <Space style={{ float: "right" }}>

              <Button
                type={showArchive ? "primary" : "dashed"}
                icon={showArchive ? <EyeOutlined /> : <ArchiveIcon />}
                onClick={() => setShowArchive(!showArchive)}
                style={
                  showArchive
                    ? { backgroundColor: "#334766", borderColor: "#334766" }
                    : {}
                }
              >
                {showArchive
                  ? "Hiển thị (Hoạt động)"
                  : "Lưu trữ (Ngừng hoạt động)"}
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingStage(null);
                  setSelectedDepartmentId(null);
                  form.resetFields();
                  form.setFieldsValue({ isActive: true });
                  setIsModalVisible(true);
                }}
                style={{ backgroundColor: "#334766", borderColor: "#334766" }}
              >
                Thêm công đoạn
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredStages}
          rowKey="stageId"
          loading={loading}
          pagination={{
            total: filteredStages.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} công đoạn`,
          }}
          scroll={{ x: 1400 }}
          locale={{
            emptyText: (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <SettingOutlined
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
                  Chưa có công đoạn nào
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#8c8c8c",
                    marginBottom: "16px",
                  }}
                >
                  Hãy thêm công đoạn đầu tiên để bắt đầu quản lý
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingStage(null);
                    setSelectedDepartmentId(null);
                    form.resetFields();
                    setIsModalVisible(true);
                  }}
                  style={{ backgroundColor: "#334766", borderColor: "#334766" }}
                >
                  Thêm công đoạn đầu tiên
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingStage ? "Chỉnh sửa công đoạn" : "Thêm công đoạn mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={1400}
        centered
        okText={editingStage ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        okButtonProps={{
          style: {
            backgroundColor: "#334766",
            borderColor: "#334766",
            height: "40px",
            fontSize: "16px",
            fontWeight: "500",
            minWidth: "120px",
          },
        }}
        cancelButtonProps={{
          style: {
            height: "40px",
            fontSize: "16px",
            minWidth: "120px",
          },
        }}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "24px",
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stageName"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Tên công đoạn
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên công đoạn",
                  },
                ]}
              >
                <Input placeholder="Nhập tên công đoạn" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="departmentId"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Phòng ban
                  </span>
                }
                rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
              >
                <Select
                  placeholder="Chọn phòng ban"
                  loading={departmentActive.length === 0}
                  notFoundContent={
                    departmentActive.length === 0
                      ? "Đang tải..."
                      : "Không có phòng ban nào"
                  }
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    setSelectedDepartmentId(value);
                    // Clear line selection when department changes
                    form.setFieldsValue({ lineId: undefined });
                  }}
                  size="large"
                >
                  {departmentActive.map((department) => (
                    <Option
                      key={department.departmentId}
                      value={department.departmentId}
                    >
                      {department.departmentName || "Không xác định"}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lineId"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Dây chuyền
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng chọn dây chuyền" },
                ]}
              >
                <Select
                  placeholder="Chọn dây chuyền"
                  loading={lineActive.length === 0}
                  disabled={!selectedDepartmentId}
                  notFoundContent={
                    !selectedDepartmentId
                      ? "Vui lòng chọn phòng ban trước"
                      : filteredActiveLines.length === 0
                        ? "Không có dây chuyền nào"
                        : "Đang tải..."
                  }
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  size="large"
                >
                  {filteredActiveLines.map((line) => (
                    <Option key={line.lineId} value={line.lineId}>
                      {line.lineName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              {editingStage ? (
                <Form.Item
                  name="isActive"
                  label={
                    <span style={{ fontWeight: "600", fontSize: "14px" }}>
                      Trạng thái hoạt động
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn trạng thái" },
                  ]}
                >
                  <Select placeholder="Chọn trạng thái" size="large" allowClear>
                    <Option value={true}>Hoạt động</Option>
                    <Option value={false}>Dừng hoạt động</Option>
                  </Select>
                </Form.Item>
              ) : (
                <Form.Item
                  label={
                    <span style={{ fontWeight: "600", fontSize: "14px" }}>
                      Trạng thái hoạt động
                    </span>
                  }
                >
                  <Select value={true} disabled showArrow={false} size="large">
                    <Option value={true}>Hoạt động (Mặc định)</Option>
                  </Select>
                </Form.Item>
              )}
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={
          <Space>
            <SettingOutlined />
            Chi tiết công đoạn: {viewingStage?.stageName}
          </Space>
        }
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        width={1200}
        footer={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setIsViewModalVisible(false);
              handleAction("edit", viewingStage);
            }}
            style={{
              backgroundColor: "#334766",
              borderColor: "#334766",
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Chỉnh sửa
          </Button>,
          <Button
            key="close"
            onClick={() => setIsViewModalVisible(false)}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
        ]}
      >
        {viewingStage && (
          <div>
            <Descriptions
              column={2}
              bordered
              style={{ marginBottom: "24px" }}
              labelStyle={{
                fontWeight: "bold",
                fontSize: "14px",
                backgroundColor: "#fafafa",
                borderRight: "1px solid #d9d9d9",
                padding: "12px 16px",
                minWidth: "160px",
              }}
            >
              <Descriptions.Item label="Tên công đoạn">
                {viewingStage.stageName}
              </Descriptions.Item>
              <Descriptions.Item label="Dây chuyền">
                <Space>
                  <GroupOutlined style={{ color: "#283652" }} />
                  {viewingStage.line?.lineName || "Chưa phân dây chuyền"}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Phòng ban">
                <Tag color="blue">
                  {viewingStage.line?.department?.departmentName ||
                    "Không xác định"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số thiết bị">
                <Badge
                  count={equipmentByStage?.length || 0}
                  showZero
                  style={{ backgroundColor: "#283652" }}
                />
              </Descriptions.Item>
            </Descriptions>

            {/* Equipment Section */}
            <Card
              title={
                <span>
                  <ToolOutlined
                    style={{ marginRight: "8px", color: "#283652" }}
                  />
                  Danh sách thiết bị ({equipmentByStage?.length || 0})
                </span>
              }
              size="small"
            >
              {equipmentByStage && equipmentByStage.length > 0 ? (
                <List
                  dataSource={equipmentByStage}
                  renderItem={(equipment) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{
                              backgroundColor: "#283652",
                              color: "#fff",
                            }}
                            icon={<ToolOutlined />}
                          />
                        }
                        title={
                          <Space>
                            <span style={{ fontWeight: "600" }}>
                              {equipment.equipmentName}
                            </span>
                            <Tag
                              color={equipment.isActive ? "success" : "error"}
                              size="small"
                            >
                              {equipment.isActive ? "Hoạt động" : "Dừng"}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Text type="secondary">
                            Mã: {equipment.equipmentCode || "N/A"} • Xuất xứ:{" "}
                            {equipment.origin || "N/A"}
                          </Text>
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
                  <ToolOutlined
                    style={{ fontSize: "24px", marginBottom: "8px" }}
                  />
                  <div>Chưa có thiết bị nào trong công đoạn này</div>
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

export default StageManagement;
