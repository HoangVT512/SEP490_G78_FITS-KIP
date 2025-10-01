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
  Dropdown,
  Divider,
  Popconfirm,
  message,
  Tooltip,
  Switch,
  Descriptions,
  Alert,
  Checkbox,
  Badge,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SafetyOutlined,
  DownOutlined,
  ReloadOutlined,
  FilterOutlined,
  KeyOutlined,
  TeamOutlined,
  LockOutlined,
  UnlockOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  UserOutlined,
  CrownOutlined,
  StarOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import styles from "../../styles/pages/RoleManagement.module.css";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const RoleManagement = ({ showHeader = true }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isPermissionModalVisible, setIsPermissionModalVisible] =
    useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [form] = Form.useForm();
  const [permissionForm] = Form.useForm();

  // Mock data for roles
  const mockRoles = [
    {
      id: "role-1",
      name: "System Administrator",
      normalizedName: "SYSTEM_ADMINISTRATOR",
      description:
        "Quyền quản trị hệ thống cao nhất, có thể truy cập tất cả chức năng",
      status: "active",
      isSystemRole: true,
      userCount: 2,
      permissions: [
        "user_management",
        "role_management",
        "system_settings",
        "reports_view",
        "data_export",
        "backup_restore",
        "audit_logs",
      ],
      createdDate: "2024-01-01T00:00:00Z",
      updatedDate: "2024-01-15T10:30:00Z",
      createdBy: "system",
      priority: 1,
    },
    {
      id: "role-2",
      name: "Manager",
      normalizedName: "MANAGER",
      description:
        "Quản lý phòng ban, có quyền quản lý nhân viên và xem báo cáo",
      status: "active",
      isSystemRole: false,
      userCount: 5,
      permissions: [
        "user_view",
        "user_create",
        "user_edit",
        "reports_view",
        "department_management",
        "equipment_management",
      ],
      createdDate: "2024-01-02T00:00:00Z",
      updatedDate: "2024-01-20T14:20:00Z",
      createdBy: "admin",
      priority: 2,
    },
    {
      id: "role-3",
      name: "Supervisor",
      normalizedName: "SUPERVISOR",
      description: "Giám sát viên, quản lý ca làm việc và thiết bị",
      status: "active",
      isSystemRole: false,
      userCount: 8,
      permissions: [
        "equipment_view",
        "equipment_edit",
        "shift_management",
        "maintenance_view",
        "error_reporting",
      ],
      createdDate: "2024-01-03T00:00:00Z",
      updatedDate: "2024-01-25T09:15:00Z",
      createdBy: "admin",
      priority: 3,
    },
    {
      id: "role-4",
      name: "Operator",
      normalizedName: "OPERATOR",
      description: "Nhân viên vận hành thiết bị, báo cáo sự cố",
      status: "active",
      isSystemRole: false,
      userCount: 25,
      permissions: [
        "equipment_view",
        "error_reporting",
        "shift_view",
        "profile_edit",
      ],
      createdDate: "2024-01-04T00:00:00Z",
      updatedDate: "2024-01-28T16:45:00Z",
      createdBy: "manager",
      priority: 4,
    },
    {
      id: "role-5",
      name: "Maintenance",
      normalizedName: "MAINTENANCE",
      description: "Kỹ thuật viên bảo trì thiết bị",
      status: "active",
      isSystemRole: false,
      userCount: 6,
      permissions: [
        "equipment_view",
        "equipment_maintenance",
        "spare_parts_management",
        "maintenance_schedule",
        "error_resolution",
      ],
      createdDate: "2024-01-05T00:00:00Z",
      updatedDate: "2024-01-30T11:00:00Z",
      createdBy: "admin",
      priority: 3,
    },
    {
      id: "role-6",
      name: "Guest",
      normalizedName: "GUEST",
      description: "Khách mời, chỉ có quyền xem thông tin cơ bản",
      status: "inactive",
      isSystemRole: false,
      userCount: 0,
      permissions: ["dashboard_view", "profile_view"],
      createdDate: "2024-01-06T00:00:00Z",
      updatedDate: "2024-01-06T00:00:00Z",
      createdBy: "admin",
      priority: 5,
    },
  ];

  // Available permissions
  const availablePermissions = [
    {
      category: "Quản lý người dùng",
      permissions: [
        {
          key: "user_view",
          name: "Xem danh sách người dùng",
          description: "Có thể xem thông tin người dùng",
        },
        {
          key: "user_create",
          name: "Tạo người dùng mới",
          description: "Có thể tạo tài khoản người dùng mới",
        },
        {
          key: "user_edit",
          name: "Chỉnh sửa người dùng",
          description: "Có thể cập nhật thông tin người dùng",
        },
        {
          key: "user_delete",
          name: "Xóa người dùng",
          description: "Có thể xóa tài khoản người dùng",
        },
        {
          key: "user_management",
          name: "Quản lý người dùng (Toàn quyền)",
          description: "Toàn quyền quản lý người dùng",
        },
      ],
    },
    {
      category: "Quản lý vai trò",
      permissions: [
        {
          key: "role_view",
          name: "Xem danh sách vai trò",
          description: "Có thể xem các vai trò trong hệ thống",
        },
        {
          key: "role_create",
          name: "Tạo vai trò mới",
          description: "Có thể tạo vai trò mới",
        },
        {
          key: "role_edit",
          name: "Chỉnh sửa vai trò",
          description: "Có thể cập nhật thông tin vai trò",
        },
        {
          key: "role_delete",
          name: "Xóa vai trò",
          description: "Có thể xóa vai trò khỏi hệ thống",
        },
        {
          key: "role_management",
          name: "Quản lý vai trò (Toàn quyền)",
          description: "Toàn quyền quản lý vai trò",
        },
      ],
    },
    {
      category: "Quản lý thiết bị",
      permissions: [
        {
          key: "equipment_view",
          name: "Xem thiết bị",
          description: "Có thể xem thông tin thiết bị",
        },
        {
          key: "equipment_edit",
          name: "Chỉnh sửa thiết bị",
          description: "Có thể cập nhật thông tin thiết bị",
        },
        {
          key: "equipment_management",
          name: "Quản lý thiết bị",
          description: "Toàn quyền quản lý thiết bị",
        },
        {
          key: "equipment_maintenance",
          name: "Bảo trì thiết bị",
          description: "Có thể thực hiện bảo trì thiết bị",
        },
      ],
    },
    {
      category: "Quản lý ca làm việc",
      permissions: [
        {
          key: "shift_view",
          name: "Xem ca làm việc",
          description: "Có thể xem lịch ca làm việc",
        },
        {
          key: "shift_management",
          name: "Quản lý ca làm việc",
          description: "Có thể quản lý và phân ca làm việc",
        },
      ],
    },
    {
      category: "Báo cáo & Thống kê",
      permissions: [
        {
          key: "reports_view",
          name: "Xem báo cáo",
          description: "Có thể xem các báo cáo hệ thống",
        },
        {
          key: "data_export",
          name: "Xuất dữ liệu",
          description: "Có thể xuất dữ liệu ra file",
        },
      ],
    },
    {
      category: "Hệ thống",
      permissions: [
        {
          key: "system_settings",
          name: "Cài đặt hệ thống",
          description: "Có thể thay đổi cài đặt hệ thống",
        },
        {
          key: "backup_restore",
          name: "Sao lưu & Khôi phục",
          description: "Có thể thực hiện sao lưu và khôi phục dữ liệu",
        },
        {
          key: "audit_logs",
          name: "Xem nhật ký kiểm toán",
          description: "Có thể xem lịch sử hoạt động hệ thống",
        },
        {
          key: "dashboard_view",
          name: "Xem dashboard",
          description: "Có thể truy cập trang tổng quan",
        },
        {
          key: "profile_view",
          name: "Xem hồ sơ cá nhân",
          description: "Có thể xem thông tin cá nhân",
        },
        {
          key: "profile_edit",
          name: "Chỉnh sửa hồ sơ",
          description: "Có thể cập nhật thông tin cá nhân",
        },
      ],
    },
    {
      category: "Khác",
      permissions: [
        {
          key: "error_reporting",
          name: "Báo cáo sự cố",
          description: "Có thể báo cáo sự cố thiết bị",
        },
        {
          key: "error_resolution",
          name: "Giải quyết sự cố",
          description: "Có thể xử lý và giải quyết sự cố",
        },
        {
          key: "spare_parts_management",
          name: "Quản lý phụ tùng",
          description: "Có thể quản lý kho phụ tùng",
        },
        {
          key: "maintenance_schedule",
          name: "Lập lịch bảo trì",
          description: "Có thể lập lịch bảo trì thiết bị",
        },
        {
          key: "department_management",
          name: "Quản lý phòng ban",
          description: "Có thể quản lý thông tin phòng ban",
        },
      ],
    },
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setRoles(mockRoles);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading roles:", error);
      message.error("Không thể tải danh sách vai trò");
      setLoading(false);
    }
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
    const statusText = {
      active: "Hoạt động",
      inactive: "Ngừng hoạt động",
      locked: "Bị khóa",
    };
    return statusText[status] || "Không xác định";
  };

  const getRoleIcon = (role) => {
    if (role.isSystemRole)
      return <CrownOutlined style={{ color: "#f39c12" }} />;
    switch (role.priority) {
      case 1:
        return <SafetyOutlined style={{ color: "#e74c3c" }} />;
      case 2:
        return <StarOutlined style={{ color: "#3498db" }} />;
      case 3:
        return <SettingOutlined style={{ color: "#2ecc71" }} />;
      case 4:
        return <UserOutlined style={{ color: "#9b59b6" }} />;
      default:
        return <TeamOutlined style={{ color: "#95a5a6" }} />;
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      status: role.status,
    });
    setIsModalVisible(true);
  };

  const handleView = (role) => {
    setViewingRole(role);
    setIsViewModalVisible(true);
  };

  const handleDelete = async (roleId) => {
    try {
      // Simulate API call
      const roleToDelete = roles.find((r) => r.id === roleId);
      if (roleToDelete?.isSystemRole) {
        message.error("Không thể xóa vai trò hệ thống");
        return;
      }
      if (roleToDelete?.userCount > 0) {
        message.error(
          `Không thể xóa vai trò đang được sử dụng bởi ${roleToDelete.userCount} người dùng`
        );
        return;
      }

      setRoles(roles.filter((role) => role.id !== roleId));
      message.success("Đã xóa vai trò thành công");
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa vai trò");
    }
  };

  const handleToggleStatus = async (roleId) => {
    try {
      const updatedRoles = roles.map((role) => {
        if (role.id === roleId) {
          if (role.isSystemRole) {
            message.warning("Không thể thay đổi trạng thái vai trò hệ thống");
            return role;
          }
          return {
            ...role,
            status: role.status === "active" ? "inactive" : "active",
          };
        }
        return role;
      });
      setRoles(updatedRoles);
      message.success("Đã cập nhật trạng thái vai trò");
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const handleManagePermissions = (role) => {
    setViewingRole(role);
    permissionForm.setFieldsValue({
      permissions: role.permissions,
    });
    setIsPermissionModalVisible(true);
  };

  const handleModalSubmit = async (values) => {
    try {
      if (editingRole) {
        // Update existing role
        const updatedRoles = roles.map((role) =>
          role.id === editingRole.id
            ? { ...role, ...values, updatedDate: new Date().toISOString() }
            : role
        );
        setRoles(updatedRoles);
        message.success("Cập nhật vai trò thành công");
      } else {
        // Create new role
        const newRole = {
          id: `role-${Date.now()}`,
          ...values,
          normalizedName: values.name.toUpperCase().replace(/\s+/g, "_"),
          isSystemRole: false,
          userCount: 0,
          permissions: [],
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          createdBy: "admin",
          priority: 4,
        };
        setRoles([...roles, newRole]);
        message.success("Tạo vai trò mới thành công");
      }
      setIsModalVisible(false);
      setEditingRole(null);
      form.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu vai trò");
    }
  };

  const handlePermissionSubmit = async (values) => {
    try {
      const updatedRoles = roles.map((role) =>
        role.id === viewingRole.id
          ? {
              ...role,
              permissions: values.permissions || [],
              updatedDate: new Date().toISOString(),
            }
          : role
      );
      setRoles(updatedRoles);
      message.success("Cập nhật quyền thành công");
      setIsPermissionModalVisible(false);
      setViewingRole(null);
      permissionForm.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật quyền");
    }
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchText.toLowerCase()) ||
      role.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Vai trò",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text, record) => (
        <Space>
          {getRoleIcon(record)}
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.normalizedName}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
          {record.isSystemRole && (
            <Tag color="gold" size="small">
              <SafetyOutlined /> Hệ thống
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Số người dùng",
      dataIndex: "userCount",
      key: "userCount",
      width: 120,
      align: "center",
      render: (count) => (
        <Badge count={count} showZero style={{ backgroundColor: "#334766" }} />
      ),
    },
    {
      title: "Quyền hạn",
      dataIndex: "permissions",
      key: "permissions",
      width: 150,
      render: (permissions) => (
        <div>
          <Text strong>{permissions.length}</Text>
          <Text type="secondary"> quyền</Text>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Quản lý quyền">
            <Button
              type="text"
              icon={<KeyOutlined />}
              onClick={() => handleManagePermissions(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
              disabled={record.isSystemRole}
            />
          </Tooltip>
          <Tooltip
            title={record.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
          >
            <Button
              type="text"
              icon={
                record.status === "active" ? (
                  <LockOutlined />
                ) : (
                  <UnlockOutlined />
                )
              }
              onClick={() => handleToggleStatus(record.id)}
              size="small"
              disabled={record.isSystemRole}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa vai trò"
            description="Bạn có chắc chắn muốn xóa vai trò này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
            disabled={record.isSystemRole || record.userCount > 0}
          >
            <Tooltip
              title={
                record.isSystemRole
                  ? "Không thể xóa vai trò hệ thống"
                  : record.userCount > 0
                  ? `Không thể xóa vai trò đang được sử dụng bởi ${record.userCount} người dùng`
                  : "Xóa vai trò"
              }
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                disabled={record.isSystemRole || record.userCount > 0}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const actionMenuItems = [
    {
      key: "active",
      label: "Kích hoạt đã chọn",
      icon: <UnlockOutlined />,
      onClick: () => {
        // Handle bulk activation
        message.success("Đã kích hoạt các vai trò được chọn");
      },
    },
    {
      key: "inactive",
      label: "Vô hiệu hóa đã chọn",
      icon: <LockOutlined />,
      onClick: () => {
        // Handle bulk deactivation
        message.success("Đã vô hiệu hóa các vai trò được chọn");
      },
    },
  ];

  return (
    <Layout showHeader={showHeader}>
      <div className="role-management-page" style={{ padding: "24px" }}>
        <Card>
          <div style={{ marginBottom: 24 }}>
            <Title
              level={2}
              style={{ margin: 0, display: "flex", alignItems: "center" }}
            >
              <SafetyOutlined style={{ marginRight: 8, color: "#334766" }} />
              Quản lý vai trò
            </Title>
            <Text type="secondary">
              Quản lý vai trò và phân quyền người dùng trong hệ thống
            </Text>
          </div>

          {/* Action Bar */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input.Group compact>
                <Input
                  placeholder="Tìm kiếm vai trò..."
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
            <Col xs={24} sm={12} md={16} lg={18}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => {
                    setEditingRole(null);
                    form.resetFields();
                    setIsModalVisible(true);
                  }}
                  style={{ backgroundColor: "#334766", borderColor: "#334766" }}
                >
                  Tạo vai trò mới
                </Button>
                {selectedRowKeys.length > 0 && (
                  <Dropdown
                    menu={{ items: actionMenuItems }}
                    trigger={["click"]}
                  >
                    <Button size="large">
                      Thao tác <DownOutlined />
                    </Button>
                  </Dropdown>
                )}
                <Button
                  icon={<ReloadOutlined />}
                  size="large"
                  onClick={loadRoles}
                >
                  Tải lại
                </Button>
              </div>
            </Col>
          </Row>

          {/* Statistics */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: "#334766" }}
                >
                  {roles.length}
                </div>
                <div style={{ color: "#666" }}>Tổng vai trò</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: "#52c41a" }}
                >
                  {roles.filter((r) => r.status === "active").length}
                </div>
                <div style={{ color: "#666" }}>Đang hoạt động</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: "#faad14" }}
                >
                  {roles.filter((r) => r.isSystemRole).length}
                </div>
                <div style={{ color: "#666" }}>Vai trò hệ thống</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 24, fontWeight: 600, color: "#722ed1" }}
                >
                  {roles.reduce((sum, role) => sum + role.userCount, 0)}
                </div>
                <div style={{ color: "#666" }}>Tổng người dùng</div>
              </Card>
            </Col>
          </Row>

          {/* Table */}
          <div className="table-container" style={{ overflow: "auto" }}>
            <Table
              columns={columns}
              dataSource={filteredRoles}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1200 }}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
                getCheckboxProps: (record) => ({
                  disabled: record.isSystemRole,
                }),
              }}
              pagination={{
                total: filteredRoles.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} vai trò`,
              }}
            />
          </div>
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          title={editingRole ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingRole(null);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          width={1000}
          destroyOnClose
          okText={editingRole ? "Cập nhật" : "Tạo mới"}
          cancelText="Hủy"
          okButtonProps={{
            style: { backgroundColor: "#334766", borderColor: "#334766", width: 100, marginTop: 60},
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
            <Form.Item
              name="name"
              label="Tên vai trò"
              rules={[
                { required: true, message: "Vui lòng nhập tên vai trò!" },
                { min: 2, message: "Tên vai trò phải có ít nhất 2 ký tự!" },
                { max: 50, message: "Tên vai trò không được quá 50 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tên vai trò" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                { required: true, message: "Vui lòng nhập mô tả vai trò!" },
                { max: 500, message: "Mô tả không được quá 500 ký tự!" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập mô tả chi tiết về vai trò này..."
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Ngừng hoạt động</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* View Details Modal */}
        <Modal
          title={
            <Space>
              {viewingRole && getRoleIcon(viewingRole)}
              Chi tiết vai trò: {viewingRole?.name}
            </Space>
          }
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsViewModalVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={1000}
        >
          {viewingRole && (
            <div>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Tên vai trò">
                  {viewingRole.name}
                </Descriptions.Item>
                <Descriptions.Item label="Tên chuẩn hóa">
                  <Text code>{viewingRole.normalizedName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(viewingRole.status)}>
                    {getStatusText(viewingRole.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò hệ thống">
                  {viewingRole.isSystemRole ? (
                    <Tag color="gold">
                      <SafetyOutlined /> Có
                    </Tag>
                  ) : (
                    <Tag>Không</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Số người dùng">
                  <Badge count={viewingRole.userCount} showZero />
                </Descriptions.Item>
                <Descriptions.Item label="Độ ưu tiên">
                  {viewingRole.priority}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo" span={2}>
                  {new Date(viewingRole.createdDate).toLocaleString("vi-VN")}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {viewingRole.description}
                </Descriptions.Item>
              </Descriptions>

              <Divider>
                Danh sách quyền ({viewingRole.permissions.length})
              </Divider>
              <div style={{ maxHeight: 300, overflow: "auto" }}>
                {availablePermissions.map((category) => {
                  const categoryPermissions = category.permissions.filter((p) =>
                    viewingRole.permissions.includes(p.key)
                  );
                  if (categoryPermissions.length === 0) return null;

                  return (
                    <div key={category.category} style={{ marginBottom: 16 }}>
                      <Text strong>{category.category}:</Text>
                      <div style={{ marginTop: 8, marginLeft: 16 }}>
                        {categoryPermissions.map((permission) => (
                          <Tag
                            key={permission.key}
                            color="blue"
                            style={{ marginBottom: 4 }}
                          >
                            <CheckCircleOutlined /> {permission.name}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {viewingRole.permissions.length === 0 && (
                  <Alert
                    message="Chưa có quyền nào được gán"
                    description="Vai trò này chưa được phân quyền. Hãy quản lý quyền để gán các quyền phù hợp."
                    type="info"
                    showIcon
                  />
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Permissions Management Modal */}
        <Modal
          title={
            <Space>
              <KeyOutlined />
              Quản lý quyền: {viewingRole?.name}
            </Space>
          }
          open={isPermissionModalVisible}
          onCancel={() => {
            setIsPermissionModalVisible(false);
            setViewingRole(null);
            permissionForm.resetFields();
          }}
          onOk={() => permissionForm.submit()}
          width={1000}
          destroyOnClose
          okText="Lưu thay đổi"
          cancelText="Hủy"
          okButtonProps={{
            style: { backgroundColor: "#334766", borderColor: "#334766", width: 100 },
          }}
        >
          {viewingRole?.isSystemRole && (
            <Alert
              message="Vai trò hệ thống"
              description="Đây là vai trò hệ thống. Việc thay đổi quyền có thể ảnh hưởng đến hoạt động của hệ thống."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form
            form={permissionForm}
            layout="vertical"
            onFinish={handlePermissionSubmit}
          >
            <Form.Item
              name="permissions"
              label={`Chọn quyền cho vai trò "${viewingRole?.name}"`}
            >
              <div
                style={{
                  maxHeight: 400,
                  overflow: "auto",
                  border: "1px solid #d9d9d9",
                  padding: 16,
                  borderRadius: 6,
                }}
              >
                {availablePermissions.map((category) => (
                  <div key={category.category} style={{ marginBottom: 24 }}>
                    <Title
                      level={5}
                      style={{ marginBottom: 12, color: "#334766" }}
                    >
                      {category.category}
                    </Title>
                    <Checkbox.Group style={{ width: "100%" }}>
                      <Row>
                        {category.permissions.map((permission) => (
                          <Col
                            span={24}
                            key={permission.key}
                            style={{ marginBottom: 8 }}
                          >
                            <Checkbox value={permission.key}>
                              <div>
                                <div style={{ fontWeight: 500 }}>
                                  {permission.name}
                                </div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {permission.description}
                                </Text>
                              </div>
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Checkbox.Group>
                  </div>
                ))}
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default RoleManagement;
