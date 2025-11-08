import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Button,
  Space,
  Tag,
  message,
  Input,
  InputNumber,
  Form,
} from "antd";
import { CheckOutlined } from "@ant-design/icons";
import replacementHistoryService from "../../services/replacementHistoryService";

const ReplacementReturnModal = ({
  visible,
  onClose,
  loading: parentLoading,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [returnList, setReturnList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Load danh sách chờ trả lại
  useEffect(() => {
    if (visible) {
      loadPendingReturns();
    }
  }, [visible]);

  const loadPendingReturns = async () => {
    setLoading(true);
    try {
      const result = await replacementHistoryService.getByStatus("Chờ trả lại");
      console.log("Pending returns:", result);
      setReturnList(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to load pending returns:", err);
      message.error("Không thể tải danh sách chờ trả lại");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReturn = (record) => {
    setSelectedId(record.replacementID || record.ReplacementID);
    form.resetFields();
    form.setFieldsValue({
      ActualReturnQuantity: record.quantityToReturn || record.QuantityToReturn,
    });
    setConfirmVisible(true);
  };

  const handleSubmitReturn = async (values) => {
    if (!selectedId) {
      message.error("Không có bản ghi nào được chọn");
      return;
    }

    setConfirmLoading(true);
    try {
      const payload = {
        ReplacementID: selectedId,
        ActualReturnQuantity:
          values.ActualReturnQuantity ||
          returnList.find(
            (r) => (r.replacementID || r.ReplacementID) === selectedId
          )?.quantityToReturn ||
          returnList.find(
            (r) => (r.replacementID || r.ReplacementID) === selectedId
          )?.QuantityToReturn,
        ReturnRemarks: values.ReturnRemarks,
      };

      console.log("Confirming return:", payload);

      await replacementHistoryService.confirmReturn(selectedId, payload);

      message.success("Đã xác nhận nhận hàng trả lại thành công!");
      setConfirmVisible(false);
      form.resetFields();
      setSelectedId(null);
      await loadPendingReturns();

      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      message.error(err?.message || "Không thể xác nhận nhận hàng");
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = [
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      render: (text) => text || "---",
    },
    {
      title: "Phụ tùng",
      key: "partInfo",
      render: (_, record) =>
        `${record.partNumber || record.PartNumber} - ${
          record.partName || record.PartName
        }`,
    },
    {
      title: "Số lượng thừa",
      dataIndex: "quantityToReturn",
      key: "quantityToReturn",
      dataIndex:
        record.quantityToReturn !== undefined
          ? "quantityToReturn"
          : "QuantityToReturn",
      render: (text) => <strong>{text || 0}</strong>,
    },
    {
      title: "Kỹ thuật viên",
      key: "technician",
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 500 }}>
            {record.replacedByFullName || record.replacedByUserName || "Chưa xác định"}
          </div>
          {record.replacedByEmployeeCode && (
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {record.replacedByEmployeeCode}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (status) => <Tag color="orange">{status || "Chờ trả lại"}</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => handleConfirmReturn(record)}
        >
          Xác nhận
        </Button>
      ),
    },
  ];

  return (
    <>
      <Modal
        title="Xác nhận trả lại linh kiện thừa"
        open={visible}
        onCancel={onClose}
        width={1000}
        footer={[
          <Button
            key="close"
            onClick={onClose}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
        ]}
      >
        <Table
          columns={columns}
          dataSource={returnList}
          loading={loading}
          rowKey={(record) => record.replacementID || record.ReplacementID}
          pagination={{ pageSize: 10 }}
        />
      </Modal>

      {/* Confirm dialog */}
      <Modal
        title="Xác nhận nhận hàng trả lại"
        open={confirmVisible}
        onOk={() => form.submit()}
        onCancel={() => setConfirmVisible(false)}
        confirmLoading={confirmLoading}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitReturn}>
          <Form.Item
            label="Số lượng nhận được"
            name="ActualReturnQuantity"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              { type: "number", min: 1, message: "Số lượng phải > 0" },
            ]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Ghi chú (tùy chọn)" name="ReturnRemarks">
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú về quá trình trả hàng"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ReplacementReturnModal;
