import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Row,
  Col,
  Descriptions,
  Select,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/PurchaseApproval.module.css";

const { TextArea } = Input;
const { Option } = Select;
const { Search } = Input;

const PurchaseApproval = () => {
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("Chờ duyệt");

  // Mock data
  const [requests, setRequests] = useState([
    {
      requestId: 1,
      partNumber: "PT001",
      partName: "Motor điện 5HP",
      quantity: 2,
      unitPrice: 5000000,
      totalAmount: 10000000,
      reason: "Thay thế motor hỏng tại máy dập 01",
      requestedBy: "Nguyễn Văn A",
      requestedByRole: "Quản lý kỹ thuật",
      requestDate: "2025-01-10",
      status: "Chờ duyệt",
      priority: "High",
      approvedBy: null,
      approvedDate: null,
      rejectedBy: null,
      rejectedDate: null,
      approvalNotes: null,
    },
    {
      requestId: 2,
      partNumber: "PT002",
      partName: "Băng tải 10m",
      quantity: 1,
      unitPrice: 8000000,
      totalAmount: 8000000,
      reason: "Bổ sung băng tải cho dây chuyền mới",
      requestedBy: "Trần Thị B",
      requestedByRole: "Quản lý kỹ thuật",
      requestDate: "2025-01-09",
      status: "Chờ duyệt",
      priority: "Medium",
      approvedBy: null,
      approvedDate: null,
      rejectedBy: null,
      rejectedDate: null,
      approvalNotes: null,
    },
    {
      requestId: 3,
      partNumber: "PT003",
      partName: "Ổ bi SKF 6205",
      quantity: 10,
      unitPrice: 150000,
      totalAmount: 1500000,
      reason: "Tồn kho thấp, cần bổ sung",
      requestedBy: "Phạm Văn C",
      requestedByRole: "Quản lý kỹ thuật",
      requestDate: "2025-01-08",
      status: "Đã duyệt",
      priority: "Low",
      approvedBy: "Quản lý",
      approvedDate: "2025-01-09",
      rejectedBy: null,
      rejectedDate: null,
      approvalNotes: "Đã xác nhận nhu cầu, tiến hành mua",
    },
  ]);

  const columns = [
    {
      title: "Mã YC",
      dataIndex: "requestId",
      key: "requestId",
      width: 80,
      render: (id) => `REQ${String(id).padStart(3, "0")}`,
    },
    {
      title: "Mã PT",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 100,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: 200,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 130,
      render: (amount) => `${amount.toLocaleString()} đ`,
    },
    {
      title: "Người yêu cầu",
      dataIndex: "requestedBy",
      key: "requestedBy",
      width: 150,
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
      title: "Ngày YC",
      dataIndex: "requestDate",
      key: "requestDate",
      width: 110,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "warning";
        if (status === "Đã duyệt") color = "success";
        if (status === "Từ chối") color = "error";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
          {record.status === "Chờ duyệt" && (
            <>
              <Button
                type="link"
                style={{ color: "#52c41a" }}
                icon={<CheckCircleOutlined />}
                onClick={() => handleApproveClick(record)}
              >
                Duyệt
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleRejectClick(record)}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  const handleApproveClick = (record) => {
    setSelectedRequest(record);
    form.resetFields();
    setApproveModalVisible(true);
  };

  const handleRejectClick = (record) => {
    setSelectedRequest(record);
    form.resetFields();
    setRejectModalVisible(true);
  };

  const handleApprove = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRequests(
        requests.map((req) =>
          req.requestId === selectedRequest.requestId
            ? {
                ...req,
                status: "Đã duyệt",
                approvedBy: "Quản lý",
                approvedDate: dayjs().format("YYYY-MM-DD"),
                approvalNotes: values.notes,
              }
            : req
        )
      );

      message.success("Đã duyệt yêu cầu mua hàng!");
      setApproveModalVisible(false);
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRequests(
        requests.map((req) =>
          req.requestId === selectedRequest.requestId
            ? {
                ...req,
                status: "Từ chối",
                rejectedBy: "Quản lý",
                rejectedDate: dayjs().format("YYYY-MM-DD"),
                approvalNotes: values.reason,
              }
            : req
        )
      );

      message.success("Đã từ chối yêu cầu mua hàng!");
      setRejectModalVisible(false);
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchSearch =
      req.partNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      req.partName.toLowerCase().includes(searchText.toLowerCase()) ||
      req.requestedBy.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = filterStatus === "all" || req.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className={styles.container}>
      <Card title="Danh sách yêu cầu mua hàng" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={10}>
              <Search
                placeholder="Tìm theo mã, tên phụ tùng hoặc người yêu cầu"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                style={{ width: "100%" }}
                placeholder="Lọc theo trạng thái"
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="Chờ duyệt">Chờ duyệt</Option>
                <Option value="Đã duyệt">Đã duyệt</Option>
                <Option value="Từ chối">Từ chối</Option>
              </Select>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={filteredRequests}
            rowKey="requestId"
            loading={loading}
            scroll={{ x: 1400 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} yêu cầu`,
            }}
          />
        </Space>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết yêu cầu REQ${String(
          selectedRequest?.requestId
        ).padStart(3, "0")}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setDetailModalVisible(false)}>Đóng</Button>
            {selectedRequest?.status === "Chờ duyệt" && (
              <>
                <Button
                  danger
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleRejectClick(selectedRequest);
                  }}
                >
                  Từ chối
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleApproveClick(selectedRequest);
                  }}
                >
                  Duyệt
                </Button>
              </>
            )}
          </Space>
        }
        width={800}
      >
        {selectedRequest && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã yêu cầu" span={1}>
              REQ{String(selectedRequest.requestId).padStart(3, "0")}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag
                color={
                  selectedRequest.status === "Chờ duyệt"
                    ? "warning"
                    : selectedRequest.status === "Đã duyệt"
                    ? "success"
                    : "error"
                }
              >
                {selectedRequest.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mã phụ tùng" span={1}>
              {selectedRequest.partNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Tên phụ tùng" span={1}>
              {selectedRequest.partName}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng" span={1}>
              {selectedRequest.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Đơn giá" span={1}>
              {selectedRequest.unitPrice.toLocaleString()} đ
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền" span={2}>
              <strong style={{ color: "#1890ff", fontSize: "16px" }}>
                {selectedRequest.totalAmount.toLocaleString()} đ
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Ưu tiên" span={1}>
              <Tag
                color={
                  selectedRequest.priority === "High"
                    ? "error"
                    : selectedRequest.priority === "Medium"
                    ? "warning"
                    : "default"
                }
              >
                {selectedRequest.priority}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Người yêu cầu" span={1}>
              {selectedRequest.requestedBy} ({selectedRequest.requestedByRole})
            </Descriptions.Item>
            <Descriptions.Item label="Ngày yêu cầu" span={2}>
              {dayjs(selectedRequest.requestDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Lý do yêu cầu" span={2}>
              {selectedRequest.reason}
            </Descriptions.Item>
            {selectedRequest.approvedBy && (
              <>
                <Descriptions.Item label="Người duyệt" span={1}>
                  {selectedRequest.approvedBy}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày duyệt" span={1}>
                  {dayjs(selectedRequest.approvedDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
              </>
            )}
            {selectedRequest.rejectedBy && (
              <>
                <Descriptions.Item label="Người từ chối" span={1}>
                  {selectedRequest.rejectedBy}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày từ chối" span={1}>
                  {dayjs(selectedRequest.rejectedDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
              </>
            )}
            {selectedRequest.approvalNotes && (
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedRequest.approvalNotes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title="Duyệt yêu cầu mua hàng"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleApprove}>
          <Form.Item name="notes" label="Ghi chú (tùy chọn)">
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú về quyết định duyệt..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setApproveModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Xác nhận duyệt
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu mua hàng"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleReject}>
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập lý do từ chối yêu cầu mua hàng..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setRejectModalVisible(false)}>Hủy</Button>
              <Button type="primary" danger htmlType="submit" loading={loading}>
                Xác nhận từ chối
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseApproval;
