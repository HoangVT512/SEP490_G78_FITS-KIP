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
  Typography,
  Space,
  Divider,
} from "antd";
import { useAuth } from "../../contexts/AuthContext";
import {
  CheckOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { replacementHistoryService } from "../../services/replacementHistoryService";
import { userService } from "../../services/userService";
import { sparePartService } from "../../services/sparePartService";
import { useSignalR } from "../../contexts/SignalRContext";
import * as notificationService from "../../services/notificationService";

const { Title, Text } = Typography;

const ReplacementApprovalModal = ({
  equipmentId,
  incidentId,
  equipmentInfo, // { name: string, code: string }
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
  const [allUsers, setAllUsers] = useState([]);
  const [sparePartsStock, setSparePartsStock] = useState({}); // Store spare parts stock info
  const { user: currentUser } = useAuth();
  const { sendMessage } = useSignalR();

  useEffect(() => {
    if (!open) return;
    load();
    fetchUsers();
  }, [open, incidentId]);

  const load = async () => {
    if (viewMode) {
      // Khi viewMode=true (xem lịch sử)
      // Ưu tiên load theo incidentId, nếu không có thì load theo equipmentId
      const loadId = incidentId || equipmentId;
      const isLoadingByIncident = !!incidentId;

      if (!loadId) {
        setPendingItems([]);
        setApprovedItems([]);
        setPendingReturnItems([]);
        return;
      }
      setLoading(true);
      try {
        let res;
        let data = [];

        if (isLoadingByIncident) {
          // Load theo incident cụ thể
          res = await replacementHistoryService.getByIncidentId(incidentId);
          data = Array.isArray(res) ? res : res?.data || [];
        } else {
          // Fallback: load theo equipment và filter theo incident
          res = await replacementHistoryService.getByEquipmentId(equipmentId);
          data = Array.isArray(res) ? res : res?.data || [];
          // Filter chỉ những record có IncidentId
          data = data.filter(item => item.incidentId != null);
        }

        // Filter chỉ những record đã hoàn thành (lịch sử)
        const approved = data.filter(
          (r) => r.status === "Hoàn thành" || r.status === "Completed"
        ).sort((a, b) => {
          // Sắp xếp theo ngày yêu cầu, mới nhất trước
          const dateA = new Date(a.replacedDate || a.ReplacedDate || 0);
          const dateB = new Date(b.replacedDate || b.ReplacedDate || 0);
          return dateB - dateA; // Giảm dần (mới nhất trước)
        });
        setApprovedItems(approved);

        // Các tab khác để trống khi viewMode
        setPendingItems([]);
        setPendingReturnItems([]);

        // Fetch stock info for all spare parts
        await fetchSparePartsStock(approved);
      } catch (err) {
        console.error("Failed to load replacement history", err);
        message.error("Không thể tải lịch sử thay thế: " + (err?.message || err));
      } finally {
        setLoading(false);
      }
    } else {
      // Logic cũ cho chế độ duyệt yêu cầu
      if (!incidentId) {
        setPendingItems([]);
        setApprovedItems([]);
        setPendingReturnItems([]);
        return;
      }
      setLoading(true);
      try {
        const res = await replacementHistoryService.getByIncidentId(incidentId);
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

        // Fetch stock info for all spare parts
        await fetchSparePartsStock([...pending, ...approved, ...pendingReturn]);
      } catch (err) {
        console.error("Failed to load replacement requests", err);
        message.error("Không thể tải yêu cầu thay thế: " + (err?.message || err));
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchSparePartsStock = async (items) => {
    try {
      const sparePartIds = [...new Set(items.map(item => item.sparePartId).filter(Boolean))];
      const stockData = {};

      await Promise.all(
        sparePartIds.map(async (id) => {
          try {
            const response = await sparePartService.getById(id);
            const sparePart = response?.data || response;
            stockData[id] = {
              quantity: sparePart.quantity || 0,
              name: sparePart.name || "N/A"
            };
          } catch (error) {
            console.error(`Error fetching spare part ${id}:`, error);
            stockData[id] = { quantity: 0, name: "N/A" };
          }
        })
      );

      setSparePartsStock(stockData);
    } catch (error) {
      console.error("Error fetching spare parts stock:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await userService.getUsers();
      const users = Array.isArray(res) ? res : res?.data || [];
      setAllUsers(users);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
    }
  };

  const getUserName = (userId) => {
    if (!userId) return null;
    const user = allUsers.find((u) => (u.userId || u.id) === userId);
    if (!user) return userId;

    const name = user.fullName || user.name || user.username;
    const code = user.employeeCode;
    return code ? `${name} (${code})` : name;
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

      // Nếu đang duyệt cấp phát, kiểm tra tồn kho trước
      if (newStatus === "Đã duyệt cấp phát") {
        try {
          // Lấy thông tin phụ tùng từ kho
          const partId = record.partId || record.PartID || record.partID;
          const requestedQuantity = record.quantity || record.Quantity || 0;

          console.log(`Checking inventory for Part ID: ${partId}, Requested: ${requestedQuantity}`);

          const sparePartResponse = await sparePartService.getById(partId);
          const sparePart = sparePartResponse?.data || sparePartResponse;

          if (!sparePart) {
            message.error("❌ Không tìm thấy thông tin phụ tùng trong hệ thống");
            setLoading(false);
            return;
          }

          const availableQuantity = sparePart.quantity || sparePart.Quantity || 0;
          const partName = sparePart.partName || sparePart.PartName || "N/A";
          const partNumber = sparePart.partNumber || sparePart.PartNumber || "N/A";

          console.log(`Available in stock: ${availableQuantity}, Part: ${partNumber} - ${partName}`);

          // Kiểm tra tồn kho
          if (availableQuantity === 0) {
            message.error({
              content: (
                <div style={{ alignItems: 'flex-start', textAlign: 'left', lineHeight: '1.4' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    Linh kiện "{partNumber} - {partName}" đã hết hàng trong kho!
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    Tồn kho: <strong>{availableQuantity}</strong>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    Yêu cầu: <strong>{requestedQuantity}</strong>
                  </div>
                  <div style={{ color: '#faad14' }}>
                    Cần yêu cầu mua hàng để bổ sung tồn kho.
                  </div>
                </div>
              ),
              duration: 8,
            });
            setLoading(false);
            return;
          }

          if (availableQuantity < requestedQuantity) {
            const shortage = requestedQuantity - availableQuantity;
            message.warning({
              content: (
                <div style={{ alignItems: 'flex-start', textAlign: 'left', lineHeight: '1.4' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    Linh kiện "{partNumber} - {partName}" không đủ số lượng!
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    Tồn kho hiện tại: <strong>{availableQuantity}</strong>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    Yêu cầu: <strong>{requestedQuantity}</strong>
                  </div>
                  <div style={{ marginBottom: '8px', color: '#ff4d4f' }}>
                    Thiếu: <strong>{shortage}</strong>
                  </div>
                  <div style={{ color: '#1890ff' }}>
                    Cần mua thêm <strong>{shortage}</strong> để đáp ứng yêu cầu.
                  </div>
                </div>
              ),
              duration: 8,
            });
            setLoading(false);
            return;
          }

          // Nếu đủ hàng, hiển thị thông báo xác nhận
          console.log(`✅ Stock is sufficient. Available: ${availableQuantity}, Requested: ${requestedQuantity}`);
          // message.info({
          //   content: (
          //     <div style={{ alignItems: 'flex-start', textAlign: 'left', lineHeight: '1.4' }}>
          //       <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          //         Tồn kho đủ để cấp phát
          //       </div>
          //       <div style={{ marginBottom: '4px' }}>
          //         Tồn kho hiện tại: <strong>{availableQuantity}</strong>
          //       </div>
          //       <div style={{ marginBottom: '4px' }}>
          //         Yêu cầu: <strong>{requestedQuantity}</strong>
          //       </div>
          //       {/* <div style={{ color: '#52c41a' }}>
          //         ➡️ Còn lại sau khi cấp: <strong>{availableQuantity - requestedQuantity}</strong>
          //       </div> */}
          //     </div>
          //   ),
          //   duration: 5,
          // });
        } catch (checkError) {
          console.error("Error checking inventory:", checkError);
          message.error("❌ Lỗi khi kiểm tra tồn kho: " + (checkError?.message || checkError));
          setLoading(false);
          return;
        }
      }

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
        message.success(`✅ Cập nhật trạng thái thành công (${newStatus})`);
        
        // Gửi notification real-time cho Technician nếu duyệt cấp phát
        if (newStatus === "Đã duyệt cấp phát") {
          try {
            // Gửi notification qua API để đảm bảo chắc chắn
            await notificationService.sendToTechnicians({
              message: `Linh kiện ${record.partName || record.PartName || "N/A"} đã được duyệt cấp phát cho thiết bị ${equipmentInfo?.name || "N/A"}`,
              type: "Success",
              data: {
                replacementId: replacementId,
                partName: record.partName || record.PartName || "Linh kiện",
                equipmentName: equipmentInfo?.name || "Thiết bị",
                approvedBy: currentUser?.fullName || currentUser?.FullName || currentUser?.username || "Quản lý",
                quantity: record.quantity || record.Quantity || 0,
                incidentId: incidentId,
              }
            });
            console.log("✅ Sent replacement approved notification via API");

            // Đồng thời gửi qua SignalR để đảm bảo real-time
            await sendMessage("SendReplacementApprovedNotification", {
              replacementId: replacementId,
              partName: record.partName || record.PartName || "Linh kiện",
              equipmentName: equipmentInfo?.name || "Thiết bị",
              approvedBy: currentUser?.fullName || currentUser?.FullName || currentUser?.username || "Quản lý",
              quantity: record.quantity || record.Quantity || 0,
              incidentId: incidentId,
            });
            console.log("✅ Sent replacement approved notification via SignalR");
          } catch (notificationError) {
            console.error("❌ Failed to send notification:", notificationError);
            // Không throw error vì đây chỉ là notification, không ảnh hưởng đến logic chính
          }
        }
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
      title: <Text strong style={{ fontSize: '13px' }}>ID</Text>,
      dataIndex: "replacementID",
      key: "replacementID",
      width: 70,
      align: "center",
      render: (id) => <Text strong style={{ color: "#1890ff" }}>#{id}</Text>,
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Mã phụ tùng</Text>,
      dataIndex: "partNumber",
      key: "partNumber",
      width: 130,
      render: (text) => <Text code style={{ fontSize: '13px' }}>{text}</Text>,
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Tên phụ tùng</Text>,
      dataIndex: "partName",
      key: "partName",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text}>
          <Text style={{ fontSize: '13px' }}>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>SL yêu cầu</Text>,
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (qty) => (
        <Tag color="blue" style={{ fontSize: '13px', fontWeight: 500 }}>
          {qty}
        </Tag>
      ),
    },
    // {
    //   title: <Text strong style={{ fontSize: '13px' }}>Tồn kho</Text>,
    //   key: "stockQuantity",
    //   width: 110,
    //   align: "center",
    //   render: (_, record) => {
    //     const stock = sparePartsStock[record.sparePartId];
    //     if (!stock) {
    //       return <Text type="secondary" style={{ fontSize: '13px' }}>...</Text>;
    //     }

    //     const available = stock.quantity || 0;
    //     const requested = record.quantity || 0;
    //     const isOutOfStock = available === 0;
    //     const isInsufficient = available < requested;

    //     let color = "green";
    //     let icon = "✓";

    //     if (isOutOfStock) {
    //       color = "red";
    //       icon = "✕";
    //     } else if (isInsufficient) {
    //       color = "orange";
    //       icon = "⚠";
    //     }

    //     return (
    //       <Tooltip title={
    //         isOutOfStock ? "Hết hàng" :
    //           isInsufficient ? `Thiếu ${requested - available} sản phẩm` :
    //             `Đủ hàng (còn ${available - requested} sau cấp phát)`
    //       }>
    //         <Tag color={color} style={{ fontSize: '13px', fontWeight: 500 }}>
    //           {icon} {available}
    //         </Tag>
    //       </Tooltip>
    //     );
    //   },
    // },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Ngày yêu cầu</Text>,
      dataIndex: "replacedDate",
      key: "replacedDate",
      width: 140,
      render: (d) => (
        <Text style={{ fontSize: '13px' }}>
          {d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"}
        </Text>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Người yêu cầu</Text>,
      dataIndex: "replacedBy",
      key: "replacedBy",
      width: 160,
      render: (replacedBy) => (
        <Text style={{ fontSize: '13px' }}>{getUserName(replacedBy)}</Text>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Trạng thái</Text>,
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center",
      render: (s) => {
        let color = "orange";
        let icon = <ClockCircleOutlined />;
        let text = s || "Chờ duyệt cấp phát";

        if (s === "Đã duyệt cấp phát" || s === "Completed") {
          color = "green";
          icon = <CheckCircleOutlined />;
        }

        return (
          <Tag
            icon={icon}
            color={color}
            style={{
              fontSize: '13px',
              fontWeight: 500,
              padding: '4px 12px',
            }}
          >
            {text}
          </Tag>
        );
      },
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Ghi chú</Text>,
      dataIndex: "remarks",
      key: "remarks",
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: (r) => (
        <Tooltip title={r}>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {r || "-"}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Thao tác</Text>,
      key: "action",
      width: 160,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Popconfirm
          title="Xác nhận duyệt yêu cầu?"
          description="Bạn có chắc chắn muốn duyệt yêu cầu thay thế này?"
          onConfirm={() => handleUpdate(record, "Đã duyệt cấp phát")}
          okText="Duyệt"
          cancelText="Hủy"
          okButtonProps={{
            style: {
              backgroundColor: "#52c41a",
              borderColor: "#52c41a"
            }
          }}
        >
          <Button
            type="primary"
            icon={<CheckOutlined />}
            style={{
              backgroundColor: "#334766",
              borderColor: "#334766",
              height: "36px",
              fontSize: "14px",
              minWidth: "100px",
              fontWeight: 500,
            }}
          >
            Duyệt
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // Columns for approved tab (without SL đã dùng and SL thừa columns)
  const columnsApproved = [
    {
      title: <Text strong style={{ fontSize: '13px' }}>ID</Text>,
      dataIndex: "replacementID",
      key: "replacementID",
      width: 70,
      align: "center",
      render: (id) => <Text strong style={{ color: "#52c41a" }}>#{id}</Text>,
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Mã phụ tùng</Text>,
      dataIndex: "partNumber",
      key: "partNumber",
      width: 130,
      render: (text) => <Text code style={{ fontSize: '13px' }}>{text}</Text>,
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Tên phụ tùng</Text>,
      dataIndex: "partName",
      key: "partName",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text}>
          <Text style={{ fontSize: '13px' }}>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>SL yêu cầu</Text>,
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (qty) => (
        <Tag color="blue" style={{ fontSize: '13px', fontWeight: 500 }}>
          {qty}
        </Tag>
      ),
    },
    // {
    //   title: <Text strong style={{ fontSize: '13px' }}>Tồn kho</Text>,
    //   key: "stockQuantity",
    //   width: 110,
    //   align: "center",
    //   render: (_, record) => {
    //     const stock = sparePartsStock[record.sparePartId];
    //     if (!stock) {
    //       return <Text type="secondary" style={{ fontSize: '13px' }}>...</Text>;
    //     }

    //     const available = stock.quantity || 0;
    //     const requested = record.quantity || 0;
    //     const isOutOfStock = available === 0;
    //     const isInsufficient = available < requested;

    //     let color = "green";
    //     let icon = "✓";

    //     if (isOutOfStock) {
    //       color = "red";
    //       icon = "✕";
    //     } else if (isInsufficient) {
    //       color = "orange";
    //       icon = "⚠";
    //     }

    //     return (
    //       <Tooltip title={
    //         isOutOfStock ? "Hết hàng" :
    //           isInsufficient ? `Thiếu ${requested - available} sản phẩm` :
    //             `Đủ hàng (còn ${available - requested} sau cấp phát)`
    //       }>
    //         <Tag color={color} style={{ fontSize: '13px', fontWeight: 500 }}>
    //           {icon} {available}
    //         </Tag>
    //       </Tooltip>
    //     );
    //   },
    // },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Ngày yêu cầu</Text>,
      dataIndex: "replacedDate",
      key: "replacedDate",
      width: 140,
      render: (d) => (
        <Text style={{ fontSize: '13px' }}>
          {d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"}
        </Text>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Người yêu cầu</Text>,
      dataIndex: "replacedBy",
      key: "replacedBy",
      width: 160,
      render: (replacedBy) => (
        <Text style={{ fontSize: '13px' }}>{getUserName(replacedBy)}</Text>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Trạng thái</Text>,
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center",
      render: (s) => {
        let text = s || "Đã duyệt cấp phát";
        return (
          <Tag
            icon={<CheckCircleOutlined />}
            color="green"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              padding: '4px 12px',
            }}
          >
            {text}
          </Tag>
        );
      },
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Ghi chú</Text>,
      dataIndex: "remarks",
      key: "remarks",
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: (r) => (
        <Tooltip title={r}>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {r || "-"}
          </Text>
        </Tooltip>
      ),
    },
  ];

  // Columns for history tab (without action button)
  const columnsHistory = [
    {
      title: <Text strong style={{ fontSize: '13px' }}>ID</Text>,
      dataIndex: "replacementID",
      key: "replacementID",
      width: 70,
      align: "center",
      render: (id, record, index) => <Text strong style={{ color: "#52c41a" }}>#{index + 1}</Text>,
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Sự cố</Text>,
      dataIndex: "incidentId",
      key: "incidentId",
      width: 80,
      align: "center",
      render: (incidentId) => incidentId ? (
        <Text strong style={{ color: "#1890ff" }}>#{incidentId}</Text>
      ) : (
        <Text type="secondary">-</Text>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Mã phụ tùng</Text>,
      dataIndex: "partNumber",
      key: "partNumber",
      width: 130,
      render: (text) => <Text code style={{ fontSize: '13px' }}>{text}</Text>,
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Tên phụ tùng</Text>,
      dataIndex: "partName",
      key: "partName",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text}>
          <Text style={{ fontSize: '13px' }}>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>SL yêu cầu</Text>,
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (qty) => (
        <Tag color="blue" style={{ fontSize: '13px', fontWeight: 500 }}>
          {qty}
        </Tag>
      ),
    },
    // {
    //   title: <Text strong style={{ fontSize: '13px' }}>Tồn kho</Text>,
    //   key: "stockQuantity",
    //   width: 110,
    //   align: "center",
    //   render: (_, record) => {
    //     const stock = sparePartsStock[record.sparePartId];
    //     if (!stock) {
    //       return <Text type="secondary" style={{ fontSize: '13px' }}>...</Text>;
    //     }

    //     const available = stock.quantity || 0;
    //     const requested = record.quantity || 0;
    //     const isOutOfStock = available === 0;
    //     const isInsufficient = available < requested;

    //     let color = "green";
    //     let icon = "✓";

    //     if (isOutOfStock) {
    //       color = "red";
    //       icon = "✕";
    //     } else if (isInsufficient) {
    //       color = "orange";
    //       icon = "⚠";
    //     }

    //     return (
    //       <Tooltip title={
    //         isOutOfStock ? "Hết hàng" :
    //           isInsufficient ? `Thiếu ${requested - available} sản phẩm` :
    //             `Đủ hàng (còn ${available - requested} sau cấp phát)`
    //       }>
    //         <Tag color={color} style={{ fontSize: '13px', fontWeight: 500 }}>
    //           {icon} {available}
    //         </Tag>
    //       </Tooltip>
    //     );
    //   },
    // },
    {
      title: <Text strong style={{ fontSize: '13px' }}>SL sử dụng</Text>,
      dataIndex: "actualQuantityUsed",
      key: "actualQuantityUsed",
      width: 110,
      align: "center",
      render: (qty) =>
        qty ? (
          <Tag color="green" style={{ fontSize: '13px', fontWeight: 500 }}>
            {qty}
          </Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: '13px' }}>-</Text>
        ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>SL thừa</Text>,
      dataIndex: "quantityToReturn",
      key: "quantityToReturn",
      width: 90,
      align: "center",
      render: (qty) =>
        qty > 0 ? (
          <Tag color="orange" style={{ fontSize: '13px', fontWeight: 500 }}>
            {qty}
          </Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: '13px' }}>-</Text>
        ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Ngày yêu cầu</Text>,
      dataIndex: "replacedDate",
      key: "replacedDate",
      width: 140,
      render: (d) => (
        <Text style={{ fontSize: '13px' }}>
          {d ? dayjs(d).format("DD/MM/YYYY HH:mm:ss") : "-"}
        </Text>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Ngày trả linh kiện</Text>,
      dataIndex: "returnedDate",
      key: "returnedDate",
      width: 140,
      render: (d) => (
        <Text style={{ fontSize: '13px' }}>
          {d ? dayjs(d).format("DD/MM/YYYY HH:mm:ss") : "-"}
        </Text>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Người yêu cầu</Text>,
      dataIndex: "replacedBy",
      key: "replacedBy",
      width: 160,
      render: (replacedBy) => (
        <Text style={{ fontSize: '13px' }}>{getUserName(replacedBy)}</Text>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Trạng thái</Text>,
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center",
      render: (s) => {
        let text = s || "Đã duyệt cấp phát";
        return (
          <Tag
            icon={<CheckCircleOutlined />}
            color="green"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              padding: '4px 12px',
            }}
          >
            {text}
          </Tag>
        );
      },
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Ghi chú</Text>,
      dataIndex: "remarks",
      key: "remarks",
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: (r) => (
        <Tooltip title={r}>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {r || "-"}
          </Text>
        </Tooltip>
      ),
    },
  ];

  // Columns for return confirmation tab
  const columnsReturnConfirm = [
    {
      title: <Text strong style={{ fontSize: '13px' }}>ID</Text>,
      dataIndex: "replacementID",
      key: "replacementID",
      width: 70,
      align: "center",
      render: (id) => <Text strong style={{ color: "#faad14" }}>#{id}</Text>,
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Mã phụ tùng</Text>,
      dataIndex: "partNumber",
      key: "partNumber",
      width: 130,
      render: (text) => <Text code style={{ fontSize: '13px' }}>{text}</Text>,
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Tên phụ tùng</Text>,
      dataIndex: "partName",
      key: "partName",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text}>
          <Text style={{ fontSize: '13px' }}>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>SL yêu cầu</Text>,
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (qty) => (
        <Tag color="blue" style={{ fontSize: '13px', fontWeight: 500 }}>
          {qty}
        </Tag>
      ),
    },
    // {
    //   title: <Text strong style={{ fontSize: '13px' }}>Tồn kho</Text>,
    //   key: "stockQuantity",
    //   width: 110,
    //   align: "center",
    //   render: (_, record) => {
    //     const stock = sparePartsStock[record.sparePartId];
    //     if (!stock) {
    //       return <Text type="secondary" style={{ fontSize: '13px' }}>...</Text>;
    //     }

    //     const available = stock.quantity || 0;
    //     const requested = record.quantity || 0;
    //     const isOutOfStock = available === 0;
    //     const isInsufficient = available < requested;

    //     let color = "green";
    //     let icon = "✓";

    //     if (isOutOfStock) {
    //       color = "red";
    //       icon = "✕";
    //     } else if (isInsufficient) {
    //       color = "orange";
    //       icon = "⚠";
    //     }

    //     return (
    //       <Tooltip title={
    //         isOutOfStock ? "Hết hàng" :
    //           isInsufficient ? `Thiếu ${requested - available} sản phẩm` :
    //             `Đủ hàng (còn ${available - requested} sau cấp phát)`
    //       }>
    //         <Tag color={color} style={{ fontSize: '13px', fontWeight: 500 }}>
    //           {icon} {available}
    //         </Tag>
    //       </Tooltip>
    //     );
    //   },
    // },
    {
      title: <Text strong style={{ fontSize: '13px' }}>SL sử dụng</Text>,
      dataIndex: "actualQuantityUsed",
      key: "actualQuantityUsed",
      width: 110,
      align: "center",
      render: (qty) =>
        qty ? (
          <Tag color="green" style={{ fontSize: '13px', fontWeight: 500 }}>
            {qty}
          </Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: '13px' }}>-</Text>
        ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>SL thừa</Text>,
      dataIndex: "quantityToReturn",
      key: "quantityToReturn",
      width: 90,
      align: "center",
      render: (qty) =>
        qty > 0 ? (
          <Tag color="orange" style={{ fontSize: '13px', fontWeight: 500 }}>
            {qty}
          </Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: '13px' }}>-</Text>
        ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Ngày yêu cầu</Text>,
      dataIndex: "replacedDate",
      key: "replacedDate",
      width: 140,
      render: (d) => (
        <Text style={{ fontSize: '13px' }}>
          {d ? dayjs(d).format("DD/MM/YYYY HH:mm:ss") : "-"}
        </Text>
      ),
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Trạng thái</Text>,
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center",
      render: (s) => {
        const status = s || "Chờ trả lại";
        let color = "blue";
        let icon = <ClockCircleOutlined />;

        if (status === "Đã giao kho") {
          color = "blue";
          icon = <HistoryOutlined />;
        } else if (status === "Đã trả") {
          color = "green";
          icon = <CheckCircleOutlined />;
        }

        return (
          <Tag
            icon={icon}
            color={color}
            style={{
              fontSize: '13px',
              fontWeight: 500,
              padding: '4px 12px',
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: <Text strong style={{ fontSize: '13px' }}>Hành động</Text>,
      key: "action",
      width: 170,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const status = record.status || "Chờ trả lại";

        // Chỉ hiển thị nút xác nhận cho status "Chờ trả lại" hoặc "Đã giao kho"
        if (status === "Chờ trả lại" || status === "Đã giao kho") {
          return (
            <Popconfirm
              title="Xác nhận đã nhận trả lại"
              description="Bạn có chắc chắn đã nhận trả lại phụ tùng từ KTV?"
              onConfirm={() => handleUpdate(record, "Đã trả")}
              okText="Xác nhận"
              cancelText="Hủy"
              okButtonProps={{
                style: {
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                  height: "32px",
                  fontSize: "14px",
                  fontWeight: 500,
                },
              }}
              cancelButtonProps={{
                style: {
                  height: "32px",
                  fontSize: "14px",
                },
              }}
            >
              <Button
                type="primary"
                icon={<CheckOutlined />}
                style={{
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                  height: "36px",
                  fontSize: "14px",
                  minWidth: "140px",
                  fontWeight: 500,
                }}
              >
                Xác nhận đã nhận
              </Button>
            </Popconfirm>
          );
        } else {
          return (
            <Tag
              icon={<CheckCircleOutlined />}
              color="green"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                padding: '4px 12px',
              }}
            >
              Đã hoàn tất
            </Tag>
          );
        }
      },
    },
  ];

  return (
    <Modal
      title={
        <Space direction="vertical" size={0}>
          <Title level={4} style={{ margin: 0, color: "#334766" }}>
            {viewMode ? (
              <>
                <HistoryOutlined style={{ marginRight: 8 }} />
                Lịch sử thay thế
              </>
            ) : (
              <>
                <ToolOutlined style={{ marginRight: 8 }} />
                Duyệt yêu cầu thay thế
              </>
            )}
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Thiết bị: <Text strong style={{ fontSize: '13px' }}>
              {equipmentInfo?.name || "N/A"}
              {equipmentInfo?.code && (
                <span style={{ color: "#999", marginLeft: 6 }}>({equipmentInfo.code})</span>
              )}
            </Text>
          </Text>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      destroyOnClose
    >
      <Divider style={{ margin: '16px 0 20px' }} />

      <Tabs
        activeKey={viewMode ? "approved" : activeTab}
        onChange={setActiveTab}
        size="large"
        items={[
          ...(viewMode
            ? []
            : [
              {
                key: "pending",
                label: (
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    <ClockCircleOutlined style={{ marginRight: 6 }} />
                    Chờ duyệt ({pendingItems.length})
                  </span>
                ),
                children: (
                  <Table
                    columns={columns}
                    dataSource={pendingItems}
                    rowKey={(r) => r.replacementID || r.replacementId}
                    loading={loading}
                    pagination={{
                      pageSize: 8,
                      showTotal: (total) => (
                        <Text style={{ fontSize: '13px' }}>
                          Tổng số: <Text strong>{total}</Text> yêu cầu
                        </Text>
                      ),
                    }}
                    scroll={{ x: 1350, y: 450 }}
                  />
                ),
              },
            ]),
          {
            key: "approved",
            label: (
              <span style={{ fontSize: '14px', fontWeight: 500 }}>
                <CheckCircleOutlined style={{ marginRight: 6 }} />
                {viewMode ? `Lịch sử thay thế (${approvedItems.length})` : `Đã duyệt (${approvedItems.length})`}
              </span>
            ),
            children: (
              <Table
                columns={viewMode ? columnsHistory : columnsApproved}
                dataSource={approvedItems}
                rowKey={(r) => r.replacementID || r.replacementId}
                loading={loading}
                pagination={{
                  pageSize: 8,
                  showTotal: (total) => (
                    <Text style={{ fontSize: '13px' }}>
                      Tổng số: <Text strong>{total}</Text> {viewMode ? 'lịch sử thay thế' : 'yêu cầu'}
                    </Text>
                  ),
                }}
                scroll={{ x: 1350, y: 450 }}
              />
            ),
          },
          ...(viewMode
            ? []
            : [
              {
                key: "pendingReturn",
                label: (
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    <HistoryOutlined style={{ marginRight: 6 }} />
                    Chờ trả lại ({pendingReturnItems.length})
                  </span>
                ),
                children: (
                  <Table
                    columns={columnsReturnConfirm}
                    dataSource={pendingReturnItems}
                    rowKey={(r) => r.replacementID || r.replacementId}
                    loading={loading}
                    pagination={{
                      pageSize: 8,
                      showTotal: (total) => (
                        <Text style={{ fontSize: '13px' }}>
                          Tổng số: <Text strong>{total}</Text> yêu cầu
                        </Text>
                      ),
                    }}
                    scroll={{ x: 1350, y: 450 }}
                  />
                ),
              },
            ]),
        ]}
      />
    </Modal>
  );
};

export default ReplacementApprovalModal;
