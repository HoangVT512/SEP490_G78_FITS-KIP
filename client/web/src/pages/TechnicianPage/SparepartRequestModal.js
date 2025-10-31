import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  Spin,
  Space,
  Row,
  Col,
  Card,
  Table,
  Tag,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { sparePartService } from "../../services/sparePartService";
import { replacementHistoryService } from "../../services/replacementHistoryService";
import notificationService from "../../services/notificationService";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";

const SparepartRequestModal = ({ incident, open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [spareParts, setSpareParts] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);
  const [sparePartOptions, setSparePartOptions] = useState([]);
  const { user: currentUser } = useAuth();

  // Fetch spare parts when modal opens
  useEffect(() => {
    if (open) {
      fetchSpareParts();
    }
  }, [open]);

  const fetchSpareParts = async () => {
    try {
      setLoading(true);
      const res = await sparePartService.getAll();
      const data = Array.isArray(res) ? res : res?.data || [];
      setSpareParts(data);
      setSparePartOptions(
        data.map((item) => ({
          label: `${item.partNumber} - ${item.partName}`,
          value: item.partId || item.id,
          partNumber: item.partNumber,
          partName: item.partName,
          quantity: item.quantity,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch spare parts", err);
      message.error("Không thể tải danh sách phụ tùng");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = () => {
    const partId = form.getFieldValue("partId");
    const quantity = form.getFieldValue("quantity");

    if (!partId || !quantity) {
      message.warning("Vui lòng chọn phụ tùng và số lượng");
      return;
    }

    const selectedPart = sparePartOptions.find((p) => p.value === partId);
    if (!selectedPart) {
      message.error("Phụ tùng không tồn tại");
      return;
    }

    // Check if part already exists in selected list
    if (selectedParts.some((p) => p.partId === partId)) {
      message.warning("Phụ tùng này đã được thêm");
      return;
    }

    setSelectedParts([
      ...selectedParts,
      {
        partId: partId,
        partNumber: selectedPart.partNumber,
        partName: selectedPart.partName,
        quantity: quantity,
        availableQuantity: selectedPart.quantity,
      },
    ]);

    // Reset form
    form.setFieldsValue({
      partId: undefined,
      quantity: undefined,
    });
  };

  const handleRemovePart = (partId) => {
    setSelectedParts(selectedParts.filter((p) => p.partId !== partId));
  };

  const handleSubmit = async () => {
    if (selectedParts.length === 0) {
      message.warning("Vui lòng chọn ít nhất một phụ tùng");
      return;
    }

    try {
      setLoading(true);
      const userId =
        currentUser?.userId || currentUser?.id || currentUser?.userID;

      // Create replacement history records for each part
      const requests = selectedParts.map((part) => ({
        equipmentId: incident?.equipmentId,
        partId: part.partId,
        quantity: part.quantity,
        replacedDate: dayjs().toISOString(),
        replacedBy: userId,
        status: "Chờ duyệt cấp phát", // Tiếng Việt
        remarks: `Yêu cầu từ kỹ thuật viên cho sự cố #${incident?.incidentId}`,
      }));

      // Send all requests
      for (const request of requests) {
        await replacementHistoryService.create(request);
      }

      // Send real-time notification to Technical Managers
      try {
        const notificationMessage = `Kỹ thuật viên ${currentUser?.fullName || currentUser?.username} đã gửi yêu cầu thay thế phụ tùng cho sự cố #${incident?.incidentId || 'N/A'} - Thiết bị: ${incident?.equipmentName || 'N/A'} (${incident?.equipmentCode || ''}). Tổng số: ${selectedParts.length} loại phụ tùng.`;

        await notificationService.sendToTechnicalManagers({
          message: notificationMessage,
          type: "sparePartRequest",
          data: {
            incidentId: incident?.incidentId,
            equipmentId: incident?.equipmentId,
            equipmentName: incident?.equipmentName,
            equipmentCode: incident?.equipmentCode,
            technicianId: userId,
            technicianName: currentUser?.fullName || currentUser?.username,
            requestedParts: selectedParts.map(part => ({
              partId: part.partId,
              partNumber: part.partNumber,
              partName: part.partName,
              quantity: part.quantity,
              availableQuantity: part.availableQuantity,
            })),
            totalItems: selectedParts.length,
            requestDate: dayjs().toISOString(),
          },
        });
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
        // Don't fail the whole operation if notification fails
      }

      message.success(
        `Đã gửi yêu cầu phụ tùng (${selectedParts.length} mục). Chờ duyệt cấp phát...`
      );
      setSelectedParts([]);
      form.resetFields();
      onClose();
      onSuccess && onSuccess();
    } catch (err) {
      console.error("Failed to submit spare part request", err);
      message.error("Gửi yêu cầu thất bại: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 120,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: 200,
    },
    {
      title: "Số lượng yêu cầu",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      align: "center",
    },
    {
      title: "Tồn kho",
      dataIndex: "availableQuantity",
      key: "availableQuantity",
      width: 120,
      align: "center",
      render: (val) => <Tag color={val > 0 ? "green" : "red"}>{val}</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemovePart(record.partId)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="Yêu cầu phụ tùng"
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Gửi yêu cầu
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {/* Incident info */}
          <Card size="small">
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <strong>Sự cố:</strong> INC-
                  {String(incident?.incidentId || 0).padStart(3, "0")}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Thiết bị:</strong> {incident?.equipmentCode} -{" "}
                  {incident?.equipmentName}
                </div>
              </Col>
            </Row>
          </Card>

          {/* Form to add parts */}
          <Card title="Thêm phụ tùng" size="small">
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => {
                handleAddPart();
              }}
            >
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item
                    name="partId"
                    label="Chọn phụ tùng"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn phụ tùng",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Tìm và chọn phụ tùng"
                      showSearch
                      optionFilterProp="label"
                      options={sparePartOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="quantity"
                    label="Số lượng"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số lượng",
                      },
                      {
                        type: "number",
                        min: 1,
                        message: "Số lượng phải lớn hơn 0",
                      },
                    ]}
                  >
                    <InputNumber min={1} placeholder="VD: 2" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  htmlType="submit"
                  block
                >
                  Thêm phụ tùng
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Selected parts table */}
          {selectedParts.length > 0 && (
            <Card title="Danh sách phụ tùng yêu cầu" size="small">
              <Table
                columns={columns}
                dataSource={selectedParts}
                rowKey="partId"
                pagination={false}
                size="small"
              />
            </Card>
          )}

          {selectedParts.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#999",
              }}
            >
              Chưa thêm phụ tùng nào
            </div>
          )}
        </Space>
      </Spin>
    </Modal>
  );
};

export default SparepartRequestModal;
