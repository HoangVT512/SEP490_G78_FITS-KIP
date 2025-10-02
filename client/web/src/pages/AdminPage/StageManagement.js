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
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import { stageService } from "../../services/stageService";
import { lineService } from "../../services/lineService";

const { Title, Text } = Typography;
const { Option } = Select;

const StageManagement = ({ showHeader = true }) => {
  const [stages, setStages] = useState([]);
  const [lines, setLines] = useState([]);
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

  // Archive icon component
  function ArchiveIcon() {
    return (
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        style={{ verticalAlign: "middle" }}
      >
        <rect
          x="3"
          y="7"
          width="18"
          height="13"
          rx="2"
          stroke="#334766"
          strokeWidth="2"
        />
        <rect
          x="2"
          y="3"
          width="20"
          height="4"
          rx="1"
          stroke="#334766"
          strokeWidth="2"
        />
        <path
          d="M9 12h6"
          stroke="#334766"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  useEffect(() => {
    loadStages();
    loadLines();
  }, []);

  // Persist archive view state on change
  useEffect(() => {
    localStorage.setItem("stageArchiveView", showArchive ? "true" : "false");
  }, [showArchive]);

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

  const handleAction = async (action, stage) => {
    switch (action) {
      case "view":
        setViewingStage(stage);
        setIsViewModalVisible(true);
        break;
      case "edit":
        setEditingStage(stage);
        form.setFieldsValue({
          stageName: stage.stageName,
          lineId: stage.lineId,
          isActive: stage.isActive,
        });
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
                    `${
                      actionText.charAt(0).toUpperCase() + actionText.slice(1)
                    } công đoạn thất bại`
                );
              }
            } catch (error) {
              console.error("Toggle stage status error:", error);
              message.error(
                `${
                  actionText.charAt(0).toUpperCase() + actionText.slice(1)
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

      if (editingStage) {
        // Update existing stage
        try {
          const response = await stageService.updateStage(
            editingStage.stageId,
            values
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
          const response = await stageService.createStage(values);
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
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
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
    {
      title: "Phòng ban",
      key: "department",
      width: 150,
      render: (_, record) => (
        <Tag color="blue">
          {record.line?.department?.departmentName || "Không xác định"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => (
        <Tag color={record.isActive ? "success" : "error"}>
          {record.isActive ? "Hoạt động" : "Dừng hoạt động"}
        </Tag>
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
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng công đoạn"
              value={stages.length}
              prefix={<SettingOutlined style={{ color: "#334766" }} />}
              valueStyle={{ color: "#334766" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Dây chuyền có công đoạn"
              value={new Set(stages.map((s) => s.lineId)).size}
              prefix={<GroupOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Thiết bị"
              value={stages.reduce(
                (sum, s) => sum + (s.equipment?.length || 0),
                0
              )}
              prefix={<ToolOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
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
        </Col>
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
          <Col xs={24} sm={8} md={6}>
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
                <Option key={line.lineId} value={line.lineId.toString()}>
                  {line.lineName}
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
                  setEditingStage(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                style={{ backgroundColor: "#334766", borderColor: "#334766" }}
              >
                Thêm công đoạn
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadStages}>
                Làm mới
              </Button>
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
        width={800}
        okText={editingStage ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        okButtonProps={{
          style: { backgroundColor: "#1890ff", borderColor: "#1890ff" },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stageName"
                label="Tên công đoạn"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên công đoạn",
                  },
                ]}
              >
                <Input placeholder="Nhập tên công đoạn" />
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
                <Select
                  placeholder="Chọn dây chuyền"
                  loading={lines.length === 0}
                  notFoundContent={
                    lines.length === 0
                      ? "Đang tải..."
                      : "Không có dây chuyền nào"
                  }
                >
                  {lines.map((line) => (
                    <Option key={line.lineId} value={line.lineId}>
                      {line.lineName} (
                      {line.department?.departmentName || "Không xác định"})
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
                label="Trạng thái hoạt động"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Dừng hoạt động"
                  defaultChecked={true}
                />
              </Form.Item>
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
        footer={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setIsViewModalVisible(false);
              handleAction("edit", viewingStage);
            }}
            style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
          >
            Chỉnh sửa
          </Button>,
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {viewingStage && (
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: "24px" }}>
              <Descriptions.Item label="Tên công đoạn">
                {viewingStage.stageName}
              </Descriptions.Item>
              <Descriptions.Item label="Dây chuyền">
                <Space>
                  <GroupOutlined style={{ color: "#1890ff" }} />
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
                  count={viewingStage.equipment?.length || 0}
                  showZero
                  style={{ backgroundColor: "#1890ff" }}
                />
              </Descriptions.Item>
            </Descriptions>

            {/* Equipment Section */}
            <Card
              title={
                <span>
                  <ToolOutlined
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Danh sách thiết bị ({viewingStage.equipment?.length || 0})
                </span>
              }
              size="small"
            >
              {viewingStage.equipment && viewingStage.equipment.length > 0 ? (
                <List
                  dataSource={viewingStage.equipment}
                  renderItem={(equipment) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{
                              backgroundColor: "#1890ff",
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
