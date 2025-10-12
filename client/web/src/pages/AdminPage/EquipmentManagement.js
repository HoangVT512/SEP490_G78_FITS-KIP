import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Row,
  Col,
  Typography,
  Badge,
  Dropdown,
  message,
  Tooltip,
  Descriptions,
  Select,
  DatePicker,
  Tag,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ToolOutlined,
  DownOutlined,
  ReloadOutlined,
  QrcodeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { ArchiveIcon } from "../../assets/icons";
import Layout from "../../components/Layout/Layout";
import { equipmentService } from "../../services/equipmentService";
import { stageService } from "../../services/stageService";
import dayjs from "dayjs";
import QRCode from "qrcode";

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const EquipmentManagement = ({ showHeader = true }) => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [viewingEquipment, setViewingEquipment] = useState(null);
  const [stages, setStages] = useState([]);
  const [stageActive, setStageActive] = useState([]);
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [form] = Form.useForm();

  const [showArchive, setShowArchive] = useState(() => {
    const saved = localStorage.getItem("equipmentArchiveView");
    return saved === "true";
  });

  useEffect(() => {
    loadEquipments();
    loadStages();
    loadActiveStages();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "equipmentArchiveView",
      showArchive ? "true" : "false"
    );
  }, [showArchive]);

  useEffect(() => {
    if (viewingEquipment?.qrcode) {
      QRCode.toDataURL(viewingEquipment.qrcode)
        .then((url) => setQrImageUrl(url))
        .catch((err) => {
          console.error("Error generating QR code:", err);
          setQrImageUrl(null);
        });
    } else {
      setQrImageUrl(null);
    }
  }, [viewingEquipment]);

  const loadEquipments = async () => {
    setLoading(true);
    try {
      const data = await equipmentService.getEquipments();
      setEquipments(data);
    } catch (error) {
      console.error("Error loading equipments:", error);
      message.error("Không thể tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const loadStages = async () => {
    try {
      const response = await stageService.getActiveStages();
      // Đảm bảo data là array
      const data = response.data || response;
      setStages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading stages:", error);
      message.error("Không thể tải danh sách công đoạn");
      setStages([]); // Set về empty array nếu có lỗi
    }
  };

  const loadActiveStages = async () => {
    try {
      const response = await stageService.getActiveStages();
      const data = response.data || response;
      setStageActive(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading active stages:", error);
      message.error("Không thể tải danh sách công đoạn đang hoạt động");
      setStageActive([]); // Set về empty array nếu có lỗi
    }
  };

  const handleAction = async (action, equipment) => {
    switch (action) {
      case "view":
        try {
          setLoading(true);
          const equipmentDetail = await equipmentService.getEquipment(
            equipment.equipmentId
          );
          setViewingEquipment(equipmentDetail);
          setIsViewModalVisible(true);
        } catch (error) {
          console.error("Error loading equipment detail:", error);
          message.error("Không thể tải thông tin chi tiết thiết bị");
        } finally {
          setLoading(false);
        }
        break;
      case "edit":
        setEditingEquipment(equipment);
        form.setFieldsValue({
          equipmentCode: equipment.equipmentCode,
          equipmentName: equipment.equipmentName,
          origin: equipment.origin,
          yom: equipment.yom,
          dateUse: equipment.dateUse ? dayjs(equipment.dateUse) : null,
          stageId: equipment.stageId,
          issue: equipment.issue,
        });
        setIsModalVisible(true);
        break;
      case "activate":
        try {
          setLoading(true);
          await equipmentService.toggleEquipmentStatus(equipment.equipmentId);
          message.success("Đã kích hoạt thiết bị thành công");
          loadEquipments();
        } catch (error) {
          console.error("Error activating equipment:", error);
          message.error("Không thể kích hoạt thiết bị");
        } finally {
          setLoading(false);
        }
        break;
      case "deactivate":
        Modal.confirm({
          title: "Xác nhận vô hiệu hóa thiết bị",
          content: `Bạn có chắc chắn muốn vô hiệu hóa thiết bị "${equipment.equipmentName}"?`,
          okText: "Vô hiệu hóa",
          cancelText: "Hủy",
          okType: "danger",
          okButtonProps: {
            style: {
              backgroundColor: "#334766",
              borderColor: "#334766",
              color: "#fff",
            },
          },
          onOk: async () => {
            try {
              setLoading(true);
              await equipmentService.toggleEquipmentStatus(
                equipment.equipmentId
              );
              message.success("Đã vô hiệu hóa thiết bị thành công");
              loadEquipments();
            } catch (error) {
              console.error("Error deactivating equipment:", error);
              message.error("Không thể vô hiệu hóa thiết bị");
            } finally {
              setLoading(false);
            }
          },
        });
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const equipmentData = {
        ...values,
        dateUse: values.dateUse ? values.dateUse.format("YYYY-MM-DD") : null,
      };

      if (editingEquipment) {
        await equipmentService.updateEquipment(
          editingEquipment.equipmentId,
          equipmentData
        );
        message.success("Cập nhật thiết bị thành công");
      } else {
        await equipmentService.createEquipment(equipmentData);
        message.success("Thêm thiết bị mới thành công");
      }

      setIsModalVisible(false);
      setEditingEquipment(null);
      form.resetFields();
      loadEquipments();
    } catch (error) {
      console.error("Error saving equipment:", error);
      message.error(error.message || "Không thể lưu thông tin thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingEquipment(null);
    form.resetFields();
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setViewingEquipment(null);
  };

  const getActionMenuItems = (equipment) => {
    const items = [
      {
        key: "view",
        icon: <EyeOutlined />,
        label: "Xem chi tiết",
      },
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "Chỉnh sửa",
      },
    ];

    if (equipment.isActive) {
      items.push({
        key: "deactivate",
        icon: <LockOutlined />,
        label: "Vô hiệu hóa",
        danger: true,
      });
    } else {
      items.push({
        key: "activate",
        icon: <UnlockOutlined />,
        label: "Kích hoạt",
      });
    }

    return items;
  };

  const columns = [
    {
      title: "Mã thiết bị",
      dataIndex: "equipmentCode",
      key: "equipmentCode",
      width: 120,
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return (
          record.equipmentCode?.toLowerCase().includes(value.toLowerCase()) ||
          record.equipmentName?.toLowerCase().includes(value.toLowerCase()) ||
          record.origin?.toLowerCase().includes(value.toLowerCase())
        );
      },
      render: (text) => <Text strong>{text || "N/A"}</Text>,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 200,
      render: (text) => <Text>{text || "N/A"}</Text>,
    },
    {
      title: "Công đoạn",
      dataIndex: "stageId",
      key: "stageId",
      width: 150,
      render: (stageId) => {
        const stage = Array.isArray(stages)
          ? stages.find((s) => s.stageId === stageId)
          : null;
        return stage ? (
          <Tag color="blue">{stage.stageName}</Tag>
        ) : (
          <Text type="secondary">Chưa phân công</Text>
        );
      },
    },
    {
      title: "Xuất xứ",
      dataIndex: "origin",
      key: "origin",
      width: 120,
      render: (text) => <Text>{text || "N/A"}</Text>,
    },
    {
      title: "Năm sản xuất",
      dataIndex: "yom",
      key: "yom",
      width: 120,
      align: "center",
      render: (yom) => <Text>{yom || "N/A"}</Text>,
    },
    {
      title: "Ngày đưa vào sử dụng",
      dataIndex: "dateUse",
      key: "dateUse",
      width: 150,
      render: (date) => (
        <Text>{date ? dayjs(date).format("DD/MM/YYYY") : "N/A"}</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      align: "center",
      render: (isActive) => (
        <Badge
          status={isActive ? "success" : "error"}
          text={isActive ? "Hoạt động" : "Không hoạt động"}
        />
      ),
    },
    {
      title: "Vấn đề",
      dataIndex: "issue",
      key: "issue",
      width: 200,
      render: (issue) =>
        issue ? (
          <Tooltip title={issue}>
            <Tag icon={<WarningOutlined />} color="warning">
              Có vấn đề
            </Tag>
          </Tooltip>
        ) : (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Bình thường
          </Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: getActionMenuItems(record),
            onClick: ({ key }) => handleAction(key, record),
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<DownOutlined />}></Button>
        </Dropdown>
      ),
    },
  ];

  const filteredEquipments = equipments.filter((equipment) => {
    const matchesArchive = showArchive
      ? !equipment.isActive
      : equipment.isActive;
    return matchesArchive;
  });

  const stats = {
    total: equipments.length,
    active: equipments.filter((e) => e.isActive).length,
    inactive: equipments.filter((e) => !e.isActive).length,
    hasIssue: equipments.filter((e) => e.issue && e.issue.trim() !== "").length,
  };

  return (
    <Layout showHeader={false} showFooter={false}>
      {showHeader && (
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <ToolOutlined /> Quản lý thiết bị
          </Title>
        </div>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng thiết bị"
              value={stats.total}
              valueStyle={{ color: "#334766" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Không hoạt động"
              value={stats.inactive}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Có vấn đề"
              value={stats.hasIssue}
              valueStyle={{ color: "#faad14" }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm theo mã, tên, xuất xứ..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={6} md={12}>
            <Space style={{ float: "right" }}>
              <Button
                type={showArchive ? "primary" : "dashed"}
                icon={showArchive ? <EyeOutlined /> : <ArchiveIcon />}
                onClick={() => setShowArchive(!showArchive)}
                style={
                  showArchive
                    ? { backgroundColor: "#334766", borderColor: "#334766" }
                    : {}
                }
              >
                {showArchive
                  ? "Hiển thị (Hoạt động)"
                  : "Lưu trữ (Ngừng hoạt động)"}
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingEquipment(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                style={{
                  backgroundColor: "#334766",
                  borderColor: "#334766",
                }}
              >
                Thêm thiết bị
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredEquipments}
          rowKey="equipmentId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} thiết bị`,
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: "Không có dữ liệu thiết bị",
          }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <ToolOutlined />
            {editingEquipment ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}
          </Space>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        width={1400}
        centered
        okText={editingEquipment ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        onOk={() => form.submit()}
        okButtonProps={{
          style: {
            backgroundColor: "#334766",
            borderColor: "#334766",
            height: "40px",
            fontSize: "16px",
            fontWeight: "500",
            minWidth: "120px",
          },
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
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Mã thiết bị
                  </span>
                }
                name="equipmentCode"
                rules={[
                  { required: true, message: "Vui lòng nhập mã thiết bị" },
                ]}
              >
                <Input placeholder="Nhập mã thiết bị" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Tên thiết bị
                  </span>
                }
                name="equipmentName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên thiết bị" },
                ]}
              >
                <Input placeholder="Nhập tên thiết bị" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Xuất xứ
                  </span>
                }
                name="origin"
              >
                <Input placeholder="Nhập xuất xứ" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Năm sản xuất
                  </span>
                }
                name="yom"
              >
                <Input type="number" placeholder="Nhập năm sản xuất" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Ngày đưa vào sử dụng
                  </span>
                }
                name="dateUse"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Công đoạn
                  </span>
                }
                name="stageId"
              >
                <Select
                  placeholder="Chọn công đoạn"
                  loading={stageActive.length === 0}
                  notFoundContent={
                    stageActive.length === 0
                      ? "Đang tải..."
                      : "Không có công đoạn nào"
                  }
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  size="large"
                >
                  {stageActive.map((stage) => (
                    <Option key={stage.stageId} value={stage.stageId}>
                      {stage.stageName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <span style={{ fontWeight: "600", fontSize: "14px" }}>
                Vấn đề/Ghi chú
              </span>
            }
            name="issue"
          >
            <TextArea
              rows={4}
              placeholder="Nhập vấn đề hoặc ghi chú về thiết bị"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <ToolOutlined />
            Chi tiết thiết bị
          </Space>
        }
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setIsViewModalVisible(false);
              handleEdit(viewingEquipment);
            }}
            style={{
              backgroundColor: "#334766",
              borderColor: "#334766",
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Chỉnh sửa
          </Button>,
          <Button
            key="close"
            onClick={handleViewCancel}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
        ]}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "24px",
        }}
        width={1200}
      >
        {viewingEquipment && (
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <Descriptions
            bordered
            column={2}
            size="middle"
            labelStyle={{
              fontWeight: "bold",
              fontSize: "14px",
              backgroundColor: "#fafafa",
              borderRight: "1px solid #d9d9d9",
              padding: "12px 16px",
              minWidth: "160px",
            }}
          >
            <Descriptions.Item label="Mã thiết bị" span={1}>
              <Text>{viewingEquipment.equipmentCode || "N/A"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên thiết bị" span={1}>
              <Text>{viewingEquipment.equipmentName || "N/A"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Công đoạn" span={2}>
              {viewingEquipment.stageId ? (
                <Tag color="blue">
                  {Array.isArray(stages)
                    ? stages.find((s) => s.stageId === viewingEquipment.stageId)
                        ?.stageName || "N/A"
                    : "N/A"}
                </Tag>
              ) : (
                <Text type="secondary">Chưa phân công</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Xuất xứ" span={1}>
              <Text>{viewingEquipment.origin || "N/A"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Năm sản xuất" span={1}>
              <Text>{viewingEquipment.yom || "N/A"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đưa vào sử dụng" span={1}>
              <Text>
                {viewingEquipment.dateUse
                  ? dayjs(viewingEquipment.dateUse).format("DD/MM/YYYY")
                  : "N/A"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mã QR" span={2}>
              {viewingEquipment.qrcode ? (
                <Space direction="vertical">
                  {qrImageUrl && (
                    <img
                      src={qrImageUrl}
                      alt="QR Code"
                      style={{ width: 128, height: 128 }}
                    />
                  )}
                  <Text copyable>{viewingEquipment.qrcode}</Text>
                </Space>
              ) : (
                <Text type="secondary">Chưa tạo</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={2}>
              <Badge
                status={viewingEquipment.isActive ? "success" : "error"}
                text={
                  viewingEquipment.isActive ? "Hoạt động" : "Không hoạt động"
                }
              />
            </Descriptions.Item>
            <Descriptions.Item label="Vấn đề/Ghi chú" span={2}>
              {viewingEquipment.issue ? (
                <Text>{viewingEquipment.issue}</Text>
              ) : (
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Không có vấn đề
                </Tag>
              )}
            </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default EquipmentManagement;
