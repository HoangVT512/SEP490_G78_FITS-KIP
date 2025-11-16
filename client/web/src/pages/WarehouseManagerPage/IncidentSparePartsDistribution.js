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
  Dropdown,
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
  DownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { incidentService } from "../../services/incidentService";
import { sparePartService } from "../../services/sparePartService";
import { replacementHistoryService } from "../../services/replacementHistoryService";

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
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDistributionDetail, setSelectedDistributionDetail] =
    useState(null);

  useEffect(() => {
    fetchSpareParts();
    fetchDistributions();
    fetchIncidents(); // Load incidents on mount
  }, []);

  const fetchDistributions = async () => {
    setLoading(true);
    try {
      // Fetch replacement histories with status "Đã xuất"
      const allReplacements = await replacementHistoryService.getAll();

      // Filter only "Đã xuất" status
      const exportedReplacements = (allReplacements || []).filter(
        (r) => r.status === "Đã xuất"
      );

      // Transform to distribution format
      const formattedDistributions = exportedReplacements.map((replacement) => {
        const distributionType = replacement.incidentId
          ? "incident"
          : "maintenance";
        const recordId = replacement.incidentId || replacement.workOrderId;

        return {
          id: replacement.replacementID,
          distributionType: distributionType,
          recordId: recordId,
          recordName: replacement.equipmentName || "",
          technicianName:
            replacement.replacedByFullName ||
            replacement.replacedByUserName ||
            "",
          distributedAt: replacement.replacedDate,
          distributedBy:
            replacement.replacedByFullName ||
            replacement.replacedByUserName ||
            "",
          items: [
            {
              partId: replacement.partID,
              partName: replacement.partName || "",
              partNumber: replacement.partNumber || "",
              quantity: replacement.quantity,
            },
          ],
          notes: replacement.remarks || "",
        };
      });

      setDistributions(formattedDistributions);
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
    setLoading(true);
    try {
      const values = await distributionForm.validateFields();

      // Validate spare parts
      if (selectedDistributions.length === 0) {
        message.warning("Vui lòng thêm ít nhất một phụ tùng");
        setLoading(false);
        return;
      }

      const invalidParts = selectedDistributions.some((part) => !part.partId);
      if (invalidParts) {
        message.warning("Vui lòng chọn phụ tùng cho tất cả các dòng");
        setLoading(false);
        return;
      }

      // Validate inventory quantities
      const insufficientStock = selectedDistributions.find((item) => {
        const part = spareParts.find((p) => p.partId === item.partId);
        return part && part.quantity < item.quantity;
      });

      if (insufficientStock) {
        const part = spareParts.find(
          (p) => p.partId === insufficientStock.partId
        );
        message.error(
          `Không đủ tồn kho cho phụ tùng "${part?.partName}". Tồn kho: ${part?.quantity}, Yêu cầu: ${insufficientStock.quantity}`
        );
        setLoading(false);
        return;
      }

      const recordType = distributionType === "incident" ? "sự cố" : "bảo trì";
      const currentUserId = localStorage.getItem("userId");
      const currentUserName = localStorage.getItem("userName") || "Quản lý kho";

      // Get selected record for equipment info
      const selectedRecordData =
        distributionType === "incident"
          ? incidents.find((i) => i.incidentId === values.recordId)
          : maintenances.find((m) => m.incidentId === values.recordId);

      // Create replacement histories for each spare part
      const replacementPromises = selectedDistributions.map(async (item) => {
        const replacementData = {
          partId: item.partId,
          equipmentId: selectedRecordData?.equipmentId || null,
          incidentId: distributionType === "incident" ? values.recordId : null,
          workOrderId:
            distributionType === "maintenance" ? values.recordId : null,
          quantity: item.quantity,
          replacedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
          replacedBy: currentUserId || values.technicianId,
          status: "Đã xuất",
          remarks: values.notes || "",
        };

        console.log("Creating replacement history:", replacementData);
        return replacementHistoryService.create(replacementData);
      });

      // Execute all replacement history creations
      await Promise.all(replacementPromises);

      // Update spare parts inventory and status
      const updatePromises = selectedDistributions.map(async (item) => {
        const part = spareParts.find((p) => p.partId === item.partId);
        if (!part) return;

        const newQuantity = part.quantity - item.quantity;
        let newStatus = "Đủ hàng";

        // Determine status based on quantity and minQuantity
        if (newQuantity <= 0) {
          newStatus = "Hết hàng";
        } else if (newQuantity <= part.minQuantity) {
          newStatus = "Sắp hết";
        }

        // Update spare part
        const updateData = {
          partNumber: part.partNumber,
          partName: part.partName,
          partType: part.partType,
          quantity: newQuantity,
          minQuantity: part.minQuantity,
          location: part.location,
          dateAdded: part.dateAdded,
          status: newStatus,
        };

        return sparePartService.update(part.partId, updateData);
      });

      await Promise.all(updatePromises);

      // Refresh spare parts list
      await fetchSpareParts();

      // Save to local state for display
      const newDistribution = {
        id: Date.now(),
        distributionType: distributionType,
        recordId: values.recordId,
        recordName: selectedRecordData?.equipmentName || "",
        technicianName: values.technicianName,
        distributedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        distributedBy: currentUserName,
        items: selectedDistributions,
        notes: values.notes || "",
      };
      setDistributions([newDistribution, ...distributions]);

      message.success(`Cấp phát vật tư cho ${recordType} thành công!`);

      // Close modal and reset
      setIsModalVisible(false);
      setSelectedDistributions([]);
      setSelectedRecord(null);
      setIncidents([]);
      setMaintenances([]);
      distributionForm.resetFields();
    } catch (error) {
      console.error("Error saving distribution:", error);
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      } else {
        message.error(
          error.message || "Lỗi khi lưu phiếu cấp phát. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const distributionColumns = [
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
      title: "Tổng số loại vật tư",
      key: "totalItemsCount",
      width: 130,
      align: "center",
      render: (_, record) => {
        const totalItems = record.allItems?.length || record.items?.length || 0;
        return <Badge count={totalItems} showZero color="blue" />;
      },
    },
    {
      title: "Lần xuất gần nhất",
      dataIndex: "lastDistributedAt",
      key: "lastDistributedAt",
      width: 150,
      render: (time) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                label: "Xem chi tiết",
                icon: <EyeOutlined />,
                onClick: () => showDistributionDetail(record),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button size="small" icon={<DownOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Group distributions by recordId and distributionType
  const groupedDistributions = distributions.reduce((acc, dist) => {
    const key = `${dist.distributionType}_${dist.recordId}`;
    if (!acc[key]) {
      acc[key] = {
        distributionType: dist.distributionType,
        recordId: dist.recordId,
        recordName: dist.recordName,
        technicianName: dist.technicianName,
        lastDistributedAt: dist.distributedAt,
        distributions: [],
        allItems: [],
      };
    }

    // Update last distributed time if this is newer
    if (dayjs(dist.distributedAt).isAfter(dayjs(acc[key].lastDistributedAt))) {
      acc[key].lastDistributedAt = dist.distributedAt;
    }

    // Add distribution to list
    acc[key].distributions.push({
      id: dist.id,
      distributedAt: dist.distributedAt,
      distributedBy: dist.distributedBy,
      items: dist.items,
      notes: dist.notes,
    });

    // Merge items - avoid duplicates by partId, sum quantities
    dist.items?.forEach((item) => {
      const existingItem = acc[key].allItems.find(
        (i) => i.partId === item.partId
      );
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        acc[key].allItems.push({ ...item });
      }
    });

    return acc;
  }, {});

  const groupedDistributionsList = Object.values(groupedDistributions);

  const filteredDistributions = groupedDistributionsList.filter((dist) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      dist.recordId?.toLowerCase().includes(searchLower) ||
      dist.recordName?.toLowerCase().includes(searchLower) ||
      dist.technicianName?.toLowerCase().includes(searchLower)
    );
  });

  const showDistributionDetail = React.useCallback((record) => {
    console.log("Opening detail for:", record);
    setSelectedDistributionDetail(record);
    setDetailModalVisible(true);
  }, []);

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
                  rowKey="recordId"
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
                  rowKey="recordId"
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
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      tableLayout: "fixed",
                    }}
                  >
                    <colgroup>
                      <col style={{ width: "60px" }} />
                      <col style={{ width: "auto" }} />
                      <col style={{ width: "120px" }} />
                      <col style={{ width: "140px" }} />
                      <col style={{ width: "80px" }} />
                    </colgroup>
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
                          Số lượng tồn kho
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "center",
                            fontWeight: 600,
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
                                  label={`${part.partName} (${part.partNumber})`}
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
                            <span
                              style={{
                                fontWeight: 500,
                                color: item.partId
                                  ? (spareParts.find(
                                      (p) => p.partId === item.partId
                                    )?.quantity || 0) < item.quantity
                                    ? "#ff4d4f"
                                    : "#52c41a"
                                  : "#000",
                              }}
                            >
                              {item.partId
                                ? spareParts.find(
                                    (p) => p.partId === item.partId
                                  )?.quantity || 0
                                : "-"}
                            </span>
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
                loading={loading}
              >
                Lưu phiếu cấp phát
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Distribution Detail Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Chi tiết phiếu cấp phát
          </div>
        }
        visible={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedDistributionDetail(null);
        }}
        width={1000}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(false);
              setSelectedDistributionDetail(null);
            }}
          >
            Đóng
          </Button>,
        ]}
      >
        {selectedDistributionDetail && (
          <div>
            {/* Summary Information */}
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Loại">
                <Tag
                  color={
                    selectedDistributionDetail.distributionType === "incident"
                      ? "red"
                      : "cyan"
                  }
                >
                  {selectedDistributionDetail.distributionType === "incident"
                    ? "Sự cố"
                    : "Bảo trì"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mã SC/BT">
                <strong>{selectedDistributionDetail.recordId}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Thiết bị" span={2}>
                {selectedDistributionDetail.recordName}
              </Descriptions.Item>
              <Descriptions.Item label="Kỹ thuật viên" span={2}>
                {selectedDistributionDetail.technicianName}
              </Descriptions.Item>
            </Descriptions>

            {/* All Items Summary */}
            <Card
              title="Tổng hợp vật tư đã xuất"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Table
                dataSource={selectedDistributionDetail.allItems}
                rowKey={(record) => record.partId}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "STT",
                    width: 60,
                    render: (_, __, index) => index + 1,
                  },
                  {
                    title: "Phụ tùng",
                    dataIndex: "partName",
                    key: "partName",
                  },
                  {
                    title: "Tổng số lượng",
                    dataIndex: "quantity",
                    key: "quantity",
                    width: 120,
                    align: "center",
                    render: (qty) => (
                      <Tag color="blue" style={{ fontSize: 14 }}>
                        {qty}
                      </Tag>
                    ),
                  },
                ]}
              />
            </Card>

            {/* Distribution History */}
            <Card title="Lịch sử xuất vật tư" size="small">
              {selectedDistributionDetail.distributions
                ?.sort(
                  (a, b) =>
                    dayjs(b.distributedAt).unix() -
                    dayjs(a.distributedAt).unix()
                )
                .map((dist, index) => (
                  <Card
                    key={dist.id}
                    type="inner"
                    size="small"
                    style={{ marginBottom: 12 }}
                    extra={
                      <Space>
                        <CalendarOutlined />
                        {dayjs(dist.distributedAt).format("DD/MM/YYYY HH:mm")}
                      </Space>
                    }
                  >
                    <div style={{ marginBottom: 8 }}>
                      <strong>Người xuất:</strong> {dist.distributedBy}
                    </div>
                    {dist.notes && (
                      <div style={{ marginBottom: 12 }}>
                        <strong>Ghi chú:</strong> {dist.notes}
                      </div>
                    )}
                    <Table
                      dataSource={dist.items}
                      rowKey={(record, idx) => `${record.partId}_${idx}`}
                      pagination={false}
                      size="small"
                      columns={[
                        {
                          title: "STT",
                          width: 60,
                          render: (_, __, idx) => idx + 1,
                        },
                        {
                          title: "Phụ tùng",
                          dataIndex: "partName",
                          key: "partName",
                        },
                        {
                          title: "Số lượng",
                          dataIndex: "quantity",
                          key: "quantity",
                          width: 100,
                          align: "center",
                          render: (qty) => <Tag color="blue">{qty}</Tag>,
                        },
                      ]}
                    />
                  </Card>
                ))}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IncidentSparePartsDistribution;
