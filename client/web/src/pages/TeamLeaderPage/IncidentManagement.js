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
  message,
  Popconfirm,
  Tooltip,
  Statistic,
  Badge,
  Descriptions,
  Timeline,
  Upload,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  UploadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/IncidentManagement.module.css";
import { incidentService } from "../../services/incidentService";

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const IncidentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [searchText, filterStatus, filterPriority, incidents]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await incidentService.getAll();
      // backend returns { success, data }
      const items = Array.isArray(res) ? res : res?.data || [];
      // Normalize to frontend shape
      const mapped = (items || []).map((it) => {
        // compute downtime in minutes if possible
        let downtime = 0;
        try {
          if (it.endTime && it.startTime) {
            const start = dayjs(it.startTime);
            const end = dayjs(it.endTime);
            downtime = Math.abs(end.diff(start, "minute"));
          } else if (it.downtimeMinutes != null) {
            downtime = Number(it.downtimeMinutes) || 0;
          } else if (it.duration != null) {
            // duration may be in hours or minutes depending on API; keep as-is
            downtime = Number(it.duration) || 0;
          } else if (it.downtime != null) {
            downtime = Number(it.downtime) || 0;
          }
        } catch (e) {
          downtime = it.downtimeMinutes || it.downtime || it.duration || 0;
        }

        return {
          id: it.incidentId || it.id || it.IncidentId,
          title:
            it.title ||
            it.Title ||
            it.type?.typeName ||
            it.typeName ||
            it.TypeName ||
            "",
          equipmentName:
            it.equipment?.equipmentName ||
            it.equipmentName ||
            it.EquipmentName ||
            "",
          equipmentCode: it.equipment?.equipmentCode || it.equipmentCode || "",
          lineName: it.line?.lineName || it.lineName || it.LineName || "",
          priority: it.priority || it.Priority || "Trung bình",
          status:
            it.status ||
            it.Status ||
            (it.isResolved ? "Hoàn thành" : "Chờ xử lý"),
          reporter:
            it.reportedByName ||
            it.reporter ||
            it.Reporter ||
            it.createdBy ||
            it.createdByName ||
            "",
          assignedTo:
            it.assignedToName || it.assignedTo || it.AssignedTo || null,
          reportDate:
            it.startTime ||
            it.reportDate ||
            it.ReportDate ||
            it.createdDate ||
            null,
          resolveDate: it.endTime || it.resolveDate || it.ResolveDate || null,
          issue: it.issue || it.Issue || it.description || "",
          reason: it.reason || it.Reason || null,
          solution: it.solution || it.Solution || null,
          category: it.category || it.Category || it.type?.typeName || null,
          downtime: downtime,
          impact: it.impact || it.Impact || null,
          attachments: it.attachments || it.files || [],
        };
      });
      setIncidents(mapped);
      setFilteredIncidents(mapped);
    } catch (err) {
      console.error("Error fetching incidents", err);
      message.error(err?.message || "Không thể tải danh sách sự cố");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = [...incidents];

    if (searchText) {
      const q = String(searchText).toLowerCase();
      filtered = filtered.filter((inc) => {
        const idStr = String(inc.id || "").toLowerCase();
        const titleStr = String(inc.title || "").toLowerCase();
        const equipmentStr = String(inc.equipmentName || "").toLowerCase();
        return (
          idStr.includes(q) || titleStr.includes(q) || equipmentStr.includes(q)
        );
      });
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((inc) => inc.status === filterStatus);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((inc) => inc.priority === filterPriority);
    }

    setFilteredIncidents(filtered);
  };

  const handleAddIncident = () => {
    setIsEditMode(false);
    setSelectedIncident(null);
    form.resetFields();
    setFormModalVisible(true);
  };

  const handleEditIncident = (record) => {
    setIsEditMode(true);
    setSelectedIncident(record);
    form.setFieldsValue({
      ...record,
      reportDate: record.reportDate ? dayjs(record.reportDate) : null,
      resolveDate: record.resolveDate ? dayjs(record.resolveDate) : null,
    });
    setFormModalVisible(true);
  };

  const handleDeleteIncident = async (id) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Xóa sự cố thành công!");
      fetchIncidents();
    } catch (error) {
      message.error("Xóa thất bại!");
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedIncident(record);
    setDetailModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (isEditMode) {
        message.success("Cập nhật sự cố thành công!");
      } else {
        message.success("Thêm sự cố thành công!");
      }

      setFormModalVisible(false);
      form.resetFields();
      fetchIncidents();
    } catch (error) {
      message.error("Lưu thất bại!");
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Cao":
        return "red";
      case "Trung bình":
        return "orange";
      case "Thấp":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Chờ xử lý":
        return "warning";
      case "Đang xử lý":
        return "processing";
      case "Hoàn thành":
        return "success";
      case "Hủy":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Chờ xử lý":
        return <ExclamationCircleOutlined />;
      case "Đang xử lý":
        return <ClockCircleOutlined />;
      case "Hoàn thành":
        return <CheckCircleOutlined />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: "Mã sự cố",
      dataIndex: "id",
      key: "id",
      width: 100,
      fixed: "left",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.equipmentCode && (
            <div style={{ color: "#999", fontSize: 12 }}>
              {record.equipmentCode}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Dây chuyền",
      dataIndex: "lineName",
      key: "lineName",
      width: 130,
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: "Mức độ",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority) => (
        <Tag color={getPriorityColor(priority)} style={{ fontWeight: 500 }}>
          {priority}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Người báo cáo",
      dataIndex: "reporter",
      key: "reporter",
      width: 130,
    },
    {
      title: "Người xử lý",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 130,
      render: (text) =>
        text || <span style={{ color: "#bbb" }}>Chưa phân công</span>,
    },
    {
      title: "Thời gian chết (phút)",
      dataIndex: "downtime",
      key: "downtime",
      width: 150,
      align: "right",
      render: (val) => (
        <span
          style={{ color: val > 120 ? "#ff4d4f" : "#1890ff", fontWeight: 500 }}
        >
          {val} phút
        </span>
      ),
    },
    {
      title: "Ngày báo cáo",
      dataIndex: "reportDate",
      key: "reportDate",
      width: 150,
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditIncident(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa sự cố"
            description="Bạn có chắc chắn muốn xóa sự cố này?"
            onConfirm={() => handleDeleteIncident(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    total: incidents.length,
    pending: incidents.filter((i) => i.status === "Chờ xử lý").length,
    inProgress: incidents.filter((i) => i.status === "Đang xử lý").length,
    completed: incidents.filter((i) => i.status === "Hoàn thành").length,
    totalDowntime: incidents.reduce((sum, i) => sum + i.downtime, 0),
  };

  return (
    <div className={styles.incidentManagement}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng sự cố"
              value={stats.total}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Chờ xử lý"
              value={stats.pending}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Đang xử lý"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Thời gian chết"
              value={stats.totalDowntime}
              suffix="phút"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        title={
          <Space>
            <WarningOutlined />
            <span>Quản lý sự cố</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddIncident}
            >
              Báo cáo sự cố
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchIncidents}>
              Làm mới
            </Button>
          </Space>
        }
        bordered={false}
        className={styles.tableCard}
      >
        {/* Filters */}
        <div className={styles.filterSection}>
          <Space size="middle" wrap>
            <Input
              placeholder="Tìm kiếm mã, tiêu đề, thiết bị..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 150 }}
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả</Option>
              <Option value="Chờ xử lý">Chờ xử lý</Option>
              <Option value="Đang xử lý">Đang xử lý</Option>
              <Option value="Hoàn thành">Hoàn thành</Option>
              <Option value="Hủy">Hủy</Option>
            </Select>
            <Select
              value={filterPriority}
              onChange={setFilterPriority}
              style={{ width: 150 }}
              placeholder="Mức độ"
            >
              <Option value="all">Tất cả</Option>
              <Option value="Cao">Cao</Option>
              <Option value="Trung bình">Trung bình</Option>
              <Option value="Thấp">Thấp</Option>
            </Select>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredIncidents}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sự cố`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Chi tiết sự cố</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              handleEditIncident(selectedIncident);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={900}
      >
        {selectedIncident && (
          <div className={styles.detailContent}>
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Alert
                  message={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <Tag
                        color={getPriorityColor(selectedIncident.priority)}
                        style={{ fontSize: "14px", padding: "4px 12px" }}
                      >
                        Mức độ: {selectedIncident.priority}
                      </Tag>
                      <Tag
                        icon={getStatusIcon(selectedIncident.status)}
                        color={getStatusColor(selectedIncident.status)}
                        style={{ fontSize: "14px", padding: "4px 12px" }}
                      >
                        {selectedIncident.status}
                      </Tag>
                    </div>
                  }
                  type={selectedIncident.priority === "Cao" ? "error" : "info"}
                  showIcon
                />
              </Col>

              <Col span={24}>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Mã sự cố" span={2}>
                    <span style={{ fontWeight: 600, fontSize: "16px" }}>
                      {selectedIncident.id}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiêu đề" span={2}>
                    <span style={{ fontWeight: 600 }}>
                      {selectedIncident.title}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Thiết bị">
                    {selectedIncident.equipmentName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dây chuyền">
                    <Tag color="purple">{selectedIncident.lineName}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Danh mục">
                    <Tag color="blue">{selectedIncident.category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tác động">
                    <Tag
                      color={
                        selectedIncident.impact === "Cao"
                          ? "red"
                          : selectedIncident.impact === "Trung bình"
                          ? "orange"
                          : "green"
                      }
                    >
                      {selectedIncident.impact}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Người báo cáo">
                    {selectedIncident.reporter}
                  </Descriptions.Item>
                  <Descriptions.Item label="Người xử lý">
                    {selectedIncident.assignedTo || (
                      <span style={{ color: "#bbb" }}>Chưa phân công</span>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày báo cáo">
                    {selectedIncident.reportDate
                      ? dayjs(selectedIncident.reportDate).format(
                          "DD/MM/YYYY HH:mm"
                        )
                      : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày giải quyết">
                    {selectedIncident.resolveDate ? (
                      dayjs(selectedIncident.resolveDate).format(
                        "DD/MM/YYYY HH:mm"
                      )
                    ) : (
                      <span style={{ color: "#bbb" }}>Chưa giải quyết</span>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian chết" span={2}>
                    <span
                      style={{
                        color:
                          selectedIncident.downtime > 120
                            ? "#ff4d4f"
                            : "#1890ff",
                        fontWeight: 600,
                      }}
                    >
                      {selectedIncident.downtime} phút
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Vấn đề" span={2}>
                    {selectedIncident.issue}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nguyên nhân" span={2}>
                    {selectedIncident.reason || (
                      <span style={{ color: "#bbb" }}>Chưa xác định</span>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giải pháp" span={2}>
                    {selectedIncident.solution || (
                      <span style={{ color: "#bbb" }}>Chưa có giải pháp</span>
                    )}
                  </Descriptions.Item>
                  {selectedIncident.attachments &&
                    selectedIncident.attachments.length > 0 && (
                      <Descriptions.Item label="Tài liệu đính kèm" span={2}>
                        <Space direction="vertical">
                          {selectedIncident.attachments.map((file, index) => (
                            <Button
                              key={index}
                              type="link"
                              icon={<FileTextOutlined />}
                              size="small"
                            >
                              {file}
                            </Button>
                          ))}
                        </Space>
                      </Descriptions.Item>
                    )}
                </Descriptions>
              </Col>

              {/* Timeline */}
              <Col span={24}>
                <Card title="Lịch sử xử lý" size="small">
                  <Timeline>
                    <Timeline.Item
                      color="blue"
                      dot={<ExclamationCircleOutlined />}
                    >
                      <div>
                        <strong>Báo cáo sự cố</strong>
                        <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                          {selectedIncident.reportDate} -{" "}
                          {selectedIncident.reporter}
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          {selectedIncident.issue}
                        </div>
                      </div>
                    </Timeline.Item>
                    {selectedIncident.status !== "Chờ xử lý" && (
                      <Timeline.Item
                        color="orange"
                        dot={<ClockCircleOutlined />}
                      >
                        <div>
                          <strong>Bắt đầu xử lý</strong>
                          <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                            {selectedIncident.assignedTo}
                          </div>
                        </div>
                      </Timeline.Item>
                    )}
                    {selectedIncident.status === "Hoàn thành" && (
                      <Timeline.Item
                        color="green"
                        dot={<CheckCircleOutlined />}
                      >
                        <div>
                          <strong>Hoàn thành</strong>
                          <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                            {selectedIncident.resolveDate}
                          </div>
                          <div style={{ marginTop: "4px" }}>
                            {selectedIncident.solution}
                          </div>
                        </div>
                      </Timeline.Item>
                    )}
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Form Modal (Add/Edit) */}
      <Modal
        title={
          <Space>
            {isEditMode ? <EditOutlined /> : <PlusOutlined />}
            <span>{isEditMode ? "Cập nhật" : "Báo cáo"} sự cố</span>
          </Space>
        }
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{
            status: "Chờ xử lý",
            priority: "Trung bình",
            category: "Hỏng hóc",
            impact: "Trung bình",
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tiêu đề sự cố"
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
              >
                <Input placeholder="Nhập tiêu đề sự cố" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thiết bị"
                name="equipmentName"
                rules={[{ required: true, message: "Vui lòng chọn thiết bị!" }]}
              >
                <Select placeholder="Chọn thiết bị">
                  <Option value="Máy dập 01">Máy dập 01</Option>
                  <Option value="Băng tải 02">Băng tải 02</Option>
                  <Option value="Máy ép 03">Máy ép 03</Option>
                  <Option value="Máy hàn 04">Máy hàn 04</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Dây chuyền"
                name="lineName"
                rules={[
                  { required: true, message: "Vui lòng chọn dây chuyền!" },
                ]}
              >
                <Select placeholder="Chọn dây chuyền">
                  <Option value="Dây chuyền 1">Dây chuyền 1</Option>
                  <Option value="Dây chuyền 2">Dây chuyền 2</Option>
                  <Option value="Dây chuyền 3">Dây chuyền 3</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <Select placeholder="Chọn danh mục">
                  <Option value="Hỏng hóc">Hỏng hóc</Option>
                  <Option value="Bảo trì">Bảo trì</Option>
                  <Option value="An toàn">An toàn</Option>
                  <Option value="Chất lượng">Chất lượng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Mức độ ưu tiên"
                name="priority"
                rules={[{ required: true, message: "Vui lòng chọn mức độ!" }]}
              >
                <Select placeholder="Chọn mức độ">
                  <Option value="Cao">Cao</Option>
                  <Option value="Trung bình">Trung bình</Option>
                  <Option value="Thấp">Thấp</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Tác động"
                name="impact"
                rules={[{ required: true, message: "Vui lòng chọn tác động!" }]}
              >
                <Select placeholder="Chọn tác động">
                  <Option value="Cao">Cao</Option>
                  <Option value="Trung bình">Trung bình</Option>
                  <Option value="Thấp">Thấp</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="Chờ xử lý">Chờ xử lý</Option>
                  <Option value="Đang xử lý">Đang xử lý</Option>
                  <Option value="Hoàn thành">Hoàn thành</Option>
                  <Option value="Hủy">Hủy</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Người báo cáo"
                name="reporter"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
              >
                <Input placeholder="Nhập tên người báo cáo" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Người xử lý" name="assignedTo">
                <Input placeholder="Nhập tên người xử lý" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày báo cáo"
                name="reportDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày giờ"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ngày giải quyết" name="resolveDate">
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày giờ"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Mô tả vấn đề"
                name="issue"
                rules={[{ required: true, message: "Vui lòng mô tả vấn đề!" }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Mô tả chi tiết vấn đề gặp phải..."
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Nguyên nhân" name="reason">
                <TextArea rows={2} placeholder="Phân tích nguyên nhân..." />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Giải pháp" name="solution">
                <TextArea
                  rows={3}
                  placeholder="Mô tả giải pháp đã/đang thực hiện..."
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Thời gian chết (phút)" name="downtime">
                <Input type="number" placeholder="0" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tài liệu đính kèm" name="attachments">
                <Upload>
                  <Button icon={<UploadOutlined />}>Tải lên file</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setFormModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditMode ? "Cập nhật" : "Báo cáo"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IncidentManagement;
