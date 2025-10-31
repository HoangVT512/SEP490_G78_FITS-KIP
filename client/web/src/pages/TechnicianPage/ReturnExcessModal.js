import React from "react";
import { Modal, Button, Result, Space, Statistic, Row, Col } from "antd";
import { WarningOutlined } from "@ant-design/icons";

const ReturnExcessModal = ({
  visible,
  excessQuantity,
  partName,
  onConfirm,
  onCancel,
  loading,
}) => {
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
      width={500}
      centered
    >
      <Result
        status="warning"
        title="Bạn có linh kiện thừa cần trả lại"
        subTitle={`Hệ thống đã ghi nhận bạn sẽ trả lại ${excessQuantity} chiếc ${partName}`}
        style={{ marginBottom: "24px" }}
      />

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
          <Col span={12}>
            <Statistic
              title="Số lượng thừa"
              value={excessQuantity}
              suffix="chiếc"
              valueStyle={{ color: "#faad14" }}
            />
          </Col>
          <Col span={12}>
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
          <li>Hãy đến kho để trả {excessQuantity} chiếc linh kiện ngay</li>
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
