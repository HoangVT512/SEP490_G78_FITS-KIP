import React, { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import styles from "../../styles/pages/InventoryManagement.module.css";
import { sparePartService } from "../../services/sparePartService";

const { Option } = Select;
const { Search } = Input;

const InventoryManagement = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterActive, setFilterActive] = useState("active"); // Filter by IsActive status

  // Spare parts loaded from backend
  const [spareParts, setSpareParts] = useState([]);
  const [showMinModal, setShowMinModal] = useState(false);
  const [minValue, setMinValue] = useState(5); // Single min quantity value for Apply-to-All
  const [savingMin, setSavingMin] = useState(false);

  const stats = {
    total: spareParts.length,
    inStock: spareParts.filter(
      (p) => p.status === "Đủ hàng" || p.status === "Available"
    ).length,
    lowStock: spareParts.filter(
      (p) => p.status === "Sắp hết" || p.status === "Low Stock"
    ).length,
    outOfStock: spareParts.filter(
      (p) => p.status === "Hết hàng" || p.status === "Out of Stock"
    ).length,
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
      title: "Số lượng tối thiểu",
      dataIndex: "minQuantity",
      key: "minQuantity",
      width: 140,
      render: (min) => min ?? 0,
    },
    {
      title: "Trạng thái hoạt động",
      dataIndex: "isActive",
      key: "isActive",
      width: 130,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Đang sử dụng" : "Đã xóa"}
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
            key: "edit",
            icon: <EditOutlined />,
            label: "Sửa",
            onClick: () => handleEdit(record),
          },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: record.isActive ? "Xóa" : "Khôi phục",
            danger: record.isActive,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            destroyOnHidden={true}
          >
            <Button type="link" icon={<DownOutlined />} />
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

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    const isDeleting = record.isActive;
    const title = isDeleting ? "Xác nhận xóa" : "Xác nhận khôi phục";
    const content = isDeleting
      ? `Bạn có chắc chắn muốn xóa phụ tùng "${record.partName}"?`
      : `Bạn có chắc chắn muốn khôi phục phụ tùng "${record.partName}"?`;
    const okText = isDeleting ? "Xóa" : "Khôi phục";

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
                ? "Xóa phụ tùng thành công!"
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
        quantity: values.quantity || 0,
        minQuantity: values.minQuantity ?? 5,
        location: values.location || "",
      };

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
        quantity: p.quantity ?? p.Quantity ?? 0,
        minQuantity: p.minQuantity ?? 5,
        location: p.location || p.Location || "",
        unitPrice: p.unitPrice || p.UnitPrice || null,
        status: p.status || p.Status || null,
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

  const filteredData = spareParts.filter((part) => {
    const matchSearch =
      part.partNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      part.partName.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = filterStatus === "all" || part.status === filterStatus;
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" && part.isActive) ||
      (filterActive === "inactive" && !part.isActive);
    return matchSearch && matchStatus && matchActive;
  });

  return (
    <div className={styles.container}>
      {/* Statistics */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless">
            <Statistic
              title="Tổng phụ tùng"
              value={stats.total}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless">
            <Statistic
              title="Đủ hàng"
              value={stats.inStock}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless">
            <Statistic
              title="Sắp hết"
              value={stats.lowStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless">
            <Statistic
              title="Hết hàng"
              value={stats.outOfStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card
        title="Danh sách phụ tùng"
        variant="borderless"
        className={styles.tableCard}
        extra={
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              type="default"
              onClick={() => {
                setMinValue(5);
                setShowMinModal(true);
              }}
            >
              Điều chỉnh SL tối thiểu
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm phụ tùng
            </Button>
          </div>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm theo mã hoặc tên phụ tùng"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                style={{ width: "100%" }}
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
            <Col xs={24} sm={12} md={8}>
              <Select
                style={{ width: "100%" }}
                placeholder="Lọc theo trạng thái hoạt động"
                value={filterActive}
                onChange={setFilterActive}
              >
                <Option value="all">Tất cả</Option>
                <Option value="active">Đang sử dụng</Option>
                <Option value="inactive">Đã xóa</Option>
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
              showTotal: (total) => `Tổng ${total} phụ tùng`,
            }}
          />
        </Space>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingRecord ? "Cập nhật phụ tùng" : "Thêm phụ tùng mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="partNumber"
                label="Mã phụ tùng"
                rules={[
                  { required: true, message: "Vui lòng nhập mã phụ tùng" },
                  {
                    validator: async (_, value) => {
                      if (!value) return;
                      try {
                        // Check if partNumber already exists (only when adding new or changing)
                        const existingParts = spareParts.filter(
                          (p) =>
                            p.partNumber.toLowerCase() === value.toLowerCase()
                        );
                        if (editingRecord) {
                          // When editing, exclude current record
                          const conflicts = existingParts.filter(
                            (p) => p.partId !== editingRecord.partId
                          );
                          if (conflicts.length > 0) {
                            throw new Error("Mã phụ tùng đã tồn tại");
                          }
                        } else {
                          // When adding new
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
                <Input placeholder="VD: PT001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="partName"
                label="Tên phụ tùng"
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
                        // Check if partName already exists (only when adding new or changing)
                        const existingParts = spareParts.filter(
                          (p) =>
                            p.partName.toLowerCase() === value.toLowerCase()
                        );
                        if (editingRecord) {
                          // When editing, exclude current record
                          const conflicts = existingParts.filter(
                            (p) => p.partId !== editingRecord.partId
                          );
                          if (conflicts.length > 0) {
                            throw new Error("Tên phụ tùng đã tồn tại");
                          }
                        } else {
                          // When adding new
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
                <Input placeholder="VD: Motor điện 5HP" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng" },
                  { type: "number", min: 0, message: "Số lượng không được âm" },
                ]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Vị trí"
                rules={[
                  { required: true, message: "Vui lòng nhập vị trí" },
                  { min: 2, message: "Vị trí phải có ít nhất 2 ký tự" },
                  { max: 200, message: "Vị trí không được vượt quá 200 ký tự" },
                ]}
              >
                <Input placeholder="VD: Kho A - Kệ 1" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minQuantity"
                label="Số lượng tối thiểu"
                rules={[{ type: "number", min: 0, message: "Phải >= 0" }]}
                initialValue={editingRecord ? undefined : 5}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRecord ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Min quantity adjustment modal */}
      <Modal
        title="Điều chỉnh số lượng tối thiểu"
        open={showMinModal}
        onCancel={() => setShowMinModal(false)}
        footer={null}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="Áp dụng số lượng tối thiểu cho tất cả phụ tùng">
            <InputNumber
              min={0}
              value={minValue}
              onChange={(val) => setMinValue(val || 5)}
              style={{ width: "100%" }}
              placeholder="Nhập số lượng tối thiểu"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setShowMinModal(false)}>Hủy</Button>
              <Button
                type="primary"
                loading={savingMin}
                onClick={async () => {
                  try {
                    setSavingMin(true);
                    // Apply minValue to all active spare parts only
                    const activeParts = spareParts.filter(
                      (part) => part.isActive
                    );
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
              >
                Áp dụng cho tất cả
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryManagement;
