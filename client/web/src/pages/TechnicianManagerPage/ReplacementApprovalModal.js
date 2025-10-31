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
  const [pendingReturnItems, setPendingReturnItems] = useState([]); // Items waiting for return
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
      setPendingReturnItems([]);
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

      // Filter items waiting for return (KTV has recorded actual usage)
      const pendingReturn = data.filter(
        (r) => r.status === "Chờ trả lại" || r.status === "Đã giao kho"
      );
      setPendingReturnItems(pendingReturn);
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

      const userId =
        currentUser?.userId || currentUser?.id || currentUser?.userID || null;
      const replacementId =
        record.replacementID ||
        record.replacementId ||
        record.ReplacementID ||
        record.id;

      // Nếu xác nhận trả lại, dùng endpoint confirm-return
      if (newStatus === "Đã trả") {
        const confirmPayload = {
          actualQuantityUsed:
            record.actualQuantityUsed || record.ActualQuantityUsed || null,
          returnedDate: new Date().toISOString(),
          returnConfirmedBy:
            currentUser?.fullName ||
            currentUser?.FullName ||
            userId ||
            "Unknown",
          returnRemarks: `Confirmed by manager at ${new Date().toLocaleString(
            "vi-VN"
          )}`,
        };

        console.log("Calling confirm-return with payload:", confirmPayload);
        await replacementHistoryService.confirmReturn(
          replacementId,
          confirmPayload
        );
        message.success(
          `✓ Đã xác nhận trả lại thành công - Status: Hoàn thành`
        );
      } else {
        // Các status khác dùng generic update
        const payload = {
          partId:
            record.partId ||
            record.PartID ||
            record.partID ||
            record.PartId ||
            0,
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
          replacedBy: userId || record.replacedBy || record.ReplacedBy || "",
          status: newStatus,
          remarks: record.remarks || record.Remarks || "",
        };

        console.log("Calling generic update with payload:", payload);
        await replacementHistoryService.update(replacementId, payload);
        message.success(`Cập nhật trạng thái thành công (${newStatus})`);
      }

      await load();
      onUpdated && onUpdated();
    } catch (err) {
      console.error("Update failed", err);
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
      title: "Số lượng sử dụng",
      dataIndex: "actualQuantityUsed",
      key: "actualQuantityUsed",
      width: 130,
      render: (qty) => qty || "-",
    },
    {
      title: "Số lượng thừa",
      dataIndex: "quantityToReturn",
      key: "quantityToReturn",
      width: 130,
      render: (qty) => (qty > 0 ? <Tag color="orange">{qty}</Tag> : "-"),
    },
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
      title: "Số lượng sử dụng",
      dataIndex: "actualQuantityUsed",
      key: "actualQuantityUsed",
      width: 130,
      render: (qty) => qty || "-",
    },
    {
      title: "Số lượng thừa",
      dataIndex: "quantityToReturn",
      key: "quantityToReturn",
      width: 130,
      render: (qty) => (qty > 0 ? <Tag color="orange">{qty}</Tag> : "-"),
    },
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

  // Columns for return confirmation tab
  const columnsReturnConfirm = [
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
      title: "Số lượng sử dụng",
      dataIndex: "actualQuantityUsed",
      key: "actualQuantityUsed",
      width: 130,
      render: (qty) => qty || "-",
    },
    {
      title: "Số lượng thừa",
      dataIndex: "quantityToReturn",
      key: "quantityToReturn",
      width: 130,
      render: (qty) => (qty > 0 ? <Tag color="orange">{qty}</Tag> : "-"),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "replacedDate",
      key: "replacedDate",
      width: 180,
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s) => {
        let color = "blue";
        let text = s || "Chờ trả lại";

        if (s === "Đã giao kho") {
          color = "blue";
        } else if (s === "Đã trả") {
          color = "green";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_, record) => {
        const status = record.status || "Chờ trả lại";
        // Chỉ hiển thị nút xác nhận cho status "Chờ trả lại"
        if (status === "Chờ trả lại") {
          return (
            <Popconfirm
              title="Xác nhận đã nhận trả lại từ KTV?"
              onConfirm={() => handleUpdate(record, "Đã trả")}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button
                type="primary"
                size="small"
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Xác nhận đã nhận
              </Button>
            </Popconfirm>
          );
        } else if (status === "Đã giao kho") {
          return (
            <Popconfirm
              title="Xác nhận đã nhận trả lại từ KTV?"
              onConfirm={() => handleUpdate(record, "Đã trả")}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button
                type="primary"
                size="small"
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Xác nhận đã nhận
              </Button>
            </Popconfirm>
          );
        } else {
          return <Tag color="green">Đã hoàn tất</Tag>;
        }
      },
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
          {
            key: "pendingReturn",
            label: `Chờ trả lại (${pendingReturnItems.length})`,
            children: (
              <Table
                columns={columnsReturnConfirm}
                dataSource={pendingReturnItems}
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
