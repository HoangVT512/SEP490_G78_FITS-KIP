import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Descriptions,
  message,
  Badge,
  Tooltip,
  Divider,
  Progress,
  Alert,
  List,
  Checkbox,
  Typography,
  Dropdown,
  InputNumber,
  Table as AntTable,
} from "antd";
import {
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  StopOutlined,
  DownOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getMyWorkOrders,
  startWorkOrder,
  completeWorkOrder,
  updateChecklistItem,
} from "../../services/maintenanceService";
import { authService } from "../../services/authService";
import { sparePartService } from "../../services/sparePartService";
import { replacementHistoryService } from "../../services/replacementHistoryService";
import styles from "../../styles/pages/MaintenanceTasks.module.css";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const MaintenanceTasks = () => {
  const [loading, setLoading] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [checklistModalVisible, setChecklistModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [replacementHistories, setReplacementHistories] = useState([]);
  const [updatingChecklist, setUpdatingChecklist] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [checklistNotes, setChecklistNotes] = useState({}); // Lưu notes cho từng item
  const [spareParts, setSpareParts] = useState([]); // Lưu danh sách linh kiện yêu cầu
  const [sparePartsList, setSparePartsList] = useState([]); // Danh sách linh kiện từ DB
  const [recordModalVisible, setRecordModalVisible] = useState(false); // Modal ghi nhận thay thế
  const [selectedRecord, setSelectedRecord] = useState(null); // Record đang edit
  const [actualQuantity, setActualQuantity] = useState(0); // Số lượng thực tế
  const [form] = Form.useForm();

  const currentUser = authService.getStoredUser();
  const currentUserId = currentUser?.id || currentUser?.userId;

  useEffect(() => {
    fetchWorkOrders();
    fetchSpareParts();
  }, []);

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const response = await getMyWorkOrders();
      const orders = response?.data || [];
      const myOrders = orders.filter((order) => {
        const assignedElectrical =
          order.assignedToElectrical || order.AssignedToElectrical;
        const assignedMechanical =
          order.assignedToMechanical || order.AssignedToMechanical;
        const isElectrical = assignedElectrical === currentUserId;
        const isMechanical = assignedMechanical === currentUserId;
        return isElectrical || isMechanical;
      });
      setWorkOrders(myOrders);
    } catch (error) {
      console.error("Fetch work orders error:", error);
      message.error("Không thể tải danh sách nhiệm vụ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpareParts = async () => {
    try {
      const parts = await sparePartService.getAll();
      setSparePartsList(parts || []);
    } catch (error) {
      console.error("Fetch spare parts error:", error);
    }
  };

  const getMyTaskType = (workOrder) => {
    if (!workOrder) return null;
    const isElectrical = workOrder.assignedToElectrical === currentUserId;
    const isMechanical = workOrder.assignedToMechanical === currentUserId;
    if (isElectrical && isMechanical) {
      return "Both";
    }
    if (isElectrical) {
      return "Electrical";
    }
    if (isMechanical) {
      return "Mechanical";
    }
    return null;
  };

  // ✅ Lấy trạng thái của work order
  const getMyStatus = (workOrder) => {
    if (!workOrder) return "Chờ xử lý";
    const taskType = getMyTaskType(workOrder);
    
    // Nếu là Electrical, lấy electricalStatus
    if (taskType === "Electrical") {
      return workOrder.electricalStatus || "Chờ xử lý";
    }
    
    // Nếu là Mechanical, lấy mechanicalStatus
    if (taskType === "Mechanical") {
      return workOrder.mechanicalStatus || "Chờ xử lý";
    }
    
    // Nếu làm cả 2, lấy status chung
    if (taskType === "Both") {
      return workOrder.status || "Chờ xử lý";
    }
    
    return "Chờ xử lý";
  };

  const getMyChecklistItems = (workOrder) => {
    if (!workOrder) return [];
    const taskType = getMyTaskType(workOrder);
    if (!taskType || !workOrder.checklistItems) return [];
    if (taskType === "Both") {
      return workOrder.checklistItems;
    }
    return workOrder.checklistItems.filter(
      (item) => item.category === taskType
    );
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "workOrderCode",
      key: "workOrderCode",
      width: 110,
      fixed: "left",
      render: (text, record) => (
        <strong>
          {text || `WO${String(record?.workOrderId || 0).padStart(3, "0")}`}
        </strong>
      ),
    },
    {
      title: "Thiết bị",
      key: "equipment",
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: "#1890ff" }}>
            {record?.equipmentCode || "-"}
          </div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {record?.equipmentName || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Vị trí",
      key: "location",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "12px" }}>{record?.lineName || "-"}</div>
          <div style={{ fontSize: "11px", color: "#888" }}>
            {record?.stageName || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Loại công việc",
      key: "taskType",
      width: 130,
      render: (_, record) => {
        if (!record) return <Tag>-</Tag>;
        const taskType = getMyTaskType(record);
        if (taskType === "Electrical") {
          return (
            <Tag icon={<ThunderboltOutlined />} color="blue">
              Điện
            </Tag>
          );
        }
        if (taskType === "Mechanical") {
          return (
            <Tag icon={<ToolOutlined />} color="green">
              Cơ khí
            </Tag>
          );
        }
        if (taskType === "Both") {
          return <Tag color="purple">Cả Điện & Cơ khí</Tag>;
        }
        return <Tag>Không xác định</Tag>;
      },
    },
    {
      title: "Ngày thực hiện",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      width: 130,
      render: (text, record) => {
        if (!text) return "-";
        const scheduledDate = dayjs(text);
        const today = dayjs();
        const isPast =
          scheduledDate.isBefore(today, "day") && record?.status !== "Hoàn thành";
        const isToday = scheduledDate.isSame(today, "day");
        return (
          <div
            style={{
              fontSize: "12px",
              color: isPast ? "#ff4d4f" : isToday ? "#faad14" : "inherit",
              fontWeight: isPast || isToday ? 500 : "normal",
            }}
          >
            {scheduledDate.format("DD/MM/YYYY")}
            {isPast && <Badge status="error" style={{ marginLeft: 8 }} />}
            {isToday && <Badge status="processing" style={{ marginLeft: 8 }} />}
          </div>
        );
      },
    },
    {
      title: "Tiến độ",
      key: "progress",
      width: 120,
      render: (_, record) => {
        if (!record) return "-";
        const myItems = getMyChecklistItems(record);
        const total = myItems.length;
        const completed = myItems.filter((item) => item.isChecked).length;
        return (
          <div>
            <Text style={{ fontSize: 12 }}>
              <strong>
                {completed}/{total}
              </strong>{" "}
              công việc
            </Text>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status, record) => {
        // ✅ Lấy trạng thái riêng của KTV hiện tại
        const myStatus = getMyStatus(record);
        
        let color = "default";
        let icon = null;
        let text = myStatus || "-";
        
        if (myStatus === "Đang thực hiện") {
          color = "processing";
          icon = <PlayCircleOutlined />;
          text = "Đang thực hiện";
        } else if (myStatus === "Chờ xử lý") {
          color = "warning";
          icon = <ClockCircleOutlined />;
          text = "Chờ xử lý";
        } else if (myStatus === "Hoàn thành") {
          color = "success";
          icon = <CheckCircleOutlined />;
          text = "Đã hoàn thành";
        } else if (myStatus === "Đã hủy") {
          color = "error";
          icon = <StopOutlined />;
          text = "Đã hủy";
        } else if (myStatus === "N/A") {
          color = "default";
          text = "Không giao";
        }
        
        return (
          <Tag icon={icon} color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => {
        if (!record) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const scheduledDate = new Date(record.scheduledDate);
        scheduledDate.setHours(0, 0, 0, 0);
        const isScheduledDateReached = scheduledDate <= today;

        const items = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "Chi tiết",
            onClick: () => handleViewDetail(record),
          },
          isScheduledDateReached && {
            key: "history",
            icon: <FileTextOutlined />,
            label: "Lịch sử linh kiện",
            onClick: () => handleViewSparePartsHistory(record),
          },
          isScheduledDateReached && (record.status === "Chờ xử lý" || record.status === "Đang thực hiện") && {
            key: "execute",
            icon: <CheckCircleOutlined />,
            label: "Thực hiện",
            onClick: () => handleOpenChecklist(record),
          },
        ].filter(Boolean);

        return (
          <Dropdown
            menu={{ items }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button
              type="text"
              icon={<DownOutlined style={{ fontSize: 14 }} />}
              size="small"
            />
          </Dropdown>
        );
      },
    },
  ];

  const handleViewDetail = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setDetailModalVisible(true);
  };

  const handleViewSparePartsHistory = async (workOrder) => {
    try {
      setLoading(true);
      setSelectedWorkOrder(workOrder);
      const histories = await replacementHistoryService.getByWorkOrderId(
        workOrder.workOrderId
      );
      setReplacementHistories(histories || []);
      setHistoryModalVisible(true);
    } catch (error) {
      console.error("Fetch replacement history error:", error);
      message.error("Không thể tải lịch sử linh kiện: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordReplacement = (record) => {
    if (
      record.status !== "Đã duyệt cấp phát" &&
      record.status !== "Đã cấp phát"
    ) {
      message.warning(
        "Chỉ có thể ghi nhận thay thế cho linh kiện đã được duyệt cấp phát"
      );
      return;
    }
    setSelectedRecord(record);
    setActualQuantity(record.actualQuantityUsed || 0);
    setRecordModalVisible(true);
  };

  const handleSubmitActualQuantity = async () => {
    try {
      if (actualQuantity < 0) {
        message.error("Số lượng sử dụng không được âm");
        return;
      }

      setLoading(true);
      const quantityToReturn = selectedRecord.quantity - actualQuantity;

      if (quantityToReturn < 0) {
        message.error(
          `Số lượng sử dụng không được vượt quá số lượng yêu cầu (${selectedRecord.quantity})`
        );
        return;
      }

      // Use recordActualUsage endpoint for proper handling
      const payload = {
        actualQuantityUsed: actualQuantity,
        status: quantityToReturn > 0 ? "Chờ trả lại" : "Hoàn thành",
      };

      await replacementHistoryService.recordActualUsage(
        selectedRecord.replacementID,
        payload
      );

      message.success("Ghi nhận thay thế thành công!");
      setRecordModalVisible(false);
      setSelectedRecord(null);
      setActualQuantity(0);

      // Reload lịch sử linh kiện
      if (selectedWorkOrder?.workOrderId) {
        const histories = await replacementHistoryService.getByWorkOrderId(
          selectedWorkOrder.workOrderId
        );
        setReplacementHistories(histories || []);
      }
    } catch (error) {
      console.error("Record replacement error:", error);
      message.error("Ghi nhận thay thế thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChecklist = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setChecklistModalVisible(true);

    // Khởi tạo notes từ checklist items hiện có
    const notes = {};
    const items = getMyChecklistItems(workOrder);
    items.forEach((item) => {
      notes[item.checklistId] = item.notes || "";
    });
    setChecklistNotes(notes);
    setSpareParts([]); // Reset danh sách linh kiện
  };

  const handleNoteChange = (checklistId, value) => {
    setChecklistNotes((prev) => ({
      ...prev,
      [checklistId]: value,
    }));
  };

  const addSparePart = () => {
    setSpareParts([
      ...spareParts,
      { key: Date.now(), partName: "", quantity: 1, notes: "" },
    ]);
  };

  const removeSparePart = (key) => {
    setSpareParts(spareParts.filter((item) => item.key !== key));
  };

  const updateSparePart = (key, field, value) => {
    setSpareParts(
      spareParts.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSendSparePartsRequest = async () => {
    // Kiểm tra danh sách linh kiện không trống
    if (spareParts.length === 0) {
      message.warning("Vui lòng thêm ít nhất một linh kiện trước khi gửi!");
      return;
    }

    // Kiểm tra tất cả linh kiện đều đã được chọn
    const incompleteItems = spareParts.filter((item) => !item.partName);
    if (incompleteItems.length > 0) {
      message.warning("Vui lòng chọn tên linh kiện cho tất cả các dòng!");
      return;
    }

    // Kiểm tra số lượng hợp lệ
    const invalidItems = spareParts.filter(
      (item) => !item.quantity || item.quantity <= 0
    );
    if (invalidItems.length > 0) {
      message.warning(
        "Vui lòng nhập số lượng hợp lệ (> 0) cho tất cả linh kiện!"
      );
      return;
    }

    try {
      setLoading(true);

      // Chuẩn bị dữ liệu gửi
      const requestData = {
        workOrderId: selectedWorkOrder.workOrderId,
        requestedBy: currentUserId,
        items: spareParts.map((item) => ({
          partName: item.partName,
          quantity: item.quantity,
        })),
        requestDate: dayjs().toISOString(), // Sử dụng ISO format
        notes: "", // Ghi chú bổ sung (tùy chọn)
      };

      console.log("📤 Gửi yêu cầu linh kiện:", requestData);

      // Gửi request đến API
      const response = await fetch(
        "https://localhost:7003/api/ReplacementHistories/request-from-maintenance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Lỗi API:", errorData);
        throw new Error(
          errorData.message ||
            `API Error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("✅ Yêu cầu thành công:", result);
      message.success("Gửi yêu cầu linh kiện thành công!");
      setSpareParts([]); // Reset danh sách
    } catch (error) {
      console.error("❌ Chi tiết lỗi:", error);
      message.error("Gửi yêu cầu thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckItem = async (item, checked) => {
    try {
      setUpdatingChecklist(true);

      // Nếu đang tick item và work order đang Pending → Tự động chuyển sang InProgress
      if (checked && selectedWorkOrder.status === "Chờ xử lý") {
        await startWorkOrder(selectedWorkOrder.workOrderId);
        message.success("Đã bắt đầu thực hiện công việc!");
      }

      // Lấy note từ state (đã nhập sẵn)
      const notes = checklistNotes[item.checklistId] || "";

      // Cập nhật checklist item
      await updateChecklistItem(item.checklistId, {
        isChecked: checked,
        notes: notes,
      });

      message.success(
        checked ? "Đã hoàn thành bước này!" : "Đã bỏ tick bước này!"
      );

      // Reload work orders để cập nhật UI
      await fetchWorkOrders();

      // Reload selected work order để cập nhật modal
      const response = await getMyWorkOrders();
      const orders = response?.data || [];
      const updatedWorkOrder = orders.find(
        (wo) => wo.workOrderId === selectedWorkOrder.workOrderId
      );
      if (updatedWorkOrder) {
        setSelectedWorkOrder(updatedWorkOrder);
      }
    } catch (error) {
      message.error("Cập nhật checklist thất bại: " + error.message);
    } finally {
      setUpdatingChecklist(false);
    }
  };

  const handleCompleteFromChecklist = async () => {
    const myItems = getMyChecklistItems(selectedWorkOrder);
    const allCompleted = myItems.every((item) => item.isChecked);
    if (!allCompleted) {
      message.warning(
        "Vui lòng hoàn thành tất cả các bước trước khi kết thúc!"
      );
      return;
    }

    // Gọi API hoàn thành luôn, không cần modal nhập ghi chú tổng thể nữa
    try {
      setLoading(true);
      const checklistItems = myItems.map((item) => ({
        checklistId: item.checklistId,
        isChecked: true,
        notes: item.notes || "", // Đã lưu notes ở từng bước rồi
      }));

      const completionData = {
        checklistItems: checklistItems,
        overallNotes: "", // Không cần ghi chú tổng thể
      };

      await completeWorkOrder(selectedWorkOrder.workOrderId, completionData);

      message.success("Hoàn thành phần công việc của bạn thành công!");
      setChecklistModalVisible(false);
      setChecklistNotes({});
      fetchWorkOrders();
    } catch (error) {
      message.error("Hoàn thành nhiệm vụ thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredWorkOrders = () => {
    if (filterStatus === "all") {
      return workOrders;
    }
    // ✅ Filter theo trạng thái riêng của KTV hiện tại
    return workOrders.filter((wo) => getMyStatus(wo) === filterStatus);
  };

  const getStatusCount = (status) => {
    if (status === "all") return workOrders.length;
    // ✅ Đếm theo trạng thái riêng của KTV hiện tại
    return workOrders.filter((wo) => getMyStatus(wo) === status).length;
  };

  const getTaskProgress = () => {
    // ✅ Tính tiến độ theo trạng thái riêng của KTV hiện tại
    const completed = workOrders.filter((t) => getMyStatus(t) === "Hoàn thành").length;
    const total = workOrders.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className={styles.maintenanceTasks}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#1890ff",
                }}
              >
                {workOrders.length}
              </div>
              <div style={{ fontSize: "14px", color: "#888", marginTop: 8 }}>
                Tổng nhiệm vụ
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#52c41a",
                }}
              >
                {getStatusCount("Hoàn thành")}
              </div>
              <div style={{ fontSize: "14px", color: "#888", marginTop: 8 }}>
                Đã hoàn thành
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#faad14",
                }}
              >
                {getStatusCount("Đang thực hiện")}
              </div>
              <div style={{ fontSize: "14px", color: "#888", marginTop: 8 }}>
                Đang thực hiện
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div style={{ textAlign: "center" }}>
              <Progress
                type="circle"
                percent={getTaskProgress()}
                width={80}
                strokeColor="#52c41a"
              />
              <div style={{ fontSize: "14px", color: "#888", marginTop: 8 }}>
                Tiến độ hoàn thành
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <ToolOutlined />
            <span>Danh sách nhiệm vụ bảo trì</span>
          </Space>
        }
        extra={
          <Space>
            <Button type="primary" onClick={fetchWorkOrders} loading={loading}>
              Làm mới
            </Button>
          </Space>
        }
        bordered={false}
      >
        <div className={styles.filterTabs}>
          <Space size="middle">
            <Button
              type={filterStatus === "all" ? "primary" : "default"}
              onClick={() => setFilterStatus("all")}
            >
              Tất cả ({getStatusCount("all")})
            </Button>
            <Badge count={getStatusCount("Chờ xử lý")} color="orange">
              <Button
                type={filterStatus === "Chờ xử lý" ? "primary" : "default"}
                onClick={() => setFilterStatus("Chờ xử lý")}
              >
                Chờ xử lý
              </Button>
            </Badge>
            <Badge count={getStatusCount("Đang thực hiện")} color="blue">
              <Button
                type={filterStatus === "Đang thực hiện" ? "primary" : "default"}
                onClick={() => setFilterStatus("Đang thực hiện")}
              >
                Đang thực hiện
              </Button>
            </Badge>
            <Badge count={getStatusCount("Hoàn thành")} color="green">
              <Button
                type={filterStatus === "Hoàn thành" ? "primary" : "default"}
                onClick={() => setFilterStatus("Hoàn thành")}
              >
                Hoàn thành
              </Button>
            </Badge>
          </Space>
        </div>

        <Divider />

        <Table
          columns={columns}
          dataSource={getFilteredWorkOrders()}
          rowKey="workOrderId"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} nhiệm vụ`,
          }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            <span>Thực hiện công việc bảo trì</span>
          </Space>
        }
        open={checklistModalVisible}
        onCancel={() => {
          setChecklistModalVisible(false);
          setChecklistNotes({});
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setChecklistModalVisible(false);
              setChecklistNotes({});
            }}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
          <Button
            key="complete"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleCompleteFromChecklist}
            disabled={
              !selectedWorkOrder ||
              !getMyChecklistItems(selectedWorkOrder).every(
                (item) => item.isChecked
              )
            }
            style={{
              backgroundColor: "#283652",
              borderColor: "#283652",
              color: "#fff",
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Hoàn thành công việc
          </Button>,
        ]}
        width={1200}
      >
        {selectedWorkOrder && (
          <div>
            <Alert
              message={
                <div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div>
                        <strong>Thiết bị:</strong>{" "}
                        {selectedWorkOrder.equipmentCode} -{" "}
                        {selectedWorkOrder.equipmentName}
                      </div>
                      <div>
                        <strong>Vị trí:</strong> {selectedWorkOrder.lineName} /{" "}
                        {selectedWorkOrder.stageName}
                      </div>
                    </Col>
                    <Col span={12}>
                      <div>
                        <strong>Loại công việc:</strong>{" "}
                        {getMyTaskType(selectedWorkOrder) === "Electrical" ? (
                          <Tag icon={<ThunderboltOutlined />} color="blue">
                            Điện
                          </Tag>
                        ) : getMyTaskType(selectedWorkOrder) ===
                          "Mechanical" ? (
                          <Tag icon={<ToolOutlined />} color="green">
                            Cơ khí
                          </Tag>
                        ) : (
                          <Tag color="purple">Cả Điện & Cơ khí</Tag>
                        )}
                      </div>
                      <div>
                        <strong>Ngày thực hiện:</strong>{" "}
                        {dayjs(selectedWorkOrder.scheduledDate).format("DD/MM/YYYY")}
                      </div>
                    </Col>
                  </Row>
                </div>
              }
              type="info"
              style={{ marginBottom: 16 }}
            />

            {(() => {
              const myItems = getMyChecklistItems(selectedWorkOrder);
              const total = myItems.length;
              const completed = myItems.filter((item) => item.isChecked).length;
              const percent =
                total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div style={{ marginBottom: 16 }}>
                  <Progress
                    percent={percent}
                    status={
                      percent === 100
                        ? "success"
                        : completed > 0
                        ? "active"
                        : "normal"
                    }
                  />
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "12px",
                      color: "#888",
                      marginTop: 4,
                    }}
                  >
                    {completed} / {total} bước đã hoàn thành
                  </div>
                </div>
              );
            })()}

            <Divider />

            {/* Checklist Items with Note Input */}
            {getMyTaskType(selectedWorkOrder) === "Both" ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Card
                    title={
                      <>
                        <ThunderboltOutlined style={{ color: "#1890ff" }} />{" "}
                        Công việc Điện
                      </>
                    }
                    size="small"
                    style={{ maxHeight: 500, overflow: "auto" }}
                  >
                    <List
                      dataSource={getMyChecklistItems(selectedWorkOrder).filter(
                        (item) => item.category === "Electrical"
                      )}
                      renderItem={(item, index) => (
                        <List.Item
                          style={{ display: "block", paddingBottom: 16 }}
                        >
                          <Row gutter={8} align="top">
                            <Col flex="none">
                              <Badge
                                count={index + 1}
                                style={{ backgroundColor: "#1890ff" }}
                              />
                            </Col>
                            <Col flex="auto">
                              <Checkbox
                                checked={item.isChecked}
                                onChange={(e) =>
                                  handleCheckItem(item, e.target.checked)
                                }
                                disabled={updatingChecklist || item.isChecked}
                                style={{
                                  textDecoration: item.isChecked
                                    ? "line-through"
                                    : "none",
                                  fontWeight: 500,
                                  marginBottom: 8,
                                }}
                              >
                                {item.stepName}
                              </Checkbox>
                              {item.stepDescription && (
                                <div style={{ marginBottom: 8 }}>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    {item.stepDescription}
                                  </Text>
                                </div>
                              )}
                              {!item.isChecked ? (
                                <Input.TextArea
                                  placeholder="Nhập ghi chú cho bước này (tùy chọn)..."
                                  rows={2}
                                  value={checklistNotes[item.checklistId] || ""}
                                  onChange={(e) =>
                                    handleNoteChange(
                                      item.checklistId,
                                      e.target.value
                                    )
                                  }
                                  disabled={updatingChecklist}
                                  style={{ fontSize: 12 }}
                                />
                              ) : (
                                <>
                                  {item.completedDate && (
                                    <div style={{ marginTop: 4 }}>
                                      <Text
                                        type="success"
                                        style={{ fontSize: 11 }}
                                      >
                                        ✓ Hoàn thành:{" "}
                                        {dayjs(item.completedDate).format(
                                          "DD/MM/YYYY HH:mm"
                                        )}
                                      </Text>
                                    </div>
                                  )}
                                  {item.notes && (
                                    <div
                                      style={{
                                        marginTop: 4,
                                        padding: 8,
                                        background: "#f5f5f5",
                                        borderRadius: 4,
                                      }}
                                    >
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 11 }}
                                      >
                                        📝 Ghi chú: {item.notes}
                                      </Text>
                                    </div>
                                  )}
                                </>
                              )}
                            </Col>
                          </Row>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    title={
                      <>
                        <ToolOutlined style={{ color: "#52c41a" }} /> Công việc
                        Cơ khí
                      </>
                    }
                    size="small"
                    style={{ maxHeight: 500, overflow: "auto" }}
                  >
                    <List
                      dataSource={getMyChecklistItems(selectedWorkOrder).filter(
                        (item) => item.category === "Mechanical"
                      )}
                      renderItem={(item, index) => (
                        <List.Item
                          style={{ display: "block", paddingBottom: 16 }}
                        >
                          <Row gutter={8} align="top">
                            <Col flex="none">
                              <Badge
                                count={index + 1}
                                style={{ backgroundColor: "#52c41a" }}
                              />
                            </Col>
                            <Col flex="auto">
                              <Checkbox
                                checked={item.isChecked}
                                onChange={(e) =>
                                  handleCheckItem(item, e.target.checked)
                                }
                                disabled={updatingChecklist || item.isChecked}
                                style={{
                                  textDecoration: item.isChecked
                                    ? "line-through"
                                    : "none",
                                  fontWeight: 500,
                                  marginBottom: 8,
                                }}
                              >
                                {item.stepName}
                              </Checkbox>
                              {item.stepDescription && (
                                <div style={{ marginBottom: 8 }}>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    {item.stepDescription}
                                  </Text>
                                </div>
                              )}
                              {!item.isChecked ? (
                                <Input.TextArea
                                  placeholder="Nhập ghi chú cho bước này (tùy chọn)..."
                                  rows={2}
                                  value={checklistNotes[item.checklistId] || ""}
                                  onChange={(e) =>
                                    handleNoteChange(
                                      item.checklistId,
                                      e.target.value
                                    )
                                  }
                                  disabled={updatingChecklist}
                                  style={{ fontSize: 12 }}
                                />
                              ) : (
                                <>
                                  {item.completedDate && (
                                    <div style={{ marginTop: 4 }}>
                                      <Text
                                        type="success"
                                        style={{ fontSize: 11 }}
                                      >
                                        ✓ Hoàn thành:{" "}
                                        {dayjs(item.completedDate).format(
                                          "DD/MM/YYYY HH:mm"
                                        )}
                                      </Text>
                                    </div>
                                  )}
                                  {item.notes && (
                                    <div
                                      style={{
                                        marginTop: 4,
                                        padding: 8,
                                        background: "#f5f5f5",
                                        borderRadius: 4,
                                      }}
                                    >
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 11 }}
                                      >
                                        📝 Ghi chú: {item.notes}
                                      </Text>
                                    </div>
                                  )}
                                </>
                              )}
                            </Col>
                          </Row>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            ) : (
              <Card
                title={
                  getMyTaskType(selectedWorkOrder) === "Electrical" ? (
                    <>
                      <ThunderboltOutlined style={{ color: "#1890ff" }} /> Công
                      việc Điện
                    </>
                  ) : (
                    <>
                      <ToolOutlined style={{ color: "#52c41a" }} /> Công việc Cơ
                      khí
                    </>
                  )
                }
                size="small"
              >
                <List
                  dataSource={getMyChecklistItems(selectedWorkOrder)}
                  renderItem={(item, index) => (
                    <List.Item style={{ display: "block", paddingBottom: 16 }}>
                      <Row gutter={8} align="top">
                        <Col flex="none">
                          <Badge
                            count={index + 1}
                            style={{
                              backgroundColor:
                                getMyTaskType(selectedWorkOrder) ===
                                "Electrical"
                                  ? "#1890ff"
                                  : "#52c41a",
                            }}
                          />
                        </Col>
                        <Col flex="auto">
                          <Checkbox
                            checked={item.isChecked}
                            onChange={(e) =>
                              handleCheckItem(item, e.target.checked)
                            }
                            disabled={updatingChecklist || item.isChecked}
                            style={{
                              textDecoration: item.isChecked
                                ? "line-through"
                                : "none",
                              fontWeight: 500,
                              marginBottom: 8,
                            }}
                          >
                            {item.stepName}
                          </Checkbox>
                          {item.stepDescription && (
                            <div style={{ marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {item.stepDescription}
                              </Text>
                            </div>
                          )}
                          {!item.isChecked ? (
                            <Input.TextArea
                              placeholder="Nhập ghi chú cho bước này (tùy chọn)..."
                              rows={2}
                              value={checklistNotes[item.checklistId] || ""}
                              onChange={(e) =>
                                handleNoteChange(
                                  item.checklistId,
                                  e.target.value
                                )
                              }
                              disabled={updatingChecklist}
                              style={{ fontSize: 12 }}
                            />
                          ) : (
                            <>
                              {item.completedDate && (
                                <div style={{ marginTop: 4 }}>
                                  <Text type="success" style={{ fontSize: 11 }}>
                                    ✓ Hoàn thành:{" "}
                                    {dayjs(item.completedDate).format(
                                      "DD/MM/YYYY HH:mm"
                                    )}
                                  </Text>
                                </div>
                              )}
                              {item.notes && (
                                <div
                                  style={{
                                    marginTop: 4,
                                    padding: 8,
                                    background: "#f5f5f5",
                                    borderRadius: 4,
                                  }}
                                >
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 11 }}
                                  >
                                    📝 Ghi chú: {item.notes}
                                  </Text>
                                </div>
                              )}
                            </>
                          )}
                        </Col>
                      </Row>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            <Divider />

            <Card
              title={
                <>
                  <FileTextOutlined style={{ color: "#faad14" }} /> Yêu cầu linh
                  kiện vật tư
                </>
              }
              size="small"
              style={{ marginBottom: 16 }}
            >
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Nhấn nút "+ Thêm" để yêu cầu linh kiện cần thiết cho công việc
                  này
                </Text>
              </div>
              {spareParts.length > 0 ? (
                <AntTable
                  columns={[
                    {
                      title: "Tên linh kiện",
                      dataIndex: "partName",
                      key: "partName",
                      render: (_, record) => (
                        <Select
                          placeholder="Chọn linh kiện..."
                          value={record.partName || undefined}
                          onChange={(value) =>
                            updateSparePart(record.key, "partName", value)
                          }
                          style={{ width: "100%" }}
                          size="small"
                          allowClear
                        >
                          {sparePartsList.map((part) => (
                            <Select.Option
                              key={part.partId}
                              value={part.partName}
                            >
                              {part.partName} (Mã: {part.partNumber})
                            </Select.Option>
                          ))}
                        </Select>
                      ),
                    },
                    {
                      title: "Số lượng cần",
                      dataIndex: "quantity",
                      key: "quantity",
                      width: 100,
                      render: (_, record) => (
                        <InputNumber
                          min={1}
                          value={record.quantity}
                          onChange={(value) =>
                            updateSparePart(record.key, "quantity", value)
                          }
                          size="small"
                          style={{ width: "100%" }}
                        />
                      ),
                    },
                    {
                      title: "Tồn kho",
                      key: "stock",
                      width: 100,
                      render: (_, record) => {
                        const sparePart = sparePartsList.find(
                          (part) => part.partID === record.partID
                        );
                        return sparePart ? sparePart.quantity : 0;
                      },
                    },
                    {
                      title: "Thao tác",
                      key: "action",
                      width: 80,
                      render: (_, record) => (
                        <Button
                          type="link"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeSparePart(record.key)}
                        >
                          Xóa
                        </Button>
                      ),
                    },
                  ]}
                  dataSource={spareParts}
                  rowKey="key"
                  pagination={false}
                  size="small"
                />
              ) : (
                <Alert
                  message="Chưa có yêu cầu linh kiện"
                  description="Nhấn nút Thêm phía dưới để yêu cầu linh kiện"
                  type="info"
                  showIcon
                  style={{ marginBottom: 12 }}
                />
              )}
              <Space style={{ width: "100%", marginTop: 12, gap: 8 }}>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  flex={1}
                  onClick={addSparePart}
                >
                  Thêm linh kiện
                </Button>
                <Button
                  type="primary"
                  onClick={handleSendSparePartsRequest}
                  loading={loading}
                  disabled={spareParts.length === 0}
                  flex={1}
                >
                  Gửi yêu cầu
                </Button>
              </Space>
            </Card>

            <Alert
              message="Lưu ý"
              description="Nhập ghi chú (nếu cần) vào ô bên dưới mỗi bước, sau đó tick vào checkbox để hoàn thành. Khi tick bước đầu tiên, công việc sẽ tự động chuyển sang trạng thái 'Đang thực hiện'."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>
        )}
      </Modal>

      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Chi tiết phiếu bảo trì</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setDetailModalVisible(false)}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {selectedWorkOrder && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã phiếu" span={1}>
                <strong>
                  {selectedWorkOrder.workOrderCode ||
                    `WO${String(selectedWorkOrder.workOrderId).padStart(
                      3,
                      "0"
                    )}`}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                {selectedWorkOrder.status === "Đang thực hiện" ? (
                  <Tag icon={<PlayCircleOutlined />} color="processing">
                    Đang thực hiện
                  </Tag>
                ) : selectedWorkOrder.status === "Chờ xử lý" ? (
                  <Tag icon={<ClockCircleOutlined />} color="warning">
                    Chờ xử lý
                  </Tag>
                ) : selectedWorkOrder.status === "Hoàn thành" ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    Hoàn thành
                  </Tag>
                ) : (
                  <Tag>{selectedWorkOrder.status}</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Thiết bị" span={2}>
                <strong>{selectedWorkOrder.equipmentCode}</strong> -{" "}
                {selectedWorkOrder.equipmentName}
              </Descriptions.Item>
              <Descriptions.Item label="Vị trí" span={2}>
                {selectedWorkOrder.lineName} / {selectedWorkOrder.stageName}
              </Descriptions.Item>
              <Descriptions.Item label="Loại công việc" span={1}>
                {getMyTaskType(selectedWorkOrder) === "Electrical" ? (
                  <Tag icon={<ThunderboltOutlined />} color="blue">
                    Điện
                  </Tag>
                ) : getMyTaskType(selectedWorkOrder) === "Mechanical" ? (
                  <Tag icon={<ToolOutlined />} color="green">
                    Cơ khí
                  </Tag>
                ) : (
                  <Tag color="purple">Cả Điện & Cơ khí</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày phân công" span={1}>
                {selectedWorkOrder.assignedDate
                  ? dayjs(selectedWorkOrder.assignedDate).format("DD/MM/YYYY")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày thực hiện" span={1}>
                {dayjs(selectedWorkOrder.scheduledDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              {selectedWorkOrder.startedDate && (
                <Descriptions.Item label="Bắt đầu lúc" span={1}>
                  {dayjs(selectedWorkOrder.startedDate).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
              )}
              {selectedWorkOrder.completedDate && (
                <Descriptions.Item label="Hoàn thành lúc" span={2}>
                  {dayjs(selectedWorkOrder.completedDate).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
              )}
              {selectedWorkOrder.notes && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedWorkOrder.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            {getMyChecklistItems(selectedWorkOrder).length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Divider>Danh sách công việc của bạn</Divider>
                <Card
                  title={
                    getMyTaskType(selectedWorkOrder) === "Electrical" ? (
                      <span>
                        <ThunderboltOutlined style={{ color: "#1890ff" }} />{" "}
                        Công việc Điện
                      </span>
                    ) : getMyTaskType(selectedWorkOrder) === "Mechanical" ? (
                      <span>
                        <ToolOutlined style={{ color: "#52c41a" }} /> Công việc
                        Cơ khí
                      </span>
                    ) : (
                      <span>
                        <Tag color="purple">Cả Điện & Cơ khí</Tag>
                      </span>
                    )
                  }
                  size="small"
                >
                  <List
                    dataSource={getMyChecklistItems(selectedWorkOrder)}
                    renderItem={(item, index) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Badge
                              count={index + 1}
                              style={{
                                backgroundColor:
                                  getMyTaskType(selectedWorkOrder) ===
                                  "Electrical"
                                    ? "#1890ff"
                                    : getMyTaskType(selectedWorkOrder) ===
                                      "Mechanical"
                                    ? "#52c41a"
                                    : "#722ed1",
                              }}
                            />
                          }
                          title={
                            <Checkbox checked={item.isChecked} disabled>
                              {item.stepName}
                            </Checkbox>
                          }
                          description={
                            <div>
                              {item.stepDescription && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {item.stepDescription}
                                </Text>
                              )}
                              {item.notes && (
                                <div style={{ marginTop: 4 }}>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 11 }}
                                  >
                                    Ghi chú: {item.notes}
                                  </Text>
                                </div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Lịch sử linh kiện</span>
          </Space>
        }
        open={historyModalVisible}
        onCancel={() => {
          setHistoryModalVisible(false);
          setReplacementHistories([]);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setHistoryModalVisible(false);
              setReplacementHistories([]);
            }}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
        ]}
        width={1000}
      >
        {selectedWorkOrder && (
          <div>
            <Alert
              message={`Phiếu bảo trì: ${
                selectedWorkOrder.workOrderCode ||
                `WO${String(selectedWorkOrder.workOrderId).padStart(3, "0")}`
              } - ${selectedWorkOrder.equipmentCode} (${
                selectedWorkOrder.equipmentName
              })`}
              type="info"
              style={{ marginBottom: 16 }}
            />

            {replacementHistories && replacementHistories.length > 0 ? (
              <AntTable
                columns={[
                  {
                    title: "Tên linh kiện",
                    dataIndex: "partName",
                    key: "partName",
                    render: (text, record) => (
                      <div>
                        <div style={{ fontWeight: 500 }}>{text || "-"}</div>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          Mã: {record.partNumber || "-"}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Số lượng",
                    key: "quantity",
                    width: 100,
                    render: (_, record) => (
                      <div>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          Yêu cầu: <strong>{record.quantity}</strong>
                        </div>
                        {record.actualQuantityUsed !== null &&
                          record.actualQuantityUsed !== undefined && (
                            <div style={{ fontSize: "12px", color: "#52c41a" }}>
                              Sử dụng:{" "}
                              <strong>{record.actualQuantityUsed}</strong>
                            </div>
                          )}
                        {record.quantityToReturn !== null &&
                          record.quantityToReturn !== undefined && (
                            <div style={{ fontSize: "12px", color: "#faad14" }}>
                              Trả lại:{" "}
                              <strong>{record.quantityToReturn}</strong>
                            </div>
                          )}
                      </div>
                    ),
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "status",
                    key: "status",
                    width: 140,
                    render: (status) => {
                      let color = "default";
                      let text = status || "-";
                      if (status === "Chờ duyệt cấp phát") {
                        color = "warning";
                      } else if (
                        status === "Đã cấp phát" ||
                        status === "Đã duyệt cấp phát" ||
                        status === "Được cấp phát"
                      ) {
                        color = "blue";
                      } else if (status === "Chờ trả lại") {
                        color = "orange";
                      } else if (status === "Hoàn thành") {
                        color = "success";
                      }
                      return <Tag color={color}>{text}</Tag>;
                    },
                  },
                  {
                    title: "Ngày yêu cầu",
                    dataIndex: "replacedDate",
                    key: "replacedDate",
                    width: 120,
                    render: (date) =>
                      date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
                  },
                  {
                    title: "Ghi chú",
                    dataIndex: "remarks",
                    key: "remarks",
                    render: (text) =>
                      text ? (
                        <Tooltip title={text}>
                          <span style={{ color: "#666", fontSize: "12px" }}>
                            {text.length > 20
                              ? `${text.substring(0, 20)}...`
                              : text}
                          </span>
                        </Tooltip>
                      ) : (
                        <span style={{ color: "#ccc" }}>-</span>
                      ),
                  },
                  {
                    title: "Thao tác",
                    key: "action",
                    width: 120,
                    render: (_, record) => (
                      <Button
                        type="primary"
                        size="small"
                        disabled={
                          record.status !== "Đã duyệt cấp phát" &&
                          record.status !== "Đã cấp phát"
                        }
                        onClick={() => handleRecordReplacement(record)}
                      >
                        Ghi nhận
                      </Button>
                    ),
                  },
                ]}
                dataSource={replacementHistories.map((item, idx) => ({
                  ...item,
                  key: item.replacementID || idx,
                }))}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng số ${total} linh kiện`,
                }}
                size="small"
                loading={loading}
              />
            ) : (
              <Alert
                message="Chưa có yêu cầu linh kiện"
                description="Phiếu bảo trì này chưa có yêu cầu linh kiện nào"
                type="info"
                showIcon
              />
            )}
          </div>
        )}
      </Modal>

      {/* Modal ghi nhận thay thế */}
      <Modal
        title="Ghi nhận thay thế linh kiện"
        open={recordModalVisible}
        onCancel={() => {
          setRecordModalVisible(false);
          setSelectedRecord(null);
          setActualQuantity(0);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setRecordModalVisible(false);
              setSelectedRecord(null);
              setActualQuantity(0);
            }}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleSubmitActualQuantity}
            style={{
              backgroundColor: "#283652",
              borderColor: "#283652",
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Lưu
          </Button>,
        ]}
        width={500}
      >
        {selectedRecord && (
          <div>
            <Descriptions
              bordered
              size="small"
              column={1}
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Linh kiện">
                {selectedRecord.partName}
              </Descriptions.Item>
              <Descriptions.Item label="Mã">
                {selectedRecord.partNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng yêu cầu">
                <strong>{selectedRecord.quantity}</strong>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{ fontWeight: 500, marginBottom: 8, display: "block" }}
              >
                Số lượng sử dụng thực tế (0-{selectedRecord.quantity})
              </label>
              <InputNumber
                min={0}
                max={selectedRecord.quantity}
                value={actualQuantity}
                onChange={(value) => setActualQuantity(value || 0)}
                style={{ width: "100%" }}
                placeholder="Nhập số lượng sử dụng"
              />
              {actualQuantity !== null && actualQuantity !== undefined && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 8,
                    backgroundColor: "#f0f2f5",
                    borderRadius: 4,
                  }}
                >
                  <div>
                    Số lượng sử dụng:{" "}
                    <strong style={{ color: "#52c41a" }}>
                      {actualQuantity}
                    </strong>
                  </div>
                  <div>
                    Số lượng trả lại:{" "}
                    <strong style={{ color: "#faad14" }}>
                      {selectedRecord.quantity - actualQuantity}
                    </strong>
                  </div>
                  {selectedRecord.quantity - actualQuantity > 0 && (
                    <div
                      style={{ fontSize: "12px", color: "#666", marginTop: 4 }}
                    >
                      Trạng thái sẽ chuyển sang "Chờ trả lại"
                    </div>
                  )}
                  {selectedRecord.quantity - actualQuantity === 0 && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#52c41a",
                        marginTop: 4,
                      }}
                    >
                      Trạng thái sẽ chuyển sang "Hoàn thành"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaintenanceTasks;
