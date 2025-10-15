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
  Tabs,
  DatePicker,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/PurchaseRequestManagement.module.css";
import { purchaseRequestService } from "../../services/purchaseRequestService";

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

const PurchaseRequestManagement = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [requests, setRequests] = useState([]);

  // Minimal mapping from partNumber to PartId expected by backend
  const partNumberToId = {
    PT001: 1,
    PT002: 2,
    PT003: 3,
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await purchaseRequestService.getMyRequests();
        if (!mounted) return;
        // res may be array or ApiResponse wrapper handled in service
        setRequests(Array.isArray(res) ? res : []);
      } catch (err) {
        messageApi.error("Không thể tải danh sách yêu cầu. Vui lòng thử lại.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
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
      dataIndex: "requestedBy",
      key: "requestedBy",
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

  const handleCreateRequest = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleViewDetail = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Backend expects { partId, quantity, reason }
      const payload = {
        partId: partNumberToId[values.partNumber] || null,
        quantity: values.quantity,
        reason: values.reason,
      };
      if (!payload.partId) {
        throw new Error("Phụ tùng không hợp lệ");
      }

      await purchaseRequestService.create(payload);
      messageApi.success("Tạo yêu cầu mua hàng thành công!");
      // refresh list
      const res = await purchaseRequestService.getMyRequests();
      setRequests(Array.isArray(res) ? res : []);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Create purchase request error:", error);
      if (error && error.message && error.message.includes("403")) {
        messageApi.error(
          "Bạn không có quyền để tạo yêu cầu. Tài khoản cần có vai trò 'Quản lý kỹ thuật' hoặc hãy đăng nhập lại."
        );
      } else {
        messageApi.error(error?.message || "Có lỗi xảy ra khi tạo yêu cầu!");
      }
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

  const CreateRequestForm = (
    <Card title="Tạo yêu cầu mua hàng mới" variant="outlined">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="partNumber"
          label="Mã phụ tùng"
          rules={[{ required: true, message: "Vui lòng chọn phụ tùng" }]}
        >
          <Select
            placeholder="Chọn phụ tùng"
            showSearch
            optionFilterProp="children"
            onChange={(value, option) => {
              form.setFieldsValue({ partName: option.children });
            }}
          >
            <Option value="PT001">PT001 - Motor điện 5HP</Option>
            <Option value="PT002">PT002 - Băng tải 10m</Option>
            <Option value="PT003">PT003 - Ổ bi SKF 6205</Option>
          </Select>
        </Form.Item>

        <Form.Item name="partName" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Số lượng"
          rules={[
            { required: true, message: "Vui lòng nhập số lượng" },
            { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
          ]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Lý do yêu cầu"
          rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
        >
          <TextArea rows={4} placeholder="Mô tả lý do cần mua phụ tùng..." />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Tạo yêu cầu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const RequestListTable = (
    <Card
      title="Danh sách yêu cầu"
      variant="outlined"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateRequest}
        >
          Tạo yêu cầu mới
        </Button>
      }
    >
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
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} yêu cầu`,
          }}
        />
      </Space>
    </Card>
  );

  const items = [
    {
      key: "create",
      label: "Tạo yêu cầu",
      children: CreateRequestForm,
    },
    {
      key: "list",
      label: "Danh sách yêu cầu",
      children: RequestListTable,
    },
  ];

  return (
    <div className={styles.container}>
      {messageContextHolder}
      <Tabs items={items} defaultActiveKey="list" />

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết yêu cầu REQ${String(
          selectedRequest?.requestId
        ).padStart(3, "0")}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedRequest && (
          <div className={styles.detailContent}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <strong>Mã phụ tùng:</strong>
                  <span>{selectedRequest.partNumber}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <strong>Tên phụ tùng:</strong>
                  <span>{selectedRequest.partName}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <strong>Số lượng:</strong>
                  <span>{selectedRequest.quantity}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <strong>Trạng thái:</strong>
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
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <strong>Người yêu cầu:</strong>
                  <span>{selectedRequest.requestedBy}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <strong>Ngày yêu cầu:</strong>
                  <span>
                    {dayjs(selectedRequest.requestDate).format("DD/MM/YYYY")}
                  </span>
                </div>
              </Col>
              {selectedRequest.approvedBy && (
                <>
                  <Col span={12}>
                    <div className={styles.detailItem}>
                      <strong>Người duyệt:</strong>
                      <span>{selectedRequest.approvedBy}</span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.detailItem}>
                      <strong>Ngày duyệt:</strong>
                      <span>
                        {dayjs(selectedRequest.approvedDate).format(
                          "DD/MM/YYYY"
                        )}
                      </span>
                    </div>
                  </Col>
                </>
              )}
              {selectedRequest.rejectedBy && (
                <>
                  <Col span={12}>
                    <div className={styles.detailItem}>
                      <strong>Người từ chối:</strong>
                      <span>{selectedRequest.rejectedBy}</span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.detailItem}>
                      <strong>Ngày từ chối:</strong>
                      <span>
                        {dayjs(selectedRequest.rejectedDate).format(
                          "DD/MM/YYYY"
                        )}
                      </span>
                    </div>
                  </Col>
                </>
              )}
              <Col span={24}>
                <div className={styles.detailItem}>
                  <strong>Lý do yêu cầu:</strong>
                  <p>{selectedRequest.reason}</p>
                </div>
              </Col>
              {selectedRequest.notes && (
                <Col span={24}>
                  <div className={styles.detailItem}>
                    <strong>Ghi chú:</strong>
                    <p>{selectedRequest.notes}</p>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseRequestManagement;
