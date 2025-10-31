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
} from "@ant-design/icons";
import dayjs from "dayjs";
import { incidentService } from "../../services/incidentService";
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
        dueDate: it.dueDate || it.expectedEndTime || null,
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
      render: (text) => <div style={{ fontSize: "12px" }}>{text}</div>,
    },
    {
      title: "Hạn xử lý",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 150,
      render: (text, record) => {
        const isOverdue =
          new Date(text) < new Date() && record.status !== "Hoàn thành";
        return (
          <div
            style={{
              fontSize: "12px",
              color: isOverdue ? "#ff4d4f" : "inherit",
              fontWeight: isOverdue ? 500 : "normal",
            }}
          >
            {text}
            {isOverdue && <Badge status="error" style={{ marginLeft: 8 }} />}
          </div>
        );
      },
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
          {
            key: "recordReplacement",
            icon: <ToolOutlined />,
            label: "Ghi nhận thay thế",
            onClick: () => {
              setReplacementForIncident(record);
              setReplacementModalVisible(true);
            },
          },
          {
            key: "history",
            icon: <ToolOutlined />,
            label: "Lịch sử thay thế",
            onClick: () => {
              setHistoryEquipmentId(record?.equipmentId || record.equipmentId);
              setHistoryModalVisible(true);
            },
          },
          {
            key: "spare",
            icon: <ToolOutlined />,
            label: "Yêu cầu phụ tùng",
            onClick: () => {
              setSpareForIncident(record);
              setSpareModalVisible(true);
            },
          },
        ];

        if (record.status !== "Hoàn thành") {
          items.push({
            key: "update",
            icon: <EditOutlined />,
            label: "Cập nhật",
            onClick: () => handleUpdateIncident(record),
          });
        }

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

  const handleUpdateSubmit = async (values) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Cập nhật sự cố thành công!");
      setUpdateModalVisible(false);
      form.resetFields();
      fetchIncidents();
    } catch (error) {
      message.error("Cập nhật sự cố thất bại!");
    } finally {
      setLoading(false);
    }
  };

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
    <div className={styles.incidentList}>
      <Card
        title={
          <Space>
            <WarningOutlined />
            <span>Danh sách sự cố được giao</span>
          </Space>
        }
        extra={
          <Space>
            <Button type="primary" onClick={fetchIncidents} loading={loading}>
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
              Tất cả ({incidents.length})
            </Button>
            <Badge count={getStatusBadge("Chưa xử lý").count} color="orange">
              <Button
                type={filterStatus === "Chưa xử lý" ? "primary" : "default"}
                onClick={() => setFilterStatus("Chưa xử lý")}
              >
                Chưa xử lý
              </Button>
            </Badge>
            <Badge count={getStatusBadge("Đang xử lý").count} color="blue">
              <Button
                type={filterStatus === "Đang xử lý" ? "primary" : "default"}
                onClick={() => setFilterStatus("Đang xử lý")}
              >
                Đang xử lý
              </Button>
            </Badge>
            <Badge count={getStatusBadge("Hoàn thành").count} color="green">
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
          dataSource={incidents}
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} sự cố`,
          }}
        />
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
        title={<span>Ghi nhận thay thế (liên quan sự cố)</span>}
        open={replacementModalVisible}
        onCancel={() => {
          setReplacementModalVisible(false);
          setReplacementForIncident(null);
        }}
        footer={null}
        width={900}
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
          <Space>
            <FileTextOutlined />
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
            key="history"
            icon={<ToolOutlined />}
            onClick={() => {
              setHistoryEquipmentId(
                selectedIncident?.equipmentId || selectedIncident?.equipmentId
              );
              setHistoryModalVisible(true);
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
            >
              Cập nhật
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedIncident && (
          <div>
            <Descriptions bordered column={2} size="small">
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
              <Descriptions.Item label="Ưu tiên" span={1}>
                <Tag
                  color={
                    selectedIncident.priority === "Cao"
                      ? "red"
                      : selectedIncident.priority === "Trung bình"
                      ? "orange"
                      : "green"
                  }
                >
                  {selectedIncident.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người báo cáo" span={1}>
                {selectedIncident.reportedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian bắt đầu" span={1}>
                {selectedIncident.startTime}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian kết thúc" span={1}>
                {selectedIncident.endTime || "Chưa hoàn thành"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày giao" span={1}>
                {selectedIncident.assignedDate}
              </Descriptions.Item>
              <Descriptions.Item label="Hạn xử lý" span={1}>
                {selectedIncident.dueDate}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Replacement history modal */}
      <Modal
        title={<span>Lịch sử thay thế</span>}
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
          >
            Đóng
          </Button>,
        ]}
        width={1100}
        destroyOnClose
      >
        <ReplacementHistoryList equipmentId={historyEquipmentId} />
      </Modal>

      {/* Update Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>Cập nhật sự cố</span>
          </Space>
        }
        open={updateModalVisible}
        onCancel={() => {
          setUpdateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateSubmit}>
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="Chưa xử lý">Chưa xử lý</Option>
              <Option value="Đang xử lý">Đang xử lý</Option>
              <Option value="Hoàn thành">Hoàn thành</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Giải pháp" name="solution">
            <TextArea rows={4} placeholder="Mô tả giải pháp đã thực hiện..." />
          </Form.Item>

          <Form.Item label="Ghi chú thêm" name="notes">
            <TextArea rows={3} placeholder="Ghi chú thêm (nếu có)..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setUpdateModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IncidentAssignList;
