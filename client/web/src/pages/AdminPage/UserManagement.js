import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
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
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  LockOutlined,
  UnlockOutlined,
  DownOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const UserManagement = ({ showHeader = true }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    status: "all",
    role: "all",
    department: "all",
  });

  // Mock data - replace with API calls
  const mockUsers = [
    {
      id: 1,
      fullName: "Nguyễn Văn Admin",
      employeeCode: "EMP001",
      email: "admin@fitskip.com",
      phoneNumber: "0901234567",
      department: "Quản lý",
      position: "Quản lý hệ thống",
      role: "Admin",
      status: "active",
      emailConfirmed: true,
      phoneConfirmed: true,
      lastLoginDate: "2024-01-20T10:30:00Z",
      createdDate: "2024-01-01T00:00:00Z",
      avatar: null,
    },
    {
      id: 2,
      fullName: "Trần Thị Developer",
      employeeCode: "EMP002",
      email: "dev@fitskip.com",
      phoneNumber: "0902345678",
      department: "IT",
      position: "Lập trình viên",
      role: "Developer",
      status: "active",
      emailConfirmed: true,
      phoneConfirmed: false,
      lastLoginDate: "2024-01-20T09:15:00Z",
      createdDate: "2024-01-02T00:00:00Z",
      avatar: null,
    },
    {
      id: 3,
      fullName: "Lê Minh Manager",
      employeeCode: "EMP003",
      email: "manager@fitskip.com",
      phoneNumber: "0903456789",
      department: "Sản xuất",
      position: "Quản lý sản xuất",
      role: "Manager",
      status: "inactive",
      emailConfirmed: true,
      phoneConfirmed: true,
      lastLoginDate: "2024-01-19T16:45:00Z",
      createdDate: "2024-01-03T00:00:00Z",
      avatar: null,
    },
    {
      id: 4,
      fullName: "Phạm Thị User",
      employeeCode: "EMP004",
      email: "user@fitskip.com",
      phoneNumber: "0904567890",
      department: "Nhân sự",
      position: "Nhân viên",
      role: "User",
      status: "active",
      emailConfirmed: false,
      phoneConfirmed: true,
      lastLoginDate: "2024-01-20T08:20:00Z",
      createdDate: "2024-01-04T00:00:00Z",
      avatar: null,
    },
    {
      id: 5,
      fullName: "Hoàng Văn Supervisor",
      employeeCode: "EMP005",
      email: "supervisor@fitskip.com",
      phoneNumber: "0905678901",
      department: "Kiểm soát chất lượng",
      position: "Giám sát viên",
      role: "Supervisor",
      status: "locked",
      emailConfirmed: true,
      phoneConfirmed: true,
      lastLoginDate: "2024-01-18T14:30:00Z",
      createdDate: "2024-01-05T00:00:00Z",
      avatar: null,
    },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error("Không thể tải danh sách người dùng");
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active: "success",
      inactive: "warning",
      locked: "error",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      active: "Hoạt động",
      inactive: "Tạm ngưng",
      locked: "Bị khóa",
    };
    return statusTexts[status] || "Không xác định";
  };

  const getRoleColor = (role) => {
    const roleColors = {
      Admin: "red",
      Developer: "purple",
      Manager: "blue",
      Supervisor: "orange",
      User: "green",
    };
    return roleColors[role] || "default";
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleUserAction = (action, user) => {
    switch (action) {
      case "view":
        Modal.info({
          title: "Chi tiết người dùng",
          width: 600,
          content: (
            <div style={{ marginTop: 16 }}>
              <Row gutter={[16, 8]}>
                <Col span={8}>
                  <Text strong>Họ tên:</Text>
                </Col>
                <Col span={16}>{user.fullName}</Col>
                <Col span={8}>
                  <Text strong>Mã nhân viên:</Text>
                </Col>
                <Col span={16}>{user.employeeCode}</Col>
                <Col span={8}>
                  <Text strong>Email:</Text>
                </Col>
                <Col span={16}>{user.email}</Col>
                <Col span={8}>
                  <Text strong>Số điện thoại:</Text>
                </Col>
                <Col span={16}>{user.phoneNumber}</Col>
                <Col span={8}>
                  <Text strong>Phòng ban:</Text>
                </Col>
                <Col span={16}>{user.department}</Col>
                <Col span={8}>
                  <Text strong>Chức vụ:</Text>
                </Col>
                <Col span={16}>{user.position}</Col>
                <Col span={8}>
                  <Text strong>Vai trò:</Text>
                </Col>
                <Col span={16}>
                  <Tag color={getRoleColor(user.role)}>{user.role}</Tag>
                </Col>
                <Col span={8}>
                  <Text strong>Trạng thái:</Text>
                </Col>
                <Col span={16}>
                  <Badge
                    status={getStatusColor(user.status)}
                    text={getStatusText(user.status)}
                  />
                </Col>
                <Col span={8}>
                  <Text strong>Đăng nhập cuối:</Text>
                </Col>
                <Col span={16}>{formatDateTime(user.lastLoginDate)}</Col>
              </Row>
            </div>
          ),
        });
        break;
      case "edit":
        setEditingUser(user);
        form.setFieldsValue(user);
        setIsModalVisible(true);
        break;
      case "delete":
        // Handle delete
        message.success("Đã xóa người dùng thành công");
        break;
      case "lock":
        message.success("Đã khóa tài khoản người dùng");
        break;
      case "unlock":
        message.success("Đã mở khóa tài khoản người dùng");
        break;
      default:
        break;
    }
  };

  const actionMenuItems = (user) => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "Xem chi tiết",
      onClick: () => handleUserAction("view", user),
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Chỉnh sửa",
      onClick: () => handleUserAction("edit", user),
    },
    {
      type: "divider",
    },
    {
      key: user.status === "locked" ? "unlock" : "lock",
      icon: user.status === "locked" ? <UnlockOutlined /> : <LockOutlined />,
      label: user.status === "locked" ? "Mở khóa" : "Khóa tài khoản",
      onClick: () =>
        handleUserAction(user.status === "locked" ? "unlock" : "lock", user),
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Xóa",
      danger: true,
      onClick: () => handleUserAction("delete", user),
    },
  ];

  const columns = [
    {
      title: "Người dùng",
      key: "user",
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar
            size="large"
            icon={<UserOutlined />}
            style={{ backgroundColor: "#2563eb" }}
          />
          <div>
            <div style={{ fontWeight: 600, color: "#1f2937" }}>
              {record.fullName}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              {record.employeeCode}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <MailOutlined style={{ color: "#2563eb", marginRight: 6 }} />
            <Text style={{ fontSize: "13px" }}>{record.email}</Text>
            {record.emailConfirmed && (
              <Badge
                status="success"
                style={{ marginLeft: 6 }}
                title="Email đã xác thực"
              />
            )}
          </div>
          <div>
            <PhoneOutlined style={{ color: "#2563eb", marginRight: 6 }} />
            <Text style={{ fontSize: "13px" }}>{record.phoneNumber}</Text>
            {record.phoneConfirmed && (
              <Badge
                status="success"
                style={{ marginLeft: 6 }}
                title="Số điện thoại đã xác thực"
              />
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      width: 150,
      render: (department) => (
        <div>
          <TeamOutlined style={{ color: "#2563eb", marginRight: 6 }} />
          <Text>{department}</Text>
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) => <Tag color={getRoleColor(role)}>{role}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Badge status={getStatusColor(status)} text={getStatusText(status)} />
      ),
    },
    {
      title: "Đăng nhập cuối",
      dataIndex: "lastLoginDate",
      key: "lastLoginDate",
      width: 150,
      render: (date) => (
        <Text style={{ fontSize: "13px" }}>{formatDateTime(date)}</Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{ items: actionMenuItems(record) }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button type="text" icon={<DownOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const filteredUsers = users.filter((user) => {
    const searchMatch =
      !searchText ||
      user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.employeeCode.toLowerCase().includes(searchText.toLowerCase());

    const statusMatch =
      filters.status === "all" || user.status === filters.status;
    const roleMatch = filters.role === "all" || user.role === filters.role;
    const departmentMatch =
      filters.department === "all" || user.department === filters.department;

    return searchMatch && statusMatch && roleMatch && departmentMatch;
  });

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        // Update user
        message.success("Cập nhật người dùng thành công");
      } else {
        // Create new user
        message.success("Tạo người dùng mới thành công");
      }
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      loadUsers();
    } catch (error) {
      console.error("Validate failed:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const cardStyle = {
    background: "#ffffff",
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
            <UserOutlined style={{ marginRight: "8px", color: "#2563eb" }} />
            Quản lý người dùng
          </Title>
          <Text type="secondary">
            Quản lý thông tin và phân quyền người dùng trong hệ thống
          </Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm theo tên, email, mã NV..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: "100%" }}
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Tạm ngưng</Option>
              <Option value="locked">Bị khóa</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.role}
              onChange={(value) => setFilters({ ...filters, role: value })}
              style={{ width: "100%" }}
              placeholder="Vai trò"
            >
              <Option value="all">Tất cả vai trò</Option>
              <Option value="Admin">Admin</Option>
              <Option value="Developer">Developer</Option>
              <Option value="Manager">Manager</Option>
              <Option value="Supervisor">Supervisor</Option>
              <Option value="User">User</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingUser(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                Thêm người dùng
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadUsers}>
                Làm mới
              </Button>
              <Button icon={<ExportOutlined />}>Xuất Excel</Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} người dùng`,
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText={editingUser ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="employeeCode"
                label="Mã nhân viên"
                rules={[
                  { required: true, message: "Vui lòng nhập mã nhân viên" },
                ]}
              >
                <Input placeholder="Nhập mã nhân viên" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input placeholder="Nhập địa chỉ email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Phòng ban"
                rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
              >
                <Select placeholder="Chọn phòng ban">
                  <Option value="Quản lý">Quản lý</Option>
                  <Option value="IT">IT</Option>
                  <Option value="Sản xuất">Sản xuất</Option>
                  <Option value="Nhân sự">Nhân sự</Option>
                  <Option value="Kiểm soát chất lượng">
                    Kiểm soát chất lượng
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Chức vụ"
                rules={[{ required: true, message: "Vui lòng nhập chức vụ" }]}
              >
                <Input placeholder="Nhập chức vụ" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="Admin">Admin</Option>
                  <Option value="Developer">Developer</Option>
                  <Option value="Manager">Manager</Option>
                  <Option value="Supervisor">Supervisor</Option>
                  <Option value="User">User</Option>
                </Select>
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
                  <Option value="inactive">Tạm ngưng</Option>
                  <Option value="locked">Bị khóa</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );

  return showHeader ? <Layout>{content}</Layout> : content;
};

export default UserManagement;
