import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Input,
  Button,
  message,
  Space,
} from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { sparePartService } from "../../services/sparePartService";
import { incidentService } from "../../services/incidentService";
import { replacementHistoryService } from "../../services/replacementHistoryService";
import { useAuth } from "../../contexts/AuthContext";

const { TextArea } = Input;
const ReplacementCreate = ({
  incidentId: propIncidentId = null,
  onSuccess = null,
  onCancel = null,
}) => {
  // ReplacementCreate can be used as a standalone page or embedded in a modal.
  // Props:
  // - incidentId (optional) : if provided, prefill EquipmentId from that incident
  // - onSuccess (optional) : callback when creation succeeds (embedded mode)
  // - onCancel (optional) : callback to close modal (embedded mode)
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      // Load spare parts (non-fatal)
      try {
        const res = await sparePartService.getAll();
        setParts(Array.isArray(res) ? res : res?.data || []);
      } catch (err) {
        console.error("Failed to load spare parts:", err);
        message.error(
          `Không thể tải danh sách phụ tùng: ${err?.message || String(err)}`
        );
      }

      // Load incident info (optional, non-fatal)
      try {
        const incidentId = propIncidentId || searchParams.get("incidentId");
        if (incidentId) {
          const inc = await incidentService.getById(incidentId);
          if (inc) {
            form.setFieldsValue({
              EquipmentId:
                inc.equipmentId || inc.equipment?.equipmentId || null,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load incident info:", err);
        message.error(
          `Không thể tải thông tin sự cố: ${err?.message || String(err)}`
        );
      }

      // default replaced date to now
      try {
        form.setFieldsValue({ ReplacedDate: dayjs() });
      } catch (err) {
        console.error("Failed to set default date:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [propIncidentId, searchParams]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        EquipmentId: values.EquipmentId || null,
        PartId: values.PartId,
        Quantity: values.Quantity,
        ReplacedDate: values.ReplacedDate
          ? values.ReplacedDate.toISOString()
          : new Date().toISOString(),
        ReplacedBy:
          currentUser?.userId ||
          currentUser?.id ||
          currentUser?.username ||
          null,
        Status: "Chờ duyệt cấp phát", // Tiếng Việt
        Remarks: values.Remarks || null,
      };

      await replacementHistoryService.create(payload);

      message.success("Ghi nhận thay thế đã được gửi (Trạng thái: Chờ duyệt).");

      if (typeof onSuccess === "function") {
        onSuccess();
      } else {
        navigate("/technician/incident-list");
      }
    } catch (err) {
      console.error(err);
      message.error(err?.message || "Không thể gửi ghi nhận thay thế.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Ghi nhận thay thế mới" bordered={false}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ Quantity: 1 }}
      >
        <Form.Item label="Sự cố (tùy chọn)">
          {/* Incident is passed via query param or prop; showing readonly when present */}
        </Form.Item>

        <Form.Item label="Thiết bị (EquipmentId)" name="EquipmentId">
          <Input placeholder="EquipmentId (tùy chọn)" />
        </Form.Item>

        <Form.Item
          label="Phụ tùng"
          name="PartId"
          rules={[{ required: true, message: "Vui lòng chọn phụ tùng" }]}
        >
          <Select
            showSearch
            placeholder="Chọn phụ tùng"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children || "")
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            {parts.map((p) => (
              <Select.Option key={p.partId} value={p.partId}>
                {p.partNumber} - {p.partName} (Tồn: {p.quantity})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Số lượng"
          name="Quantity"
          rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Ngày thay thế" name="ReplacedDate">
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Ghi chú" name="Remarks">
          <TextArea rows={4} placeholder="Ghi chú (tùy chọn)" />
        </Form.Item>

        <Form.Item>
          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() =>
                typeof onCancel === "function" ? onCancel() : navigate(-1)
              }
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Gửi (Chờ duyệt)
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ReplacementCreate;
