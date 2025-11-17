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
  DatePicker,
  Row,
  Col,
  Empty,
  Select,
  Spin,
  Tabs,
  Dropdown,
  Statistic,
} from "antd";
import {
  CheckCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  WarningOutlined,
  RollbackOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  DownOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { replacementHistoryService } from "../../services/replacementHistoryService";
import { sparePartService } from "../../services/sparePartService";

const IncidentSparePartsReturn = () => {
  const [loading, setLoading] = useState(false);
  const [exportedDistributions, setExportedDistributions] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [returnForm] = Form.useForm();
  const [selectedExport, setSelectedExport] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [activeTab, setActiveTab] = useState("incident");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchExportedDistributions();
    fetchSpareParts();
  }, []);

  const fetchSpareParts = async () => {
    try {
      const data = await sparePartService.getAll();
      setSpareParts(data || []);
    } catch (error) {
      console.error("Error fetching spare parts:", error);
    }
  };

  const fetchExportedDistributions = async () => {
    setLoading(true);
    try {
      const allReplacements = await replacementHistoryService.getAll();

      // Filter only "Đã xuất" status AND not yet returned (returnedDate is null)
      const exportedReplacements = (allReplacements || []).filter(
        (r) => r.status === "Đã xuất" && !r.returnedDate
      );

      // Group by incident/maintenance
      const grouped = exportedReplacements.reduce((acc, replacement) => {
        const distributionType = replacement.incidentId
          ? "incident"
          : "maintenance";
        const recordId = replacement.incidentId || replacement.workOrderId;
        const key = `${distributionType}_${recordId}`;

        if (!acc[key]) {
          acc[key] = {
            distributionType: distributionType,
            recordId: recordId,
            recordName: replacement.equipmentName || "",
            technicianName:
              replacement.replacedByFullName ||
              replacement.replacedByUserName ||
              "",
            technicianId: replacement.replacedBy,
            distributedAt: replacement.replacedDate,
            items: [],
          };
        }

        // Add item
        acc[key].items.push({
          replacementId: replacement.replacementID,
          partId: replacement.partID,
          partName: replacement.partName || "",
          partNumber: replacement.partNumber || "",
          quantityExported: replacement.quantity,
          distributedAt: replacement.replacedDate,
          remarks: replacement.remarks || "",
        });

        // Update to latest distributed time
        if (
          dayjs(replacement.replacedDate).isAfter(dayjs(acc[key].distributedAt))
        ) {
          acc[key].distributedAt = replacement.replacedDate;
        }

        return acc;
      }, {});

      setExportedDistributions(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching exported distributions:", error);
      message.error("Lỗi khi tải danh sách phiếu xuất kho");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReturnModal = (record) => {
    setSelectedExport(record);

    // Initialize return items with all exported items (quantity to return = 0 initially)
    const items = record.items.map((item) => ({
      replacementId: item.replacementId,
      partId: item.partId,
      partName: item.partName,
      partNumber: item.partNumber,
      quantityExported: item.quantityExported,
      quantityToReturn: 0,
      distributedAt: item.distributedAt,
      originalRemarks: item.remarks,
    }));

    setReturnItems(items);
    returnForm.resetFields();
    returnForm.setFieldsValue({
      recordId: record.recordId,
      technicianName: record.technicianName,
    });
    setIsReturnModalVisible(true);
  };

  const handleUpdateReturnQuantity = (replacementId, value) => {
    const updated = returnItems.map((item) => {
      if (item.replacementId === replacementId) {
        // Validate: quantity to return cannot exceed exported quantity
        const validValue =
          value > item.quantityExported ? item.quantityExported : value;
        return { ...item, quantityToReturn: validValue || 0 };
      }
      return item;
    });
    setReturnItems(updated);
  };

  const handleSaveReturn = async () => {
    setLoading(true);
    try {
      const values = await returnForm.validateFields();

      // Filter items with quantityToReturn > 0
      const itemsToReturn = returnItems.filter(
        (item) => item.quantityToReturn > 0
      );

      if (itemsToReturn.length === 0) {
        message.warning(
          "Vui lòng nhập số lượng trả lại cho ít nhất một phụ tùng"
        );
        setLoading(false);
        return;
      }

      // Get current user from localStorage
      const currentUserStr = localStorage.getItem("currentUser");
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      const currentUserId = currentUser?.id || currentUser?.userId;
      const currentUserName =
        currentUser?.fullName || currentUser?.userName || "Quản lý kho";

      console.log("Current user for return confirmation:", currentUser);
      console.log("Current user ID:", currentUserId);

      // Update existing replacement history records with return information
      const updatePromises = itemsToReturn.map(async (item) => {
        // First, get the existing record to preserve all fields
        const existingRecord = await replacementHistoryService.getById(
          item.replacementId
        );

        if (!existingRecord) {
          throw new Error(`Không tìm thấy record với ID ${item.replacementId}`);
        }

        // Calculate actual quantity used
        const actualQuantityUsed =
          item.quantityExported - item.quantityToReturn;

        // Update only the return-related fields, keep everything else
        const updateData = {
          partId: existingRecord.partID || existingRecord.partId,
          equipmentId: existingRecord.equipmentID || existingRecord.equipmentId,
          incidentId: existingRecord.incidentId,
          workOrderId: existingRecord.workOrderId,
          quantity: existingRecord.quantity, // Keep original exported quantity
          replacedDate: existingRecord.replacedDate || item.distributedAt, // Keep original date, fallback to distributedAt
          replacedBy: existingRecord.replacedBy, // Keep original technician
          status: "Đã trả lại", // Update status to returned
          remarks:
            existingRecord.remarks ||
            values.returnNotes ||
            `Trả lại ${item.quantityToReturn} phụ tùng`,
          actualQuantityUsed: actualQuantityUsed, // Actual quantity used (đã dùng thực tế)
          quantityToReturn: item.quantityToReturn, // Quantity being returned (số lượng trả lại)
          returnedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"), // Return date (ngày trả lại)
          returnConfirmedBy: currentUserId, // Warehouse manager who confirmed (người xác nhận)
        };

        console.log(
          "Updating replacement history:",
          item.replacementId,
          updateData
        );
        console.log("Existing record:", existingRecord);
        return replacementHistoryService.update(item.replacementId, updateData);
      });

      // Execute all updates
      await Promise.all(updatePromises);

      // Update spare parts inventory: ADD back ONLY the returned quantity
      const sparePartUpdatePromises = itemsToReturn.map(async (item) => {
        const part = spareParts.find((p) => p.partId === item.partId);
        if (!part) return;

        // Only add back the returned quantity (not the full exported quantity)
        const newQuantity = part.quantity + item.quantityToReturn;
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

      await Promise.all(sparePartUpdatePromises);

      // Refresh data
      await fetchSpareParts();
      await fetchExportedDistributions();

      message.success(
        `Ghi nhận trả lại ${itemsToReturn.length} phụ tùng thành công!`
      );

      // Close modal and reset
      setIsReturnModalVisible(false);
      setSelectedExport(null);
      setReturnItems([]);
      returnForm.resetFields();
    } catch (error) {
      console.error("Error saving return:", error);
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      } else {
        message.error(
          error.message || "Lỗi khi lưu phiếu trả lại. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const exportColumns = [
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
      title: "Số loại phụ tùng",
      key: "itemCount",
      width: 130,
      align: "center",
      render: (_, record) => (
        <Tag color="blue" style={{ fontSize: 14 }}>
          {record.items.length}
        </Tag>
      ),
    },
    {
      title: "Lần xuất gần nhất",
      dataIndex: "distributedAt",
      key: "distributedAt",
      width: 150,
      render: (time) => (time ? dayjs(time).format("DD/MM/YYYY HH:mm") : "-"),
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
                key: "return",
                label: "Ghi nhận trả lại",
                icon: <RollbackOutlined />,
                onClick: () => handleOpenReturnModal(record),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="primary" size="small" icon={<RollbackOutlined />}>
            Trả lại
          </Button>
        </Dropdown>
      ),
    },
  ];

  const filteredDistributions = exportedDistributions.filter((dist) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      dist.recordId?.toString().toLowerCase().includes(searchLower) ||
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
              <h2 style={{ margin: 0, marginBottom: 8 }}>
                <RollbackOutlined style={{ marginRight: 8 }} />
                Trả lại phụ tùng thừa
              </h2>
              <p style={{ margin: 0, color: "#666" }}>
                Ghi nhận phụ tùng thừa mà kỹ thuật viên trả lại kho sau khi hoàn
                thành công việc
              </p>
            </div>
          </Col>
          <Col>
            <Button
              type="default"
              size="large"
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchExportedDistributions();
                fetchSpareParts();
              }}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng phiếu xuất chưa trả"
              value={exportedDistributions.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Phiếu sự cố"
              value={incidentDistributions.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Phiếu bảo trì"
              value={maintenanceDistributions.length}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Export List */}
      <Card
        title="Danh sách phiếu xuất kho (chưa trả lại)"
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
                  <Tag color="red">{incidentDistributions.length}</Tag>
                </span>
              ),
              children: (
                <Table
                  dataSource={incidentDistributions}
                  columns={exportColumns}
                  rowKey={(record) =>
                    `${record.distributionType}_${record.recordId}`
                  }
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng ${total} phiếu xuất`,
                  }}
                  locale={{
                    emptyText: (
                      <Empty description="Không có phiếu xuất sự cố nào chưa trả" />
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
                  <Tag color="cyan">{maintenanceDistributions.length}</Tag>
                </span>
              ),
              children: (
                <Table
                  dataSource={maintenanceDistributions}
                  columns={exportColumns}
                  rowKey={(record) =>
                    `${record.distributionType}_${record.recordId}`
                  }
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng ${total} phiếu xuất`,
                  }}
                  locale={{
                    emptyText: (
                      <Empty description="Không có phiếu xuất bảo trì nào chưa trả" />
                    ),
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Return Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            <RollbackOutlined style={{ marginRight: 8 }} />
            Ghi nhận trả lại phụ tùng
          </div>
        }
        visible={isReturnModalVisible}
        onCancel={() => {
          setIsReturnModalVisible(false);
          setSelectedExport(null);
          setReturnItems([]);
          returnForm.resetFields();
        }}
        width={1000}
        footer={null}
        destroyOnClose
      >
        {selectedExport && (
          <Form form={returnForm} layout="vertical" onFinish={handleSaveReturn}>
            <Alert
              message="Thông tin phiếu xuất"
              description="Ghi nhận số lượng phụ tùng thừa mà kỹ thuật viên trả lại"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            {/* Export Information */}
            <Descriptions
              bordered
              column={2}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Loại">
                <Tag
                  color={
                    selectedExport.distributionType === "incident"
                      ? "red"
                      : "cyan"
                  }
                >
                  {selectedExport.distributionType === "incident"
                    ? "Sự cố"
                    : "Bảo trì"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mã SC/BT">
                <strong>{selectedExport.recordId}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Thiết bị" span={2}>
                {selectedExport.recordName}
              </Descriptions.Item>
              <Descriptions.Item label="Kỹ thuật viên" span={2}>
                <UserOutlined style={{ marginRight: 4 }} />
                {selectedExport.technicianName}
              </Descriptions.Item>
            </Descriptions>

            <Form.Item name="recordId" hidden>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="technicianName" hidden>
              <Input type="hidden" />
            </Form.Item>

            {/* Return Items Table */}
            <Form.Item
              label={
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  Danh sách phụ tùng trả lại
                </span>
              }
            >
              <Alert
                message="Lưu ý"
                description="Nhập số lượng trả lại cho từng phụ tùng. Số lượng trả lại không được vượt quá số lượng đã xuất."
                type="warning"
                showIcon
                style={{ marginBottom: 12 }}
              />
              <div
                style={{
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "#fafafa",
                }}
              >
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
                    <col style={{ width: "150px" }} />
                    <col style={{ width: "150px" }} />
                  </colgroup>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "2px solid #d9d9d9",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <th
                        style={{
                          padding: "12px 8px",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        STT
                      </th>
                      <th
                        style={{
                          padding: "12px 8px",
                          textAlign: "left",
                          fontWeight: 600,
                        }}
                      >
                        Phụ tùng
                      </th>
                      <th
                        style={{
                          padding: "12px 8px",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        Số lượng đã xuất
                      </th>
                      <th
                        style={{
                          padding: "12px 8px",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        Số lượng trả lại
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.map((item, index) => (
                      <tr
                        key={item.replacementId}
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa",
                        }}
                      >
                        <td
                          style={{ padding: "12px 8px", textAlign: "center" }}
                        >
                          {index + 1}
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              {item.partName}
                            </div>
                            <div style={{ fontSize: 12, color: "#999" }}>
                              {item.partNumber}
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "12px 8px",
                            textAlign: "center",
                          }}
                        >
                          <Tag color="blue" style={{ fontSize: 14 }}>
                            {item.quantityExported}
                          </Tag>
                        </td>
                        <td
                          style={{
                            padding: "12px 8px",
                            textAlign: "center",
                          }}
                        >
                          <InputNumber
                            min={0}
                            max={item.quantityExported}
                            value={item.quantityToReturn}
                            onChange={(value) =>
                              handleUpdateReturnQuantity(
                                item.replacementId,
                                value
                              )
                            }
                            style={{ width: "100%" }}
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Form.Item>

            {/* Return Notes */}
            <Form.Item label="Ghi chú" name="returnNotes">
              <Input.TextArea
                placeholder="Nhập ghi chú về phiếu trả lại (nếu có)..."
                rows={3}
                showCount
                maxLength={500}
              />
            </Form.Item>

            {/* Summary */}
            <Alert
              message={
                <span style={{ fontWeight: 600 }}>
                  Tổng số lượng trả lại:{" "}
                  <Tag color="green" style={{ fontSize: 16 }}>
                    {returnItems.reduce(
                      (sum, item) => sum + (item.quantityToReturn || 0),
                      0
                    )}
                  </Tag>
                  phụ tùng
                </span>
              }
              type="success"
              style={{ marginBottom: 16 }}
            />

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button
                  size="large"
                  onClick={() => {
                    setIsReturnModalVisible(false);
                    setSelectedExport(null);
                    setReturnItems([]);
                    returnForm.resetFields();
                  }}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  icon={<CheckCircleOutlined />}
                  disabled={
                    returnItems.reduce(
                      (sum, item) => sum + (item.quantityToReturn || 0),
                      0
                    ) === 0
                  }
                  loading={loading}
                >
                  Lưu phiếu trả lại
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default IncidentSparePartsReturn;
