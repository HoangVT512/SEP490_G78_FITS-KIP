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
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import { departmentService } from "../../services/departmentService";

const { Title, Text } = Typography;
const { Search } = Input;

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

  // API data structure: departmentId, departmentName, managerId, description, manager, rooms

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading departments:", error);
      message.error("Không thể tải danh sách phòng ban");
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
          {record.managerId && (
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              ID: {record.managerId}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Số phòng",
      key: "rooms",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Badge
          count={record.rooms ? record.rooms.length : 0}
          showZero
          style={{ backgroundColor: "#334766" }}
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

    return matchesSearch;
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
          <Col xs={24} sm={12} md={12}>
            <Input.Group compact>
              <Input
                placeholder="Tìm kiếm theo tên phòng ban, mô tả hoặc tên quản lý..."
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
          <Col xs={24} sm={12} md={12}>
            <Space style={{ float: "right" }}>
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
          style: { backgroundColor: "#334766", borderColor: "#334766" },
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
              <Form.Item name="managerId" label="ID Quản lý">
                <Input
                  type="number"
                  placeholder="Nhập ID người quản lý (tùy chọn)"
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
              <Descriptions.Item label="Số phòng" span={2}>
                {viewingDepartment.rooms ? viewingDepartment.rooms.length : 0}{" "}
                phòng
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
