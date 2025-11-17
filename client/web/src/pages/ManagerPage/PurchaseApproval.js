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
  ReloadOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/PurchaseApproval.module.css";
import { purchaseRequestService } from "../../services/purchaseRequestService";
import { sparePartService } from "../../services/sparePartService";
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
  const [selectedPartDetails, setSelectedPartDetails] = useState(null);
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
        return <Tag color={color} className={styles.statusTag}>{status}</Tag>;
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

  const handleViewDetail = async (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);

    // Load spare part details to show inventory status
    if (record.partId) {
      try {
        const partDetails = await sparePartService.getById(record.partId);
        setSelectedPartDetails(partDetails);
      } catch (error) {
        console.error("Error loading spare part details:", error);
        setSelectedPartDetails(null);
      }
    }
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
      <Row gutter={[24, 24]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className={styles.statsCard}
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #f0f0f0"
            }}
          >
            <Statistic
              title={<span style={{ color: "#666", fontSize: "14px", fontWeight: "500" }}>Tổng yêu cầu</span>}
              value={stats.total}
              prefix={<InboxOutlined style={{ color: "#283652", fontSize: "20px" }} />}
              valueStyle={{
                color: "#283652",
                fontSize: "32px",
                fontWeight: "700",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className={styles.statsCard}
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #fff7e6"
            }}
          >
            <Statistic
              title={<span style={{ color: "#666", fontSize: "14px", fontWeight: "500" }}>Chờ duyệt</span>}
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: "#faad14", fontSize: "20px" }} />}
              valueStyle={{
                color: "#faad14",
                fontSize: "32px",
                fontWeight: "700",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className={styles.statsCard}
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #f6ffed"
            }}
          >
            <Statistic
              title={<span style={{ color: "#666", fontSize: "14px", fontWeight: "500" }}>Đã duyệt</span>}
              value={stats.approved}
              prefix={<CheckOutlined style={{ color: "#52c41a", fontSize: "20px" }} />}
              valueStyle={{
                color: "#52c41a",
                fontSize: "32px",
                fontWeight: "700",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className={styles.statsCard}
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #fff1f0"
            }}
          >
            <Statistic
              title={<span style={{ color: "#666", fontSize: "14px", fontWeight: "500" }}>Từ chối</span>}
              value={stats.rejected}
              prefix={<CloseOutlined style={{ color: "#ff4d4f", fontSize: "20px" }} />}
              valueStyle={{
                color: "#ff4d4f",
                fontSize: "32px",
                fontWeight: "700",
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div style={{ fontSize: "20px", fontWeight: "600", color: "#283652" }}>
            Danh sách yêu cầu mua hàng
          </div>
        }
        bordered={false}
        style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
        className={styles.mainCard}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Row gutter={16} justify="space-between" align="middle" className={styles.filterSection}>
            <Col xs={24} lg={16} xl={14}>
              <Space size="large" wrap>
                <Search
                  placeholder="Tìm theo mã, tên phụ tùng..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                />
                <Select
                  style={{
                    width: "160px",
                    borderRadius: "8px",
                    height: "40px",
                    maxWidth: "100%"
                  }}
                  placeholder="Lọc theo trạng thái"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  size="large"
                >
                  <Option value="all">Tất cả trạng thái</Option>
                  <Option value="Chờ duyệt">Chờ duyệt</Option>
                  <Option value="Đã duyệt">Đã duyệt</Option>
                  <Option value="Từ chối">Từ chối</Option>
                </Select>
              </Space>
            </Col>
            <Col xs={24} lg={8} xl={6} style={{ textAlign: "right" }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadRequests}
                loading={loading}
                style={{
                  height: "40px",
                  fontSize: "16px",
                  minWidth: "120px",
                  borderRadius: "8px"
                }}
                //className={styles.refreshButton}
              >
                Làm mới
              </Button>
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
              className: styles.pagination
            }}
            style={{ borderRadius: "8px" }}
            className={styles.dataTable}
          />
        </Space>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#283652" }}>
            Chi tiết yêu cầu mua hàng
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedPartDetails(null);
        }}
        footer={
          <Space>
            <Button
              onClick={() => {
                setDetailModalVisible(false);
                setSelectedPartDetails(null);
              }}
              style={{
                height: "40px",
                fontSize: "16px",
                minWidth: "120px",
              }}
              className={styles.cancelButton}
            >
              Đóng
            </Button>
            {selectedRequest?.status === "Chờ duyệt" && (
              <>
                <Button
                  danger
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleRejectClick(selectedRequest);
                  }}
                  style={{
                    height: "40px",
                    fontSize: "16px",
                    minWidth: "120px",
                  }}
                  className={styles.cancelButton}
                >
                  Từ chối
                </Button>
                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#283652",
                    borderColor: "#283652",
                    height: "40px",
                    fontSize: "16px",
                    minWidth: "120px",
                  }}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleApproveClick(selectedRequest);
                  }}
                  className={styles.submitButton}
                >
                  Duyệt
                </Button>
              </>
            )}
          </Space>
        }
        width={900}
        centered
        style={{ top: 20 }}
        bodyStyle={{ padding: "24px" }}
        className={styles.detailModal}
      >
        {selectedRequest && (
          <div>
            {/* Request Summary */}
            <Card
              size="small"
              style={{
                marginBottom: "24px",
                borderRadius: "8px",
                background: "#fafafa"
              }}
              className={styles.infoCard}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>Mã yêu cầu</div>
                    <div style={{ fontSize: "18px", fontWeight: "600", color: "#283652" }}>
                      REQ{String(selectedRequest.requestId).padStart(3, "0")}
                    </div>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>Trạng thái</div>
                    <Tag
                      color={
                        selectedRequest.status === "Chờ duyệt"
                          ? "warning"
                          : selectedRequest.status === "Đã duyệt"
                            ? "success"
                            : "error"
                      }
                      style={{ fontSize: "14px", padding: "4px 12px" }}
                      className={styles.statusTag}
                    >
                      {selectedRequest.status}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>Người yêu cầu</div>
                    <div style={{ fontSize: "16px", fontWeight: "500" }}>
                      {selectedRequest.requestedBy}
                    </div>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>Ngày yêu cầu</div>
                    <div style={{ fontSize: "16px", fontWeight: "500" }}>
                      {dayjs(selectedRequest.createdAt || selectedRequest.requestDate).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            <Descriptions
              bordered={false}
              size="small"
              column={2}
              layout="horizontal"
              labelStyle={{
                fontWeight: 600,
                width: 140,
                fontSize: "14px",
                color: "#666",
                padding: "12px 16px"
              }}
              contentStyle={{
                fontSize: "14px",
                padding: "12px 16px",
                background: "#fafafa",
                borderRadius: "4px",
                margin: "4px"
              }}
              className={styles.descriptionItem}
            >
              <Descriptions.Item label="Mã phụ tùng" span={1}>
                <span style={{ fontSize: "16px", fontWeight: "600", color: "#283652" }}>
                  {selectedRequest.partNumber}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Tên phụ tùng" span={1}>
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  {selectedRequest.partName}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng yêu cầu" span={1}>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#1890ff" }}>
                  {selectedRequest.quantity}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Lý do yêu cầu" span={1}>
                {selectedRequest.reason || <span style={{ color: "#999", fontStyle: "italic" }}>Không có lý do</span>}
              </Descriptions.Item>

              {selectedPartDetails && (
                <>
                  <Descriptions.Item label="Tồn kho hiện tại" span={1}>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color:
                          selectedPartDetails.quantity === 0
                            ? "#ff4d4f"
                            : selectedPartDetails.quantity <
                              selectedPartDetails.minQuantity
                              ? "#faad14"
                              : "#52c41a",
                      }}
                    >
                      {selectedPartDetails.quantity} {selectedPartDetails.unit || "cái"}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái kho" span={1}>
                    <Tag
                      color={
                        selectedPartDetails.quantity === 0
                          ? "error"
                          : selectedPartDetails.quantity <
                            selectedPartDetails.minQuantity
                            ? "warning"
                            : "success"
                      }
                      style={{ fontSize: "14px" }}
                    >
                      {selectedPartDetails.quantity === 0
                        ? "Hết hàng"
                        : selectedPartDetails.quantity <
                          selectedPartDetails.minQuantity
                          ? "Sắp hết"
                          : "Còn hàng"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mức tối thiểu" span={1}>
                    {selectedPartDetails.minQuantity || 0} {selectedPartDetails.unit || "cái"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Đơn vị tính" span={1}>
                    {selectedPartDetails.unit || "cái"}
                  </Descriptions.Item>
                </>
              )}

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

              {(selectedRequest.approvalNotes || selectedRequest.rejectionReason) && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedRequest.approvalNotes || selectedRequest.rejectionReason}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title={
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#283652" }}>
            Duyệt yêu cầu mua hàng
          </div>
        }
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        footer={null}
        width={800}
        centered
        style={{ top: 20 }}
        bodyStyle={{ padding: "24px" }}
        className={styles.approveModal}
      >
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "8px" }}>
            Thông tin yêu cầu:
          </div>
          <div style={{ background: "#f5f5f5", padding: "16px", borderRadius: "8px" }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Mã yêu cầu:</strong> REQ{String(selectedRequest?.requestId).padStart(3, "0")}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Phụ tùng:</strong> {selectedRequest?.partName}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Số lượng:</strong> {selectedRequest?.quantity}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Người yêu cầu:</strong> {selectedRequest?.requestedBy}
                </div>
              </Col>
            </Row>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleApprove}
          labelCol={{ style: { fontSize: "15px", fontWeight: 600 } }}
          className={styles.formItem}
        >
          <Form.Item
            name="notes"
            label="Ghi chú (tùy chọn)"
            style={{ marginBottom: 16 }}
          >
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú về quyết định duyệt..."
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => setApproveModalVisible(false)}
                style={{
                  height: "40px",
                  fontSize: "16px",
                  minWidth: "120px",
                }}
                className={styles.cancelButton}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  backgroundColor: "#283652",
                  borderColor: "#283652",
                  height: "40px",
                  fontSize: "16px",
                  minWidth: "140px",
                }}
                className={styles.submitButton}
              >
                Xác nhận duyệt
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#283652" }}>
            Từ chối yêu cầu mua hàng
          </div>
        }
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
        width={800}
        centered
        style={{ top: 20 }}
        bodyStyle={{ padding: "24px" }}
        className={styles.rejectModal}
      >
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "8px" }}>
            Thông tin yêu cầu:
          </div>
          <div style={{ background: "#fff2f0", padding: "16px", borderRadius: "8px", border: "1px solid #ffccc7" }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Mã yêu cầu:</strong> REQ{String(selectedRequest?.requestId).padStart(3, "0")}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Phụ tùng:</strong> {selectedRequest?.partName}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Số lượng:</strong> {selectedRequest?.quantity}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Người yêu cầu:</strong> {selectedRequest?.requestedBy}
                </div>
              </Col>
            </Row>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleReject}
          labelCol={{ style: { fontSize: "15px", fontWeight: 600 } }}
          className={styles.formItem}
        >
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[]}
            style={{ marginBottom: 16 }}
          >
            <TextArea
              rows={4}
              placeholder="Nhập lý do từ chối yêu cầu mua hàng..."
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => setRejectModalVisible(false)}
                style={{
                  height: "40px",
                  fontSize: "16px",
                  minWidth: "120px",
                }}
                className={styles.cancelButton}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                danger
                htmlType="submit"
                loading={loading}
                style={{
                  height: "40px",
                  fontSize: "16px",
                  minWidth: "140px",
                }}
                className={styles.submitButton}
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
