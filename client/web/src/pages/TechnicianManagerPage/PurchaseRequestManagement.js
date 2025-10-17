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
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/PurchaseRequestManagement.module.css";
import { purchaseRequestService } from "../../services/purchaseRequestService";
import { sparePartService } from "../../services/sparePartService";

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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await purchaseRequestService.getMyRequests();
        if (!mounted) return;
        // res may be array or ApiResponse wrapper handled in service
        setRequests(Array.isArray(res) ? res : []);
        // Also load spare parts for the select
        try {
          const parts = await sparePartService.getAll();
          // Filter only active parts (IsActive = true)
          const activeParts = (Array.isArray(parts) ? parts : []).filter(
            (part) => part.isActive !== false
          );
          setAvailableParts(activeParts);
        } catch (e) {
          console.warn("Could not load spare parts for select", e);
        }
      } catch (err) {
        message.error("Không thể tải danh sách yêu cầu. Vui lòng thử lại.");
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
        let displayStatus;
        let color = "warning";
        if (status === "Đã duyệt") {
          displayStatus = "Đã duyệt";
          color = "success";
        } else if (status === "Từ chối") {
          displayStatus = "Từ chối";
          color = "error";
        } else {
          displayStatus = "Chờ duyệt";
          color = "warning";
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

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // The Select now returns the partId as value
      const partId = values.partNumber || values.partId || null;

      if (!partId) {
        throw new Error("Phụ tùng không hợp lệ");
      }

      // Check if there's already a pending request for this part
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

      // Backend expects { partId, quantity, reason }
      const payload = {
        partId: partId,
        quantity: values.quantity,
        reason: values.reason,
      };

      await purchaseRequestService.create(payload);
      message.success("Tạo yêu cầu mua hàng thành công!");
      // refresh list
      const res = await purchaseRequestService.getMyRequests();
      setRequests(Array.isArray(res) ? res : []);
      setIsModalVisible(false);
      form.resetFields();
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

  const filteredRequests = requests.filter((req) => {
    const matchSearch =
      req.partNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      req.partName.toLowerCase().includes(searchText.toLowerCase()) ||
      req.requestedByName.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = filterStatus === "all" || req.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const CreateRequestForm = (
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
            form.setFieldsValue({ partName: option?.children });
          }}
          filterOption={(input, option) =>
            (option.children || "")
              .toLowerCase()
              .indexOf(input.toLowerCase()) >= 0
          }
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
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button
            onClick={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
          >
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Tạo yêu cầu
          </Button>
        </Space>
      </Form.Item>
    </Form>
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
              placeholder="Tìm theo mã, tên phụ tùng hoặc tên người yêu cầu"
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

  return (
    <div className={styles.container}>
      {/* Main Content - Only Request List */}
      {RequestListTable}

      {/* Create Request Modal */}
      <Modal
        title="Tạo yêu cầu mua hàng mới"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {CreateRequestForm}
      </Modal>

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
                  <span>{selectedRequest.requestedByName}</span>
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
                      <span>{selectedRequest.approvedByName}</span>
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
                      <span>{selectedRequest.rejectedByName}</span>
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
