import React, { useState } from "react";
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
  Progress,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/MaintenanceManagement.module.css";

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

const MaintenanceManagement = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // Mock data
  const [maintenancePlans, setMaintenancePlans] = useState([
    {
      planId: 1,
      equipmentId: "EQ001",
      equipmentName: "Máy dập 01",
      intervalType: "Days",
      intervalValue: 30,
      startDate: "2025-01-01",
      nextDueDate: "2025-01-31",
      assignedTo: "Nguyễn Văn A",
      isActive: true,
      lastMaintenanceDate: "2025-01-01",
    },
    {
      planId: 2,
      equipmentId: "EQ002",
      equipmentName: "Máy cắt 02",
      intervalType: "Hours",
      intervalValue: 500,
      startDate: "2024-12-01",
      nextDueDate: "2025-01-15",
      assignedTo: "Trần Thị B",
      isActive: true,
      lastMaintenanceDate: "2024-12-15",
    },
    {
      planId: 3,
      equipmentId: "EQ003",
      equipmentName: "Máy hàn 03",
      intervalType: "Days",
      intervalValue: 60,
      startDate: "2024-11-01",
      nextDueDate: "2025-02-01",
      assignedTo: "Phạm Văn C",
      isActive: false,
      lastMaintenanceDate: "2024-12-01",
    },
  ]);

  const [maintenanceRecords] = useState([
    {
      recordId: 1,
      planId: 1,
      equipmentName: "Máy dập 01",
      completedDate: "2025-01-01",
      technician: "Nguyễn Văn A",
      status: "Hoàn thành",
      notes: "Kiểm tra và bôi trơn các chi tiết chuyển động",
    },
    {
      recordId: 2,
      planId: 2,
      equipmentName: "Máy cắt 02",
      completedDate: "2024-12-15",
      technician: "Trần Thị B",
      status: "Hoàn thành",
      notes: "Thay dầu và kiểm tra hệ thống làm mát",
    },
  ]);

  const stats = {
    totalPlans: maintenancePlans.length,
    activePlans: maintenancePlans.filter((p) => p.isActive).length,
    upcomingSoon: maintenancePlans.filter((p) => {
      const daysUntilDue = dayjs(p.nextDueDate).diff(dayjs(), "day");
      return daysUntilDue <= 7 && daysUntilDue >= 0 && p.isActive;
    }).length,
    overdue: maintenancePlans.filter((p) => {
      return dayjs(p.nextDueDate).isBefore(dayjs()) && p.isActive;
    }).length,
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
      width: 150,
    },
    {
      title: "Chu kỳ",
      key: "interval",
      width: 150,
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
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày đến hạn",
      dataIndex: "nextDueDate",
      key: "nextDueDate",
      width: 120,
      render: (date, record) => {
        const daysUntilDue = dayjs(date).diff(dayjs(), "day");
        const isOverdue = daysUntilDue < 0;
        const isUpcomingSoon = daysUntilDue <= 7 && daysUntilDue >= 0;
        return (
          <span
            style={{
              color: isOverdue ? "red" : isUpcomingSoon ? "orange" : "inherit",
            }}
          >
            {dayjs(date).format("DD/MM/YYYY")}
            {isOverdue && " (Quá hạn)"}
            {isUpcomingSoon && " (Sắp đến hạn)"}
          </span>
        );
      },
    },
    {
      title: "Người phụ trách",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleStatus(record.planId, checked)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Tạm dừng"
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const recordColumns = [
    {
      title: "Mã bản ghi",
      dataIndex: "recordId",
      key: "recordId",
      width: 100,
      render: (id) => `REC${String(id).padStart(3, "0")}`,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 150,
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "completedDate",
      key: "completedDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Kỹ thuật viên",
      dataIndex: "technician",
      key: "technician",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => <Tag color="success">{status}</Tag>,
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
    },
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa kế hoạch bảo trì cho "${record.equipmentName}"?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => {
        setMaintenancePlans(
          maintenancePlans.filter((p) => p.planId !== record.planId)
        );
        message.success("Xóa kế hoạch bảo trì thành công!");
      },
    });
  };

  const handleToggleStatus = (planId, checked) => {
    setMaintenancePlans(
      maintenancePlans.map((p) =>
        p.planId === planId ? { ...p, isActive: checked } : p
      )
    );
    message.success(
      checked
        ? "Kích hoạt kế hoạch thành công!"
        : "Tạm dừng kế hoạch thành công!"
    );
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const startDate = values.startDate.format("YYYY-MM-DD");
      let nextDueDate = dayjs(startDate);

      if (values.intervalType === "Days") {
        nextDueDate = nextDueDate.add(values.intervalValue, "day");
      } else if (values.intervalType === "Hours") {
        nextDueDate = nextDueDate.add(
          Math.ceil(values.intervalValue / 24),
          "day"
        );
      }

      if (editingRecord) {
        // Update
        setMaintenancePlans(
          maintenancePlans.map((p) =>
            p.planId === editingRecord.planId
              ? {
                  ...p,
                  ...values,
                  startDate,
                  nextDueDate: nextDueDate.format("YYYY-MM-DD"),
                }
              : p
          )
        );
        message.success("Cập nhật kế hoạch bảo trì thành công!");
      } else {
        // Add new
        const newPlan = {
          planId: maintenancePlans.length + 1,
          ...values,
          startDate,
          nextDueDate: nextDueDate.format("YYYY-MM-DD"),
          isActive: true,
          lastMaintenanceDate: startDate,
        };
        setMaintenancePlans([...maintenancePlans, newPlan]);
        message.success("Thêm kế hoạch bảo trì thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = maintenancePlans.filter(
    (plan) =>
      plan.equipmentName.toLowerCase().includes(searchText.toLowerCase()) ||
      plan.assignedTo.toLowerCase().includes(searchText.toLowerCase())
  );

  const SetupScheduleTab = (
    <Card title="Thiết lập lịch bảo trì" bordered={false}>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng kế hoạch"
              value={stats.totalPlans}
              prefix={<CheckCircleOutlined />}
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
              title="Sắp đến hạn"
              value={stats.upcomingSoon}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Quá hạn"
              value={stats.overdue}
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
              placeholder="Tìm theo thiết bị hoặc người phụ trách"
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
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} kế hoạch`,
          }}
        />
      </Space>
    </Card>
  );

  const MaintenanceReportTab = (
    <Card title="Báo cáo bảo trì" bordered={false}>
      <Table
        columns={recordColumns}
        dataSource={maintenanceRecords}
        rowKey="recordId"
        loading={loading}
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
      key: "report",
      label: "Báo cáo bảo trì",
      children: MaintenanceReportTab,
    },
  ];

  return (
    <div className={styles.container}>
      <Tabs items={items} defaultActiveKey="schedule" />

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
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="equipmentId"
                label="Mã thiết bị"
                rules={[{ required: true, message: "Vui lòng chọn thiết bị" }]}
              >
                <Select
                  placeholder="Chọn thiết bị"
                  showSearch
                  onChange={(value, option) => {
                    form.setFieldsValue({
                      equipmentName: option.children.split(" - ")[1],
                    });
                  }}
                >
                  <Option value="EQ001">EQ001 - Máy dập 01</Option>
                  <Option value="EQ002">EQ002 - Máy cắt 02</Option>
                  <Option value="EQ003">EQ003 - Máy hàn 03</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="equipmentName" hidden>
                <Input />
              </Form.Item>
              <Form.Item
                name="assignedTo"
                label="Người phụ trách"
                rules={[
                  { required: true, message: "Vui lòng nhập người phụ trách" },
                ]}
              >
                <Input placeholder="Tên kỹ thuật viên" />
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
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

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
    </div>
  );
};

export default MaintenanceManagement;
