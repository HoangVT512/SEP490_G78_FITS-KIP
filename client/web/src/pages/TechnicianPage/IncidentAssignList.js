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
  Timeline,
  message,
  Badge,
  Tooltip,
  Divider,
} from "antd";
import {
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import styles from "../../styles/pages/IncidentAssignList.module.css";

const { TextArea } = Input;
const { Option } = Select;

const IncidentAssignList = () => {
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();

  // Mock data - sẽ thay bằng API call sau
  useEffect(() => {
    fetchIncidents();
  }, [filterStatus]);

  const fetchIncidents = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockData = [
        {
          key: 1,
          incidentId: 1,
          incidentCode: "INC-001",
          equipmentId: 1,
          equipmentCode: "EQ-001",
          equipmentName: "Máy CNC 01",
          issue: "Lỗi động cơ không hoạt động",
          reason: "Động cơ bị quá nhiệt",
          solution: null,
          priority: "Cao",
          status: "Đang xử lý",
          startTime: "2025-10-13 08:30:00",
          endTime: null,
          assignedDate: "2025-10-13 08:30:00",
          dueDate: "2025-10-13 18:00:00",
          reportedBy: "Nguyễn Văn A",
          lineName: "Dây chuyền 1",
          stageName: "Giai đoạn gia công",
        },
        {
          key: 2,
          incidentId: 2,
          incidentCode: "INC-002",
          equipmentId: 15,
          equipmentCode: "EQ-015",
          equipmentName: "Robot hàn 03",
          issue: "Lỗi cảm biến vị trí",
          reason: "Cảm biến bị lệch vị trí",
          solution: null,
          priority: "Trung bình",
          status: "Chưa xử lý",
          startTime: "2025-10-13 09:00:00",
          endTime: null,
          assignedDate: "2025-10-13 09:00:00",
          dueDate: "2025-10-14 12:00:00",
          reportedBy: "Trần Thị B",
          lineName: "Dây chuyền 2",
          stageName: "Giai đoạn lắp ráp",
        },
        {
          key: 3,
          incidentId: 3,
          incidentCode: "INC-003",
          equipmentId: 25,
          equipmentCode: "EQ-025",
          equipmentName: "Băng chuyền 05",
          issue: "Tiếng kêu bất thường",
          reason: "Thiếu dầu bôi trơn",
          solution: null,
          priority: "Thấp",
          status: "Chưa xử lý",
          startTime: "2025-10-13 10:15:00",
          endTime: null,
          assignedDate: "2025-10-13 10:15:00",
          dueDate: "2025-10-15 17:00:00",
          reportedBy: "Lê Văn C",
          lineName: "Dây chuyền 3",
          stageName: "Giai đoạn vận chuyển",
        },
        {
          key: 4,
          incidentId: 4,
          incidentCode: "INC-004",
          equipmentId: 8,
          equipmentCode: "EQ-008",
          equipmentName: "Máy phay CNC 02",
          issue: "Dao cắt bị gãy",
          reason: "Dao cắt đã hết tuổi thọ",
          solution: "Đã thay thế dao cắt mới",
          priority: "Cao",
          status: "Hoàn thành",
          startTime: "2025-10-12 14:00:00",
          endTime: "2025-10-12 16:30:00",
          assignedDate: "2025-10-12 14:00:00",
          dueDate: "2025-10-12 18:00:00",
          reportedBy: "Phạm Văn D",
          lineName: "Dây chuyền 1",
          stageName: "Giai đoạn gia công",
        },
      ];

      if (filterStatus !== "all") {
        setIncidents(mockData.filter((item) => item.status === filterStatus));
      } else {
        setIncidents(mockData);
      }

      setLoading(false);
    }, 500);
  };

  const columns = [
    {
      title: "Mã sự cố",
      dataIndex: "incidentCode",
      key: "incidentCode",
      width: 100,
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
      key: "location",
      width: 150,
      render: (record) => (
        <div>
          <div style={{ fontSize: "12px" }}>{record.lineName}</div>
          <div style={{ fontSize: "11px", color: "#888" }}>
            {record.stageName}
          </div>
        </div>
      ),
    },
    {
      title: "Vấn đề",
      dataIndex: "issue",
      key: "issue",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority) => {
        let color = "default";
        if (priority === "Cao") color = "red";
        else if (priority === "Trung bình") color = "orange";
        else if (priority === "Thấp") color = "green";
        return (
          <Tag color={color} style={{ fontWeight: 500 }}>
            {priority}
          </Tag>
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
        if (status === "Đang xử lý") {
          color = "processing";
          icon = <ClockCircleOutlined />;
        } else if (status === "Chưa xử lý") {
          color = "warning";
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
      title: "Ngày giao",
      dataIndex: "assignedDate",
      key: "assignedDate",
      width: 150,
      render: (text) => <div style={{ fontSize: "12px" }}>{text}</div>,
    },
    {
      title: "Hạn xử lý",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 150,
      render: (text, record) => {
        const isOverdue =
          new Date(text) < new Date() && record.status !== "Hoàn thành";
        return (
          <div
            style={{
              fontSize: "12px",
              color: isOverdue ? "#ff4d4f" : "inherit",
              fontWeight: isOverdue ? 500 : "normal",
            }}
          >
            {text}
            {isOverdue && <Badge status="error" style={{ marginLeft: 8 }} />}
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {record.status !== "Hoàn thành" && (
            <Button
              type="link"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleUpdateIncident(record)}
            >
              Cập nhật
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetail = (incident) => {
    setSelectedIncident(incident);
    setDetailModalVisible(true);
  };

  const handleUpdateIncident = (incident) => {
    setSelectedIncident(incident);
    form.setFieldsValue({
      status: incident.status,
      solution: incident.solution,
      endTime: incident.endTime,
    });
    setUpdateModalVisible(true);
  };

  const handleUpdateSubmit = async (values) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Cập nhật sự cố thành công!");
      setUpdateModalVisible(false);
      form.resetFields();
      fetchIncidents();
    } catch (error) {
      message.error("Cập nhật sự cố thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      "Chưa xử lý": {
        count: incidents.filter((i) => i.status === "Chưa xử lý").length,
        color: "orange",
      },
      "Đang xử lý": {
        count: incidents.filter((i) => i.status === "Đang xử lý").length,
        color: "blue",
      },
      "Hoàn thành": {
        count: incidents.filter((i) => i.status === "Hoàn thành").length,
        color: "green",
      },
    };
    return badges[status] || { count: 0, color: "default" };
  };

  return (
    <div className={styles.incidentList}>
      <Card
        title={
          <Space>
            <WarningOutlined />
            <span>Danh sách sự cố được giao</span>
          </Space>
        }
        extra={
          <Space>
            <Button type="primary" onClick={fetchIncidents} loading={loading}>
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
              Tất cả ({incidents.length})
            </Button>
            <Badge count={getStatusBadge("Chưa xử lý").count} color="orange">
              <Button
                type={filterStatus === "Chưa xử lý" ? "primary" : "default"}
                onClick={() => setFilterStatus("Chưa xử lý")}
              >
                Chưa xử lý
              </Button>
            </Badge>
            <Badge count={getStatusBadge("Đang xử lý").count} color="blue">
              <Button
                type={filterStatus === "Đang xử lý" ? "primary" : "default"}
                onClick={() => setFilterStatus("Đang xử lý")}
              >
                Đang xử lý
              </Button>
            </Badge>
            <Badge count={getStatusBadge("Hoàn thành").count} color="green">
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
          dataSource={incidents}
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} sự cố`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Chi tiết sự cố</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedIncident?.status !== "Hoàn thành" && (
            <Button
              key="update"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setDetailModalVisible(false);
                handleUpdateIncident(selectedIncident);
              }}
            >
              Cập nhật
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedIncident && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã sự cố" span={1}>
                <strong>{selectedIncident.incidentCode}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag
                  color={
                    selectedIncident.status === "Hoàn thành"
                      ? "success"
                      : selectedIncident.status === "Đang xử lý"
                      ? "processing"
                      : "warning"
                  }
                >
                  {selectedIncident.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thiết bị" span={2}>
                <strong>{selectedIncident.equipmentCode}</strong> -{" "}
                {selectedIncident.equipmentName}
              </Descriptions.Item>
              <Descriptions.Item label="Vị trí" span={2}>
                {selectedIncident.lineName} / {selectedIncident.stageName}
              </Descriptions.Item>
              <Descriptions.Item label="Vấn đề" span={2}>
                {selectedIncident.issue}
              </Descriptions.Item>
              <Descriptions.Item label="Nguyên nhân" span={2}>
                {selectedIncident.reason || "Chưa xác định"}
              </Descriptions.Item>
              <Descriptions.Item label="Giải pháp" span={2}>
                {selectedIncident.solution || "Chưa có giải pháp"}
              </Descriptions.Item>
              <Descriptions.Item label="Ưu tiên" span={1}>
                <Tag
                  color={
                    selectedIncident.priority === "Cao"
                      ? "red"
                      : selectedIncident.priority === "Trung bình"
                      ? "orange"
                      : "green"
                  }
                >
                  {selectedIncident.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người báo cáo" span={1}>
                {selectedIncident.reportedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian bắt đầu" span={1}>
                {selectedIncident.startTime}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian kết thúc" span={1}>
                {selectedIncident.endTime || "Chưa hoàn thành"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày giao" span={1}>
                {selectedIncident.assignedDate}
              </Descriptions.Item>
              <Descriptions.Item label="Hạn xử lý" span={1}>
                {selectedIncident.dueDate}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Update Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>Cập nhật sự cố</span>
          </Space>
        }
        open={updateModalVisible}
        onCancel={() => {
          setUpdateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateSubmit}>
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="Chưa xử lý">Chưa xử lý</Option>
              <Option value="Đang xử lý">Đang xử lý</Option>
              <Option value="Hoàn thành">Hoàn thành</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Giải pháp" name="solution">
            <TextArea rows={4} placeholder="Mô tả giải pháp đã thực hiện..." />
          </Form.Item>

          <Form.Item label="Ghi chú thêm" name="notes">
            <TextArea rows={3} placeholder="Ghi chú thêm (nếu có)..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setUpdateModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IncidentAssignList;
