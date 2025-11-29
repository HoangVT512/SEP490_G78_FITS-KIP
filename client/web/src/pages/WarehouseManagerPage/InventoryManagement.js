import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Dropdown,
  Alert,
  Tabs,
  Descriptions,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  WarningOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  DownOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import styles from "../../styles/pages/InventoryManagement.module.css";
import { sparePartService } from "../../services/sparePartService";

const { Option } = Select;
const { Search } = Input;

const InventoryManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterActive, setFilterActive] = useState("active"); // Filter by IsActive status

  // Replace filterActive with showInactive for tab-based filtering
  const [showInactive, setShowInactive] = useState(() => {
    // Load from localStorage or default to false (show active only)
    const saved = localStorage.getItem("inventoryManagement_showInactive");
    return saved ? JSON.parse(saved) : false;
  });

  // Spare parts loaded from backend
  const [spareParts, setSpareParts] = useState([]);
  const [showMinModal, setShowMinModal] = useState(false);
  const [minValue, setMinValue] = useState(5); // Single min quantity value for Apply-to-All
  const [savingMin, setSavingMin] = useState(false);

  const [showLowStockAlert, setShowLowStockAlert] = useState(true);

  const stats = {
    total: spareParts.length,
    inStock: spareParts.filter((p) => p.status === "Đủ hàng").length,
    lowStock: spareParts.filter((p) => p.status === "Sắp hết").length,
    outOfStock: spareParts.filter((p) => p.status === "Hết hàng").length,
  };

  const columns = [
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 120,
      fixed: "left",
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: 200,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (quantity) => quantity ?? 0,
    },
    {
      title: "SL tối thiểu",
      dataIndex: "minQuantity",
      key: "minQuantity",
      width: 110,
      render: (min) => min ?? 0,
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status, record) => {
        let color = "success";
        let displayStatus = status;

        // Determine color and display status based on explicit status or quantity
        if (status) {
          // Use explicit status from backend
          switch (status) {
            case "Đủ hàng":
              color = "success";
              displayStatus = "Đủ hàng";
              break;
            case "Sắp hết":
              color = "warning";
              displayStatus = "Sắp hết";
              break;
            case "Hết hàng":
              color = "error";
              displayStatus = "Hết hàng";
              break;
            default:
              color = "default";
              displayStatus = status;
          }
        } else {
          // Fallback: infer from quantity and minQuantity
          const q = record.quantity ?? 0;
          const minQ = record.minQuantity ?? 5;
          if (q === 0) {
            color = "error";
            displayStatus = "Hết hàng";
          } else if (q <= minQ) {
            color = "warning";
            displayStatus = "Sắp hết";
          } else {
            color = "success";
            displayStatus = "Đủ hàng";
          }
        }

        return <Tag color={color}>{displayStatus}</Tag>;
      },
    },
    {
      title: "Trạng thái hoạt động",
      dataIndex: "isActive",
      key: "isActive",
      width: 130,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Đang sử dụng" : "Ngưng sử dụng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => {
        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "Xem chi tiết",
            onClick: () => handleView(record),
          },
          ...(record.isActive
            ? [
                {
                  key: "edit",
                  icon: <EditOutlined />,
                  label: "Sửa",
                  onClick: () => handleEdit(record),
                },
              ]
            : []),
          {
            key: "delete",
            icon: record.isActive ? (
              <DeleteOutlined />
            ) : (
              <CheckCircleOutlined />
            ),
            label: record.isActive ? "Ngưng sử dụng" : "Khôi phục",
            danger: record.isActive,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            destroyOnHidden={true}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<DownOutlined />}
              style={{ borderRadius: "6px" }}
            />
          </Dropdown>
        );
      },
    },
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleView = (record) => {
    setViewingRecord(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    const isDeleting = record.isActive;
    const title = isDeleting ? "Xác nhận ngưng sử dụng" : "Xác nhận khôi phục";
    const content = isDeleting
      ? `Bạn có chắc chắn muốn ngưng sử dụng phụ tùng "${record.partName}"?`
      : `Bạn có chắc chắn muốn khôi phục phụ tùng "${record.partName}"?`;
    const okText = isDeleting ? "Ngưng sử dụng" : "Khôi phục";

    Modal.confirm({
      title,
      content,
      okText,
      cancelText: "Hủy",
      okButtonProps: { danger: isDeleting },
      onOk: () => {
        // Call backend delete (soft delete - set IsActive = false)
        (async () => {
          try {
            setLoading(true);
            await sparePartService.delete(record.partId);
            message.success(
              isDeleting
                ? "Ngưng sử dụng phụ tùng thành công!"
                : "Khôi phục phụ tùng thành công!"
            );
            await loadParts();
          } catch (error) {
            console.error("Delete error", error);
            message.error(error.message || "Không thể thực hiện thao tác");
          } finally {
            setLoading(false);
          }
        })();
      },
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Map form fields to backend DTO shape
      const payload = {
        partNumber: values.partNumber,
        partName: values.partName,
        partType: values.partType || "",
        material: values.material || "",
        specifications: values.specifications || "",
        supplier: values.supplier || "",
        purchasePrice: values.purchasePrice || null,
        quantity: values.quantity || 0, // ✅ THÊM giá trị mặc định
        minQuantity: values.minQuantity ?? 5,
        location: values.location || "",
        warehouse: values.warehouse || "",
        uom: values.uom || "",
        replacementCycle: values.replacementCycle || "",
        ...(editingRecord ? { dateAdded: editingRecord.dateAdded } : {}),
        documentUrl: values.documentUrl || "",
      };

      console.log("Sending payload to backend:", payload);

      if (editingRecord) {
        await sparePartService.update(editingRecord.partId, payload);
        message.success("Cập nhật phụ tùng thành công!");
      } else {
        await sparePartService.create(payload);
        message.success("Thêm phụ tùng thành công!");
      }

      setIsModalVisible(false);
      form.resetFields();
      await loadParts();
    } catch (error) {
      console.error("Save error", error);
      message.error(error.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  // Update minQuantity quickly from table inline edit

  // Load parts from backend
  const loadParts = async () => {
    setLoading(true);
    try {
      const data = await sparePartService.getAll();
      // Backend DTO uses PascalCase sometimes; normalize to camelCase
      const normalized = (data || []).map((p) => ({
        partId: p.partId || p.PartId,
        partNumber: p.partNumber || p.PartNumber,
        partName: p.partName || p.PartName,
        partType: p.partType || p.PartType || "",
        material: p.material || p.Material || "",
        specifications: p.specifications || p.Specifications || "",
        supplier: p.supplier || p.Supplier || "",
        purchasePrice: p.purchasePrice ?? p.PurchasePrice ?? null,
        quantity: p.quantity ?? p.Quantity ?? 0,
        minQuantity: p.minQuantity ?? p.MinQuantity ?? 5,
        location: p.location || p.Location || "",
        warehouse: p.warehouse || p.Warehouse || "",
        uom: p.uom || p.UoM || p.uoM || "",
        replacementCycle: p.replacementCycle || p.ReplacementCycle || "",
        dateAdded: p.dateAdded || p.DateAdded || null,
        unitPrice: p.unitPrice || p.UnitPrice || null,
        status: p.status || p.Status || null,
        documentUrl: p.documentUrl || p.DocumentUrl || null,
        isActive: p.isActive !== undefined ? p.isActive : true,
      }));
      setSpareParts(normalized);
    } catch (error) {
      console.error("Error loading spare parts", error);
      message.error("Không thể tải danh sách phụ tùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParts();
  }, []);

  // Persist inactive view state on change
  useEffect(() => {
    localStorage.setItem(
      "inventoryManagement_showInactive",
      JSON.stringify(showInactive)
    );
  }, [showInactive]);

  // Helper function to get sort order for status
  const getStatusSortOrder = (status) => {
    switch (status) {
      case "Hết hàng":
        return 0; // Highest priority - show first
      case "Sắp hết":
        return 1; // Medium priority
      case "Đủ hàng":
        return 2; // Low priority - show last
      default:
        return 3;
    }
  };

  const filteredData = spareParts
    .filter((part) => {
      const matchSearch =
        part.partNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        part.partName.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus =
        filterStatus === "all" || part.status === filterStatus;
      // Update filtering logic to use showInactive
      const matchActive = showInactive ? !part.isActive : part.isActive; // Show inactive if showInactive is true, otherwise show active
      return matchSearch && matchStatus && matchActive;
    })
    .sort((a, b) => {
      // Sort by partId descending (newest first)
      return b.partId - a.partId;
    });

  // Get list of low stock and out of stock spare parts for alerts
  const getLowStockAlerts = () => {
    const lowStockItems = spareParts.filter(
      (p) => p.isActive && (p.status === "Sắp hết" || p.status === "Low Stock")
    );
    const outOfStockItems = spareParts.filter(
      (p) =>
        p.isActive && (p.status === "Hết hàng" || p.status === "Out of Stock")
    );
    return { lowStockItems, outOfStockItems };
  };

  const { lowStockItems, outOfStockItems } = getLowStockAlerts();

  return (
    <div className={styles.container}>
      {/* Combined Alert for Low Stock and Out of Stock Items - Modal Style */}
      {showLowStockAlert &&
        (lowStockItems.length > 0 || outOfStockItems.length > 0) && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              width: "90%",
              maxWidth: 700,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: 8,
              backgroundColor: "#fff",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <Alert
              message={
                outOfStockItems.length > 0
                  ? `❌ ${outOfStockItems.length} phụ tùng đã hết, ⚠️ ${lowStockItems.length} phụ tùng sắp hết hàng`
                  : `⚠️ ${lowStockItems.length} phụ tùng sắp hết hàng`
              }
              description={
                <div>
                  {/* Out of Stock Section */}
                  {outOfStockItems.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <h4
                        style={{
                          color: "#ff4d4f",
                          marginTop: 8,
                          marginBottom: 8,
                        }}
                      >
                        🔴 Đã hết hàng ({outOfStockItems.length}):
                      </h4>
                      <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                        {outOfStockItems.map((part) => (
                          <li
                            key={part.partId}
                            style={{
                              marginBottom: 8,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>
                              <strong>{part.partName}</strong> (
                              {part.partNumber}) - Số lượng: 0
                            </span>
                            <Tooltip title="Tạo yêu cầu mua hàng">
                              <Button
                                type="primary"
                                size="small"
                                icon={<ShoppingCartOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    "/warehouse-manager/purchase-requests",
                                    {
                                      state: {
                                        prefillPart: {
                                          partId: part.partId,
                                          partNumber: part.partNumber,
                                          partName: part.partName,
                                          currentQuantity: part.quantity,
                                          minQuantity: part.minQuantity,
                                        },
                                      },
                                    }
                                  );
                                }}
                                style={{ marginLeft: 8 }}
                              >
                                Mua hàng
                              </Button>
                            </Tooltip>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Low Stock Section */}
                  {lowStockItems.length > 0 && (
                    <div>
                      <h4
                        style={{
                          color: "#faad14",
                          marginTop: 8,
                          marginBottom: 8,
                        }}
                      >
                        🟡 Sắp hết hàng ({lowStockItems.length}):
                      </h4>
                      <ul style={{ marginBottom: 8, paddingLeft: 20 }}>
                        {lowStockItems.map((part) => (
                          <li
                            key={part.partId}
                            style={{
                              marginBottom: 8,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>
                              <strong>{part.partName}</strong> (
                              {part.partNumber}) - Còn lại:{" "}
                              <strong style={{ color: "#faad14" }}>
                                {part.quantity}
                              </strong>{" "}
                              cái
                            </span>
                            <Tooltip title="Tạo yêu cầu mua hàng">
                              <Button
                                type="default"
                                size="small"
                                icon={<ShoppingCartOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    "/warehouse-manager/purchase-requests",
                                    {
                                      state: {
                                        prefillPart: {
                                          partId: part.partId,
                                          partNumber: part.partNumber,
                                          partName: part.partName,
                                          currentQuantity: part.quantity,
                                          minQuantity: part.minQuantity,
                                        },
                                      },
                                    }
                                  );
                                }}
                                style={{ marginLeft: 8 }}
                              >
                                Mua hàng
                              </Button>
                            </Tooltip>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              }
              type={outOfStockItems.length > 0 ? "error" : "warning"}
              closable
              onClose={() => setShowLowStockAlert(false)}
              style={{ marginBottom: 0, borderRadius: 8 }}
              showIcon
            />
          </div>
        )}

      {/* Overlay when alert is shown */}
      {showLowStockAlert &&
        (lowStockItems.length > 0 || outOfStockItems.length > 0) && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              zIndex: 999,
            }}
            onClick={() => setShowLowStockAlert(false)}
          />
        )}

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
                  Tổng phụ tùng
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
            style={{ borderRadius: "8px", border: "1px solid #b7eb8f" }}
          >
            <Statistic
              title={
                <span style={{ color: "#52c41a", fontWeight: "600" }}>
                  Đủ hàng
                </span>
              }
              value={stats.inStock}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{
                color: "#52c41a",
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
                  Sắp hết
                </span>
              }
              value={stats.lowStock}
              prefix={<WarningOutlined style={{ color: "#faad14" }} />}
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
            style={{ borderRadius: "8px", border: "1px solid #ffccc7" }}
          >
            <Statistic
              title={
                <span style={{ color: "#ff4d4f", fontWeight: "600" }}>
                  Hết hàng
                </span>
              }
              value={stats.outOfStock}
              prefix={<WarningOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{
                color: "#ff4d4f",
                fontSize: "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card
        title="Danh sách phụ tùng"
        className={styles.tableCard}
        extra={
          <Space>
            <Button
              type="default"
              icon={<WarningOutlined />}
              onClick={() => {
                setMinValue(5);
                setShowMinModal(true);
              }}
              style={{
                borderColor: "#faad14",
                color: "#faad14",
                borderRadius: "6px",
                fontWeight: "500",
              }}
            >
              Điều chỉnh SL tối thiểu
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{
                backgroundColor: "#283652",
                borderColor: "#283652",
                borderRadius: "6px",
                fontWeight: "500",
              }}
            >
              Thêm phụ tùng
            </Button>
          </Space>
        }
      >
        <Tabs
          activeKey={showInactive ? "inactive" : "active"}
          onChange={(key) => setShowInactive(key === "inactive")}
          items={[
            {
              key: "active",
              label: (
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  <CheckCircleOutlined style={{ marginRight: 6 }} />
                  Đang sử dụng ({spareParts.filter((p) => p.isActive).length})
                </span>
              ),
              children: (
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                      <Search
                        placeholder="Tìm theo mã hoặc tên phụ tùng"
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                        style={{ borderRadius: "6px" }}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Select
                        style={{ width: "100%", borderRadius: "6px" }}
                        placeholder="Lọc theo trạng thái"
                        value={filterStatus}
                        onChange={setFilterStatus}
                      >
                        <Option value="all">Tất cả trạng thái</Option>
                        <Option value="Đủ hàng">Đủ hàng</Option>
                        <Option value="Sắp hết">Sắp hết</Option>
                        <Option value="Hết hàng">Hết hàng</Option>
                      </Select>
                    </Col>
                  </Row>

                  <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="partId"
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Tổng cộng ${total} phụ tùng`,
                      style: { marginTop: "16px" },
                    }}
                    style={{ borderRadius: "6px" }}
                  />
                </Space>
              ),
            },
            {
              key: "inactive",
              label: (
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  <DeleteOutlined style={{ marginRight: 6 }} />
                  Ngưng sử dụng ({spareParts.filter((p) => !p.isActive).length})
                </span>
              ),
              children: (
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                      <Search
                        placeholder="Tìm theo mã hoặc tên phụ tùng"
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                        style={{ borderRadius: "6px" }}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Select
                        style={{ width: "100%", borderRadius: "6px" }}
                        placeholder="Lọc theo trạng thái"
                        value={filterStatus}
                        onChange={setFilterStatus}
                      >
                        <Option value="all">Tất cả trạng thái</Option>
                        <Option value="Đủ hàng">Đủ hàng</Option>
                        <Option value="Sắp hết">Sắp hết</Option>
                        <Option value="Hết hàng">Hết hàng</Option>
                      </Select>
                    </Col>
                  </Row>

                  <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="partId"
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Tổng cộng ${total} phụ tùng`,
                      style: { marginTop: "16px" },
                    }}
                    style={{ borderRadius: "6px" }}
                  />
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <div
            style={{ fontSize: "20px", fontWeight: "600", color: "#283652" }}
          >
            {editingRecord ? "Cập nhật phụ tùng" : "Thêm phụ tùng mới"}
          </div>
        }
        open={isModalVisible}
        onOk={() => form.submit()} // ✅ ĐÚNG: Gọi form.submit()
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={1400}
        centered
        okText={editingRecord ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        okButtonProps={{
          style: {
            backgroundColor: "#283652",
            borderColor: "#283652",
            height: "40px",
            fontSize: "16px",
            fontWeight: "500",
            minWidth: "120px",
          },
          icon: editingRecord ? <EditOutlined /> : <PlusOutlined />,
          loading: loading,
          htmlType: "submit", // ✅ Thêm dòng này
        }}
        cancelButtonProps={{
          style: {
            height: "40px",
            fontSize: "16px",
            minWidth: "120px",
          },
        }}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "24px",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          scrollToFirstError
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="partNumber"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Mã phụ tùng
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập mã phụ tùng" },
                  {
                    validator: async (_, value) => {
                      if (!value) return;
                      try {
                        const existingParts = spareParts.filter(
                          (p) =>
                            p.partNumber.toLowerCase() === value.toLowerCase()
                        );
                        if (editingRecord) {
                          const conflicts = existingParts.filter(
                            (p) => p.partId !== editingRecord.partId
                          );
                          if (conflicts.length > 0) {
                            throw new Error("Mã phụ tùng đã tồn tại");
                          }
                        } else {
                          if (existingParts.length > 0) {
                            throw new Error("Mã phụ tùng đã tồn tại");
                          }
                        }
                      } catch (error) {
                        throw new Error(error.message);
                      }
                    },
                  },
                ]}
              >
                <Input placeholder="VD: PT001" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="partName"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Tên phụ tùng
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập tên phụ tùng" },
                  { min: 2, message: "Tên phụ tùng phải có ít nhất 2 ký tự" },
                  {
                    max: 100,
                    message: "Tên phụ tùng không được vượt quá 100 ký tự",
                  },
                  {
                    validator: async (_, value) => {
                      if (!value) return;
                      try {
                        const existingParts = spareParts.filter(
                          (p) =>
                            p.partName.toLowerCase() === value.toLowerCase()
                        );
                        if (editingRecord) {
                          const conflicts = existingParts.filter(
                            (p) => p.partId !== editingRecord.partId
                          );
                          if (conflicts.length > 0) {
                            throw new Error("Tên phụ tùng đã tồn tại");
                          }
                        } else {
                          if (existingParts.length > 0) {
                            throw new Error("Tên phụ tùng đã tồn tại");
                          }
                        }
                      } catch (error) {
                        throw new Error(error.message);
                      }
                    },
                  },
                ]}
              >
                <Input placeholder="VD: Motor điện 5HP" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="partType"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Loại phụ tùng
                  </span>
                }
              >
                <Input
                  placeholder="VD: Cơ khí, Điện tử, Điều khiển"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Số lượng
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng" },
                  {
                    type: "number",
                    min: editingRecord ? 0 : 1,
                    message: editingRecord
                      ? "Số lượng không được âm"
                      : "Số lượng phải lớn hơn 0",
                  },
                ]}
              >
                <InputNumber
                  min={editingRecord ? 0 : 1}
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minQuantity"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Số lượng tối thiểu
                  </span>
                }
                rules={[{ type: "number", min: 0, message: "Phải >= 0" }]}
                initialValue={editingRecord ? undefined : 5}
              >
                <InputNumber min={0} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Vị trí
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập vị trí" },
                  { min: 2, message: "Vị trí phải có ít nhất 2 ký tự" },
                  { max: 200, message: "Vị trí không được vượt quá 200 ký tự" },
                ]}
              >
                <Input placeholder="VD: Kho A - Kệ 1" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Min quantity adjustment modal */}
      <Modal
        title={
          <div
            style={{ fontSize: "18px", fontWeight: "600", color: "#283652" }}
          >
            Điều chỉnh số lượng tối thiểu
          </div>
        }
        open={showMinModal}
        onOk={async () => {
          try {
            setSavingMin(true);
            // Apply minValue to all active spare parts only
            const activeParts = spareParts.filter((part) => part.isActive);
            for (const part of activeParts) {
              // Send full payload with all required fields
              await sparePartService.update(part.partId, {
                partNumber: part.partNumber,
                partName: part.partName,
                quantity: part.quantity,
                location: part.location || "",
                minQuantity: minValue,
              });
            }
            message.success(
              `Áp dụng số lượng tối thiểu ${minValue} cho ${activeParts.length} phụ tùng đang sử dụng thành công`
            );
            setShowMinModal(false);
            await loadParts();
          } catch (err) {
            console.error(err);
            message.error("Không thể áp dụng số lượng tối thiểu");
          } finally {
            setSavingMin(false);
          }
        }}
        onCancel={() => setShowMinModal(false)}
        width={600}
        centered
        okText="Áp dụng cho tất cả"
        cancelText="Hủy"
        okButtonProps={{
          style: {
            backgroundColor: "#283652",
            borderColor: "#283652",
            height: "40px",
            fontSize: "16px",
            fontWeight: "500",
            minWidth: "160px",
          },
          icon: <CheckCircleOutlined />,
          loading: savingMin,
        }}
        cancelButtonProps={{
          style: {
            height: "40px",
            fontSize: "16px",
            minWidth: "120px",
          },
        }}
        bodyStyle={{
          padding: "24px",
        }}
      >
        <Form layout="vertical">
          <Form.Item
            label={
              <span style={{ fontWeight: "600", fontSize: "14px" }}>
                Áp dụng số lượng tối thiểu cho tất cả phụ tùng đang sử dụng
              </span>
            }
          >
            <InputNumber
              min={0}
              value={minValue}
              onChange={(val) => setMinValue(val || 5)}
              style={{ width: "100%" }}
              placeholder="Nhập số lượng tối thiểu"
              size="large"
            />
          </Form.Item>
        </Form>
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
              <InboxOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "16px" }}>
                {viewingRecord?.partName}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: "normal",
                }}
              >
                {viewingRecord?.partNumber} •{" "}
                {viewingRecord?.partType || "Chưa phân loại"}
              </div>
            </div>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setViewingRecord(null);
        }}
        width={1200}
        centered
        footer={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              handleEdit(viewingRecord);
            }}
            style={{
              backgroundColor: "#283652",
              borderColor: "#283652",
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Chỉnh sửa
          </Button>,
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
        ]}
      >
        {viewingRecord && (
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
              <Descriptions.Item label="Mã phụ tùng">
                {viewingRecord.partNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Tên phụ tùng">
                {viewingRecord.partName}
              </Descriptions.Item>

              <Descriptions.Item label="Loại phụ tùng">
                {viewingRecord.partType || "Chưa xác định"}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Nhà cung cấp">
                {viewingRecord.supplier || "Chưa xác định"}
              </Descriptions.Item> */}

              {/* <Descriptions.Item label="Vật liệu">
                {viewingRecord.material || "Chưa xác định"}
              </Descriptions.Item> */}
              {/* <Descriptions.Item label="Giá mua">
                {viewingRecord.purchasePrice
                  ? `${viewingRecord.purchasePrice.toLocaleString("vi-VN")} đ`
                  : "Chưa xác định"}
              </Descriptions.Item> */}

              {/* <Descriptions.Item label="Thông số kỹ thuật" span={2}>
                {viewingRecord.specifications || "Chưa xác định"}
              </Descriptions.Item> */}

              <Descriptions.Item label="Số lượng hiện tại">
                {viewingRecord.quantity ?? 0} {viewingRecord.uom || "cái"}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng tối thiểu">
                {viewingRecord.minQuantity ?? 0} {viewingRecord.uom || "cái"}
              </Descriptions.Item>

              <Descriptions.Item label="Vị trí">
                {viewingRecord.location || "Chưa xác định"}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Kho">
                {viewingRecord.warehouse || "Chưa xác định"}
              </Descriptions.Item> */}

              {/* <Descriptions.Item label="Đơn vị tính">
                {viewingRecord.uom || "Chưa xác định"}
              </Descriptions.Item> */}
              {/* <Descriptions.Item label="Chu kỳ thay thế">
                {viewingRecord.replacementCycle || "Chưa xác định"}
              </Descriptions.Item> */}

              <Descriptions.Item label="Ngày thêm">
                {viewingRecord.dateAdded
                  ? new Date(viewingRecord.dateAdded).toLocaleDateString(
                      "vi-VN"
                    )
                  : "Chưa xác định"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {(() => {
                  let color = "success";
                  let displayStatus = viewingRecord.status;
                  const q = viewingRecord.quantity ?? 0;
                  const minQ = viewingRecord.minQuantity ?? 5;

                  if (viewingRecord.status) {
                    switch (viewingRecord.status) {
                      case "Đủ hàng":
                      case "Available":
                        color = "success";
                        displayStatus = "Đủ hàng";
                        break;
                      case "Sắp hết":
                      case "Low Stock":
                        color = "warning";
                        displayStatus = "Sắp hết";
                        break;
                      case "Hết hàng":
                      case "Out of Stock":
                        color = "error";
                        displayStatus = "Hết hàng";
                        break;
                      default:
                        color = "default";
                        displayStatus = viewingRecord.status;
                    }
                  } else {
                    if (q === 0) {
                      color = "error";
                      displayStatus = "Hết hàng";
                    } else if (q <= minQ) {
                      color = "warning";
                      displayStatus = "Sắp hết";
                    } else {
                      color = "success";
                      displayStatus = "Đủ hàng";
                    }
                  }

                  return <Tag color={color}>{displayStatus}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái hoạt động">
                <Tag color={viewingRecord.isActive ? "green" : "red"}>
                  {viewingRecord.isActive ? "Đang sử dụng" : "Ngưng sử dụng"}
                </Tag>
              </Descriptions.Item>

              {/* {viewingRecord.documentUrl && (
                <Descriptions.Item label="Tài liệu" span={2}>
                  <a
                    href={viewingRecord.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {viewingRecord.documentUrl}
                  </a>
                </Descriptions.Item>
              )} */}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryManagement;
