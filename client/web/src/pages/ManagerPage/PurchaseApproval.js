import React, { useState, useEffect } from "react";
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
  Dropdown,
  Statistic,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  DownOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/PurchaseApproval.module.css";
import { purchaseRequestService } from "../../services/purchaseRequestService";
import signalRService from "../../services/signalRService";

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

  const [requests, setRequests] = useState([]);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "Chờ duyệt").length,
    approved: requests.filter((r) => r.status === "Đã duyệt").length,
    rejected: requests.filter((r) => r.status === "Từ chối").length,
  };

  // load requests from backend
  // centralized loader so all refreshes behave the same
  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await purchaseRequestService.getAll();
      const items = (Array.isArray(res) ? res : []).map((it) => ({
        ...it,
        status:
          it.status === "Pending"
            ? "Chờ duyệt"
            : it.status === "Approved"
            ? "Đã duyệt"
            : it.status === "Rejected"
            ? "Từ chối"
            : it.status || "",
        requestedBy: it.requestedByName || it.requestedBy || "",
        totalAmount: it.totalAmount || 0,
      }));

      // apply client-side filter if needed
      if (filterStatus && filterStatus !== "all") {
        setRequests(items.filter((r) => r.status === filterStatus));
      } else {
        setRequests(items);
      }
    } catch (err) {
      console.error("Could not load purchase requests", err);
      message.error("Không thể tải danh sách yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    // wrap loadRequests to respect mounted flag for safety
    const run = async () => {
      if (!mounted) return;
      await loadRequests();
    };
    run();
    return () => {
      mounted = false;
    };
  }, [filterStatus]);

  // Thêm useEffect để lắng nghe cập nhật dữ liệu real-time
  useEffect(() => {
    const handleDataUpdate = (data) => {
      if (data.type === "purchaseRequest") {
        console.log("Purchase request data updated, reloading...");
        loadRequests(); // Tải lại dữ liệu khi có thay đổi
      }
    };

    signalRService.onDataUpdated(handleDataUpdate);

    return () => {
      signalRService.offDataUpdated();
    };
  }, [filterStatus]);

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
      title: "Người yêu cầu",
      dataIndex: "requestedBy",
      key: "requestedBy",
      width: 150,
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
      width: 120,
      render: (_, record) => {
        // Only show actions if status is "Chờ duyệt"
        if (record.status !== "Chờ duyệt") {
          return (
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              title="Xem chi tiết"
            />
          );
        }

        const menuItems = [
          {
            key: "view",
            label: "Xem chi tiết",
            icon: <EyeOutlined />,
            onClick: () => handleViewDetail(record),
          },
          {
            key: "approve",
            label: "Duyệt",
            icon: <CheckCircleOutlined />,
            onClick: () => handleApproveClick(record),
          },
          {
            key: "reject",
            label: "Từ chối",
            icon: <CloseCircleOutlined />,
            onClick: () => handleRejectClick(record),
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button type="link" size="small" icon={<DownOutlined />} />
          </Dropdown>
        );
      },
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
      await purchaseRequestService.approve(selectedRequest.requestId);
      message.success("Đã duyệt yêu cầu mua hàng!");
      setApproveModalVisible(false);
      // refresh list consistently
      await loadRequests();
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (values) => {
    setLoading(true);
    try {
      await purchaseRequestService.reject(selectedRequest.requestId, {
        reason: values.reason,
      });
      message.success("Đã từ chối yêu cầu mua hàng!");
      setRejectModalVisible(false);
      await loadRequests();
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
      {/* Statistics */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statsCard}>
            <Statistic
              title="Tổng yêu cầu"
              value={stats.total}
              prefix={<InboxOutlined />}
              valueStyle={{
                color: "#283652",
                fontSize: "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statsCard}>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{
                color: "#faad14",
                fontSize: "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statsCard}>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<CheckOutlined />}
              valueStyle={{
                color: "#52c41a",
                fontSize: "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statsCard}>
            <Statistic
              title="Từ chối"
              value={stats.rejected}
              prefix={<CloseOutlined />}
              valueStyle={{
                color: "#ff4d4f",
                fontSize: "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Danh sách yêu cầu mua hàng" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={10}>
              <Search
                placeholder="Tìm theo mã, tên phụ tùng hoặc người yêu cầu"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ borderRadius: "6px" }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                style={{ width: "100%", borderRadius: "6px" }}
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
            style={{ borderRadius: "6px" }}
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
                  style={{
                    backgroundColor: "#283652",
                    borderColor: "#283652",
                  }}
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
        width={650}
        style={{ top: 20 }}
        bodyStyle={{ padding: 12 }}
      >
        {selectedRequest && (
          <Descriptions
            bordered={false}
            size="small"
            column={1}
            layout="horizontal"
            labelStyle={{ fontWeight: 600, width: 140, fontSize: "15px" }}
            contentStyle={{ fontSize: "15px" }}
          >
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
            <Descriptions.Item label="Người yêu cầu" span={1}>
              {selectedRequest.requestedBy}
            </Descriptions.Item>
            <Descriptions.Item label="Lý do yêu cầu" span={1}>
              {selectedRequest.reason || "-"}
            </Descriptions.Item>
            {selectedRequest.approvedBy && (
              <>
                <Descriptions.Item label="Người duyệt" span={1}>
                  {selectedRequest.approvedByName || selectedRequest.approvedBy}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày duyệt" span={1}>
                  {dayjs(selectedRequest.approvedAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              </>
            )}
            {selectedRequest.rejectedBy && (
              <>
                <Descriptions.Item label="Người từ chối" span={1}>
                  {selectedRequest.rejectedByName || selectedRequest.rejectedBy}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày từ chối" span={1}>
                  {dayjs(selectedRequest.rejectedAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              </>
            )}
            {selectedRequest.approvalNotes && (
              <Descriptions.Item label="Ghi chú" span={1}>
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
        style={{ top: 20 }}
        bodyStyle={{ padding: 12 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleApprove}
          labelCol={{ style: { fontSize: "15px", fontWeight: 600 } }}
        >
          <Form.Item
            name="notes"
            label="Ghi chú (tùy chọn)"
            style={{ marginBottom: 16 }}
          >
            <TextArea
              rows={3}
              placeholder="Nhập ghi chú về quyết định duyệt..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setApproveModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  backgroundColor: "#283652",
                  borderColor: "#283652",
                }}
              >
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
        style={{ top: 20 }}
        bodyStyle={{ padding: 12 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleReject}
          labelCol={{ style: { fontSize: "15px", fontWeight: 600 } }}
        >
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[]}
            style={{ marginBottom: 16 }}
          >
            <TextArea
              rows={3}
              placeholder="Nhập lý do từ chối yêu cầu mua hàng... (tùy chọn)"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setRejectModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                danger
                htmlType="submit"
                loading={loading}
              >
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
