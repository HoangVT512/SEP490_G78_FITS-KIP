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
  Descriptions,
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
  WarningOutlined,
  IdcardOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { ArchiveIcon } from "../../assets/icons";
import styles from "../../styles/pages/UserManagement.module.css";
import Layout from "../../components/Layout/Layout";
import dayjs from "dayjs";
import { userService } from "../../services/userService";
import { departmentService } from "../../services/departmentService";
import { roleService } from "../../services/roleService";
import { lineService } from "../../services/lineService";
import * as XLSX from "xlsx";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const UserManagement = ({ showHeader = true }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchInput = useRef(null);
  const [searchText, setSearchText] = useState("");
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
  const [lines, setLines] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [filteredLines, setFilteredLines] = useState([]);
  const [isManagementRoleSelected, setIsManagementRoleSelected] =
    useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showArchive, setShowArchive] = useState(() => {
    // Persist archive view state in localStorage
    const saved = localStorage.getItem("userArchiveView");
    return saved === "true";
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      userService.getUsers(),
      departmentService.getActiveDepartments(),
      roleService.getRoles(),
      lineService.getActiveLines(),
    ])
      .then(([usersData, departmentsData, rolesData, linesData]) => {
        // Map department names to users
        const departments = Array.isArray(departmentsData) ? departmentsData : [];
        const mappedUsers = usersData.map(user => ({
          ...user,
          department: user.departmentId
            ? departments.find(dept => dept.departmentId === user.departmentId)?.departmentName || user.department
            : user.department,
        }));

        setUsers(mappedUsers);
        setDepartments(departments);
        setRoles(rolesData || []);
        setLines(linesData || []);
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

  // Filter lines based on selected department
  useEffect(() => {
    if (lines && Array.isArray(lines)) {
      setFilteredLines(lines);
    } else {
      setFilteredLines([]);
    }
  }, [lines]);

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
      "Quản trị viên": "red",
      "Quản lý": "volcano",
      "Quản lý kỹ thuật": "orange",
      "Tổ trưởng": "green",
      "Kỹ thuật viên": "blue",
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
                    <strong>{failed.fullName || failed.email}</strong>:{" "}
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
      // Map department names to users
      const mappedUsers = userData.map(user => ({
        ...user,
        department: user.departmentId
          ? departments.find(dept => dept.departmentId === user.departmentId)?.departmentName || user.department
          : user.department,
      }));
      setUsers(mappedUsers);
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
        // Normalize user object for the view modal: ensure departments and roles are arrays
        const normalizedUser = {
          ...user,
          departments: user.departmentId
            ? [
              {
                departmentId: user.departmentId,
                departmentName: user.department,
              },
            ]
            : [],
          roles: Array.isArray(user.roles)
            ? user.roles
            : user.role
              ? [user.role]
              : [],
          isActive: user.status === "active",
        };
        setViewingUser(normalizedUser);
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
          // Make email/phone empty if they're null or contain placeholder like 'N/A'
          email:
            user.email && user.email !== "N/A" && user.email !== "-"
              ? user.email
              : "",
          phoneNumber:
            user.phoneNumber &&
              user.phoneNumber !== "N/A" &&
              user.phoneNumber !== "-"
              ? user.phoneNumber
              : "",
          roleIds: userRoleIds.length > 0 ? userRoleIds[0] : null,
          departmentId: user.departmentId,
          lineIds: user.lineIds || [],
          status: user.status === "active" ? "true" : "false",
        });

        // Set selected department and update filtered lines
        setSelectedDepartmentId(user.departmentId);
        if (user.departmentId && lines && Array.isArray(lines)) {
          const deptLines = lines.filter((line) => line.departmentId === user.departmentId);
          setFilteredLines(deptLines);

          // Check if user is management and auto-select all lines
          const selectedRole = roles.find((r) => r.id === userRoleIds[0]);
          const isManagement = selectedRole &&
            ((selectedRole.name || "").trim().toLowerCase() === "quản lý" ||
              (selectedRole.name || "").trim().toLowerCase() === "manager");

          if (isManagement) {
            const allLineIds = deptLines.map(line => line.lineId);
            form.setFieldsValue({ ...form.getFieldsValue(), lineIds: allLineIds });
          }
        } else {
          setFilteredLines([]);
        }

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
        // Prevent locking admin accounts. Roles may be strings (e.g. "Quản trị viên") or objects { name: 'Quản trị viên' }.
        if (
          user.roles &&
          user.roles.some((r) => {
            const roleName = typeof r === "string" ? r : r && r.name;
            return (
              roleName &&
              ["quản trị viên", "admin", "administrator"].includes(
                roleName.toLowerCase()
              )
            );
          })
        ) {
          message.warning("Không thể khóa tài khoản của quản trị viên");
          break;
        }

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

  const actionMenuItems = (user) =>
    [
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
        icon:
          user.status === "inactive" ? <UnlockOutlined /> : <LockOutlined />,
        label:
          user.status === "inactive" ? "Mở khóa tài khoản" : "Khóa tài khoản",
        danger: user.status === "active", // Make deactivate action red
        onClick: () => {
          const isActive = user.status === "active";
          Modal.confirm({
            title: isActive
              ? "Xác nhận khóa tài khoản"
              : "Xác nhận mở khóa tài khoản",
            content: isActive
              ? "Bạn có chắc chắn muốn ngừng hoạt động tài khoản này? Người dùng sẽ không thể đăng nhập."
              : "Bạn có chắc chắn muốn kích hoạt lại tài khoản này?",
            okText: isActive ? "Khóa tài khoản" : "Mở khóa tài khoản",
            cancelText: "Hủy",
            okButtonProps: {
              danger: isActive,
              style: isActive
                ? {}
                : { backgroundColor: "#52c41a", borderColor: "#52c41a" },
            },
            onOk: () => handleUserAction(isActive ? "lock" : "unlock", user),
          });
        },
      },
      // {
      //   key: "delete",
      //   icon: <DeleteOutlined />,
      //   label: "Xóa",
      //   danger: true,
      //   onClick: () => handleUserAction("delete", user),
      // },
    ].filter(Boolean);

  // Department filter dropdown for the table
  const departmentFilterOptions = (
    Array.isArray(departments) ? departments : []
  ).map((dept) => ({
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
      render: (_, record) => {
        // Treat placeholders or missing values as empty for display
        const emailDisplay =
          record.email && record.email !== "N/A" && record.email !== "-"
            ? record.email
            : "Chưa có";
        const phoneDisplay =
          record.phoneNumber &&
            record.phoneNumber !== "N/A" &&
            record.phoneNumber !== "-"
            ? record.phoneNumber
            : "Chưa có";

        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <MailOutlined style={{ color: "#334766", marginRight: 6 }} />
              <Text style={{ fontSize: "13px" }}>{emailDisplay}</Text>
            </div>
            <div>
              <PhoneOutlined style={{ color: "#334766", marginRight: 6 }} />
              <Text style={{ fontSize: "13px" }}>{phoneDisplay}</Text>
              {phoneDisplay && record.phoneConfirmed && (
                <Badge
                  status="success"
                  style={{ marginLeft: 6 }}
                  title="Số điện thoại đã xác thực"
                />
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      width: 150,
      filters: Array.isArray(departments)
        ? departments
          .filter(
            (dept, idx, arr) =>
              arr.findIndex(
                (d) => d.departmentName === dept.departmentName
              ) === idx
          )
          .map((dept) => ({
            text: dept.departmentName,
            value: dept.departmentName,
          }))
        : [],
      onFilter: (value, record) => record.department === value,
      render: (department) => (
        <div>
          <TeamOutlined style={{ color: "#334766", marginRight: 6 }} />
          <Text>{department || "Chưa có PB"}</Text>
        </div>
      ),
    },
    {
      title: "Dây chuyền",
      dataIndex: "lineIds",
      key: "lineIds",
      width: 180,
      filters: Array.isArray(lines)
        ? lines
          .filter((line) => line.lineName)
          .map((line) => ({
            text: line.lineName,
            value: line.lineId,
          }))
        : [],
      onFilter: (value, record) =>
        record.lineIds && record.lineIds.includes(value),
      render: (lineIds) => {
        if (!lineIds || lineIds.length === 0) {
          return <Tag color="default">Chưa có dây chuyền</Tag>;
        }
        const lineNames = lineIds
          .map((lineId) => {
            const line = lines.find((l) => l.lineId === lineId);
            return line ? line.lineName : lineId;
          })
          .filter(Boolean);
        return (
          <Tooltip title={lineNames.join(", ")}>
            <div style={{ cursor: "pointer" }}>
              {lineNames.slice(0, 2).map((name, index) => (
                <Tag key={index} color="blue" style={{ marginRight: 4, marginBottom: 2 }}>
                  {name}
                </Tag>
              ))}
              {lineNames.length > 2 && (
                <Text style={{ color: "#1890ff" }}>
                  +{lineNames.length - 2}...
                </Text>
              )}
            </div>
          </Tooltip>
        );
      },
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

      // Check if selected role is a management role and department is selected
      const selectedRole = roles.find((r) => r.id === values.roleIds);
      const isManagementRole =
        selectedRole &&
        ((selectedRole.name || "").trim().toLowerCase() === "quản lý" ||
          (selectedRole.name || "").trim().toLowerCase() === "manager");

      if (isManagementRole && values.departmentId) {
        try {
          // Check if department already has a manager
          const departmentDetails = await departmentService.getDepartmentById(
            values.departmentId
          );
          // Only show error if department has a manager AND it's not the current user being edited
          if (
            departmentDetails.managerId &&
            departmentDetails.managerId !== editingUser?.id
          ) {
            message.error({
              content: `Phòng ban "${departmentDetails.departmentName}" đã có quản lý. Không thể thêm vai trò quản lý cho phòng ban này.`,
              placement: "topRight",
              duration: 5,
            });
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error checking department manager:", error);
          message.error({
            content:
              "Không thể kiểm tra thông tin quản lý phòng ban. Vui lòng thử lại.",
            placement: "topRight",
            duration: 3,
          });
          setLoading(false);
          return;
        }
      }

      if (editingUser) {
        await userService.updateUser(editingUser.id, {
          userName: values.email,
          email: values.email,
          fullName: values.fullName,
          employeeCode: values.employeeCode,
          phoneNumber: values.phoneNumber,
          isActive: values.status === "true",
          roleIds: values.roleIds ? [values.roleIds] : [],
          departmentId: values.departmentId,
          lineIds: values.lineIds || [],
        });
        message.success({
          content: "Cập nhật người dùng thành công",
          placement: "topRight",
          duration: 3,
        });
      } else {
        await userService.createUser({
          userName: values.employeeCode,
          email: values.email,
          password: "123456",
          fullName: values.fullName,
          employeeCode: values.employeeCode,
          phoneNumber: values.phoneNumber,
          isActive: true,
          roleIds: values.roleIds ? [values.roleIds] : [],
          departmentId: values.departmentId,
          lineIds: values.lineIds || [],
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
      // Ensure management-role flag is cleared after creating/updating
      setIsManagementRoleSelected(false);
      // Reload users from API
      const userData = await userService.getUsers();
      // Map department names to users
      const mappedUsers = userData.map(user => ({
        ...user,
        department: user.departmentId
          ? departments.find(dept => dept.departmentId === user.departmentId)?.departmentName || user.department
          : user.department,
      }));
      setUsers(mappedUsers);
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
    // Reset management-role flag to avoid stale state when reopening modal
    setIsManagementRoleSelected(false);
    setSelectedDepartmentId(null);
    setFilteredLines([]);
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
              value={filters.role}
              onChange={(value) => setFilters({ ...filters, role: value })}
              style={{ width: "100%" }}
              placeholder="Vai trò"
              loading={roles.length === 0}
            >
              <Option value="all">Tất cả vai trò</Option>
              {roles &&
                roles.map((role) => (
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
                  // Reset management-role flag when opening Add User modal
                  setIsManagementRoleSelected(false);
                  setSelectedDepartmentId(null);
                  setFilteredLines([]);
                  setIsModalVisible(true);
                }}
                style={{ backgroundColor: "#334766", borderColor: "#334766" }}
              >
                Thêm người dùng
              </Button>
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
                    <strong>Email</strong> - Email (bắt buộc, phải duy nhất)
                  </li>
                  <li>
                    <strong>FullName</strong> - Họ và tên đầy đủ
                  </li>
                  <li>
                    <strong>EmployeeCode</strong> - Mã nhân viên (phải duy nhất)
                  </li>
                  <li>
                    <strong>Role</strong> - Vai trò (chọn từ dropdown có sẵn
                    trong file Excel)
                  </li>
                  <li>
                    <strong>PhoneNumber</strong> - Số điện thoại
                  </li>
                </ol>
                <div
                  style={{
                    backgroundColor: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    padding: "12px",
                    borderRadius: "4px",
                    marginBottom: 8,
                  }}
                >
                  <strong>ℹ️ Thông tin tự động:</strong>
                  <br />
                  • Tên đăng nhập sẽ được tự động đặt bằng địa chỉ email
                  <br />• Mật khẩu mặc định sẽ được tự động đặt là{" "}
                  <strong>'123456'</strong>
                  <br />• <strong>Cột Role:</strong> Sử dụng dropdown để chọn từ
                  danh sách roles có sẵn trong hệ thống
                </div>
                <p style={{ color: "#ff4d4f", marginTop: 8 }}>
                  ⚠️ Lưu ý quan trọng:
                  <br />
                  • Email, Mã nhân viên và Số điện thoại phải là duy nhất, không
                  được trùng với dữ liệu đã có
                  <br />• <strong>Số điện thoại:</strong> Nếu số bắt đầu bằng 0
                  (như 0123456789), hãy định dạng cột là Text trong Excel để
                  tránh mất số 0
                </p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Space
            size="middle"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <Button
              icon={<ExportOutlined />}
              onClick={handleDownloadTemplate}
              type="dashed"
              style={{ width: "250px" }}
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
                style={{ width: "250px" }}
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
        title={
          <div
            style={{ fontSize: "20px", fontWeight: "600", color: "#334766" }}
          >
            {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={1400}
        centered
        okText={editingUser ? "Cập nhật" : "Tạo mới"}
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
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changedValues) => {
            // When role selection changes, detect management roles and handle line selection
            if (changedValues.roleIds !== undefined) {
              const roleId = changedValues.roleIds;
              const selectedRole = roles.find((r) => r.id === roleId);
              const isManagement =
                selectedRole &&
                ((selectedRole.name || "").trim().toLowerCase() === "quản lý" ||
                  (selectedRole.name || "").trim().toLowerCase() === "manager");
              setIsManagementRoleSelected(!!isManagement);
              if (isManagement && selectedDepartmentId) {
                // Auto-select all lines for management role in selected department
                const deptLines = lines.filter((line) => line.departmentId === selectedDepartmentId);
                const allLineIds = deptLines.map(line => line.lineId);
                form.setFieldsValue({ lineIds: allLineIds });
              } else if (!isManagement) {
                // Clear line selection when no longer management
                form.setFieldsValue({ lineIds: [] });
              }
            }
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            {!editingUser && (
              <Alert
                message={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Thông tin tùy chọn
                  </span>
                }
                description={
                  <span style={{ fontSize: "13px" }}>
                    Email và số điện thoại có thể để trống khi tạo người dùng mới.
                  </span>
                }
                type="info"
                style={{
                  backgroundColor: "#e6f4ff",
                  border: "1px solid #91caff",
                  marginBottom: "12px",
                }}
              />
            )}
            {!editingUser && (
              <Alert
                message={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Mật khẩu mặc định
                  </span>
                }
                description={
                  <span style={{ fontSize: "13px" }}>
                    Mật khẩu mặc định cho người dùng mới là '123456'. Người dùng
                    có thể thay đổi mật khẩu sau khi đăng nhập.
                  </span>
                }
                type="warning"
                style={{
                  backgroundColor: "#fffbe6",
                  border: "1px solid #ffe58f",
                }}
              />
            )}
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Họ và tên
                  </span>
                }
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input placeholder="Nhập họ và tên" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="employeeCode"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Mã nhân viên
                  </span>
                }
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
                <Input placeholder="Nhập mã nhân viên" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Email
                  </span>
                }
                rules={[
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
                <Input placeholder="Nhập địa chỉ email" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Số điện thoại
                  </span>
                }
                rules={[
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
                <Input placeholder="Nhập số điện thoại" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="departmentId"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Phòng ban
                  </span>
                }
              // rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
              >
                <Select
                  placeholder="Chọn phòng ban"
                  size="large"
                  loading={
                    !Array.isArray(departments) || departments.length === 0
                  }
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    setSelectedDepartmentId(value);
                    // Update filtered lines based on selected department
                    if (value && lines && Array.isArray(lines)) {
                      const deptLines = lines.filter((line) => line.departmentId === value);
                      setFilteredLines(deptLines);

                      // Check if current role is management
                      const roleId = form.getFieldValue("roleIds");
                      const selectedRole = roles.find((r) => r.id === roleId);
                      const currentIsManagement = selectedRole &&
                        ((selectedRole.name || "").trim().toLowerCase() === "quản lý" ||
                          (selectedRole.name || "").trim().toLowerCase() === "manager");

                      if (currentIsManagement) {
                        // Auto-select all lines for management role
                        const allLineIds = deptLines.map(line => line.lineId);
                        form.setFieldsValue({ lineIds: allLineIds });
                      } else {
                        // Clear line selection for non-management
                        form.setFieldsValue({ lineIds: [] });
                      }
                    } else {
                      setFilteredLines([]);
                      form.setFieldsValue({ lineIds: [] });
                    }
                  }}
                >
                  {Array.isArray(departments) &&
                    departments.map((dept) => (
                      <Option key={dept.departmentId} value={dept.departmentId}>
                        {dept.departmentName}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lineIds"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Dây chuyền
                  </span>
                }
              // rules={[{ required: true, message: "Vui lòng chọn dây chuyền" }]}
              >
                {
                  // Determine current role directly from form to avoid stale state
                }
                <Select
                  mode="multiple"
                  placeholder={(() => {
                    if (!selectedDepartmentId)
                      return "Bạn cần chọn phòng ban trước";
                    if (filteredLines.length === 0)
                      return "Phòng ban này chưa có dây chuyền nào";
                    return "Chọn dây chuyền";
                  })()}
                  size="large"
                  loading={!lines || lines.length === 0}
                  disabled={(() => {
                    return (
                      !selectedDepartmentId ||
                      filteredLines.length === 0
                    );
                  })()}
                  allowClear
                  maxTagCount={2}
                  maxTagPlaceholder={(omittedValues) => `+ ${omittedValues.length} ...`}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={(() => {
                    if (!selectedDepartmentId) {
                      return (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#ff4d4f",
                            padding: "8px",
                          }}
                        >
                          Bạn cần chọn phòng ban trước
                        </div>
                      );
                    }
                    if (filteredLines.length === 0) {
                      return (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#faad14",
                            padding: "8px",
                          }}
                        >
                          Phòng ban này chưa có dây chuyền nào. Vui lòng tạo dây chuyền trước.
                        </div>
                      );
                    }
                    return "Không có dây chuyền nào";
                  })()}
                >
                  {filteredLines.map((line) => (
                    <Option key={line.lineId} value={line.lineId}>
                      {line.lineName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleIds"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Vai trò
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn một vai trò",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn vai trò"
                  size="large"
                  loading={roles.length === 0}
                  allowClear
                >
                  {roles &&
                    roles.map((role) => (
                      <Option key={role.id} value={role.id}>
                        {role.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              {editingUser ? (
                <Form.Item
                  name="status"
                  label={
                    <span style={{ fontWeight: "600", fontSize: "14px" }}>
                      Trạng thái
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn trạng thái" },
                  ]}
                >
                  <Select placeholder="Chọn trạng thái" size="large" allowClear>
                    <Option value="true">Hoạt động</Option>
                    <Option value="false">Ngừng hoạt động</Option>
                  </Select>
                </Form.Item>
              ) : (
                <Form.Item
                  label={
                    <span style={{ fontWeight: "600", fontSize: "14px" }}>
                      Trạng thái
                    </span>
                  }
                >
                  <Select size="large" value="true" disabled>
                    <Option value="true">Hoạt động (Mặc định)</Option>
                  </Select>
                </Form.Item>
              )}
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
        width={1200}
        footer={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setIsViewModalVisible(false);
              handleUserAction("edit", viewingUser);
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
        {viewingUser && (
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {/* Simplified user details — only fields present in DB */}
            <Card size="small" style={{ marginBottom: 16 }}>
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
                <Descriptions.Item label="Họ và tên">
                  {viewingUser.fullName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Mã nhân viên">
                  {viewingUser.employeeCode || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Tên đăng nhập">
                  {viewingUser.userName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {viewingUser.email || ""}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {viewingUser.phoneNumber || ""}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Badge status={getStatusColor(viewingUser.status)} text={getStatusText(viewingUser.status)} />
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                  {Array.isArray(viewingUser.roles)
                    ? viewingUser.roles.join(", ")
                    : viewingUser.role || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Phòng ban">
                  {viewingUser.departments && viewingUser.departments.length > 0
                    ? viewingUser.departments
                      .map((d) => d.departmentName)
                      .join(", ")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Dây chuyền">
                  {viewingUser.lineIds && viewingUser.lineIds.length > 0
                    ? (() => {
                        const userLines = viewingUser.lineIds
                          .map((lineId) => {
                            const line = lines.find((l) => l.lineId === lineId);
                            return line;
                          })
                          .filter(Boolean);
                        return (
                          <div>
                            <Text
                              strong
                              style={{ marginBottom: 8, display: "block" }}
                            >
                              Tổng cộng: {userLines.length} dây chuyền
                            </Text>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                              }}
                            >
                              {userLines.map((line) => (
                                <Tag key={line.lineId} color="blue">
                                  {line.lineName}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        );
                      })()
                    : "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );

  return showHeader ? <Layout>{content}</Layout> : content;
};

export default UserManagement;
