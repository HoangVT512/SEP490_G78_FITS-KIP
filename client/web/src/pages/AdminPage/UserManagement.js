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
  CalendarOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import dayjs from "dayjs";
import { userService } from "../../services/userService";
import { departmentService } from "../../services/departmentService";
import { roleService } from "../../services/roleService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const UserManagement = ({ showHeader = true }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [form] = Form.useForm();
  // Key used so load error messages replace previous one instead of stacking
  const LOAD_USERS_ERROR_KEY = "load-users-error";
  const [filters, setFilters] = useState({
    status: "all",
    role: "all",
    department: "all",
  });
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

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
      // Thông tin chi tiết bổ sung
      address: "123 Đường ABC, Quận 1, TP.HCM",
      birthDate: "1985-05-15",
      gender: "Nam",
      nationalId: "123456789012",
      joinDate: "2024-01-01",
      salary: 25000000,
      emergencyContact: {
        name: "Nguyễn Thị Vợ",
        relationship: "Vợ",
        phone: "0987654321",
      },
      permissions: [
        "user_management",
        "system_settings",
        "reports",
        "dashboard",
      ],
      loginHistory: [
        {
          date: "2024-01-20T10:30:00Z",
          ip: "192.168.1.100",
          device: "Chrome/Windows",
        },
        {
          date: "2024-01-19T08:15:00Z",
          ip: "192.168.1.100",
          device: "Chrome/Windows",
        },
        {
          date: "2024-01-18T09:00:00Z",
          ip: "192.168.1.101",
          device: "Firefox/Windows",
        },
      ],
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
      // Thông tin chi tiết bổ sung
      address: "456 Đường DEF, Quận 2, TP.HCM",
      birthDate: "1990-08-22",
      gender: "Nữ",
      nationalId: "987654321098",
      joinDate: "2024-01-02",
      salary: 18000000,
      emergencyContact: {
        name: "Trần Văn Anh",
        relationship: "Anh trai",
        phone: "0912345678",
      },
      permissions: ["dashboard", "reports"],
      loginHistory: [
        {
          date: "2024-01-20T09:15:00Z",
          ip: "192.168.1.102",
          device: "Chrome/MacOS",
        },
        {
          date: "2024-01-19T10:30:00Z",
          ip: "192.168.1.102",
          device: "Chrome/MacOS",
        },
        {
          date: "2024-01-18T08:45:00Z",
          ip: "192.168.1.103",
          device: "Safari/MacOS",
        },
      ],
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
    loadDepartments();
    loadRoles();
  }, []);

  const loadDepartments = async () => {
    try {
      const departmentData = await departmentService.getDepartments();
      setDepartments(departmentData);
    } catch (error) {
      console.error("Error loading departments:", error);
      message.error("Không thể tải danh sách phòng ban");
    }
  };

  const loadRoles = async () => {
    try {
      const roleData = await roleService.getRoles();
      setRoles(roleData);
    } catch (error) {
      console.error("Error loading roles:", error);
      message.error("Không thể tải danh sách vai trò");
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userData = await userService.getUsers();
      setUsers(userData);
    } catch (error) {
      console.error("Error loading users:", error);
      // Use a stable key so repeated errors replace the previous notification
      message.error({
        key: LOAD_USERS_ERROR_KEY,
        content:
          error.message ||
          "Không thể tải danh sách người dùng. Vui lòng thử lại sau.",
        placement: "topRight",
        duration: 4,
      });
      // Fallback to empty array if API fails
      setUsers([]);
    } finally {
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
        setViewingUser(user);
        setIsViewModalVisible(true);
        break;
      case "edit":
        setEditingUser(user);
        form.setFieldsValue(user);
        setIsModalVisible(true);
        break;
      case "delete":
        // Handle delete
        message.success({
          content: "Đã xóa người dùng thành công",
          placement: "topRight",
          duration: 3,
        });
        break;
      case "lock":
        message.success({
          content: "Đã khóa tài khoản người dùng",
          placement: "topRight",
          duration: 3,
        });
        break;
      case "unlock":
        message.success({
          content: "Đã mở khóa tài khoản người dùng",
          placement: "topRight",
          duration: 3,
        });
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
            style={{ backgroundColor: "#334766" }}
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
            <MailOutlined style={{ color: "#334766", marginRight: 6 }} />
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
            <PhoneOutlined style={{ color: "#334766", marginRight: 6 }} />
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
          <TeamOutlined style={{ color: "#334766", marginRight: 6 }} />
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
      setLoading(true);

      if (editingUser) {
        // Update user
        await userService.updateUser(editingUser.id, {
          id: editingUser.id,
          userName: values.email,
          normalizedUserName: values.email.toUpperCase(),
          email: values.email,
          normalizedEmail: values.email.toUpperCase(),
          emailConfirmed: editingUser.emailConfirmed || false,
          passwordHash: editingUser.passwordHash || null,
          securityStamp: editingUser.securityStamp || null,
          concurrencyStamp: editingUser.concurrencyStamp || null,
          phoneNumber: values.phoneNumber,
          phoneNumberConfirmed: editingUser.phoneNumberConfirmed || false,
          twoFactorEnabled: editingUser.twoFactorEnabled || false,
          lockoutEnd: editingUser.lockoutEnd || null,
          lockoutEnabled: editingUser.lockoutEnabled || false,
          accessFailedCount: editingUser.accessFailedCount || 0,
          fullName: values.fullName,
          gender: values.gender || "Nam",
          employeeCode: values.employeeCode,
          position: values.position,
        });
        message.success({
          content: "Cập nhật người dùng thành công",
          placement: "topRight",
          duration: 3,
        });
      } else {
        // Create new user with proper DTO
        await userService.createUser({
          userName: values.email, // Use email as username
          email: values.email,
          password: values.password,
          fullName: values.fullName,
          employeeCode: values.employeeCode,
          phoneNumber: values.phoneNumber,
          position: values.position,
          gender: values.gender || "Nam",
          roleIds: values.role ? [values.role] : [],
        });
        message.success({
          content: "Tạo người dùng mới thành công",
          placement: "topRight",
          duration: 3,
        });
      }
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      await loadUsers();
    } catch (error) {
      console.error("Operation failed:", error);
      message.error({
        content: editingUser
          ? "Cập nhật người dùng thất bại"
          : "Tạo người dùng thất bại: " + error.message,
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
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
            <UserOutlined style={{ marginRight: "8px", color: "#334766" }} />
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
                <Select
                  placeholder="Chọn phòng ban"
                  loading={departments.length === 0}
                >
                  {departments.map((dept) => (
                    <Option key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName}
                    </Option>
                  ))}
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
                <Select placeholder="Chọn vai trò" loading={roles.length === 0}>
                  {roles.map((role) => (
                    <Option key={role.id} value={role.id}>
                      {role.name}
                    </Option>
                  ))}
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
          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Mật khẩu xác nhận không khớp!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Nhập lại mật khẩu" />
                </Form.Item>
              </Col>
            </Row>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính">
                <Select placeholder="Chọn giới tính">
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal xem chi tiết người dùng */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              size={40}
              icon={<UserOutlined />}
              src={viewingUser?.avatar}
              style={{ backgroundColor: "#334766" }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: "16px" }}>
                {viewingUser?.fullName}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: "normal",
                }}
              >
                {viewingUser?.employeeCode} • {viewingUser?.position}
              </div>
            </div>
          </div>
        }
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        width={900}
        footer={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setIsViewModalVisible(false);
              handleUserAction("edit", viewingUser);
            }}
          >
            Chỉnh sửa
          </Button>,
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {viewingUser && (
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {/* Thông tin cơ bản */}
            <Card
              title={
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <UserOutlined /> Thông tin cơ bản
                </span>
              }
              size="small"
              style={{ marginBottom: "16px" }}
            >
              <Row gutter={[24, 12]}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Họ và tên</Text>
                    <div style={{ fontWeight: 500 }}>
                      {viewingUser.fullName}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Mã nhân viên</Text>
                    <div style={{ fontWeight: 500 }}>
                      {viewingUser.employeeCode}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Ngày sinh</Text>
                    <div style={{ fontWeight: 500 }}>
                      {viewingUser.birthDate
                        ? dayjs(viewingUser.birthDate).format("DD/MM/YYYY")
                        : "Chưa cập nhật"}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Giới tính</Text>
                    <div style={{ fontWeight: 500 }}>
                      {viewingUser.gender || "Chưa cập nhật"}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">CCCD/CMND</Text>
                    <div style={{ fontWeight: 500 }}>
                      {viewingUser.nationalId || "Chưa cập nhật"}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Ngày vào làm</Text>
                    <div style={{ fontWeight: 500 }}>
                      {viewingUser.joinDate
                        ? dayjs(viewingUser.joinDate).format("DD/MM/YYYY")
                        : "Chưa cập nhật"}
                    </div>
                  </div>
                </Col>
                <Col xs={24}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Địa chỉ</Text>
                    <div style={{ fontWeight: 500 }}>
                      {viewingUser.address || "Chưa cập nhật"}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Thông tin liên hệ */}
            <Card
              title={
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <PhoneOutlined /> Thông tin liên hệ
                </span>
              }
              size="small"
              style={{ marginBottom: "16px" }}
            >
              <Row gutter={[24, 12]}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Email</Text>
                    <div
                      style={{
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {viewingUser.email}
                      {viewingUser.emailConfirmed ? (
                        <CheckCircleOutlined style={{ color: "#10b981" }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: "#ef4444" }} />
                      )}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Số điện thoại</Text>
                    <div
                      style={{
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {viewingUser.phoneNumber}
                      {viewingUser.phoneConfirmed ? (
                        <CheckCircleOutlined style={{ color: "#10b981" }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: "#ef4444" }} />
                      )}
                    </div>
                  </div>
                </Col>
                {viewingUser.emergencyContact && (
                  <>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: "8px" }}>
                        <Text type="secondary">Người liên hệ khẩn cấp</Text>
                        <div style={{ fontWeight: 500 }}>
                          {viewingUser.emergencyContact.name} (
                          {viewingUser.emergencyContact.relationship})
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ marginBottom: "8px" }}>
                        <Text type="secondary">SĐT khẩn cấp</Text>
                        <div style={{ fontWeight: 500 }}>
                          {viewingUser.emergencyContact.phone}
                        </div>
                      </div>
                    </Col>
                  </>
                )}
              </Row>
            </Card>

            {/* Thông tin công việc */}
            <Card
              title={
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <TeamOutlined /> Thông tin công việc
                </span>
              }
              size="small"
              style={{ marginBottom: "16px" }}
            >
              <Row gutter={[24, 12]}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Phòng ban</Text>
                    <div style={{ fontWeight: 500 }}>
                      {viewingUser.department}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Chức vụ</Text>
                    <div style={{ fontWeight: 500 }}>
                      {viewingUser.position}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Vai trò hệ thống</Text>
                    <div>
                      <Tag color={getRoleColor(viewingUser.role)}>
                        {viewingUser.role}
                      </Tag>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Trạng thái</Text>
                    <div>
                      <Badge
                        status={getStatusColor(viewingUser.status)}
                        text={getStatusText(viewingUser.status)}
                      />
                    </div>
                  </div>
                </Col>
                {viewingUser.salary && (
                  <Col xs={24} sm={12}>
                    <div style={{ marginBottom: "8px" }}>
                      <Text type="secondary">Mức lương</Text>
                      <div style={{ fontWeight: 500 }}>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(viewingUser.salary)}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>

            {/* Quyền hạn */}
            {viewingUser.permissions && viewingUser.permissions.length > 0 && (
              <Card
                title={
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <SafetyOutlined /> Quyền hạn hệ thống
                  </span>
                }
                size="small"
                style={{ marginBottom: "16px" }}
              >
                <div>
                  {viewingUser.permissions.map((permission) => {
                    const permissionMap = {
                      user_management: "Quản lý người dùng",
                      system_settings: "Cài đặt hệ thống",
                      reports: "Xem báo cáo",
                      dashboard: "Truy cập Dashboard",
                    };
                    return (
                      <Tag
                        key={permission}
                        color="blue"
                        style={{ marginBottom: "4px" }}
                      >
                        {permissionMap[permission] || permission}
                      </Tag>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Hoạt động gần đây */}
            <Card
              title={
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <ClockCircleOutlined /> Hoạt động gần đây
                </span>
              }
              size="small"
            >
              <Row gutter={[24, 12]}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Đăng nhập cuối</Text>
                    <div style={{ fontWeight: 500 }}>
                      {dayjs(viewingUser.lastLoginDate).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "8px" }}>
                    <Text type="secondary">Ngày tạo tài khoản</Text>
                    <div style={{ fontWeight: 500 }}>
                      {dayjs(viewingUser.createdDate).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </div>
                  </div>
                </Col>
              </Row>

              {viewingUser.loginHistory &&
                viewingUser.loginHistory.length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <Text type="secondary" strong>
                      Lịch sử đăng nhập gần đây:
                    </Text>
                    <div style={{ marginTop: "8px" }}>
                      {viewingUser.loginHistory
                        .slice(0, 3)
                        .map((login, index) => (
                          <div
                            key={index}
                            style={{
                              padding: "8px 12px",
                              background: "#f8fafc",
                              borderRadius: "6px",
                              marginBottom: "4px",
                              fontSize: "13px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>
                                {dayjs(login.date).format("DD/MM/YYYY HH:mm")}
                              </span>
                              <span style={{ color: "#6b7280" }}>
                                IP: {login.ip}
                              </span>
                            </div>
                            <div style={{ color: "#6b7280", fontSize: "12px" }}>
                              Device: {login.device}
                            </div>
                          </div>
                        ))}
                    </div>
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

export default UserManagement;
