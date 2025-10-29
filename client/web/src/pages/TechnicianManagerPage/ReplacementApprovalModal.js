import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Tag, message, Tooltip, Popconfirm } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { replacementHistoryService } from "../../services/replacementHistoryService";

const ReplacementApprovalModal = ({
  equipmentId,
  open,
  onClose,
  onUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!open) return;
    load();
  }, [open, equipmentId]);

  const load = async () => {
    if (!equipmentId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await replacementHistoryService.getByEquipmentId(equipmentId);
      const data = Array.isArray(res) ? res : res?.data || [];
      // show only pending requests by default
      setItems(data.filter((r) => !r.status || r.status === "Pending"));
    } catch (err) {
      console.error("Failed to load replacement requests", err);
      message.error("Không thể tải yêu cầu thay thế: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (record, newStatus) => {
    try {
      setLoading(true);

      // Build update payload from existing record to satisfy backend validation
      const userId =
        currentUser?.userId || currentUser?.id || currentUser?.userID || null;

      const payload = {
        partId:
          record.partId || record.PartID || record.partID || record.PartId || 0,
        equipmentId:
          record.equipmentId ||
          record.EquipmentID ||
          record.equipmentID ||
          record.EquipmentId ||
          equipmentId,
        quantity: record.quantity || record.Quantity || 0,
        replacedDate:
          record.replacedDate ||
          record.ReplacedDate ||
          new Date().toISOString(),
        // prefer an explicit user id (manager) when approving; fallback to record's ReplacedBy
        replacedBy: userId || record.replacedBy || record.ReplacedBy || "",
        status: newStatus,
        remarks: record.remarks || record.Remarks || "",
      };

      await replacementHistoryService.update(
        record.replacementID ||
          record.replacementId ||
          record.ReplacementID ||
          record.id,
        payload
      );
      message.success(`Cập nhật trạng thái thành công (${newStatus})`);
      await load();
      onUpdated && onUpdated();
    } catch (err) {
      console.error("Approve/Reject failed", err);
      message.error("Cập nhật thất bại: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "replacementID",
      key: "replacementID",
      width: 80,
    },
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 140,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: 220,
    },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity", width: 100 },
    {
      title: "Ngày yêu cầu",
      dataIndex: "replacedDate",
      key: "replacedDate",
      width: 180,
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Người yêu cầu",
      dataIndex: "replacedBy",
      key: "replacedBy",
      width: 160,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s) => (
        <Tag color={s === "Completed" ? "green" : "orange"}>
          {s || "Pending"}
        </Tag>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "remarks",
      key: "remarks",
      render: (r) => (
        <Tooltip title={r}>
          <div
            style={{
              maxWidth: 300,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {r}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 180,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Popconfirm
            title="Bạn có chắc duyệt yêu cầu này?"
            onConfirm={() => handleUpdate(record, "Completed")}
            okText="Duyệt"
            cancelText="Hủy"
          >
            <Button type="primary" icon={<CheckOutlined />} size="small">
              Duyệt
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Bạn có chắc từ chối yêu cầu này?"
            onConfirm={() => handleUpdate(record, "Rejected")}
            okText="Từ chối"
            cancelText="Hủy"
          >
            <Button danger icon={<CloseOutlined />} size="small">
              Từ chối
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={`Duyệt yêu cầu thay thế - Thiết bị ${equipmentId || ""}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1100}
      destroyOnClose
    >
      <Table
        columns={columns}
        dataSource={items}
        rowKey={(r) => r.replacementID || r.replacementId}
        loading={loading}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 1100, y: 450 }}
      />
    </Modal>
  );
};

export default ReplacementApprovalModal;
