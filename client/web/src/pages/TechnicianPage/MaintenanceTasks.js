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
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getMyWorkOrders,
  startWorkOrder,
  completeWorkOrder,
  updateChecklistItem,
} from "../../services/maintenanceService";
import { authService } from "../../services/authService";
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
  const [updatingChecklist, setUpdatingChecklist] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [checklistNotes, setChecklistNotes] = useState({}); // Lưu notes cho từng item
  const [form] = Form.useForm();

  const currentUser = authService.getStoredUser();
  const currentUserId = currentUser?.id || currentUser?.userId;

  useEffect(() => {
    fetchWorkOrders();
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
      title: "Ngày đến hạn",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 130,
      render: (text, record) => {
        if (!text) return "-";
        const dueDate = dayjs(text);
        const today = dayjs();
        const isOverdue =
          dueDate.isBefore(today, "day") && record?.status !== "Completed";
        const isToday = dueDate.isSame(today, "day");
        return (
          <div
            style={{
              fontSize: "12px",
              color: isOverdue ? "#ff4d4f" : isToday ? "#faad14" : "inherit",
              fontWeight: isOverdue || isToday ? 500 : "normal",
            }}
          >
            {dueDate.format("DD/MM/YYYY")}
            {isOverdue && <Badge status="error" style={{ marginLeft: 8 }} />}
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
      render: (status) => {
        let color = "default";
        let icon = null;
        let text = status || "-";
        if (status === "InProgress") {
          color = "processing";
          icon = <PlayCircleOutlined />;
          text = "Đang thực hiện";
        } else if (status === "Pending") {
          color = "warning";
          icon = <ClockCircleOutlined />;
          text = "Chờ xử lý";
        } else if (status === "Completed") {
          color = "success";
          icon = <CheckCircleOutlined />;
          text = "Hoàn thành";
        } else if (status === "Cancelled") {
          color = "error";
          icon = <StopOutlined />;
          text = "Đã hủy";
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

        const items = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "Chi tiết",
            onClick: () => handleViewDetail(record),
          },
          (record.status === "Pending" || record.status === "InProgress") && {
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
  };

  const handleNoteChange = (checklistId, value) => {
    setChecklistNotes((prev) => ({
      ...prev,
      [checklistId]: value,
    }));
  };

  const handleCheckItem = async (item, checked) => {
    try {
      setUpdatingChecklist(true);

      // Nếu đang tick item và work order đang Pending → Tự động chuyển sang InProgress
      if (checked && selectedWorkOrder.status === "Pending") {
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
    return workOrders.filter((wo) => wo.status === filterStatus);
  };

  const getStatusCount = (status) => {
    if (status === "all") return workOrders.length;
    return workOrders.filter((wo) => wo.status === status).length;
  };

  const getTaskProgress = () => {
    const completed = workOrders.filter((t) => t.status === "Completed").length;
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
                {getStatusCount("Completed")}
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
                {getStatusCount("InProgress")}
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
            <Badge count={getStatusCount("Pending")} color="orange">
              <Button
                type={filterStatus === "Pending" ? "primary" : "default"}
                onClick={() => setFilterStatus("Pending")}
              >
                Chờ xử lý
              </Button>
            </Badge>
            <Badge count={getStatusCount("InProgress")} color="blue">
              <Button
                type={filterStatus === "InProgress" ? "primary" : "default"}
                onClick={() => setFilterStatus("InProgress")}
              >
                Đang thực hiện
              </Button>
            </Badge>
            <Badge count={getStatusCount("Completed")} color="green">
              <Button
                type={filterStatus === "Completed" ? "primary" : "default"}
                onClick={() => setFilterStatus("Completed")}
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
                        <strong>Ngày đến hạn:</strong>{" "}
                        {dayjs(selectedWorkOrder.dueDate).format("DD/MM/YYYY")}
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
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
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
                {selectedWorkOrder.status === "InProgress" ? (
                  <Tag icon={<PlayCircleOutlined />} color="processing">
                    Đang thực hiện
                  </Tag>
                ) : selectedWorkOrder.status === "Pending" ? (
                  <Tag icon={<ClockCircleOutlined />} color="warning">
                    Chờ xử lý
                  </Tag>
                ) : selectedWorkOrder.status === "Completed" ? (
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
              <Descriptions.Item label="Ngày đến hạn" span={1}>
                {dayjs(selectedWorkOrder.dueDate).format("DD/MM/YYYY")}
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
    </div>
  );
};

export default MaintenanceTasks;
