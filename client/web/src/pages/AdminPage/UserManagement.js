import React, { useState, useRef, useEffect } from "react";
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
  Upload,
  Alert,
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
  UploadOutlined,
} from "@ant-design/icons";
import styles from "../../styles/pages/UserManagement.module.css";
import Layout from "../../components/Layout/Layout";
import dayjs from "dayjs";
import { userService } from "../../services/userService";
import { departmentService } from "../../services/departmentService";
import { roleService } from "../../services/roleService";
import * as XLSX from "xlsx";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const UserManagement = ({ showHeader = true }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchInput = useRef(null);
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
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showArchive, setShowArchive] = useState(() => {
    // Persist archive view state in localStorage
    const saved = localStorage.getItem("userArchiveView");
    return saved === "true";
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
    setLoading(true);
    Promise.all([
      userService.getUsers(),
      departmentService.getDepartments(),
      roleService.getRoles(),
    ])
      .then(([usersData, departmentsData, rolesData]) => {
        setUsers(usersData);
        setDepartments(departmentsData);
        setRoles(rolesData);
      })
      .catch((error) => {
        message.error({
          key: LOAD_USERS_ERROR_KEY,
          content:
            error.message || "Không thể tải dữ liệu. Vui lòng thử lại sau.",
          placement: "topRight",
          duration: 4,
        });
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Persist archive view state on change
  useEffect(() => {
    localStorage.setItem("userArchiveView", showArchive ? "true" : "false");
  }, [showArchive]);

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
      inactive: "Ngừng hoạt động",
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

  const getColumnSearchProps = (dataIndex, placeholderText) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`${placeholderText}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters && clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      return recordValue
        ? recordValue.toString().toLowerCase().includes(value.toLowerCase())
        : false;
    },
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  const handleDownloadTemplate = async () => {
    try {
      await userService.downloadTemplate();
      message.success("Đã tải file mẫu thành công!");
    } catch (error) {
      message.error("Lỗi khi tải file mẫu");
    }
  };

  const handleExportUsers = async () => {
    try {
      await userService.exportUsersToExcel();
      message.success("Đã xuất file Excel thành công!");
    } catch (error) {
      message.error("Lỗi khi xuất file Excel");
    }
  };

  const handleImport = async (file) => {
    setImporting(true);
    try {
      // Create FormData object and append the file
      const formData = new FormData();
      formData.append("file", file);

      const response = await userService.importUsersFromExcel(formData);
      if (response.successCount > 0) {
        message.success(
          `Đã nhập thành công ${response.successCount}/${response.totalUsers} người dùng!`
        );
      }
      if (response.failedCount > 0) {
        Modal.error({
          title: `${response.failedCount} người dùng không thể import`,
          width: 700,
          content: (
            <div style={{ maxHeight: "400px", overflow: "auto" }}>
              <ul>
                {response.failedUsers.map((failed, index) => (
                  <li key={index} style={{ marginBottom: "8px" }}>
                    <strong>{failed.userName || failed.email}</strong>:{" "}
                    {failed.error}
                  </li>
                ))}
              </ul>
            </div>
          ),
        });
      }
      setIsImportModalVisible(false);
      // Reload users from API
      const userData = await userService.getUsers();
      setUsers(userData);
    } catch (error) {
      message.error(error.message || "Lỗi khi import file Excel");
    } finally {
      setImporting(false);
    }
    return false;
  };

  const handleUserAction = async (action, user) => {
    switch (action) {
      case "view":
        setViewingUser(user);
        setIsViewModalVisible(true);
        break;
      case "edit":
        setEditingUser(user);
        // Convert role names to role IDs for form
        const userRoleIds = user.roles
          ? user.roles
              .map((roleName) => {
                const role = roles.find((r) => r.name === roleName);
                return role ? role.id : null;
              })
              .filter((id) => id !== null)
          : [];

        form.setFieldsValue({
          ...user,
          roleIds: userRoleIds,
          status: user.status === "active" ? "true" : "false",
        });
        setIsModalVisible(true);
        break;
      case "delete":
        try {
          await userService.deleteUser(user.id);
          setUsers(users.filter((u) => u.id !== user.id));
          message.success({
            content: "Đã xóa người dùng thành công",
            placement: "topRight",
            duration: 3,
          });
        } catch (error) {
          message.error("Không thể xóa người dùng");
        }
        break;
      case "lock": {
        try {
          await userService.updateUser(user.id, {
            ...user,
            isActive: false,
          });
          setUsers(
            users.map((u) =>
              u.id === user.id ? { ...u, status: "inactive" } : u
            )
          );
          message.success({
            content: "Đã khóa tài khoản người dùng",
            placement: "topRight",
            duration: 3,
          });
        } catch (error) {
          message.error("Không thể khóa tài khoản người dùng");
        }
        break;
      }
      case "unlock": {
        try {
          await userService.updateUser(user.id, {
            ...user,
            isActive: true,
          });
          setUsers(
            users.map((u) =>
              u.id === user.id ? { ...u, status: "active" } : u
            )
          );
          message.success({
            content: "Đã mở khóa tài khoản người dùng",
            placement: "topRight",
            duration: 3,
          });
        } catch (error) {
          message.error("Không thể mở khóa tài khoản người dùng");
        }
        break;
      }
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
      key: user.status === "inactive" ? "unlock" : "lock",
      icon: user.status === "inactive" ? <UnlockOutlined /> : <LockOutlined />,
      label:
        user.status === "inactive" ? "Mở khóa tài khoản" : "Khóa tài khoản",
      onClick: () =>
        handleUserAction(user.status === "inactive" ? "unlock" : "lock", user),
    },
    // {
    //   key: "delete",
    //   icon: <DeleteOutlined />,
    //   label: "Xóa",
    //   danger: true,
    //   onClick: () => handleUserAction("delete", user),
    // },
  ];

  // Department filter dropdown for the table
  const departmentFilterOptions = departments.map((dept) => ({
    label: dept.departmentName,
    value: dept.departmentName,
  }));

  const columns = [
    {
      title: "Người dùng",
      dataIndex: "fullName",
      key: "fullName",
      ...getColumnSearchProps("fullName", "Tìm kiếm tên hoặc mã NV"),
      sorter: (a, b) => {
        const aName = a.fullName || "";
        const bName = b.fullName || "";
        if (aName !== bName) {
          return aName.localeCompare(bName);
        }
        const aCode = a.employeeCode || "";
        const bCode = b.employeeCode || "";
        return aCode.localeCompare(bCode);
      },
      onFilter: (value, record) => {
        const name = record.fullName ? record.fullName.toLowerCase() : "";
        const code = record.employeeCode
          ? record.employeeCode.toLowerCase()
          : "";
        return (
          name.includes(value.toLowerCase()) ||
          code.includes(value.toLowerCase())
        );
      },
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
      key: "email",
      dataIndex: "email",
      ...getColumnSearchProps("email", "Tìm kiếm email hoặc số điện thoại"),
      onFilter: (value, record) => {
        const email = record.email ? record.email.toLowerCase() : "";
        const phone = record.phoneNumber
          ? record.phoneNumber.toLowerCase()
          : "";
        return (
          email.includes(value.toLowerCase()) ||
          phone.includes(value.toLowerCase())
        );
      },
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
      filters: departments
        .filter(
          (dept, idx, arr) =>
            arr.findIndex((d) => d.departmentName === dept.departmentName) ===
            idx
        )
        .map((dept) => ({
          text: dept.departmentName,
          value: dept.departmentName,
        })),
      onFilter: (value, record) => record.department === value,
      render: (department) => (
        <div>
          <TeamOutlined style={{ color: "#334766", marginRight: 6 }} />
          <Text>{department}</Text>
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      key: "roles",
      width: 180,
      render: (roles) => (
        <div>
          {roles && roles.length > 0 ? (
            roles.map((role, index) => (
              <Tag
                key={index}
                color={getRoleColor(role)}
                style={{ marginBottom: 2 }}
              >
                {role}
              </Tag>
            ))
          ) : (
            <Tag color="default">Chưa có vai trò</Tag>
          )}
        </div>
      ),
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
    // showArchive && {
    //   title: "",
    //   key: "exitArchive",
    //   width: 80,
    //   render: (_, record) => (
    //     <Button
    //       type="link"
    //       danger
    //       onClick={async () => {
    //         // Mark user as not archived (remove from archive view, but keep status inactive)
    //         setLoading(true);
    //         try {
    //           await userService.updateUser(record.id, {
    //             ...record,
    //             archived: false, // You may need to add this field in backend/model
    //           });
    //           setUsers(users.map(u =>
    //             u.id === record.id ? { ...u, archived: false } : u
    //           ));
    //           message.success("Đã đưa người dùng ra khỏi lưu trữ");
    //         } catch (error) {
    //           message.error("Không thể đưa người dùng ra khỏi lưu trữ");
    //         } finally {
    //           setLoading(false);
    //         }
    //       }}
    //     >
    //       Thoát lưu trữ
    //     </Button>
    //   ),
    // },
  ].filter(Boolean);

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

    // Archive filter: only show inactive users in archive, hide them in main list
    if (showArchive) {
      return (
        searchMatch &&
        roleMatch &&
        departmentMatch &&
        user.status === "inactive"
      );
    } else {
      return (
        searchMatch &&
        statusMatch &&
        roleMatch &&
        departmentMatch &&
        user.status !== "inactive"
      );
    }
  });

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editingUser) {
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
          isActive: values.status === "true",
        });
        message.success({
          content: "Cập nhật người dùng thành công",
          placement: "topRight",
          duration: 3,
        });
      } else {
        await userService.createUser({
          userName: values.email,
          email: values.email,
          password: values.password,
          fullName: values.fullName,
          employeeCode: values.employeeCode,
          phoneNumber: values.phoneNumber,
          position: values.position,
          gender: values.gender || "Nam",
          roleIds: values.roleIds || [],
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
      // Reload users from API
      const userData = await userService.getUsers();
      setUsers(userData);
    } catch (error) {
      message.error({
        content: editingUser
          ? "Cập nhật người dùng thất bại!"
          : "Tạo người dùng thất bại. Vui lòng xem lại trường thông tin!",
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

  const content = (
    <div className={styles.userManagementContainer}>
      <Card className={styles.userManagementCard}>
        <div className={styles.userManagementHeader}>
          <Title level={3} className={styles.userManagementTitle}>
            <UserOutlined className={styles.userManagementTitleIcon} />
            Quản lý người dùng
          </Title>
          <Text type="secondary">
            Quản lý thông tin và phân quyền người dùng trong hệ thống
          </Text>
        </div>

        <Row gutter={[16, 16]} className={styles.userSearchControls}>
          <Col xs={24} sm={12} md={8}>
            <Search
              style={{ hover: { borderColor: "#334766" } }}
              placeholder="Tìm kiếm theo tên, email, mã NV..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              className={styles.userSearchInput}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              className={styles.userSearchInput}
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Ngừng hoạt động</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.role}
              onChange={(value) => setFilters({ ...filters, role: value })}
              style={{ width: "100%" }}
              placeholder="Vai trò"
              loading={roles.length === 0}
            >
              <Option value="all">Tất cả vai trò</Option>
              {roles.map((role) => (
                <Option key={role.id} value={role.name}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Row
          style={{ marginTop: "16px", marginBottom: "16px" }}
          gutter={[8, 8]}
          justify="space-between"
        >
          <Col>
            <Space wrap>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingUser(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                style={{ backgroundColor: "#334766", borderColor: "#334766" }}
              >
                Thêm người dùng
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const userData = await userService.getUsers();
                    setUsers(userData);
                  } catch (error) {
                    message.error("Không thể tải lại danh sách người dùng");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
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
          <Col>
            <Space wrap>
              <Button
                icon={<ImportOutlined />}
                onClick={() => setIsImportModalVisible(true)}
              >
                Nhập từ Excel
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExportUsers}>
                Xuất Excel
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText:
              searchText ||
              filters.status !== "all" ||
              filters.role !== "all" ||
              filters.department !== "all"
                ? "Không có người dùng nào phù hợp với tìm kiếm hoặc bộ lọc."
                : "Không có dữ liệu người dùng.",
          }}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} người dùng`,
          }}
          className={styles.userManagementTable}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="Nhập danh sách người dùng từ Excel"
        open={isImportModalVisible}
        onCancel={() => setIsImportModalVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ padding: "20px 0" }}>
          <Alert
            message="Hướng dẫn import"
            description={
              <div>
                <p style={{ marginBottom: 8 }}>
                  File Excel cần có các cột theo thứ tự:
                </p>
                <ol style={{ paddingLeft: 20, marginBottom: 8 }}>
                  <li>
                    <strong>UserName</strong> - Tên đăng nhập (bắt buộc)
                  </li>
                  <li>
                    <strong>Email</strong> - Email (bắt buộc, phải duy nhất)
                  </li>
                  <li>
                    <strong>Password</strong> - Mật khẩu (để trống = mật khẩu
                    mặc định)
                  </li>
                  <li>
                    <strong>FullName</strong> - Họ và tên đầy đủ
                  </li>
                  <li>
                    <strong>Gender</strong> - Giới tính (Male/Female)
                  </li>
                  <li>
                    <strong>EmployeeCode</strong> - Mã nhân viên (phải duy nhất)
                  </li>
                  <li>
                    <strong>Position</strong> - Chức vụ
                  </li>
                  <li>
                    <strong>PhoneNumber</strong> - Số điện thoại
                  </li>
                </ol>
                <p style={{ color: "#ff4d4f", marginTop: 8 }}>
                  ⚠️ Lưu ý: Email và Mã nhân viên phải là duy nhất, không được
                  trùng với dữ liệu đã có
                </p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Button
              icon={<ExportOutlined />}
              onClick={handleDownloadTemplate}
              block
              type="dashed"
            >
              Tải file mẫu Excel
            </Button>

            <Upload
              accept=".xlsx,.xls"
              beforeUpload={handleImport}
              showUploadList={false}
              disabled={importing}
            >
              <Button
                icon={<UploadOutlined />}
                loading={importing}
                type="primary"
                block
              >
                {importing
                  ? "Đang nhập dữ liệu..."
                  : "Chọn file Excel để import"}
              </Button>
            </Upload>
          </Space>
        </div>
      </Modal>

      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={1200}
        okText={editingUser ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        okButtonProps={{
          style: {
            backgroundColor: "#334766",
            borderColor: "#334766",
            width: "150px",
          },
        }}
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
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const existing = users.find(
                        (u) =>
                          u.employeeCode &&
                          u.employeeCode.toLowerCase() ===
                            value.toLowerCase() &&
                          u.id !== (editingUser?.id || "")
                      );
                      if (existing) {
                        return Promise.reject(
                          new Error("Mã nhân viên đã tồn tại")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
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
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const existing = users.find(
                        (u) =>
                          u.email.toLowerCase() === value.toLowerCase() &&
                          u.id !== (editingUser?.id || "")
                      );
                      if (existing) {
                        return Promise.reject(new Error("Email đã tồn tại"));
                      }
                      return Promise.resolve();
                    },
                  },
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
                  {
                    type: "string",
                    min: 10,
                    max: 11,
                    message: "Số điện thoại không hợp lệ",
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const existing = users.find(
                        (u) =>
                          u.phoneNumber === value &&
                          u.id !== (editingUser?.id || "")
                      );
                      if (existing) {
                        return Promise.reject(
                          new Error("Số điện thoại đã tồn tại")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
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
                // rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
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
                // rules={[{ required: true, message: "Vui lòng nhập chức vụ" }]}
              >
                <Input placeholder="Nhập chức vụ" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleIds"
                label="Vai trò"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một vai trò",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn vai trò"
                  loading={roles.length === 0}
                  allowClear
                >
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
                  <Option value="true">Hoạt động</Option>
                  <Option value="false">Ngừng hoạt động</Option>
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
            style={{ backgroundColor: "#334766", borderColor: "#334766" }}
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
