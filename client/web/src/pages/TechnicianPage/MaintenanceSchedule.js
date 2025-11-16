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
} from "antd";
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
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/vi";
import { getMyWorkOrders } from "../../services/maintenanceService";
import styles from "../../styles/pages/MaintenanceSchedule.module.css";

dayjs.extend(isBetween);
dayjs.extend(localeData);
dayjs.locale('vi');

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

      const schedule = {
        key: wo.workOrderId,
        workOrderId: wo.workOrderId,
        planCode: wo.workOrderCode,
        equipmentCode: wo.equipmentCode || "-",
        equipmentName: wo.equipmentName || "-",
        lineName: wo.lineName || "-",
        stageName: wo.stageName || "",
        taskType: "Bảo trì định kỳ",
        scheduledTime: wo.scheduledDate ? dayjs(wo.scheduledDate).format("HH:mm") : "-",
        dueTime: wo.dueDate ? dayjs(wo.dueDate).format("HH:mm") : "-",
        status: wo.status,
        assignedDate: wo.assignedDate,
        scheduledDate: wo.scheduledDate,
        dueDate: wo.dueDate,
        completedDate: wo.completedDate,
        progress: wo.completionPercentage || 0,
        totalItems: wo.totalChecklistItems || 0,
        checkedItems: wo.completedChecklistItems || 0,
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
      switch (filterStatus) {
        case "pending":
          return s.status === "Pending" || s.status === "Assigned";
        case "in-progress":
          return s.status === "InProgress";
        case "completed":
          return s.status === "Completed";
        case "overdue":
          return s.status === "Overdue";
        default:
          return true;
      }
    });
  };

  // Get status color helper
  const getStatusColor = (status) => {
    const statusColors = {
      Pending: "default",
      Assigned: "blue",
      InProgress: "processing",
      Completed: "success",
      Postponed: "warning",
      Cancelled: "error",
      Overdue: "red",
      Closed: "default",
    };
    return statusColors[status] || "default";
  };

  // Get status text helper
  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      Assigned: "Đã giao việc",
      InProgress: "Đang thực hiện",
      Completed: "Hoàn thành",
      Postponed: "Đã hoãn",
      Cancelled: "Đã hủy",
      Overdue: "Quá hạn",
      Closed: "Đã đóng",
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

  // Handle date select
  const onDateSelect = (date) => {
    setSelectedDate(date);
    const schedules = getSchedulesForDate(date);
    if (schedules.length > 0) {
      setSelectedSchedules(schedules);
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
        
        // Status count
        if (s.status === "Completed") completedTasks++;
        else if (s.status === "InProgress") inProgressTasks++;
        else if (s.status === "Overdue") overdueTasks++;
      });
    });

    return {
      total: totalTasks,
      days: monthSchedules.length,
      completed: completedTasks,
      inProgress: inProgressTasks,
      overdue: overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
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
  const handleViewDetail = (workOrderId) => {
    navigate("/technician/maintenance-tasks");
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.scheduleContainer}>
        {/* Header with filter */}
        <Card 
          bordered={false} 
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: "16px 24px" }}
        >
          <Row justify="space-between" align="middle">
            <Col xs={24} lg={16}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card bordered={false} className={styles.statCard}>
                    <Statistic
                      title="Tổng nhiệm vụ tháng này"
                      value={stats.total}
                      prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
                      valueStyle={{ fontSize: "24px", fontWeight: "bold", color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card bordered={false} className={styles.statCard}>
                    <Statistic
                      title="Hoàn thành"
                      value={stats.completed}
                      suffix={`/ ${stats.total}`}
                      prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                      valueStyle={{ fontSize: "20px", color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card bordered={false} className={styles.statCard}>
                    <Statistic
                      title="Tỷ lệ hoàn thành"
                      value={stats.completionRate}
                      suffix="%"
                      valueStyle={{ 
                        fontSize: "20px", 
                        color: stats.completionRate >= 80 ? "#52c41a" : stats.completionRate >= 50 ? "#faad14" : "#ff4d4f" 
                      }}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col xs={24} lg={8}>
              <Row justify="end">
                <Space>
                  <Select
                    value={filterStatus}
                    onChange={setFilterStatus}
                    style={{ width: 180 }}
                    prefix={<FilterOutlined />}
                  >
                    <Option value="all">
                      <Space>
                        {/* <FilterOutlined /> */}
                        Tất cả trạng thái
                      </Space>
                    </Option>
                    <Option value="pending">Chờ xử lý</Option>
                    <Option value="in-progress">Đang thực hiện</Option>
                    <Option value="completed">Hoàn thành</Option>
                    <Option value="overdue">Quá hạn</Option>
                  </Select>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={handleRefresh}
                    type="default"
                  >
                    Làm mới
                  </Button>
                </Space>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={8}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="Đang thực hiện"
                value={stats.inProgress}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#1890ff" }}
                suffix={
                  <span style={{ fontSize: "14px", color: "#888" }}>
                    nhiệm vụ
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="Quá hạn"
                value={stats.overdue}
                prefix={<WarningOutlined />}
                valueStyle={{ color: stats.overdue > 0 ? "#ff4d4f" : "#52c41a" }}
                suffix={
                  <span style={{ fontSize: "14px", color: "#888" }}>
                    nhiệm vụ
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="Ngày có lịch"
                value={stats.days}
                suffix={`/ ${selectedDate.daysInMonth()}`}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>


      <Row gutter={[16, 16]}>
        {/* Calendar */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <CalendarOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontSize: "16px", fontWeight: 600 }}>
                  Lịch bảo trì - {selectedDate.format("MMMM YYYY")}
                </span>
              </Space>
            }
            extra={
              <Space size="small">
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Tổng số nhiệm vụ
                </Text>
              </Space>
            }
            bordered={false}
            className={styles.calendarCard}
          >
            <Calendar
              cellRender={dateCellRender}
              onSelect={onDateSelect}
              className={styles.calendar}
              value={selectedDate}
              onPanelChange={(date) => setSelectedDate(date)}
              validRange={[dayjs().subtract(5, 'year').startOf('year'), dayjs().endOf('year')]}
            />
          </Card>
        </Col>

        {/* Today's Schedule */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: "#52c41a" }} />
                <span style={{ fontSize: "16px", fontWeight: 600 }}>
                  Lịch hôm nay ({dayjs().format("DD/MM/YYYY")})
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
            bodyStyle={{ maxHeight: "calc(100vh - 400px)", overflowY: "auto", padding: "16px" }}
            className={styles.todayCard}
          >
            {todaySchedule.length > 0 ? (
              <Timeline
                items={todaySchedule.map((schedule) => {
                  let color = "blue";
                  if (schedule.status === "Overdue") color = "red";
                  else if (schedule.status === "Completed") color = "green";
                  else if (schedule.status === "InProgress") color = "orange";

                  let icon = <ToolOutlined />;
                  if (schedule.status === "InProgress")
                    icon = <ClockCircleOutlined spin />;
                  else if (schedule.status === "Completed")
                    icon = <CheckCircleOutlined />;

                  return {
                    color: color,
                    dot: icon,
                    children: (
                      <div className={styles.timelineItem}>
                        <div style={{ marginBottom: 8 }}>
                          <Space>
                            <Tag
                              color={schedule.status === "Overdue" ? "red" : "blue"}
                              style={{ fontSize: "11px", fontWeight: 500 }}
                            >
                              {schedule.scheduledTime !== "-" 
                                ? schedule.scheduledTime 
                                : schedule.dueTime
                              }
                            </Tag>
                            <Text strong style={{ fontSize: "13px" }}>
                              {schedule.planCode}
                            </Text>
                            <Tag color={getStatusColor(schedule.status)} style={{ fontSize: "10px" }}>
                              {getStatusText(schedule.status)}
                            </Tag>
                          </Space>
                        </div>
                        <div style={{ fontSize: "12px", marginBottom: 4 }}>
                          <Text strong>{schedule.equipmentCode}</Text>
                          <Text type="secondary"> - {schedule.equipmentName}</Text>
                        </div>
                        <div style={{ fontSize: "11px", color: "#888", marginBottom: 4 }}>
                          <Space split="-" size="small">
                            <span>{schedule.lineName}</span>
                            {schedule.stageName && <span>{schedule.stageName}</span>}
                          </Space>
                        </div>
                        {schedule.progress !== undefined && (
                          <div style={{ fontSize: "11px", color: "#888" }}>
                            Tiến độ: {schedule.checkedItems}/{schedule.totalItems} bước
                            <span style={{ marginLeft: 4, color: schedule.progress === 100 ? "#52c41a" : "#1890ff" }}>
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
                    Không có lịch nào hôm nay<br />
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
          <Space>
            <CalendarOutlined style={{ color: "#1890ff" }} />
            <span style={{ fontSize: "16px", fontWeight: 600 }}>
              Lịch ngày {selectedDate.format("DD/MM/YYYY")}
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
              height: "40px",
              fontSize: "15px",
              minWidth: "120px",
              borderRadius: "6px",
            }}
          >
            Đóng
          </Button>,
        ]}
        width={900}
        className={styles.scheduleModal}
      >
        <List
          itemLayout="horizontal"
          dataSource={selectedSchedules}
          renderItem={(item) => (
            <List.Item
              className={styles.scheduleListItem}
              actions={[
                <Button
                  key="view"
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(item.workOrderId)}
                  size="small"
                  style={{ borderRadius: "6px" }}
                >
                  Xem chi tiết
                </Button>,
              ]}
              extra={
                <Space direction="vertical" align="end" size="small">
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
                    style={{ fontSize: "12px" }}
                  >
                    {getStatusText(item.status)}
                  </Tag>
                  {item.progress !== undefined && (
                    <div style={{ fontSize: "11px", color: "#888", textAlign: "right" }}>
                      {item.checkedItems}/{item.totalItems}
                      <br />
                      <Text 
                        type={item.progress === 100 ? "success" : "secondary"}
                        style={{ fontSize: "11px" }}
                      >
                        {item.progress}%
                      </Text>
                    </div>
                  )}
                </Space>
              }
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      minWidth: "70px",
                      textAlign: "center",
                      padding: "10px 8px",
                      backgroundColor: item.status === "Overdue" ? "#fff1f0" : "#f0f5ff",
                      borderRadius: "8px",
                      border: `1px solid ${item.status === "Overdue" ? "#ffccc7" : "#d6e4ff"}`,
                    }}
                  >
                    <div 
                      style={{ 
                        fontSize: "16px", 
                        fontWeight: "bold",
                        color: item.status === "Overdue" ? "#ff4d4f" : "#1890ff"
                      }}
                    >
                      {item.scheduledTime !== "-" ? item.scheduledTime : item.dueTime}
                    </div>
                    <div style={{ fontSize: "10px", color: "#888", marginTop: 2 }}>
                      {item.scheduledTime !== "-" ? "Lên lịch" : "Đến hạn"}
                    </div>
                  </div>
                }
                title={
                  <Space size="middle">
                    <Text strong style={{ fontSize: "14px" }}>
                      {item.planCode}
                    </Text>
                    <Tag color="blue" icon={<ToolOutlined />} style={{ fontSize: "11px" }}>
                      {item.taskType}
                    </Tag>
                  </Space>
                }
                description={
                  <div style={{ marginTop: 4 }}>
                    <div style={{ marginBottom: 6 }}>
                      <Text strong style={{ fontSize: "13px" }}>
                        {item.equipmentCode}
                      </Text>
                      <Text type="secondary" style={{ fontSize: "13px", marginLeft: 4 }}>
                        - {item.equipmentName}
                      </Text>
                    </div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      <Space split="|" size="small">
                        <span>📍 {item.lineName}</span>
                        {item.stageName && <span>{item.stageName}</span>}
                      </Space>
                    </div>
                    {item.dueDate && (
                      <div style={{ fontSize: "11px", color: "#888", marginTop: 4 }}>
                        ⏰ Hạn: {dayjs(item.dueDate).format("DD/MM/YYYY HH:mm")}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
    </Spin>
  );
};

export default MaintenanceSchedule;
