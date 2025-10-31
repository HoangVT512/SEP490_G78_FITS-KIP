import React, { useEffect, useState } from "react";
import {
  Modal,
  Table,
  Button,
  Tag,
  message,
  Tooltip,
  Popconfirm,
  Tabs,
} from "antd";
import { useAuth } from "../../contexts/AuthContext";
import { CheckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { replacementHistoryService } from "../../services/replacementHistoryService";

const ReplacementApprovalModal = ({
  equipmentId,
  open,
  onClose,
  onUpdated,
  viewMode = false, // Nếu true, chỉ xem lịch sử, không duyệt
}) => {
  const [loading, setLoading] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!open) return;
    load();
  }, [open, equipmentId]);

  const load = async () => {
    if (!equipmentId) {
      setPendingItems([]);
      setApprovedItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await replacementHistoryService.getByEquipmentId(equipmentId);
      const data = Array.isArray(res) ? res : res?.data || [];

      // Filter pending requests
      const pending = data.filter(
        (r) =>
          !r.status ||
          r.status === "Chờ duyệt cấp phát" ||
          r.status === "Pending"
      );
      setPendingItems(pending);

      // Filter approved requests
      const approved = data.filter(
        (r) => r.status === "Đã duyệt cấp phát" || r.status === "Completed"
      );
      setApprovedItems(approved);
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
      width: 150,
      render: (s) => {
        let color = "orange";
        let text = s || "Chờ duyệt cấp phát";

        if (s === "Đã duyệt cấp phát" || s === "Completed") {
          color = "green";
        }

        return <Tag color={color}>{text}</Tag>;
      },
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
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc duyệt yêu cầu này?"
          onConfirm={() => handleUpdate(record, "Đã duyệt cấp phát")}
          okText="Duyệt"
          cancelText="Hủy"
        >
          <Button type="primary" icon={<CheckOutlined />} size="small">
            Duyệt
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // Columns for history tab (without action button)
  const columnsHistory = [
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
      width: 150,
      render: (s) => {
        let color = "green";
        let text = s || "Đã duyệt cấp phát";

        return <Tag color={color}>{text}</Tag>;
      },
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
  ];

  return (
    <Modal
      title={
        viewMode
          ? `Lịch sử thay thế - Thiết bị ${equipmentId || ""}`
          : `Duyệt yêu cầu thay thế - Thiết bị ${equipmentId || ""}`
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1100}
      destroyOnClose
    >
      <Tabs
        activeKey={viewMode ? "approved" : activeTab}
        onChange={setActiveTab}
        items={[
          ...(viewMode
            ? []
            : [
                {
                  key: "pending",
                  label: `Chờ duyệt (${pendingItems.length})`,
                  children: (
                    <Table
                      columns={columns}
                      dataSource={pendingItems}
                      rowKey={(r) => r.replacementID || r.replacementId}
                      loading={loading}
                      pagination={{ pageSize: 8 }}
                      scroll={{ x: 1100, y: 450 }}
                    />
                  ),
                },
              ]),
          {
            key: "approved",
            label: `Đã duyệt (${approvedItems.length})`,
            children: (
              <Table
                columns={columnsHistory}
                dataSource={approvedItems}
                rowKey={(r) => r.replacementID || r.replacementId}
                loading={loading}
                pagination={{ pageSize: 8 }}
                scroll={{ x: 1100, y: 450 }}
              />
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default ReplacementApprovalModal;
