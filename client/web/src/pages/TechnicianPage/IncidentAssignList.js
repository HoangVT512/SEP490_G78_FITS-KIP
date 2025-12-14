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
  Timeline,
  message,
  Badge,
  Tooltip,
  Divider,
  Dropdown,
  Statistic,
  Grid,
} from "antd";
import {
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  ToolOutlined,
  DownOutlined,
  InboxOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  MoreOutlined,
} from "@ant-design/icons";

const { useBreakpoint } = Grid;
import dayjs from "dayjs";
import { incidentService } from "../../services/incidentService";
import { replacementHistoryService } from "../../services/replacementHistoryService";
import SparepartRequestModal from "./SparepartRequestModal";
import ReplacementCreate from "./ReplacementCreate";
import ReplacementHistoryList from "./ReplacementHistoryList";
import styles from "../../styles/pages/IncidentAssignList.module.css";

const { TextArea } = Input;
const { Option } = Select;

const IncidentAssignList = () => {
  const [loading, setLoading] = useState(false);
  const [allIncidents, setAllIncidents] = useState([]); // Store all incidents
  const [incidents, setIncidents] = useState([]); // Filtered incidents for display
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [spareModalVisible, setSpareModalVisible] = useState(false);
  const [spareForIncident, setSpareForIncident] = useState(null);
  const [replacementModalVisible, setReplacementModalVisible] = useState(false);
  const [replacementForIncident, setReplacementForIncident] = useState(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyEquipmentId, setHistoryEquipmentId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  // Responsive flags
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  // Statistics calculation - always from allIncidents
  const stats = {
    total: allIncidents.length,
    pending: allIncidents.filter((i) => i.status === "Chưa xử lý").length,
    inProgress: allIncidents.filter((i) => i.status === "Đang xử lý").length,
    completed: allIncidents.filter((i) => i.status === "Hoàn thành").length,
  };

  // Fetch incidents assigned to current user
  useEffect(() => {
    fetchIncidents();
  }, []); // Only fetch once on mount

  // Filter incidents when filterStatus changes
  useEffect(() => {
    if (filterStatus === "all") {
      setIncidents(allIncidents);
    } else {
      setIncidents(allIncidents.filter((item) => item.status === filterStatus));
    }
  }, [filterStatus, allIncidents]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      // Call API to get incidents assigned to current technician
      const res = await incidentService.getAssignedToMe();
      const items = Array.isArray(res) ? res : res?.data || [];

      // Map to frontend format
      const mapped = items.map((it) => ({
        key: it.incidentId || it.id,
        incidentId: it.incidentId || it.id,
        incidentCode: `INC-${String(it.incidentId || it.id).padStart(3, "0")}`,
        equipmentId: it.equipmentId || it.equipment?.equipmentId,
        equipmentCode: it.equipment?.equipmentCode || it.equipmentCode || "",
        equipmentName: it.equipment?.equipmentName || it.equipmentName || "",
        issue: it.issue || it.title || "",
        reason: it.reason || "",
        solution: it.solution || null,
        priority: it.priority || "Trung bình",
        status: it.status || (it.isResolved ? "Hoàn thành" : "Chưa xử lý"),
        startTime: it.startTime || it.reportDate,
        endTime: it.endTime || null,
        assignedDate: it.assignedDate || it.startTime || it.reportDate,
        reportedBy:
          it.reportedByUser?.fullName || it.reportedByName || it.reporter || "",
        lineName:
          it.equipment?.stage?.line?.lineName || it.line?.lineName || "",
        stageName: it.equipment?.stage?.stageName || it.stage?.stageName || "",
        imageUrls: it.incidentImages?.map((img) => img.imageUrl) || [],
      }));

      // Store all incidents for badge counting
      setAllIncidents(mapped);

      // Apply current filter
      if (filterStatus === "all") {
        setIncidents(mapped);
      } else {
        setIncidents(mapped.filter((item) => item.status === filterStatus));
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách sự cố:", err);
      message.error("Không thể tải danh sách sự cố. Vui lòng thử lại.");
      setAllIncidents([]);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã sự cố",
      dataIndex: "incidentCode",
      key: "incidentCode",
      width: isMobile ? 90 : 100,
      fixed: "left",
      render: (text) => (
        <strong style={{ fontSize: isMobile ? 12 : 14 }}>{text}</strong>
      ),
    },
    {
      title: "Thiết bị",
      key: "equipment",
      width: isMobile ? 140 : 180,
      render: (record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: isMobile ? 12 : 14 }}>
            {record.equipmentName}
          </div>
          <div style={{ fontSize: isMobile ? 11 : 12, color: "#888" }}>
            {record.equipmentCode}
          </div>
        </div>
      ),
    },
    // Hide location column on mobile
    ...(!isMobile
      ? [
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
        ]
      : []),
    {
      title: "Vấn đề",
      dataIndex: "issue",
      key: "issue",
      width: isMobile ? 150 : 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <span style={{ fontSize: isMobile ? 12 : 14 }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: isMobile ? 100 : 130,
      render: (status) => {
        let color = "default";
        let icon = null;
        if (status === "Đang xử lý") {
          color = "processing";
          icon = <ClockCircleOutlined />;
        } else if (status === "Chưa xử lý") {
          color = "warning";
          icon = <WarningOutlined />;
        } else if (status === "Hoàn thành") {
          color = "success";
          icon = <CheckCircleOutlined />;
        }
        return (
          <Tag
            icon={isMobile ? null : icon}
            color={color}
            style={{ fontSize: isMobile ? 11 : 12 }}
          >
            {isMobile ? status.replace("xử lý", "") : status}
          </Tag>
        );
      },
    },
    // Hide date column on mobile
    ...(!isMobile
      ? [
          {
            title: "Ngày giao",
            dataIndex: "assignedDate",
            key: "assignedDate",
            width: 150,
            render: (text) =>
              text ? (
                <div>
                  <div style={{ fontSize: "13px" }}>
                    {dayjs(text).format("DD/MM/YYYY")}
                  </div>
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                    {dayjs(text).format("HH:mm")}
                  </div>
                </div>
              ) : (
                ""
              ),
          },
        ]
      : []),
    {
      title: "",
      key: "action",
      width: isMobile ? 50 : 80,
      fixed: "right",
      render: (record) => {
        const items = [
          {
            key: "detail",
            icon: <EyeOutlined />,
            label: "Chi tiết",
            onClick: () => handleViewDetail(record),
          },
        ];

        items.push({
          key: "history",
          icon: <ToolOutlined />,
          label: "Lịch sử thay thế",
          onClick: () => {
            setHistoryEquipmentId(record?.equipmentId || record.equipmentId);
            setHistoryModalVisible(true);
          },
        });

        return (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined style={{ fontSize: isMobile ? 18 : 20 }} />}
              style={{
                padding: isMobile ? 4 : 8,
                minWidth: isMobile ? 32 : 40,
                height: isMobile ? 32 : 40,
              }}
            />
          </Dropdown>
        );
      },
    },
  ];

  const handleViewDetail = (incident) => {
    setSelectedIncident(incident);
    setDetailModalVisible(true);
  };

  const handleUpdateIncident = (incident) => {
    setSelectedIncident(incident);
    form.setFieldsValue({
      status: incident.status,
      solution: incident.solution,
      endTime: incident.endTime,
    });
    setUpdateModalVisible(true);
  };

  // const handleUpdateSubmit = async (values) => {
  //   try {
  //     setLoading(true);
  //     // Simulate API call
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     message.success("Cập nhật sự cố thành công!");
  //     setUpdateModalVisible(false);
  //     form.resetFields();
  //     fetchIncidents();
  //   } catch (error) {
  //     message.error("Cập nhật sự cố thất bại!");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getStatusBadge = (status) => {
    const badges = {
      "Chưa xử lý": {
        count: allIncidents.filter((i) => i.status === "Chưa xử lý").length,
        color: "orange",
      },
      "Đang xử lý": {
        count: allIncidents.filter((i) => i.status === "Đang xử lý").length,
        color: "blue",
      },
      "Hoàn thành": {
        count: allIncidents.filter((i) => i.status === "Hoàn thành").length,
        color: "green",
      },
    };
    return badges[status] || { count: 0, color: "default" };
  };

  return (
    <div className={styles.container}>
      {/* Statistics */}
      <Row
        gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}
        className={styles.statsRow}
      >
        <Col xs={12} sm={12} lg={6}>
          <Card
            className={styles.statsCard}
            style={{
              borderRadius: isMobile ? "10px" : "12px",
              border: "1px solid #e8e8e8",
            }}
            bodyStyle={{ padding: isMobile ? 12 : 20 }}
          >
            <Statistic
              title={
                <span
                  style={{
                    color: "#283652",
                    fontWeight: "600",
                    fontSize: isMobile ? 12 : 14,
                  }}
                >
                  Tổng sự cố
                </span>
              }
              value={stats.total}
              prefix={
                <InboxOutlined
                  style={{ color: "#283652", fontSize: isMobile ? 16 : 20 }}
                />
              }
              valueStyle={{
                color: "#283652",
                fontSize: isMobile ? "20px" : "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            className={styles.statsCard}
            style={{
              borderRadius: isMobile ? "10px" : "12px",
              border: "1px solid #ffccc7",
            }}
            bodyStyle={{ padding: isMobile ? 12 : 20 }}
          >
            <Statistic
              title={
                <span
                  style={{
                    color: "#ff4d4f",
                    fontWeight: "600",
                    fontSize: isMobile ? 12 : 14,
                  }}
                >
                  Chưa xử lý
                </span>
              }
              value={stats.pending}
              prefix={
                <ExclamationCircleOutlined
                  style={{ color: "#ff4d4f", fontSize: isMobile ? 16 : 20 }}
                />
              }
              valueStyle={{
                color: "#ff4d4f",
                fontSize: isMobile ? "20px" : "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            className={styles.statsCard}
            style={{
              borderRadius: isMobile ? "10px" : "12px",
              border: "1px solid #ffe58f",
            }}
            bodyStyle={{ padding: isMobile ? 12 : 20 }}
          >
            <Statistic
              title={
                <span
                  style={{
                    color: "#faad14",
                    fontWeight: "600",
                    fontSize: isMobile ? 12 : 14,
                  }}
                >
                  Đang xử lý
                </span>
              }
              value={stats.inProgress}
              prefix={
                <ClockCircleOutlined
                  style={{ color: "#faad14", fontSize: isMobile ? 16 : 20 }}
                />
              }
              valueStyle={{
                color: "#faad14",
                fontSize: isMobile ? "20px" : "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            className={styles.statsCard}
            style={{
              borderRadius: isMobile ? "10px" : "12px",
              border: "1px solid #b7eb8f",
            }}
            bodyStyle={{ padding: isMobile ? 12 : 20 }}
          >
            <Statistic
              title={
                <span
                  style={{
                    color: "#52c41a",
                    fontWeight: "600",
                    fontSize: isMobile ? 12 : 14,
                  }}
                >
                  Hoàn thành
                </span>
              }
              value={stats.completed}
              prefix={
                <CheckCircleOutlined
                  style={{ color: "#52c41a", fontSize: isMobile ? 16 : 20 }}
                />
              }
              valueStyle={{
                color: "#52c41a",
                fontSize: isMobile ? "20px" : "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space size={isMobile ? "small" : "middle"}>
            <WarningOutlined style={{ fontSize: isMobile ? 16 : 18 }} />
            <span style={{ fontSize: isMobile ? 14 : 16 }}>
              Danh sách sự cố được giao
            </span>
          </Space>
        }
        className={styles.tableCard}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchIncidents}
            size={isMobile ? "middle" : "middle"}
            style={{ fontSize: isMobile ? 12 : 14 }}
          >
            {!isMobile && "Làm mới"}
          </Button>
        }
        variant="borderless"
        bodyStyle={{ padding: isMobile ? 12 : 24 }}
      >
        {/* Filter Tabs - Scrollable on mobile */}
        <div className={styles.filterTabs}>
          <div
            style={{
              display: "flex",
              gap: isMobile ? 8 : 12,
              overflowX: "auto",
              paddingBottom: 8,
              paddingTop: 12,
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Button
              type={filterStatus === "all" ? "primary" : "default"}
              onClick={() => setFilterStatus("all")}
              size={isMobile ? "middle" : "middle"}
              style={{
                borderRadius: "6px",
                fontWeight: "500",
                fontSize: isMobile ? 12 : 14,
                whiteSpace: "nowrap",
                minWidth: isMobile ? "auto" : 100,
                ...(filterStatus !== "all" && {
                  borderColor: "#d9d9d9",
                  color: "#595959",
                }),
              }}
            >
              Tất cả ({allIncidents.length})
            </Button>
            <Badge
              count={getStatusBadge("Chưa xử lý").count}
              color="red"
              size={isMobile ? "small" : "default"}
              offset={[-5, 0]}
              overflowCount={99}
            >
              <Button
                type={filterStatus === "Chưa xử lý" ? "primary" : "default"}
                onClick={() => setFilterStatus("Chưa xử lý")}
                size={isMobile ? "middle" : "middle"}
                style={{
                  borderRadius: "6px",
                  fontWeight: "500",
                  fontSize: isMobile ? 12 : 14,
                  whiteSpace: "nowrap",
                  ...(filterStatus !== "Chưa xử lý" && {
                    borderColor: "#d9d9d9",
                    color: "#595959",
                  }),
                }}
              >
                {isMobile ? "Chưa XL" : "Chưa xử lý"}
              </Button>
            </Badge>
            <Badge
              count={getStatusBadge("Đang xử lý").count}
              color="orange"
              size={isMobile ? "small" : "default"}
              offset={[-5, 0]}
              overflowCount={99}
            >
              <Button
                type={filterStatus === "Đang xử lý" ? "primary" : "default"}
                onClick={() => setFilterStatus("Đang xử lý")}
                size={isMobile ? "middle" : "middle"}
                style={{
                  borderRadius: "6px",
                  fontWeight: "500",
                  fontSize: isMobile ? 12 : 14,
                  whiteSpace: "nowrap",
                  ...(filterStatus !== "Đang xử lý" && {
                    borderColor: "#d9d9d9",
                    color: "#595959",
                  }),
                }}
              >
                {isMobile ? "Đang XL" : "Đang xử lý"}
              </Button>
            </Badge>
            <Badge
              count={getStatusBadge("Hoàn thành").count}
              color="green"
              size={isMobile ? "small" : "default"}
              offset={[-5, 0]}
              overflowCount={99}
            >
              <Button
                type={filterStatus === "Hoàn thành" ? "primary" : "default"}
                onClick={() => setFilterStatus("Hoàn thành")}
                size={isMobile ? "middle" : "middle"}
                style={{
                  borderRadius: "6px",
                  fontWeight: "500",
                  fontSize: isMobile ? 12 : 14,
                  whiteSpace: "nowrap",
                  ...(filterStatus !== "Hoàn thành" && {
                    borderColor: "#d9d9d9",
                    color: "#595959",
                  }),
                }}
              >
                Hoàn thành
              </Button>
            </Badge>
          </div>
        </div>

        <Divider style={{ margin: isMobile ? "12px 0" : "16px 0" }} />

        {/* Table */}
        <Table
          columns={columns}
          dataSource={incidents}
          loading={loading}
          scroll={{ x: isMobile ? 600 : 1000 }}
          size={isMobile ? "small" : "middle"}
          pagination={{
            pageSize: isMobile ? 5 : 10,
            showSizeChanger: !isMobile,
            showTotal: isMobile
              ? undefined
              : (total) => `Tổng số ${total} sự cố`,
            style: {
              marginTop: isMobile ? "12px" : "16px",
              fontSize: isMobile ? 12 : 14,
            },
            simple: isMobile,
          }}
          style={{ borderRadius: "6px" }}
        />
        {incidents.length === 0 && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: isMobile ? "24px" : "40px",
              color: "#6b7280",
              fontSize: isMobile ? 13 : 14,
            }}
          >
            Không có sự cố nào được giao
          </div>
        )}
      </Card>

      {/* Spare parts modal (request spare parts) */}
      <SparepartRequestModal
        incident={spareForIncident}
        open={spareModalVisible}
        onClose={() => {
          setSpareModalVisible(false);
          setSpareForIncident(null);
        }}
        onSuccess={() => {
          fetchIncidents(); // Refresh incidents list
        }}
      />

      {/* Replacement create modal (embedded form) */}
      <Modal
        title={
          <div
            style={{
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: "600",
              color: "#283652",
            }}
          >
            Ghi nhận thay thế
          </div>
        }
        open={replacementModalVisible}
        onCancel={() => {
          setReplacementModalVisible(false);
          setReplacementForIncident(null);
        }}
        footer={null}
        width={isMobile ? "100%" : 1200}
        centered
        destroyOnClose
        styles={{ body: { padding: isMobile ? 12 : 24 } }}
      >
        <ReplacementCreate
          incidentId={replacementForIncident?.incidentId}
          onSuccess={() => {
            setReplacementModalVisible(false);
            setReplacementForIncident(null);
            fetchIncidents();
          }}
          onCancel={() => {
            setReplacementModalVisible(false);
            setReplacementForIncident(null);
          }}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "8px" : "12px",
            }}
          >
            <div
              style={{
                width: isMobile ? "32px" : "40px",
                height: isMobile ? "32px" : "40px",
                borderRadius: "50%",
                backgroundColor: "#283652",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: isMobile ? "14px" : "18px",
              }}
            >
              <FileTextOutlined />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: isMobile ? "14px" : "16px",
                }}
              >
                Chi tiết sự cố
              </div>
              <div
                style={{
                  fontSize: isMobile ? "11px" : "12px",
                  color: "#6b7280",
                  fontWeight: "normal",
                }}
              >
                {selectedIncident?.incidentCode} •{" "}
                {isMobile ? "" : selectedIncident?.equipmentName}
              </div>
            </div>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={isMobile ? "100%" : 1200}
        centered={!isMobile}
        style={isMobile ? { top: 20, margin: 0, paddingBottom: 0 } : {}}
        styles={{ body: { padding: isMobile ? 12 : 24 } }}
        footer={[
          <Button
            key="close"
            onClick={() => setDetailModalVisible(false)}
            style={{
              height: isMobile ? "36px" : "40px",
              fontSize: isMobile ? "14px" : "16px",
              minWidth: isMobile ? "100px" : "120px",
            }}
          >
            Đóng
          </Button>,
        ]}
      >
        {selectedIncident && (
          <div
            style={{ maxHeight: isMobile ? "60vh" : "70vh", overflowY: "auto" }}
          >
            <Descriptions
              column={isMobile ? 1 : 2}
              bordered
              size={isMobile ? "small" : "default"}
              labelStyle={{
                fontWeight: "bold",
                fontSize: isMobile ? "12px" : "14px",
                backgroundColor: "#fafafa",
                borderRight: "1px solid #d9d9d9",
                padding: isMobile ? "8px 12px" : "12px 16px",
                minWidth: isMobile ? "100px" : "160px",
              }}
              contentStyle={{
                fontSize: isMobile ? "12px" : "14px",
                padding: isMobile ? "8px 12px" : "12px 16px",
              }}
            >
              <Descriptions.Item label="Mã sự cố" span={1}>
                <strong>{selectedIncident.incidentCode}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag
                  color={
                    selectedIncident.status === "Hoàn thành"
                      ? "success"
                      : selectedIncident.status === "Đang xử lý"
                      ? "processing"
                      : "warning"
                  }
                >
                  {selectedIncident.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thiết bị" span={2}>
                <strong>{selectedIncident.equipmentCode}</strong> -{" "}
                {selectedIncident.equipmentName}
              </Descriptions.Item>
              <Descriptions.Item label="Vị trí" span={2}>
                {selectedIncident.lineName} / {selectedIncident.stageName}
              </Descriptions.Item>
              <Descriptions.Item label="Vấn đề" span={2}>
                {selectedIncident.issue}
              </Descriptions.Item>
              <Descriptions.Item label="Nguyên nhân" span={2}>
                {selectedIncident.reason || "Chưa xác định"}
              </Descriptions.Item>
              <Descriptions.Item label="Giải pháp" span={2}>
                {selectedIncident.solution || "Chưa có giải pháp"}
              </Descriptions.Item>
              <Descriptions.Item label="Người báo cáo" span={1}>
                {selectedIncident.reportedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian bắt đầu" span={1}>
                {selectedIncident.startTime ? (
                  <div>
                    <div style={{ fontSize: "13px" }}>
                      {dayjs(selectedIncident.startTime).format("DD/MM/YYYY")}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      {dayjs(selectedIncident.startTime).format("HH:mm")}
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian kết thúc" span={1}>
                {selectedIncident.endTime ? (
                  <div>
                    <div style={{ fontSize: "13px" }}>
                      {dayjs(selectedIncident.endTime).format("DD/MM/YYYY")}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      {dayjs(selectedIncident.endTime).format("HH:mm")}
                    </div>
                  </div>
                ) : (
                  "Chưa hoàn thành"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày giao" span={1}>
                {selectedIncident.assignedDate ? (
                  <div>
                    <div style={{ fontSize: "13px" }}>
                      {dayjs(selectedIncident.assignedDate).format(
                        "DD/MM/YYYY"
                      )}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      {dayjs(selectedIncident.assignedDate).format("HH:mm")}
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Replacement history modal */}
      <Modal
        title={
          <div
            style={{
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: "600",
              color: "#283652",
            }}
          >
            Lịch sử thay thế
          </div>
        }
        open={historyModalVisible}
        onCancel={() => {
          setHistoryModalVisible(false);
          setHistoryEquipmentId(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setHistoryModalVisible(false);
              setHistoryEquipmentId(null);
            }}
            style={{
              height: isMobile ? "36px" : "40px",
              fontSize: isMobile ? "14px" : "16px",
              minWidth: isMobile ? "100px" : "120px",
            }}
          >
            Đóng
          </Button>,
        ]}
        width={isMobile ? "100%" : 1200}
        destroyOnClose
        styles={{ body: { padding: isMobile ? 12 : 24 } }}
      >
        <ReplacementHistoryList equipmentId={historyEquipmentId} />
      </Modal>

      {/* Update Modal */}
      {/* <Modal
        title={
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#283652" }}>
            Cập nhật sự cố
          </div>
        }
        open={updateModalVisible}
        onCancel={() => {
          setUpdateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
        centered
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "24px",
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateSubmit} scrollToFirstError>
          <Form.Item
            label={
              <span style={{ fontWeight: "600", fontSize: "14px" }}>
                Trạng thái
              </span>
            }
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái" size="large">
              <Option value="Chưa xử lý">Chưa xử lý</Option>
              <Option value="Đang xử lý">Đang xử lý</Option>
              <Option value="Hoàn thành">Hoàn thành</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span style={{ fontWeight: "600", fontSize: "14px" }}>
                Giải pháp
              </span>
            }
            name="solution"
          >
            <TextArea rows={4} placeholder="Mô tả giải pháp đã thực hiện..." size="large" />
          </Form.Item>

          <Form.Item
            label={
              <span style={{ fontWeight: "600", fontSize: "14px" }}>
                Ghi chú thêm
              </span>
            }
            name="notes"
          >
            <TextArea rows={3} placeholder="Ghi chú thêm (nếu có)..." size="large" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setUpdateModalVisible(false);
                  form.resetFields();
                }}
                style={{
                  height: "40px",
                  fontSize: "16px",
                  minWidth: "120px",
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  backgroundColor: "#283652",
                  height: "40px",
                  fontSize: "16px",
                  fontWeight: "500",
                  minWidth: "120px",
                }}
              >
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal> */}
    </div>
  );
};

export default IncidentAssignList;
