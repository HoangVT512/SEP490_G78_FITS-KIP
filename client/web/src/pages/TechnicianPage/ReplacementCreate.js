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
} from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { sparePartService } from "../../services/sparePartService";
import { incidentService } from "../../services/incidentService";
import { replacementHistoryService } from "../../services/replacementHistoryService";
import { useAuth } from "../../contexts/AuthContext";
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
  const [quantityToReturn, setQuantityToReturn] = useState(0);
  const [replacementData, setReplacementData] = useState(null);
  const [equipmentName, setEquipmentName] = useState("");
  const [partName, setPartName] = useState("");
  const [returnModalVisible, setReturnModalVisible] = useState(false);

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
        const replacementId =
          propReplacementId || searchParams.get("replacementId");
        if (replacementId) {
          console.log("Loading replacement ID:", replacementId);
          const replacement = await replacementHistoryService.getById(
            replacementId
          );
          console.log("Loaded replacement data:", replacement);
          console.log(
            "Keys in replacement object:",
            Object.keys(replacement || {})
          );

          if (replacement) {
            setReplacementData(replacement);

            const equipName =
              replacement.equipmentName ||
              replacement.EquipmentName ||
              `Thiết bị #${replacement.equipmentId || replacement.EquipmentID}`;
            const partDisplayName = `${replacement.partNumber || replacement.PartNumber
              } - ${replacement.partName || replacement.PartName}`;

            console.log("Equipment Name:", equipName);
            console.log("Part Name:", partDisplayName);

            setEquipmentName(equipName);
            setPartName(partDisplayName);

            const formValues = {
              EquipmentName: equipName,
              PartName: partDisplayName,
              Quantity: replacement.quantity || replacement.Quantity,
              ActualQuantityUsed:
                replacement.actualQuantityUsed ||
                replacement.ActualQuantityUsed,
              ReplacedDate:
                replacement.replacedDate || replacement.ReplacedDate
                  ? dayjs(replacement.replacedDate || replacement.ReplacedDate)
                  : dayjs(),
              Remarks: replacement.remarks || replacement.Remarks,
            };

            console.log("Setting form values:", formValues);
            form.setFieldsValue(formValues);

            if (
              replacement.actualQuantityUsed &&
              replacement.actualQuantityUsed < replacement.quantity
            ) {
              setQuantityToReturn(
                replacement.quantity - replacement.actualQuantityUsed
              );
            }
          }
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to load replacement data:", err);
        message.error(
          `Không thể tải dữ liệu thay thế: ${err?.message || String(err)}`
        );
      }

      try {
        const incidentId = propIncidentId || searchParams.get("incidentId");
        if (incidentId) {
          console.log("Loading incident ID:", incidentId);
          const inc = await incidentService.getById(incidentId);
          console.log("Loaded incident data:", inc);

          if (inc) {
            const equipId =
              inc.equipmentId ||
              inc.equipmentID ||
              inc.equipment?.equipmentId ||
              inc.equipment?.equipmentID;

            console.log(
              "Looking for approved replacement for equipment:",
              equipId
            );

            try {
              const allReplacements =
                await replacementHistoryService.getByEquipmentId(equipId);
              console.log("All replacements for equipment:", allReplacements);

              const approvedReplacement = Array.isArray(allReplacements)
                ? allReplacements.find(
                  (r) =>
                    (r.status === "Đã duyệt cấp phát" ||
                      r.Status === "Đã duyệt cấp phát") &&
                    !r.actualQuantityUsed &&
                    !r.ActualQuantityUsed
                )
                : null;

              if (approvedReplacement) {
                console.log("Found approved replacement:", approvedReplacement);

                setReplacementData(approvedReplacement);

                const equipName =
                  approvedReplacement.equipmentName ||
                  approvedReplacement.EquipmentName ||
                  inc.equipment?.equipmentName ||
                  `Thiết bị #${equipId}`;
                const partDisplayName = `${approvedReplacement.partNumber ||
                  approvedReplacement.PartNumber
                  } - ${approvedReplacement.partName || approvedReplacement.PartName
                  }`;

                setEquipmentName(equipName);
                setPartName(partDisplayName);

                form.setFieldsValue({
                  EquipmentName: equipName,
                  PartName: partDisplayName,
                  Quantity:
                    approvedReplacement.quantity ||
                    approvedReplacement.Quantity,
                  ActualQuantityUsed:
                    approvedReplacement.actualQuantityUsed ||
                    approvedReplacement.ActualQuantityUsed,
                  ReplacedDate:
                    approvedReplacement.replacedDate ||
                      approvedReplacement.ReplacedDate
                      ? dayjs(
                        approvedReplacement.replacedDate ||
                        approvedReplacement.ReplacedDate
                      )
                      : dayjs(),
                  Remarks:
                    approvedReplacement.remarks || approvedReplacement.Remarks,
                });

                setLoading(false);
                return;
              } else {
                console.warn(
                  "No approved replacement found for equipment:",
                  equipId
                );
                message.warning(
                  "Không tìm thấy yêu cầu cấp phát đã được duyệt cho thiết bị này. Vui lòng tạo yêu cầu cấp phát trước."
                );
              }
            } catch (repErr) {
              console.error(
                "Failed to load replacements for equipment:",
                repErr
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to load incident info:", err);
        message.error(
          `Không thể tải thông tin sự cố: ${err?.message || String(err)}`
        );
      }

      try {
        form.setFieldsValue({ ReplacedDate: dayjs() });
      } catch (err) {
        console.error("Failed to set default date:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [propIncidentId, propReplacementId, searchParams]);

  const handleActualQuantityChange = (value) => {
    const requestedQty = form.getFieldValue("Quantity") || 0;
    if (value && value < requestedQty) {
      setQuantityToReturn(requestedQty - value);
    } else {
      setQuantityToReturn(0);
    }
  };

  const handleSubmit = async (values) => {
    if (!replacementData) {
      message.error(
        "Không thể tạo mới replacement từ form này. Vui lòng sử dụng chức năng yêu cầu cấp phát."
      );
      return;
    }

    setLoading(true);
    try {
      const requestedQty =
        values.Quantity ||
        replacementData.quantity ||
        replacementData.Quantity ||
        0;
      const actualQty =
        parseInt(values.actualQuantityUsed) || values.ActualQuantityUsed || 0;

      if (actualQty === undefined || actualQty === null || actualQty === 0) {
        message.error("Vui lòng nhập số lượng thực tế đã sử dụng");
        setLoading(false);
        return;
      }

      if (actualQty < 0) {
        message.error("Số lượng sử dụng không được âm");
        return;
      }

      let status = "Hoàn thành";

      if (actualQty < requestedQty) {
        status = "Chờ trả lại";
      } else if (actualQty === requestedQty) {
        status = "Hoàn thành";
      } else {
        status = "Chờ trả lại";
      }

      const payload = {
        ActualQuantityUsed: actualQty,
        Status: status,
        Remarks:
          values.Remarks || replacementData.remarks || replacementData.Remarks,
      };

      console.log("Recording actual usage with payload:", payload);

      await replacementHistoryService.recordActualUsage(
        replacementData.replacementID || replacementData.ReplacementID,
        payload
      );

      if (actualQty > requestedQty) {
        const toReturn = actualQty - requestedQty;
        setQuantityToReturn(toReturn);
        setReturnModalVisible(true);
        setLoading(false);
        return;
      }

      message.success("Đã ghi nhận số lượng sử dụng thành công.");

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

  const handleReturnConfirm = () => {
    setReturnModalVisible(false);
    message.success(
      `Bạn có ${quantityToReturn} linh kiện thừa. Vui lòng trực tiếp đến kho để trả hàng. QLKT sẽ xác nhận sau khi bạn trả.`
    );

    if (typeof onSuccess === "function") {
      onSuccess();
    } else {
      navigate("/technician/incident-list");
    }
  };

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
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Row 1: Equipment & Part Info - 2 columns */}
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Thiết bị">
              <Input
                value={equipmentName}
                disabled
                placeholder="Thiết bị từ sự cố"
                style={{ color: "#000", fontWeight: 500 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Phụ tùng">
              <Input
                value={partName}
                disabled
                placeholder="Phụ tùng đã được duyệt"
                style={{ color: "#000", fontWeight: 500 }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 2: Quantity Info - 3 columns */}
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={8}>
            <Form.Item label="Số lượng lấy từ kho">
              <InputNumber
                value={replacementData?.quantity || replacementData?.Quantity}
                disabled
                style={{ width: "100%", color: "#000", fontWeight: 500 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Số lượng sử dụng"
              name="ActualQuantityUsed"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số lượng",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const quantity = getFieldValue("Quantity");
                    if (!value || value <= quantity) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(`Không được vượt quá ${quantity}`)
                    );
                  },
                }),
              ]}
              tooltip="Số lượng thực tế đã sử dụng"
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                onChange={handleActualQuantityChange}
                placeholder="Nhập số lượng"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item label="Ngày thay thế" name="ReplacedDate">
              <DatePicker
                showTime
                style={{ width: "100%" }}
                disabled={!!replacementData}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Status Display */}
        {replacementData && (
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Trạng thái">
                <Input
                  value={replacementData.status || replacementData.Status}
                  disabled
                  style={{ color: "#000", fontWeight: 500 }}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Quantity Return Alert */}
        {quantityToReturn > 0 && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#fff7e6",
              border: "1px solid #ffc069",
              borderRadius: "4px",
              marginBottom: "16px",
              color: "#ad6800",
              fontSize: "13px",
            }}
          >
            <strong>⚠️ Số lượng thừa: {quantityToReturn}</strong>
            <p style={{ marginTop: "6px", marginBottom: 0 }}>
              Vui lòng trực tiếp đến kho để trả {quantityToReturn} linh kiện. QLKT sẽ xác nhận.
            </p>
          </div>
        )}

        {/* Remarks */}
        <Form.Item label="Ghi chú" name="Remarks">
          <TextArea
            rows={3}
            placeholder="Ghi chú (tùy chọn)"
            disabled={!!replacementData}
            style={{ fontSize: "13px" }}
          />
        </Form.Item>

        {/* Button Group */}
        {replacementData && (
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
                htmlType="submit"
                loading={loading}
                style={{
                  backgroundColor: "#283652",
                  height: "40px",
                  fontSize: "16px",
                  fontWeight: "500",
                  minWidth: "120px",
                }}
              >
                Lưu ghi nhận
              </Button>
            </Space>
          </Form.Item>
        )}

        {!replacementData && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#fff7e6",
              border: "1px solid #ffc069",
              borderRadius: "4px",
              textAlign: "center",
              fontSize: "13px",
            }}
          >
            <p style={{ margin: 0, color: "#ad6800" }}>
              ⚠️ Form này dùng để ghi nhận số lượng sử dụng sau khi sửa chữa.
              <br />
              Để yêu cầu cấp phát linh kiện mới, vui lòng sử dụng "Yêu cầu cấp phát" trong danh sách sự cố.
            </p>
          </div>
        )}
      </Form>

      <ReturnExcessModal
        visible={returnModalVisible}
        excessQuantity={quantityToReturn}
        partName={partName}
        onConfirm={handleReturnConfirm}
        onCancel={() => setReturnModalVisible(false)}
        loading={loading}
      />
    </Card>
  );
};

export default ReplacementCreate;