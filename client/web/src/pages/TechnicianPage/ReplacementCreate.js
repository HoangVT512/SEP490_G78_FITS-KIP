import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Input,
  Button,
  message,
  Space,
  Row,
  Col,
  Table,
  Tag,
  Divider,
} from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { sparePartService } from "../../services/sparePartService";
import { incidentService } from "../../services/incidentService";
import { replacementHistoryService } from "../../services/replacementHistoryService";
import { useAuth } from "../../contexts/AuthContext";
import * as notificationService from "../../services/notificationService";
import ReturnExcessModal from "./ReturnExcessModal";

const { TextArea } = Input;
const ReplacementCreate = ({
  incidentId: propIncidentId = null,
  replacementId: propReplacementId = null,
  onSuccess = null,
  onCancel = null,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replacementData, setReplacementData] = useState([]);
  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentCode, setEquipmentCode] = useState("");
  const [incidentInfo, setIncidentInfo] = useState(null);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [returnExcessData, setReturnExcessData] = useState([]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      try {
        const res = await sparePartService.getAll();
        setParts(Array.isArray(res) ? res : res?.data || []);
      } catch (err) {
        console.error("Failed to load spare parts:", err);
        message.error(
          `Không thể tải danh sách phụ tùng: ${err?.message || String(err)}`
        );
      }

      try {
        const incidentId = propIncidentId || searchParams.get("incidentId");
        if (incidentId) {
          console.log("Loading incident ID:", incidentId);
          const inc = await incidentService.getById(incidentId);
          console.log("Loaded incident data:", inc);

          if (inc) {
            setIncidentInfo(inc);
            const equipId =
              inc.equipmentId ||
              inc.equipmentID ||
              inc.equipment?.equipmentId ||
              inc.equipment?.equipmentID;

            const equipName =
              inc.equipment?.equipmentName ||
              inc.equipmentName ||
              `Thiết bị #${equipId}`;
            const equipCode =
              inc.equipment?.equipmentCode ||
              inc.equipmentCode ||
              "";

            setEquipmentName(equipName);
            setEquipmentCode(equipCode);

            console.log("Looking for approved replacements for equipment:", equipId);

            try {
              const allReplacements =
                await replacementHistoryService.getByEquipmentId(equipId);
              console.log("All replacements for equipment:", allReplacements);

              const approvedReplacements = Array.isArray(allReplacements)
                ? allReplacements.filter(
                  (r) =>
                    (r.status === "Đã duyệt cấp phát" ||
                      r.Status === "Đã duyệt cấp phát") &&
                    !r.actualQuantityUsed &&
                    !r.ActualQuantityUsed
                )
                : [];

              if (approvedReplacements.length > 0) {
                console.log("Found approved replacements:", approvedReplacements);

                // Group replacements by partNumber to combine same parts
                const groupedReplacements = {};
                approvedReplacements.forEach((replacement) => {
                  const partNumber = replacement.partNumber || replacement.PartNumber;
                  const partName = replacement.partName || replacement.PartName;
                  const quantity = replacement.quantity || replacement.Quantity;
                  const replacementId = replacement.replacementID || replacement.ReplacementID;

                  if (!groupedReplacements[partNumber]) {
                    groupedReplacements[partNumber] = {
                      partNumber,
                      partName,
                      totalQuantity: 0,
                      replacementIds: [],
                      remarks: "",
                    };
                  }

                  groupedReplacements[partNumber].totalQuantity += quantity;
                  groupedReplacements[partNumber].replacementIds.push(replacementId);
                });

                // Convert grouped data to form data
                const formData = Object.values(groupedReplacements).map((group, index) => ({
                  key: index,
                  partNumber: group.partNumber,
                  partName: group.partName,
                  quantity: group.totalQuantity,
                  replacementIds: group.replacementIds,
                  actualQuantityUsed: 0,
                  remarks: "",
                }));

                setReplacementData(formData);

                console.log("Setting grouped form data:", formData);
              } else {
                console.warn("No approved replacements found for equipment:", equipId);
                message.warning(
                  "Không tìm thấy yêu cầu cấp phát đã được duyệt cho thiết bị này. Vui lòng tạo yêu cầu cấp phát trước."
                );
              }
            } catch (repErr) {
              console.error("Failed to load replacements for equipment:", repErr);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load incident info:", err);
        message.error(
          `Không thể tải thông tin sự cố: ${err?.message || String(err)}`
        );
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [propIncidentId, propReplacementId, searchParams]);

  const handleActualQuantityChange = (value, record) => {
    const updatedData = replacementData.map(item =>
      item.key === record.key
        ? { ...item, actualQuantityUsed: value || 0 }
        : item
    );
    setReplacementData(updatedData);
  };

  const handleRemarksChange = (value, record) => {
    const updatedData = replacementData.map(item =>
      item.key === record.key
        ? { ...item, remarks: value || "" }
        : item
    );
    setReplacementData(updatedData);
  };

  const handleSubmit = async () => {
    // Validate all entries
    const invalidEntries = replacementData.filter(item =>
      !item.actualQuantityUsed || item.actualQuantityUsed < 0 || item.actualQuantityUsed > item.quantity
    );

    if (invalidEntries.length > 0) {
      message.error("Vui lòng nhập số lượng sử dụng hợp lệ cho tất cả phụ tùng");
      return;
    }

    setLoading(true);
    try {
      // Expand grouped data back to individual replacement records
      const expandedItems = [];
      replacementData.forEach(item => {
        const { replacementIds, actualQuantityUsed, remarks, quantity } = item;

        // Distribute the actual quantity used across all replacement records for this part
        // For simplicity, we'll assign the full quantity to the first record and 0 to others
        // This maintains the total quantity while keeping the logic simple
        replacementIds.forEach((replacementId, index) => {
          expandedItems.push({
            ReplacementId: replacementId,
            ActualQuantityUsed: index === 0 ? actualQuantityUsed : 0,
            Remarks: remarks || ""
          });
        });
      });

      const requestData = {
        Items: expandedItems
      };

      console.log("Batch recording actual usage with expanded data:", requestData);

      const results = await replacementHistoryService.batchRecordActualUsage(requestData);

      // Check for excess quantities that need return
      const excessItems = results.filter(result =>
        (result.ActualQuantityUsed || result.actualQuantityUsed) <
        (result.Quantity || result.quantity)
      );

      if (excessItems.length > 0) {
        const excessData = excessItems.map(item => ({
          replacementId: item.ReplacementID || item.replacementID,
          partName: `${item.PartNumber || item.partNumber} - ${item.PartName || item.partName}`,
          excessQuantity: (item.Quantity || item.quantity) - (item.ActualQuantityUsed || item.actualQuantityUsed),
          actualUsed: item.ActualQuantityUsed || item.actualQuantityUsed
        }));

        setReturnExcessData(excessData);
        setReturnModalVisible(true);
        setLoading(false);
        return;
      }

      message.success("Đã ghi nhận số lượng sử dụng thành công cho tất cả phụ tùng.");

      if (typeof onSuccess === "function") {
        onSuccess();
      } else {
        navigate("/technician/incident-list");
      }
    } catch (err) {
      console.error(err);
      message.error(err?.message || "Không thể cập nhật ghi nhận thay thế.");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnConfirm = async () => {
    setReturnModalVisible(false);
    const totalExcess = returnExcessData.reduce((sum, item) => sum + item.excessQuantity, 0);

    // Send notification to warehouse managers about excess parts
    try {
      const notificationData = {
        message: `Kỹ thuật viên ${currentUser?.fullName || currentUser?.userName || 'N/A'} có ${totalExcess} linh kiện thừa cần trả lại cho sự cố ${incidentInfo?.incidentCode || `INC-${String(incidentInfo?.incidentId || 0).padStart(3, "0")}`}`,
        type: "ExcessPartsReturn",
        data: {
          incidentId: incidentInfo?.incidentId,
          equipmentName: equipmentName,
          technicianName: currentUser?.fullName || currentUser?.userName,
          totalExcessQuantity: totalExcess,
          excessParts: returnExcessData
        }
      };

      await notificationService.sendToWarehouseManagers(notificationData);
      console.log("✅ Notification sent to warehouse managers about excess parts");
    } catch (notificationError) {
      console.error("❌ Failed to send notification to warehouse managers:", notificationError);
      // Don't block the flow if notification fails
    }

    message.success(
      `Bạn có tổng cộng ${totalExcess} linh kiện thừa từ ${returnExcessData.length} loại phụ tùng. Vui lòng trực tiếp đến kho để trả hàng. QLKT sẽ xác nhận sau khi bạn trả.`
    );

    if (typeof onSuccess === "function") {
      onSuccess();
    } else {
      navigate("/technician/incident-list");
    }
  };

  const columns = [
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
    },
    {
      title: "SL lấy từ kho",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      align: "center",
      render: (qty) => <Tag color="green">{qty}</Tag>,
    },
    {
      title: "SL sử dụng thực tế",
      dataIndex: "actualQuantityUsed",
      key: "actualQuantityUsed",
      width: 160,
      render: (value, record) => (
        <InputNumber
          min={0}
          max={record.quantity}
          value={value}
          onChange={(val) => handleActualQuantityChange(val, record)}
          placeholder="Nhập SL"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "SL thừa",
      key: "excess",
      width: 100,
      align: "center",
      render: (_, record) => {
        const excess = record.quantity - (record.actualQuantityUsed || 0);
        return excess > 0 ? (
          <Tag color="orange">{excess}</Tag>
        ) : (
          <Tag color="green">0</Tag>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "remarks",
      key: "remarks",
      width: 200,
      render: (value, record) => (
        <Input
          value={value}
          onChange={(e) => handleRemarksChange(e.target.value, record)}
          placeholder="Ghi chú (tùy chọn)"
          style={{ width: "100%" }}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <Card title="Ghi nhận số lượng thực tế sử dụng" bordered={false}>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p>Đang tải dữ liệu...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Ghi nhận số lượng thực tế sử dụng" bordered={false}>
      {/* Incident & Equipment Info */}
      <Card size="small" style={{ marginBottom: "16px" }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: "8px" }}>
              <strong>Sự cố:</strong>
            </div>
            <div style={{ fontSize: "16px", fontWeight: "500" }}>
              INC-{String(incidentInfo?.incidentId || 0).padStart(3, "0")}
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: "8px" }}>
              <strong>Thiết bị:</strong>
            </div>
            <div style={{ fontSize: "16px", fontWeight: "500" }}>
              {equipmentCode} - {equipmentName}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Replacements Table */}
      {replacementData.length > 0 ? (
        <>
          <Divider orientation="left">
            Danh sách phụ tùng đã duyệt ({replacementData.length} loại)
          </Divider>

          <Table
            columns={columns}
            dataSource={replacementData}
            rowKey="key"
            pagination={false}
            size="middle"
            bordered
            style={{ marginBottom: "16px" }}
          />

          {/* Summary */}
          <Card size="small" style={{ marginBottom: "16px" }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1890ff" }}>
                    {replacementData.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                  <div style={{ color: "#666" }}>Tổng SL lấy kho</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#52c41a" }}>
                    {replacementData.reduce((sum, item) => sum + (item.actualQuantityUsed || 0), 0)}
                  </div>
                  <div style={{ color: "#666" }}>Tổng SL sử dụng</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#faad14" }}>
                    {replacementData.reduce((sum, item) => {
                      const excess = item.quantity - (item.actualQuantityUsed || 0);
                      return sum + (excess > 0 ? excess : 0);
                    }, 0)}
                  </div>
                  <div style={{ color: "#666" }}>Tổng SL thừa</div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Action Buttons */}
          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
              <Button
                onClick={() =>
                  typeof onCancel === "function" ? onCancel() : navigate(-1)
                }
                style={{
                  height: "40px",
                  fontSize: "16px",
                  minWidth: "120px",
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                style={{
                  backgroundColor: "#283652",
                  height: "40px",
                  fontSize: "16px",
                  fontWeight: "500",
                  minWidth: "180px",
                }}
              >
                Lưu ghi nhận
              </Button>
            </Space>
          </Form.Item>
        </>
      ) : (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#999",
            fontSize: "16px",
          }}
        >
          <p>Không có phụ tùng nào cần ghi nhận số lượng sử dụng.</p>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>
            Vui lòng kiểm tra lại danh sách yêu cầu cấp phát đã được duyệt.
          </p>
        </div>
      )}

      <ReturnExcessModal
        visible={returnModalVisible}
        excessData={returnExcessData}
        onConfirm={handleReturnConfirm}
        onCancel={() => setReturnModalVisible(false)}
        loading={loading}
      />
    </Card>
  );
};

export default ReplacementCreate;