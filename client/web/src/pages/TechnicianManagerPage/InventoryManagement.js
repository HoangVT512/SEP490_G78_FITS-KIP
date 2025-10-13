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

const { Option } = Select;
const { Search } = Input;

const InventoryManagement = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data
  const [spareParts, setSpareParts] = useState([
    {
      partId: 1,
      partNumber: "PT001",
      partName: "Motor điện 5HP",
      category: "Động cơ",
      quantity: 15,
      minQuantity: 5,
      location: "Kho A - Kệ 1",
      unitPrice: 5000000,
      status: "Đủ hàng",
    },
    {
      partId: 2,
      partNumber: "PT002",
      partName: "Băng tải 10m",
      category: "Phụ kiện",
      quantity: 3,
      minQuantity: 5,
      location: "Kho B - Kệ 2",
      unitPrice: 8000000,
      status: "Sắp hết",
    },
    {
      partId: 3,
      partNumber: "PT003",
      partName: "Ổ bi SKF 6205",
      category: "Phụ tùng",
      quantity: 0,
      minQuantity: 10,
      location: "Kho A - Kệ 3",
      unitPrice: 150000,
      status: "Hết hàng",
    },
  ]);

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
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 120,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (quantity, record) => (
        <span
          style={{
            color:
              quantity === 0
                ? "red"
                : quantity <= record.minQuantity
                ? "orange"
                : "green",
          }}
        >
          {quantity}
        </span>
      ),
    },
    {
      title: "Tồn kho tối thiểu",
      dataIndex: "minQuantity",
      key: "minQuantity",
      width: 150,
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
      render: (price) => `${price.toLocaleString()} đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "success";
        if (status === "Sắp hết") color = "warning";
        if (status === "Hết hàng") color = "error";
        return <Tag color={color}>{status}</Tag>;
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
        setSpareParts(spareParts.filter((p) => p.partId !== record.partId));
        message.success("Xóa phụ tùng thành công!");
      },
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Determine status based on quantity
      let status = "Đủ hàng";
      if (values.quantity === 0) {
        status = "Hết hàng";
      } else if (values.quantity <= values.minQuantity) {
        status = "Sắp hết";
      }

      if (editingRecord) {
        // Update
        setSpareParts(
          spareParts.map((p) =>
            p.partId === editingRecord.partId ? { ...p, ...values, status } : p
          )
        );
        message.success("Cập nhật phụ tùng thành công!");
      } else {
        // Add new
        const newPart = {
          partId: spareParts.length + 1,
          ...values,
          status,
        };
        setSpareParts([...spareParts, newPart]);
        message.success("Thêm phụ tùng thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

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
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select placeholder="Chọn danh mục">
                  <Option value="Động cơ">Động cơ</Option>
                  <Option value="Phụ kiện">Phụ kiện</Option>
                  <Option value="Phụ tùng">Phụ tùng</Option>
                  <Option value="Vật tư">Vật tư</Option>
                </Select>
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

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="minQuantity"
                label="Tồn kho tối thiểu"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tồn kho tối thiểu",
                  },
                ]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unitPrice"
                label="Đơn giá (đ)"
                rules={[{ required: true, message: "Vui lòng nhập đơn giá" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
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
