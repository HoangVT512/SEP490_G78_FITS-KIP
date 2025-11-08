import React, { useState } from "react";
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
} from "antd";
import {
  CalendarOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/MaintenanceSchedule.module.css";

const { Option } = Select;

const MaintenanceSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [viewMode, setViewMode] = useState("month"); // month or week

  // Mock schedule data - sẽ thay bằng API call sau
  const scheduleData = [
    {
      date: "2025-10-13",
      schedules: [
        {
          key: 1,
          planCode: "PM-001",
          equipmentCode: "EQ-010",
          equipmentName: "Máy phay CNC",
          taskType: "Bảo trì định kỳ",
          time: "14:00",
          duration: "2 giờ",
          priority: "Cao",
          status: "Sắp tới",
          lineName: "Dây chuyền 1",
        },
        {
          key: 2,
          planCode: "PM-005",
          equipmentCode: "EQ-022",
          equipmentName: "Máy tiện tự động",
          taskType: "Kiểm tra an toàn",
          time: "16:00",
          duration: "1 giờ",
          priority: "Trung bình",
          status: "Sắp tới",
          lineName: "Dây chuyền 2",
        },
        {
          key: 3,
          planCode: "INC-001",
          equipmentCode: "EQ-001",
          equipmentName: "Máy CNC 01",
          taskType: "Sửa chữa sự cố",
          time: "08:30",
          duration: "4 giờ",
          priority: "Cao",
          status: "Đang thực hiện",
          lineName: "Dây chuyền 1",
        },
      ],
    },
    {
      date: "2025-10-14",
      schedules: [
        {
          key: 4,
          planCode: "PM-008",
          equipmentCode: "EQ-015",
          equipmentName: "Robot hàn 02",
          taskType: "Bảo trì định kỳ",
          time: "10:00",
          duration: "3 giờ",
          priority: "Cao",
          status: "Chưa bắt đầu",
          lineName: "Dây chuyền 2",
        },
        {
          key: 5,
          planCode: "INC-002",
          equipmentCode: "EQ-015",
          equipmentName: "Robot hàn 03",
          taskType: "Sửa chữa sự cố",
          time: "12:00",
          duration: "2 giờ",
          priority: "Trung bình",
          status: "Chưa bắt đầu",
          lineName: "Dây chuyền 2",
        },
      ],
    },
    {
      date: "2025-10-15",
      schedules: [
        {
          key: 6,
          planCode: "PM-012",
          equipmentCode: "EQ-030",
          equipmentName: "Băng chuyền 08",
          taskType: "Bảo dưỡng",
          time: "09:00",
          duration: "1.5 giờ",
          priority: "Thấp",
          status: "Chưa bắt đầu",
          lineName: "Dây chuyền 3",
        },
        {
          key: 7,
          planCode: "INC-003",
          equipmentCode: "EQ-025",
          equipmentName: "Băng chuyền 05",
          taskType: "Sửa chữa sự cố",
          time: "17:00",
          duration: "1 giờ",
          priority: "Thấp",
          status: "Chưa bắt đầu",
          lineName: "Dây chuyền 3",
        },
      ],
    },
    {
      date: "2025-10-16",
      schedules: [
        {
          key: 8,
          planCode: "PM-015",
          equipmentCode: "EQ-018",
          equipmentName: "Máy mài tự động",
          taskType: "Kiểm tra định kỳ",
          time: "13:00",
          duration: "1 giờ",
          priority: "Trung bình",
          status: "Chưa bắt đầu",
          lineName: "Dây chuyền 2",
        },
      ],
    },
    {
      date: "2025-10-18",
      schedules: [
        {
          key: 9,
          planCode: "PM-020",
          equipmentCode: "EQ-012",
          equipmentName: "Máy dập thủy lực",
          taskType: "Bảo trì định kỳ",
          time: "11:00",
          duration: "2.5 giờ",
          priority: "Cao",
          status: "Chưa bắt đầu",
          lineName: "Dây chuyền 1",
        },
      ],
    },
  ];

  // Get schedules for a specific date
  const getSchedulesForDate = (date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    const found = scheduleData.find((item) => item.date === dateStr);
    return found ? found.schedules : [];
  };

  // Calendar cell render
  const dateCellRender = (value) => {
    const schedules = getSchedulesForDate(value);

    if (schedules.length === 0) return null;

    const highPriority = schedules.filter((s) => s.priority === "Cao").length;
    const mediumPriority = schedules.filter(
      (s) => s.priority === "Trung bình"
    ).length;
    const lowPriority = schedules.filter((s) => s.priority === "Thấp").length;

    return (
      <div className={styles.dateCell}>
        {highPriority > 0 && (
          <Badge
            count={highPriority}
            style={{
              backgroundColor: "#ff4d4f",
              fontSize: "10px",
              height: "18px",
              minWidth: "18px",
              lineHeight: "18px",
            }}
          />
        )}
        {mediumPriority > 0 && (
          <Badge
            count={mediumPriority}
            style={{
              backgroundColor: "#faad14",
              fontSize: "10px",
              height: "18px",
              minWidth: "18px",
              lineHeight: "18px",
            }}
          />
        )}
        {lowPriority > 0 && (
          <Badge
            count={lowPriority}
            style={{
              backgroundColor: "#52c41a",
              fontSize: "10px",
              height: "18px",
              minWidth: "18px",
              lineHeight: "18px",
            }}
          />
        )}
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

  // Get statistics for the current month
  const getMonthStatistics = () => {
    const currentMonth = dayjs().format("YYYY-MM");
    const monthSchedules = scheduleData.filter((item) =>
      item.date.startsWith(currentMonth)
    );

    let totalTasks = 0;
    let highPriority = 0;
    let mediumPriority = 0;
    let lowPriority = 0;

    monthSchedules.forEach((day) => {
      totalTasks += day.schedules.length;
      highPriority += day.schedules.filter((s) => s.priority === "Cao").length;
      mediumPriority += day.schedules.filter(
        (s) => s.priority === "Trung bình"
      ).length;
      lowPriority += day.schedules.filter((s) => s.priority === "Thấp").length;
    });

    return {
      total: totalTasks,
      high: highPriority,
      medium: mediumPriority,
      low: lowPriority,
      days: monthSchedules.length,
    };
  };

  const stats = getMonthStatistics();

  // Get today's schedule
  const getTodaySchedule = () => {
    return getSchedulesForDate(dayjs());
  };

  const todaySchedule = getTodaySchedule();

  return (
    <div className={styles.scheduleContainer}>
      {/* Statistics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng nhiệm vụ tháng này"
              value={stats.total}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Ưu tiên cao"
              value={stats.high}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Ưu tiên trung bình"
              value={stats.medium}
              prefix={<InfoCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Ngày có lịch"
              value={stats.days}
              suffix={`/ ${dayjs().daysInMonth()}`}
              prefix={<CheckCircleOutlined />}
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
                <CalendarOutlined />
                <span>Lịch bảo trì</span>
              </Space>
            }
            extra={
              <Space>
                <span style={{ fontSize: "12px", color: "#888" }}>
                  <Badge
                    color="#ff4d4f"
                    text="Cao"
                    style={{ marginRight: 8 }}
                  />
                  <Badge
                    color="#faad14"
                    text="Trung bình"
                    style={{ marginRight: 8 }}
                  />
                  <Badge color="#52c41a" text="Thấp" />
                </span>
              </Space>
            }
            bordered={false}
          >
            <Calendar
              cellRender={dateCellRender}
              onSelect={onDateSelect}
              className={styles.calendar}
            />
          </Card>
        </Col>

        {/* Today's Schedule */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Lịch hôm nay</span>
              </Space>
            }
            bordered={false}
            bodyStyle={{ maxHeight: "600px", overflowY: "auto" }}
          >
            {todaySchedule.length > 0 ? (
              <Timeline
                items={todaySchedule
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((schedule) => {
                    let color = "blue";
                    if (schedule.priority === "Cao") color = "red";
                    else if (schedule.priority === "Trung bình")
                      color = "orange";
                    else if (schedule.priority === "Thấp") color = "green";

                    let icon = <ToolOutlined />;
                    if (schedule.status === "Đang thực hiện")
                      icon = <ClockCircleOutlined spin />;
                    else if (schedule.status === "Hoàn thành")
                      icon = <CheckCircleOutlined />;

                    return {
                      color: color,
                      dot: icon,
                      children: (
                        <div>
                          <div
                            style={{
                              fontWeight: 500,
                              marginBottom: 4,
                              fontSize: "13px",
                            }}
                          >
                            <Tag
                              color={
                                schedule.taskType.includes("sự cố")
                                  ? "red"
                                  : "blue"
                              }
                              style={{ fontSize: "11px" }}
                            >
                              {schedule.time}
                            </Tag>
                            {schedule.planCode}
                          </div>
                          <div style={{ fontSize: "12px", marginBottom: 4 }}>
                            <strong>{schedule.equipmentCode}</strong> -{" "}
                            {schedule.equipmentName}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#888",
                              marginBottom: 4,
                            }}
                          >
                            {schedule.taskType} • {schedule.duration}
                          </div>
                          <div style={{ fontSize: "11px", color: "#888" }}>
                            {schedule.lineName}
                          </div>
                        </div>
                      ),
                    };
                  })}
              />
            ) : (
              <Empty
                description="Không có lịch nào hôm nay"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Schedule Detail Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>
              Lịch ngày {selectedDate.format("DD/MM/YYYY")} (
              {selectedSchedules.length} nhiệm vụ)
            </span>
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
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <List
          itemLayout="horizontal"
          dataSource={selectedSchedules.sort((a, b) =>
            a.time.localeCompare(b.time)
          )}
          renderItem={(item) => (
            <List.Item
              extra={
                <Space direction="vertical" align="end">
                  <Tag
                    color={
                      item.priority === "Cao"
                        ? "red"
                        : item.priority === "Trung bình"
                        ? "orange"
                        : "green"
                    }
                  >
                    {item.priority}
                  </Tag>
                  <Tag
                    color={
                      item.status === "Đang thực hiện"
                        ? "processing"
                        : item.status === "Hoàn thành"
                        ? "success"
                        : "default"
                    }
                    icon={
                      item.status === "Đang thực hiện" ? (
                        <ClockCircleOutlined />
                      ) : item.status === "Hoàn thành" ? (
                        <CheckCircleOutlined />
                      ) : null
                    }
                  >
                    {item.status}
                  </Tag>
                </Space>
              }
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: "60px",
                      textAlign: "center",
                      padding: "8px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                      {item.time}
                    </div>
                    <div style={{ fontSize: "11px", color: "#888" }}>
                      {item.duration}
                    </div>
                  </div>
                }
                title={
                  <Space>
                    <strong>{item.planCode}</strong>
                    <Tag
                      color={item.taskType.includes("sự cố") ? "red" : "blue"}
                      icon={
                        item.taskType.includes("sự cố") ? (
                          <WarningOutlined />
                        ) : (
                          <ToolOutlined />
                        )
                      }
                    >
                      {item.taskType}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      <strong>{item.equipmentCode}</strong> -{" "}
                      {item.equipmentName}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      {item.lineName}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default MaintenanceSchedule;
