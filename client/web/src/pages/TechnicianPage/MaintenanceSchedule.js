import React, { useState, useEffect } from "react";
import {
  Card,
  Calendar,
  Badge,
  Modal,
  List,
  Tag,
  Space,
  Button,
  Select,
  Row,
  Col,
  Statistic,
  Timeline,
  Empty,
  Tooltip,
  Spin,
  message,
  Typography,
  ConfigProvider,
  Descriptions,
  Divider,
  Progress,
  List as AntList,
  Checkbox,
  Alert,
  Input,
  Grid,
} from "antd";

const { useBreakpoint } = Grid;
import viVN from "antd/locale/vi_VN";
import {
  CalendarOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/vi";
import {
  getMyWorkOrders,
  startWorkOrder,
  updateChecklistItem,
  completeWorkOrder,
} from "../../services/maintenanceService";
import { authService } from "../../services/authService";
import styles from "../../styles/pages/MaintenanceSchedule.module.css";

dayjs.extend(isBetween);
dayjs.extend(localeData);
dayjs.locale("vi");

const { Option } = Select;
const { Text } = Typography;

const MaintenanceSchedule = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [startingWork, setStartingWork] = useState(false);
  const [checklistModalVisible, setChecklistModalVisible] = useState(false);
  const [checklistNotes, setChecklistNotes] = useState({});
  const [updatingChecklist, setUpdatingChecklist] = useState(false);

  const currentUser = authService.getStoredUser();
  const currentUserId = currentUser?.id || currentUser?.userId;

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const response = await getMyWorkOrders();
      if (response.success && response.data) {
        setWorkOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching work orders:", error);
      message.error("Không thể tải lịch bảo trì");
    } finally {
      setLoading(false);
    }
  };

  // Transform work orders to calendar schedule format
  const transformWorkOrdersToSchedule = () => {
    const scheduleMap = new Map();

    workOrders.forEach((wo) => {
      // Determine which date to use for display
      const displayDate = wo.scheduledDate || wo.dueDate || wo.assignedDate;
      if (!displayDate) return;

      const dateKey = dayjs(displayDate).format("YYYY-MM-DD");

      // ✅ Xác định KTV hiện tại là Electrical hay Mechanical
      const isElectrical = wo.assignedToElectrical === currentUserId;
      const isMechanical = wo.assignedToMechanical === currentUserId;

      // ✅ Tính checklist items CHỈ của KTV hiện tại
      let myTotalItems = 0;
      let myCompletedItems = 0;
      let myProgress = 0;

      if (wo.checklistItems && wo.checklistItems.length > 0) {
        // Lọc checklist items của KTV hiện tại
        const myItems = wo.checklistItems.filter((item) => {
          if (isElectrical && item.category === "Electrical") return true;
          if (isMechanical && item.category === "Mechanical") return true;
          return false;
        });

        myTotalItems = myItems.length;
        myCompletedItems = myItems.filter((item) => item.isChecked).length;
        myProgress =
          myTotalItems > 0
            ? Math.round((myCompletedItems / myTotalItems) * 100)
            : 0;
      }

      const schedule = {
        key: wo.workOrderId,
        workOrderId: wo.workOrderId,
        planCode: wo.workOrderCode,
        equipmentCode: wo.equipmentCode || "-",
        equipmentName: wo.equipmentName || "-",
        lineName: wo.lineName || "-",
        stageName: wo.stageName || "",
        taskType: "Bảo trì định kỳ",
        scheduledTime: wo.scheduledDate
          ? dayjs(wo.scheduledDate).format("HH:mm")
          : "-",
        dueTime: wo.dueDate ? dayjs(wo.dueDate).format("HH:mm") : "-",
        status: wo.status,
        assignedDate: wo.assignedDate,
        scheduledDate: wo.scheduledDate,
        dueDate: wo.dueDate,
        completedDate: wo.completedDate,
        progress: myProgress, // ✅ Tiến độ của KTV hiện tại
        totalItems: myTotalItems, // ✅ Số checklist của KTV hiện tại
        checkedItems: myCompletedItems, // ✅ Số đã hoàn thành của KTV hiện tại
        notes: wo.notes,
        isOverdue: wo.isOverdue || false,
      };

      if (!scheduleMap.has(dateKey)) {
        scheduleMap.set(dateKey, []);
      }
      scheduleMap.get(dateKey).push(schedule);
    });

    return Array.from(scheduleMap.entries()).map(([date, schedules]) => ({
      date,
      schedules: schedules.sort((a, b) => {
        if (a.scheduledTime === "-" && b.scheduledTime === "-") return 0;
        if (a.scheduledTime === "-") return 1;
        if (b.scheduledTime === "-") return -1;
        return a.scheduledTime.localeCompare(b.scheduledTime);
      }),
    }));
  };

  const scheduleData = transformWorkOrdersToSchedule();
  // Get schedules for a specific date
  const getSchedulesForDate = (date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    const found = scheduleData.find((item) => item.date === dateStr);

    // Apply status filter
    if (!found) return [];

    if (filterStatus === "all") return found.schedules;

    return found.schedules.filter((s) => {
      const status = s.status;
      switch (filterStatus) {
        case "pending":
          return (
            status === "Pending" ||
            status === "Assigned" ||
            status === "Chờ xử lý" ||
            status === "Đã giao việc"
          );
        case "in-progress":
          return status === "InProgress" || status === "Đang thực hiện";
        case "completed":
          return status === "Completed" || status === "Hoàn thành";
        case "overdue":
          return status === "Overdue" || status === "Quá hạn";
        default:
          return true;
      }
    });
  };

  // Get status color helper
  const getStatusColor = (status) => {
    const statusColors = {
      Pending: "default",
      "Chờ xử lý": "default",
      Assigned: "blue",
      "Đã giao việc": "blue",
      InProgress: "processing",
      "Đang thực hiện": "processing",
      Completed: "success",
      "Hoàn thành": "success",
      Postponed: "warning",
      "Đã hoãn": "warning",
      Cancelled: "error",
      "Đã hủy": "error",
      Overdue: "red",
      "Quá hạn": "red",
      Closed: "default",
      "Đã đóng": "default",
    };
    return statusColors[status] || "default";
  };

  // Get status text helper
  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      "Chờ xử lý": "Chờ xử lý",
      Assigned: "Đã giao việc",
      "Đã giao việc": "Đã giao việc",
      InProgress: "Đang thực hiện",
      "Đang thực hiện": "Đang thực hiện",
      Completed: "Hoàn thành",
      "Hoàn thành": "Hoàn thành",
      Postponed: "Đã hoãn",
      "Đã hoãn": "Đã hoãn",
      Cancelled: "Đã hủy",
      "Đã hủy": "Đã hủy",
      Overdue: "Quá hạn",
      "Quá hạn": "Quá hạn",
      Closed: "Đã đóng",
      "Đã đóng": "Đã đóng",
    };
    return statusTexts[status] || status;
  };

  // Calendar cell render
  const dateCellRender = (value) => {
    const schedules = getSchedulesForDate(value);

    if (schedules.length === 0) return null;

    return (
      <div className={styles.dateCell}>
        <Badge
          count={schedules.length}
          style={{
            backgroundColor: "#1890ff",
            fontSize: "10px",
            height: "18px",
            minWidth: "18px",
            lineHeight: "18px",
          }}
        />
      </div>
    );
  };

  // Handle date select - hiển thị modal công việc của ngày được chọn
  const onDateSelect = (date) => {
    setSelectedDate(date);
    const schedulesForDate = getSchedulesForDate(date);
    if (schedulesForDate.length > 0) {
      setSelectedSchedules(schedulesForDate);
      setModalVisible(true);
    }
  };

  // Get monthly statistics
  const getMonthStatistics = () => {
    const currentMonth = selectedDate.format("YYYY-MM");
    const monthSchedules = scheduleData.filter((item) =>
      item.date.startsWith(currentMonth)
    );

    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let overdueTasks = 0;

    monthSchedules.forEach((day) => {
      day.schedules.forEach((s) => {
        totalTasks++;

        // Status count - check both Vietnamese and English
        const status = s.status;
        if (status === "Completed" || status === "Hoàn thành") completedTasks++;
        else if (status === "InProgress" || status === "Đang thực hiện")
          inProgressTasks++;
        else if (status === "Overdue" || status === "Quá hạn") overdueTasks++;
      });
    });

    return {
      total: totalTasks,
      days: monthSchedules.length,
      completed: completedTasks,
      inProgress: inProgressTasks,
      overdue: overdueTasks,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  };

  const stats = getMonthStatistics();

  // Get today's schedule
  const getTodaySchedule = () => {
    return getSchedulesForDate(dayjs());
  };

  const todaySchedule = getTodaySchedule();

  // Handle refresh
  const handleRefresh = () => {
    fetchWorkOrders();
    message.success("Đã làm mới dữ liệu");
  };

  // Handle view work order detail
  const handleViewDetail = async (workOrderId) => {
    try {
      setLoading(true);
      const fullWorkOrder = workOrders.find(
        (wo) => wo.workOrderId === workOrderId
      );
      if (fullWorkOrder) {
        setSelectedWorkOrder(fullWorkOrder);
        setDetailModalVisible(true);
        setModalVisible(false);
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Không thể tải chi tiết công việc");
    } finally {
      setLoading(false);
    }
  };

  // Get my task type
  const getMyTaskType = (workOrder) => {
    const isElectrical = workOrder.assignedToElectrical === currentUserId;
    const isMechanical = workOrder.assignedToMechanical === currentUserId;

    if (isElectrical && isMechanical) return "Both";
    if (isElectrical) return "Electrical";
    if (isMechanical) return "Mechanical";
    return "None";
  };

  // Get my checklist items
  const getMyChecklistItems = (workOrder) => {
    if (!workOrder || !workOrder.checklistItems) return [];

    const taskType = getMyTaskType(workOrder);
    if (taskType === "Both") return workOrder.checklistItems;

    return workOrder.checklistItems.filter((item) => {
      if (taskType === "Electrical") return item.category === "Electrical";
      if (taskType === "Mechanical") return item.category === "Mechanical";
      return false;
    });
  };

  // Handle start work
  const handleStartWork = async () => {
    if (!selectedWorkOrder) return;

    // Đóng detail modal và mở checklist modal
    setDetailModalVisible(false);
    setChecklistModalVisible(true);

    // Khởi tạo notes từ checklist items hiện có
    const notes = {};
    const items = getMyChecklistItems(selectedWorkOrder);
    items.forEach((item) => {
      notes[item.checklistId] = item.notes || "";
    });
    setChecklistNotes(notes);
  };

  // Handle note change
  const handleNoteChange = (checklistId, value) => {
    setChecklistNotes((prev) => ({
      ...prev,
      [checklistId]: value,
    }));
  };

  // Handle check item
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

        // Kiểm tra nếu đây là bước cuối cùng
        if (checked) {
          const myItems = getMyChecklistItems(updatedWorkOrder);
          const allCompleted = myItems.every((item) => item.isChecked);
          if (allCompleted) {
            message.success(
              "Công việc hoàn thành. Tất cả mục kiểm tra đã xong."
            );
          } else {
            message.success("Đã hoàn thành bước này!");
          }
        } else {
          message.success("Đã bỏ tick bước này!");
        }
      } else {
        message.success(
          checked ? "Đã hoàn thành bước này!" : "Đã bỏ tick bước này!"
        );
      }
    } catch (error) {
      message.error("Cập nhật checklist thất bại: " + error.message);
    } finally {
      setUpdatingChecklist(false);
    }
  };

  // Handle complete from checklist
  const handleCompleteFromChecklist = async () => {
    const myItems = getMyChecklistItems(selectedWorkOrder);
    const allCompleted = myItems.every((item) => item.isChecked);
    if (!allCompleted) {
      message.warning(
        "Vui lòng hoàn thành tất cả các bước trước khi kết thúc!"
      );
      return;
    }

    try {
      setLoading(true);
      const checklistItems = myItems.map((item) => ({
        checklistId: item.checklistId,
        isChecked: true,
        notes: item.notes || "",
      }));

      const completionData = {
        checklistItems: checklistItems,
        overallNotes: "",
      };

      await completeWorkOrder(selectedWorkOrder.workOrderId, completionData);

      message.success("Công việc hoàn thành. Tất cả mục kiểm tra đã xong.");
      setChecklistModalVisible(false);
      setChecklistNotes({});
      fetchWorkOrders();
    } catch (error) {
      message.error("Hoàn thành nhiệm vụ thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if can start work
  const canStartWork = (workOrder) => {
    if (!workOrder) return false;
    const status = workOrder.status;

    // Không cho phép nếu đã hủy hoặc đã đóng
    return status !== "Đã hủy" && status !== "Đã đóng";
  };

  // Check if scheduled date is today
  const isScheduledToday = (workOrder) => {
    if (!workOrder || !workOrder.scheduledDate) return false;
    const today = dayjs().startOf("day");
    const scheduledDate = dayjs(workOrder.scheduledDate).startOf("day");
    return scheduledDate.isSame(today);
  };

  return (
    <ConfigProvider locale={viVN}>
      <Spin spinning={loading}>
        <div className={styles.scheduleContainer}>
          {/* Header with filter and top stats */}
          <Card
            bordered={false}
            style={{ marginBottom: isMobile ? 12 : 16 }}
            bodyStyle={{ padding: isMobile ? "12px" : "16px 24px" }}
            size={isMobile ? "small" : "default"}
          >
            <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]} align="middle">
              {/* Top Stats - 3 cards in row */}
              <Col xs={24} lg={16}>
                <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
                  <Col xs={8} sm={8}>
                    <Card
                      bordered={false}
                      className={styles.statCard}
                      size="small"
                      style={{ height: "100%" }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <CalendarOutlined
                          style={{
                            color: "#1890ff",
                            fontSize: isMobile ? 16 : 20,
                          }}
                        />
                        <div
                          style={{
                            fontSize: isMobile ? 18 : 24,
                            fontWeight: "bold",
                            color: "#1890ff",
                            marginTop: 4,
                          }}
                        >
                          {stats.total}
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? 10 : 12,
                            color: "#888",
                          }}
                        >
                          {isMobile ? "Tổng" : "Tổng nhiệm vụ"}
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={8} sm={8}>
                    <Card
                      bordered={false}
                      className={styles.statCard}
                      size="small"
                      style={{ height: "100%" }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <CheckCircleOutlined
                          style={{
                            color: "#52c41a",
                            fontSize: isMobile ? 16 : 20,
                          }}
                        />
                        <div
                          style={{
                            fontSize: isMobile ? 18 : 24,
                            fontWeight: "bold",
                            color: "#52c41a",
                            marginTop: 4,
                          }}
                        >
                          {stats.completed}
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? 10 : 12,
                            color: "#888",
                          }}
                        >
                          {isMobile ? "Xong" : "Hoàn thành"}
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={8} sm={8}>
                    <Card
                      bordered={false}
                      className={styles.statCard}
                      size="small"
                      style={{ height: "100%" }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: isMobile ? 18 : 24,
                            fontWeight: "bold",
                            color:
                              stats.completionRate >= 80
                                ? "#52c41a"
                                : stats.completionRate >= 50
                                ? "#faad14"
                                : "#ff4d4f",
                          }}
                        >
                          {stats.completionRate}%
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? 10 : 12,
                            color: "#888",
                            marginTop: 4,
                          }}
                        >
                          {isMobile ? "Tỷ lệ" : "Tỷ lệ HT"}
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Col>
              {/* Filter & Refresh */}
              <Col xs={24} lg={8}>
                <Row
                  justify={isMobile ? "start" : "end"}
                  style={{ marginTop: isMobile ? 8 : 0 }}
                >
                  <Space size={isMobile ? "small" : "middle"} wrap>
                    <Select
                      value={filterStatus}
                      onChange={setFilterStatus}
                      style={{ width: isMobile ? 130 : 180 }}
                      size={isMobile ? "small" : "middle"}
                    >
                      <Option value="all">
                        {isMobile ? "Tất cả" : "Tất cả trạng thái"}
                      </Option>
                      <Option value="pending">
                        {isMobile ? "Chờ" : "Chờ xử lý"}
                      </Option>
                      <Option value="in-progress">
                        {isMobile ? "Đang XL" : "Đang thực hiện"}
                      </Option>
                      <Option value="completed">
                        {isMobile ? "Xong" : "Hoàn thành"}
                      </Option>
                      <Option value="overdue">
                        {isMobile ? "Quá hạn" : "Quá hạn"}
                      </Option>
                    </Select>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh}
                      type="default"
                      size={isMobile ? "small" : "middle"}
                    >
                      {isMobile ? "" : "Làm mới"}
                    </Button>
                  </Space>
                </Row>
              </Col>
            </Row>
          </Card>

          {/* Statistics Cards - Row 2 */}
          <Row
            gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}
            style={{ marginBottom: isMobile ? 12 : 16 }}
          >
            <Col xs={8} sm={12} lg={8}>
              <Card
                bordered={false}
                className={styles.statCard}
                size="small"
                style={{ height: "100%" }}
              >
                <div style={{ textAlign: "center" }}>
                  <ClockCircleOutlined
                    style={{ color: "#1890ff", fontSize: isMobile ? 14 : 18 }}
                  />
                  <div
                    style={{
                      fontSize: isMobile ? 16 : 20,
                      fontWeight: "bold",
                      color: "#1890ff",
                      marginTop: 4,
                    }}
                  >
                    {stats.inProgress}
                  </div>
                  <div style={{ fontSize: isMobile ? 10 : 12, color: "#888" }}>
                    {isMobile ? "Đang XL" : "Đang thực hiện"}
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={8} sm={12} lg={8}>
              <Card
                bordered={false}
                className={styles.statCard}
                size="small"
                style={{ height: "100%" }}
              >
                <div style={{ textAlign: "center" }}>
                  <WarningOutlined
                    style={{
                      color: stats.overdue > 0 ? "#ff4d4f" : "#52c41a",
                      fontSize: isMobile ? 14 : 18,
                    }}
                  />
                  <div
                    style={{
                      fontSize: isMobile ? 16 : 20,
                      fontWeight: "bold",
                      color: stats.overdue > 0 ? "#ff4d4f" : "#52c41a",
                      marginTop: 4,
                    }}
                  >
                    {stats.overdue}
                  </div>
                  <div style={{ fontSize: isMobile ? 10 : 12, color: "#888" }}>
                    Quá hạn
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={8} sm={12} lg={8}>
              <Card
                bordered={false}
                className={styles.statCard}
                size="small"
                style={{ height: "100%" }}
              >
                <div style={{ textAlign: "center" }}>
                  <CalendarOutlined
                    style={{ color: "#52c41a", fontSize: isMobile ? 14 : 18 }}
                  />
                  <div
                    style={{
                      fontSize: isMobile ? 16 : 20,
                      fontWeight: "bold",
                      color: "#52c41a",
                      marginTop: 4,
                    }}
                  >
                    {stats.days}/{selectedDate.daysInMonth()}
                  </div>
                  <div style={{ fontSize: isMobile ? 10 : 12, color: "#888" }}>
                    {isMobile ? "Ngày" : "Ngày có lịch"}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
            {/* Calendar */}
            <Col xs={24} lg={16}>
              <Card
                title={
                  <Space size={isMobile ? "small" : "middle"}>
                    <CalendarOutlined style={{ color: "#1890ff" }} />
                    <span
                      style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600 }}
                    >
                      {isMobile
                        ? selectedDate.format("MM/YYYY")
                        : `Lịch bảo trì - ${selectedDate.format("MMMM YYYY")}`}
                    </span>
                  </Space>
                }
                extra={
                  !isMobile && (
                    <Space size="small">
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Tổng số nhiệm vụ
                      </Text>
                    </Space>
                  )
                }
                bordered={false}
                className={styles.calendarCard}
                size={isMobile ? "small" : "default"}
              >
                <Calendar
                  cellRender={dateCellRender}
                  onSelect={onDateSelect}
                  className={styles.calendar}
                  value={selectedDate}
                  onPanelChange={(date) => setSelectedDate(date)}
                  validRange={[
                    dayjs().subtract(5, "year").startOf("year"),
                    dayjs().endOf("year"),
                  ]}
                  fullscreen={!isMobile}
                />
              </Card>
            </Col>

            {/* Today's Schedule */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space size={isMobile ? "small" : "middle"}>
                    <ClockCircleOutlined style={{ color: "#52c41a" }} />
                    <span
                      style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600 }}
                    >
                      {isMobile
                        ? `Hôm nay (${dayjs().format("DD/MM")})`
                        : `Lịch hôm nay (${dayjs().format("DD/MM/YYYY")})`}
                    </span>
                  </Space>
                }
                extra={
                  <Badge
                    count={todaySchedule.length}
                    style={{ backgroundColor: "#1890ff" }}
                    overflowCount={99}
                  />
                }
                bordered={false}
                bodyStyle={{
                  maxHeight: isMobile ? "300px" : "calc(100vh - 400px)",
                  overflowY: "auto",
                  padding: isMobile ? "12px" : "16px",
                }}
                className={styles.todayCard}
                size={isMobile ? "small" : "default"}
              >
                {todaySchedule.length > 0 ? (
                  <Timeline
                    items={todaySchedule.map((schedule) => {
                      let color = "blue";
                      if (schedule.status === "Overdue") color = "red";
                      else if (schedule.status === "Completed") color = "green";
                      else if (schedule.status === "InProgress")
                        color = "orange";

                      let icon = <ToolOutlined />;
                      if (schedule.status === "InProgress")
                        icon = <ClockCircleOutlined spin />;
                      else if (schedule.status === "Completed")
                        icon = <CheckCircleOutlined />;

                      return {
                        color: color,
                        dot: icon,
                        children: (
                          <div
                            className={styles.timelineItem}
                            onClick={() =>
                              handleViewDetail(schedule.workOrderId)
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <div style={{ marginBottom: 8 }}>
                              <Space>
                                <Tag
                                  color={
                                    schedule.status === "Overdue"
                                      ? "red"
                                      : "blue"
                                  }
                                  style={{ fontSize: "11px", fontWeight: 500 }}
                                >
                                  {schedule.scheduledTime !== "-"
                                    ? schedule.scheduledTime
                                    : schedule.dueTime}
                                </Tag>
                                <Text strong style={{ fontSize: "13px" }}>
                                  {schedule.planCode}
                                </Text>
                                <Tag
                                  color={getStatusColor(schedule.status)}
                                  style={{ fontSize: "10px" }}
                                >
                                  {getStatusText(schedule.status)}
                                </Tag>
                              </Space>
                            </div>
                            <div style={{ fontSize: "12px", marginBottom: 4 }}>
                              <Text strong>{schedule.equipmentCode}</Text>
                              <Text type="secondary">
                                {" "}
                                - {schedule.equipmentName}
                              </Text>
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#888",
                                marginBottom: 4,
                              }}
                            >
                              <Space split="-" size="small">
                                <span>{schedule.lineName}</span>
                                {schedule.stageName && (
                                  <span>{schedule.stageName}</span>
                                )}
                              </Space>
                            </div>
                            {schedule.progress !== undefined && (
                              <div style={{ fontSize: "11px", color: "#888" }}>
                                Tiến độ: {schedule.checkedItems}/
                                {schedule.totalItems} bước
                                <span
                                  style={{
                                    marginLeft: 4,
                                    color:
                                      schedule.progress === 100
                                        ? "#52c41a"
                                        : "#1890ff",
                                  }}
                                >
                                  ({schedule.progress}%)
                                </span>
                              </div>
                            )}
                          </div>
                        ),
                      };
                    })}
                  />
                ) : (
                  <Empty
                    description={
                      <span style={{ color: "#888" }}>
                        Không có lịch nào hôm nay
                        <br />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Hãy tận hưởng ngày nghỉ ngơi! 🎉
                        </Text>
                      </span>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ marginTop: 60 }}
                  />
                )}
              </Card>
            </Col>
          </Row>

          {/* Schedule Detail Modal */}
          <Modal
            title={
              <Space size={isMobile ? "small" : "middle"}>
                <CalendarOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600 }}>
                  {isMobile
                    ? selectedDate.format("DD/MM")
                    : `Lịch ngày ${selectedDate.format("DD/MM/YYYY")}`}
                </span>
                <Badge
                  count={selectedSchedules.length}
                  style={{ backgroundColor: "#52c41a" }}
                  overflowCount={99}
                />
              </Space>
            }
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
              <Button
                key="close"
                onClick={() => setModalVisible(false)}
                style={{
                  height: isMobile ? "36px" : "40px",
                  fontSize: isMobile ? "14px" : "15px",
                  minWidth: isMobile ? "80px" : "120px",
                  borderRadius: "6px",
                }}
              >
                Đóng
              </Button>,
            ]}
            width={isMobile ? "100%" : 900}
            centered={!isMobile}
            style={isMobile ? { top: 20, margin: 0 } : {}}
            styles={{ body: { padding: isMobile ? 12 : 24 } }}
            className={styles.scheduleModal}
          >
            {selectedSchedules.length === 0 ? (
              <Empty
                description="Không có lịch bảo trì nào trong ngày này"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: isMobile ? 12 : 16,
                }}
              >
                {selectedSchedules.map((item, index) => (
                  <Card
                    key={item.workOrderId || index}
                    size="small"
                    hoverable
                    onClick={() => handleViewDetail(item.workOrderId)}
                    style={{
                      borderRadius: 12,
                      border: `1px solid ${
                        item.status === "Overdue"
                          ? "#ffccc7"
                          : item.status === "Completed"
                          ? "#b7eb8f"
                          : "#d9d9d9"
                      }`,
                      background:
                        item.status === "Overdue"
                          ? "#fff2f0"
                          : item.status === "Completed"
                          ? "#f6ffed"
                          : "#fafafa",
                      cursor: "pointer",
                    }}
                    styles={{ body: { padding: isMobile ? 12 : 16 } }}
                  >
                    {/* Header: Work Order Code + Status Tag */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <Text
                          strong
                          style={{
                            fontSize: isMobile ? 13 : 14,
                            color: "#1890ff",
                          }}
                        >
                          {item.workOrderCode || item.planCode}
                        </Text>
                        <Tag
                          color={getStatusColor(item.status)}
                          icon={
                            item.status === "InProgress" ? (
                              <ClockCircleOutlined />
                            ) : item.status === "Completed" ? (
                              <CheckCircleOutlined />
                            ) : item.status === "Overdue" ? (
                              <WarningOutlined />
                            ) : null
                          }
                          style={{ fontSize: 11, margin: 0 }}
                        >
                          {getStatusText(item.status)}
                        </Tag>
                      </div>
                      {/* Progress Badge - hiển thị ở header cho gọn */}
                      {item.progress !== undefined && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            background:
                              item.progress === 100 ? "#f6ffed" : "#e6f7ff",
                            padding: "4px 10px",
                            borderRadius: 16,
                            border: `1px solid ${
                              item.progress === 100 ? "#b7eb8f" : "#91d5ff"
                            }`,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              color:
                                item.progress === 100 ? "#52c41a" : "#1890ff",
                            }}
                          >
                            {item.checkedItems}/{item.totalItems}
                          </Text>
                          <Text
                            strong
                            style={{
                              fontSize: 12,
                              color:
                                item.progress === 100 ? "#52c41a" : "#1890ff",
                            }}
                          >
                            {item.progress}%
                          </Text>
                        </div>
                      )}
                    </div>

                    {/* Plan Name */}
                    <Text
                      style={{
                        fontSize: isMobile ? 12 : 13,
                        color: "#595959",
                        display: "block",
                        marginBottom: 10,
                      }}
                    >
                      {item.planCode?.includes("WO-")
                        ? item.templateName || "Bảo trì định kỳ"
                        : item.planCode}
                    </Text>

                    {/* Equipment Info Box */}
                    <div
                      style={{
                        background: "#fff",
                        padding: isMobile ? "10px" : "12px",
                        borderRadius: 8,
                        marginBottom: 12,
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      <div style={{ marginBottom: 6 }}>
                        <ToolOutlined
                          style={{
                            color: "#1890ff",
                            fontSize: 12,
                            marginRight: 6,
                          }}
                        />
                        <Text strong style={{ fontSize: isMobile ? 12 : 13 }}>
                          {item.equipmentCode}
                        </Text>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: isMobile ? 11 : 12,
                            marginLeft: 4,
                          }}
                        >
                          -{" "}
                          {isMobile && item.equipmentName?.length > 20
                            ? `${item.equipmentName.substring(0, 20)}...`
                            : item.equipmentName}
                        </Text>
                      </div>
                      <div>
                        <InfoCircleOutlined
                          style={{
                            color: "#52c41a",
                            fontSize: 12,
                            marginRight: 6,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: isMobile ? 11 : 12,
                            color: "#8c8c8c",
                          }}
                        >
                          {item.lineName}
                          {item.stageName ? ` / ${item.stageName}` : ""}
                        </Text>
                      </div>
                    </div>

                    {/* Footer: Due Date + View Detail Button */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      {item.dueDate ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <ClockCircleOutlined
                            style={{ color: "#faad14", fontSize: 12 }}
                          />
                          <Text
                            style={{
                              fontSize: isMobile ? 11 : 12,
                              color: "#8c8c8c",
                            }}
                          >
                            Hạn: {dayjs(item.dueDate).format("DD/MM/YYYY")}
                          </Text>
                        </div>
                      ) : (
                        <div />
                      )}
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size={isMobile ? "small" : "middle"}
                        style={{
                          borderRadius: 6,
                          height: isMobile ? 28 : 32,
                          fontSize: isMobile ? 12 : 14,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(item.workOrderId);
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Modal>

          {/* Detail Modal - giống MaintenanceTasks */}
          <Modal
            title={
              <Space size={isMobile ? "small" : "middle"}>
                <FileTextOutlined />
                <span style={{ fontSize: isMobile ? 14 : 16 }}>
                  Chi tiết phiếu bảo trì
                </span>
              </Space>
            }
            open={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            footer={[
              isScheduledToday(selectedWorkOrder) &&
                canStartWork(selectedWorkOrder) && (
                  <Button
                    key="start"
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handleStartWork}
                    style={{
                      height: isMobile ? "36px" : "40px",
                      fontSize: isMobile ? "14px" : "16px",
                      minWidth: isMobile ? "100px" : "140px",
                      marginRight: "auto",
                    }}
                  >
                    {isMobile ? "Bắt đầu" : "Thực hiện"}
                  </Button>
                ),
              <Button
                key="close"
                onClick={() => setDetailModalVisible(false)}
                style={{
                  height: isMobile ? "36px" : "40px",
                  fontSize: isMobile ? "14px" : "16px",
                  minWidth: isMobile ? "80px" : "120px",
                }}
              >
                Đóng
              </Button>,
            ]}
            width={isMobile ? "100%" : 900}
            centered={!isMobile}
            style={isMobile ? { top: 20, margin: 0 } : {}}
            styles={{ body: { padding: isMobile ? 12 : 24 } }}
          >
            {selectedWorkOrder && (
              <div>
                <Descriptions bordered column={isMobile ? 1 : 2} size="small">
                  <Descriptions.Item label="Mã phiếu" span={1}>
                    <strong>{selectedWorkOrder.workOrderCode}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái" span={1}>
                    {selectedWorkOrder.status === "Đang thực hiện" ? (
                      <Tag icon={<PlayCircleOutlined />} color="processing">
                        {isMobile ? "Đang làm" : "Đang thực hiện"}
                      </Tag>
                    ) : selectedWorkOrder.status === "Chờ xử lý" ? (
                      <Tag icon={<ClockCircleOutlined />} color="warning">
                        Chờ xử lý
                      </Tag>
                    ) : selectedWorkOrder.status === "Hoàn thành" ? (
                      <Tag icon={<CheckCircleOutlined />} color="success">
                        Hoàn thành
                      </Tag>
                    ) : selectedWorkOrder.status === "Quá hạn" ? (
                      <Tag icon={<WarningOutlined />} color="error">
                        Quá hạn
                      </Tag>
                    ) : (
                      <Tag>{selectedWorkOrder.status}</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thiết bị" span={isMobile ? 1 : 2}>
                    <strong>{selectedWorkOrder.equipmentCode}</strong>
                    {isMobile ? <br /> : " - "}
                    {selectedWorkOrder.equipmentName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Vị trí" span={isMobile ? 1 : 2}>
                    {selectedWorkOrder.lineName}
                    {isMobile ? <br /> : " / "}
                    {selectedWorkOrder.stageName}
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
                      ? dayjs(selectedWorkOrder.assignedDate).format(
                          "DD/MM/YYYY HH:mm"
                        )
                      : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày thực hiện" span={1}>
                    {selectedWorkOrder.scheduledDate
                      ? dayjs(selectedWorkOrder.scheduledDate).format(
                          "DD/MM/YYYY"
                        )
                      : "-"}
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
                </Descriptions>

                {getMyChecklistItems(selectedWorkOrder).length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <Divider>Danh sách công việc của bạn</Divider>
                    <AntList
                      dataSource={getMyChecklistItems(selectedWorkOrder)}
                      renderItem={(item, index) => (
                        <AntList.Item>
                          <AntList.Item.Meta
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
                                  <Text
                                    type="secondary"
                                    style={{
                                      fontSize: "12px",
                                      display: "block",
                                      marginBottom: 4,
                                    }}
                                  >
                                    {item.stepDescription}
                                  </Text>
                                )}
                                {item.notes && (
                                  <Text
                                    style={{
                                      fontSize: "12px",
                                      color: "#1890ff",
                                      whiteSpace: "pre-wrap",
                                    }}
                                  >
                                    📝 Ghi chú: {item.notes}
                                  </Text>
                                )}
                              </div>
                            }
                          />
                        </AntList.Item>
                      )}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Progress
                        percent={Math.round(
                          (getMyChecklistItems(selectedWorkOrder).filter(
                            (i) => i.isChecked
                          ).length /
                            getMyChecklistItems(selectedWorkOrder).length) *
                            100
                        )}
                        status="active"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal>

          {/* Checklist Modal - Thực hiện công việc bảo trì */}
          <Modal
            title={
              <Space size={isMobile ? "small" : "middle"}>
                <CheckCircleOutlined />
                <span style={{ fontSize: isMobile ? 14 : 16 }}>
                  {isMobile
                    ? "Thực hiện bảo trì"
                    : "Thực hiện công việc bảo trì"}
                </span>
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
                  height: isMobile ? "36px" : "40px",
                  fontSize: isMobile ? "14px" : "16px",
                  minWidth: isMobile ? "80px" : "120px",
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
                  height: isMobile ? "36px" : "40px",
                  fontSize: isMobile ? "14px" : "16px",
                  minWidth: isMobile ? "100px" : "120px",
                }}
              >
                {isMobile ? "Hoàn thành" : "Hoàn thành công việc"}
              </Button>,
            ]}
            width={isMobile ? "100%" : 1200}
            centered={!isMobile}
            style={isMobile ? { top: 20, margin: 0 } : {}}
            styles={{
              body: {
                padding: isMobile ? 12 : 24,
                maxHeight: isMobile ? "calc(100vh - 150px)" : "auto",
                overflowY: "auto",
              },
            }}
          >
            {selectedWorkOrder && (
              <div>
                <Alert
                  message={
                    <div>
                      <Row gutter={[12, 8]}>
                        <Col xs={24} sm={12}>
                          <div style={{ fontSize: isMobile ? 12 : 14 }}>
                            <strong>Thiết bị:</strong>{" "}
                            {selectedWorkOrder.equipmentCode}
                            {isMobile ? <br /> : " - "}
                            {selectedWorkOrder.equipmentName}
                          </div>
                          <div
                            style={{
                              fontSize: isMobile ? 12 : 14,
                              marginTop: isMobile ? 4 : 0,
                            }}
                          >
                            <strong>Vị trí:</strong>{" "}
                            {selectedWorkOrder.lineName}
                            {isMobile ? <br /> : " / "}
                            {selectedWorkOrder.stageName}
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div style={{ fontSize: isMobile ? 12 : 14 }}>
                            <strong>Loại công việc:</strong>{" "}
                            {getMyTaskType(selectedWorkOrder) ===
                            "Electrical" ? (
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
                          <div
                            style={{
                              fontSize: isMobile ? 12 : 14,
                              marginTop: isMobile ? 4 : 0,
                            }}
                          >
                            <strong>Ngày thực hiện:</strong>{" "}
                            {dayjs(selectedWorkOrder.scheduledDate).format(
                              "DD/MM/YYYY"
                            )}
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
                  const completed = myItems.filter(
                    (item) => item.isChecked
                  ).length;
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

                <Divider>Lưu ý</Divider>

                <Alert
                  message="Lưu ý"
                  description="Nhập ghi chú (nếu cần) vào ô bên dưới mỗi bước, sau đó tick vào checkbox để hoàn thành. Khi tick bước đầu tiên, công việc sẽ tự động chuyển sang trạng thái 'Đang thực hiện'."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                {/* Checklist Items with Note Input */}
                {getMyTaskType(selectedWorkOrder) === "Both" ? (
                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                      <Card
                        title={
                          <>
                            <ThunderboltOutlined style={{ color: "#1890ff" }} />{" "}
                            {isMobile ? "Điện" : "Công việc Điện"}
                          </>
                        }
                        size="small"
                        style={{
                          maxHeight: isMobile ? 350 : 500,
                          overflow: "auto",
                        }}
                      >
                        <AntList
                          dataSource={getMyChecklistItems(
                            selectedWorkOrder
                          ).filter((item) => item.category === "Electrical")}
                          renderItem={(item, index) => (
                            <AntList.Item
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
                                    disabled={
                                      updatingChecklist || item.isChecked
                                    }
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
                                      value={
                                        checklistNotes[item.checklistId] || ""
                                      }
                                      onChange={(e) =>
                                        handleNoteChange(
                                          item.checklistId,
                                          e.target.value
                                        )
                                      }
                                    />
                                  ) : (
                                    item.notes && (
                                      <div style={{ marginTop: 4 }}>
                                        <Text
                                          type="secondary"
                                          style={{ fontSize: 12 }}
                                        >
                                          📝 {item.notes}
                                        </Text>
                                      </div>
                                    )
                                  )}
                                </Col>
                              </Row>
                            </AntList.Item>
                          )}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Card
                        title={
                          <>
                            <ToolOutlined style={{ color: "#52c41a" }} />{" "}
                            {isMobile ? "Cơ khí" : "Công việc Cơ khí"}
                          </>
                        }
                        size="small"
                        style={{
                          maxHeight: isMobile ? 350 : 500,
                          overflow: "auto",
                        }}
                      >
                        <AntList
                          dataSource={getMyChecklistItems(
                            selectedWorkOrder
                          ).filter((item) => item.category === "Mechanical")}
                          renderItem={(item, index) => (
                            <AntList.Item
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
                                    disabled={
                                      updatingChecklist || item.isChecked
                                    }
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
                                      value={
                                        checklistNotes[item.checklistId] || ""
                                      }
                                      onChange={(e) =>
                                        handleNoteChange(
                                          item.checklistId,
                                          e.target.value
                                        )
                                      }
                                    />
                                  ) : (
                                    item.notes && (
                                      <div style={{ marginTop: 4 }}>
                                        <Text
                                          type="secondary"
                                          style={{ fontSize: 12 }}
                                        >
                                          📝 {item.notes}
                                        </Text>
                                      </div>
                                    )
                                  )}
                                </Col>
                              </Row>
                            </AntList.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>
                ) : (
                  <AntList
                    dataSource={getMyChecklistItems(selectedWorkOrder)}
                    renderItem={(item, index) => (
                      <AntList.Item
                        style={{ display: "block", paddingBottom: 16 }}
                      >
                        <Row gutter={8} align="top">
                          <Col flex="none">
                            <Badge
                              count={index + 1}
                              style={{
                                backgroundColor:
                                  item.category === "Electrical"
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
                              />
                            ) : (
                              item.notes && (
                                <div style={{ marginTop: 4 }}>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    📝 {item.notes}
                                  </Text>
                                </div>
                              )
                            )}
                          </Col>
                        </Row>
                      </AntList.Item>
                    )}
                  />
                )}
              </div>
            )}
          </Modal>
        </div>
      </Spin>
    </ConfigProvider>
  );
};

export default MaintenanceSchedule;
