import React, { useEffect, useState } from "react";
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
  Dropdown,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/PurchaseApproval.module.css";
import { replacementHistoryService } from "../../services/replacementHistoryService";

const { TextArea } = Input;

const ReplacementApproval = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await replacementHistoryService.getByStatus("Pending");
      const items = Array.isArray(res) ? res : res?.data || [];
      // normalize fields
      const mapped = items.map((it) => ({
        replacementId: it.replacementID || it.replacementId,
        equipmentId: it.equipmentId || it.equipmentID || it.EquipmentID,
        equipmentCode: it.equipmentCode || it.EquipmentCode || it.equipmentCode,
        equipmentName: it.equipmentName || it.EquipmentName || it.equipmentName,
        partId: it.partId || it.partID || it.PartID,
        partNumber: it.partNumber || it.PartNumber || it.partNumber,
        partName: it.partName || it.PartName || it.partName,
        quantity: it.quantity || it.Quantity || 0,
        replacedDate: it.replacedDate || it.ReplacedDate,
        replacedBy:
          it.replacedBy ||
          it.ReplacedBy ||
          it.replacedByUserName ||
          it.ReplacedByUserName,
        status: it.status || it.Status || "",
        remarks: it.remarks || it.Remarks || "",
      }));
      setRequests(mapped);
    } catch (err) {
      console.error("Failed to load replacement requests", err);
      message.error("Không thể tải danh sách yêu cầu thay thế.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

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
      // Build update payload - include required fields where possible
      const payload = {
        partId: selectedRequest.partId || 0,
        equipmentId: selectedRequest.equipmentId || null,
        quantity: selectedRequest.quantity || 0,
        replacedDate: selectedRequest.replacedDate || new Date().toISOString(),
        replacedBy: selectedRequest.replacedBy || "",
        status: "Approved",
        remarks: values.notes || selectedRequest.remarks || "",
      };
      await replacementHistoryService.update(
        selectedRequest.replacementId,
        payload
      );
      message.success("Đã duyệt yêu cầu thay thế");
      setApproveModalVisible(false);
      await loadRequests();
    } catch (err) {
      console.error(err);
      message.error("Duyệt thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (values) => {
    setLoading(true);
    try {
      const payload = {
        partId: selectedRequest.partId || 0,
        equipmentId: selectedRequest.equipmentId || null,
        quantity: selectedRequest.quantity || 0,
        replacedDate: selectedRequest.replacedDate || new Date().toISOString(),
        replacedBy: selectedRequest.replacedBy || "",
        status: "Rejected",
        remarks: values.reason || selectedRequest.remarks || "",
      };
      await replacementHistoryService.update(
        selectedRequest.replacementId,
        payload
      );
      message.success("Đã từ chối yêu cầu thay thế");
      setRejectModalVisible(false);
      await loadRequests();
    } catch (err) {
      console.error(err);
      message.error("Từ chối thất bại");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã YC",
      dataIndex: "replacementId",
      key: "replacementId",
      width: 100,
      render: (id) => `R${String(id).padStart(4, "0")}`,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentCode",
      key: "equipment",
      width: 160,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 200,
    },
    { title: "Mã PT", dataIndex: "partNumber", key: "partNumber", width: 120 },
    { title: "Tên PT", dataIndex: "partName", key: "partName", width: 200 },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      align: "center",
    },
    {
      title: "Ngày báo",
      dataIndex: "replacedDate",
      key: "replacedDate",
      width: 180,
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : ""),
    },
    {
      title: "Người yêu cầu",
      dataIndex: "replacedBy",
      key: "replacedBy",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s) => (
        <Tag
          color={
            s === "Approved" ? "green" : s === "Pending" ? "orange" : "red"
          }
        >
          {s}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      fixed: "right",
      render: (_, record) => {
        if (record.status !== "Pending") {
          return (
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          );
        }

        const items = [
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
            menu={{ items }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button size="small" icon={<DownOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <Card title="Duyệt yêu cầu thay thế linh kiện" bordered={false}>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey={(r) => r.replacementId}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết yêu cầu ${
          selectedRequest
            ? `R${String(selectedRequest.replacementId).padStart(4, "0")}`
            : ""
        }`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedRequest && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã yêu cầu">
              R{String(selectedRequest.replacementId).padStart(4, "0")}
            </Descriptions.Item>
            <Descriptions.Item label="Thiết bị">
              {selectedRequest.equipmentCode} - {selectedRequest.equipmentName}
            </Descriptions.Item>
            <Descriptions.Item label="Phụ tùng">
              {selectedRequest.partNumber} - {selectedRequest.partName}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">
              {selectedRequest.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Người báo">
              {selectedRequest.replacedBy}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày báo">
              {dayjs(selectedRequest.replacedDate).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {selectedRequest.remarks || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  selectedRequest.status === "Pending"
                    ? "orange"
                    : selectedRequest.status === "Approved"
                    ? "green"
                    : "red"
                }
              >
                {selectedRequest.status}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title="Duyệt yêu cầu thay thế"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleApprove}>
          <Form.Item name="notes" label="Ghi chú (tùy chọn)">
            <TextArea rows={3} placeholder="Ghi chú khi duyệt (tùy chọn)" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setApproveModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Xác nhận duyệt
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu thay thế"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleReject}>
          <Form.Item name="reason" label="Lý do từ chối">
            <TextArea rows={3} placeholder="Lý do từ chối (tùy chọn)" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setRejectModalVisible(false)}>Hủy</Button>
              <Button type="primary" danger htmlType="submit">
                Xác nhận từ chối
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReplacementApproval;
