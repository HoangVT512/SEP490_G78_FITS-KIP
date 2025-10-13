import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Descriptions,
  Tag,
  Select,
  Input,
  DatePicker,
  Timeline,
} from "antd";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import styles from "../../styles/pages/ManagerIncidentList.module.css";

dayjs.extend(isBetween);

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const ManagerIncidentList = () => {
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);

  // Mock incident data
  const incidentsData = [
    {
      id: 1,
      incidentId: "INC001",
      title: "Máy dập 01 dừng đột ngột",
      equipmentId: "EQ001",
      equipmentName: "Máy dập 01",
      reportedBy: "Nguyễn Văn A",
      reportedDate: "2025-01-10 08:30",
      priority: "High",
      status: "In Progress",
      assignedTo: "Trần Văn B",
      description: "Máy dập 01 dừng hoạt động đột ngột trong ca sản xuất",
      rootCause: "Motor điện bị cháy do quá tải",
      resolution: "Đang tiến hành thay thế motor mới",
      downtimeHours: 4,
      estimatedCost: 5000000,
      timeline: [
        {
          time: "2025-01-10 08:30",
          status: "Báo cáo",
          description: "Người vận hành báo cáo sự cố",
          user: "Nguyễn Văn A",
        },
        {
          time: "2025-01-10 08:45",
          status: "Phân công",
          description: "Phân công kỹ thuật viên xử lý",
          user: "Quản lý kỹ thuật",
        },
        {
          time: "2025-01-10 09:00",
          status: "Đang xử lý",
          description: "Kỹ thuật viên bắt đầu kiểm tra và xử lý",
          user: "Trần Văn B",
        },
      ],
    },
    {
      id: 2,
      incidentId: "INC002",
      title: "Rò rỉ dầu thủy lực máy ép",
      equipmentId: "EQ002",
      equipmentName: "Máy ép thủy lực",
      reportedBy: "Lê Thị C",
      reportedDate: "2025-01-09 14:20",
      priority: "Medium",
      status: "Resolved",
      assignedTo: "Phạm Văn D",
      description: "Phát hiện rò rỉ dầu thủy lực từ đường ống cấp",
      rootCause: "Đường ống bị nứt do mỏi vật liệu",
      resolution: "Đã thay thế đoạn ống bị nứt, kiểm tra hệ thống",
      downtimeHours: 2,
      estimatedCost: 500000,
      resolvedDate: "2025-01-09 16:30",
      timeline: [
        {
          time: "2025-01-09 14:20",
          status: "Báo cáo",
          description: "Phát hiện rò rỉ dầu",
          user: "Lê Thị C",
        },
        {
          time: "2025-01-09 14:30",
          status: "Phân công",
          description: "Phân công kỹ thuật viên",
          user: "Quản lý kỹ thuật",
        },
        {
          time: "2025-01-09 14:45",
          status: "Đang xử lý",
          description: "Bắt đầu sửa chữa",
          user: "Phạm Văn D",
        },
        {
          time: "2025-01-09 16:30",
          status: "Hoàn thành",
          description: "Đã thay thế ống, kiểm tra hệ thống OK",
          user: "Phạm Văn D",
        },
      ],
    },
    {
      id: 3,
      incidentId: "INC003",
      title: "Băng tải B bị trượt",
      equipmentId: "EQ003",
      equipmentName: "Băng tải B",
      reportedBy: "Hoàng Văn E",
      reportedDate: "2025-01-08 10:15",
      priority: "Low",
      status: "Resolved",
      assignedTo: "Nguyễn Văn A",
      description: "Băng tải bị trượt, không kéo được sản phẩm",
      rootCause: "Lực căng băng tải không đủ",
      resolution: "Đã điều chỉnh lực căng băng tải",
      downtimeHours: 1,
      estimatedCost: 0,
      resolvedDate: "2025-01-08 11:30",
      timeline: [
        {
          time: "2025-01-08 10:15",
          status: "Báo cáo",
          description: "Băng tải bị trượt",
          user: "Hoàng Văn E",
        },
        {
          time: "2025-01-08 10:20",
          status: "Phân công",
          description: "Phân công kỹ thuật viên",
          user: "Quản lý kỹ thuật",
        },
        {
          time: "2025-01-08 10:30",
          status: "Đang xử lý",
          description: "Kiểm tra và điều chỉnh",
          user: "Nguyễn Văn A",
        },
        {
          time: "2025-01-08 11:30",
          status: "Hoàn thành",
          description: "Đã điều chỉnh lực căng, hoạt động bình thường",
          user: "Nguyễn Văn A",
        },
      ],
    },
  ];

  const columns = [
    {
      title: "Mã sự cố",
      dataIndex: "incidentId",
      key: "incidentId",
      width: 100,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentId",
      key: "equipmentId",
      width: 120,
    },
    {
      title: "Người báo cáo",
      dataIndex: "reportedBy",
      key: "reportedBy",
      width: 150,
    },
    {
      title: "Ngày báo cáo",
      dataIndex: "reportedDate",
      key: "reportedDate",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority) => {
        let color = "default";
        if (priority === "High") color = "error";
        else if (priority === "Medium") color = "warning";
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "processing";
        let text = status;
        if (status === "Resolved") {
          color = "success";
          text = "Đã giải quyết";
        } else if (status === "In Progress") {
          text = "Đang xử lý";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thời gian chết (h)",
      dataIndex: "downtimeHours",
      key: "downtimeHours",
      width: 150,
      align: "center",
      render: (hours) => <span>{hours}h</span>,
    },
    {
      title: "Chi phí ước tính",
      dataIndex: "estimatedCost",
      key: "estimatedCost",
      width: 150,
      render: (cost) =>
        cost > 0 ? `${cost.toLocaleString()} đ` : "Chưa xác định",
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 120,
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

  const filteredData = incidentsData.filter((item) => {
    const matchSearch =
      item.incidentId.toLowerCase().includes(searchText.toLowerCase()) ||
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.equipmentId.toLowerCase().includes(searchText.toLowerCase());

    const matchPriority =
      filterPriority === "all" || item.priority === filterPriority;

    const matchStatus = filterStatus === "all" || item.status === filterStatus;

    const matchDate = dayjs(item.reportedDate).isBetween(
      dateRange[0],
      dateRange[1],
      "day",
      "[]"
    );

    return matchSearch && matchPriority && matchStatus && matchDate;
  });

  return (
    <div className={styles.container}>
      <Card title="Danh sách sự cố" bordered={false}>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginBottom: 16 }}
        >
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              style={{ width: 280 }}
            />
            <Select
              style={{ width: 150 }}
              placeholder="Ưu tiên"
              value={filterPriority}
              onChange={setFilterPriority}
            >
              <Option value="all">Tất cả ưu tiên</Option>
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
            <Select
              style={{ width: 150 }}
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="In Progress">Đang xử lý</Option>
              <Option value="Resolved">Đã giải quyết</Option>
            </Select>
            <Search
              placeholder="Tìm theo mã, tiêu đề, thiết bị"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sự cố`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết sự cố - ${selectedIncident?.incidentId}`}
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
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã sự cố" span={1}>
                {selectedIncident.incidentId}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag
                  color={
                    selectedIncident.status === "Resolved"
                      ? "success"
                      : "processing"
                  }
                >
                  {selectedIncident.status === "Resolved"
                    ? "Đã giải quyết"
                    : "Đang xử lý"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tiêu đề" span={2}>
                {selectedIncident.title}
              </Descriptions.Item>
              <Descriptions.Item label="Thiết bị" span={1}>
                {selectedIncident.equipmentId}
              </Descriptions.Item>
              <Descriptions.Item label="Tên thiết bị" span={1}>
                {selectedIncident.equipmentName}
              </Descriptions.Item>
              <Descriptions.Item label="Người báo cáo" span={1}>
                {selectedIncident.reportedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày báo cáo" span={1}>
                {dayjs(selectedIncident.reportedDate).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ưu tiên" span={1}>
                <Tag
                  color={
                    selectedIncident.priority === "High"
                      ? "error"
                      : selectedIncident.priority === "Medium"
                      ? "warning"
                      : "default"
                  }
                >
                  {selectedIncident.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Được giao cho" span={1}>
                {selectedIncident.assignedTo}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả sự cố" span={2}>
                {selectedIncident.description}
              </Descriptions.Item>
              <Descriptions.Item label="Nguyên nhân" span={2}>
                {selectedIncident.rootCause}
              </Descriptions.Item>
              <Descriptions.Item label="Giải pháp" span={2}>
                {selectedIncident.resolution}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian chết" span={1}>
                {selectedIncident.downtimeHours}h
              </Descriptions.Item>
              <Descriptions.Item label="Chi phí ước tính" span={1}>
                {selectedIncident.estimatedCost > 0
                  ? `${selectedIncident.estimatedCost.toLocaleString()} đ`
                  : "Chưa xác định"}
              </Descriptions.Item>
              {selectedIncident.resolvedDate && (
                <Descriptions.Item label="Ngày giải quyết" span={2}>
                  {dayjs(selectedIncident.resolvedDate).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Card title="Dòng thời gian xử lý" size="small">
              <Timeline
                items={selectedIncident.timeline.map((item) => ({
                  color:
                    item.status === "Hoàn thành"
                      ? "green"
                      : item.status === "Đang xử lý"
                      ? "blue"
                      : "gray",
                  children: (
                    <>
                      <p style={{ margin: 0, fontWeight: "bold" }}>
                        {item.status} -{" "}
                        {dayjs(item.time).format("DD/MM/YYYY HH:mm")}
                      </p>
                      <p style={{ margin: "4px 0", color: "#8c8c8c" }}>
                        {item.description}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "#bfbfbf",
                        }}
                      >
                        Bởi: {item.user}
                      </p>
                    </>
                  ),
                }))}
              />
            </Card>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ManagerIncidentList;
