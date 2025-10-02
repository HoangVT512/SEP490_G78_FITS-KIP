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
import Layout from "../../components/Layout/Layout";
import { departmentService } from "../../services/departmentService";
import { userService } from "../../services/userService";

const { Title, Text } = Typography;
const { Search } = Input;

const DepartmentManagement = ({ showHeader = true }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [viewingDepartment, setViewingDepartment] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [form] = Form.useForm();

  const [showArchive, setShowArchive] = useState(() => {
    // Persist archive view state in localStorage
    const saved = localStorage.getItem("departmentArchiveView");
    return saved === "true";
  });

  // Archive icon component
  function ArchiveIcon() {
    return (
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}>
        <rect x="3" y="7" width="18" height="13" rx="2" stroke="#334766" strokeWidth="2" />
        <rect x="2" y="3" width="20" height="4" rx="1" stroke="#334766" strokeWidth="2" />
        <path d="M9 12h6" stroke="#334766" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  // Persist archive view state on change
  useEffect(() => {
    localStorage.setItem("departmentArchiveView", showArchive ? "true" : "false");
  }, [showArchive]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const [departmentsData, managersData] = await Promise.all([
        departmentService.getDepartments(),
        userService.getManagers(),
      ]);

      // Map manager names to departments
      const departmentsWithManagerNames = departmentsData.map((dept) => {
        const manager = managersData.find((m) => m.id === dept.managerId);
        return {
          ...dept,
          managerName: manager ? manager.fullName : null,
        };
      });

      setDepartments(departmentsWithManagerNames);
      setManagers(managersData);
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
        try {
          setLoading(true);
          const departmentDetail = await departmentService.getDepartmentById(
            department.departmentId
          );
          setViewingDepartment(departmentDetail);
          setIsViewModalVisible(true);
          setLoading(false);
        } catch (error) {
          console.error("Error loading department detail:", error);
          message.error("Không thể tải thông tin chi tiết phòng ban");
          setLoading(false);
        }
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
          okButtonProps: { style: { backgroundColor: "#334766", borderColor: "#334766", color: "#fff" } },
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
          okButtonProps: { style: { backgroundColor: "#ff4d4f", borderColor: "#ff4d4f", color: "#fff" } },
          onOk: async () => {
            try {
              setLoading(true);
              await departmentService.updateDepartment(department.departmentId, {
                ...department,
                isActive: false,
              });
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
      onClick: () => handleAction(department.isActive ? "deactivate" : "activate", department),
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
          <div style={{ fontWeight: "500" }}>
            <UserOutlined style={{ marginRight: "4px", color: "#334766" }} />
            {record.managerName || "Chưa có"}
          </div>
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
          count={record.lines ? record.lines.length : 0}
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
          managerId: values.managerId || null,
          description: values.description || "",
        });
        message.success("Tạo phòng ban mới thành công!");
      }

      setIsModalVisible(false);
      setEditingDepartment(null);
      form.resetFields();
      loadDepartments();
    } catch (error) {
      console.error("Operation failed:", error);
      message.error(
        editingDepartment
          ? "Cập nhật phòng ban thất bại!"
          : "Tạo phòng ban thất bại!"
      );
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
            {showArchive ? "Danh sách các phòng ban đã ngừng hoạt động" : "Quản lý thông tin các phòng ban trong công ty"}
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
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Trạng thái"
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "Tất cả vai trò" },
                { value: "active", label: "Hoạt động" },
                { value: "inactive", label: "Ngừng hoạt động" },
              ]}
            />
          </Col>
          <Col xs={24} sm={6} md={12}>
            <Space style={{ float: "right" }}>
              <Button
                type={showArchive ? "primary" : "default"}
                icon={<ArchiveIcon />}
                onClick={() => setShowArchive(!showArchive)}
                style={showArchive ? { backgroundColor: "#334766", borderColor: "#334766" } : {}}
              >
                {showArchive ? "Thoát lưu trữ" : "Lưu trữ"}
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
              <Button icon={<ReloadOutlined />} onClick={loadDepartments}>
                Làm mới
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
          style: { backgroundColor: "#334766", borderColor: "#334766", width: 100 },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="departmentName"
                label="Tên phòng ban"
                rules={[
                  { required: true, message: "Vui lòng nhập tên phòng ban" },
                ]}
              >
                <Input placeholder="Nhập tên phòng ban" />
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
            <Col span={24}>
              <Form.Item name="managerId" label="Người quản lý">
                <Select
                  placeholder="Chọn người quản lý (tùy chọn)"
                  allowClear
                  loading={loadingManagers}
                  options={managers}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
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
              <Descriptions.Item label="ID phòng ban">
                {viewingDepartment.departmentId}
              </Descriptions.Item>
              <Descriptions.Item label="Tên phòng ban">
                {viewingDepartment.departmentName}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {viewingDepartment.description}
              </Descriptions.Item>
              <Descriptions.Item label="ID Quản lý">
                {viewingDepartment.managerId || "Chưa có"}
              </Descriptions.Item>
              <Descriptions.Item label="Tên quản lý">
                {viewingDepartment.managerName || "Chưa có"}
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
