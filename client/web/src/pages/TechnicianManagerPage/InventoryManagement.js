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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  WarningOutlined,
  InboxOutlined,
  CheckCircleOutlined,
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

  // Spare parts loaded from backend
  const [spareParts, setSpareParts] = useState([]);

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
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      width: 150,
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 130,
      render: (price) => (price ? `${price.toLocaleString()} đ` : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status, record) => {
        let color = "success";
        if (status === "Sắp hết") color = "warning";
        if (status === "Hết hàng") color = "error";
        // Fallback: if no explicit status, infer from quantity and minQuantity
        if (!status) {
          const q = record.quantity ?? 0;
          const minQ = record.minQuantity ?? 5;
          if (q === 0) color = "error";
          else if (q <= minQ) color = "warning";
          else color = "success";
        }
        return (
          <Tag color={color}>
            {status || (record.quantity === 0 ? "Hết hàng" : "Đủ hàng")}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
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
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa phụ tùng "${record.partName}"?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => {
        // Call backend delete
        (async () => {
          try {
            setLoading(true);
            await sparePartService.delete(record.partId);
            message.success("Xóa phụ tùng thành công!");
            await loadParts();
          } catch (error) {
            console.error("Delete error", error);
            message.error("Không thể xóa phụ tùng");
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
    return matchSearch && matchStatus;
  });

  return (
    <div className={styles.container}>
      {/* Statistics */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng phụ tùng"
              value={stats.total}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Đủ hàng"
              value={stats.inStock}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Sắp hết"
              value={stats.lowStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
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
        bordered={false}
        className={styles.tableCard}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm phụ tùng
          </Button>
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
                rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Vị trí"
                rules={[{ required: true, message: "Vui lòng nhập vị trí" }]}
              >
                <Input placeholder="VD: Kho A - Kệ 1" />
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
    </div>
  );
};

export default InventoryManagement;
