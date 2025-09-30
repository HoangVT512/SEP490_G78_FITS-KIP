import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Select,
  DatePicker,
  Row,
  Col,
  Typography,
  Tooltip,
  Badge,
  Divider,
  Switch,
} from "antd";
import QRCode from "qrcode";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ToolOutlined,
  QrcodeOutlined,
  ExportOutlined,
  ImportOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import dayjs from "dayjs";
import "../../styles/pages/AdminManagement.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EquipmentManagement = ({ showHeader = true }) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [workingFilter, setWorkingFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [lineFilter, setLineFilter] = useState("all");
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [qrCodePreview, setQrCodePreview] = useState(null);

  // Mock data for stages and lines
  const [stages, setStages] = useState([
    { stageId: 1, stageName: "Giai đoạn 1 - Chuẩn bị" },
    { stageId: 2, stageName: "Giai đoạn 2 - Sản xuất" },
    { stageId: 3, stageName: "Giai đoạn 3 - Kiểm tra" },
    { stageId: 4, stageName: "Giai đoạn 4 - Đóng gói" },
  ]);

  const [lines, setLines] = useState([
    { lineId: 1, lineName: "Dây chuyền A" },
    { lineId: 2, lineName: "Dây chuyền B" },
    { lineId: 3, lineName: "Dây chuyền C" },
    { lineId: 4, lineName: "Dây chuyền D" },
  ]);

  // Mock equipment data
  const mockEquipment = [
    {
      equipmentId: 1,
      equipmentCode: "EQ001",
      equipmentName: "Máy cắt CNC",
      dateUse: "2020-01-15",
      origin: "Đức",
      yom: 2019,
      qrCode: "QR001_CNC_MACHINE",
      stageId: 2,
      issue: null,
      idCode: "ID_CNC_001",
      lineId: 1,
      isActive: true,
      isWorking: true,
    },
    {
      equipmentId: 2,
      equipmentCode: "EQ002",
      equipmentName: "Máy hàn tự động",
      dateUse: "2021-03-10",
      origin: "Nhật Bản",
      yom: 2020,
      qrCode: "QR002_WELDING_AUTO",
      stageId: 2,
      issue: "Cần bảo trì định kỳ",
      idCode: "ID_WELD_002",
      lineId: 2,
      isActive: true,
      isWorking: false,
    },
    {
      equipmentId: 3,
      equipmentCode: "EQ003",
      equipmentName: "Máy kiểm tra chất lượng",
      dateUse: "2022-06-01",
      origin: "Hàn Quốc",
      yom: 2021,
      qrCode: "QR003_QUALITY_CHECK",
      stageId: 3,
      issue: null,
      idCode: "ID_QC_003",
      lineId: 3,
      isActive: true,
      isWorking: true,
    },
    {
      equipmentId: 4,
      equipmentCode: "EQ004",
      equipmentName: "Máy đóng gói tự động",
      dateUse: "2023-02-20",
      origin: "Trung Quốc",
      yom: 2022,
      qrCode: "QR004_PACKING_AUTO",
      stageId: 4,
      issue: "Lỗi cảm biến",
      idCode: "ID_PACK_004",
      lineId: 4,
      isActive: false,
      isWorking: false,
    },
    {
      equipmentId: 5,
      equipmentCode: "EQ005",
      equipmentName: "Máy phay CNC 5 trục",
      dateUse: "2023-08-15",
      origin: "Thụy Sĩ",
      yom: 2023,
      qrCode: "QR005_MILL_5AXIS",
      stageId: 2,
      issue: null,
      idCode: "ID_MILL_005",
      lineId: 1,
      isActive: true,
      isWorking: true,
    },
  ];

  useEffect(() => {
    fetchEquipment();
    // Generate QR codes for demo equipment
    generateDemoQRCodes();
  }, []);

  const generateDemoQRCodes = async () => {
    try {
      const updatedEquipment = await Promise.all(
        mockEquipment.map(async (item) => {
          if (item.idCode) {
            try {
              const qrCodeDataURL = await QRCode.toDataURL(item.idCode, {
                width: 120,
                height: 120,
                margin: 1,
                color: {
                  dark: '#000000',
                  light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
              });
              return { ...item, qrCode: qrCodeDataURL };
            } catch (error) {
              console.error(`Error generating QR for ${item.idCode}:`, error);
              return item;
            }
          }
          return item;
        })
      );
      
      // Update the mock data with real QR codes
      mockEquipment.splice(0, mockEquipment.length, ...updatedEquipment);
    } catch (error) {
      console.error('Error generating demo QR codes:', error);
    }
  };

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setEquipment(mockEquipment);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      message.error("Không thể tải danh sách thiết bị");
      setLoading(false);
    }
  };

  const handleAddEquipment = () => {
    setEditingEquipment(null);
    form.resetFields();
    setQrCodePreview(null);
    setModalVisible(true);
  };

  const handleEditEquipment = (record) => {
    setEditingEquipment(record);
    form.setFieldsValue({
      ...record,
      dateUse: record.dateUse ? dayjs(record.dateUse) : null,
    });
    // Set QR code preview if it exists
    if (record.qrCode && record.qrCode.startsWith('data:image')) {
      setQrCodePreview(record.qrCode);
    } else {
      setQrCodePreview(null);
    }
    setModalVisible(true);
  };

  const handleDeleteEquipment = async (equipmentId) => {
    try {
      // TODO: Replace with actual API call
      setEquipment(equipment.filter(item => item.equipmentId !== equipmentId));
      message.success("Xóa thiết bị thành công");
    } catch (error) {
      console.error("Error deleting equipment:", error);
      message.error("Không thể xóa thiết bị");
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        dateUse: values.dateUse ? values.dateUse.format("YYYY-MM-DD") : null,
      };

      if (editingEquipment) {
        // Update equipment
        const updatedEquipment = equipment.map(item =>
          item.equipmentId === editingEquipment.equipmentId
            ? { ...item, ...formattedValues }
            : item
        );
        setEquipment(updatedEquipment);
        message.success("Cập nhật thiết bị thành công");
      } else {
        // Add new equipment
        const newEquipment = {
          equipmentId: equipment.length + 1,
          ...formattedValues,
          isActive: true,
          isWorking: true,
        };
        setEquipment([...equipment, newEquipment]);
        message.success("Thêm thiết bị thành công");
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error saving equipment:", error);
    }
  };

  const handleToggleStatus = async (equipmentId, field, value) => {
    try {
      const updatedEquipment = equipment.map(item =>
        item.equipmentId === equipmentId
          ? { ...item, [field]: value }
          : item
      );
      setEquipment(updatedEquipment);
      message.success(`Cập nhật trạng thái thiết bị thành công`);
    } catch (error) {
      console.error("Error updating equipment status:", error);
      message.error("Không thể cập nhật trạng thái thiết bị");
    }
  };

  const generateQRCode = async (idCode) => {
    try {
      if (!idCode) {
        message.warning("Vui lòng nhập mã định danh trước!");
        return;
      }

      // Generate real QR code using the qrcode library with IdCode as content
      const qrCodeDataURL = await QRCode.toDataURL(idCode, {
        width: 120,
        height: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      form.setFieldsValue({ qrCode: qrCodeDataURL });
      setQrCodePreview(qrCodeDataURL);
      message.success("Tạo mã QR thành công");
    } catch (error) {
      console.error('Error generating QR code:', error);
      message.error("Lỗi khi tạo mã QR");
    }
  };

  // Filter equipment
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = 
      item.equipmentName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.equipmentCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.origin?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && item.isActive) ||
      (statusFilter === "inactive" && !item.isActive);
    
    const matchesWorking = workingFilter === "all" ||
      (workingFilter === "working" && item.isWorking) ||
      (workingFilter === "not-working" && !item.isWorking);
    
    const matchesStage = stageFilter === "all" || item.stageId === parseInt(stageFilter);
    const matchesLine = lineFilter === "all" || item.lineId === parseInt(lineFilter);

    return matchesSearch && matchesStatus && matchesWorking && matchesStage && matchesLine;
  });

  const getStatusTag = (isActive, isWorking, issue) => {
    if (!isActive) {
      return <Tag color="red" icon={<CloseCircleOutlined />}>Ngừng hoạt động</Tag>;
    }
    if (!isWorking) {
      return <Tag color="orange" icon={<WarningOutlined />}>Đang sửa chữa</Tag>;
    }
    if (issue) {
      return <Tag color="yellow" icon={<WarningOutlined />}>Có vấn đề</Tag>;
    }
    return <Tag color="green" icon={<CheckCircleOutlined />}>Hoạt động tốt</Tag>;
  };

  const getStageName = (stageId) => {
    const stage = stages.find(s => s.stageId === stageId);
    return stage ? stage.stageName : "Chưa phân công";
  };

  const getLineName = (lineId) => {
    const line = lines.find(l => l.lineId === lineId);
    return line ? line.lineName : "Chưa phân công";
  };

  const columns = [
    {
      title: "Mã thiết bị",
      dataIndex: "equipmentCode",
      key: "equipmentCode",
      width: 120,
      fixed: "left",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Xuất xứ",
      dataIndex: "origin",
      key: "origin",
      width: 120,
    },
    {
      title: "Năm SX",
      dataIndex: "yom",
      key: "yom",
      width: 100,
      align: "center",
    },
    {
      title: "Ngày đưa vào sử dụng",
      dataIndex: "dateUse",
      key: "dateUse",
      width: 140,
      render: (text) => text ? dayjs(text).format("DD/MM/YYYY") : "Chưa xác định",
    },
    {
      title: "Giai đoạn",
      dataIndex: "stageId",
      key: "stageId",
      width: 150,
      render: (stageId) => getStageName(stageId),
    },
    {
      title: "Dây chuyền",
      dataIndex: "lineId",
      key: "lineId",
      width: 130,
      render: (lineId) => getLineName(lineId),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_, record) => getStatusTag(record.isActive, record.isWorking, record.issue),
    },
    {
      title: "Vấn đề",
      dataIndex: "issue",
      key: "issue",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => text ? (
        <Tooltip placement="topLeft" title={text}>
          <Text type="warning">{text}</Text>
        </Tooltip>
      ) : (
        <Text type="secondary">Không có</Text>
      ),
    },
    {
      title: "Hoạt động",
      key: "isActive",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleToggleStatus(record.equipmentId, "isActive", checked)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: "Đang làm việc",
      key: "isWorking",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Switch
          checked={record.isWorking}
          onChange={(checked) => handleToggleStatus(record.equipmentId, "isWorking", checked)}
          checkedChildren="Có"
          unCheckedChildren="Không"
          disabled={!record.isActive}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditEquipment(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa thiết bị"
            description="Bạn có chắc chắn muốn xóa thiết bị này?"
            onConfirm={() => handleDeleteEquipment(record.equipmentId)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const content = (
    <div className="admin-management-container">
      <div className="admin-management-header">
        <Title level={3} className="admin-management-title">
          <ToolOutlined className="admin-management-title-icon" />
          Quản lý thiết bị
        </Title>
        <Text type="secondary">
          Quản lý thông tin thiết bị, máy móc trong hệ thống sản xuất
        </Text>
      </div>

      {/* Filters */}
      <Card className="admin-management-filter-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm thiết bị..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Đang hoạt động</Option>
              <Option value="inactive">Ngừng hoạt động</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Tình trạng"
              value={workingFilter}
              onChange={setWorkingFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả tình trạng</Option>
              <Option value="working">Đang làm việc</Option>
              <Option value="not-working">Không làm việc</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Giai đoạn"
              value={stageFilter}
              onChange={setStageFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả giai đoạn</Option>
              {stages.map(stage => (
                <Option key={stage.stageId} value={stage.stageId}>
                  {stage.stageName}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Dây chuyền"
              value={lineFilter}
              onChange={setLineFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả dây chuyền</Option>
              {lines.map(line => (
                <Option key={line.lineId} value={line.lineId}>
                  {line.lineName}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Action buttons */}
      <Card className="admin-management-actions-card">
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddEquipment}
          >
            Thêm thiết bị
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchEquipment}>
            Làm mới
          </Button>
          <Button icon={<ExportOutlined />}>
            Xuất Excel
          </Button>
          <Button icon={<ImportOutlined />}>
            Nhập Excel
          </Button>
        </Space>
        <div className="admin-management-summary">
          <Space split={<Divider type="vertical" />}>
            <Text>
              <Badge status="success" />
              Tổng: <strong>{filteredEquipment.length}</strong>
            </Text>
            <Text>
              <Badge status="processing" />
              Hoạt động: <strong>{filteredEquipment.filter(e => e.isActive).length}</strong>
            </Text>
            <Text>
              <Badge status="warning" />
              Có vấn đề: <strong>{filteredEquipment.filter(e => e.issue).length}</strong>
            </Text>
          </Space>
        </div>
      </Card>

      {/* Equipment table */}
      <Card className="admin-management-table-card">
        <Table
          columns={columns}
          dataSource={filteredEquipment}
          rowKey="equipmentId"
          loading={loading}
          scroll={{ x: 1500, y: 500 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            onSelectAll: (selected, selectedRows, changeRows) => {
              if (selected) {
                setSelectedRowKeys(filteredEquipment.map(item => item.equipmentId));
              } else {
                setSelectedRowKeys([]);
              }
            },
          }}
          pagination={{
            total: filteredEquipment.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} thiết bị`,
          }}
          size="middle"
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingEquipment ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={() => {
          setModalVisible(false);
          setQrCodePreview(null);
          form.resetFields();
        }}
        width={800}
        okText={editingEquipment ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
            {/* Disable editing for equipment code */}
            <Form.Item
              name="equipmentCode"
              label="Mã thiết bị"
              rules={[
                { required: true, message: "Vui lòng nhập mã thiết bị!" },
                { max: 50, message: "Mã thiết bị không được quá 50 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập mã thiết bị (VD: EQ001)" disabled={editingEquipment} />
            </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="equipmentName"
                label="Tên thiết bị"
                rules={[
                  { required: true, message: "Vui lòng nhập tên thiết bị!" },
                  { max: 255, message: "Tên thiết bị không được quá 255 ký tự!" },
                ]}
              >
                <Input placeholder="Nhập tên thiết bị" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="origin"
                label="Xuất xứ"
                rules={[
                  { max: 150, message: "Xuất xứ không được quá 150 ký tự!" },
                ]}
              >
                <Input placeholder="Nhập xuất xứ (VD: Đức, Nhật Bản)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="yom"
                label="Năm sản xuất"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const year = parseInt(value);
                      if (isNaN(year)) {
                        return Promise.reject(new Error('Năm sản xuất phải là số!'));
                      }
                      if (year < 1900 || year > new Date().getFullYear()) {
                        return Promise.reject(new Error('Năm sản xuất không hợp lệ!'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input type="number" placeholder="Nhập năm sản xuất" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateUse"
                label="Ngày đưa vào sử dụng"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày đưa vào sử dụng"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="idCode"
                label="Mã định danh"
                rules={[
                  { max: 250, message: "Mã định danh không được quá 250 ký tự!" },
                ]}
              >
                <Input placeholder="Nhập mã định danh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stageId"
                label="Giai đoạn"
                rules={[
                  { required: true, message: "Vui lòng chọn giai đoạn!" },
                ]}
              >
                <Select placeholder="Chọn giai đoạn">
                  {stages.map(stage => (
                    <Option key={stage.stageId} value={stage.stageId}>
                      {stage.stageName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lineId"
                label="Dây chuyền"
                rules={[
                  { required: true, message: "Vui lòng chọn dây chuyền!" },
                ]}
              >
                <Select placeholder="Chọn dây chuyền">
                  {lines.map(line => (
                    <Option key={line.lineId} value={line.lineId}>
                      {line.lineName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={20}>
              <Form.Item
                name="qrCode"
                label="Mã QR"
              >
                <Input placeholder="Mã QR sẽ được tạo tự động" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label=" ">
                <Button
                  icon={<QrcodeOutlined />}
                  onClick={() => {
                    const idCode = form.getFieldValue("idCode");
                    if (idCode) {
                      generateQRCode(idCode);
                    } else {
                      message.warning("Vui lòng nhập mã định danh trước!");
                    }
                  }}
                >
                  Tạo QR
                </Button>
              </Form.Item>
            </Col>
          </Row>

          {/* QR Code Preview */}
          {qrCodePreview && (
            <Row gutter={16}>
              <Col span={24}>
                <div className="qr-code-preview-container">
                  <Text className="qr-code-preview-title">
                    Ảnh QRCode:
                  </Text>
                  <div className="qr-code-preview-image-container">
                    <img 
                      src={qrCodePreview} 
                      alt="QR Code Preview" 
                      className="qr-code-preview-image"
                    />
                  </div>
                </div>
              </Col>
            </Row>
          )}

          <Form.Item
            name="issue"
            label="Vấn đề hiện tại"
          >
            <TextArea
              rows={3}
              placeholder="Mô tả vấn đề hiện tại của thiết bị (nếu có)"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Trạng thái hoạt động"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Ngừng hoạt động"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isWorking"
                label="Đang làm việc"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch
                  checkedChildren="Đang làm việc"
                  unCheckedChildren="Không làm việc"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );

  return showHeader ? <Layout>{content}</Layout> : content;
};

export default EquipmentManagement;