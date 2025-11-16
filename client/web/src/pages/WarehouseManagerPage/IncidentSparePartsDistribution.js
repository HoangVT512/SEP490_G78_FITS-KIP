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
  Input,
  message,
  Descriptions,
  Alert,
  Tooltip,
  DatePicker,
  Row,
  Col,
  Drawer,
  Empty,
  Badge,
  Select,
  Spin,
  Tabs,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  WarningOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { incidentService } from "../../services/incidentService";
import { sparePartService } from "../../services/sparePartService";

const IncidentSparePartsDistribution = () => {
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [distributionForm] = Form.useForm();
  const [selectedDistributions, setSelectedDistributions] = useState([]);
  const [distributionType, setDistributionType] = useState("incident");
  const [searchingIncidents, setSearchingIncidents] = useState(false);
  const [searchingMaintenances, setSearchingMaintenances] = useState(false);
  const [activeTab, setActiveTab] = useState("incident");
  const [searchText, setSearchText] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchSpareParts();
    fetchDistributions();
    fetchIncidents(); // Load incidents on mount
  }, []);

  const fetchDistributions = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now, using mock data
      const mockDistributions = [
        {
          id: 1,
          distributionType: "incident",
          recordId: "INC001",
          recordName: "Máy tiện CNC 01",
          technicianName: "Nguyễn Văn A",
          distributedAt: "2025-11-16 10:30:00",
          distributedBy: "Quản lý kho",
          items: [{ partId: 1, partName: "Ổ bi SKF", quantity: 2, notes: "" }],
          notes: "Cấp gấp",
        },
        {
          id: 2,
          distributionType: "maintenance",
          recordId: "MNT001",
          recordName: "Máy phay 02",
          technicianName: "Trần Văn B",
          distributedAt: "2025-11-16 14:15:00",
          distributedBy: "Quản lý kho",
          items: [
            { partId: 2, partName: "Dầu bôi trơn", quantity: 1, notes: "" },
          ],
          notes: "",
        },
      ];
      setDistributions(mockDistributions);
    } catch (error) {
      console.error("Error fetching distributions:", error);
      message.error("Lỗi khi tải danh sách phiếu cấp phát");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpareParts = async () => {
    try {
      const data = await sparePartService.getAll();
      setSpareParts(data || []);
    } catch (error) {
      console.error("Error fetching spare parts:", error);
    }
  };

  const fetchIncidents = async () => {
    setSearchingIncidents(true);
    try {
      const data = await incidentService.getAll();
      // Filter incidents that require tech support and have been assigned to technicians
      const assignedIncidents = (data || []).filter(
        (incident) => incident.isTechSupport === true && incident.assignedTo
      );
      setIncidents(assignedIncidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      message.error("Lỗi khi tải danh sách sự cố");
    } finally {
      setSearchingIncidents(false);
    }
  };

  const searchIncidents = async (searchValue) => {
    if (!searchValue) {
      fetchIncidents(); // Reload all incidents if search is cleared
      return;
    }
    setSearchingIncidents(true);
    try {
      const data = await incidentService.getAll();
      const filtered = (data || []).filter(
        (incident) =>
          incident.isTechSupport === true &&
          incident.assignedTo &&
          (incident.incidentId?.toString().includes(searchValue) ||
            incident.equipmentName
              ?.toLowerCase()
              .includes(searchValue.toLowerCase()) ||
            incident.equipmentCode
              ?.toLowerCase()
              .includes(searchValue.toLowerCase()))
      );
      setIncidents(filtered);
    } catch (error) {
      console.error("Error searching incidents:", error);
      message.error("Lỗi khi tìm kiếm sự cố");
    } finally {
      setSearchingIncidents(false);
    }
  };

  const searchMaintenances = async (searchValue) => {
    if (!searchValue) {
      setMaintenances([]);
      return;
    }
    setSearchingMaintenances(true);
    try {
      const data = await incidentService.getAll(); // Replace with maintenance service when available
      const filtered = (data || []).filter(
        (maintenance) =>
          maintenance.incidentId?.toString().includes(searchValue) ||
          maintenance.equipmentName
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          maintenance.equipmentCode
            ?.toLowerCase()
            .includes(searchValue.toLowerCase())
      );
      setMaintenances(filtered);
    } catch (error) {
      console.error("Error searching maintenances:", error);
      message.error("Lỗi khi tìm kiếm bảo trì");
    } finally {
      setSearchingMaintenances(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedDistributions([]);
    setSelectedRecord(null);
    distributionForm.resetFields();
    setDistributionType("incident");
    setMaintenances([]);
    fetchIncidents(); // Reload incidents when opening modal
    setIsModalVisible(true);
  };

  const handleRecordSelect = (recordId) => {
    const record =
      distributionType === "incident"
        ? incidents.find((i) => i.incidentId === recordId)
        : maintenances.find((m) => m.incidentId === recordId);

    setSelectedRecord(record);

    // Auto-fill technician name and employee code if available
    if (record && record.assignedToName) {
      const technicianDisplay = record.assignedToEmployeeCode
        ? `${record.assignedToName} (${record.assignedToEmployeeCode})`
        : record.assignedToName;
      distributionForm.setFieldsValue({
        technicianName: technicianDisplay,
        technicianId: record.assignedTo,
      });
    }
  };

  const handleAddSparePartToDistribution = () => {
    setSelectedDistributions([
      ...selectedDistributions,
      {
        id: Math.random(),
        partId: undefined,
        partName: "",
        quantity: 1,
        notes: "",
      },
    ]);
  };

  const handleRemoveSparePartFromDistribution = (id) => {
    setSelectedDistributions(
      selectedDistributions.filter((item) => item.id !== id)
    );
  };

  const handleUpdateSparePartInDistribution = (id, field, value) => {
    const updated = selectedDistributions.map((item) => {
      if (item.id === id) {
        if (field === "partId") {
          const selectedPart = spareParts.find((p) => p.partId === value);
          return {
            ...item,
            partId: value,
            partName: selectedPart?.partName || "",
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    setSelectedDistributions(updated);
  };

  const handleSaveDistribution = async () => {
    try {
      const values = await distributionForm.validateFields();

      // Validate spare parts
      if (selectedDistributions.length === 0) {
        message.warning("Vui lòng thêm ít nhất một phụ tùng");
        return;
      }

      const invalidParts = selectedDistributions.some((part) => !part.partId);
      if (invalidParts) {
        message.warning("Vui lòng chọn phụ tùng cho tất cả các dòng");
        return;
      }

      const recordType = distributionType === "incident" ? "sự cố" : "bảo trì";

      // Save distribution data
      const distributionData = {
        distributionType: distributionType,
        recordId: values.recordId,
        recordName:
          distributionType === "incident"
            ? incidents.find((i) => i.incidentId === values.recordId)
                ?.equipmentName
            : maintenances.find((m) => m.incidentId === values.recordId)
                ?.equipmentName,
        distributedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        distributedBy: localStorage.getItem("userName") || "Quản lý kho",
        technicianName: values.technicianName,
        items: selectedDistributions,
        notes: values.notes || "",
      };

      console.log("Distribution data:", distributionData);

      // Save to local state (temporary until API is available)
      const newDistribution = {
        id: Date.now(),
        ...distributionData,
      };
      setDistributions([newDistribution, ...distributions]);

      // Here you would normally call an API to save the distribution
      message.success(`Cấp phát vật tư cho ${recordType} thành công!`);

      // Close modal and reset
      setIsModalVisible(false);
      setSelectedDistributions([]);
      setIncidents([]);
      setMaintenances([]);
      distributionForm.resetFields();
    } catch (error) {
      console.error("Error saving distribution:", error);
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      } else {
        message.error("Lỗi khi lưu phiếu cấp phát");
      }
    }
  };

  const distributionColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: "Loại",
      dataIndex: "distributionType",
      key: "distributionType",
      width: 100,
      render: (type) => (
        <Tag color={type === "incident" ? "red" : "cyan"}>
          {type === "incident" ? "Sự cố" : "Bảo trì"}
        </Tag>
      ),
    },
    {
      title: "Mã SC/BT",
      dataIndex: "recordId",
      key: "recordId",
      width: 120,
    },
    {
      title: "Thiết bị",
      dataIndex: "recordName",
      key: "recordName",
      width: 200,
    },
    {
      title: "Kỹ thuật viên",
      dataIndex: "technicianName",
      key: "technicianName",
      width: 150,
    },
    {
      title: "Thời gian cấp phát",
      dataIndex: "distributedAt",
      key: "distributedAt",
      width: 150,
      render: (time) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Người cấp phát",
      dataIndex: "distributedBy",
      key: "distributedBy",
      width: 150,
    },
    {
      title: "Số loại vật tư",
      key: "itemsCount",
      width: 100,
      render: (_, record) => (
        <Badge count={record.items?.length || 0} showZero color="blue" />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            // TODO: Show detail modal
            message.info("Xem chi tiết phiếu cấp phát");
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const filteredDistributions = distributions.filter((dist) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      dist.recordId?.toLowerCase().includes(searchLower) ||
      dist.recordName?.toLowerCase().includes(searchLower) ||
      dist.technicianName?.toLowerCase().includes(searchLower)
    );
  });

  const incidentDistributions = filteredDistributions.filter(
    (d) => d.distributionType === "incident"
  );
  const maintenanceDistributions = filteredDistributions.filter(
    (d) => d.distributionType === "maintenance"
  );

  return (
    <div>
      {/* Header Section */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <div>
              <h2 style={{ margin: 0, marginBottom: 8 }}>Cấp phát vật tư</h2>
              <p style={{ margin: 0, color: "#666" }}>
                Khi kỹ thuật viên đến yêu cầu vật tư, nhấn nút bên cạnh để tạo
                phiếu cấp phát
              </p>
            </div>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
            >
              Tạo phiếu cấp phát mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Distribution List */}
      <Card
        title="Danh sách phiếu cấp phát"
        extra={
          <Input.Search
            placeholder="Tìm theo mã, thiết bị, kỹ thuật viên..."
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "incident",
              label: (
                <span>
                  <FileTextOutlined /> Sự cố{" "}
                  <Badge
                    count={incidentDistributions.length}
                    style={{ backgroundColor: "#52c41a" }}
                  />
                </span>
              ),
              children: (
                <Table
                  dataSource={incidentDistributions}
                  columns={distributionColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng ${total} phiếu cấp phát`,
                  }}
                  locale={{
                    emptyText: (
                      <Empty description="Chưa có phiếu cấp phát nào" />
                    ),
                  }}
                />
              ),
            },
            {
              key: "maintenance",
              label: (
                <span>
                  <FileTextOutlined /> Bảo trì{" "}
                  <Badge
                    count={maintenanceDistributions.length}
                    style={{ backgroundColor: "#52c41a" }}
                  />
                </span>
              ),
              children: (
                <Table
                  dataSource={maintenanceDistributions}
                  columns={distributionColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng ${total} phiếu cấp phát`,
                  }}
                  locale={{
                    emptyText: (
                      <Empty description="Chưa có phiếu cấp phát nào" />
                    ),
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Distribution Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Tạo phiếu cấp phát vật tư
          </div>
        }
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedDistributions([]);
          setSelectedRecord(null);
          setMaintenances([]);
          distributionForm.resetFields();
        }}
        width={1100}
        footer={null}
        destroyOnClose
      >
        <Form
          form={distributionForm}
          layout="vertical"
          onFinish={handleSaveDistribution}
        >
          <Alert
            message="Thông tin cấp phát"
            description="Vui lòng điền đầy đủ thông tin về phiếu cấp phát vật tư"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* Distribution Type Selection - Full Width */}
          <Form.Item
            label={
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Loại cấp phát
              </span>
            }
            name="distributionType"
            initialValue="incident"
            rules={[{ required: true, message: "Vui lòng chọn loại cấp phát" }]}
          >
            <Select
              placeholder="Chọn loại cấp phát"
              size="large"
              onChange={(value) => {
                setDistributionType(value);
                setSelectedRecord(null);
                if (value === "incident") {
                  fetchIncidents();
                  setMaintenances([]);
                } else {
                  setIncidents([]);
                  // TODO: Fetch maintenances when available
                }
                distributionForm.setFieldsValue({
                  recordId: undefined,
                  technicianName: undefined,
                  technicianId: undefined,
                });
              }}
            >
              <Select.Option value="incident">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Tag color="red" style={{ margin: 0, marginRight: 8 }}>
                    Sự cố
                  </Tag>
                  <span>Cấp phát cho sự cố</span>
                </div>
              </Select.Option>
              <Select.Option value="maintenance">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Tag color="cyan" style={{ margin: 0, marginRight: 8 }}>
                    Bảo trì
                  </Tag>
                  <span>Cấp phát cho bảo trì</span>
                </div>
              </Select.Option>
            </Select>
          </Form.Item>

          {/* Record Selection - Full Width */}
          <Form.Item
            label={
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {distributionType === "incident" ? "Mã sự cố" : "Mã bảo trì"}
              </span>
            }
            name="recordId"
            rules={[
              {
                required: true,
                message: `Vui lòng chọn ${
                  distributionType === "incident" ? "sự cố" : "bảo trì"
                }`,
              },
            ]}
          >
            <Select
              showSearch
              size="large"
              placeholder={`Tìm kiếm và chọn ${
                distributionType === "incident" ? "sự cố" : "bảo trì"
              }...`}
              onSearch={(value) => {
                if (distributionType === "incident") {
                  searchIncidents(value);
                } else {
                  searchMaintenances(value);
                }
              }}
              onChange={handleRecordSelect}
              filterOption={false}
              loading={searchingIncidents || searchingMaintenances}
              notFoundContent={
                searchingIncidents || searchingMaintenances ? (
                  <Spin size="small" />
                ) : (
                  <Empty
                    description={
                      distributionType === "incident"
                        ? "Không có sự cố nào được giao cho kỹ thuật viên"
                        : "Không có bảo trì nào"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )
              }
              dropdownStyle={{ maxWidth: "600px" }}
            >
              {(distributionType === "incident" ? incidents : maintenances).map(
                (record) => (
                  <Select.Option
                    key={record.incidentId}
                    value={record.incidentId}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <Tag
                        color={distributionType === "incident" ? "red" : "cyan"}
                        style={{ margin: 0, marginRight: 8, flexShrink: 0 }}
                      >
                        {record.incidentId}
                      </Tag>
                      <span
                        style={{
                          fontWeight: 500,
                          marginRight: 8,
                          flexShrink: 0,
                        }}
                      >
                        {record.equipmentName}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#999",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ({record.equipmentCode} - {record.lineName})
                      </span>
                    </div>
                  </Select.Option>
                )
              )}
            </Select>
          </Form.Item>

          {/* Technician Information - Full Width */}
          <Form.Item
            label={
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Kỹ thuật viên đảm nhiệm
              </span>
            }
            name="technicianName"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn sự cố để hiển thị kỹ thuật viên",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Chọn sự cố để xem thông tin kỹ thuật viên"
              prefix={<UserOutlined />}
              style={{
                backgroundColor: "#f5f5f5",
                color: "#000",
                cursor: "not-allowed",
              }}
            />
          </Form.Item>
          <Form.Item name="technicianId" hidden>
            <Input type="hidden" />
          </Form.Item>

          {/* Show selected incident info */}
          {selectedRecord && (
            <Alert
              message={
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  Thông tin sự cố đã chọn
                </span>
              }
              description={
                <div style={{ lineHeight: "1.8" }}>
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        <strong style={{ minWidth: 80, flexShrink: 0 }}>
                          Thiết bị:
                        </strong>
                        <span style={{ flex: 1, paddingLeft: 8 }}>
                          {selectedRecord.equipmentName} (
                          {selectedRecord.equipmentCode})
                        </span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        <strong style={{ minWidth: 100, flexShrink: 0 }}>
                          Kỹ thuật viên:
                        </strong>
                        <span style={{ flex: 1, paddingLeft: 8 }}>
                          {selectedRecord.assignedToName}
                        </span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        <strong style={{ minWidth: 80, flexShrink: 0 }}>
                          Dây chuyền:
                        </strong>
                        <span style={{ flex: 1, paddingLeft: 8 }}>
                          {selectedRecord.lineName}
                        </span>
                      </div>
                    </Col>
                    {selectedRecord.startTime && (
                      <Col span={12}>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          <strong style={{ minWidth: 100, flexShrink: 0 }}>
                            Thời gian bắt đầu:
                          </strong>
                          <span style={{ flex: 1, paddingLeft: 8 }}>
                            {dayjs(selectedRecord.startTime).format(
                              "DD/MM/YYYY HH:mm"
                            )}
                          </span>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Spare Parts Distribution Table */}
          <Form.Item
            label={
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                Danh sách phụ tùng cần cấp phát
              </span>
            }
          >
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#fafafa",
                minHeight: 200,
              }}
            >
              {selectedDistributions.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid #d9d9d9",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            fontWeight: 600,
                          }}
                        >
                          STT
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            fontWeight: 600,
                          }}
                        >
                          Phụ tùng
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            fontWeight: 600,
                            width: "100px",
                          }}
                        >
                          Số lượng
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            fontWeight: 600,
                          }}
                        >
                          Ghi chú
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "center",
                            fontWeight: 600,
                            width: "60px",
                          }}
                        >
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDistributions.map((item, index) => (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: "1px solid #f0f0f0",
                            backgroundColor:
                              index % 2 === 0 ? "#fff" : "#fafafa",
                          }}
                        >
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            {index + 1}
                          </td>
                          <td style={{ padding: "8px" }}>
                            <Select
                              placeholder="Chọn phụ tùng"
                              style={{ width: "100%" }}
                              value={item.partId}
                              onChange={(value) =>
                                handleUpdateSparePartInDistribution(
                                  item.id,
                                  "partId",
                                  value
                                )
                              }
                              optionLabelProp="label"
                            >
                              {spareParts.map((part) => (
                                <Select.Option
                                  key={part.partId}
                                  value={part.partId}
                                  label={
                                    <div>
                                      <div style={{ fontWeight: 500 }}>
                                        {part.partName}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: 12,
                                          color: "#999",
                                        }}
                                      >
                                        {part.partNumber} - SL: {part.quantity}
                                      </div>
                                    </div>
                                  }
                                >
                                  <div>
                                    <div style={{ fontWeight: 500 }}>
                                      {part.partName}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 12,
                                        color: "#999",
                                      }}
                                    >
                                      {part.partNumber}
                                    </div>
                                  </div>
                                </Select.Option>
                              ))}
                            </Select>
                          </td>
                          <td style={{ padding: "8px" }}>
                            <InputNumber
                              min={1}
                              value={item.quantity}
                              onChange={(value) =>
                                handleUpdateSparePartInDistribution(
                                  item.id,
                                  "quantity",
                                  value
                                )
                              }
                              style={{ width: "100%" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <Input
                              placeholder="Ghi chú"
                              value={item.notes}
                              onChange={(e) =>
                                handleUpdateSparePartInDistribution(
                                  item.id,
                                  "notes",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                handleRemoveSparePartFromDistribution(item.id)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty
                  description="Chưa thêm phụ tùng nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: "40px 0" }}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddSparePartToDistribution}
                  >
                    Thêm phụ tùng đầu tiên
                  </Button>
                </Empty>
              )}
            </div>
          </Form.Item>

          {selectedDistributions.length > 0 && (
            <Form.Item>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddSparePartToDistribution}
                block
                size="large"
              >
                Thêm phụ tùng khác
              </Button>
            </Form.Item>
          )}

          <Form.Item label="Ghi chú thêm" name="notes">
            <Input.TextArea
              placeholder="Nhập ghi chú về phiếu cấp phát (nếu có)..."
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                size="large"
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedDistributions([]);
                  setSelectedRecord(null);
                  setMaintenances([]);
                  distributionForm.resetFields();
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<CheckCircleOutlined />}
                disabled={selectedDistributions.length === 0}
              >
                Lưu phiếu cấp phát
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IncidentSparePartsDistribution;
