import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Tag,
  DatePicker,
  Row,
  Col,
  Dropdown,
  Statistic,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/PurchaseRequestManagement.module.css";
import { purchaseRequestService } from "../../services/purchaseRequestService";
import { sparePartService } from "../../services/sparePartService";
import signalRService from "../../services/signalRService";

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

const PurchaseRequestManagement = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [requests, setRequests] = useState([]);

  const [availableParts, setAvailableParts] = useState([]);

  const stats = {
    total: requests.length,
    pending: requests.filter((req) => req.status === "Chờ duyệt").length,
    approved: requests.filter((req) => req.status === "Đã duyệt").length,
    rejected: requests.filter((req) => req.status === "Từ chối").length,
    received: requests.filter((req) => req.status === "Đã nhập").length,
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await purchaseRequestService.getMyRequests();
      // res may be array or ApiResponse wrapper handled in service
      setRequests(Array.isArray(res) ? res : []);
      // Also load spare parts for the select
      try {
        const parts = await sparePartService.getAll();
        console.log("Loaded spare parts:", parts);
        // Filter only active parts (IsActive = true)
        const activeParts = (Array.isArray(parts) ? parts : []).filter(
          (part) => part.isActive !== false
        );
        console.log("Filtered active parts:", activeParts);
        setAvailableParts(activeParts);
      } catch (e) {
        console.warn("Could not load spare parts for select", e);
        setAvailableParts([]);
      }
    } catch (err) {
      message.error("Không thể tải danh sách yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Thêm useEffect để lắng nghe cập nhật dữ liệu real-time
  useEffect(() => {
    const handleDataUpdate = (data) => {
      if (data.type === "purchaseRequest") {
        console.log("Purchase request data updated, reloading...");
        loadData(); // Tải lại dữ liệu khi có thay đổi
      }
    };

    signalRService.onDataUpdated(handleDataUpdate);

    return () => {
      signalRService.offDataUpdated();
    };
  }, []);

  const columns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "requestId",
      key: "requestId",
      width: 100,
      render: (id) => `REQ${String(id).padStart(3, "0")}`,
    },
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 120,
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
      width: 100,
    },
    {
      title: "Người yêu cầu",
      dataIndex: "requestedByName",
      key: "requestedByName",
      width: 150,
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let displayStatus = status;
        let color = "default";

        if (status === "Chờ duyệt") {
          displayStatus = "Chờ duyệt";
          color = "warning";
        } else if (status === "Đã duyệt") {
          displayStatus = "Đã duyệt";
          color = "success";
        } else if (status === "Từ chối") {
          displayStatus = "Từ chối";
          color = "error";
        } else if (status === "Đã nhập") {
          displayStatus = "Đã nhập";
          color = "processing";
        }

        return <Tag color={color}>{displayStatus}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => {
        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "Chi tiết",
            onClick: () => handleViewDetail(record),
          },
          {
            key: "edit",
            label: "Chỉnh sửa",
            disabled: record.status !== "Chờ duyệt",
            onClick: () => handleEditRequest(record),
          },
          {
            key: "received",
            label: "Đã nhập kho",
            disabled: record.status !== "Đã duyệt",
            onClick: () => handleMarkAsReceived(record),
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            destroyOnHidden={true}
          >
            <Button type="link" icon={<DownOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const handleCreateRequest = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleViewDetail = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  const handleEditRequest = (record) => {
    // Only allow editing if status is "Chờ duyệt" (Pending)
    if (record.status !== "Chờ duyệt") {
      message.warning("Chỉ có thể chỉnh sửa yêu cầu ở trạng thái 'Chờ duyệt'");
      return;
    }
    form.setFieldsValue({
      partNumber: record.partId,
      quantity: record.quantity,
      reason: record.reason,
    });
    setSelectedRequest(record);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log("Form values:", values);
      console.log("Available parts:", availableParts);

      // The Select now returns the partId as value
      const partId = values.partNumber;

      console.log("Extracted partId:", partId, typeof partId);
      console.log("Available parts sample:", availableParts.slice(0, 3).map(p => ({
        id: p.id,
        partId: p.partId,
        PartId: p.PartId,
        partNumber: p.partNumber,
        partName: p.partName
      })));

      if (!partId || partId === null || partId === undefined) {
        throw new Error("Phụ tùng không hợp lệ - partId is null/undefined");
      }

      // Validate that the partId exists in availableParts
      const selectedPart = availableParts.find(p => {
        const pId = p.partId || p.PartId || p.id;
        console.log(`Comparing partId ${partId} (${typeof partId}) with p.id ${pId} (${typeof pId})`);
        return pId == partId; // Use loose equality to handle type differences
      });
      if (!selectedPart) {
        console.log("Available parts IDs:", availableParts.map(p => p.partId || p.PartId || p.id));
        throw new Error("Phụ tùng không hợp lệ - không tìm thấy trong danh sách");
      }

      // Backend expects { partId, quantity, reason }
      const payload = {
        partId: partId,
        quantity: values.quantity,
        reason: values.reason,
      };

      console.log("Payload:", payload);

      // If editing an existing request (selectedRequest is set)
      if (selectedRequest) {
        // Update existing purchase request
        await purchaseRequestService.update(selectedRequest.requestId, payload);
        message.success("Cập nhật yêu cầu mua hàng thành công!");
      } else {
        // Check if there's already a pending request for this part (only for new requests)
        const pendingRequest = requests.find(
          (req) => req.partId === partId && req.status === "Chờ duyệt"
        );

        if (pendingRequest) {
          message.error(
            `Phụ tùng này đã có yêu cầu đang chờ duyệt (REQ${String(
              pendingRequest.requestId
            ).padStart(
              3,
              "0"
            )}). Vui lòng chờ hoàn thành yêu cầu này trước khi tạo yêu cầu mới!`
          );
          setLoading(false);
          return;
        }

        // Create new purchase request
        await purchaseRequestService.create(payload);
        message.success("Tạo yêu cầu mua hàng thành công!");
      }

      // refresh list
      const res = await purchaseRequestService.getMyRequests();
      setRequests(Array.isArray(res) ? res : []);
      setIsModalVisible(false);
      form.resetFields();
      setSelectedRequest(null);
    } catch (error) {
      console.error("Create purchase request error:", error);
      // Try to get message from backend response first, then from error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi tạo yêu cầu!";

      if (errorMessage.includes("403")) {
        message.error(
          "Bạn không có quyền để tạo yêu cầu. Tài khoản cần có vai trò 'Quản lý kỹ thuật' hoặc hãy đăng nhập lại."
        );
      } else {
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (record) => {
    Modal.confirm({
      title: `Xác nhận duyệt yêu cầu REQ${String(record.requestId).padStart(
        3,
        "0"
      )}`,
      content: "Bạn có chắc muốn duyệt yêu cầu này?",
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          await purchaseRequestService.approve(record.requestId);
          message.success("Duyệt yêu cầu thành công");
          const res = await purchaseRequestService.getMyRequests();
          setRequests(Array.isArray(res) ? res : []);
        } catch (err) {
          console.error("Approve error", err);
          message.error(err?.message || "Không thể duyệt yêu cầu");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleReject = async (record) => {
    let reason = "";
    Modal.confirm({
      title: `Xác nhận từ chối yêu cầu REQ${String(record.requestId).padStart(
        3,
        "0"
      )}`,
      content: (
        <div>
          <p>
            Bạn có chắc muốn từ chối yêu cầu này? Có thể nhập lý do (tùy chọn):
          </p>
          <Input
            placeholder="Lý do từ chối"
            onChange={(e) => (reason = e.target.value)}
          />
        </div>
      ),
      okText: "Từ chối",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          await purchaseRequestService.reject(record.requestId, {
            reason: reason || undefined,
          });
          message.success("Từ chối yêu cầu thành công");
          const res = await purchaseRequestService.getMyRequests();
          setRequests(Array.isArray(res) ? res : []);
        } catch (err) {
          console.error("Reject error", err);
          message.error(err?.message || "Không thể từ chối yêu cầu");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleMarkAsReceived = async (record) => {
    Modal.confirm({
      title: "Xác nhận đã nhập kho",
      content: `Bạn có chắc chắn đã nhập phụ tùng "${record.partName}" vào kho? Số lượng tồn kho sẽ tự động được cập nhật.`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          await purchaseRequestService.markAsReceived(record.requestId);
          message.success(
            "Đã đánh dấu nhập kho thành công! Số lượng tồn kho đã được cập nhật."
          );
          // Wait a bit for backend to complete, then refresh
          await new Promise((resolve) => setTimeout(resolve, 300));
          await loadData();
        } catch (error) {
          console.error("Mark as received error:", error);
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Có lỗi xảy ra khi đánh dấu đã nhập kho!";
          message.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const filteredRequests = requests.filter((req) => {
    const matchSearch =
      req.partNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      req.partName.toLowerCase().includes(searchText.toLowerCase()) ||
      req.requestedByName.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = filterStatus === "all" || req.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const CreateRequestForm = (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      scrollToFirstError
    >
      <Form.Item
        name="partNumber"
        label={
          <span style={{ fontWeight: "600", fontSize: "14px" }}>
            Mã phụ tùng
          </span>
        }
        rules={[{ required: true, message: "Vui lòng chọn phụ tùng" }]}
      >
        <Select
          placeholder="Chọn phụ tùng"
          showSearch
          optionFilterProp="children"
          onChange={(value, option) => {
            form.setFieldsValue({ partName: option?.children });
          }}
          filterOption={(input, option) =>
            (option.children || "")
              .toLowerCase()
              .indexOf(input.toLowerCase()) >= 0
          }
          size="large"
        >
          {(availableParts || []).map((p) => (
            <Option key={p.partId || p.PartId} value={p.partId || p.PartId}>
              {`${p.partNumber || p.PartNumber} - ${p.partName || p.PartName}`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="partName" hidden>
        <Input />
      </Form.Item>

      <Form.Item
        name="quantity"
        label={
          <span style={{ fontWeight: "600", fontSize: "14px" }}>
            Số lượng
          </span>
        }
        rules={[
          { required: true, message: "Vui lòng nhập số lượng" },
          { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
        ]}
      >
        <InputNumber min={1} style={{ width: "100%" }} size="large" />
      </Form.Item>

      <Form.Item
        name="reason"
        label={
          <span style={{ fontWeight: "600", fontSize: "14px" }}>
            Lý do yêu cầu
          </span>
        }
        rules={[]}
      >
        <TextArea
          rows={3}
          placeholder="Mô tả lý do cần mua phụ tùng... (tùy chọn)"
          size="large"
        />
      </Form.Item>
    </Form>
  );

  const RequestListTable = (
    <Card
      title="Danh sách yêu cầu"
      className={styles.tableCard}
      style={{ borderRadius: "8px", border: "1px solid #e8e8e8", margin: "20px 0px" }}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateRequest}
          style={{
            backgroundColor: "#283652",
            borderColor: "#283652",
            borderRadius: "6px",
            fontWeight: "500",
          }}
        >
          Tạo yêu cầu mới
        </Button>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={10}>
            <Search
              placeholder="Tìm theo mã, tên phụ tùng hoặc tên người yêu cầu"
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
              <Option value="Đã nhập">Đã nhập kho</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="requestId"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} yêu cầu`,
          }}
          style={{ borderRadius: "6px" }}
        />
      </Space>
    </Card>
  );

  return (
    <div className={styles.container}>
      {/* Statistics */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statsCard} style={{ borderRadius: "8px", border: "1px solid #e8e8e8" }}>
            <Statistic
              title={<span style={{ color: "#283652", fontWeight: "600" }}>Tổng yêu cầu</span>}
              value={stats.total}
              prefix={<InboxOutlined style={{ color: "#283652" }} />}
              valueStyle={{
                color: "#283652",
                fontSize: "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statsCard} style={{ borderRadius: "8px", border: "1px solid #ffe58f" }}>
            <Statistic
              title={<span style={{ color: "#faad14", fontWeight: "600" }}>Chờ duyệt</span>}
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
              valueStyle={{
                color: "#faad14",
                fontSize: "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statsCard} style={{ borderRadius: "8px", border: "1px solid #b7eb8f" }}>
            <Statistic
              title={<span style={{ color: "#52c41a", fontWeight: "600" }}>Đã duyệt</span>}
              value={stats.approved}
              prefix={<CheckOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{
                color: "#52c41a",
                fontSize: "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statsCard} style={{ borderRadius: "8px", border: "1px solid #ffccc7" }}>
            <Statistic
              title={<span style={{ color: "#ff4d4f", fontWeight: "600" }}>Từ chối</span>}
              value={stats.rejected}
              prefix={<CloseOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{
                color: "#ff4d4f",
                fontSize: "28px",
                fontWeight: "600",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content - Only Request List */}
      {RequestListTable}

      {/* Create/Edit Request Modal */}
      <Modal
        title={
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#283652" }}>
            {selectedRequest
              ? `Chỉnh sửa yêu cầu REQ${String(
                selectedRequest.requestId
              ).padStart(3, "0")}`
              : "Tạo yêu cầu mua hàng mới"}
          </div>
        }
        open={isModalVisible}
        onOk={() => form.submit()}  // ✅ Gọi form.submit()
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedRequest(null);
        }}
        width={700}
        centered
        okText={selectedRequest ? "Cập nhật" : "Tạo yêu cầu"}
        cancelText="Hủy"
        okButtonProps={{
          style: {
            backgroundColor: "#283652",
            borderColor: "#283652",
            height: "40px",
            fontSize: "16px",
            fontWeight: "500",
            minWidth: "120px",
          },
          htmlType: "submit",  // ✅ Thêm dòng này
          loading: loading,
        }}
        cancelButtonProps={{
          style: {
            height: "40px",
            fontSize: "16px",
            minWidth: "120px",
          },
        }}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "24px",
        }}
      >
        {CreateRequestForm}
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#283652",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "18px"
            }}>
              <InboxOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "16px" }}>
                Chi tiết yêu cầu
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: "normal",
                }}
              >
                REQ{String(selectedRequest?.requestId).padStart(3, "0")} • {selectedRequest?.partName}
              </div>
            </div>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1200}
        centered
        footer={[
          selectedRequest?.status === "Chờ duyệt" && (
            <Button
              key="edit"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                setDetailModalVisible(false);
                handleEditRequest(selectedRequest);
              }}
              style={{
                backgroundColor: "#283652",
                borderColor: "#283652",
                height: "40px",
                fontSize: "16px",
                minWidth: "120px",
              }}
            >
              Chỉnh sửa
            </Button>
          ),
          <Button
            key="close"
            onClick={() => setDetailModalVisible(false)}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
        ]}
      >
        {selectedRequest && (
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <Descriptions
              column={2}
              bordered
              labelStyle={{
                fontWeight: "bold",
                fontSize: "14px",
                backgroundColor: "#fafafa",
                borderRight: "1px solid #d9d9d9",
                padding: "12px 16px",
                minWidth: "160px",
              }}
            >
              <Descriptions.Item label="Mã yêu cầu">
                REQ{String(selectedRequest.requestId).padStart(3, "0")}
              </Descriptions.Item>
              <Descriptions.Item label="Mã phụ tùng">
                {selectedRequest.partNumber}
              </Descriptions.Item>

              <Descriptions.Item label="Tên phụ tùng">
                {selectedRequest.partName}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng">
                {selectedRequest.quantity}
              </Descriptions.Item>

              <Descriptions.Item label="Người yêu cầu">
                {selectedRequest.requestedByName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày yêu cầu">
                {dayjs(selectedRequest.requestDate).format("DD/MM/YYYY")}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={
                    selectedRequest.status === "Chờ duyệt"
                      ? "warning"
                      : selectedRequest.status === "Đã duyệt"
                        ? "success"
                        : selectedRequest.status === "Đã nhập"
                          ? "processing"
                          : "error"
                  }
                >
                  {selectedRequest.status}
                </Tag>
              </Descriptions.Item>

              {selectedRequest.approvedBy && (
                <>
                  <Descriptions.Item label="Người duyệt">
                    {selectedRequest.approvedByName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày duyệt">
                    {dayjs(selectedRequest.approvedDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                </>
              )}

              {selectedRequest.rejectedBy && (
                <>
                  <Descriptions.Item label="Người từ chối">
                    {selectedRequest.rejectedByName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày từ chối">
                    {dayjs(selectedRequest.rejectedDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                </>
              )}

              <Descriptions.Item label="Lý do yêu cầu" span={2}>
                <div style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  {selectedRequest.reason || "Không có lý do"}
                </div>
              </Descriptions.Item>

              {selectedRequest.notes && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  <div style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                    {selectedRequest.notes}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseRequestManagement;
