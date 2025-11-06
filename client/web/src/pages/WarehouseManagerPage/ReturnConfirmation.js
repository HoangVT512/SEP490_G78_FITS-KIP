import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Descriptions,
  message,
  Alert,
  Tooltip,
} from "antd";
import {
  CheckCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import replacementHistoryService from "../../services/replacementHistoryService";
import { useAuth } from "../../contexts/AuthContext";

const ReturnConfirmation = () => {
  const [loading, setLoading] = useState(false);
  const [pendingReturns, setPendingReturns] = useState([]);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPendingReturns();
  }, []);

  const fetchPendingReturns = async () => {
    setLoading(true);
    try {
      const data = await replacementHistoryService.getByStatus("Đã thay thế");
      setPendingReturns(data || []);
    } catch (error) {
      console.error("Error fetching pending returns:", error);
      message.error("Không thể tải danh sách phụ tùng chờ xác nhận");
    } finally {
      setLoading(false);
    }
  };

  const showDetailModal = (record) => {
    setSelectedReturn(record);
    setIsDetailModalVisible(true);
  };

  const handleConfirmReturn = async (record) => {
    Modal.confirm({
      title: "Xác nhận trả lại phụ tùng",
      content: (
        <div>
          <p>
            <strong>Phụ tùng:</strong> {record.partName}
          </p>
          <p>
            <strong>Số lượng xuất:</strong> {record.quantityUsed} cái
          </p>
          <p>
            <strong>Số lượng thực tế sử dụng:</strong>{" "}
            {record.actualQuantityUsed || 0} cái
          </p>
          <p>
            <strong>Số lượng trả lại:</strong>{" "}
            {(record.quantityUsed || 0) - (record.actualQuantityUsed || 0)} cái
          </p>
          <Alert
            message="Xác nhận trả lại sẽ cập nhật tồn kho và đánh dấu giao dịch hoàn thành"
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      ),
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await replacementHistoryService.confirmReturn(record.historyId, {
            returnConfirmedBy: user?.fullName || "Warehouse Manager",
          });

          message.success("Xác nhận trả lại thành công");
          fetchPendingReturns();
        } catch (error) {
          console.error("Error confirming return:", error);
          message.error("Không thể xác nhận trả lại");
        }
      },
    });
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
      title: "SL xuất",
      dataIndex: "quantityUsed",
      key: "quantityUsed",
      width: 80,
      render: (qty) => <strong>{qty || 0}</strong>,
    },
    {
      title: "SL thực tế sử dụng",
      dataIndex: "actualQuantityUsed",
      key: "actualQuantityUsed",
      width: 150,
      render: (qty) => <strong>{qty || 0}</strong>,
    },
    {
      title: "SL trả lại",
      key: "returnQuantity",
      width: 100,
      render: (_, record) => {
        const returnQty =
          (record.quantityUsed || 0) - (record.actualQuantityUsed || 0);
        return (
          <Tag color={returnQty > 0 ? "blue" : "default"}>{returnQty} cái</Tag>
        );
      },
    },
    {
      title: "Người thay thế",
      dataIndex: "replacedByName",
      key: "replacedByName",
      width: 150,
    },
    {
      title: "Ngày thay thế",
      dataIndex: "replacementDate",
      key: "replacementDate",
      width: 150,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"),
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
          <Tooltip title="Xác nhận trả lại">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleConfirmReturn(record)}
              size="small"
            >
              Xác nhận
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Xác nhận trả lại phụ tùng"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchPendingReturns}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        <Alert
          message="Lưu ý"
          description="Xác nhận trả lại phụ tùng sau khi kỹ thuật viên hoàn thành công việc và trả lại phụ tùng không sử dụng. Số lượng trả lại sẽ được cập nhật vào tồn kho."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Table
          dataSource={pendingReturns}
          columns={columns}
          rowKey="historyId"
          loading={loading}
          pagination={{
            total: pendingReturns.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phụ tùng chờ xác nhận`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết trả lại phụ tùng"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="confirm"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              setIsDetailModalVisible(false);
              handleConfirmReturn(selectedReturn);
            }}
          >
            Xác nhận trả lại
          </Button>,
        ]}
        width={700}
      >
        {selectedReturn && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã phiếu" span={2}>
                {selectedReturn.historyId}
              </Descriptions.Item>
              <Descriptions.Item label="Mã phụ tùng">
                {selectedReturn.partNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Tên phụ tùng">
                {selectedReturn.partName}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng xuất kho">
                <strong>{selectedReturn.quantityUsed || 0} cái</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng thực tế sử dụng">
                <strong>{selectedReturn.actualQuantityUsed || 0} cái</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng trả lại" span={2}>
                <Tag color="blue" style={{ fontSize: "16px" }}>
                  {(selectedReturn.quantityUsed || 0) -
                    (selectedReturn.actualQuantityUsed || 0)}{" "}
                  cái
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người thay thế">
                {selectedReturn.replacedByName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày thay thế">
                {selectedReturn.replacementDate
                  ? dayjs(selectedReturn.replacementDate).format(
                      "DD/MM/YYYY HH:mm"
                    )
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Mã phiếu bảo trì" span={2}>
                {selectedReturn.workOrderId || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedReturn.notes || "Không có ghi chú"}
              </Descriptions.Item>
            </Descriptions>

            <Alert
              message="Thông tin"
              description={`Sau khi xác nhận, ${
                (selectedReturn.quantityUsed || 0) -
                (selectedReturn.actualQuantityUsed || 0)
              } cái ${
                selectedReturn.partName
              } sẽ được nhập lại vào kho và trạng thái giao dịch sẽ được đánh dấu hoàn thành.`}
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default ReturnConfirmation;
