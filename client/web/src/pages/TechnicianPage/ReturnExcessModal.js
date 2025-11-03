import React from "react";
import { Modal, Button, Result, Space, Statistic, Row, Col, Table, Tag } from "antd";
import { WarningOutlined } from "@ant-design/icons";

const ReturnExcessModal = ({
  visible,
  excessData = [],
  onConfirm,
  onCancel,
  loading,
}) => {
  // Support both old format (single item) and new format (multiple items)
  const isMultiple = Array.isArray(excessData) && excessData.length > 1;
  const totalExcess = Array.isArray(excessData)
    ? excessData.reduce((sum, item) => sum + (item.excessQuantity || item.quantityToReturn || 0), 0)
    : (excessData?.excessQuantity || excessData?.quantityToReturn || 0);

  const columns = [
    {
      title: "Phụ tùng",
      dataIndex: "partName",
      key: "partName",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "SL thừa",
      dataIndex: "excessQuantity",
      key: "excessQuantity",
      align: "center",
      render: (qty) => <Tag color="orange">{qty || 0}</Tag>,
    },
    {
      title: "SL sử dụng",
      dataIndex: "actualUsed",
      key: "actualUsed",
      align: "center",
      render: (qty) => <Tag color="green">{qty || 0}</Tag>,
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <WarningOutlined style={{ color: "#faad14", fontSize: "20px" }} />
          Cần trả lại linh kiện thừa
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={isMultiple ? 700 : 500}
      centered
    >
      <Result
        status="warning"
        title="Bạn có linh kiện thừa cần trả lại"
        subTitle={
          isMultiple
            ? `Hệ thống đã ghi nhận bạn sẽ trả lại tổng cộng ${totalExcess} linh kiện từ ${excessData.length} loại phụ tùng khác nhau`
            : `Hệ thống đã ghi nhận bạn sẽ trả lại ${totalExcess} chiếc ${excessData?.partName || 'linh kiện'}`
        }
        style={{ marginBottom: "24px" }}
      />

      {isMultiple && (
        <div style={{ marginBottom: "24px" }}>
          <Table
            columns={columns}
            dataSource={excessData}
            rowKey={(record, index) => record.replacementId || index}
            pagination={false}
            size="small"
            bordered
          />
        </div>
      )}

      <div
        style={{
          padding: "16px",
          backgroundColor: "#fff7e6",
          border: "1px solid #ffc069",
          borderRadius: "4px",
          marginBottom: "24px",
        }}
      >
        <Row gutter={16}>
          <Col span={isMultiple ? 8 : 12}>
            <Statistic
              title="Tổng SL thừa"
              value={totalExcess}
              suffix="chiếc"
              valueStyle={{ color: "#faad14" }}
            />
          </Col>
          {isMultiple && (
            <Col span={8}>
              <Statistic
                title="Số loại phụ tùng"
                value={excessData.length}
                suffix="loại"
                valueStyle={{ color: "#faad14" }}
              />
            </Col>
          )}
          <Col span={isMultiple ? 8 : 12}>
            <Statistic
              title="Trạng thái"
              value="Chờ trả lại"
              valueStyle={{ color: "#faad14" }}
            />
          </Col>
        </Row>
      </div>

      <div
        style={{
          padding: "16px",
          backgroundColor: "#f6f8fb",
          border: "1px solid #d9d9d9",
          borderRadius: "4px",
          marginBottom: "24px",
        }}
      >
        <p style={{ marginBottom: "8px", fontWeight: 600 }}>
          📍 Hướng dẫn trả lại:
        </p>
        <ol style={{ marginBottom: 0, paddingLeft: "20px" }}>
          <li>Hãy đến kho để trả {totalExcess} chiếc linh kiện ngay</li>
          <li>Giao cho nhân viên kho để xác nhận nhận hàng</li>
          <li>Hệ thống sẽ tự động cập nhật trạng thái sau khi xác nhận</li>
        </ol>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <p style={{ color: "#666", fontSize: "12px" }}>
          💡 Ghi chú: Bạn không cần chờ duyệt từ QLKT. Hãy trực tiếp đến kho trả
          hàng. Trạng thái sẽ chuyển sang "Đã trả" sau khi QLKT hoặc nhân viên
          kho xác nhận đã nhận hàng.
        </p>
      </div>

      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Button onClick={onCancel}>Để sau</Button>
        <Button
          type="primary"
          onClick={onConfirm}
          loading={loading}
          style={{ backgroundColor: "#faad14", borderColor: "#faad14" }}
        >
          Đã hiểu, tiếp tục
        </Button>
      </Space>
    </Modal>
  );
};

export default ReturnExcessModal;
