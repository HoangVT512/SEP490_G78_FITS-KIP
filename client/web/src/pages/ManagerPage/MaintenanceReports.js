import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Progress,
  DatePicker,
  Select,
  Space,
  Button,
  Spin,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/MaintenanceReports.module.css";
import {
  getAllWorkOrders,
  getAllTechnicians,
} from "../../services/maintenanceService";

const { RangePicker } = DatePicker;
const { Option } = Select;

const MaintenanceReports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);
  const [selectedTechnician, setSelectedTechnician] = useState("all");
  const [technicians, setTechnicians] = useState([]);
  const [allWorkOrders, setAllWorkOrders] = useState([]);
  const [statistics, setStatistics] = useState({
    totalCompleted: 0,
    onTime: 0,
    overdue: 0,
    completionRate: 0,
  });
  const [overdueData, setOverdueData] = useState([]);
  const [technicianPerformance, setTechnicianPerformance] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (allWorkOrders.length > 0) {
      calculateStatistics();
    }
  }, [dateRange, selectedTechnician, allWorkOrders]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all work orders and technicians
      const [workOrdersRes, techniciansRes] = await Promise.all([
        getAllWorkOrders(),
        getAllTechnicians(),
      ]);

      setAllWorkOrders(workOrdersRes?.data || workOrdersRes || []);
      setTechnicians(techniciansRes?.data || techniciansRes || []);
    } catch (error) {
      console.error("Error fetching maintenance reports data:", error);
      message.error("Không thể tải dữ liệu báo cáo bảo trì");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = () => {
    // Filter by date range and technician
    let filteredOrders = allWorkOrders.filter((wo) => {
      const completedDate = wo.completedDate ? dayjs(wo.completedDate) : null;
      const isInDateRange =
        completedDate &&
        completedDate.isAfter(dateRange[0]) &&
        completedDate.isBefore(dateRange[1].add(1, "day"));

      const matchesTechnician =
        selectedTechnician === "all" ||
        wo.assignedToElectrical === selectedTechnician ||
        wo.assignedToMechanical === selectedTechnician;

      return isInDateRange && matchesTechnician;
    });

    // Calculate statistics
    const completedOrders = filteredOrders.filter(
      (wo) => wo.status === "Completed"
    );
    const totalCompleted = completedOrders.length;
    const onTime = completedOrders.filter((wo) => {
      const completed = dayjs(wo.completedDate);
      const due = dayjs(wo.dueDate);
      return completed.isBefore(due) || completed.isSame(due, "day");
    }).length;
    const overdue = totalCompleted - onTime;
    const completionRate =
      totalCompleted > 0 ? (onTime / totalCompleted) * 100 : 0;

    setStatistics({
      totalCompleted,
      onTime,
      overdue,
      completionRate: parseFloat(completionRate.toFixed(1)),
    });

    // Calculate overdue work orders (pending or in progress past due date)
    const today = dayjs();
    const overdueOrders = allWorkOrders
      .filter((wo) => {
        const dueDate = dayjs(wo.dueDate);
        const isPastDue = dueDate.isBefore(today, "day");
        const isNotCompleted =
          wo.status !== "Completed" && wo.status !== "Cancelled";
        return isPastDue && isNotCompleted;
      })
      .map((wo) => ({
        id: wo.workOrderId,
        equipmentId: wo.equipment?.equipmentId || "N/A",
        equipmentName: wo.equipment?.equipmentName || "N/A",
        planType: wo.plan?.planType || "Bảo trì định kỳ",
        scheduledDate: wo.scheduledDate,
        assignedTo:
          wo.electricalTechnician?.fullName ||
          wo.mechanicalTechnician?.fullName ||
          "Chưa giao",
        daysOverdue: today.diff(dayjs(wo.dueDate), "day"),
      }));

    setOverdueData(overdueOrders);

    // Calculate technician performance
    const techPerformance = technicians
      .map((tech) => {
        const techOrders = allWorkOrders.filter(
          (wo) =>
            wo.assignedToElectrical === tech.id ||
            wo.assignedToMechanical === tech.id
        );

        const totalAssigned = techOrders.length;
        const completed = techOrders.filter(
          (wo) => wo.status === "Completed"
        ).length;
        const onTimeCount = techOrders.filter((wo) => {
          if (wo.status !== "Completed") return false;
          const completedDate = dayjs(wo.completedDate);
          const dueDate = dayjs(wo.dueDate);
          return (
            completedDate.isBefore(dueDate) ||
            completedDate.isSame(dueDate, "day")
          );
        }).length;
        const overdueCount = completed - onTimeCount;

        const completionRate =
          totalAssigned > 0 ? (completed / totalAssigned) * 100 : 0;
        const onTimeRate = completed > 0 ? (onTimeCount / completed) * 100 : 0;

        return {
          id: tech.id,
          name: tech.fullName || tech.userName,
          totalAssigned,
          completed,
          onTime: onTimeCount,
          overdue: overdueCount,
          completionRate: parseFloat(completionRate.toFixed(1)),
          onTimeRate: parseFloat(onTimeRate.toFixed(1)),
        };
      })
      .filter((tp) => tp.totalAssigned > 0); // Only show technicians with assigned work

    setTechnicianPerformance(techPerformance);
  };

  const overdueColumns = [
    {
      title: "Mã thiết bị",
      dataIndex: "equipmentId",
      key: "equipmentId",
      width: 120,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 150,
    },
    {
      title: "Loại bảo trì",
      dataIndex: "planType",
      key: "planType",
      width: 150,
    },
    {
      title: "Ngày dự kiến",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Kỹ thuật viên",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 150,
    },
    {
      title: "Số ngày trễ",
      dataIndex: "daysOverdue",
      key: "daysOverdue",
      width: 100,
      render: (days) => (
        <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
          {days} ngày
        </span>
      ),
    },
  ];

  const performanceColumns = [
    {
      title: "Kỹ thuật viên",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Tổng số",
      dataIndex: "totalAssigned",
      key: "totalAssigned",
      width: 100,
      align: "center",
    },
    {
      title: "Hoàn thành",
      dataIndex: "completed",
      key: "completed",
      width: 110,
      align: "center",
    },
    {
      title: "Đúng hạn",
      dataIndex: "onTime",
      key: "onTime",
      width: 100,
      align: "center",
    },
    {
      title: "Trễ hạn",
      dataIndex: "overdue",
      key: "overdue",
      width: 100,
      align: "center",
      render: (overdue) => (
        <span style={{ color: overdue > 0 ? "#ff4d4f" : "inherit" }}>
          {overdue}
        </span>
      ),
    },
    {
      title: "Tỷ lệ hoàn thành",
      dataIndex: "completionRate",
      key: "completionRate",
      width: 180,
      render: (rate) => (
        <Progress
          percent={rate}
          size="small"
          status={rate >= 85 ? "success" : rate >= 70 ? "normal" : "exception"}
          format={(percent) => `${percent.toFixed(1)}%`}
        />
      ),
    },
    {
      title: "Tỷ lệ đúng hạn",
      dataIndex: "onTimeRate",
      key: "onTimeRate",
      width: 180,
      render: (rate) => (
        <Progress
          percent={rate}
          size="small"
          status={rate >= 85 ? "success" : rate >= 70 ? "normal" : "exception"}
          format={(percent) => `${percent.toFixed(1)}%`}
          strokeColor="#52c41a"
        />
      ),
    },
  ];

  const handleExportReport = () => {
    console.log("Exporting maintenance report...");
  };

  return (
    <div className={styles.container}>
      <Spin spinning={loading}>
        <Card title="Báo cáo bảo trì" bordered={false}>
          <Space
            direction="vertical"
            size="large"
            style={{ width: "100%", marginBottom: 24 }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                />
              </Col>
              <Col xs={24} md={8}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Chọn kỹ thuật viên"
                  value={selectedTechnician}
                  onChange={setSelectedTechnician}
                >
                  <Option value="all">Tất cả kỹ thuật viên</Option>
                  {technicians.map((tech) => (
                    <Option key={tech.id} value={tech.id}>
                      {tech.fullName || tech.userName}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={4}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExportReport}
                  block
                >
                  Xuất báo cáo
                </Button>
              </Col>
            </Row>
          </Space>

          {/* Statistics Overview */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng hoàn thành"
                  value={statistics.totalCompleted}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Đúng hạn"
                  value={statistics.onTime}
                  prefix={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Trễ hạn"
                  value={statistics.overdue}
                  prefix={
                    <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
                  }
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ hoàn thành"
                  value={statistics.completionRate}
                  suffix="%"
                  valueStyle={{
                    color:
                      statistics.completionRate >= 85
                        ? "#52c41a"
                        : statistics.completionRate >= 70
                        ? "#1890ff"
                        : "#ff4d4f",
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Overdue Maintenance */}
          <Card
            title="Bảo trì trễ hạn"
            style={{ marginBottom: 24 }}
            headStyle={{ backgroundColor: "#fff2e8", color: "#ff4d4f" }}
          >
            <Table
              columns={overdueColumns}
              dataSource={overdueData}
              rowKey="id"
              pagination={false}
              scroll={{ x: 900 }}
            />
          </Card>

          {/* Technician Performance */}
          <Card title="Hiệu suất kỹ thuật viên">
            <Table
              columns={performanceColumns}
              dataSource={technicianPerformance}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1000 }}
            />
          </Card>
        </Card>
      </Spin>
    </div>
  );
};

export default MaintenanceReports;
