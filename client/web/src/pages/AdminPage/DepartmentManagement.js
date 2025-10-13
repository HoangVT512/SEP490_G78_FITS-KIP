import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Row,
  Col,
  Typography,
  Badge,
  Dropdown,
  message,
  Tooltip,
  Descriptions,
  Select,
  Tag,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  DownOutlined,
  ReloadOutlined,
  BankOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { ArchiveIcon } from "../../assets/icons";
import Layout from "../../components/Layout/Layout";
import { departmentService } from "../../services/departmentService";
import { userService } from "../../services/userService";
import { lineService } from "../../services/lineService";

const { Title, Text } = Typography;
const { Search } = Input;

const DepartmentManagement = ({ showHeader = true }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [viewingDepartment, setViewingDepartment] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [lines, setLines] = useState([]);
  const [form] = Form.useForm();

  const [showArchive, setShowArchive] = useState(() => {
    // Persist archive view state in localStorage
    const saved = localStorage.getItem("departmentArchiveView");
    return saved === "true";
  });

  // (Using Ant Design icon EyeOutlined for archive toggle)

  useEffect(() => {
    loadDepartments();
  }, []);

  // Persist archive view state on change
  useEffect(() => {
    localStorage.setItem(
      "departmentArchiveView",
      showArchive ? "true" : "false"
    );
  }, [showArchive]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const [departmentsData, allUsersData, linesData] = await Promise.all([
        departmentService.getDepartments(),
        userService.getUsers(), // Get all users to find managers
        lineService.getLines(),
      ]);

      // Map manager names and line counts to departments
      const departmentsWithDetails = departmentsData.map((dept) => {
        const departmentLines = linesData.filter(
          (line) => line.departmentId === dept.departmentId
        );

        // Find manager: user with role "Quản lý" AND assigned to this department (via lines)
        const manager = allUsersData.find((user) => {
          const hasManagerRole = user.roles && user.roles.includes("Quản lý");
          const belongsToDepartment = user.departmentId === dept.departmentId;
          return hasManagerRole && belongsToDepartment;
        });

        console.log(
          "Department:",
          dept.departmentName,
          "Found manager:",
          manager
        );

        return {
          ...dept,
          managerName: manager ? manager.fullName : null,
          managerId: manager ? manager.id : dept.managerId, // Update managerId if found
          managerEmployeeCode: manager ? manager.employeeCode : null,
          lineCount: departmentLines.length,
        };
      });

      setDepartments(departmentsWithDetails);
      // Still keep managers for the dropdown
      const managersData = await userService.getManagers();
      setManagers(managersData);
      setLines(linesData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading departments:", error);
      message.error("Không thể tải danh sách phòng ban");
      setLoading(false);
    }
  };

  const loadManagers = async () => {
    setLoadingManagers(true);
    try {
      const managersData = await userService.getManagers();
      setManagers(managersData);
    } catch (error) {
      console.error("Error loading managers:", error);
      message.error("Không thể tải danh sách quản lý");
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleDelete = async (departmentId) => {
    try {
      setLoading(true);
      await departmentService.deleteDepartment(departmentId);
      message.success("Đã xóa phòng ban thành công");
      loadDepartments(); // Reload danh sách
    } catch (error) {
      console.error("Error deleting department:", error);
      message.error("Không thể xóa phòng ban. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, department) => {
    switch (action) {
      case "view":
        setViewingDepartment(department);
        setIsViewModalVisible(true);
        break;
      case "edit":
        setEditingDepartment(department);
        form.setFieldsValue({
          departmentName: department.departmentName,
          description: department.description,
          managerId: department.managerId,
        });
        setIsModalVisible(true);
        break;
      case "delete":
        Modal.confirm({
          title: "Xác nhận xóa phòng ban",
          content: `Bạn có chắc chắn muốn xóa phòng ban "${department.departmentName}"?`,
          okText: "Xóa",
          cancelText: "Hủy",
          okType: "danger",
          okButtonProps: {
            style: {
              backgroundColor: "#334766",
              borderColor: "#334766",
              color: "#fff",
            },
          },
          onOk: () => handleDelete(department.departmentId),
        });
        break;
      case "activate":
        try {
          setLoading(true);
          await departmentService.updateDepartment(department.departmentId, {
            ...department,
            isActive: true,
          });
          message.success("Đã kích hoạt phòng ban thành công");
          loadDepartments();
        } catch (error) {
          console.error("Error activating department:", error);
          message.error("Không thể kích hoạt phòng ban");
          setLoading(false);
        }
        break;
      case "deactivate":
        Modal.confirm({
          title: "Xác nhận vô hiệu hóa phòng ban",
          content: `Bạn có chắc chắn muốn vô hiệu hóa phòng ban "${department.departmentName}"?`,
          okText: "Vô hiệu hóa",
          cancelText: "Hủy",
          okType: "danger",
          okButtonProps: {
            style: {
              backgroundColor: "#ff4d4f",
              borderColor: "#ff4d4f",
              color: "#fff",
            },
          },
          onOk: async () => {
            try {
              setLoading(true);
              await departmentService.updateDepartment(
                department.departmentId,
                {
                  ...department,
                  isActive: false,
                }
              );
              message.success("Đã vô hiệu hóa phòng ban thành công");
              loadDepartments();
            } catch (error) {
              console.error("Error deactivating department:", error);
              message.error("Không thể vô hiệu hóa phòng ban");
              setLoading(false);
            }
          },
        });
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
      key: department.isActive ? "deactivate" : "activate",
      icon: department.isActive ? <LockOutlined /> : <UnlockOutlined />,
      label: department.isActive ? "Khóa phòng ban" : "Mở khóa phòng ban",
      onClick: () =>
        handleAction(
          department.isActive ? "deactivate" : "activate",
          department
        ),
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
            {record.departmentId}
          </div>
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>
              {record.departmentName}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              <BankOutlined style={{ marginRight: "4px" }} />
              ID: {record.departmentId}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 300,
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
          <div
            style={{
              fontWeight: "500",
              color: record.managerName ? "#334766" : "#9ca3af",
            }}
          >
            <UserOutlined style={{ marginRight: "4px" }} />
            {record.managerName || "Chưa có quản lý"}
          </div>
          {record.managerName && (
            <div
              style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}
            >
              Mã NV: {record.managerEmployeeCode}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Số dây chuyền",
      key: "lines",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Badge
          count={record.lineCount || 0}
          showZero
          style={{ backgroundColor: "#334766" }}
        />
      ),
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

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.departmentName.toLowerCase().includes(searchText.toLowerCase()) ||
      (dept.managerName &&
        dept.managerName.toLowerCase().includes(searchText.toLowerCase())) ||
      dept.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && dept.isActive) ||
      (statusFilter === "inactive" && !dept.isActive);

    // Archive filter: only show inactive departments in archive, hide them in main list
    if (showArchive) {
      return !dept.isActive && matchesSearch && matchesStatus;
    } else {
      return dept.isActive && matchesSearch && matchesStatus;
    }
  });

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);

      if (editingDepartment) {
        // Update existing department
        await departmentService.updateDepartment(
          editingDepartment.departmentId,
          {
            departmentName: values.departmentName,
            managerId: values.managerId || null,
            description: values.description || "",
            isActive: editingDepartment.isActive,
          }
        );
        message.success("Cập nhật phòng ban thành công!");
      } else {
        // Create new department
        await departmentService.createDepartment({
          departmentName: values.departmentName,
          description: values.description?.trim()
            ? values.description.trim()
            : null,
        });
        message.success("Tạo phòng ban mới thành công!");
      }

      setIsModalVisible(false);
      setEditingDepartment(null);
      form.resetFields();
      loadDepartments();
    } catch (error) {
      console.error("Operation failed:", error);

      let errorMessage = editingDepartment
        ? "Cập nhật phòng ban thất bại!"
        : "Tạo phòng ban thất bại!";

      if (error.message && error.message.includes("Đã tồn tại phòng ban có tên")) {
        errorMessage = "Phòng ban này đã tồn tại";
      } else if (error.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
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
            {showArchive ? "Lưu trữ phòng ban" : "Quản lý phòng ban"}
          </Title>
          <Text type="secondary">
            {showArchive
              ? "Danh sách các phòng ban đã ngừng hoạt động"
              : "Quản lý thông tin các phòng ban trong công ty"}
          </Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={8}>
            <Input.Group compact>
              <Input
                placeholder="Tìm kiếm theo tên phòng ban, mô tả, tên quản lý..."
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
          <Col xs={24} sm={6} md={4}></Col>
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
                  setEditingDepartment(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                style={{ backgroundColor: "#334766", borderColor: "#334766" }}
              >
                Thêm phòng ban
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredDepartments}
          rowKey="departmentId"
          loading={loading}
          pagination={{
            total: filteredDepartments.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} phòng ban`,
          }}
          scroll={{ x: 1200 }}
          className="department-management-table"
          locale={{
            emptyText: "Không có dữ liệu phòng ban",
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <div
            style={{ fontSize: "20px", fontWeight: "600", color: "#334766" }}
          >
            {editingDepartment ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={1400}
        centered
        okText={editingDepartment ? "Cập nhật" : "Tạo mới"}
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
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="departmentName"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Tên phòng ban
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập tên phòng ban" },
                ]}
              >
                <Input placeholder="Nhập tên phòng ban" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Mô tả
                  </span>
                }
              >
                <Input.TextArea rows={3} placeholder="Nhập mô tả phòng ban" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="managerId"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Người quản lý
                    {editingDepartment && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "12px",
                          fontWeight: "normal",
                          marginLeft: "8px",
                        }}
                      >
                        (Chỉ xem - Thay đổi quản lý tại trang "Quản lý người
                        dùng")
                      </Text>
                    )}
                  </span>
                }
              >
                {editingDepartment ? (
                  <Select
                    placeholder="Không có người quản lý"
                    allowClear
                    disabled={true} // Always disabled for viewing
                    suffixIcon={null}
                    loading={loadingManagers}
                    options={managers}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                ) : (
                  <div
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "#f0f9ff",
                      border: "1px solid #bae6fd",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "flex-start",
                    }}
                  >
                    <UserOutlined
                      style={{
                        color: "#334766",
                        fontSize: "16px",
                        marginRight: "12px",
                        marginTop: "2px",
                      }}
                    />
                    <div>
                      <Text
                        strong
                        style={{ color: "#334766", display: "block" }}
                      >
                        Quản lý phòng ban
                      </Text>
                      <Text style={{ color: "#666", fontSize: "13px" }}>
                        Để gán người quản lý cho phòng ban, vui lòng:
                      </Text>
                      <ol
                        style={{
                          margin: "4px 0 0 0",
                          paddingLeft: "20px",
                          fontSize: "13px",
                          color: "#666",
                        }}
                      >
                        <li>
                          Vào trang <strong>"Quản lý người dùng"</strong>
                        </li>
                        <li>Chọn hoặc tạo người dùng cần làm quản lý</li>
                        <li>
                          Gán vai trò <strong>"Quản lý"</strong> và chọn phòng
                          ban này
                        </li>
                      </ol>
                    </div>
                  </div>
                )}
              </Form.Item>
              {editingDepartment && (
                <div
                  style={{
                    marginTop: "-16px",
                    marginBottom: "16px",
                    padding: "8px 12px",
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: "6px",
                  }}
                >
                  <Text type="secondary" style={{ fontSize: "13px" }}>
                    💡 <strong>Lưu ý:</strong> Để thay đổi người quản lý phòng
                    ban, vui lòng:
                  </Text>
                  <ol
                    style={{
                      margin: "4px 0 0 0",
                      paddingLeft: "20px",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    <li>
                      Vào trang <strong>"Quản lý người dùng"</strong>
                    </li>
                    <li>Chọn người dùng cần làm quản lý</li>
                    <li>
                      Chỉnh sửa và gán vai trò <strong>"Quản lý"</strong> + chọn
                      phòng ban tương ứng
                    </li>
                  </ol>
                </div>
              )}
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={
          <Space>
            <BankOutlined />
            Chi tiết phòng ban: {viewingDepartment?.departmentName}
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
        {viewingDepartment && (
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
              <Descriptions.Item label="ID phòng ban">
                {viewingDepartment.departmentId}
              </Descriptions.Item>
              <Descriptions.Item label="Tên phòng ban">
                {viewingDepartment.departmentName}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {viewingDepartment.description}
              </Descriptions.Item>
              <Descriptions.Item label="Mã nhân viên">
                {viewingDepartment.managerEmployeeCode || "Chưa có"}
              </Descriptions.Item>
              <Descriptions.Item label="Tên quản lý">
                {viewingDepartment.managerName || "Chưa có"}
              </Descriptions.Item>
              <Descriptions.Item label="Dây chuyền" span={2}>
                {(() => {
                  const departmentLines = lines.filter(
                    (line) =>
                      line.departmentId === viewingDepartment.departmentId
                  );
                  if (departmentLines.length === 0) {
                    return "Chưa có dây chuyền nào";
                  }
                  return (
                    <div>
                      <Text
                        strong
                        style={{ marginBottom: 8, display: "block" }}
                      >
                        Tổng cộng: {departmentLines.length} dây chuyền
                      </Text>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {departmentLines.map((line) => (
                          <Tag key={line.lineId} color="blue">
                            {line.lineName}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  );
                })()}
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
