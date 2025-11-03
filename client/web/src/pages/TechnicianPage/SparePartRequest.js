import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Input,
  InputNumber,
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Empty,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  BellOutlined,
  InboxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { sparePartService } from "../../services/sparePartService";
import notificationService from "../../services/notificationService";
import { replacementHistoryService } from "../../services/replacementHistoryService";
import { useAuth } from "../../contexts/AuthContext";

const { TextArea } = Input;

// If an incident prop is passed, technicians can record replacement used for that incident
const SparePartRequest = ({ incident = null }) => {
  const [loading, setLoading] = useState(false);
  const [spareParts, setSpareParts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [requestReason, setRequestReason] = useState("");

  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadSpareParts();
  }, []);

  const loadSpareParts = async () => {
    setLoading(true);
    try {
      const res = await sparePartService.getAll();
      const items = Array.isArray(res) ? res : res?.data || [];

      // Only show active parts
      const activeParts = items.filter((part) => part.isActive !== false);
      setSpareParts(activeParts);
    } catch (err) {
      console.error("Lỗi khi tải danh sách phụ tùng:", err);
      message.error("Không thể tải danh sách phụ tùng");
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity, minStock) => {
    if (quantity === 0) {
      return { status: "Hết hàng", color: "error", text: "Hết hàng" };
    } else if (quantity <= minStock) {
      return { status: "Sắp hết", color: "warning", text: "Sắp hết" };
    } else {
      return { status: "Đủ hàng", color: "success", text: "Còn hàng" };
    }
  };

  const handleRequestPart = (record) => {
    setSelectedPart(record);
    setRequestQuantity(1);
    setRequestReason("");
    setRequestModalVisible(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedPart) return;

    if (!requestReason || requestReason.trim() === "") {
      message.warning("Vui lòng nhập lý do yêu cầu");
      return;
    }

    if (requestQuantity <= 0) {
      message.warning("Số lượng phải lớn hơn 0");
      return;
    }

    setLoading(true);
    try {
      const stockInfo = getStockStatus(
        selectedPart.quantity,
        selectedPart.minStockLevel
      );

      // Tạo nội dung thông báo
      let notificationMessage = "";
      let notificationType = "";

      if (stockInfo.status === "Hết hàng") {
        notificationMessage = `Kỹ thuật viên ${
          currentUser?.fullName || currentUser?.username
        } yêu cầu phụ tùng "${selectedPart.partName}" (${
          selectedPart.partNumber
        }) - Số lượng: ${requestQuantity}. ⚠️ KHO HIỆN HẾT HÀNG. Lý do: ${requestReason}`;
        notificationType = "outOfStock";
      } else if (stockInfo.status === "Sắp hết") {
        notificationMessage = `Kỹ thuật viên ${
          currentUser?.fullName || currentUser?.username
        } yêu cầu phụ tùng "${selectedPart.partName}" (${
          selectedPart.partNumber
        }) - Số lượng: ${requestQuantity}. ⚠️ KHO SẮP HẾT (Còn ${
          selectedPart.quantity
        }). Lý do: ${requestReason}`;
        notificationType = "lowStock";
      } else {
        notificationMessage = `Kỹ thuật viên ${
          currentUser?.fullName || currentUser?.username
        } yêu cầu phụ tùng "${selectedPart.partName}" (${
          selectedPart.partNumber
        }) - Số lượng: ${requestQuantity}. Kho còn ${
          selectedPart.quantity
        }. Lý do: ${requestReason}`;
        notificationType = "partRequest";
      }

      // Gửi thông báo đến QLKT
      await notificationService.sendToTechnicalManagers({
        message: notificationMessage,
        type: notificationType,
        data: {
          partId: selectedPart.partId,
          partNumber: selectedPart.partNumber,
          partName: selectedPart.partName,
          requestedQuantity: requestQuantity,
          currentStock: selectedPart.quantity,
          minStockLevel: selectedPart.minStockLevel,
          requestedBy: currentUser?.userId || currentUser?.id,
          requestedByName: currentUser?.fullName || currentUser?.username,
          reason: requestReason,
          stockStatus: stockInfo.status,
        },
      });

      message.success(
        "Đã gửi yêu cầu đến Quản lý kỹ thuật thành công! QLKT sẽ xem xét và xử lý yêu cầu của bạn."
      );

      setRequestModalVisible(false);
      setSelectedPart(null);
      setRequestQuantity(1);
      setRequestReason("");
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu:", err);
      message.error(err?.message || "Không thể gửi yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Record replacement usage (creates ReplacementHistory and updates inventory on backend)
  const handleRecordReplacement = async () => {
    if (!selectedPart) return;

    if (requestQuantity <= 0) {
      message.warning("Số lượng phải lớn hơn 0");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        EquipmentId: incident?.equipmentId || incident?.equipmentID || null,
        PartId: selectedPart.partId,
        Quantity: requestQuantity,
        ReplacedDate: new Date().toISOString(),
        ReplacedBy:
          currentUser?.userId ||
          currentUser?.id ||
          currentUser?.username ||
          null,
        Status: "Completed",
        Remarks: requestReason || null,
      };

      await replacementHistoryService.create(payload);

      message.success("Đã ghi nhận thay thế thành công và cập nhật tồn kho.");

      // refresh spare parts list to show updated stock
      await loadSpareParts();

      setRequestModalVisible(false);
      setSelectedPart(null);
      setRequestQuantity(1);
      setRequestReason("");
    } catch (err) {
      console.error("Lỗi khi ghi nhận thay thế:", err);
      message.error(
        err?.message || "Không thể ghi nhận thay thế. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredData = spareParts.filter((part) => {
    const matchSearch =
      part.partNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      part.partName.toLowerCase().includes(searchText.toLowerCase());
    return matchSearch;
  });

  const stats = {
    total: spareParts.length,
    outOfStock: spareParts.filter((p) => p.quantity === 0).length,
    lowStock: spareParts.filter(
      (p) => p.quantity > 0 && p.quantity <= p.minStockLevel
    ).length,
    available: spareParts.filter((p) => p.quantity > p.minStockLevel).length,
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
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
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 150,
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (quantity, record) => {
        const stockInfo = getStockStatus(quantity, record.minStockLevel);
        return (
          <Tag color={stockInfo.color}>
            {quantity} {record.unit || "cái"}
          </Tag>
        );
      },
    },
    {
      title: "Mức tối thiểu",
      dataIndex: "minStockLevel",
      key: "minStockLevel",
      width: 120,
      align: "center",
      render: (minStock, record) => `${minStock} ${record.unit || "cái"}`,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      align: "center",
      render: (_, record) => {
        const stockInfo = getStockStatus(record.quantity, record.minStockLevel);
        return <Tag color={stockInfo.color}>{stockInfo.text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<BellOutlined />}
          onClick={() => handleRequestPart(record)}
          size="small"
        >
          Yêu cầu
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng phụ tùng"
              value={stats.total}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hết hàng"
              value={stats.outOfStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sắp hết"
              value={stats.lowStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Còn hàng"
              value={stats.available}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card
        title={
          <Space>
            <InboxOutlined />
            <span>Danh sách phụ tùng / vật tư</span>
          </Space>
        }
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadSpareParts}>
            Làm mới
          </Button>
        }
      >
        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm mã hoặc tên phụ tùng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="partId"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phụ tùng`,
          }}
          locale={{
            emptyText: (
              <Empty
                description="Không có phụ tùng nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* Request Modal */}
      <Modal
        title={
          <Space>
            <BellOutlined />
            <span>Yêu cầu phụ tùng / vật tư</span>
          </Space>
        }
        open={requestModalVisible}
        onCancel={() => {
          setRequestModalVisible(false);
          setSelectedPart(null);
          setRequestQuantity(1);
          setRequestReason("");
        }}
        footer={
          // If an incident is provided, show both options: notify QLKT or directly record replacement
          incident
            ? [
                <Button
                  key="cancel"
                  onClick={() => {
                    setRequestModalVisible(false);
                    setSelectedPart(null);
                  }}
                >
                  Hủy
                </Button>,
                <Button
                  key="notify"
                  onClick={handleSubmitRequest}
                  loading={loading}
                >
                  Gửi yêu cầu đến QLKT
                </Button>,
                <Button
                  key="record"
                  type="primary"
                  onClick={handleRecordReplacement}
                  loading={loading}
                >
                  Ghi nhận thay thế
                </Button>,
              ]
            : [
                <Button
                  key="cancel"
                  onClick={() => {
                    setRequestModalVisible(false);
                    setSelectedPart(null);
                  }}
                >
                  Hủy
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  onClick={handleSubmitRequest}
                  loading={loading}
                >
                  Gửi yêu cầu đến QLKT
                </Button>,
              ]
        }
        width={600}
      >
        {selectedPart && (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Mã phụ tùng">
                {selectedPart.partNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Tên phụ tùng">
                {selectedPart.partName}
              </Descriptions.Item>
              <Descriptions.Item label="Tồn kho hiện tại">
                <Tag
                  color={
                    getStockStatus(
                      selectedPart.quantity,
                      selectedPart.minStockLevel
                    ).color
                  }
                >
                  {selectedPart.quantity} {selectedPart.unit || "cái"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {(() => {
                  const stockInfo = getStockStatus(
                    selectedPart.quantity,
                    selectedPart.minStockLevel
                  );
                  if (stockInfo.status === "Hết hàng") {
                    return (
                      <Tag color="error" icon={<WarningOutlined />}>
                        Hết hàng - QLKT sẽ xem xét yêu cầu mua hàng
                      </Tag>
                    );
                  } else if (stockInfo.status === "Sắp hết") {
                    return (
                      <Tag color="warning" icon={<WarningOutlined />}>
                        Sắp hết - QLKT sẽ được thông báo
                      </Tag>
                    );
                  } else {
                    return (
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Còn hàng - Liên hệ kho để nhận
                      </Tag>
                    );
                  }
                })()}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <label
                style={{ fontWeight: 600, marginBottom: 8, display: "block" }}
              >
                Số lượng yêu cầu:
              </label>
              <InputNumber
                min={1}
                value={requestQuantity}
                onChange={setRequestQuantity}
                style={{ width: "100%" }}
                addonAfter={selectedPart.unit || "cái"}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <label
                style={{ fontWeight: 600, marginBottom: 8, display: "block" }}
              >
                Lý do yêu cầu: <span style={{ color: "red" }}>*</span>
              </label>
              <TextArea
                rows={4}
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Nhập lý do yêu cầu phụ tùng (ví dụ: Sửa chữa thiết bị, bảo trì định kỳ...)"
                maxLength={500}
                showCount
              />
            </div>

            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#f0f5ff",
                borderRadius: 4,
                border: "1px solid #adc6ff",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                <BellOutlined /> Lưu ý:
              </div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  Yêu cầu sẽ được gửi đến{" "}
                  <strong>Quản lý kỹ thuật (QLKT)</strong>
                </li>
                <li>QLKT sẽ xem xét và xử lý yêu cầu của bạn</li>
                <li>
                  Nếu hết hàng hoặc sắp hết, QLKT có thể tạo yêu cầu mua hàng
                  đến Quản lý
                </li>
                <li>
                  Nếu còn hàng, bạn có thể liên hệ kho để nhận phụ tùng sau khi
                  QLKT phê duyệt
                </li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SparePartRequest;
