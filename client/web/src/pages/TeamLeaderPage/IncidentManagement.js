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
  Dropdown,
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
  DownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/IncidentManagement.module.css";
import { incidentService } from "../../services/incidentService";
import { equipmentService } from "../../services/equipmentService";
import { lineService } from "../../services/lineService";
import { stageService } from "../../services/stageService";
import { stopTypeService } from "../../services/stopTypeService";
import { useAuth } from "../../contexts/AuthContext";

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const IncidentManagement = () => {
  const { user: currentUser } = useAuth();
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

  // State for dropdown data
  const [equipments, setEquipments] = useState([]);
  const [lines, setLines] = useState([]);
  const [stages, setStages] = useState([]);
  const [stopTypes, setStopTypes] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [currentReporter, setCurrentReporter] = useState(null);

  useEffect(() => {
    fetchIncidents();
    fetchEquipments();
    fetchLines();
    fetchStages();
    fetchStopTypes();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [searchText, filterStatus, filterPriority, incidents]);

  const fetchEquipments = async () => {
    try {
      const response = await equipmentService.getEquipments();
      const data = Array.isArray(response) ? response : response?.data || [];
      setEquipments(data);
    } catch (error) {
      console.error("Error fetching equipments:", error);
      message.error("Không thể tải danh sách thiết bị");
    }
  };

  const fetchLines = async () => {
    try {
      const response = await lineService.getLines();
      const data = Array.isArray(response) ? response : response?.data || [];
      setLines(data);
    } catch (error) {
      console.error("Error fetching lines:", error);
      message.error("Không thể tải danh sách dây chuyền");
    }
  };

  const fetchStages = async () => {
    try {
      const response = await stageService.getStages();
      const data = Array.isArray(response) ? response : response?.data || [];
      setStages(data);
    } catch (error) {
      console.error("Error fetching stages:", error);
      message.error("Không thể tải danh sách công đoạn");
    }
  };

  const fetchStopTypes = async () => {
    try {
      const response = await stopTypeService.getStopTypes();
      const data = Array.isArray(response) ? response : response?.data || [];
      setStopTypes(data);
    } catch (error) {
      console.error("Error fetching stop types:", error);
      message.error("Không thể tải danh sách loại dừng");
    }
  };

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
          equipmentId: it.equipmentId || it.equipment?.equipmentId,
          typeId: it.typeId || it.type?.typeId || it.type?.stopTypeId,
          lineId: it.equipment?.lineId || it.line?.lineId,
          stageId: it.equipment?.stageId || it.stage?.stageId,
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
          lineName:
            it.equipment?.stage?.line?.lineName ||
            it.line?.lineName ||
            it.lineName ||
            it.LineName ||
            "",
          stageName:
            it.equipment?.stage?.stageName ||
            it.stage?.stageName ||
            it.stageName ||
            it.StageName ||
            "",
          priority: it.priority || it.Priority || "Trung bình",
          status:
            it.status ||
            it.Status ||
            (it.isResolved ? "Hoàn thành" : "Chờ xử lý"),
          reporter:
            it.reportedByUser?.fullName ||
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
    // Auto-fill reporter with current user name
    const reporterName =
      currentUser?.fullName || currentUser?.userName || "Không xác định";
    setCurrentReporter(reporterName);
    form.setFieldsValue({
      reporter: reporterName,
    });
    setFormModalVisible(true);
  };

  const handleEditIncident = (record) => {
    setIsEditMode(true);
    setSelectedIncident(record);

    // Find the equipment to pre-select it
    const equipment = equipments.find(
      (e) => e.equipmentId === record.equipmentId
    );
    if (equipment) {
      setSelectedEquipment(equipment);
    }

    // Set form values with proper equipment selection
    form.setFieldsValue({
      equipmentCode: record.equipmentId, // This is the value for the Select, which uses equipmentId
      equipmentId: record.equipmentId,
      lineId: equipment?.lineId || record.lineId,
      stageId: equipment?.stageId || record.stageId,
      typeId:
        record.typeId ||
        (record.category
          ? stopTypes.find((st) => st.typeName === record.category)?.stopTypeId
          : null),
      issue: record.issue,
      reason: record.reason,
      solution: record.solution,
      status: record.status,
      startTime: record.reportDate ? dayjs(record.reportDate) : null,
      endTime: record.resolveDate ? dayjs(record.resolveDate) : null,
      reporter: record.reporter,
    });
    setFormModalVisible(true);
  };

  const handleDeleteIncident = async (id) => {
    try {
      setLoading(true);
      await incidentService.delete(id);
      message.success("Xóa sự cố thành công!");
      fetchIncidents();
    } catch (error) {
      console.error("Delete incident error:", error);
      const errMsg = error?.message || error?.data?.message || "Xóa thất bại!";
      message.error(errMsg);
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

      // Build payload according to backend CreateIncidentRequest
      const payload = {
        equipmentId:
          form.getFieldValue("equipmentId") || values.equipmentId || null,
        // StartTime is intentionally omitted so backend will set it to current time
        endTime: values.endTime ? dayjs(values.endTime).toDate() : null,
        typeId: values.typeId || null,
        issue: values.issue,
        reason: values.reason || null,
        solution: values.solution || null,
        reportedByUserId:
          currentUser?.id || currentUser?.userId || currentUser?.userID || null,
      };

      if (isEditMode) {
        // For edit include startTime, endTime and status
        // Get equipmentId from form or selectedEquipment
        const formEquipmentId = form.getFieldValue("equipmentId");
        const finalEquipmentId =
          formEquipmentId ||
          selectedEquipment?.equipmentId ||
          selectedIncident.equipmentId;

        // Find typeId from stopTypes if not in values
        let typeId = values.typeId;
        if (!typeId && selectedIncident.category) {
          const stopType = stopTypes.find(
            (st) => st.typeName === selectedIncident.category
          );
          typeId = stopType?.stopTypeId || stopType?.typeId;
        }

        const editPayload = {
          equipmentId: finalEquipmentId,
          startTime: values.startTime
            ? dayjs(values.startTime).toDate()
            : dayjs(selectedIncident.reportDate).toDate(),
          endTime: values.endTime ? dayjs(values.endTime).toDate() : null,
          typeId: typeId || null, // Send null if not changed
          issue: values.issue || selectedIncident.issue,
          reason: values.reason || selectedIncident.reason,
          solution: values.solution || selectedIncident.solution,
          status: values.status || selectedIncident.status || "Chờ xử lý",
        };
        const id =
          selectedIncident?.id ||
          selectedIncident?.incidentId ||
          selectedIncident?.IncidentId;
        await incidentService.update(id, editPayload);
        message.success("Cập nhật sự cố thành công!");
      } else {
        await incidentService.create(payload);
        message.success("Thêm sự cố thành công!");
      }

      setFormModalVisible(false);
      form.resetFields();
      fetchIncidents();
    } catch (error) {
      console.error("Save incident error:", error);
      const errMsg = error?.message || error?.data?.message || "Lưu thất bại!";
      message.error(errMsg);
    } finally {
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
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (text, record) => (
        <Tooltip
          title={`${text}${
            record.equipmentCode ? ` (${record.equipmentCode})` : ""
          }`}
        >
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            {record.equipmentCode && (
              <div style={{ color: "#999", fontSize: 12 }}>
                {record.equipmentCode}
              </div>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Dây chuyền",
      dataIndex: "lineName",
      key: "lineName",
      width: 130,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text}>
          <Tag color="purple">{text}</Tag>
        </Tooltip>
      ),
    },
    {
      title: "Công đoạn",
      dataIndex: "stageName",
      key: "stageName",
      width: 130,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text || "Chưa xác định"}>
          <Tag color="blue">{text || "Chưa xác định"}</Tag>
        </Tooltip>
      ),
    },
    {
      title: "Vấn đề",
      dataIndex: "issue",
      key: "issue",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text || "Chưa mô tả"}>
          <span>{text || "Chưa mô tả"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Khung giờ bắt đầu",
      dataIndex: "reportDate",
      key: "startTime",
      width: 150,
      render: (d) => (d ? dayjs(d).format("HH:mm") : "-"),
    },
    {
      title: "Khung giờ kết thúc",
      dataIndex: "resolveDate",
      key: "endTime",
      width: 150,
      render: (d) => (d ? dayjs(d).format("HH:mm") : "-"),
    },
    {
      title: "Ngày báo cáo",
      dataIndex: "reportDate",
      key: "reportDate",
      width: 150,
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Loại dừng",
      dataIndex: "category",
      key: "category",
      width: 130,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text || "Chưa phân loại"}>
          <Tag color="orange">{text || "Chưa phân loại"}</Tag>
        </Tooltip>
      ),
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
      title: "Nguyên nhân",
      dataIndex: "reason",
      key: "reason",
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text || "Chưa xác định"}>
          <span>{text || "Chưa xác định"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Giải pháp",
      dataIndex: "solution",
      key: "solution",
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text || "Chưa có giải pháp"}>
          <span>{text || "Chưa có giải pháp"}</span>
        </Tooltip>
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
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => {
        const items = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "Xem chi tiết",
            onClick: () => handleViewDetail(record),
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Chỉnh sửa",
            onClick: () => handleEditIncident(record),
          },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Xóa",
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: "Xóa sự cố",
                content: "Bạn có chắc chắn muốn xóa sự cố này?",
                okText: "Xóa",
                cancelText: "Hủy",
                okButtonProps: { danger: true },
                onOk() {
                  handleDeleteIncident(record.id);
                },
              });
            },
          },
        ];
        return (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <DownOutlined style={{ cursor: "pointer", fontSize: "16px" }} />
          </Dropdown>
        );
      },
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
          scroll={{ x: "max-content" }}
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
            <Row gutter={[16, 16]}>
              {/* Main Information Card */}
              <Col span={24}>
                <Card size="small">
                  <Row gutter={[16, 16]}>
                    {/* Row 1: Mã sự cố */}
                    <Col span={24}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Mã sự cố
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "18px",
                          color: "#1890ff",
                        }}
                      >
                        #{selectedIncident.id}
                      </div>
                    </Col>

                    {/* Row 2: Thiết bị */}
                    {selectedIncident.equipmentName && (
                      <Col span={24}>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#666",
                            marginBottom: 6,
                            fontWeight: 600,
                          }}
                        >
                          Thiết bị
                        </div>
                        <div style={{ fontWeight: 600, fontSize: "14px" }}>
                          {selectedIncident.equipmentName}
                          {selectedIncident.equipmentCode && (
                            <span style={{ color: "#999", marginLeft: 8 }}>
                              ({selectedIncident.equipmentCode})
                            </span>
                          )}
                        </div>
                      </Col>
                    )}

                    {/* Row 3: Time Info (StartTime, EndTime, Duration) */}
                    <Col span={8}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Thời gian bắt đầu
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        {selectedIncident.reportDate
                          ? dayjs(selectedIncident.reportDate).format(
                              "DD/MM/YYYY HH:mm"
                            )
                          : "-"}
                      </div>
                    </Col>
                    <Col span={8}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Thời gian kết thúc
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        {selectedIncident.resolveDate
                          ? dayjs(selectedIncident.resolveDate).format(
                              "DD/MM/YYYY HH:mm"
                            )
                          : "-"}
                      </div>
                    </Col>
                    <Col span={8}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Thời lượng (phút)
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>
                        {selectedIncident.downtime || "-"}
                      </div>
                    </Col>

                    {/* Row 4: Status, StopType */}
                    <Col span={12}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Trạng thái
                      </div>
                      {selectedIncident.status ? (
                        <Tag
                          icon={getStatusIcon(selectedIncident.status)}
                          color={getStatusColor(selectedIncident.status)}
                        >
                          {selectedIncident.status}
                        </Tag>
                      ) : (
                        <span>-</span>
                      )}
                    </Col>
                    <Col span={12}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Loại dừng
                      </div>
                      {selectedIncident.category ? (
                        <Tag color="orange">{selectedIncident.category}</Tag>
                      ) : (
                        <span>-</span>
                      )}
                    </Col>

                    {/* Row 5: Issue (Vấn đề) */}
                    <Col span={24}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Vấn đề
                      </div>
                      <div style={{ fontSize: "14px", lineHeight: 1.6 }}>
                        {selectedIncident.issue || "-"}
                      </div>
                    </Col>

                    {/* Row 6: Reason (Nguyên nhân) */}
                    <Col span={24}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Nguyên nhân
                      </div>
                      <div style={{ fontSize: "14px", lineHeight: 1.6 }}>
                        {selectedIncident.reason || "-"}
                      </div>
                    </Col>

                    {/* Row 7: Solution (Giải pháp) */}
                    <Col span={24}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Giải pháp
                      </div>
                      <div style={{ fontSize: "14px", lineHeight: 1.6 }}>
                        {selectedIncident.solution || "-"}
                      </div>
                    </Col>

                    {/* Row 8: CreatedDate, ReportedByUserId */}
                    <Col span={12}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Ngày tạo
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        {selectedIncident.reportDate
                          ? dayjs(selectedIncident.reportDate).format(
                              "DD/MM/YYYY"
                            )
                          : "-"}
                      </div>
                    </Col>
                    <Col span={12}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Người báo cáo
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        {selectedIncident.reporter || "-"}
                      </div>
                    </Col>
                  </Row>
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
          initialValues={{ status: "Chờ xử lý" }}
        >
          <Row gutter={16}>
            {/* hidden status field for create mode, visible for edit mode */}
            {!isEditMode && (
              <Form.Item name="status" hidden>
                <Input />
              </Form.Item>
            )}

            <Col span={12}>
              <Form.Item
                label="Mã thiết bị"
                name="equipmentCode"
                rules={[
                  { required: true, message: "Vui lòng chọn mã thiết bị!" },
                ]}
              >
                <Select
                  placeholder="Chọn hoặc tìm mã thiết bị"
                  showSearch
                  optionFilterProp="children"
                  onSearch={() => {}}
                  onChange={(value) => {
                    // value will be equipmentId (we store id as value but show code+name)
                    const equipment = equipments.find(
                      (e) => e.equipmentId === value
                    );
                    if (equipment) {
                      setSelectedEquipment(equipment);
                      // set equipmentId, lineId, stageId in form so other fields stay in sync
                      form.setFieldsValue({
                        equipmentId: equipment.equipmentId,
                        equipmentCode: equipment.equipmentCode,
                        lineId: equipment.lineId,
                        stageId: equipment.stageId,
                      });
                    } else {
                      setSelectedEquipment(null);
                      form.setFieldsValue({ equipmentId: null });
                    }
                  }}
                >
                  {equipments.map((equipment) => (
                    <Option
                      key={equipment.equipmentId}
                      value={equipment.equipmentId}
                    >
                      {equipment.equipmentCode} - {equipment.equipmentName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* hidden equipmentId so form submission includes the id */}
              <Form.Item name="equipmentId" hidden>
                <Input />
              </Form.Item>
              <Form.Item label="Thiết bị">
                <Input
                  disabled
                  value={
                    selectedEquipment
                      ? `${selectedEquipment.equipmentName}${
                          selectedEquipment.equipmentCode
                            ? ` (${selectedEquipment.equipmentCode})`
                            : ""
                        }`
                      : ""
                  }
                  placeholder="Chưa chọn thiết bị"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lineId" hidden>
                <Input />
              </Form.Item>
              <Form.Item label="Dây chuyền">
                <Input
                  disabled
                  value={
                    selectedEquipment
                      ? lines.find((l) => l.lineId === selectedEquipment.lineId)
                          ?.lineName || ""
                      : lines.find(
                          (l) => l.lineId === form.getFieldValue("lineId")
                        )?.lineName || ""
                  }
                  placeholder="Chưa chọn dây chuyền"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stageId" hidden>
                <Input />
              </Form.Item>
              <Form.Item label="Công đoạn">
                <Input
                  disabled
                  value={
                    selectedEquipment
                      ? stages.find(
                          (s) => s.stageId === selectedEquipment.stageId
                        )?.stageName || ""
                      : stages.find(
                          (s) => s.stageId === form.getFieldValue("stageId")
                        )?.stageName || ""
                  }
                  placeholder="Chưa chọn công đoạn"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Loại dừng" name="typeId">
                <Select placeholder="Chọn loại dừng" showSearch>
                  {stopTypes.map((stopType) => (
                    <Option
                      key={stopType.stopTypeId || stopType.typeId}
                      value={stopType.stopTypeId || stopType.typeId}
                    >
                      {stopType.typeName || stopType.stopTypeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              {isEditMode ? (
                <Form.Item
                  label="Thời gian bắt đầu"
                  name="startTime"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập thời gian bắt đầu!",
                    },
                  ]}
                >
                  <DatePicker
                    showTime={{ format: "HH:mm" }}
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Chọn thời gian bắt đầu"
                  />
                </Form.Item>
              ) : (
                <Form.Item name="status" hidden>
                  <Input />
                </Form.Item>
              )}
            </Col>

            <Col span={12}>
              {isEditMode && (
                <Form.Item label="Thời gian kết thúc" name="endTime">
                  <DatePicker
                    showTime={{ format: "HH:mm" }}
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Chọn thời gian kết thúc"
                  />
                </Form.Item>
              )}
            </Col>

            <Col span={12}>
              {isEditMode && (
                <Form.Item
                  label="Trạng thái"
                  name="status"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn trạng thái!",
                    },
                  ]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Option value="Chờ xử lý">Chờ xử lý</Option>
                    <Option value="Đang xử lý">Đang xử lý</Option>
                    <Option value="Hoàn thành">Hoàn thành</Option>
                    <Option value="Hủy">Hủy</Option>
                  </Select>
                </Form.Item>
              )}
              {!isEditMode && (
                <Form.Item label="Trạng thái">
                  <Input disabled value="Chờ xử lý" />
                </Form.Item>
              )}
            </Col>

            <Col span={12}>
              <Form.Item
                label="Người báo cáo"
                name="reporter"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
              >
                <Input disabled placeholder="Nhập tên người báo cáo" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Alert
                type="error"
                message="Lưu ý: Nếu đây không phải là tài khoản của bạn, vui lòng đăng nhập bằng tài khoản của bạn trước khi báo cáo sự cố!"
                showIcon
                style={{ marginBottom: 16, marginTop: 8 }}
              />
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
