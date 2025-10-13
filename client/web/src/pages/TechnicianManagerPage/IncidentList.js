import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Tag,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Descriptions,
  Timeline,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/IncidentList.module.css";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const IncidentList = () => {
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Mock data
  const incidents = [
    {
      incidentId: 1,
      equipmentId: "EQ001",
      equipmentName: "Máy dập 01",
      issue: "Máy không khởi động được",
      reason: "Lỗi nguồn điện, cầu chì bị đứt",
      solution: "Thay cầu chì mới và kiểm tra hệ thống điện",
      priority: "High",
      status: "Resolved",
      startTime: "2025-01-08 08:30:00",
      endTime: "2025-01-08 10:15:00",
      reportedBy: "Nguyễn Văn A",
      assignedTo: "Trần Thị B",
      downtime: 105, // minutes
    },
    {
      incidentId: 2,
      equipmentId: "EQ002",
      equipmentName: "Máy cắt 02",
      issue: "Lưỡi cắt bị mòn, chất lượng cắt kém",
      reason: "Lưỡi cắt đã sử dụng quá thời hạn",
      solution: "Thay lưỡi cắt mới",
      priority: "Medium",
      status: "In Progress",
      startTime: "2025-01-10 14:00:00",
      endTime: null,
      reportedBy: "Phạm Văn C",
      assignedTo: "Lê Văn D",
      downtime: null,
    },
    {
      incidentId: 3,
      equipmentId: "EQ003",
      equipmentName: "Máy hàn 03",
      issue: "Máy phát ra tiếng kêu bất thường",
      reason: "Chưa xác định",
      solution: null,
      priority: "Low",
      status: "Reported",
      startTime: "2025-01-11 09:00:00",
      endTime: null,
      reportedBy: "Hoàng Thị E",
      assignedTo: null,
      downtime: null,
    },
  ];

  const columns = [
    {
      title: "Mã sự cố",
      dataIndex: "incidentId",
      key: "incidentId",
      width: 100,
      render: (id) => `INC${String(id).padStart(3, "0")}`,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 150,
    },
    {
      title: "Vấn đề",
      dataIndex: "issue",
      key: "issue",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Mức độ",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority) => {
        let color = "default";
        let text = "";
        if (priority === "High") {
          color = "error";
          text = "Cao";
        } else if (priority === "Medium") {
          color = "warning";
          text = "Trung bình";
        } else {
          color = "default";
          text = "Thấp";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => {
        let color = "default";
        let text = "";
        let icon = null;
        if (status === "Reported") {
          color = "processing";
          text = "Đã báo cáo";
          icon = <ClockCircleOutlined />;
        } else if (status === "In Progress") {
          color = "warning";
          text = "Đang xử lý";
          icon = <ToolOutlined />;
        } else {
          color = "success";
          text = "Đã xử lý";
          icon = <CheckCircleOutlined />;
        }
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Người báo cáo",
      dataIndex: "reportedBy",
      key: "reportedBy",
      width: 130,
    },
    {
      title: "Người xử lý",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 130,
      render: (text) =>
        text || <span style={{ color: "#ccc" }}>Chưa phân công</span>,
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      width: 150,
      render: (time) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const handleViewDetail = (record) => {
    setSelectedIncident(record);
    setDetailModalVisible(true);
  };

  const filteredIncidents = incidents.filter((incident) => {
    const matchSearch =
      incident.equipmentName.toLowerCase().includes(searchText.toLowerCase()) ||
      incident.issue.toLowerCase().includes(searchText.toLowerCase()) ||
      incident.reportedBy.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus =
      filterStatus === "all" || incident.status === filterStatus;
    const matchPriority =
      filterPriority === "all" || incident.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const getTimelineItems = (incident) => {
    const items = [
      {
        color: "blue",
        children: (
          <>
            <p>
              <strong>Báo cáo sự cố</strong>
            </p>
            <p>Người báo cáo: {incident.reportedBy}</p>
            <p>
              Thời gian: {dayjs(incident.startTime).format("DD/MM/YYYY HH:mm")}
            </p>
          </>
        ),
      },
    ];

    if (incident.assignedTo) {
      items.push({
        color: "orange",
        children: (
          <>
            <p>
              <strong>Phân công xử lý</strong>
            </p>
            <p>Người xử lý: {incident.assignedTo}</p>
          </>
        ),
      });
    }

    if (incident.status === "In Progress") {
      items.push({
        color: "orange",
        children: (
          <>
            <p>
              <strong>Đang xử lý</strong>
            </p>
            <p>Đang tiến hành khắc phục sự cố...</p>
          </>
        ),
      });
    }

    if (incident.status === "Resolved") {
      items.push({
        color: "green",
        children: (
          <>
            <p>
              <strong>Đã xử lý xong</strong>
            </p>
            <p>
              Thời gian hoàn thành:{" "}
              {dayjs(incident.endTime).format("DD/MM/YYYY HH:mm")}
            </p>
            <p>Thời gian ngừng hoạt động: {incident.downtime} phút</p>
          </>
        ),
      });
    }

    return items;
  };

  return (
    <div className={styles.container}>
      <Card title="Danh sách sự cố" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm theo thiết bị, vấn đề hoặc người báo cáo"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Lọc theo trạng thái"
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="Reported">Đã báo cáo</Option>
                <Option value="In Progress">Đang xử lý</Option>
                <Option value="Resolved">Đã xử lý</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Lọc theo mức độ"
                value={filterPriority}
                onChange={setFilterPriority}
              >
                <Option value="all">Tất cả mức độ</Option>
                <Option value="High">Cao</Option>
                <Option value="Medium">Trung bình</Option>
                <Option value="Low">Thấp</Option>
              </Select>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={filteredIncidents}
            rowKey="incidentId"
            loading={loading}
            scroll={{ x: 1400 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} sự cố`,
            }}
          />
        </Space>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết sự cố INC${String(
          selectedIncident?.incidentId
        ).padStart(3, "0")}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {selectedIncident && (
          <div className={styles.detailContent}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã sự cố" span={1}>
                INC{String(selectedIncident.incidentId).padStart(3, "0")}
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ" span={1}>
                <Tag
                  color={
                    selectedIncident.priority === "High"
                      ? "error"
                      : selectedIncident.priority === "Medium"
                      ? "warning"
                      : "default"
                  }
                >
                  {selectedIncident.priority === "High"
                    ? "Cao"
                    : selectedIncident.priority === "Medium"
                    ? "Trung bình"
                    : "Thấp"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thiết bị" span={1}>
                {selectedIncident.equipmentName} ({selectedIncident.equipmentId}
                )
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag
                  color={
                    selectedIncident.status === "Reported"
                      ? "processing"
                      : selectedIncident.status === "In Progress"
                      ? "warning"
                      : "success"
                  }
                >
                  {selectedIncident.status === "Reported"
                    ? "Đã báo cáo"
                    : selectedIncident.status === "In Progress"
                    ? "Đang xử lý"
                    : "Đã xử lý"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Vấn đề" span={2}>
                {selectedIncident.issue}
              </Descriptions.Item>
              <Descriptions.Item label="Nguyên nhân" span={2}>
                {selectedIncident.reason || (
                  <span style={{ color: "#ccc" }}>Chưa xác định</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Giải pháp" span={2}>
                {selectedIncident.solution || (
                  <span style={{ color: "#ccc" }}>Chưa có</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Người báo cáo" span={1}>
                {selectedIncident.reportedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Người xử lý" span={1}>
                {selectedIncident.assignedTo || (
                  <span style={{ color: "#ccc" }}>Chưa phân công</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian bắt đầu" span={1}>
                {dayjs(selectedIncident.startTime).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian kết thúc" span={1}>
                {selectedIncident.endTime ? (
                  dayjs(selectedIncident.endTime).format("DD/MM/YYYY HH:mm")
                ) : (
                  <span style={{ color: "#ccc" }}>Chưa hoàn thành</span>
                )}
              </Descriptions.Item>
              {selectedIncident.downtime && (
                <Descriptions.Item label="Thời gian ngừng hoạt động" span={2}>
                  {selectedIncident.downtime} phút
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h4>Lịch sử xử lý</h4>
              <Timeline items={getTimelineItems(selectedIncident)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IncidentList;
