import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  InputNumber,
  message,
  Descriptions,
  Alert,
  Tooltip,
  Tabs,
  Badge,
  Empty,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  WarningOutlined,
  ToolOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import replacementHistoryService from "../../services/replacementHistoryService";
import { sparePartService } from "../../services/sparePartService";
import ReplacementApprovalModal from "./ReplacementApprovalModal";
import { incidentService } from "../../services/incidentService";

const SparePartsRequestApproval = () => {
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("incident");

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      // Get all pending replacement requests
      const data = await replacementHistoryService.getByStatus(
        "Chờ duyệt cấp phát"
      );
      const requests = data || [];

      // Group by incident
      const incidentMap = new Map();
      const workOrderMap = new Map();

      requests.forEach((req) => {
        if (req.incidentId) {
          if (!incidentMap.has(req.incidentId)) {
            incidentMap.set(req.incidentId, {
              incidentId: req.incidentId,
              equipmentId: req.equipmentId,
              equipmentName: req.equipmentName || "N/A",
              equipmentCode: req.equipmentCode || "N/A",
              incidentDescription: req.incidentDescription || "Sự cố",
              pendingCount: 0,
              requests: [],
            });
          }
          const incident = incidentMap.get(req.incidentId);
          incident.pendingCount++;
          incident.requests.push(req);
        } else if (req.workOrderId) {
          if (!workOrderMap.has(req.workOrderId)) {
            workOrderMap.set(req.workOrderId, {
              workOrderId: req.workOrderId,
              equipmentId: req.equipmentId,
              equipmentName: req.equipmentName || "N/A",
              equipmentCode: req.equipmentCode || "N/A",
              workOrderDescription: req.workOrderDescription || "Bảo trì",
              pendingCount: 0,
              requests: [],
            });
          }
          const wo = workOrderMap.get(req.workOrderId);
          wo.pendingCount++;
          wo.requests.push(req);
        }
      });

      setIncidents(Array.from(incidentMap.values()));
      setWorkOrders(Array.from(workOrderMap.values()));
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      message.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (incident, workOrder) => {
    if (incident) {
      setSelectedIncident(incident);
      setSelectedWorkOrder(null);
    } else if (workOrder) {
      setSelectedWorkOrder(workOrder);
      setSelectedIncident(null);
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedIncident(null);
    setSelectedWorkOrder(null);
    // Reload data after modal closes
    fetchPendingRequests();
  };

  // Columns for incident table
  const incidentColumns = [
    {
      title: "Mã sự cố",
      key: "incidentId",
      width: 100,
      render: (_, record) => `INC-${record.incidentId}`,
    },
    {
      title: "Thiết bị",
      key: "equipment",
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.equipmentName}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.equipmentCode}
          </div>
        </div>
      ),
    },
    {
      title: "Mô tả sự cố",
      dataIndex: "incidentDescription",
      key: "incidentDescription",
      width: 300,
      ellipsis: true,
    },
    {
      title: "Số lượng yêu cầu chờ duyệt",
      dataIndex: "pendingCount",
      key: "pendingCount",
      width: 180,
      align: "center",
      render: (count) => (
        <Badge count={count} showZero style={{ backgroundColor: "#faad14" }} />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<FileTextOutlined />}
          onClick={() => handleOpenModal(record, null)}
          style={{
            backgroundColor: "#283652",
            borderColor: "#283652",
          }}
        >
          Duyệt yêu cầu
        </Button>
      ),
    },
  ];

  // Columns for work order table
  const workOrderColumns = [
    {
      title: "Mã phiếu BT",
      key: "workOrderId",
      width: 100,
      render: (_, record) => `WO-${record.workOrderId}`,
    },
    {
      title: "Thiết bị",
      key: "equipment",
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.equipmentName}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.equipmentCode}
          </div>
        </div>
      ),
    },
    {
      title: "Mô tả bảo trì",
      dataIndex: "workOrderDescription",
      key: "workOrderDescription",
      width: 300,
      ellipsis: true,
    },
    {
      title: "Số lượng yêu cầu chờ duyệt",
      dataIndex: "pendingCount",
      key: "pendingCount",
      width: 180,
      align: "center",
      render: (count) => (
        <Badge count={count} showZero style={{ backgroundColor: "#1890ff" }} />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<FileTextOutlined />}
          onClick={() => handleOpenModal(null, record)}
          style={{
            backgroundColor: "#283652",
            borderColor: "#283652",
          }}
        >
          Duyệt yêu cầu
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Duyệt yêu cầu phụ tùng"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchPendingRequests}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        <Alert
          message="Lưu ý"
          description="Chọn sự cố hoặc phiếu bảo trì để xem và duyệt các yêu cầu phụ tùng. Kiểm tra tồn kho trước khi duyệt."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "incident",
              label: (
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  <WarningOutlined
                    style={{ marginRight: 6, color: "#ff4d4f" }}
                  />
                  Yêu cầu từ sự cố
                  <Badge
                    count={incidents.length}
                    style={{
                      marginLeft: 8,
                      backgroundColor: "#ff4d4f",
                    }}
                  />
                </span>
              ),
              children: (
                <Table
                  dataSource={incidents}
                  columns={incidentColumns}
                  rowKey="incidentId"
                  loading={loading}
                  pagination={{
                    total: incidents.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} sự cố`,
                  }}
                  scroll={{ x: 1200 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có sự cố nào có yêu cầu phụ tùng chờ duyệt"
                      />
                    ),
                  }}
                />
              ),
            },
            {
              key: "maintenance",
              label: (
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  <ToolOutlined style={{ marginRight: 6, color: "#1890ff" }} />
                  Yêu cầu từ bảo trì
                  <Badge
                    count={workOrders.length}
                    style={{
                      marginLeft: 8,
                      backgroundColor: "#1890ff",
                    }}
                  />
                </span>
              ),
              children: (
                <Table
                  dataSource={workOrders}
                  columns={workOrderColumns}
                  rowKey="workOrderId"
                  loading={loading}
                  pagination={{
                    total: workOrders.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} phiếu bảo trì`,
                  }}
                  scroll={{ x: 1200 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có phiếu bảo trì nào có yêu cầu phụ tùng chờ duyệt"
                      />
                    ),
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Replacement Approval Modal */}
      {(selectedIncident || selectedWorkOrder) && (
        <ReplacementApprovalModal
          equipmentId={
            selectedIncident?.equipmentId || selectedWorkOrder?.equipmentId
          }
          incidentId={selectedIncident?.incidentId}
          workOrderId={selectedWorkOrder?.workOrderId}
          equipmentInfo={{
            name:
              selectedIncident?.equipmentName ||
              selectedWorkOrder?.equipmentName,
            code:
              selectedIncident?.equipmentCode ||
              selectedWorkOrder?.equipmentCode,
          }}
          open={isModalVisible}
          onClose={handleCloseModal}
          onUpdated={fetchPendingRequests}
          viewMode={false}
        />
      )}
    </div>
  );
};

export default SparePartsRequestApproval;
