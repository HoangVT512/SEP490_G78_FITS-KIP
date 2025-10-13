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
  Checkbox,
  DatePicker,
  Row,
  Col,
  List,
  Progress,
  message,
  Badge,
  Divider,
  Alert,
  Steps,
} from "antd";
import {
  CheckSquareOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  ToolOutlined,
  WarningOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/MaintenanceChecklist.module.css";

const { TextArea } = Input;

const MaintenanceChecklist = () => {
  const [loading, setLoading] = useState(false);
  const [checklists, setChecklists] = useState([]);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [checklistModalVisible, setChecklistModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();

  // Mock data - sẽ thay bằng API call sau
  useEffect(() => {
    fetchChecklists();
  }, [filterStatus]);

  const fetchChecklists = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockData = [
        {
          key: 1,
          planId: 1,
          planCode: "PM-001",
          equipmentId: 10,
          equipmentCode: "EQ-010",
          equipmentName: "Máy phay CNC",
          maintenanceType: "Bảo trì định kỳ",
          scheduledDate: "2025-10-13",
          status: "Đang thực hiện",
          totalSteps: 8,
          completedSteps: 3,
          lineName: "Dây chuyền 1",
          checklistItems: [
            {
              id: 1,
              stepName: "Kiểm tra hệ thống bôi trơn",
              isChecked: true,
              completedDate: "2025-10-13 14:15",
              notes: "Mức dầu bình thường",
            },
            {
              id: 2,
              stepName: "Kiểm tra độ rung động",
              isChecked: true,
              completedDate: "2025-10-13 14:30",
              notes: "Độ rung trong giới hạn cho phép",
            },
            {
              id: 3,
              stepName: "Kiểm tra hệ thống làm mát",
              isChecked: true,
              completedDate: "2025-10-13 14:45",
              notes: "Hệ thống hoạt động tốt",
            },
            {
              id: 4,
              stepName: "Thay dầu động cơ",
              isChecked: false,
              completedDate: null,
              notes: null,
            },
            {
              id: 5,
              stepName: "Kiểm tra hệ thống điện",
              isChecked: false,
              completedDate: null,
              notes: null,
            },
            {
              id: 6,
              stepName: "Vệ sinh máy móc",
              isChecked: false,
              completedDate: null,
              notes: null,
            },
            {
              id: 7,
              stepName: "Kiểm tra an toàn",
              isChecked: false,
              completedDate: null,
              notes: null,
            },
            {
              id: 8,
              stepName: "Ghi nhận và báo cáo",
              isChecked: false,
              completedDate: null,
              notes: null,
            },
          ],
        },
        {
          key: 2,
          planId: 5,
          planCode: "PM-005",
          equipmentId: 22,
          equipmentCode: "EQ-022",
          equipmentName: "Máy tiện tự động",
          maintenanceType: "Kiểm tra an toàn",
          scheduledDate: "2025-10-13",
          status: "Chưa bắt đầu",
          totalSteps: 5,
          completedSteps: 0,
          lineName: "Dây chuyền 2",
          checklistItems: [
            {
              id: 1,
              stepName: "Kiểm tra hệ thống khẩn cấp",
              isChecked: false,
              completedDate: null,
              notes: null,
            },
            {
              id: 2,
              stepName: "Kiểm tra rào chắn an toàn",
              isChecked: false,
              completedDate: null,
              notes: null,
            },
            {
              id: 3,
              stepName: "Kiểm tra nút dừng khẩn cấp",
              isChecked: false,
              completedDate: null,
              notes: null,
            },
            {
              id: 4,
              stepName: "Kiểm tra cảm biến an toàn",
              isChecked: false,
              completedDate: null,
              notes: null,
            },
            {
              id: 5,
              stepName: "Ghi nhận kết quả",
              isChecked: false,
              completedDate: null,
              notes: null,
            },
          ],
        },
        {
          key: 3,
          planId: 3,
          planCode: "PM-003",
          equipmentId: 5,
          equipmentCode: "EQ-005",
          equipmentName: "Máy khoan CNC",
          maintenanceType: "Bảo trì định kỳ",
          scheduledDate: "2025-09-30",
          status: "Hoàn thành",
          totalSteps: 6,
          completedSteps: 6,
          lineName: "Dây chuyền 1",
          completedDate: "2025-09-30 16:30",
          checklistItems: [
            {
              id: 1,
              stepName: "Kiểm tra đầu khoan",
              isChecked: true,
              completedDate: "2025-09-30 14:10",
              notes: "Đầu khoan còn tốt",
            },
            {
              id: 2,
              stepName: "Kiểm tra hệ thống làm mát",
              isChecked: true,
              completedDate: "2025-09-30 14:25",
              notes: "Bổ sung dung dịch làm mát",
            },
            {
              id: 3,
              stepName: "Bôi trơn bạc đạn",
              isChecked: true,
              completedDate: "2025-09-30 14:50",
              notes: "Đã bôi trơn đầy đủ",
            },
            {
              id: 4,
              stepName: "Kiểm tra độ chính xác",
              isChecked: true,
              completedDate: "2025-09-30 15:20",
              notes: "Độ chính xác đạt yêu cầu",
            },
            {
              id: 5,
              stepName: "Vệ sinh máy",
              isChecked: true,
              completedDate: "2025-09-30 15:45",
              notes: "Đã vệ sinh sạch sẽ",
            },
            {
              id: 6,
              stepName: "Hoàn tất báo cáo",
              isChecked: true,
              completedDate: "2025-09-30 16:30",
              notes: "Máy hoạt động tốt",
            },
          ],
        },
      ];

      if (filterStatus !== "all") {
        setChecklists(mockData.filter((item) => item.status === filterStatus));
      } else {
        setChecklists(mockData);
      }

      setLoading(false);
    }, 500);
  };

  const columns = [
    {
      title: "Mã kế hoạch",
      dataIndex: "planCode",
      key: "planCode",
      width: 110,
      fixed: "left",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Thiết bị",
      key: "equipment",
      width: 180,
      render: (record) => (
        <div>
          <div style={{ fontWeight: 500, color: "#1890ff" }}>
            {record.equipmentCode}
          </div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {record.equipmentName}
          </div>
        </div>
      ),
    },
    {
      title: "Vị trí",
      dataIndex: "lineName",
      key: "lineName",
      width: 130,
    },
    {
      title: "Loại bảo trì",
      dataIndex: "maintenanceType",
      key: "maintenanceType",
      width: 140,
    },
    {
      title: "Ngày thực hiện",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      width: 120,
    },
    {
      title: "Tiến độ",
      key: "progress",
      width: 200,
      render: (record) => (
        <div>
          <Progress
            percent={Math.round(
              (record.completedSteps / record.totalSteps) * 100
            )}
            size="small"
            status={
              record.status === "Hoàn thành"
                ? "success"
                : record.status === "Đang thực hiện"
                ? "active"
                : "normal"
            }
          />
          <div style={{ fontSize: "11px", color: "#888", marginTop: 4 }}>
            {record.completedSteps} / {record.totalSteps} bước
          </div>
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
        let icon = null;
        if (status === "Đang thực hiện") {
          color = "processing";
          icon = <ClockCircleOutlined />;
        } else if (status === "Chưa bắt đầu") {
          color = "default";
          icon = <WarningOutlined />;
        } else if (status === "Hoàn thành") {
          color = "success";
          icon = <CheckCircleOutlined />;
        }
        return (
          <Tag icon={icon} color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right",
      render: (record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewChecklist(record, false)}
          >
            Xem
          </Button>
          {record.status !== "Hoàn thành" && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleViewChecklist(record, true)}
            >
              Thực hiện
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleViewChecklist = (checklist, isEdit) => {
    setSelectedChecklist({ ...checklist, isEdit });
    setChecklistModalVisible(true);
  };

  const handleCheckItem = (itemId, checked, notes) => {
    const updatedItems = selectedChecklist.checklistItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          isChecked: checked,
          completedDate: checked ? dayjs().format("YYYY-MM-DD HH:mm") : null,
          notes: notes || item.notes,
        };
      }
      return item;
    });

    const completedSteps = updatedItems.filter((item) => item.isChecked).length;

    setSelectedChecklist({
      ...selectedChecklist,
      checklistItems: updatedItems,
      completedSteps: completedSteps,
    });
  };

  const handleSaveChecklist = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Lưu checklist thành công!");
      setChecklistModalVisible(false);
      fetchChecklists();
    } catch (error) {
      message.error("Lưu checklist thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChecklist = async () => {
    const allCompleted = selectedChecklist.checklistItems.every(
      (item) => item.isChecked
    );

    if (!allCompleted) {
      message.warning("Vui lòng hoàn thành tất cả các bước!");
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Hoàn thành checklist thành công!");
      setChecklistModalVisible(false);
      fetchChecklists();
    } catch (error) {
      message.error("Hoàn thành checklist thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return checklists.filter((i) => i.status === status).length;
  };

  return (
    <div className={styles.checklistContainer}>
      {/* Statistics Row */}
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
                {checklists.length}
              </div>
              <div style={{ fontSize: "14px", color: "#888", marginTop: 8 }}>
                Tổng checklist
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
                {checklists.filter((c) => c.status === "Hoàn thành").length}
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
                {checklists.filter((c) => c.status === "Đang thực hiện").length}
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
                percent={Math.round(
                  (checklists.filter((c) => c.status === "Hoàn thành").length /
                    (checklists.length || 1)) *
                    100
                )}
                width={80}
                strokeColor="#52c41a"
              />
              <div style={{ fontSize: "14px", color: "#888", marginTop: 8 }}>
                Tỷ lệ hoàn thành
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <CheckSquareOutlined />
            <span>Danh sách Checklist bảo trì</span>
          </Space>
        }
        extra={
          <Space>
            <Button type="primary" onClick={fetchChecklists} loading={loading}>
              Làm mới
            </Button>
          </Space>
        }
        bordered={false}
      >
        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <Space size="middle">
            <Button
              type={filterStatus === "all" ? "primary" : "default"}
              onClick={() => setFilterStatus("all")}
            >
              Tất cả ({checklists.length})
            </Button>
            <Badge count={getStatusBadge("Chưa bắt đầu")} color="gray">
              <Button
                type={filterStatus === "Chưa bắt đầu" ? "primary" : "default"}
                onClick={() => setFilterStatus("Chưa bắt đầu")}
              >
                Chưa bắt đầu
              </Button>
            </Badge>
            <Badge count={getStatusBadge("Đang thực hiện")} color="blue">
              <Button
                type={filterStatus === "Đang thực hiện" ? "primary" : "default"}
                onClick={() => setFilterStatus("Đang thực hiện")}
              >
                Đang thực hiện
              </Button>
            </Badge>
            <Badge count={getStatusBadge("Hoàn thành")} color="green">
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

        {/* Table */}
        <Table
          columns={columns}
          dataSource={checklists}
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} checklist`,
          }}
        />
      </Card>

      {/* Checklist Modal */}
      <Modal
        title={
          <Space>
            <CheckSquareOutlined />
            <span>
              Checklist - {selectedChecklist?.planCode} (
              {selectedChecklist?.equipmentCode})
            </span>
          </Space>
        }
        open={checklistModalVisible}
        onCancel={() => setChecklistModalVisible(false)}
        footer={
          selectedChecklist?.isEdit
            ? [
                <Button
                  key="save"
                  icon={<SaveOutlined />}
                  onClick={handleSaveChecklist}
                  loading={loading}
                >
                  Lưu tiến độ
                </Button>,
                <Button
                  key="complete"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleCompleteChecklist}
                  loading={loading}
                  disabled={
                    selectedChecklist?.completedSteps !==
                    selectedChecklist?.totalSteps
                  }
                >
                  Hoàn thành
                </Button>,
              ]
            : [
                <Button
                  key="close"
                  onClick={() => setChecklistModalVisible(false)}
                >
                  Đóng
                </Button>,
              ]
        }
        width={900}
      >
        {selectedChecklist && (
          <div>
            {/* Header Info */}
            <Alert
              message={
                <div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div>
                        <strong>Thiết bị:</strong>{" "}
                        {selectedChecklist.equipmentCode} -{" "}
                        {selectedChecklist.equipmentName}
                      </div>
                      <div>
                        <strong>Vị trí:</strong> {selectedChecklist.lineName}
                      </div>
                    </Col>
                    <Col span={12}>
                      <div>
                        <strong>Loại bảo trì:</strong>{" "}
                        {selectedChecklist.maintenanceType}
                      </div>
                      <div>
                        <strong>Ngày thực hiện:</strong>{" "}
                        {selectedChecklist.scheduledDate}
                      </div>
                    </Col>
                  </Row>
                </div>
              }
              type="info"
              style={{ marginBottom: 16 }}
            />

            {/* Progress */}
            <div style={{ marginBottom: 16 }}>
              <Progress
                percent={Math.round(
                  (selectedChecklist.completedSteps /
                    selectedChecklist.totalSteps) *
                    100
                )}
                status={
                  selectedChecklist.status === "Hoàn thành"
                    ? "success"
                    : selectedChecklist.completedSteps > 0
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
                {selectedChecklist.completedSteps} /{" "}
                {selectedChecklist.totalSteps} bước đã hoàn thành
              </div>
            </div>

            <Divider />

            {/* Checklist Items */}
            <Steps
              direction="vertical"
              current={selectedChecklist.completedSteps}
              items={selectedChecklist.checklistItems.map((item, index) => ({
                title: (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {selectedChecklist.isEdit && !item.isChecked ? (
                      <Checkbox
                        checked={item.isChecked}
                        onChange={(e) => {
                          const notes = prompt("Ghi chú (nếu có):");
                          handleCheckItem(item.id, e.target.checked, notes);
                        }}
                      />
                    ) : (
                      <CheckCircleOutlined
                        style={{
                          color: item.isChecked ? "#52c41a" : "#d9d9d9",
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontWeight: item.isChecked ? "normal" : "500",
                        textDecoration: item.isChecked
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {item.stepName}
                    </span>
                  </div>
                ),
                description: item.isChecked && (
                  <div style={{ marginLeft: 32, fontSize: "12px" }}>
                    <div style={{ color: "#888" }}>
                      Hoàn thành: {item.completedDate}
                    </div>
                    {item.notes && (
                      <div style={{ color: "#666", marginTop: 4 }}>
                        Ghi chú: {item.notes}
                      </div>
                    )}
                  </div>
                ),
                status: item.isChecked
                  ? "finish"
                  : index < selectedChecklist.completedSteps
                  ? "process"
                  : "wait",
              }))}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaintenanceChecklist;
