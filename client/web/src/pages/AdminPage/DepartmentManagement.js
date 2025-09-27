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
  DatePicker,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  DownOutlined,
  ReloadOutlined,
  FilterOutlined,
  CalendarOutlined,
  BankOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import dayjs from "dayjs";
import { departmentService } from "../../services/departmentService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const DepartmentManagement = ({ showHeader = true }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [viewingDepartment, setViewingDepartment] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
  });

  // Mock data - replace with API calls
  const mockDepartments = [
    {
      id: 1,
      name: "Phòng Nhân sự",
      code: "HR",
      description: "Quản lý nhân sự và tuyển dụng",
      manager: "Nguyễn Văn A",
      managerEmail: "manager.hr@fitskip.com",
      managerPhone: "0901234567",
      employeeCount: 15,
      location: "Tầng 2, Tòa nhà A",
      status: "active",
      type: "support",
      budget: 500000000,
      createdDate: "2024-01-01T00:00:00Z",
      updatedDate: "2024-01-20T00:00:00Z",
    },
    {
      id: 2,
      name: "Phòng IT",
      code: "IT",
      description: "Phát triển và bảo trì hệ thống thông tin",
      manager: "Trần Thị B",
      managerEmail: "manager.it@fitskip.com",
      managerPhone: "0902345678",
      employeeCount: 25,
      location: "Tầng 3, Tòa nhà B",
      status: "active",
      type: "technical",
      budget: 800000000,
      createdDate: "2024-01-01T00:00:00Z",
      updatedDate: "2024-01-15T00:00:00Z",
    },
    {
      id: 3,
      name: "Phòng Sản xuất",
      code: "PROD",
      description: "Quản lý quy trình sản xuất và chất lượng",
      manager: "Lê Văn C",
      managerEmail: "manager.prod@fitskip.com",
      managerPhone: "0903456789",
      employeeCount: 50,
      location: "Nhà xưởng 1",
      status: "active",
      type: "production",
      budget: 1200000000,
      createdDate: "2024-01-01T00:00:00Z",
      updatedDate: "2024-01-18T00:00:00Z",
    },
    {
      id: 4,
      name: "Phòng Kế toán",
      code: "ACC",
      description: "Quản lý tài chính và kế toán",
      manager: "Phạm Thị D",
      managerEmail: "manager.acc@fitskip.com",
      managerPhone: "0904567890",
      employeeCount: 8,
      location: "Tầng 1, Tòa nhà A",
      status: "active",
      type: "support",
      budget: 300000000,
      createdDate: "2024-01-01T00:00:00Z",
      updatedDate: "2024-01-10T00:00:00Z",
    },
    {
      id: 5,
      name: "Phòng Bảo trì",
      code: "MAINT",
      description: "Bảo trì thiết bị và cơ sở hạ tầng",
      manager: "Hoàng Văn E",
      managerEmail: "manager.maint@fitskip.com",
      managerPhone: "0905678901",
      employeeCount: 12,
      location: "Nhà xưởng 2",
      status: "inactive",
      type: "technical",
      budget: 400000000,
      createdDate: "2024-01-01T00:00:00Z",
      updatedDate: "2024-01-05T00:00:00Z",
    },
  ];

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      // const data = await departmentService.getDepartments();
      // setDepartments(data);

      // Using mock data for now
      setTimeout(() => {
        setDepartments(mockDepartments);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading departments:", error);
      message.error("Không thể tải danh sách phòng ban");
      setDepartments(mockDepartments);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active: "success",
      inactive: "warning",
      suspended: "error",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      active: "Hoạt động",
      inactive: "Tạm ngưng",
      suspended: "Đình chỉ",
    };
    return statusTexts[status] || "Không xác định";
  };

  const getTypeColor = (type) => {
    const typeColors = {
      production: "blue",
      technical: "purple",
      support: "green",
      management: "gold",
    };
    return typeColors[type] || "default";
  };

  const getTypeText = (type) => {
    const typeTexts = {
      production: "Sản xuất",
      technical: "Kỹ thuật",
      support: "Hỗ trợ",
      management: "Quản lý",
    };
    return typeTexts[type] || "Khác";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleAction = (action, department) => {
    switch (action) {
      case "view":
        setViewingDepartment(department);
        setIsViewModalVisible(true);
        break;
      case "edit":
        setEditingDepartment(department);
        form.setFieldsValue({
          ...department,
          createdDate: department.createdDate
            ? dayjs(department.createdDate)
            : null,
        });
        setIsModalVisible(true);
        break;
      case "delete":
        message.success("Đã xóa phòng ban thành công");
        break;
      default:
        break;
    }
  };

  const actionMenuItems = (department) => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "Xem chi tiết",
      onClick: () => handleAction("view", department),
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Chỉnh sửa",
      onClick: () => handleAction("edit", department),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Xóa",
      danger: true,
      onClick: () => handleAction("delete", department),
    },
  ];

  const columns = [
    {
      title: "Phòng ban",
      key: "department",
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
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            {record.code}
          </div>
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>
              {record.name}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              <BankOutlined style={{ marginRight: "4px" }} />
              {record.code}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip placement="topLeft" title={description}>
          {description}
        </Tooltip>
      ),
    },
    {
      title: "Quản lý",
      key: "manager",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "500" }}>
            <UserOutlined style={{ marginRight: "4px", color: "#334766" }} />
            {record.manager}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            <MailOutlined style={{ marginRight: "4px" }} />
            {record.managerEmail}
          </div>
        </div>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "employeeCount",
      key: "employeeCount",
      width: 100,
      align: "center",
      render: (count) => (
        <Badge count={count} showZero style={{ backgroundColor: "#334766" }} />
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) => (
        <Tag color={getTypeColor(type)}>{getTypeText(type)}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ngân sách",
      dataIndex: "budget",
      key: "budget",
      width: 150,
      align: "right",
      render: (budget) => (
        <Text style={{ fontWeight: "500" }}>{formatCurrency(budget)}</Text>
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

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchText.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchText.toLowerCase()) ||
      dept.manager.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      filters.status === "all" || dept.status === filters.status;
    const matchesType = filters.type === "all" || dept.type === filters.type;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);

      if (editingDepartment) {
        message.success("Cập nhật phòng ban thành công!");
      } else {
        message.success("Tạo phòng ban mới thành công!");
      }

      setIsModalVisible(false);
      setEditingDepartment(null);
      form.resetFields();
      loadDepartments();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingDepartment(null);
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
      <Card style={cardStyle}>
        <div style={{ marginBottom: "24px" }}>
          <Title level={3} style={{ margin: 0, color: "#1f2937" }}>
            <TeamOutlined style={{ marginRight: "8px", color: "#334766" }} />
            Quản lý phòng ban
          </Title>
          <Text type="secondary">
            Quản lý thông tin các phòng ban trong công ty
          </Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={8}>
            <Input.Group compact>
              <Input
                placeholder="Tìm kiếm phòng ban..."
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
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: "100%" }}
              placeholder="Trạng thái"
              size="large"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Tạm ngưng</Option>
              <Option value="suspended">Đình chỉ</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
              style={{ width: "100%" }}
              placeholder="Loại phòng ban"
              size="large"
            >
              <Option value="all">Tất cả loại</Option>
              <Option value="production">Sản xuất</Option>
              <Option value="technical">Kỹ thuật</Option>
              <Option value="support">Hỗ trợ</Option>
              <Option value="management">Quản lý</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingDepartment(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                style={{ backgroundColor: "#334766", borderColor: "#334766" }}
              >
                Thêm phòng ban
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadDepartments}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredDepartments}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredDepartments.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} phòng ban`,
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          scroll={{ x: 1200 }}
          className="department-management-table"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingDepartment ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText={editingDepartment ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        okButtonProps={{
          style: { backgroundColor: "#334766", borderColor: "#334766" },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên phòng ban"
                rules={[
                  { required: true, message: "Vui lòng nhập tên phòng ban" },
                ]}
              >
                <Input placeholder="Nhập tên phòng ban" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã phòng ban"
                rules={[
                  { required: true, message: "Vui lòng nhập mã phòng ban" },
                ]}
              >
                <Input placeholder="Nhập mã phòng ban" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
              >
                <Input.TextArea rows={3} placeholder="Nhập mô tả phòng ban" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="manager"
                label="Trưởng phòng"
                rules={[
                  { required: true, message: "Vui lòng nhập tên trưởng phòng" },
                ]}
              >
                <Input placeholder="Nhập tên trưởng phòng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="managerEmail"
                label="Email trưởng phòng"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input placeholder="Nhập email trưởng phòng" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="managerPhone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Vị trí"
                rules={[{ required: true, message: "Vui lòng nhập vị trí" }]}
              >
                <Input placeholder="Nhập vị trí phòng ban" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="type"
                label="Loại phòng ban"
                rules={[
                  { required: true, message: "Vui lòng chọn loại phòng ban" },
                ]}
              >
                <Select placeholder="Chọn loại phòng ban">
                  <Option value="production">Sản xuất</Option>
                  <Option value="technical">Kỹ thuật</Option>
                  <Option value="support">Hỗ trợ</Option>
                  <Option value="management">Quản lý</Option>
                </Select>
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
                  <Option value="inactive">Tạm ngưng</Option>
                  <Option value="suspended">Đình chỉ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="budget" label="Ngân sách (VNĐ)">
                <Input type="number" placeholder="Nhập ngân sách" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={
          <Space>
            <BankOutlined />
            Chi tiết phòng ban: {viewingDepartment?.name}
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
              handleAction("edit", viewingDepartment);
            }}
            style={{ backgroundColor: "#334766", borderColor: "#334766" }}
          >
            Chỉnh sửa
          </Button>,
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {viewingDepartment && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Tên phòng ban">
                {viewingDepartment.name}
              </Descriptions.Item>
              <Descriptions.Item label="Mã phòng ban">
                <Tag color="#334766">{viewingDepartment.code}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {viewingDepartment.description}
              </Descriptions.Item>
              <Descriptions.Item label="Trưởng phòng">
                <div>
                  <div>{viewingDepartment.manager}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    <MailOutlined style={{ marginRight: "4px" }} />
                    {viewingDepartment.managerEmail}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    <PhoneOutlined style={{ marginRight: "4px" }} />
                    {viewingDepartment.managerPhone}
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Số nhân viên">
                <Badge
                  count={viewingDepartment.employeeCount}
                  style={{ backgroundColor: "#334766" }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Vị trí">
                <Space>
                  <EnvironmentOutlined style={{ color: "#334766" }} />
                  {viewingDepartment.location}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Loại">
                <Tag color={getTypeColor(viewingDepartment.type)}>
                  {getTypeText(viewingDepartment.type)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(viewingDepartment.status)}>
                  {getStatusText(viewingDepartment.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngân sách">
                {formatCurrency(viewingDepartment.budget)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(viewingDepartment.createdDate).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật cuối">
                {dayjs(viewingDepartment.updatedDate).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );

  return showHeader ? <Layout>{content}</Layout> : content;
};

export default DepartmentManagement;
