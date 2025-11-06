import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  InputNumber,
  message,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { sparePartService } from "../../services/sparePartService";

const { Search } = Input;

const InventoryManagement = () => {
  const [loading, setLoading] = useState(false);
  const [spareParts, setSpareParts] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSpareParts();
  }, []);

  useEffect(() => {
    handleSearch(searchText);
  }, [spareParts, searchText]);

  const fetchSpareParts = async () => {
    setLoading(true);
    try {
      const data = await sparePartService.getAll();
      setSpareParts(data || []);
      setFilteredData(data || []);
    } catch (error) {
      console.error("Error fetching spare parts:", error);
      message.error("Không thể tải danh sách phụ tùng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredData(spareParts);
      return;
    }

    const filtered = spareParts.filter(
      (item) =>
        item.partNumber?.toLowerCase().includes(value.toLowerCase()) ||
        item.partName?.toLowerCase().includes(value.toLowerCase()) ||
        item.location?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const showModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await sparePartService.update(editingItem.partId, values);
        message.success("Cập nhật phụ tùng thành công");
      } else {
        await sparePartService.create(values);
        message.success("Thêm phụ tùng thành công");
      }
      handleCancel();
      fetchSpareParts();
    } catch (error) {
      console.error("Error saving spare part:", error);
      message.error(
        editingItem ? "Không thể cập nhật phụ tùng" : "Không thể thêm phụ tùng"
      );
    }
  };

  const handleDelete = async (partId) => {
    try {
      await sparePartService.delete(partId);
      message.success("Xóa phụ tùng thành công");
      fetchSpareParts();
    } catch (error) {
      console.error("Error deleting spare part:", error);
      message.error("Không thể xóa phụ tùng");
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return { color: "red", text: "Hết hàng", icon: <WarningOutlined /> };
    } else if (quantity <= 5) {
      return {
        color: "orange",
        text: "Cực kỳ thấp",
        icon: <WarningOutlined />,
      };
    } else if (quantity <= 10) {
      return { color: "gold", text: "Thấp", icon: <WarningOutlined /> };
    } else if (quantity <= 20) {
      return { color: "blue", text: "Bình thường" };
    } else {
      return { color: "green", text: "Đủ" };
    }
  };

  const columns = [
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 120,
      fixed: "left",
      sorter: (a, b) => a.partNumber.localeCompare(b.partNumber),
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: 200,
      sorter: (a, b) => a.partName.localeCompare(b.partName),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity) => <strong>{quantity}</strong>,
    },
    {
      title: "Trạng thái tồn kho",
      key: "stockStatus",
      width: 150,
      sorter: (a, b) => a.quantity - b.quantity,
      render: (_, record) => {
        const status = getStockStatus(record.quantity);
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      width: 150,
      sorter: (a, b) => (a.location || "").localeCompare(b.location || ""),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "Available" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phụ tùng này?"
            onConfirm={() => handleDelete(record.partId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Quản lý tồn kho phụ tùng"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchSpareParts}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Thêm phụ tùng
            </Button>
          </Space>
        }
      >
        <Space style={{ marginBottom: 16, width: "100%" }} direction="vertical">
          <Search
            placeholder="Tìm kiếm theo mã, tên, hoặc vị trí..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: "100%", maxWidth: 600 }}
          />
        </Space>

        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="partId"
          loading={loading}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phụ tùng`,
          }}
          scroll={{ x: 1000 }}
          rowClassName={(record) =>
            record.quantity <= 10 ? "low-stock-row" : ""
          }
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingItem ? "Chỉnh sửa phụ tùng" : "Thêm phụ tùng mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Mã phụ tùng"
            name="partNumber"
            rules={[{ required: true, message: "Vui lòng nhập mã phụ tùng" }]}
          >
            <Input placeholder="VD: PT001" />
          </Form.Item>

          <Form.Item
            label="Tên phụ tùng"
            name="partName"
            rules={[{ required: true, message: "Vui lòng nhập tên phụ tùng" }]}
          >
            <Input placeholder="VD: Bearing 6204" />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Vị trí" name="location">
            <Input placeholder="VD: Kệ A1, Tầng 2" />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            initialValue="Available"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Input disabled value="Available" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingItem ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        :global(.low-stock-row) {
          background-color: #fff7e6;
        }
      `}</style>
    </div>
  );
};

export default InventoryManagement;
