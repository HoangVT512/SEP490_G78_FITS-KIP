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
  Statistic,
  InputNumber,
  Badge,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/ProductionManagement.module.css";

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ProductionManagement = () => {
  const [loading, setLoading] = useState(false);
  const [productions, setProductions] = useState([]);
  const [filteredProductions, setFilteredProductions] = useState([]);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();

  // Mock data - sẽ thay bằng API call sau
  useEffect(() => {
    fetchProductions();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [searchText, filterStatus, productions]);

  const fetchProductions = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockData = [
        {
          id: "PROD001",
          lineName: "Dây chuyền 1",
          productName: "Sản phẩm A",
          planQuantity: 1000,
          actualQuantity: 850,
          defectQuantity: 20,
          status: "Đang sản xuất",
          shift: "Ca 1",
          startDate: "2025-01-10 08:00",
          endDate: "2025-01-10 16:00",
          progress: 85,
          supervisor: "Nguyễn Văn A",
          note: "Sản xuất đúng tiến độ",
        },
        {
          id: "PROD002",
          lineName: "Dây chuyền 2",
          productName: "Sản phẩm B",
          planQuantity: 800,
          actualQuantity: 800,
          defectQuantity: 15,
          status: "Hoàn thành",
          shift: "Ca 2",
          startDate: "2025-01-09 16:00",
          endDate: "2025-01-10 00:00",
          progress: 100,
          supervisor: "Trần Thị B",
          note: "Hoàn thành đúng hạn",
        },
        {
          id: "PROD003",
          lineName: "Dây chuyền 1",
          productName: "Sản phẩm C",
          planQuantity: 1200,
          actualQuantity: 500,
          defectQuantity: 30,
          status: "Tạm dừng",
          shift: "Ca 3",
          startDate: "2025-01-10 00:00",
          endDate: "2025-01-10 08:00",
          progress: 42,
          supervisor: "Lê Văn C",
          note: "Tạm dừng do thiếu nguyên liệu",
        },
        {
          id: "PROD004",
          lineName: "Dây chuyền 3",
          productName: "Sản phẩm D",
          planQuantity: 1500,
          actualQuantity: 1350,
          defectQuantity: 25,
          status: "Đang sản xuất",
          shift: "Ca 1",
          startDate: "2025-01-10 08:00",
          endDate: "2025-01-10 16:00",
          progress: 90,
          supervisor: "Phạm Văn D",
          note: "Sắp hoàn thành",
        },
      ];
      setProductions(mockData);
      setFilteredProductions(mockData);
      setLoading(false);
    }, 1000);
  };

  const handleFilter = () => {
    let filtered = [...productions];

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (prod) =>
          prod.id.toLowerCase().includes(searchText.toLowerCase()) ||
          prod.productName.toLowerCase().includes(searchText.toLowerCase()) ||
          prod.lineName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((prod) => prod.status === filterStatus);
    }

    setFilteredProductions(filtered);
  };

  const handleAddProduction = () => {
    setIsEditMode(false);
    setSelectedProduction(null);
    form.resetFields();
    setFormModalVisible(true);
  };

  const handleEditProduction = (record) => {
    setIsEditMode(true);
    setSelectedProduction(record);
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
    });
    setFormModalVisible(true);
  };

  const handleDeleteProduction = async (id) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Xóa kế hoạch sản xuất thành công!");
      fetchProductions();
    } catch (error) {
      message.error("Xóa thất bại!");
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedProduction(record);
    setDetailModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (isEditMode) {
        message.success("Cập nhật kế hoạch sản xuất thành công!");
      } else {
        message.success("Thêm kế hoạch sản xuất thành công!");
      }

      setFormModalVisible(false);
      form.resetFields();
      fetchProductions();
    } catch (error) {
      message.error("Lưu thất bại!");
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang sản xuất":
        return "processing";
      case "Hoàn thành":
        return "success";
      case "Tạm dừng":
        return "warning";
      case "Hủy":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Đang sản xuất":
        return <ClockCircleOutlined />;
      case "Hoàn thành":
        return <CheckCircleOutlined />;
      case "Tạm dừng":
        return <WarningOutlined />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: "Mã kế hoạch",
      dataIndex: "id",
      key: "id",
      width: 120,
      fixed: "left",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Dây chuyền",
      dataIndex: "lineName",
      key: "lineName",
      width: 150,
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: 150,
    },
    {
      title: "Ca làm việc",
      dataIndex: "shift",
      key: "shift",
      width: 100,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "SL Kế hoạch",
      dataIndex: "planQuantity",
      key: "planQuantity",
      width: 120,
      align: "right",
      render: (val) => val.toLocaleString(),
    },
    {
      title: "SL Thực tế",
      dataIndex: "actualQuantity",
      key: "actualQuantity",
      width: 120,
      align: "right",
      render: (val, record) => (
        <span
          style={{ color: val >= record.planQuantity ? "#52c41a" : "#1890ff" }}
        >
          {val.toLocaleString()}
        </span>
      ),
    },
    {
      title: "SL Lỗi",
      dataIndex: "defectQuantity",
      key: "defectQuantity",
      width: 100,
      align: "right",
      render: (val) => (
        <span style={{ color: val > 20 ? "#ff4d4f" : "#faad14" }}>
          {val.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Tiến độ",
      dataIndex: "progress",
      key: "progress",
      width: 120,
      render: (val) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              flex: 1,
              height: "8px",
              background: "#f0f0f0",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${val}%`,
                height: "100%",
                background: val === 100 ? "#52c41a" : "#1890ff",
                transition: "width 0.3s",
              }}
            />
          </div>
          <span style={{ fontSize: "12px", fontWeight: 500 }}>{val}%</span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Người giám sát",
      dataIndex: "supervisor",
      key: "supervisor",
      width: 150,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditProduction(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa kế hoạch sản xuất"
            description="Bạn có chắc chắn muốn xóa kế hoạch này?"
            onConfirm={() => handleDeleteProduction(record.id)}
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

  // Calculate statistics
  const stats = {
    total: productions.length,
    inProgress: productions.filter((p) => p.status === "Đang sản xuất").length,
    completed: productions.filter((p) => p.status === "Hoàn thành").length,
    paused: productions.filter((p) => p.status === "Tạm dừng").length,
  };

  return (
    <div className={styles.productionManagement}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng kế hoạch"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Đang sản xuất"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tạm dừng"
              value={stats.paused}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        title={
          <Space>
            <BarChartOutlined />
            <span>Quản lý sản xuất</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProduction}
            >
              Thêm kế hoạch
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchProductions}>
              Làm mới
            </Button>
          </Space>
        }
        bordered={false}
        className={styles.tableCard}
      >
        {/* Filters */}
        <div className={styles.filterSection}>
          <Space size="middle" wrap>
            <Input
              placeholder="Tìm kiếm mã KH, sản phẩm, dây chuyền..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 150 }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="Đang sản xuất">Đang sản xuất</Option>
              <Option value="Hoàn thành">Hoàn thành</Option>
              <Option value="Tạm dừng">Tạm dừng</Option>
              <Option value="Hủy">Hủy</Option>
            </Select>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredProductions}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} kế hoạch`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Chi tiết kế hoạch sản xuất</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              handleEditProduction(selectedProduction);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={800}
      >
        {selectedProduction && (
          <div className={styles.detailContent}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <label>Mã kế hoạch:</label>
                  <span>{selectedProduction.id}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <label>Trạng thái:</label>
                  <Tag
                    icon={getStatusIcon(selectedProduction.status)}
                    color={getStatusColor(selectedProduction.status)}
                  >
                    {selectedProduction.status}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <label>Dây chuyền:</label>
                  <span>{selectedProduction.lineName}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <label>Sản phẩm:</label>
                  <span>{selectedProduction.productName}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <label>Ca làm việc:</label>
                  <Tag color="blue">{selectedProduction.shift}</Tag>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <label>Người giám sát:</label>
                  <span>{selectedProduction.supervisor}</span>
                </div>
              </Col>
              <Col span={8}>
                <div className={styles.detailItem}>
                  <label>SL Kế hoạch:</label>
                  <span style={{ fontWeight: 600 }}>
                    {selectedProduction.planQuantity.toLocaleString()}
                  </span>
                </div>
              </Col>
              <Col span={8}>
                <div className={styles.detailItem}>
                  <label>SL Thực tế:</label>
                  <span style={{ fontWeight: 600, color: "#1890ff" }}>
                    {selectedProduction.actualQuantity.toLocaleString()}
                  </span>
                </div>
              </Col>
              <Col span={8}>
                <div className={styles.detailItem}>
                  <label>SL Lỗi:</label>
                  <span style={{ fontWeight: 600, color: "#ff4d4f" }}>
                    {selectedProduction.defectQuantity.toLocaleString()}
                  </span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <label>Thời gian bắt đầu:</label>
                  <span>{selectedProduction.startDate}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <label>Thời gian kết thúc:</label>
                  <span>{selectedProduction.endDate}</span>
                </div>
              </Col>
              <Col span={24}>
                <div className={styles.detailItem}>
                  <label>Tiến độ:</label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: "12px",
                        background: "#f0f0f0",
                        borderRadius: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${selectedProduction.progress}%`,
                          height: "100%",
                          background:
                            selectedProduction.progress === 100
                              ? "#52c41a"
                              : "#1890ff",
                        }}
                      />
                    </div>
                    <span style={{ fontWeight: 600 }}>
                      {selectedProduction.progress}%
                    </span>
                  </div>
                </div>
              </Col>
              <Col span={24}>
                <div className={styles.detailItem}>
                  <label>Ghi chú:</label>
                  <span>{selectedProduction.note || "-"}</span>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Form Modal (Add/Edit) */}
      <Modal
        title={
          <Space>
            {isEditMode ? <EditOutlined /> : <PlusOutlined />}
            <span>{isEditMode ? "Chỉnh sửa" : "Thêm"} kế hoạch sản xuất</span>
          </Space>
        }
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{
            status: "Đang sản xuất",
          }}
        >
          <Row gutter={16}>
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
                label="Sản phẩm"
                name="productName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ca làm việc"
                name="shift"
                rules={[{ required: true, message: "Vui lòng chọn ca!" }]}
              >
                <Select placeholder="Chọn ca làm việc">
                  <Option value="Ca 1">Ca 1 (08:00 - 16:00)</Option>
                  <Option value="Ca 2">Ca 2 (16:00 - 00:00)</Option>
                  <Option value="Ca 3">Ca 3 (00:00 - 08:00)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Người giám sát"
                name="supervisor"
                rules={[
                  { required: true, message: "Vui lòng nhập người giám sát!" },
                ]}
              >
                <Input placeholder="Nhập tên người giám sát" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="SL Kế hoạch"
                name="planQuantity"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
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
            <Col span={8}>
              <Form.Item label="SL Thực tế" name="actualQuantity">
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
            <Col span={8}>
              <Form.Item label="SL Lỗi" name="defectQuantity">
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
                label="Thời gian bắt đầu"
                name="startDate"
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
            <Col span={12}>
              <Form.Item
                label="Thời gian kết thúc"
                name="endDate"
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
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="Đang sản xuất">Đang sản xuất</Option>
                  <Option value="Hoàn thành">Hoàn thành</Option>
                  <Option value="Tạm dừng">Tạm dừng</Option>
                  <Option value="Hủy">Hủy</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tiến độ (%)" name="progress">
                <InputNumber
                  placeholder="0"
                  style={{ width: "100%" }}
                  min={0}
                  max={100}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Ghi chú" name="note">
                <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setFormModalVisible(false);
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
    </div>
  );
};

export default ProductionManagement;
