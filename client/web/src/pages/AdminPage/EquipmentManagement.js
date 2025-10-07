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
} from "@ant-design/icons";
import { ArchiveIcon } from "../../assets/icons";
import Layout from "../../components/Layout/Layout";
import { equipmentService } from "../../services/equipmentService";
import { stageService } from "../../services/stageService";
import dayjs from "dayjs";

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
  const [form] = Form.useForm();

  const [showArchive, setShowArchive] = useState(() => {
    const saved = localStorage.getItem("equipmentArchiveView");
    return saved === "true";
  });

  useEffect(() => {
    loadEquipments();
    loadStages();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "equipmentArchiveView",
      showArchive ? "true" : "false"
    );
  }, [showArchive]);

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
      const data = await stageService.getStages();
      // Đảm bảo data là array
      setStages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading stages:", error);
      message.error("Không thể tải danh sách công đoạn");
      setStages([]); // Set về empty array nếu có lỗi
    }
  };

  const handleDelete = async (equipmentId) => {
    try {
      setLoading(true);
      await equipmentService.deleteEquipment(equipmentId);
      message.success("Đã xóa thiết bị thành công");
      loadEquipments();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      message.error(
        error.message || "Không thể xóa thiết bị. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
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
          idCode: equipment.idCode,
          issue: equipment.issue,
        });
        setIsModalVisible(true);
        break;
      case "delete":
        Modal.confirm({
          title: "Xác nhận xóa thiết bị",
          content: `Bạn có chắc chắn muốn xóa thiết bị "${equipment.equipmentName}"?`,
          okText: "Xóa",
          cancelText: "Hủy",
          okType: "danger",
          okButtonProps: {
            style: {
              backgroundColor: "#334766",
              borderColor: "#334766",
              color: "#fff",
            },
          },
          onOk: () => handleDelete(equipment.equipmentId),
        });
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

    items.push({
      type: "divider",
    });

    items.push({
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Xóa",
      danger: true,
    });

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
          record.origin?.toLowerCase().includes(value.toLowerCase()) ||
          record.idCode?.toLowerCase().includes(value.toLowerCase())
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
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Không hoạt động", value: false },
      ],
      filteredValue:
        statusFilter === "all" ? null : [statusFilter === "active"],
      onFilter: (value, record) => record.isActive === value,
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
          <Button type="text" icon={<DownOutlined />}>
            Thao tác
          </Button>
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
        footer={null}
        width={700}
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
                label="Mã thiết bị"
                name="equipmentCode"
                rules={[
                  { required: true, message: "Vui lòng nhập mã thiết bị" },
                ]}
              >
                <Input placeholder="Nhập mã thiết bị" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tên thiết bị"
                name="equipmentName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên thiết bị" },
                ]}
              >
                <Input placeholder="Nhập tên thiết bị" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Xuất xứ" name="origin">
                <Input placeholder="Nhập xuất xứ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Năm sản xuất" name="yom">
                <Input type="number" placeholder="Nhập năm sản xuất" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ngày đưa vào sử dụng" name="dateUse">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Công đoạn" name="stageId">
                <Select
                  placeholder="Chọn công đoạn"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {Array.isArray(stages) &&
                    stages.map((stage) => (
                      <Select.Option key={stage.stageId} value={stage.stageId}>
                        {stage.stageName}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mã định danh" name="idCode">
            <Input placeholder="Nhập mã định danh" />
          </Form.Item>

          <Form.Item label="Vấn đề/Ghi chú" name="issue">
            <TextArea
              rows={4}
              placeholder="Nhập vấn đề hoặc ghi chú về thiết bị"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  backgroundColor: "#334766",
                  borderColor: "#334766",
                }}
              >
                {editingEquipment ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
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
          <Button key="close" onClick={handleViewCancel}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {viewingEquipment && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã thiết bị" span={1}>
              <Text strong>{viewingEquipment.equipmentCode || "N/A"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên thiết bị" span={1}>
              <Text strong>{viewingEquipment.equipmentName || "N/A"}</Text>
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
              {viewingEquipment.origin || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Năm sản xuất" span={1}>
              {viewingEquipment.yom || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đưa vào sử dụng" span={1}>
              {viewingEquipment.dateUse
                ? dayjs(viewingEquipment.dateUse).format("DD/MM/YYYY")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Mã định danh" span={1}>
              {viewingEquipment.idCode || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Mã QR" span={2}>
              {viewingEquipment.qrcode ? (
                <Space>
                  <QrcodeOutlined />
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
        )}
      </Modal>
    </Layout>
  );
};

export default EquipmentManagement;
