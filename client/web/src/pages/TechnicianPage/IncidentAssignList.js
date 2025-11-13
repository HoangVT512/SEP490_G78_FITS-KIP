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
} from "@ant-design/icons";
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
  const [incidents, setIncidents] = useState([]);
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

  // Statistics calculation
  const stats = {
    total: incidents.length,
    pending: incidents.filter((i) => i.status === "Chưa xử lý").length,
    inProgress: incidents.filter((i) => i.status === "Đang xử lý").length,
    completed: incidents.filter((i) => i.status === "Hoàn thành").length,
  };

  // Fetch incidents assigned to current user
  useEffect(() => {
    fetchIncidents();
  }, [filterStatus]);

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

      // Filter by status if needed
      let filtered = mapped;
      if (filterStatus !== "all") {
        filtered = mapped.filter((item) => item.status === filterStatus);
      }

      setIncidents(filtered);
    } catch (err) {
      console.error("Lỗi khi tải danh sách sự cố:", err);
      message.error("Không thể tải danh sách sự cố. Vui lòng thử lại.");
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
      width: 100,
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
      title: "Vấn đề",
      dataIndex: "issue",
      key: "issue",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
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
          <Tag icon={icon} color={color}>
            {status}
          </Tag>
        );
      },
    },
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
    {
      title: "Thao tác",
      key: "action",
      width: 120,
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

        // Chỉ hiển thị "Ghi nhận thay thế" khi sự cố chưa hoàn thành
        if (record.status !== "Hoàn thành") {
          items.push({
            key: "recordReplacement",
            icon: <ToolOutlined />,
            label: "Ghi nhận thay thế",
            onClick: async () => {
              // Check if there are any approved replacement requests
              try {
                const incidentId =
                  record.incidentId || record.id || record.incidentID;

                if (!incidentId) {
                  console.error("Cannot find incident ID in record:", record);
                  message.error("Không tìm thấy mã sự cố");
                  return;
                }

                console.log(
                  "=== Checking replacement for incident:",
                  incidentId
                );

                const res = await replacementHistoryService.getByIncidentId(
                  incidentId
                );
                const data = Array.isArray(res) ? res : res?.data || [];

                console.log("API Response:", res);
                console.log("Parsed data:", data);
                console.log(
                  "Data statuses:",
                  data.map((r) => ({ id: r.replacementID, status: r.status }))
                );

                const hasApprovedReplacement = data.some(
                  (r) =>
                    r.status === "Đã duyệt cấp phát" || r.status === "Completed"
                );

                console.log(
                  "Has approved replacement:",
                  hasApprovedReplacement
                );

                if (!hasApprovedReplacement) {
                  message.warning({
                    content:
                      "Vui lòng tạo yêu cầu phụ tùng và chờ Quản lý kho duyệt cấp phát trước khi ghi nhận thay thế",
                    duration: 5,
                  });
                  return;
                }

                // If there are approved replacements, show the modal
                setReplacementForIncident(record);
                setReplacementModalVisible(true);
              } catch (error) {
                console.error("Error checking replacement history:", error);
                // Nếu có lỗi API (ví dụ: chưa có yêu cầu nào), cũng hiển thị message hướng dẫn
                message.warning({
                  content:
                    "Vui lòng tạo yêu cầu phụ tùng và chờ Quản lý kho duyệt cấp phát trước khi ghi nhận thay thế",
                  duration: 5,
                });
              }
            },
          });
        }

        items.push({
          key: "history",
          icon: <ToolOutlined />,
          label: "Lịch sử thay thế",
          onClick: () => {
            setHistoryEquipmentId(record?.equipmentId || record.equipmentId);
            setHistoryModalVisible(true);
          },
        });

        // Chỉ hiển thị "Yêu cầu phụ tùng" khi sự cố chưa hoàn thành
        if (record.status !== "Hoàn thành") {
          items.push({
            key: "spare",
            icon: <ToolOutlined />,
            label: "Yêu cầu phụ tùng",
            onClick: () => {
              setSpareForIncident(record);
              setSpareModalVisible(true);
            },
          });
        }

        // Chỉ hiển thị "Cập nhật" khi sự cố chưa hoàn thành
        // if (record.status !== "Hoàn thành") {
        //   items.push({
        //     key: "update",
        //     icon: <EditOutlined />,
        //     label: "Cập nhật",
        //     onClick: () => handleUpdateIncident(record),
        //   });
        // }

        return (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <span
              style={{
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                padding: 4,
              }}
              aria-label="thao-tac"
              title="Thao tác"
            >
              <DownOutlined style={{ fontSize: 16 }} />
            </span>
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
        count: incidents.filter((i) => i.status === "Chưa xử lý").length,
        color: "orange",
      },
      "Đang xử lý": {
        count: incidents.filter((i) => i.status === "Đang xử lý").length,
        color: "blue",
      },
      "Hoàn thành": {
        count: incidents.filter((i) => i.status === "Hoàn thành").length,
        color: "green",
      },
    };
    return badges[status] || { count: 0, color: "default" };
  };

  return (
    <div className={styles.container}>
      {/* Statistics */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className={styles.statsCard}
            style={{ borderRadius: "8px", border: "1px solid #e8e8e8" }}
          >
            <Statistic
              title={
                <span style={{ color: "#283652", fontWeight: "600" }}>
                  Tổng sự cố
                </span>
              }
              value={stats.total}
              prefix={<InboxOutlined style={{ color: "#283652" }} />}
              valueStyle={{
                color: "#283652",
                fontSize: "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className={styles.statsCard}
            style={{ borderRadius: "8px", border: "1px solid #ffccc7" }}
          >
            <Statistic
              title={
                <span style={{ color: "#ff4d4f", fontWeight: "600" }}>
                  Chưa xử lý
                </span>
              }
              value={stats.pending}
              prefix={
                <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
              }
              valueStyle={{
                color: "#ff4d4f",
                fontSize: "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className={styles.statsCard}
            style={{ borderRadius: "8px", border: "1px solid #ffe58f" }}
          >
            <Statistic
              title={
                <span style={{ color: "#faad14", fontWeight: "600" }}>
                  Đang xử lý
                </span>
              }
              value={stats.inProgress}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
              valueStyle={{
                color: "#faad14",
                fontSize: "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className={styles.statsCard}
            style={{ borderRadius: "8px", border: "1px solid #b7eb8f" }}
          >
            <Statistic
              title={
                <span style={{ color: "#52c41a", fontWeight: "600" }}>
                  Hoàn thành
                </span>
              }
              value={stats.completed}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{
                color: "#52c41a",
                fontSize: "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <WarningOutlined />
            <span>Danh sách sự cố được giao</span>
          </Space>
        }
        className={styles.tableCard}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchIncidents}>
              Làm mới
            </Button>
          </Space>
        }
        variant="borderless"
      >
        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <Space size="middle">
            <Button
              type={filterStatus === "all" ? "primary" : "default"}
              onClick={() => setFilterStatus("all")}
              style={
                filterStatus === "all"
                  ? {
                      borderRadius: "6px",
                      fontWeight: "500",
                    }
                  : {
                      borderColor: "#d9d9d9",
                      color: "#595959",
                      borderRadius: "6px",
                      fontWeight: "500",
                    }
              }
            >
              Tất cả ({incidents.length})
            </Button>
            <Badge count={getStatusBadge("Chưa xử lý").count} color="red">
              <Button
                type={filterStatus === "Chưa xử lý" ? "primary" : "default"}
                onClick={() => setFilterStatus("Chưa xử lý")}
                style={
                  filterStatus === "Chưa xử lý"
                    ? {
                        borderRadius: "6px",
                        fontWeight: "500",
                      }
                    : {
                        borderColor: "#d9d9d9",
                        color: "#595959",
                        borderRadius: "6px",
                        fontWeight: "500",
                      }
                }
              >
                Chưa xử lý
              </Button>
            </Badge>
            <Badge count={getStatusBadge("Đang xử lý").count} color="orange">
              <Button
                type={filterStatus === "Đang xử lý" ? "primary" : "default"}
                onClick={() => setFilterStatus("Đang xử lý")}
                style={
                  filterStatus === "Đang xử lý"
                    ? {
                        borderRadius: "6px",
                        fontWeight: "500",
                      }
                    : {
                        borderColor: "#d9d9d9",
                        color: "#595959",
                        borderRadius: "6px",
                        fontWeight: "500",
                      }
                }
              >
                Đang xử lý
              </Button>
            </Badge>
            <Badge count={getStatusBadge("Hoàn thành").count} color="green">
              <Button
                type={filterStatus === "Hoàn thành" ? "primary" : "default"}
                onClick={() => setFilterStatus("Hoàn thành")}
                style={
                  filterStatus === "Hoàn thành"
                    ? {
                        borderRadius: "6px",
                        fontWeight: "500",
                      }
                    : {
                        borderColor: "#d9d9d9",
                        color: "#595959",
                        borderRadius: "6px",
                        fontWeight: "500",
                      }
                }
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
          dataSource={incidents}
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} sự cố`,
            style: { marginTop: "16px" },
          }}
          style={{ borderRadius: "6px" }}
        />
        {incidents.length === 0 && !loading && (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
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
            style={{ fontSize: "18px", fontWeight: "600", color: "#283652" }}
          >
            Ghi nhận thay thế (liên quan sự cố)
          </div>
        }
        open={replacementModalVisible}
        onCancel={() => {
          setReplacementModalVisible(false);
          setReplacementForIncident(null);
        }}
        footer={null}
        width={1200}
        centered
        destroyOnClose
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#283652",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
              }}
            >
              <FileTextOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "16px" }}>
                Chi tiết sự cố
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: "normal",
                }}
              >
                {selectedIncident?.incidentCode} •{" "}
                {selectedIncident?.equipmentName}
              </div>
            </div>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1200}
        centered
        footer={[
          <Button
            key="close"
            onClick={() => setDetailModalVisible(false)}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
          <Button
            key="history"
            icon={<ToolOutlined />}
            onClick={() => {
              setHistoryEquipmentId(
                selectedIncident?.equipmentId || selectedIncident?.equipmentId
              );
              setHistoryModalVisible(true);
            }}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Lịch sử thay thế
          </Button>,
          selectedIncident?.status !== "Hoàn thành" && (
            <Button
              key="update"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setDetailModalVisible(false);
                handleUpdateIncident(selectedIncident);
              }}
              style={{
                backgroundColor: "#283652",
                borderColor: "#283652",
                height: "40px",
                fontSize: "16px",
                minWidth: "120px",
              }}
            >
              Cập nhật
            </Button>
          ),
        ]}
      >
        {selectedIncident && (
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
            style={{ fontSize: "18px", fontWeight: "600", color: "#283652" }}
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
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
        ]}
        width={1200}
        destroyOnClose
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
