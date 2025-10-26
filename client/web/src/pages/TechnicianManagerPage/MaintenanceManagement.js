import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Tag,
  Tabs,
  Row,
  Col,
  Switch,
  Statistic,
  Descriptions,
  List,
  Checkbox,
  Typography,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  UserAddOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getAllMaintenancePlans,
  createMaintenancePlan,
  updateMaintenancePlan,
  deleteMaintenancePlan,
  getPendingRequests,
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
  assignTechnician,
  getMaintenanceStats,
  getMaintenanceHistory,
} from "../../services/maintenanceService";
import { equipmentService } from "../../services/equipmentService";
import { userService } from "../../services/userService";
import styles from "../../styles/pages/MaintenanceManagement.module.css";

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;
const { Text, Title } = Typography;

const MaintenanceManagement = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [approveForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("schedule");

  // Data states
  const [maintenancePlans, setMaintenancePlans] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    pendingPlans: 0,
    inProgressPlans: 0,
    completedPlans: 0,
    overduePlans: 0,
    dueThisWeek: 0,
    dueThisMonth: 0,
    completionRate: 0,
  });
  const [equipments, setEquipments] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  // Load initial data
  useEffect(() => {
    loadAllData();
    loadEquipments();
    loadTechnicians();
  }, []);

  useEffect(() => {
    if (activeTab === "pending") {
      loadPendingRequests();
    } else if (activeTab === "history") {
      loadMaintenanceHistory();
    }
  }, [activeTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadMaintenancePlans(), loadStats()]);
    } catch (error) {
      message.error("Tải dữ liệu thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMaintenancePlans = async () => {
    try {
      const response = await getAllMaintenancePlans();
      const plans = response?.data || [];
      setMaintenancePlans(plans);
    } catch (error) {
      console.error("Load plans error:", error);
      message.error("Tải danh sách kế hoạch thất bại");
    }
  };

  const loadPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await getPendingRequests();
      const requests = response?.data || [];
      setPendingRequests(requests);
    } catch (error) {
      console.error("Load pending requests error:", error);
      message.error("Tải danh sách yêu cầu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const loadMaintenanceHistory = async () => {
    setLoading(true);
    try {
      const response = await getMaintenanceHistory();
      const history = response?.data || [];
      setMaintenanceHistory(history);
    } catch (error) {
      console.error("Load history error:", error);
      message.error("Tải lịch sử bảo trì thất bại");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getMaintenanceStats();
      const statsData = response?.data || {};
      setStats(statsData);
    } catch (error) {
      console.error("Load stats error:", error);
    }
  };

  const loadEquipments = async () => {
    try {
      const response = await equipmentService.getEquipments();
      const equipmentList = response?.data || response || [];
      setEquipments(equipmentList);
    } catch (error) {
      console.error("Load equipments error:", error);
    }
  };

  const loadTechnicians = async () => {
    try {
      const response = await userService.getUsers();
      const users = response?.data || response || [];
      
      // Filter users who have "Kỹ thuật viên" or "Quản lý kỹ thuật" role
      const techList = users.filter((user) => {
        // Check if user has Roles array
        if (user.roles && Array.isArray(user.roles)) {
          return user.roles.some(
            (role) =>
              role === "Kỹ thuật viên" || 
              role === "Quản lý kỹ thuật"
          );
        }
        return false;
      });
      
      console.log('Total users:', users.length);
      console.log('Filtered technicians:', techList.length);
      console.log('Technician list:', techList);
      
      setTechnicians(techList);
    } catch (error) {
      console.error("Load technicians error:", error);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      equipmentId: record.equipmentId,
      intervalType: record.intervalType,
      intervalValue: record.intervalValue,
      assignedTo: record.assignedTo,
      nextDueDate: record.nextDueDate ? dayjs(record.nextDueDate) : null,
      isActive: record.isActive,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa kế hoạch bảo trì cho "${record.equipmentName}"?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteMaintenancePlan(record.planId);
          message.success("Xóa kế hoạch bảo trì thành công!");
          loadAllData();
        } catch (error) {
          message.error("Xóa kế hoạch thất bại: " + error.message);
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const planData = {
        equipmentId: values.equipmentId,
        intervalType: values.intervalType,
        intervalValue: values.intervalValue,
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        assignedTo: values.assignedTo,
        checklistSteps: values.checklistSteps || [],
      };

      if (editingRecord) {
        const updateData = {
          ...planData,
          nextDueDate: values.nextDueDate
            ? values.nextDueDate.format("YYYY-MM-DD")
            : undefined,
          isActive: values.isActive ?? true,
        };
        await updateMaintenancePlan(editingRecord.planId, updateData);
        message.success("Cập nhật kế hoạch bảo trì thành công!");
      } else {
        await createMaintenancePlan(planData);
        message.success("Thêm kế hoạch bảo trì thành công!");
      }

      setIsModalVisible(false);
      form.resetFields();
      loadAllData();
    } catch (error) {
      message.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (record) => {
    setSelectedPlan(record);
    assignForm.resetFields();
    setIsAssignModalVisible(true);
  };

  const handleAssignSubmit = async (values) => {
    setLoading(true);
    try {
      await assignTechnician(selectedPlan.planId, {
        technicianId: values.technicianId,
      });
      message.success("Giao việc cho kỹ thuật viên thành công!");
      setIsAssignModalVisible(false);
      loadAllData();
      if (activeTab === "pending") {
        loadPendingRequests();
      }
    } catch (error) {
      message.error("Giao việc thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (record) => {
    setSelectedPlan(record);
    approveForm.resetFields();
    setIsApproveModalVisible(true);
  };

  const handleApproveSubmit = async (values) => {
    setLoading(true);
    try {
      await approveMaintenanceRequest(selectedPlan.planId, {
        assignedTo: values.assignedTo,
        scheduledDate: values.scheduledDate
          ? values.scheduledDate.format("YYYY-MM-DD")
          : undefined,
        approvalNotes: values.approvalNotes,
      });
      message.success("Phê duyệt yêu cầu thành công!");
      setIsApproveModalVisible(false);
      loadPendingRequests();
      loadAllData();
    } catch (error) {
      message.error("Phê duyệt thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = (record) => {
    setSelectedPlan(record);
    rejectForm.resetFields();
    setIsRejectModalVisible(true);
  };

  const handleRejectSubmit = async (values) => {
    setLoading(true);
    try {
      await rejectMaintenanceRequest(selectedPlan.planId, {
        rejectionReason: values.rejectionReason,
      });
      message.success("Từ chối yêu cầu thành công!");
      setIsRejectModalVisible(false);
      loadPendingRequests();
      loadAllData();
    } catch (error) {
      message.error("Từ chối thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedPlan(record);
    setIsDetailModalVisible(true);
  };

  const getStatusTag = (plan) => {
    if (!plan.isActive) {
      return <Tag color="default">Đã hoàn thành</Tag>;
    }
    const today = dayjs();
    const dueDate = dayjs(plan.nextDueDate);
    const daysUntilDue = dueDate.diff(today, "day");

    if (daysUntilDue < 0) {
      return <Tag color="error">Quá hạn</Tag>;
    } else if (!plan.assignedTo) {
      return <Tag color="warning">Chờ phân công</Tag>;
    } else if (daysUntilDue <= 7) {
      return <Tag color="processing">Đang thực hiện</Tag>;
    } else {
      return <Tag color="success">Đang hoạt động</Tag>;
    }
  };

  const planColumns = [
    {
      title: "Mã KH",
      dataIndex: "planId",
      key: "planId",
      width: 80,
      render: (id) => `PLAN${String(id).padStart(3, "0")}`,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 180,
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.equipmentCode}
          </Text>
        </div>
      ),
    },
    {
      title: "Vị trí",
      key: "location",
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.lineName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.stageName}
          </Text>
        </div>
      ),
    },
    {
      title: "Chu kỳ",
      key: "interval",
      width: 120,
      render: (_, record) => (
        <span>
          {record.intervalValue}{" "}
          {record.intervalType === "Days"
            ? "ngày"
            : record.intervalType === "Hours"
            ? "giờ"
            : "chu kỳ"}
        </span>
      ),
    },
    {
      title: "Ngày đến hạn",
      dataIndex: "nextDueDate",
      key: "nextDueDate",
      width: 130,
      render: (date, record) => {
        const today = dayjs();
        const dueDate = dayjs(date);
        const daysUntilDue = dueDate.diff(today, "day");
        const isOverdue = daysUntilDue < 0;
        const isUpcomingSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

        return (
          <div>
            <div
              style={{
                color: isOverdue
                  ? "#ff4d4f"
                  : isUpcomingSoon
                  ? "#faad14"
                  : "inherit",
                fontWeight: isOverdue || isUpcomingSoon ? "bold" : "normal",
              }}
            >
              {dueDate.format("DD/MM/YYYY")}
            </div>
            {record.daysUntilDue !== null && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.daysUntilDue > 0
                  ? `Còn ${record.daysUntilDue} ngày`
                  : record.daysUntilDue === 0
                  ? "Hôm nay"
                  : `Quá ${Math.abs(record.daysUntilDue)} ngày`}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Người phụ trách",
      dataIndex: "assignedToName",
      key: "assignedToName",
      width: 150,
      render: (name) => name || <Text type="secondary">Chưa phân công</Text>,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      render: (_, record) => getStatusTag(record),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chi tiết">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Giao việc">
            <Button
              type="link"
              size="small"
              icon={<UserAddOutlined />}
              onClick={() => handleAssign(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const pendingColumns = [
    {
      title: "Mã KH",
      dataIndex: "planId",
      key: "planId",
      width: 80,
      render: (id) => `PLAN${String(id).padStart(3, "0")}`,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 180,
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.equipmentCode}
          </Text>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "requestDate",
      key: "requestDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày đến hạn",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Người tạo",
      dataIndex: "requestedByName",
      key: "requestedByName",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => <Tag color="warning">{status}</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record)}
          >
            Phê duyệt
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => handleReject(record)}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  const historyColumns = [
    {
      title: "Mã KH",
      dataIndex: "planId",
      key: "planId",
      width: 80,
      render: (id) => `PLAN${String(id).padStart(3, "0")}`,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 180,
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.equipmentCode}
          </Text>
        </div>
      ),
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "completedDate",
      key: "completedDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Người thực hiện",
      dataIndex: "completedByName",
      key: "completedByName",
      width: 150,
    },
    {
      title: "Số bước hoàn thành",
      key: "checklistProgress",
      width: 150,
      render: (_, record) => {
        const total = record.checklistItems?.length || 0;
        const completed =
          record.checklistItems?.filter((item) => item.isChecked).length || 0;
        const percent = total > 0 ? (completed / total) * 100 : 0;

        return (
          <div>
            <div>
              {completed}/{total} bước
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {percent.toFixed(0)}%
            </Text>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const filteredPlans = maintenancePlans.filter(
    (plan) =>
      plan.equipmentName?.toLowerCase().includes(searchText.toLowerCase()) ||
      plan.assignedToName?.toLowerCase().includes(searchText.toLowerCase()) ||
      plan.equipmentCode?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Tab: Setup Schedule
  const SetupScheduleTab = (
    <Card title="Lịch bảo trì" bordered={false}>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng kế hoạch"
              value={stats.totalPlans}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Đang hoạt động"
              value={stats.activePlans}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Đến hạn tuần này"
              value={stats.dueThisWeek}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Quá hạn"
              value={stats.overduePlans}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Search
              placeholder="Tìm theo thiết bị, mã thiết bị hoặc người phụ trách"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: "right" }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm lịch bảo trì
            </Button>
          </Col>
        </Row>

        <Table
          columns={planColumns}
          dataSource={filteredPlans}
          rowKey="planId"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} kế hoạch`,
          }}
        />
      </Space>
    </Card>
  );

  // Tab: Pending Requests
  const PendingRequestsTab = (
    <Card title="Yêu cầu chờ phê duyệt" bordered={false}>
      <Table
        columns={pendingColumns}
        dataSource={pendingRequests}
        rowKey="planId"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} yêu cầu`,
        }}
      />
    </Card>
  );

  // Tab: Maintenance History
  const MaintenanceHistoryTab = (
    <Card title="Lịch sử bảo trì" bordered={false}>
      <Table
        columns={historyColumns}
        dataSource={maintenanceHistory}
        rowKey="planId"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bản ghi`,
        }}
      />
    </Card>
  );

  const items = [
    {
      key: "schedule",
      label: "Lịch bảo trì",
      children: SetupScheduleTab,
    },
    {
      key: "pending",
      label: `Chờ phê duyệt ${
        pendingRequests.length > 0 ? `(${pendingRequests.length})` : ""
      }`,
      children: PendingRequestsTab,
    },
    {
      key: "history",
      label: "Lịch sử",
      children: MaintenanceHistoryTab,
    },
  ];

  return (
    <div className={styles.container}>
      <Tabs
        items={items}
        activeKey={activeTab}
        onChange={setActiveTab}
        defaultActiveKey="schedule"
      />

      {/* Add/Edit Modal */}
      <Modal
        title={
          editingRecord ? "Cập nhật lịch bảo trì" : "Thêm lịch bảo trì mới"
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="equipmentId"
                label="Thiết bị"
                rules={[{ required: true, message: "Vui lòng chọn thiết bị" }]}
              >
                <Select
                  placeholder="Chọn thiết bị"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {equipments.map((eq) => (
                    <Option key={eq.equipmentId} value={eq.equipmentId}>
                      {eq.equipmentCode} - {eq.equipmentName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="assignedTo" label="Người phụ trách">
                <Select
                  placeholder="Chọn kỹ thuật viên (tùy chọn)"
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {technicians.map((tech) => (
                    <Option key={tech.id} value={tech.id}>
                      {tech.fullName} - {tech.employeeCode}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="intervalType"
                label="Loại chu kỳ"
                rules={[
                  { required: true, message: "Vui lòng chọn loại chu kỳ" },
                ]}
              >
                <Select placeholder="Chọn loại">
                  <Option value="Days">Ngày</Option>
                  <Option value="Hours">Giờ hoạt động</Option>
                  <Option value="UsageCycles">Chu kỳ sử dụng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="intervalValue"
                label="Giá trị chu kỳ"
                rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                initialValue={dayjs()}
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          {editingRecord && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="nextDueDate" label="Ngày đến hạn tiếp theo">
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Trạng thái"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item
            name="checklistSteps"
            label="Các bước kiểm tra (tùy chọn)"
          >
            <Select
              mode="tags"
              placeholder="Nhập các bước kiểm tra, nhấn Enter để thêm"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRecord ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Technician Modal */}
      <Modal
        title="Giao việc cho kỹ thuật viên"
        open={isAssignModalVisible}
        onCancel={() => setIsAssignModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={assignForm} layout="vertical" onFinish={handleAssignSubmit}>
          <Form.Item
            name="technicianId"
            label="Chọn kỹ thuật viên"
            rules={[
              { required: true, message: "Vui lòng chọn kỹ thuật viên" },
            ]}
          >
            <Select
              placeholder="Chọn kỹ thuật viên"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {technicians.map((tech) => (
                <Option key={tech.id} value={tech.id}>
                  {tech.fullName} - {tech.employeeCode}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsAssignModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Giao việc
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Approve Request Modal */}
      <Modal
        title="Phê duyệt yêu cầu bảo trì"
        open={isApproveModalVisible}
        onCancel={() => setIsApproveModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={approveForm}
          layout="vertical"
          onFinish={handleApproveSubmit}
        >
          <Form.Item name="assignedTo" label="Giao cho kỹ thuật viên">
            <Select
              placeholder="Chọn kỹ thuật viên (tùy chọn)"
              showSearch
              allowClear
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {technicians.map((tech) => (
                <Option key={tech.id} value={tech.id}>
                  {tech.fullName} - {tech.employeeCode}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="scheduledDate" label="Ngày lên lịch">
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="approvalNotes" label="Ghi chú phê duyệt">
            <TextArea rows={3} placeholder="Nhập ghi chú (tùy chọn)" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsApproveModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Phê duyệt
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Request Modal */}
      <Modal
        title="Từ chối yêu cầu bảo trì"
        open={isRejectModalVisible}
        onCancel={() => setIsRejectModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleRejectSubmit}>
          <Form.Item
            name="rejectionReason"
            label="Lý do từ chối"
            rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập lý do từ chối yêu cầu bảo trì"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsRejectModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" danger htmlType="submit" loading={loading}>
                Từ chối
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết kế hoạch bảo trì"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedPlan && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã kế hoạch" span={2}>
                PLAN{String(selectedPlan.planId).padStart(3, "0")}
              </Descriptions.Item>
              <Descriptions.Item label="Thiết bị">
                {selectedPlan.equipmentName}
              </Descriptions.Item>
              <Descriptions.Item label="Mã thiết bị">
                {selectedPlan.equipmentCode}
              </Descriptions.Item>
              <Descriptions.Item label="Chuyền">
                {selectedPlan.lineName}
              </Descriptions.Item>
              <Descriptions.Item label="Công đoạn">
                {selectedPlan.stageName}
              </Descriptions.Item>
              <Descriptions.Item label="Chu kỳ bảo trì">
                {selectedPlan.intervalValue}{" "}
                {selectedPlan.intervalType === "Days"
                  ? "ngày"
                  : selectedPlan.intervalType === "Hours"
                  ? "giờ"
                  : "chu kỳ"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">
                {dayjs(selectedPlan.startDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đến hạn">
                {dayjs(selectedPlan.nextDueDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedPlan)}
              </Descriptions.Item>
              <Descriptions.Item label="Người phụ trách" span={2}>
                {selectedPlan.assignedToName || (
                  <Text type="secondary">Chưa phân công</Text>
                )}
              </Descriptions.Item>
            </Descriptions>

            {selectedPlan.checklistItems &&
              selectedPlan.checklistItems.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <Title level={5}>Danh sách kiểm tra</Title>
                  <List
                    bordered
                    dataSource={selectedPlan.checklistItems}
                    renderItem={(item) => (
                      <List.Item>
                        <Checkbox checked={item.isChecked} disabled>
                          {item.stepName}
                        </Checkbox>
                        {item.notes && (
                          <Text type="secondary" style={{ marginLeft: 16 }}>
                            Ghi chú: {item.notes}
                          </Text>
                        )}
                        {item.completedDate && (
                          <Text type="secondary" style={{ marginLeft: 16 }}>
                            Hoàn thành:{" "}
                            {dayjs(item.completedDate).format(
                              "DD/MM/YYYY HH:mm"
                            )}
                          </Text>
                        )}
                      </List.Item>
                    )}
                  />
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaintenanceManagement;
