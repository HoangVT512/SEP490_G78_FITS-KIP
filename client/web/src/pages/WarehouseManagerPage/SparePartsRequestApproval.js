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
  Dropdown,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  WarningOutlined,
  ToolOutlined,
  FileTextOutlined,
  DownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import replacementHistoryService from "../../services/replacementHistoryService";
import { sparePartService } from "../../services/sparePartService";
import ReplacementApprovalModal from "./ReplacementApprovalModal";
import { incidentService } from "../../services/incidentService";

const SparePartsRequestApproval = () => {
  const [loading, setLoading] = useState(false);
  const [incidentRequests, setIncidentRequests] = useState([]); // Danh sách yêu cầu từ sự cố
  const [workOrderRequests, setWorkOrderRequests] = useState([]); // Danh sách yêu cầu từ bảo trì
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("incident");
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState(null);

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

      // Group theo incidentId - mỗi sự cố chỉ hiển thị 1 dòng
      const incidentGroups = {};
      const workOrderGroups = {};

      requests.forEach((req) => {
        if (req.incidentId != null) {
          const key = req.incidentId;
          if (!incidentGroups[key]) {
            incidentGroups[key] = {
              incidentId: req.incidentId,
              equipmentId: req.equipmentId,
              equipmentName: req.equipmentName,
              equipmentCode: req.equipmentCode,
              replacedByFullName: req.replacedByFullName,
              replacedByEmployeeCode: req.replacedByEmployeeCode,
              status: req.status,
              parts: [],
            };
          }
          incidentGroups[key].parts.push({
            partNumber: req.partNumber,
            partName: req.partName,
            quantity: req.quantity,
          });
        } else if (req.workOrderId != null) {
          const key = req.workOrderId;
          if (!workOrderGroups[key]) {
            workOrderGroups[key] = {
              workOrderId: req.workOrderId,
              equipmentId: req.equipmentId,
              equipmentName: req.equipmentName,
              equipmentCode: req.equipmentCode,
              replacedByFullName: req.replacedByFullName,
              replacedByEmployeeCode: req.replacedByEmployeeCode,
              status: req.status,
              parts: [],
            };
          }
          workOrderGroups[key].parts.push({
            partNumber: req.partNumber,
            partName: req.partName,
            quantity: req.quantity,
          });
        }
      });

      setIncidentRequests(Object.values(incidentGroups));
      setWorkOrderRequests(Object.values(workOrderGroups));
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      message.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (
    equipmentId,
    incidentId,
    workOrderId,
    equipmentInfo
  ) => {
    setSelectedRequest({ equipmentId, incidentId, workOrderId, equipmentInfo });
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedRequest(null);
    fetchPendingRequests();
  };

  // Columns hiển thị chi tiết yêu cầu từ sự cố
  const incidentColumns = [
    {
      title: "Mã sự cố",
      dataIndex: "incidentId",
      key: "incidentId",
      width: 120,
      render: (id) => <Tag color="orange">INC-{id}</Tag>,
    },
    {
      title: "Thiết bị",
      key: "equipment",
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.equipmentName || "N/A"}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.equipmentCode || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Số loại linh kiện",
      key: "partCount",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Tag color="blue" style={{ fontSize: "14px" }}>
          {record.parts?.length || 0} loại
        </Tag>
      ),
    },
    {
      title: "Người yêu cầu",
      key: "requester",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.replacedByFullName || "N/A"}
          </div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.replacedByEmployeeCode
              ? `(${record.replacedByEmployeeCode})`
              : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => <Tag color="orange">{status || "N/A"}</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "detail",
                icon: <EyeOutlined />,
                label: "Xem chi tiết",
                onClick: () => {
                  setSelectedRequestDetail(record);
                  setDetailDrawerVisible(true);
                },
              },
              {
                key: "approve",
                icon: <FileTextOutlined />,
                label: "Xem yêu cầu linh kiện",
                onClick: () =>
                  handleOpenModal(record.equipmentId, record.incidentId, null, {
                    name: record.equipmentName,
                    code: record.equipmentCode,
                  }),
              },
            ],
          }}
        >
          <Button type="text" size="small" icon={<DownOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Columns hiển thị chi tiết yêu cầu từ bảo trì
  const workOrderColumns = [
    {
      title: "Mã phiếu BT",
      dataIndex: "workOrderId",
      key: "workOrderId",
      width: 120,
      render: (id) => <Tag color="blue">WO-{id}</Tag>,
    },
    {
      title: "Thiết bị",
      key: "equipment",
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.equipmentName || "N/A"}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.equipmentCode || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Số loại linh kiện",
      key: "partCount",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Tag color="blue" style={{ fontSize: "14px" }}>
          {record.parts?.length || 0} loại
        </Tag>
      ),
    },
    {
      title: "Người yêu cầu",
      key: "requester",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.replacedByFullName || "N/A"}
          </div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.replacedByEmployeeCode
              ? `(${record.replacedByEmployeeCode})`
              : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => <Tag color="orange">{status || "N/A"}</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "detail",
                icon: <EyeOutlined />,
                label: "Xem chi tiết",
                onClick: () => {
                  setSelectedRequestDetail(record);
                  setDetailDrawerVisible(true);
                },
              },
              {
                key: "approve",
                icon: <FileTextOutlined />,
                label: "Xem yêu cầu linh kiện",
                onClick: () =>
                  handleOpenModal(
                    record.equipmentId,
                    null,
                    record.workOrderId,
                    { name: record.equipmentName, code: record.equipmentCode }
                  ),
              },
            ],
          }}
        >
          <Button type="text" size="small" icon={<DownOutlined />} />
        </Dropdown>
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
                    count={incidentRequests.length}
                    style={{
                      marginLeft: 8,
                      backgroundColor: "#ff4d4f",
                    }}
                  />
                </span>
              ),
              children: (
                <Table
                  dataSource={incidentRequests}
                  columns={incidentColumns}
                  rowKey="incidentId"
                  loading={loading}
                  pagination={{
                    total: incidentRequests.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} sự cố`,
                  }}
                  scroll={{ x: 1200 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có yêu cầu phụ tùng từ sự cố"
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
                    count={workOrderRequests.length}
                    style={{
                      marginLeft: 8,
                      backgroundColor: "#1890ff",
                    }}
                  />
                </span>
              ),
              children: (
                <Table
                  dataSource={workOrderRequests}
                  columns={workOrderColumns}
                  rowKey="workOrderId"
                  loading={loading}
                  pagination={{
                    total: workOrderRequests.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} phiếu`,
                  }}
                  scroll={{ x: 1200 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có yêu cầu phụ tùng từ bảo trì"
                      />
                    ),
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu phụ tùng"
        open={detailDrawerVisible}
        onCancel={() => {
          setDetailDrawerVisible(false);
          setSelectedRequestDetail(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailDrawerVisible(false);
              setSelectedRequestDetail(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedRequestDetail && (
          <div>
            <Descriptions
              bordered
              column={1}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Thiết bị" span={1}>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedRequestDetail.equipmentName || "N/A"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                    Mã: {selectedRequestDetail.equipmentCode || "N/A"}
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Sự cố" span={1}>
                {selectedRequestDetail.incidentId ? (
                  <Tag color="orange">
                    INC-{selectedRequestDetail.incidentId}
                  </Tag>
                ) : (
                  "N/A"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Phiếu bảo trì" span={1}>
                {selectedRequestDetail.workOrderId ? (
                  <Tag color="blue">WO-{selectedRequestDetail.workOrderId}</Tag>
                ) : (
                  "N/A"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Người yêu cầu" span={1}>
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {selectedRequestDetail.replacedByFullName || "N/A"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                    {selectedRequestDetail.replacedByEmployeeCode
                      ? `(${selectedRequestDetail.replacedByEmployeeCode})`
                      : ""}
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag color="orange">
                  {selectedRequestDetail.status || "N/A"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 8, fontWeight: 600, fontSize: "14px" }}>
              Danh sách linh kiện yêu cầu (
              {selectedRequestDetail.parts?.length || 0} loại)
            </div>
            <Table
              dataSource={selectedRequestDetail.parts || []}
              columns={[
                {
                  title: "Mã phụ tùng",
                  dataIndex: "partNumber",
                  key: "partNumber",
                  width: 150,
                  render: (text) => (
                    <span style={{ fontWeight: 600, color: "#1890ff" }}>
                      {text || "N/A"}
                    </span>
                  ),
                },
                {
                  title: "Tên phụ tùng",
                  dataIndex: "partName",
                  key: "partName",
                  ellipsis: true,
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                  width: 120,
                  align: "center",
                  render: (qty) => <Tag color="blue">{qty}</Tag>,
                },
              ]}
              pagination={false}
              rowKey={(record, index) => index}
              size="small"
            />
          </div>
        )}
      </Modal>

      {/* Replacement Approval Modal */}
      {selectedRequest && (
        <ReplacementApprovalModal
          equipmentId={selectedRequest.equipmentId}
          incidentId={selectedRequest.incidentId}
          workOrderId={selectedRequest.workOrderId}
          equipmentInfo={selectedRequest.equipmentInfo}
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
