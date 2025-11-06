import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  InputNumber,
  message,
  Descriptions,
  Alert,
  Tooltip,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import replacementHistoryService from "../../services/replacementHistoryService";
import { sparePartService } from "../../services/sparePartService";

const SparePartsRequestApproval = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const data = await replacementHistoryService.getByStatus(
        "Đang chờ duyệt"
      );
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      message.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const showDetailModal = (record) => {
    setSelectedRequest(record);
    setIsDetailModalVisible(true);
  };

  const showApprovalModal = (record) => {
    setSelectedRequest(record);
    form.setFieldsValue({
      quantityApproved: record.quantityRequested,
    });
    setIsApprovalModalVisible(true);
  };

  const handleApprove = async (values) => {
    try {
      await replacementHistoryService.update(selectedRequest.historyId, {
        ...selectedRequest,
        quantityUsed: values.quantityApproved,
        status: "Đã duyệt",
        approvedAt: new Date().toISOString(),
      });

      message.success("Duyệt yêu cầu thành công");
      setIsApprovalModalVisible(false);
      form.resetFields();
      fetchPendingRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      message.error("Không thể duyệt yêu cầu");
    }
  };

  const handleReject = async (record) => {
    Modal.confirm({
      title: "Xác nhận từ chối",
      content: "Bạn có chắc chắn muốn từ chối yêu cầu này?",
      okText: "Từ chối",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await replacementHistoryService.update(record.historyId, {
            ...record,
            status: "Từ chối",
            rejectedAt: new Date().toISOString(),
          });

          message.success("Đã từ chối yêu cầu");
          fetchPendingRequests();
        } catch (error) {
          console.error("Error rejecting request:", error);
          message.error("Không thể từ chối yêu cầu");
        }
      },
    });
  };

  const checkStockAvailability = (record) => {
    // This would check against actual inventory
    // For now, returning a simple check
    return record.quantityRequested <= 100; // Placeholder logic
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "historyId",
      key: "historyId",
      width: 100,
      fixed: "left",
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
      title: "Số lượng yêu cầu",
      dataIndex: "quantityRequested",
      key: "quantityRequested",
      width: 130,
      render: (qty) => <strong>{qty} cái</strong>,
    },
    {
      title: "Người yêu cầu",
      dataIndex: "requestedByName",
      key: "requestedByName",
      width: 150,
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestedAt",
      key: "requestedAt",
      width: 150,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Tình trạng tồn kho",
      key: "stockStatus",
      width: 130,
      render: (_, record) => {
        const available = checkStockAvailability(record);
        return (
          <Tag color={available ? "green" : "red"}>
            {available ? "Đủ hàng" : "Không đủ"}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showDetailModal(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Duyệt">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => showApprovalModal(record)}
              size="small"
            >
              Duyệt
            </Button>
          </Tooltip>
          <Tooltip title="Từ chối">
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleReject(record)}
              size="small"
            >
              Từ chối
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Duyệt yêu cầu phụ tùng"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchPendingRequests}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        <Alert
          message="Lưu ý"
          description="Kiểm tra tồn kho trước khi duyệt yêu cầu. Nếu không đủ hàng, từ chối yêu cầu và thông báo cho người yêu cầu."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Table
          dataSource={requests}
          columns={columns}
          rowKey="historyId"
          loading={loading}
          pagination={{
            total: requests.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} yêu cầu`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu phụ tùng"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedRequest && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã phiếu" span={2}>
              {selectedRequest.historyId}
            </Descriptions.Item>
            <Descriptions.Item label="Mã phụ tùng">
              {selectedRequest.partNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Tên phụ tùng">
              {selectedRequest.partName}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng yêu cầu">
              <strong>{selectedRequest.quantityRequested} cái</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Mã phiếu bảo trì">
              {selectedRequest.workOrderId || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Người yêu cầu">
              {selectedRequest.requestedByName}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày yêu cầu">
              {selectedRequest.requestedAt
                ? dayjs(selectedRequest.requestedAt).format("DD/MM/YYYY HH:mm")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Lý do thay thế" span={2}>
              {selectedRequest.reason || "Không có thông tin"}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              {selectedRequest.notes || "Không có ghi chú"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        title="Duyệt yêu cầu phụ tùng"
        open={isApprovalModalVisible}
        onCancel={() => {
          setIsApprovalModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedRequest && (
          <>
            <Alert
              message={`Yêu cầu: ${selectedRequest.partName}`}
              description={`Số lượng yêu cầu: ${selectedRequest.quantityRequested} cái`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form form={form} layout="vertical" onFinish={handleApprove}>
              <Form.Item
                label="Số lượng duyệt"
                name="quantityApproved"
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng duyệt" },
                  {
                    type: "number",
                    min: 1,
                    message: "Số lượng phải lớn hơn 0",
                  },
                  {
                    type: "number",
                    max: selectedRequest.quantityRequested,
                    message: `Số lượng không được vượt quá ${selectedRequest.quantityRequested}`,
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={selectedRequest.quantityRequested}
                  style={{ width: "100%" }}
                  placeholder="Nhập số lượng phụ tùng duyệt"
                />
              </Form.Item>

              <Alert
                message="Lưu ý"
                description="Sau khi duyệt, phụ tùng sẽ được xuất khỏi kho và ghi nhận vào lịch sử thay thế."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                <Space>
                  <Button
                    onClick={() => {
                      setIsApprovalModalVisible(false);
                      form.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Xác nhận duyệt
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default SparePartsRequestApproval;
