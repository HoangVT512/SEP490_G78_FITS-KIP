import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  Table,
  Modal,
  Form,
  Input,
  message,
  Empty,
  Tag,
  Descriptions,
} from "antd";
import {
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import replacementHistoryService from "../../services/replacementHistoryService";

const KtvReturnConfirmPage = () => {
  const [pendingReturns, setPendingReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [form] = Form.useForm();

  // Fetch pending returns
  const fetchPendingReturns = async () => {
    try {
      setLoading(true);
      const data = await replacementHistoryService.getByStatus("Chờ trả lại");
      console.log("Pending returns:", data);
      setPendingReturns(data || []);
    } catch (error) {
      console.error("Error fetching pending returns:", error);
      message.error("Không thể tải danh sách trả lại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReturns();
  }, []);

  // Handle confirm delivery to warehouse
  const handleConfirmDelivery = (record) => {
    setSelectedReturn(record);
    form.resetFields();
    setConfirmModalVisible(true);
  };

  // Submit confirmation
  const handleSubmitConfirmation = async (values) => {
    if (!selectedReturn) return;

    try {
      setLoading(true);

      // Update status to "Đã giao kho" (Handed to warehouse)
      const updatePayload = {
        Status: "Đã giao kho",
        Remarks: values.deliveryRemarks || "",
      };

      await replacementHistoryService.recordActualUsage(
        selectedReturn.replacementID || selectedReturn.ReplacementID,
        updatePayload
      );

      message.success(
        `Đã xác nhận trả lại ${
          selectedReturn.quantityToReturn || selectedReturn.QuantityToReturn
        } chiếc ${selectedReturn.partName || selectedReturn.PartName}`
      );

      setConfirmModalVisible(false);
      form.resetFields();
      fetchPendingReturns();
    } catch (error) {
      console.error("Error confirming delivery:", error);
      message.error("Không thể xác nhận trả lại");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã Sửa Chữa",
      dataIndex: ["replacementID", "ReplacementID"],
      key: "replacementID",
      width: 100,
      render: (_, record) =>
        record.replacementID || record.ReplacementID || "N/A",
    },
    {
      title: "Linh Kiện",
      dataIndex: ["partName", "PartName"],
      key: "partName",
      width: 150,
      render: (_, record) => record.partName || record.PartName || "N/A",
    },
    {
      title: "Thiết Bị",
      dataIndex: ["equipmentName", "EquipmentName"],
      key: "equipmentName",
      width: 150,
      render: (_, record) =>
        record.equipmentName || record.EquipmentName || "N/A",
    },
    {
      title: "Số Lượng Thừa",
      dataIndex: ["quantityToReturn", "QuantityToReturn"],
      key: "quantityToReturn",
      width: 100,
      render: (qty) => <strong>{qty || 0}</strong>,
    },
    {
      title: "Ngày Ghi Nhận",
      dataIndex: ["createdDate", "CreatedDate"],
      key: "createdDate",
      width: 130,
      render: (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("vi-VN");
      },
    },
    {
      title: "Trạng Thái",
      dataIndex: ["status", "Status"],
      key: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          "Chờ trả lại": { color: "orange", label: "Chờ trả lại" },
          "Đã giao kho": { color: "blue", label: "Đã giao kho" },
          "Đã trả": { color: "green", label: "Đã trả" },
        };
        const config = statusConfig[status] || {
          color: "default",
          label: status,
        };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Hành Động",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleConfirmDelivery(record)}
            loading={loading}
          >
            Xác nhận đã giao
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Xác Nhận Trả Lại Linh Kiện Thừa"
      extra={
        <Space>
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={fetchPendingReturns}
            loading={loading}
          >
            Làm Tươi
          </Button>
        </Space>
      }
    >
      {pendingReturns.length === 0 ? (
        <Empty
          description="Không có linh kiện nào cần trả lại"
          style={{ marginTop: "40px" }}
        />
      ) : (
        <>
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#fff7e6",
              border: "1px solid #ffc069",
              borderRadius: "4px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ExclamationCircleOutlined
              style={{ color: "#faad14", fontSize: "16px" }}
            />
            <span>
              Bạn có <strong>{pendingReturns.length}</strong> linh kiện cần trả
              lại. Hãy đến kho để giao linh kiện và xác nhận tại đây.
            </span>
          </div>
          <Table
            columns={columns}
            dataSource={pendingReturns}
            rowKey={(record) => record.replacementID || record.ReplacementID}
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        </>
      )}

      {/* Confirmation Modal */}
      <Modal
        title="Xác Nhận Đã Giao Linh Kiện Cho Kho"
        open={confirmModalVisible}
        onCancel={() => {
          setConfirmModalVisible(false);
          setSelectedReturn(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        centered
      >
        {selectedReturn && (
          <>
            <Descriptions
              column={2}
              bordered
              size="small"
              style={{ marginBottom: "20px" }}
            >
              <Descriptions.Item label="Mã Sửa Chữa" span={1}>
                <strong>
                  {selectedReturn.replacementID || selectedReturn.ReplacementID}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Linh Kiện" span={1}>
                <strong>
                  {selectedReturn.partName || selectedReturn.PartName}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Thiết Bị" span={2}>
                {selectedReturn.equipmentName || selectedReturn.EquipmentName}
              </Descriptions.Item>
              <Descriptions.Item label="Số Lượng Thừa" span={1}>
                <strong style={{ color: "#faad14", fontSize: "16px" }}>
                  {selectedReturn.quantityToReturn ||
                    selectedReturn.QuantityToReturn}{" "}
                  chiếc
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái" span={1}>
                <Tag color="orange">Chờ trả lại</Tag>
              </Descriptions.Item>
            </Descriptions>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f0f5ff",
                border: "1px solid #91d5ff",
                borderRadius: "4px",
                marginBottom: "20px",
              }}
            >
              <p style={{ marginBottom: "8px", fontWeight: 600 }}>
                ℹ️ Hướng dẫn:
              </p>
              <ol style={{ marginBottom: 0, paddingLeft: "20px" }}>
                <li>Hãy đảm bảo bạn đã giao linh kiện cho nhân viên kho</li>
                <li>Nhân viên kho sẽ xác nhận số lượng đã nhận</li>
                <li>Sau đó hệ thống sẽ cập nhật trạng thái thành "Đã trả"</li>
              </ol>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitConfirmation}
            >
              <Form.Item
                name="deliveryRemarks"
                label="Ghi Chú (tuỳ chọn)"
                rules={[{ max: 500, message: "Ghi chú không quá 500 ký tự" }]}
              >
                <Input.TextArea
                  placeholder="VD: Giao cho anh Minh lúc 14h30, linh kiện còn nguyên vẹn..."
                  rows={4}
                />
              </Form.Item>

              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button
                  onClick={() => {
                    setConfirmModalVisible(false);
                    setSelectedReturn(null);
                    form.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<CheckCircleOutlined />}
                  loading={loading}
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                >
                  Xác Nhận Đã Giao
                </Button>
              </Space>
            </Form>
          </>
        )}
      </Modal>
    </Card>
  );
};

export default KtvReturnConfirmPage;
