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
  replacementId: propReplacementId = null, // NEW: để load replacement có sẵn
  onSuccess = null,
  onCancel = null,
}) => {
  // ReplacementCreate can be used as a standalone page or embedded in a modal.
  // Props:
  // - incidentId (optional) : if provided, prefill EquipmentId from that incident
  // - replacementId (optional) : if provided, load existing replacement data (view/edit mode)
  // - onSuccess (optional) : callback when creation succeeds (embedded mode)
  // - onCancel (optional) : callback to close modal (embedded mode)
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quantityToReturn, setQuantityToReturn] = useState(0); // Số lượng thừa cần trả
  const [replacementData, setReplacementData] = useState(null); // Dữ liệu replacement đã tồn tại
  const [equipmentName, setEquipmentName] = useState(""); // Tên thiết bị
  const [partName, setPartName] = useState(""); // Tên phụ tùng
  const [returnModalVisible, setReturnModalVisible] = useState(false); // Modal thông báo trả lại

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // Load spare parts (non-fatal)
      try {
        const res = await sparePartService.getAll();
        setParts(Array.isArray(res) ? res : res?.data || []);
      } catch (err) {
        console.error("Failed to load spare parts:", err);
        message.error(
          `Không thể tải danh sách phụ tùng: ${err?.message || String(err)}`
        );
      }

      // NEW: Load existing replacement data if replacementId is provided
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

            // Build display names - handle both PascalCase and camelCase
            const equipName =
              replacement.equipmentName ||
              replacement.EquipmentName ||
              `Thiết bị #${replacement.equipmentId || replacement.EquipmentID}`;
            const partDisplayName = `${
              replacement.partNumber || replacement.PartNumber
            } - ${replacement.partName || replacement.PartName}`;

            console.log("Equipment Name:", equipName);
            console.log("Part Name:", partDisplayName);

            setEquipmentName(equipName);
            setPartName(partDisplayName);

            // Fill form with existing data - handle both PascalCase and camelCase
            const formValues = {
              EquipmentName: equipName, // Display only
              PartName: partDisplayName, // Display only
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

            // Calculate quantity to return
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

      // Load incident info and find approved replacement
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

            // Try to find approved replacement for this equipment
            console.log(
              "Looking for approved replacement for equipment:",
              equipId
            );

            try {
              const allReplacements =
                await replacementHistoryService.getByEquipmentId(equipId);
              console.log("All replacements for equipment:", allReplacements);

              // Find approved replacement (status "Đã duyệt cấp phát")
              const approvedReplacement = Array.isArray(allReplacements)
                ? allReplacements.find(
                    (r) =>
                      (r.status === "Đã duyệt cấp phát" ||
                        r.Status === "Đã duyệt cấp phát") &&
                      !r.actualQuantityUsed &&
                      !r.ActualQuantityUsed // Chưa ghi nhận
                  )
                : null;

              if (approvedReplacement) {
                console.log("Found approved replacement:", approvedReplacement);

                // Load this replacement as if user passed replacementId
                setReplacementData(approvedReplacement);

                const equipName =
                  approvedReplacement.equipmentName ||
                  approvedReplacement.EquipmentName ||
                  inc.equipment?.equipmentName ||
                  `Thiết bị #${equipId}`;
                const partDisplayName = `${
                  approvedReplacement.partNumber ||
                  approvedReplacement.PartNumber
                } - ${
                  approvedReplacement.partName || approvedReplacement.PartName
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
                return; // Found and loaded, exit
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

      // default replaced date to now
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

  // Tính toán số lượng thừa khi ActualQuantityUsed thay đổi
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

      // Xác định trạng thái dựa trên so sánh số lượng thực tế vs yêu cầu (Quantity = số lượng lấy từ kho)
      let status = "Hoàn thành"; // Default

      if (actualQty < requestedQty) {
        // Còn thừa: dùng ít hơn số lượng lấy → cần trả lại kho
        status = "Chờ trả lại";
      } else if (actualQty === requestedQty) {
        // Dùng đủ: dùng đúng số lượng lấy
        status = "Hoàn thành";
      } else {
        // Vượt quá: dùng nhiều hơn số lượng lấy (không nên xảy ra)
        status = "Chờ trả lại"; // Cũng là thừa
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

      // Nếu actualQty > requestedQty: show modal thông báo có dư
      // Nếu actualQty === requestedQty: tự động hoàn thành & trừ kho (backend xử lý)
      // Nếu actualQty < requestedQty: chuyển "Chờ trả lại" (backend xử lý)

      if (actualQty > requestedQty) {
        // Trường hợp vượt quá (không nên xảy ra nhưng xử lý để an toàn)
        const toReturn = actualQty - requestedQty;
        setQuantityToReturn(toReturn);
        setReturnModalVisible(true);
        setLoading(false);
        return; // Không close form, đợi user confirm modal
      }

      // Trường hợp dùng đủ hoặc dùng ít hơn → hoàn thành ngay
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

  // NEW: Handler khi user xác nhận trả hàng trong modal
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
        <Form.Item label="Sự cố (tùy chọn)">
          {/* Incident is passed via query param or prop; showing readonly when present */}
        </Form.Item>

        <Form.Item label="Thiết bị">
          <Input
            value={equipmentName}
            disabled
            placeholder="Thiết bị từ sự cố"
            style={{ color: "#000", fontWeight: 500 }}
          />
        </Form.Item>

        <Form.Item label="Phụ tùng">
          <Input
            value={partName}
            disabled
            placeholder="Phụ tùng đã được duyệt"
            style={{ color: "#000", fontWeight: 500 }}
          />
        </Form.Item>

        <Form.Item label="Số lượng đã lấy từ kho">
          <InputNumber
            value={replacementData?.quantity || replacementData?.Quantity}
            disabled
            style={{ width: "100%", color: "#000", fontWeight: 500 }}
          />
        </Form.Item>

        <Form.Item
          label="Số lượng thực tế sử dụng"
          name="ActualQuantityUsed"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập số lượng thực tế đã sử dụng",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const quantity = getFieldValue("Quantity");
                if (!value || value <= quantity) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(`Số lượng sử dụng không được vượt quá ${quantity}`)
                );
              },
            }),
          ]}
          tooltip="Nhập số lượng linh kiện đã thực sự sử dụng để sửa chữa"
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            onChange={handleActualQuantityChange}
            placeholder="Nhập số lượng thực tế đã sử dụng"
          />
        </Form.Item>

        {replacementData && (
          <Form.Item label="Trạng thái">
            <Input
              value={replacementData.status || replacementData.Status}
              disabled
              style={{ color: "#000", fontWeight: 500 }}
            />
          </Form.Item>
        )}

        {quantityToReturn > 0 && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#fff7e6",
              border: "1px solid #ffc069",
              borderRadius: "4px",
              marginBottom: "16px",
              color: "#ad6800",
            }}
          >
            <strong>
              ⚠️ Số lượng thừa cần trả lại kho: {quantityToReturn}
            </strong>
            <p style={{ marginTop: "8px", marginBottom: 0 }}>
              Vui lòng trực tiếp đến kho để trả {quantityToReturn} linh kiện.
              QLKT sẽ xác nhận và hoàn thành quy trình.
            </p>
          </div>
        )}

        <Form.Item label="Ngày thay thế" name="ReplacedDate">
          <DatePicker
            showTime
            style={{ width: "100%" }}
            disabled={!!replacementData}
          />
        </Form.Item>

        <Form.Item label="Ghi chú" name="Remarks">
          <TextArea
            rows={4}
            placeholder="Ghi chú (tùy chọn)"
            disabled={!!replacementData}
          />
        </Form.Item>

        {replacementData && (
          <Form.Item>
            <Space
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <Button
                onClick={() =>
                  typeof onCancel === "function" ? onCancel() : navigate(-1)
                }
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
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
            }}
          >
            <p style={{ margin: 0, color: "#ad6800" }}>
              ⚠️ Form này dùng để ghi nhận số lượng thực tế sử dụng sau khi sửa
              chữa.
              <br />
              Để yêu cầu cấp phát linh kiện mới, vui lòng sử dụng chức năng "Yêu
              cầu cấp phát" trong danh sách sự cố.
            </p>
          </div>
        )}
      </Form>

      {/* NEW: Modal thông báo cần trả lại linh kiện thừa */}
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
