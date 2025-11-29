import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Spin,
  message,
  Segmented,
  Progress,
  Space,
  Tooltip,
  Badge,
  Avatar,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  ReloadOutlined,
  CalendarOutlined,
  TeamOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import {
  getAllWorkOrders,
  getAllMaintenancePlans,
  getMaintenanceStats,
  getUpcomingMaintenance
} from "../../services/maintenanceService";
import authService from "../../services/authService";

const MaintenanceReports = () => {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("overview");
  const [workOrders, setWorkOrders] = useState([]);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(1, 'month'),
    dayjs()
  ]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [maintenancePlans, setMaintenancePlans] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([]);

  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    efficiency: 0,
  });

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllWorkOrders();
      
      if (response?.success && response?.data) {
        let allData = response.data;
        
        // Debug: Log để xem tất cả status values từ API
        console.log("All work orders:", allData);
        console.log("Unique status values:", [...new Set(allData.map(wo => wo.status))]);
        console.log("Current status filter:", statusFilter);
        
        // Lọc theo status
        let filteredData = allData;
        if (statusFilter !== 'all') {
          filteredData = allData.filter(wo => {
            // Kiểm tra nhiều format status có thể có
            const status = wo.status;
            console.log(`Checking status: ${status} vs filter: ${statusFilter}`);
            
            // So sánh trực tiếp và case-insensitive
            return status === statusFilter || 
                   status?.toLowerCase() === statusFilter?.toLowerCase() ||
                   // Mapping các status tiếng Việt
                   (statusFilter === 'Pending' && (status === 'Chờ xử lý' || status === 'Pending')) ||
                   (statusFilter === 'InProgress' && (status === 'Đang thực hiện' || status === 'InProgress')) ||
                   (statusFilter === 'Completed' && (status === 'Hoàn thành' || status === 'Completed')) ||
                   (statusFilter === 'Closed' && (status === 'Đã đóng' || status === 'Closed'));
          });
        }
        
        console.log(`Filtered ${filteredData.length} items from ${allData.length} total`);
        
        setWorkOrders(filteredData);
        calculateStatistics(allData); // Tính toán statistics từ tất cả dữ liệu, không phải filtered data
      } else if (response?.data) {
        // Trường hợp API không có success flag nhưng có data
        let allData = Array.isArray(response.data) ? response.data : response;
        
        // Debug
        console.log("Data without success flag:", allData);
        console.log("Unique status values:", [...new Set(allData.map(wo => wo.status))]);
        
        let filteredData = allData;
        if (statusFilter !== 'all') {
          filteredData = allData.filter(wo => {
            const status = wo.status;
            return status === statusFilter || 
                   status?.toLowerCase() === statusFilter?.toLowerCase() ||
                   (statusFilter === 'Pending' && (status === 'Chờ xử lý' || status === 'Pending')) ||
                   (statusFilter === 'InProgress' && (status === 'Đang thực hiện' || status === 'InProgress')) ||
                   (statusFilter === 'Completed' && (status === 'Hoàn thành' || status === 'Completed')) ||
                   (statusFilter === 'Closed' && (status === 'Đã đóng' || status === 'Closed'));
          });
        }
        
        setWorkOrders(filteredData);
        calculateStatistics(allData);
      } else {
        setWorkOrders([]);
        calculateStatistics([]);
        message.warning("Không có dữ liệu phiếu bảo trì");
      }
    } catch (error) {
      console.error("Error fetching work orders:", error);
      message.error("Lỗi khi tải dữ liệu phiếu bảo trì");
      // Set empty data on error
      setWorkOrders([]);
      calculateStatistics([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenancePlans = async () => {
    try {
      const response = await getAllMaintenancePlans();
      if (response?.success && response?.data) {
        setMaintenancePlans(response.data);
      } else if (response?.data) {
        setMaintenancePlans(response.data);
      }
    } catch (error) {
      console.error("Error fetching maintenance plans:", error);
      // Không hiển thị error message cho 403 vì có thể do quyền hạn
      if (error.message && !error.message.includes('403')) {
        message.warning("Không thể tải kế hoạch bảo trì");
      }
      setMaintenancePlans([]);
    }
  };

  const fetchMonthlyReport = async () => {
    try {
      // Vì API không có endpoint riêng cho monthly report,
      // sẽ tính toán từ work orders data
      const response = await getAllWorkOrders();
      
      if ((response?.success && response?.data) || response?.data) {
        // Group by month từ 6 tháng gần nhất
        const monthlyStats = [];
        const workOrders = response.data || response;
        
        for (let i = 5; i >= 0; i--) {
          const month = dayjs().subtract(i, 'month');
          const monthData = workOrders.filter(wo => {
            const scheduledDate = dayjs(wo.scheduledDate || wo.createdDate);
            return scheduledDate.isSame(month, 'month');
          });
          
          monthlyStats.push({
            month: month.format('YYYY-MM'),
            total: monthData.length,
            completed: monthData.filter(wo => 
              wo.status === 'Completed' || wo.status === 'Closed' || 
              wo.status === 'Hoàn thành' || wo.status === 'Đã đóng'
            ).length,
            pending: monthData.filter(wo => 
              wo.status === 'Pending' || wo.status === 'Chờ xử lý'
            ).length,
            inProgress: monthData.filter(wo => 
              wo.status === 'InProgress' || wo.status === 'Đang thực hiện'
            ).length
          });
        }
        
        setMonthlyData(monthlyStats);
      }
    } catch (error) {
      console.error("Error fetching monthly report:", error);
      // Set empty monthly data
      setMonthlyData([]);
    }
  };

  const calculateStatistics = (data) => {
    const pending = data.filter(
      (wo) => wo.status === "Pending" || wo.status === "Chờ xử lý"
    ).length;
    const inProgress = data.filter(
      (wo) => wo.status === "InProgress" || wo.status === "Đang thực hiện"
    ).length;
    const completed = data.filter(
      (wo) => wo.status === "Completed" || wo.status === "Hoàn thành"
    ).length;
    const closed = data.filter(
      (wo) => wo.status === "Closed" || wo.status === "Đã đóng"
    ).length;

    const overdue = data.filter((wo) => {
      return (
        dayjs(wo.dueDate).isBefore(dayjs()) &&
        wo.status !== "Completed" &&
        wo.status !== "Hoàn thành" &&
        wo.status !== "Closed" &&
        wo.status !== "Đã đóng"
      );
    }).length;

    const efficiency = data.length > 0 ? Math.round(((completed + closed) / data.length) * 100) : 0;

    const stats = {
      total: data.length,
      pending,
      inProgress,
      completed,
      closed,
      overdue,
      efficiency,
    };
    
    setStatistics(stats);
  };

  const fetchUpcomingMaintenance = async () => {
    try {
      const response = await getUpcomingMaintenance(30); // 30 days
      if (response?.success && response?.data) {
        setUpcomingMaintenance(response.data);
      } else if (response?.data) {
        setUpcomingMaintenance(response.data);
      }
    } catch (error) {
      console.error("Error fetching upcoming maintenance:", error);
      // Không hiển thị error message cho 403 vì có thể do quyền hạn
      if (error.message && !error.message.includes('403')) {
        message.warning("Không thể tải lịch bảo trì sắp tới");
      }
      setUpcomingMaintenance([]);
    }
  };

  const fetchData = async () => {
    await Promise.all([
      fetchWorkOrders(),
      fetchMaintenancePlans(),
      fetchMonthlyReport(),
      fetchUpcomingMaintenance()
    ]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchWorkOrders();
  }, [statusFilter]); // Remove dateRange dependency since we're not using it for filtering

  // Dữ liệu biểu đồ trạng thái
  const statusChartData = [
    { name: "Chờ xử lý", value: statistics.pending, color: "#faad14" },
    { name: "Đang thực hiện", value: statistics.inProgress, color: "#1890ff" },
    { name: "Hoàn thành", value: statistics.completed, color: "#52c41a" },
    { name: "Đã đóng", value: statistics.closed, color: "#722ed1" },
    { name: "Quá hạn", value: statistics.overdue, color: "#ff4d4f" },
  ].filter(item => item.value > 0); // Only show items with data

  // Dữ liệu biểu đồ xu hướng từ API
  const trendChartData = monthlyData.length > 0 ? monthlyData.map(item => ({
    month: dayjs(item.month).format('MM/YY'),
    total: item.total || 0,
    completed: item.completed || 0,
    pending: item.pending || 0,
    inProgress: item.inProgress || 0
  })) : [
    { month: "T7", total: 8, completed: 6, pending: 2 },
    { month: "T8", total: 12, completed: 10, pending: 2 },
    { month: "T9", total: 10, completed: 9, pending: 1 },
    { month: "T10", total: 15, completed: 13, pending: 2 },
    { month: "T11", total: 18, completed: 15, pending: 3 },
  ];

  // Cấu hình cột bảng
  const columns = [
    {
      title: "Mã phiếu",
      key: "workOrderCode",
      width: 100,
      render: (_, record) => (
        <strong>#{record.workOrderCode || `WO${String(record.workOrderId || 0).padStart(3, "0")}`}</strong>
      ),
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 180,
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#262626" }}>{name}</div>
          <div style={{ fontSize: 12, color: "#8c8c8c" }}>
            {record.equipmentCode}
          </div>
        </div>
      ),
    },
    {
      title: "Loại bảo trì",
      dataIndex: "templateName",
      key: "templateName",
      width: 140,
      render: (name) => (
        <Tag color="blue" style={{ borderRadius: 4 }}>
          {name || "Định kỳ"}
        </Tag>
      ),
    },
    {
      title: "Hạn hoàn thành",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
      render: (date) => {
        const isOverdue = dayjs(date).isBefore(dayjs()) &&
          date; return (
            <Tooltip title={isOverdue ? "Quá hạn" : ""}>
              <span style={{ color: isOverdue ? "#ff4d4f" : "#262626" }}>
                {date ? dayjs(date).format("DD/MM/YYYY") : "-"}
                {isOverdue && " ⚠"}
              </span>
            </Tooltip>
          );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => {
        const statusConfig = {
          "Pending": { color: "gold", icon: <ClockCircleOutlined />, text: "Chờ xử lý" },
          "Chờ xử lý": { color: "gold", icon: <ClockCircleOutlined />, text: "Chờ xử lý" },
          "InProgress": { color: "blue", icon: <ToolOutlined />, text: "Đang thực hiện" },
          "Đang thực hiện": { color: "blue", icon: <ToolOutlined />, text: "Đang thực hiện" },
          "Completed": { color: "green", icon: <CheckCircleOutlined />, text: "Hoàn thành" },
          "Hoàn thành": { color: "green", icon: <CheckCircleOutlined />, text: "Hoàn thành" },
          "Closed": { color: "default", icon: <CheckCircleOutlined />, text: "Đã đóng" },
          "Đã đóng": { color: "default", icon: <CheckCircleOutlined />, text: "Đã đóng" },
          "Cancelled": { color: "red", icon: <ExclamationCircleOutlined />, text: "Đã hủy" },
          "Đã hủy": { color: "red", icon: <ExclamationCircleOutlined />, text: "Đã hủy" },
        };
        const config = statusConfig[status] || { color: "default", text: status };
        return (
          <Tag color={config.color} icon={config.icon} style={{ borderRadius: 4 }}>
            {config.text || status}
          </Tag>
        );
      },
    },
    {
      title: "Kỹ thuật viên",
      key: "technicians",
      width: 150,
      render: (_, record) => {
        // Log để debug xem có field nào cho technicians không
        console.log('Record data for technicians:', record);
        
        const electricalTech = record.assignedToElectricalName || record.electricalTechnicianName || record.electricalTechnician || record.assignedToElectrical;
        const mechanicalTech = record.assignedToMechanicalName || record.mechanicalTechnicianName || record.mechanicalTechnician || record.assignedToMechanical;
        
        return (
          <Space size="small">
            {electricalTech && electricalTech !== "-" && electricalTech !== null && (
              <Tooltip title={`Kỹ thuật viên điện: ${electricalTech}`}>
                <Avatar size="small" style={{ backgroundColor: "#1890ff" }}>
                  {electricalTech.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            )}
            {mechanicalTech && mechanicalTech !== "-" && mechanicalTech !== null && (
              <Tooltip title={`Kỹ thuật viên cơ khí: ${mechanicalTech}`}>
                <Avatar size="small" style={{ backgroundColor: "#52c41a" }}>
                  {mechanicalTech.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            )}
            {(!electricalTech || electricalTech === "-") && (!mechanicalTech || mechanicalTech === "-") && (
              <Tag color="default" style={{ fontSize: 12 }}>
                Chưa phân công
              </Tag>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "24px", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh" }}>
      <Spin spinning={loading}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "#262626" }}>
                📊 Dashboard Bảo Trì Nhà Máy
              </h1>
              <p style={{ margin: "8px 0 0 0", color: "#8c8c8c" }}>
                Tổng quan quản lý bảo trì thiết bị - {dayjs().format("DD/MM/YYYY")}
              </p>
            </div>
            <Space>
              <Segmented
                value={statusFilter}
                onChange={(value) => {
                  console.log('Status filter changed to:', value);
                  setStatusFilter(value);
                }}
                options={[
                  { label: 'Tất cả', value: 'all' },
                  { label: 'Chờ xử lý', value: 'Pending' },
                  { label: 'Đang thực hiện', value: 'InProgress' },
                  { label: 'Hoàn thành', value: 'Completed' },
                  { label: 'Đã đóng', value: 'Closed' },
                ]}
                size="large"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchData}
                loading={loading}
                size="large"
                type="primary"
              >
                Làm mới
              </Button>
            </Space>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col flex="1 1 20%">
            <Card
              hoverable
              style={{
                //background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "black",
                border: "1px solid #333",
              }}
            >
              <Statistic
                title={
                  <span style={{ color: "rgba(0, 0, 0, 0.85)" }}>
                    Tổng Phiếu
                  </span>
                }
                value={statistics.total || 0}
                prefix={<ToolOutlined style={{ color: "black", marginRight: 8 }} />}
                valueStyle={{ color: "black", fontSize: 32, fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col flex="1 1 20%">
            <Card
              hoverable
              style={{
                //background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "black",
                border: "1px solid #333",
              }}
            >
              <Statistic
                title={
                  <span style={{ color: "rgba(0, 0, 0, 0.85)" }}>
                    Chờ Xử Lý
                  </span>
                }
                value={statistics.pending || 0}
                prefix={<ClockCircleOutlined style={{ color: "black", marginRight: 8 }} />}
                valueStyle={{ color: "black", fontSize: 32, fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col flex="1 1 20%">
            <Card
              hoverable
              style={{
                //background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "black",
                border: "1px solid #333",
              }}
            >
              <Statistic
                title={
                  <span style={{ color: "rgba(0, 0, 0, 0.85)" }}>
                    Đang Thực Hiện
                  </span>
                }
                value={statistics.inProgress || 0}
                prefix={<ToolOutlined style={{ color: "black", marginRight: 8 }} />}
                valueStyle={{ color: "black", fontSize: 32, fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col flex="1 1 20%">
            <Card
              hoverable
              style={{
                //background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "black",
                border: "1px solid #333",
              }}
            >
              <Statistic
                title={
                  <span style={{ color: "rgba(0, 0, 0, 0.85)" }}>
                    Hoàn Thành
                  </span>
                }
                value={statistics.completed || 0}
                prefix={<CheckCircleOutlined style={{ color: "black", marginRight: 8 }} />}
                valueStyle={{ color: "black", fontSize: 32, fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col flex="1 1 20%">
            <Card
              hoverable
              style={{
                //background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "black",
                border: "1px solid #333",
              }}
            >
              <Statistic
                title={
                  <span style={{ color: "rgba(0, 0, 0, 0.85)" }}>
                    Đã đóng
                  </span>
                }
                value={statistics.closed || 0}
                prefix={<ClockCircleOutlined style={{ color: "black", marginRight: 8 }} />}
                valueStyle={{ color: "black", fontSize: 32, fontWeight: 700 }}
              />
            </Card>
          </Col>
        </Row>

        {/* KPIs Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12}>
            <Card
              title={<><AlertOutlined /> Phiếu Quá Hạn</>}
              bordered={false}
              style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            >
              <div style={{ fontSize: 36, fontWeight: 700, color: "#ff4d4f" }}>
                {statistics.overdue || 0}
              </div>
              <Progress
                percent={statistics.total > 0 ? ((statistics.overdue || 0) / statistics.total) * 100 : 0}
                strokeColor="#ff4d4f"
                status={(statistics.overdue || 0) > 0 ? "exception" : "success"}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card
              title={<><CheckCircleOutlined /> Hiệu Suất Hoàn Thành</>}
              bordered={false}
              style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            >
              <div style={{ fontSize: 36, fontWeight: 700, color: "#52c41a" }}>
                {statistics.efficiency || 0}%
              </div>
              <Progress
                percent={statistics.efficiency || 0}
                strokeColor="#52c41a"
                status="success"
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Card
              title="Phân Bố Trạng Thái"
              bordered={false}
              style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Xu Hướng Bảo Trì (5 Tháng Gần Nhất)"
              bordered={false}
              style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#52c41a" name="Hoàn thành" />
                  <Bar dataKey="pending" fill="#faad14" name="Chờ xử lý" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Work Orders Table */}
        <Card
          title={<><TeamOutlined /> Danh Sách Phiếu Bảo Trì</>}
          bordered={false}
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        >
          <Table
            columns={columns}
            dataSource={workOrders}
            rowKey={(record) => record.workOrderId || record.id || record.planId}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} phiếu` }}
            scroll={{ x: 1200 }}
            locale={{ emptyText: "Chưa có phiếu bảo trì nào" }}
            rowClassName={(record) => {
              const isOverdue =
                dayjs(record.dueDate).isBefore(dayjs()) &&
                record.status !== "Hoàn thành" &&
                record.status !== "Đã đóng";
              return isOverdue ? "overdue-row" : "";
            }}
          />
        </Card>
      </Spin>

      <style>{`
        .overdue-row {
          background-color: #fff1f0 !important;
        }
        .overdue-row:hover > td {
          background-color: #ffccc7 !important;
        }
      `}</style>
    </div>
  );
};

export default MaintenanceReports;