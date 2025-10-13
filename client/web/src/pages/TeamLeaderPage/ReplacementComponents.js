import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  Popconfirm,
  Tooltip,
  Tabs,
  Descriptions,
  Badge,
  InputNumber,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  ToolOutlined,
  HistoryOutlined,
  UploadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/ReplacementComponents.module.css";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const ReplacementComponents = () => {
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState([]);
  const [replacementRecords, setReplacementRecords] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [componentModalVisible, setComponentModalVisible] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("components");
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchComponents();
    fetchReplacementRecords();
  }, []);

  const fetchComponents = () => {
    setLoading(true);
    setTimeout(() => {
      const mockData = [
        {
          id: "COMP001",
          name: "Motor điện 5HP",
          category: "Động cơ",
          quantity: 15,
          minQuantity: 5,
          unit: "Cái",
          price: 5000000,
          supplier: "Công ty ABC",
          location: "Kho A - Kệ 1",
          status: "Đủ",
          lastUpdated: "2025-01-10",
        },
        {
          id: "COMP002",
          name: "Băng tải 10m",
          category: "Băng tải",
          quantity: 3,
          minQuantity: 5,
          unit: "Cuộn",
          price: 8000000,
          supplier: "Công ty XYZ",
          location: "Kho B - Kệ 2",
          status: "Thiếu",
          lastUpdated: "2025-01-09",
        },
        {
          id: "COMP003",
          name: "Bơm thủy lực",
          category: "Bơm",
          quantity: 8,
          minQuantity: 3,
          unit: "Cái",
          price: 12000000,
          supplier: "Công ty DEF",
          location: "Kho A - Kệ 3",
          status: "Đủ",
          lastUpdated: "2025-01-08",
        },
        {
          id: "COMP004",
          name: "Van điện từ",
          category: "Van",
          quantity: 2,
          minQuantity: 4,
          unit: "Cái",
          price: 3000000,
          supplier: "Công ty GHI",
          location: "Kho C - Kệ 1",
          status: "Thiếu",
          lastUpdated: "2025-01-07",
        },
      ];
      setComponents(mockData);
      setLoading(false);
    }, 1000);
  };

  const fetchReplacementRecords = () => {
    setLoading(true);
    setTimeout(() => {
      const mockData = [
        {
          id: "REP001",
          componentId: "COMP001",
          componentName: "Motor điện 5HP",
          equipmentName: "Máy dập 01",
          lineName: "Dây chuyền 1",
          quantity: 1,
          reason: "Hỏng do quá tải",
          technician: "Nguyễn Văn A",
          replacementDate: "2025-01-10 14:30",
          status: "Hoàn thành",
          cost: 5000000,
          note: "Thay thế thành công",
        },
        {
          id: "REP002",
          componentId: "COMP002",
          componentName: "Băng tải 10m",
          equipmentName: "Máy vận chuyển 02",
          lineName: "Dây chuyền 2",
          quantity: 1,
          reason: "Rách do ma sát",
          technician: "Trần Văn B",
          replacementDate: "2025-01-09 10:15",
          status: "Hoàn thành",
          cost: 8000000,
          note: "Đã kiểm tra và vận hành tốt",
        },
        {
          id: "REP003",
          componentId: "COMP003",
          componentName: "Bơm thủy lực",
          equipmentName: "Máy ép 03",
          lineName: "Dây chuyền 1",
          quantity: 1,
          reason: "Giảm hiệu suất",
          technician: "Lê Văn C",
          replacementDate: "2025-01-08 16:45",
          status: "Hoàn thành",
          cost: 12000000,
          note: "Bảo dưỡng thêm 2 bơm khác",
        },
        {
          id: "REP004",
          componentId: "COMP004",
          componentName: "Van điện từ",
          equipmentName: "Máy cắt 04",
          lineName: "Dây chuyền 3",
          quantity: 2,
          reason: "Không đóng mở được",
          technician: "Phạm Văn D",
          replacementDate: "2025-01-07 09:00",
          status: "Đang xử lý",
          cost: 6000000,
          note: "Đang chờ linh kiện",
        },
      ];
      setReplacementRecords(mockData);
      setLoading(false);
    }, 1000);
  };

  const handleAddComponent = () => {
    setIsEditMode(false);
    setSelectedComponent(null);
    form.resetFields();
    setComponentModalVisible(true);
  };

  const handleEditComponent = (record) => {
    setIsEditMode(true);
    setSelectedComponent(record);
    form.setFieldsValue(record);
    setComponentModalVisible(true);
  };

  const handleDeleteComponent = async (id) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Xóa linh kiện thành công!");
      fetchComponents();
    } catch (error) {
      message.error("Xóa thất bại!");
      setLoading(false);
    }
  };

  const handleAddRecord = () => {
    form.resetFields();
    setRecordModalVisible(true);
  };

  const handleViewDetail = (record, type) => {
    if (type === "component") {
      setSelectedComponent(record);
    } else {
      setSelectedRecord(record);
    }
    setDetailModalVisible(true);
  };

  const handleComponentSubmit = async (values) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success(
        isEditMode
          ? "Cập nhật linh kiện thành công!"
          : "Thêm linh kiện thành công!"
      );
      setComponentModalVisible(false);
      form.resetFields();
      fetchComponents();
    } catch (error) {
      message.error("Lưu thất bại!");
      setLoading(false);
    }
  };

  const handleRecordSubmit = async (values) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Thêm lịch sử thay thế thành công!");
      setRecordModalVisible(false);
      form.resetFields();
      fetchReplacementRecords();
    } catch (error) {
      message.error("Lưu thất bại!");
      setLoading(false);
    }
  };

  const componentColumns = [
    {
      title: "Mã linh kiện",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Tên linh kiện",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: 150,
      render: (_, record) => (
        <div>
          <span
            style={{
              fontWeight: 600,
              color:
                record.quantity < record.minQuantity ? "#ff4d4f" : "#52c41a",
            }}
          >
            {record.quantity}
          </span>
          <span style={{ color: "#8c8c8c" }}>
            {" "}
            / {record.minQuantity} {record.unit}
          </span>
        </div>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      align: "right",
      render: (val) => `${val.toLocaleString()} đ`,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
      width: 150,
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
      width: 100,
      render: (status) => (
        <Tag
          icon={status === "Đủ" ? <CheckCircleOutlined /> : <WarningOutlined />}
          color={status === "Đủ" ? "success" : "warning"}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record, "component")}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditComponent(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa linh kiện"
            description="Bạn có chắc chắn muốn xóa linh kiện này?"
            onConfirm={() => handleDeleteComponent(record.id)}
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

  const recordColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Linh kiện",
      dataIndex: "componentName",
      key: "componentName",
      width: 180,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 150,
    },
    {
      title: "Dây chuyền",
      dataIndex: "lineName",
      key: "lineName",
      width: 120,
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      align: "center",
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Kỹ thuật viên",
      dataIndex: "technician",
      key: "technician",
      width: 150,
    },
    {
      title: "Thời gian",
      dataIndex: "replacementDate",
      key: "replacementDate",
      width: 150,
    },
    {
      title: "Chi phí",
      dataIndex: "cost",
      key: "cost",
      width: 120,
      align: "right",
      render: (val) => `${val.toLocaleString()} đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "Hoàn thành" ? "success" : "processing"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record, "record")}
          />
        </Tooltip>
      ),
    },
  ];

  const filteredComponents = components.filter(
    (comp) =>
      comp.name.toLowerCase().includes(searchText.toLowerCase()) ||
      comp.id.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredRecords = replacementRecords.filter(
    (rec) =>
      rec.componentName.toLowerCase().includes(searchText.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className={styles.replacementComponents}>
      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Components Tab */}
          <TabPane
            tab={
              <span>
                <ToolOutlined />
                Danh sách linh kiện ({components.length})
              </span>
            }
            key="components"
          >
            <div className={styles.tabContent}>
              <div className={styles.filterSection}>
                <Space size="middle" style={{ marginBottom: 16 }}>
                  <Input
                    placeholder="Tìm kiếm linh kiện..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddComponent}
                  >
                    Thêm linh kiện
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={fetchComponents}>
                    Làm mới
                  </Button>
                </Space>
              </div>

              <Table
                columns={componentColumns}
                dataSource={filteredComponents}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1400 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} linh kiện`,
                }}
              />
            </div>
          </TabPane>

          {/* Replacement Records Tab */}
          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                Lịch sử thay thế ({replacementRecords.length})
              </span>
            }
            key="records"
          >
            <div className={styles.tabContent}>
              <div className={styles.filterSection}>
                <Space size="middle" style={{ marginBottom: 16 }}>
                  <Input
                    placeholder="Tìm kiếm lịch sử..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddRecord}
                  >
                    Thêm phiếu thay thế
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchReplacementRecords}
                  >
                    Làm mới
                  </Button>
                </Space>
              </div>

              <Table
                columns={recordColumns}
                dataSource={filteredRecords}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1600 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} phiếu`,
                }}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Component Form Modal */}
      <Modal
        title={
          <Space>
            {isEditMode ? <EditOutlined /> : <PlusOutlined />}
            <span>{isEditMode ? "Chỉnh sửa" : "Thêm"} linh kiện</span>
          </Space>
        }
        open={componentModalVisible}
        onCancel={() => {
          setComponentModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleComponentSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên linh kiện"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
              >
                <Input placeholder="Nhập tên linh kiện" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <Select placeholder="Chọn danh mục">
                  <Option value="Động cơ">Động cơ</Option>
                  <Option value="Băng tải">Băng tải</Option>
                  <Option value="Bơm">Bơm</Option>
                  <Option value="Van">Van</Option>
                  <Option value="Cảm biến">Cảm biến</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              >
                <InputNumber
                  placeholder="0"
                  style={{ width: "100%" }}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Tồn kho tối thiểu"
                name="minQuantity"
                rules={[{ required: true, message: "Vui lòng nhập!" }]}
              >
                <InputNumber
                  placeholder="0"
                  style={{ width: "100%" }}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Đơn vị"
                name="unit"
                rules={[{ required: true, message: "Vui lòng nhập đơn vị!" }]}
              >
                <Input placeholder="Cái, Kg, m..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Đơn giá (VNĐ)"
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
              >
                <InputNumber
                  placeholder="0"
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Nhà cung cấp" name="supplier">
                <Input placeholder="Tên nhà cung cấp" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Vị trí lưu trữ" name="location">
                <Input placeholder="Kho A - Kệ 1" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setComponentModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditMode ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Replacement Record Form Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            <span>Thêm phiếu thay thế</span>
          </Space>
        }
        open={recordModalVisible}
        onCancel={() => {
          setRecordModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleRecordSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Linh kiện"
                name="componentId"
                rules={[
                  { required: true, message: "Vui lòng chọn linh kiện!" },
                ]}
              >
                <Select placeholder="Chọn linh kiện">
                  {components.map((comp) => (
                    <Option key={comp.id} value={comp.id}>
                      {comp.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              >
                <InputNumber
                  placeholder="0"
                  style={{ width: "100%" }}
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thiết bị"
                name="equipmentName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên thiết bị!" },
                ]}
              >
                <Input placeholder="Nhập tên thiết bị" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Dây chuyền"
                name="lineName"
                rules={[
                  { required: true, message: "Vui lòng chọn dây chuyền!" },
                ]}
              >
                <Select placeholder="Chọn dây chuyền">
                  <Option value="Dây chuyền 1">Dây chuyền 1</Option>
                  <Option value="Dây chuyền 2">Dây chuyền 2</Option>
                  <Option value="Dây chuyền 3">Dây chuyền 3</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Kỹ thuật viên"
                name="technician"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
              >
                <Input placeholder="Nhập tên kỹ thuật viên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thời gian thay thế"
                name="replacementDate"
                rules={[
                  { required: true, message: "Vui lòng chọn thời gian!" },
                ]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                  placeholder="Chọn thời gian"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Lý do thay thế"
                name="reason"
                rules={[{ required: true, message: "Vui lòng nhập lý do!" }]}
              >
                <TextArea rows={2} placeholder="Mô tả lý do thay thế..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Chi phí (VNĐ)" name="cost">
                <InputNumber
                  placeholder="0"
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="Đang xử lý">Đang xử lý</Option>
                  <Option value="Hoàn thành">Hoàn thành</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Ghi chú" name="note">
                <TextArea rows={2} placeholder="Ghi chú thêm (nếu có)..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setRecordModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Thêm mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>
              {selectedComponent
                ? "Chi tiết linh kiện"
                : "Chi tiết phiếu thay thế"}
            </span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedComponent && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã linh kiện" span={2}>
              {selectedComponent.id}
            </Descriptions.Item>
            <Descriptions.Item label="Tên linh kiện" span={2}>
              {selectedComponent.name}
            </Descriptions.Item>
            <Descriptions.Item label="Danh mục">
              <Tag color="blue">{selectedComponent.category}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  selectedComponent.status === "Đủ" ? "success" : "warning"
                }
              >
                {selectedComponent.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng hiện tại">
              <span style={{ fontWeight: 600 }}>
                {selectedComponent.quantity} {selectedComponent.unit}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Tồn kho tối thiểu">
              <span style={{ fontWeight: 600 }}>
                {selectedComponent.minQuantity} {selectedComponent.unit}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn giá">
              {selectedComponent.price.toLocaleString()} đ
            </Descriptions.Item>
            <Descriptions.Item label="Nhà cung cấp">
              {selectedComponent.supplier}
            </Descriptions.Item>
            <Descriptions.Item label="Vị trí" span={2}>
              {selectedComponent.location}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối" span={2}>
              {selectedComponent.lastUpdated}
            </Descriptions.Item>
          </Descriptions>
        )}

        {selectedRecord && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã phiếu" span={2}>
              {selectedRecord.id}
            </Descriptions.Item>
            <Descriptions.Item label="Linh kiện" span={2}>
              {selectedRecord.componentName}
            </Descriptions.Item>
            <Descriptions.Item label="Thiết bị">
              {selectedRecord.equipmentName}
            </Descriptions.Item>
            <Descriptions.Item label="Dây chuyền">
              <Tag color="purple">{selectedRecord.lineName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">
              {selectedRecord.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Kỹ thuật viên">
              {selectedRecord.technician}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian" span={2}>
              {selectedRecord.replacementDate}
            </Descriptions.Item>
            <Descriptions.Item label="Lý do" span={2}>
              {selectedRecord.reason}
            </Descriptions.Item>
            <Descriptions.Item label="Chi phí">
              {selectedRecord.cost.toLocaleString()} đ
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  selectedRecord.status === "Hoàn thành"
                    ? "success"
                    : "processing"
                }
              >
                {selectedRecord.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              {selectedRecord.note || "-"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ReplacementComponents;
