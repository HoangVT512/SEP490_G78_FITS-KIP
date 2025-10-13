import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Descriptions,
  message,
  Badge,
  Tooltip,
  Divider,
  Progress,
  Alert,
} from "antd";
import {
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  CalendarOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/MaintenanceTasks.module.css";

const { TextArea } = Input;
const { Option } = Select;

const MaintenanceTasks = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();

  // Mock data - sẽ thay bằng API call sau
  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  const fetchTasks = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockData = [
        {
          key: 1,
          planId: 1,
          planCode: "PM-001",
          equipmentId: 10,
          equipmentCode: "EQ-010",
          equipmentName: "Máy phay CNC",
          maintenanceType: "Bảo trì định kỳ",
          intervalType: "Hàng tháng",
          nextDueDate: "2025-10-13",
          lastMaintenanceDate: "2025-09-13",
          status: "Sắp tới",
          priority: "Cao",
          estimatedDuration: "2 giờ",
          lineName: "Dây chuyền 1",
          stageName: "Giai đoạn gia công",
          assignedDate: "2025-10-01",
        },
        {
          key: 2,
          planId: 2,
          planCode: "PM-005",
          equipmentId: 22,
          equipmentCode: "EQ-022",
          equipmentName: "Máy tiện tự động",
          maintenanceType: "Kiểm tra an toàn",
          intervalType: "Hàng tuần",
          nextDueDate: "2025-10-13",
          lastMaintenanceDate: "2025-10-06",
          status: "Sắp tới",
          priority: "Trung bình",
          estimatedDuration: "1 giờ",
          lineName: "Dây chuyền 2",
          stageName: "Giai đoạn gia công",
          assignedDate: "2025-10-01",
        },
        {
          key: 3,
          planId: 3,
          planCode: "PM-008",
          equipmentId: 15,
          equipmentCode: "EQ-015",
          equipmentName: "Robot hàn 02",
          maintenanceType: "Bảo trì định kỳ",
          intervalType: "Hàng quý",
          nextDueDate: "2025-10-15",
          lastMaintenanceDate: "2025-07-15",
          status: "Đang thực hiện",
          priority: "Cao",
          estimatedDuration: "3 giờ",
          lineName: "Dây chuyền 2",
          stageName: "Giai đoạn lắp ráp",
          assignedDate: "2025-10-01",
          startedAt: "2025-10-13 09:00",
        },
        {
          key: 4,
          planId: 4,
          planCode: "PM-012",
          equipmentId: 30,
          equipmentCode: "EQ-030",
          equipmentName: "Băng chuyền 08",
          maintenanceType: "Bảo dưỡng",
          intervalType: "Hàng tháng",
          nextDueDate: "2025-10-20",
          lastMaintenanceDate: "2025-09-20",
          status: "Chưa bắt đầu",
          priority: "Thấp",
          estimatedDuration: "1.5 giờ",
          lineName: "Dây chuyền 3",
          stageName: "Giai đoạn vận chuyển",
          assignedDate: "2025-10-01",
        },
        {
          key: 5,
          planId: 5,
          planCode: "PM-003",
          equipmentId: 5,
          equipmentCode: "EQ-005",
          equipmentName: "Máy khoan CNC",
          maintenanceType: "Bảo trì định kỳ",
          intervalType: "Hàng tháng",
          nextDueDate: "2025-09-30",
          lastMaintenanceDate: "2025-08-30",
          status: "Hoàn thành",
          priority: "Trung bình",
          estimatedDuration: "2 giờ",
          lineName: "Dây chuyền 1",
          stageName: "Giai đoạn gia công",
          assignedDate: "2025-09-01",
          completedAt: "2025-09-30 16:30",
        },
      ];

      if (filterStatus !== "all") {
        setTasks(mockData.filter((item) => item.status === filterStatus));
      } else {
        setTasks(mockData);
      }

      setLoading(false);
    }, 500);
  };

  const columns = [
    {
      title: "Mã kế hoạch",
      dataIndex: "planCode",
      key: "planCode",
      width: 110,
      fixed: "left",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Thiết bị",
      key: "equipment",
      width: 180,
      render: (record) => (
        <div>
          <div style={{ fontWeight: 500, color: "#1890ff" }}>
            {record.equipmentCode}
          </div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {record.equipmentName}
          </div>
        </div>
      ),
    },
    {
      title: "Vị trí",
      key: "location",
      width: 150,
      render: (record) => (
        <div>
          <div style={{ fontSize: "12px" }}>{record.lineName}</div>
          <div style={{ fontSize: "11px", color: "#888" }}>
            {record.stageName}
          </div>
        </div>
      ),
    },
    {
      title: "Loại bảo trì",
      dataIndex: "maintenanceType",
      key: "maintenanceType",
      width: 140,
    },
    {
      title: "Chu kỳ",
      dataIndex: "intervalType",
      key: "intervalType",
      width: 110,
      render: (text) => (
        <Tag icon={<CalendarOutlined />} color="blue">
          {text}
        </Tag>
      ),
    },
    {
      title: "Ngày thực hiện",
      dataIndex: "nextDueDate",
      key: "nextDueDate",
      width: 130,
      render: (text, record) => {
        const isOverdue =
          new Date(text) < new Date() && record.status !== "Hoàn thành";
        const isToday = dayjs(text).isSame(dayjs(), "day");
        return (
          <div
            style={{
              fontSize: "12px",
              color: isOverdue ? "#ff4d4f" : isToday ? "#faad14" : "inherit",
              fontWeight: isOverdue || isToday ? 500 : "normal",
            }}
          >
            {text}
            {isOverdue && <Badge status="error" style={{ marginLeft: 8 }} />}
            {isToday && <Badge status="processing" style={{ marginLeft: 8 }} />}
          </div>
        );
      },
    },
    {
      title: "Thời lượng",
      dataIndex: "estimatedDuration",
      key: "estimatedDuration",
      width: 100,
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority) => {
        let color = "default";
        if (priority === "Cao") color = "red";
        else if (priority === "Trung bình") color = "orange";
        else if (priority === "Thấp") color = "green";
        return (
          <Tag color={color} style={{ fontWeight: 500 }}>
            {priority}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => {
        let color = "default";
        let icon = null;
        if (status === "Đang thực hiện") {
          color = "processing";
          icon = <ClockCircleOutlined />;
        } else if (status === "Chưa bắt đầu") {
          color = "default";
          icon = <WarningOutlined />;
        } else if (status === "Sắp tới") {
          color = "warning";
          icon = <CalendarOutlined />;
        } else if (status === "Hoàn thành") {
          color = "success";
          icon = <CheckCircleOutlined />;
        }
        return (
          <Tag icon={icon} color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right",
      render: (record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {record.status !== "Hoàn thành" && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              size="small"
              onClick={() => handleCompleteTask(record)}
            >
              Hoàn thành
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetail = (task) => {
    setSelectedTask(task);
    setDetailModalVisible(true);
  };

  const handleCompleteTask = (task) => {
    setSelectedTask(task);
    form.setFieldsValue({
      completedDate: dayjs(),
      notes: "",
    });
    setCompleteModalVisible(true);
  };

  const handleCompleteSubmit = async (values) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Hoàn thành nhiệm vụ bảo trì thành công!");
      setCompleteModalVisible(false);
      form.resetFields();
      fetchTasks();
    } catch (error) {
      message.error("Hoàn thành nhiệm vụ thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const allTasks = [
      ...tasks,
      // Add filtered out items for accurate counts
    ];
    return tasks.filter((i) => i.status === status).length;
  };

  const getTaskProgress = () => {
    const completed = tasks.filter((t) => t.status === "Hoàn thành").length;
    const total = tasks.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className={styles.maintenanceTasks}>
      {/* Statistics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#1890ff",
                }}
              >
                {tasks.length}
              </div>
              <div style={{ fontSize: "14px", color: "#888", marginTop: 8 }}>
                Tổng nhiệm vụ
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#52c41a",
                }}
              >
                {tasks.filter((t) => t.status === "Hoàn thành").length}
              </div>
              <div style={{ fontSize: "14px", color: "#888", marginTop: 8 }}>
                Đã hoàn thành
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#faad14",
                }}
              >
                {tasks.filter((t) => t.status === "Sắp tới").length}
              </div>
              <div style={{ fontSize: "14px", color: "#888", marginTop: 8 }}>
                Sắp tới
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div style={{ textAlign: "center" }}>
              <Progress
                type="circle"
                percent={getTaskProgress()}
                width={80}
                strokeColor="#52c41a"
              />
              <div style={{ fontSize: "14px", color: "#888", marginTop: 8 }}>
                Tiến độ hoàn thành
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <ToolOutlined />
            <span>Danh sách nhiệm vụ bảo trì</span>
          </Space>
        }
        extra={
          <Space>
            <Button type="primary" onClick={fetchTasks} loading={loading}>
              Làm mới
            </Button>
          </Space>
        }
        bordered={false}
      >
        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <Space size="middle">
            <Button
              type={filterStatus === "all" ? "primary" : "default"}
              onClick={() => setFilterStatus("all")}
            >
              Tất cả ({tasks.length})
            </Button>
            <Badge count={getStatusBadge("Sắp tới")} color="orange">
              <Button
                type={filterStatus === "Sắp tới" ? "primary" : "default"}
                onClick={() => setFilterStatus("Sắp tới")}
              >
                Sắp tới
              </Button>
            </Badge>
            <Badge count={getStatusBadge("Đang thực hiện")} color="blue">
              <Button
                type={filterStatus === "Đang thực hiện" ? "primary" : "default"}
                onClick={() => setFilterStatus("Đang thực hiện")}
              >
                Đang thực hiện
              </Button>
            </Badge>
            <Badge count={getStatusBadge("Hoàn thành")} color="green">
              <Button
                type={filterStatus === "Hoàn thành" ? "primary" : "default"}
                onClick={() => setFilterStatus("Hoàn thành")}
              >
                Hoàn thành
              </Button>
            </Badge>
          </Space>
        </div>

        <Divider />

        {/* Table */}
        <Table
          columns={columns}
          dataSource={tasks}
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} nhiệm vụ`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Chi tiết nhiệm vụ bảo trì</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedTask?.status !== "Hoàn thành" && (
            <Button
              key="complete"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setDetailModalVisible(false);
                handleCompleteTask(selectedTask);
              }}
            >
              Hoàn thành
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedTask && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Mã kế hoạch" span={1}>
              <strong>{selectedTask.planCode}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag
                color={
                  selectedTask.status === "Hoàn thành"
                    ? "success"
                    : selectedTask.status === "Đang thực hiện"
                    ? "processing"
                    : "warning"
                }
              >
                {selectedTask.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thiết bị" span={2}>
              <strong>{selectedTask.equipmentCode}</strong> -{" "}
              {selectedTask.equipmentName}
            </Descriptions.Item>
            <Descriptions.Item label="Vị trí" span={2}>
              {selectedTask.lineName} / {selectedTask.stageName}
            </Descriptions.Item>
            <Descriptions.Item label="Loại bảo trì" span={1}>
              {selectedTask.maintenanceType}
            </Descriptions.Item>
            <Descriptions.Item label="Chu kỳ" span={1}>
              <Tag icon={<CalendarOutlined />} color="blue">
                {selectedTask.intervalType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ưu tiên" span={1}>
              <Tag
                color={
                  selectedTask.priority === "Cao"
                    ? "red"
                    : selectedTask.priority === "Trung bình"
                    ? "orange"
                    : "green"
                }
              >
                {selectedTask.priority}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời lượng dự kiến" span={1}>
              {selectedTask.estimatedDuration}
            </Descriptions.Item>
            <Descriptions.Item label="Lần bảo trì trước" span={1}>
              {selectedTask.lastMaintenanceDate}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày thực hiện" span={1}>
              {selectedTask.nextDueDate}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày được giao" span={1}>
              {selectedTask.assignedDate}
            </Descriptions.Item>
            {selectedTask.startedAt && (
              <Descriptions.Item label="Bắt đầu lúc" span={1}>
                {selectedTask.startedAt}
              </Descriptions.Item>
            )}
            {selectedTask.completedAt && (
              <Descriptions.Item label="Hoàn thành lúc" span={2}>
                {selectedTask.completedAt}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Complete Task Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            <span>Hoàn thành nhiệm vụ bảo trì</span>
          </Space>
        }
        open={completeModalVisible}
        onCancel={() => {
          setCompleteModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCompleteSubmit}>
          <Alert
            message={
              <div>
                <div>
                  <strong>Thiết bị:</strong> {selectedTask?.equipmentCode} -{" "}
                  {selectedTask?.equipmentName}
                </div>
                <div>
                  <strong>Loại bảo trì:</strong> {selectedTask?.maintenanceType}
                </div>
              </div>
            }
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="Ngày hoàn thành"
            name="completedDate"
            rules={[
              { required: true, message: "Vui lòng chọn ngày hoàn thành!" },
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <TextArea
              rows={4}
              placeholder="Ghi chú về công việc đã thực hiện..."
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setCompleteModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Xác nhận hoàn thành
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MaintenanceTasks;
