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
import { roleService } from "../../services/roleService";
import { userService } from "../../services/userService";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const RoleManagement = ({ showHeader = true }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isPermissionModalVisible, setIsPermissionModalVisible] =
    useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const [permissionForm] = Form.useForm();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const [rolesData, usersData] = await Promise.all([
        roleService.getRoles(),
        userService.getUsers(),
      ]);
      setRoles(rolesData);
      setUsers(usersData);
      setTotalUsers(usersData.length);
    } catch (error) {
      console.error("Error loading roles:", error);
      message.error("Không thể tải danh sách vai trò");
    } finally {
      setLoading(false);
    }
  };

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
          name: "Xem bảng điều khiển",
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
      await roleService.deleteRole(roleId);
      setRoles(roles.filter((role) => role.id !== roleId));
      message.success("Đã xóa vai trò thành công");
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi xóa vai trò");
    }
  };

  const handleToggleStatus = async (roleId) => {
    try {
      const role = roles.find((r) => r.id === roleId);
      if (role?.isSystemRole) {
        message.warning("Không thể thay đổi trạng thái vai trò hệ thống");
        return;
      }

      const updatedRole = await roleService.toggleRoleStatus(roleId);
      const updatedRoles = roles.map((r) =>
        r.id === roleId ? updatedRole : r
      );
      setRoles(updatedRoles);
      message.success("Đã cập nhật trạng thái vai trò");
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const handleManagePermissions = (role) => {
    setViewingRole(role);
    permissionForm.setFieldsValue({
      permissions: role.permissions,
    });
    setIsPermissionModalVisible(true);
  };

  const handleAction = async (action, role) => {
    switch (action) {
      case "view":
        setViewingRole(role);
        setIsViewModalVisible(true);
        break;
      case "permissions":
        handleManagePermissions(role);
        break;
      case "edit":
        setEditingRole(role);
        form.setFieldsValue({
          name: role.name,
          description: role.description,
          status: role.status,
        });
        setIsModalVisible(true);
        break;
      case "delete":
        if (role.isSystemRole) {
          message.warning("Không thể xóa vai trò hệ thống");
          return;
        }
        if (role.userCount > 0) {
          message.warning("Không thể xóa vai trò đang có người dùng");
          return;
        }
        Modal.confirm({
          title: "Xác nhận xóa vai trò",
          content: `Bạn có chắc chắn muốn xóa vai trò "${role.name}" không? Hành động này không thể hoàn tác.`,
          okText: "Xóa",
          okType: "danger",
          cancelText: "Hủy",
          onOk: () => handleDelete(role.id),
        });
        break;
      default:
        break;
    }
  };

  const handleModalSubmit = async (values) => {
    try {
      if (editingRole) {
        // Update existing role
        const updatedRole = await roleService.updateRole(
          editingRole.id,
          values
        );
        const updatedRoles = roles.map((role) =>
          role.id === editingRole.id ? updatedRole : role
        );
        setRoles(updatedRoles);
        message.success("Cập nhật vai trò thành công");
      } else {
        // Create new role
        const newRole = await roleService.createRole(values);
        setRoles([...roles, newRole]);
        message.success("Tạo vai trò mới thành công");
      }
      setIsModalVisible(false);
      setEditingRole(null);
      form.resetFields();
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi lưu vai trò");
    }
  };

  const handlePermissionSubmit = async (values) => {
    try {
      const updatedRole = await roleService.updateRolePermissions(
        viewingRole.id,
        values.permissions || []
      );
      const updatedRoles = roles.map((role) =>
        role.id === viewingRole.id ? updatedRole : role
      );
      setRoles(updatedRoles);
      message.success("Cập nhật quyền thành công");
      setIsPermissionModalVisible(false);
      setViewingRole(null);
      permissionForm.resetFields();
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi cập nhật quyền");
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
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: getActionMenuItems(record),
            onClick: ({ key }) => handleAction(key, record),
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button type="text" icon={<DownOutlined />} size="small"></Button>
        </Dropdown>
      ),
    },
  ];

  const getActionMenuItems = (record) => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "Xem chi tiết",
      onClick: () => handleView(record),
    },
    {
      key: "permissions",
      icon: <KeyOutlined />,
      label: "Quản lý quyền",
      onClick: () => handleManagePermissions(record),
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Chỉnh sửa",
      onClick: () => handleEdit(record),
      disabled: record.isSystemRole,
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Xóa vai trò",
      danger: true,
      onClick: () => {
        if (record.isSystemRole) {
          message.warning("Không thể xóa vai trò hệ thống");
          return;
        }
        if (record.userCount > 0) {
          message.warning(
            `Không thể xóa vai trò đang được sử dụng bởi ${record.userCount} người dùng`
          );
          return;
        }
        Modal.confirm({
          title: "Xác nhận xóa vai trò",
          content: `Bạn có chắc chắn muốn xóa vai trò "${record.name}" không? Hành động này không thể hoàn tác.`,
          okText: "Xóa",
          okType: "danger",
          cancelText: "Hủy",
          onOk: () => handleDelete(record.id),
        });
      },
      disabled: record.isSystemRole || record.userCount > 0,
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
            <Col xs={24} sm={12} md={16} lg={8}>
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
            <Col xs={24} sm={12} md={8} lg={12}>
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
              </div>
            </Col>
          </Row>

          {/* Statistics */}
          {(() => {
            // Prepare dynamic stats cards
            const systemCount = roles.filter((r) => r.isSystemRole).length;
            const statsList = [
              { title: "Tổng vai trò", value: roles.length, color: "#334766" },
              {
                title: "Vai trò hệ thống",
                value: systemCount,
                color: "#faad14",
              },
              { title: "Tổng người dùng", value: totalUsers, color: "#722ed1" },
            ];
            const colSpan = 24 / statsList.length;
            return (
              <Row gutter={16} style={{ marginBottom: 24 }}>
                {statsList.map((stat) => (
                  <Col span={colSpan} key={stat.title}>
                    <Card size="small" style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 600,
                          color: stat.color,
                        }}
                      >
                        {stat.value}
                      </div>
                      <div style={{ color: "#666" }}>{stat.title}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            );
          })()}

          {/* Table */}
          <div className="table-container" style={{ overflow: "auto" }}>
            <Table
              columns={columns}
              dataSource={filteredRoles}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1200 }}
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
          title={
            <div
              style={{ fontSize: "20px", fontWeight: "600", color: "#334766" }}
            >
              {editingRole ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
            </div>
          }
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingRole(null);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          width={1200}
          centered
          destroyOnClose
          okText={editingRole ? "Cập nhật" : "Tạo mới"}
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
          <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
            <Form.Item
              name="name"
              label={
                <span style={{ fontWeight: "600", fontSize: "14px" }}>
                  Tên vai trò
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập tên vai trò!" },
                { min: 2, message: "Tên vai trò phải có ít nhất 2 ký tự!" },
                { max: 50, message: "Tên vai trò không được quá 50 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tên vai trò" size="large" />
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
            <Button
              key="edit"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setIsViewModalVisible(false);
                handleAction("edit", viewingRole);
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
          bodyStyle={{
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
            padding: "24px",
          }}
          width={1200}
        >
          {viewingRole && (
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <Descriptions
                column={2}
                bordered
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  backgroundColor: "#fafafa",
                  borderRight: "1px solid #d9d9d9",
                  padding: "12px 16px",
                  minWidth: "160px",
                }}
              >
                <Descriptions.Item label="Tên vai trò">
                  {viewingRole.name}
                </Descriptions.Item>
                <Descriptions.Item label="Tên chuẩn hóa">
                  <Text code>{viewingRole.normalizedName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số người dùng">
                  <Badge
                    count={
                      users.filter(
                        (user) =>
                          user.roles && user.roles.includes(viewingRole.name)
                      ).length
                    }
                    showZero
                  />
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

              <Divider>
                Người dùng có vai trò này (
                {
                  users.filter(
                    (user) =>
                      user.roles && user.roles.includes(viewingRole.name)
                  ).length
                }
                )
              </Divider>
              <div style={{ maxHeight: 300, overflow: "auto" }}>
                {(() => {
                  // Get users with this role
                  const roleUsers = users.filter(
                    (user) =>
                      user.roles && user.roles.includes(viewingRole.name)
                  );

                  if (roleUsers.length === 0) {
                    return (
                      <Alert
                        message="Chưa có người dùng nào"
                        description="Không có người dùng nào được gán vai trò này."
                        type="info"
                        showIcon
                      />
                    );
                  }

                  return (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    >
                      {roleUsers.map((user) => (
                        <Tag
                          key={user.id}
                          color="green"
                          style={{ marginBottom: 4, padding: "4px 8px" }}
                        >
                          <UserOutlined style={{ marginRight: "4px" }} />
                          {user.fullName} ({user.employeeCode})
                        </Tag>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </Modal>

        {/* Permissions Management Modal */}
        <Modal
          title={
            <div
              style={{ fontSize: "20px", fontWeight: "600", color: "#334766" }}
            >
              <Space>
                <KeyOutlined />
                Quản lý quyền: {viewingRole?.name}
              </Space>
            </div>
          }
          open={isPermissionModalVisible}
          onCancel={() => {
            setIsPermissionModalVisible(false);
            setViewingRole(null);
            permissionForm.resetFields();
          }}
          onOk={() => permissionForm.submit()}
          width={1200}
          centered
          destroyOnClose
          okText="Lưu thay đổi"
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
              label={
                <span style={{ fontWeight: "600", fontSize: "14px" }}>
                  Chọn quyền cho vai trò "{viewingRole?.name}"
                </span>
              }
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
