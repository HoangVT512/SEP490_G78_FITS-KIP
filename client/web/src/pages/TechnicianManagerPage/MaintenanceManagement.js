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
  DatePicker,
  message,
  Tag,
  Tabs,
  Row,
  Col,
  Switch,
  Statistic,
  Descriptions,
  List,
  Checkbox,
  Typography,
  Tooltip,
  Popconfirm,
  Badge,
  Alert,
  Timeline,
  Divider,
  Steps,
  Empty,
  Upload,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  UserAddOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FileTextOutlined,
  TeamOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  BellOutlined,
  WifiOutlined,
  DownloadOutlined,
  UploadOutlined,
  PushpinOutlined,
  DownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getAllMaintenancePlans,
  createMaintenancePlan,
  updateMaintenancePlan,
  deleteMaintenancePlan,
  getAllTemplates,
  getTemplatesByStage,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAllWorkOrders,
  getPendingWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  assignTechnicians,
  cancelWorkOrder,
  deleteWorkOrder,
  addChecklistItem,
  deleteChecklistItem,
  getAllTechnicians,
  getMaintenanceStats,
  getUpcomingMaintenance,
  assignMultipleTechnicians,
  removeTechnicianAssignment,
  postponeMaintenancePlan,
} from "../../services/maintenanceService";
import { equipmentService } from "../../services/equipmentService";
import { getAllStages, stageService } from "../../services/stageService";
import { lineService } from "../../services/lineService";
import { replacementHistoryService } from "../../services/replacementHistoryService";
import styles from "../../styles/pages/MaintenanceManagement.module.css";
import { useSignalR } from "../../contexts/SignalRContext";

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;
const { Text, Title } = Typography;
const { Step } = Steps;

const MaintenanceManagement = () => {
  const [loading, setLoading] = useState(false);

  // SignalR integration
  const { isConnected, subscribe } = useSignalR();

  // Modal states
  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [isWorkOrderModalVisible, setIsWorkOrderModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isChecklistModalVisible, setIsChecklistModalVisible] = useState(false);
  const [isAssignMultipleModalVisible, setIsAssignMultipleModalVisible] =
    useState(false);
  const [isPostponeModalVisible, setIsPostponeModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);

  const [editingPlan, setEditingPlan] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingWorkOrder, setEditingWorkOrder] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Forms
  const [planForm] = Form.useForm();
  const [templateForm] = Form.useForm();
  const [workOrderForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [checklistForm] = Form.useForm();
  const [multiAssignForm] = Form.useForm();
  const [postponeForm] = Form.useForm();

  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("plans");

  // Filter & Sort states for Work Orders
  const [statusFilter, setStatusFilter] = useState("all");
  const [technicianFilter, setTechnicianFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // Data states
  const [maintenancePlans, setMaintenancePlans] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [pendingWorkOrders, setPendingWorkOrders] = useState([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([]);
  const [workOrderSparePartRequests, setWorkOrderSparePartRequests] = useState(
    {}
  ); // Map: workOrderId -> count
  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalWorkOrders: 0,
    pendingWorkOrders: 0,
    inProgressWorkOrders: 0,
    completedWorkOrders: 0,
    overdueWorkOrders: 0,
    dueThisWeek: 0,
    dueThisMonth: 0,
    overallCompletionRate: 0,
  });

  const [equipments, setEquipments] = useState([]);
  const [stages, setStages] = useState([]);
  const [mechanicalTechs, setMechanicalTechs] = useState([]);
  const [electricalTechs, setElectricalTechs] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);

  // Thêm state để lọc dữ liệu theo luồng chọn
  const [lines, setLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [filteredStages, setFilteredStages] = useState([]);
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);

  // State cho assign multiple technicians
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [assigningTechnicians, setAssigningTechnicians] = useState([]);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === "workOrders") {
      loadWorkOrders();
    } else if (activeTab === "pending") {
      loadPendingWorkOrders();
    } else if (activeTab === "templates") {
      loadTemplates();
    } else if (activeTab === "upcoming") {
      loadUpcomingMaintenance();
    }
  }, [activeTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMaintenancePlans(),
        loadStats(),
        loadEquipments(),
        loadStages(),
        loadTechnicians(),
        loadLines(),
      ]);
    } catch (error) {
      message.error("Tải dữ liệu thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMaintenancePlans = async () => {
    try {
      const response = await getAllMaintenancePlans();
      setMaintenancePlans(response?.data || []);
    } catch (error) {
      console.error("Load plans error:", error);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await getAllTemplates();
      setTemplates(response?.data || []);
    } catch (error) {
      console.error("Load templates error:", error);
      message.error("Tải danh sách template thất bại");
    } finally {
      setLoading(false);
    }
  };

  const loadWorkOrders = async () => {
    setLoading(true);
    try {
      const response = await getAllWorkOrders();
      setWorkOrders(response?.data || []);

      // Fetch yêu cầu linh kiện cho mỗi work order
      if (response?.data && response.data.length > 0) {
        await fetchSparePartRequestsForWorkOrders(response.data);
      }
    } catch (error) {
      console.error("Load work orders error:", error);
      message.error("Tải danh sách phiếu bảo trì thất bại");
    } finally {
      setLoading(false);
    }
  };

  const fetchSparePartRequestsForWorkOrders = async (workOrders) => {
    try {
      const requestMap = {};

      // Fetch yêu cầu linh kiện cho mỗi work order
      const promises = workOrders.map((wo) =>
        replacementHistoryService
          .getByWorkOrderId(wo.workOrderId)
          .then((histories) => {
            // Đếm số lượng yêu cầu linh kiện với trạng thái "Chờ duyệt cấp phát"
            const pendingCount = (histories || []).filter(
              (h) => h.status === "Chờ duyệt cấp phát"
            ).length;

            if (pendingCount > 0) {
              requestMap[wo.workOrderId] = pendingCount;
            }
          })
          .catch((err) => {
            console.error(
              `Error fetching spare parts for WO ${wo.workOrderId}:`,
              err
            );
          })
      );

      await Promise.all(promises);
      setWorkOrderSparePartRequests(requestMap);
    } catch (error) {
      console.error("Fetch spare part requests error:", error);
    }
  };

  const loadPendingWorkOrders = async () => {
    setLoading(true);
    try {
      const response = await getPendingWorkOrders();
      setPendingWorkOrders(response?.data || []);
    } catch (error) {
      console.error("Load pending work orders error:", error);
      message.error("Tải danh sách phiếu chờ xử lý thất bại");
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingMaintenance = async () => {
    setLoading(true);
    try {
      const response = await getUpcomingMaintenance(7);
      setUpcomingMaintenance(response?.data || []);
    } catch (error) {
      console.error("Load upcoming maintenance error:", error);
      message.error("Tải danh sách bảo trì sắp đến hạn thất bại");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getMaintenanceStats(); // Dựa vào lịch sử:
      // - Work Order loại này thường mất bao lâu?
      // - Technician này thường mất bao lâu?
      // → Hiển thị "Dự kiến hoàn thành: 2.5 giờ"
      setStats(response?.data || {});
    } catch (error) {
      console.error("Load stats error:", error);
    }
  };

  const loadEquipments = async () => {
    try {
      const response = await equipmentService.getEquipments();
      setEquipments(response?.data || response || []);
    } catch (error) {
      console.error("Load equipments error:", error);
    }
  };

  const loadStages = async () => {
    try {
      const response = await getAllStages();
      setStages(response?.data || response || []);
    } catch (error) {
      console.error("Load stages error:", error);
    }
  };

  const loadTechnicians = async () => {
    try {
      // Lấy TẤT CẢ kỹ thuật viên, không phân biệt cơ khí hay điện
      const response = await getAllTechnicians();
      console.log("All Technicians Response:", response);

      const techData = response?.data || [];

      console.log("All Technicians Data:", techData);

      // Sử dụng chung một danh sách cho cả 2 dropdown
      setMechanicalTechs(techData);
      setElectricalTechs(techData);

      if (techData.length === 0) {
        console.warn("⚠️ Không có kỹ thuật viên nào!");
        message.warning("Không có kỹ thuật viên nào trong hệ thống");
      } else {
        console.log(`✅ Đã load ${techData.length} kỹ thuật viên`);
      }
    } catch (error) {
      console.error("Load technicians error:", error);
      message.error("Không thể tải danh sách kỹ thuật viên: " + error.message);
    }
  };

  const loadLines = async () => {
    try {
      const response = await lineService.getLines();
      setLines(response?.data || response || []);
    } catch (error) {
      console.error("Load lines error:", error);
    }
  };

  // Xử lý khi chọn Dây chuyền
  const handleLineChange = async (lineId) => {
    setSelectedLine(lineId);
    setSelectedStage(null);
    setFilteredStages([]);
    setFilteredEquipments([]);
    setFilteredTemplates([]);

    // Reset form fields
    planForm.setFieldsValue({
      stageId: undefined,
      equipmentId: undefined,
      templateId: undefined,
    });

    if (lineId) {
      try {
        // Load Stages theo Line
        const stageResponse = await stageService.getStagesByLine(lineId);
        setFilteredStages(stageResponse?.data || []);
      } catch (error) {
        console.error("Load stages by line error:", error);
        message.error("Không thể tải danh sách công đoạn");
      }
    }
  };

  // Xử lý khi chọn Công đoạn
  const handleStageChange = async (stageId) => {
    setSelectedStage(stageId);
    setFilteredEquipments([]);
    setFilteredTemplates([]);

    // Reset form fields
    planForm.setFieldsValue({
      equipmentId: undefined,
      templateId: undefined,
    });

    if (stageId) {
      try {
        // Load Equipment theo Stage
        const allEquipments = equipments;
        const filtered = allEquipments.filter((eq) => eq.stageId === stageId);
        setFilteredEquipments(filtered);

        // Load Templates theo Stage
        const templateResponse = await getTemplatesByStage(stageId);
        setFilteredTemplates(templateResponse?.data || []);
      } catch (error) {
        console.error("Load by stage error:", error);
        message.error("Không thể tải dữ liệu");
      }
    }
  };

  // ===== PLAN MANAGEMENT =====

  const handleAddPlan = () => {
    setEditingPlan(null);
    planForm.resetFields();
    planForm.setFieldsValue({
      startDate: dayjs(),
      intervalType: "Months",
      intervalValue: 1,
    });
    setIsPlanModalVisible(true);
  };

  const handleEditPlan = (record) => {
    setEditingPlan(record);
    planForm.setFieldsValue({
      equipmentId: record.equipmentId,
      templateId: record.templateId,
      intervalType: record.intervalType,
      intervalValue: record.intervalValue,
      startDate: dayjs(record.startDate),
      isActive: record.isActive,
    });
    setIsPlanModalVisible(true);
  };

  const handleDeletePlan = async (record) => {
    try {
      await deleteMaintenancePlan(record.planId);
      message.success("Xóa kế hoạch bảo trì thành công!");
      loadMaintenancePlans();
      loadStats();
    } catch (error) {
      message.error("Xóa kế hoạch thất bại: " + error.message);
    }
  };

  const handlePlanSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingPlan) {
        // Khi EDIT: chỉ cập nhật trạng thái isActive
        await updateMaintenancePlan(editingPlan.planId, {
          equipmentId: editingPlan.equipmentId,
          templateId: editingPlan.templateId,
          intervalType: editingPlan.intervalType,
          intervalValue: editingPlan.intervalValue,
          startDate: editingPlan.startDate,
          isActive: values.isActive ?? true,
        });
        message.success("Cập nhật trạng thái chu kỳ bảo trì thành công!");
      } else {
        // Khi ADD: tạo mới với đầy đủ thông tin
        const planData = {
          equipmentId: values.equipmentId,
          templateId: values.templateId,
          intervalType: values.intervalType,
          intervalValue: values.intervalValue,
          startDate: values.startDate.toISOString(),
        };
        await createMaintenancePlan(planData);
        message.success("Tạo chu kỳ bảo trì thành công!");
      }

      setIsPlanModalVisible(false);
      planForm.resetFields();
      loadMaintenancePlans();
      loadStats();
    } catch (error) {
      message.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== TEMPLATE MANAGEMENT =====

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    templateForm.resetFields();
    setChecklistItems([]);
    setIsTemplateModalVisible(true);
  };

  const handleEditTemplate = (record) => {
    setEditingTemplate(record);
    templateForm.setFieldsValue({
      stageId: record.stageId,
      templateName: record.templateName,
      description: record.description,
      inspectionCode: record.inspectionCode,
      isActive: record.isActive,
    });
    setChecklistItems(record.templateItems || []);
    setIsTemplateModalVisible(true);
  };

  const handleDeleteTemplate = async (record) => {
    try {
      await deleteTemplate(record.templateId);
      message.success("Xóa mẫu bảo trì thành công!");
      loadTemplates();
    } catch (error) {
      message.error("Xóa mẫu bảo trì thất bại: " + error.message);
    }
  };

  const handleTemplateSubmit = async (values) => {
    setLoading(true);
    try {
      const templateData = {
        stageId: values.stageId,
        templateName: values.templateName,
        description: values.description,
        inspectionCode: values.inspectionCode,
        templateItems: checklistItems,
      };

      if (editingTemplate) {
        await updateTemplate(editingTemplate.templateId, {
          ...templateData,
          isActive: values.isActive ?? true,
        });
        message.success("Cập nhật mẫu bảo trì thành công!");
      } else {
        await createTemplate(templateData);
        message.success("Tạo mẫu bảo trì thành công!");
      }

      setIsTemplateModalVisible(false);
      templateForm.resetFields();
      setChecklistItems([]);
      loadTemplates();
    } catch (error) {
      message.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const [newChecklistItem, setNewChecklistItem] = useState({
    stepName: "",
    category: "",
  });

  const handleAddChecklistItemClick = () => {
    if (!newChecklistItem.stepName || !newChecklistItem.category) {
      message.error("Vui lòng nhập đầy đủ thông tin bước kiểm tra");
      return;
    }

    // Tự động set RequiredRole dựa vào Category
    const requiredRole =
      newChecklistItem.category === "Electrical" ? "Electrical" : "Mechanical";

    const newItem = {
      stepName: newChecklistItem.stepName,
      category: newChecklistItem.category,
      requiredRole: requiredRole, // Thêm trường này cho API
      orderIndex: checklistItems.length + 1,
    };
    setChecklistItems([...checklistItems, newItem]);
    setNewChecklistItem({ stepName: "", category: "" });
  };

  const handleRemoveChecklistItem = (index) => {
    const updatedItems = checklistItems
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, orderIndex: idx + 1 }));
    setChecklistItems(updatedItems);
  };

  // ===== EXCEL IMPORT FOR TEMPLATES =====

  const handleDownloadTemplateExcel = async () => {
    try {
      // ✅ Sửa biến môi trường đúng + URL đúng format
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:7003/api";
      window.location.href = `${apiBaseUrl}/maintenance/templates/download-template`;

      message.success("Đang tải Excel mẫu...");
    } catch (error) {
      message.error("Tải Excel mẫu thất bại: " + error.message);
    }
  };

  const [uploadedFile, setUploadedFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  const handleFileChange = (info) => {
    // ✅ Khi beforeUpload return false, file.originFileObj luôn tồn tại
    // Không cần check status vì không có auto upload
    const file = info.file.originFileObj || info.file;
    setUploadedFile(file);
    console.log("✅ File đã chọn:", file.name);
  };

  const handleImportExcel = async () => {
    if (!uploadedFile) {
      message.error("Vui lòng chọn file Excel để import");
      return;
    }

    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const token = localStorage.getItem("token");

      // ✅ Sửa biến môi trường đúng
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:7003/api";

      const response = await fetch(
        `${apiBaseUrl}/maintenance/templates/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        message.success(
          `Import thành công ${result.data.successCount} mẫu bảo trì!`
        );

        if (result.data.errors && result.data.errors.length > 0) {
          Modal.warning({
            title: "Một số lỗi khi import",
            content: (
              <div>
                <p>Đã import thành công {result.data.successCount} mẫu.</p>
                <p>Có {result.data.errorCount} lỗi:</p>
                <ul>
                  {result.data.errors.slice(0, 5).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
                {result.data.errors.length > 5 && (
                  <p>...và {result.data.errors.length - 5} lỗi khác</p>
                )}
              </div>
            ),
          });
        }

        setIsImportModalVisible(false);
        setUploadedFile(null);
        loadTemplates();
      } else {
        message.error(result.message || "Import thất bại");
      }
    } catch (error) {
      message.error("Import thất bại: " + error.message);
    } finally {
      setImportLoading(false);
    }
  };

  // ===== EXCEL IMPORT FOR MAINTENANCE PLANS =====

  const handleDownloadPlanExcel = async () => {
    try {
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:7003/api";
      window.location.href = `${apiBaseUrl}/maintenance/plans/download-template`;

      message.success("Đang tải Excel mẫu Chu kỳ bảo trì...");
    } catch (error) {
      message.error("Tải Excel mẫu thất bại: " + error.message);
    }
  };

  const [uploadedPlanFile, setUploadedPlanFile] = useState(null);
  const [importPlanLoading, setImportPlanLoading] = useState(false);
  const [isPlanImportModalVisible, setIsPlanImportModalVisible] =
    useState(false);

  const handlePlanFileChange = (info) => {
    const file = info.file.originFileObj || info.file;
    setUploadedPlanFile(file);
    console.log("✅ File đã chọn:", file.name);
  };

  const handleImportPlanExcel = async () => {
    if (!uploadedPlanFile) {
      message.error("Vui lòng chọn file Excel để import");
      return;
    }

    setImportPlanLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedPlanFile);

      const token = localStorage.getItem("token");
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:7003/api";

      const response = await fetch(`${apiBaseUrl}/maintenance/plans/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        message.success(
          `Import thành công ${result.data.successCount} chu kỳ bảo trì!`
        );

        if (result.data.errors && result.data.errors.length > 0) {
          Modal.warning({
            title: "Một số lỗi khi import",
            content: (
              <div>
                <p>Đã import thành công {result.data.successCount} chu kỳ.</p>
                <p>Có {result.data.errorCount} lỗi:</p>
                <ul style={{ maxHeight: 300, overflow: "auto" }}>
                  {result.data.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            ),
            width: 600,
          });
        }

        setIsPlanImportModalVisible(false);
        setUploadedPlanFile(null);
        loadMaintenancePlans();
        loadStats();
      } else {
        // Hiển thị lỗi validation chi tiết
        if (result.errors && result.errors.length > 0) {
          Modal.error({
            title: "⛔ Lỗi validation",
            content: (
              <div>
                <p>
                  <strong>{result.message}</strong>
                </p>
                <ul style={{ maxHeight: 400, overflow: "auto" }}>
                  {result.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            ),
            width: 700,
          });
        } else {
          message.error(result.message || "Import thất bại");
        }
      }
    } catch (error) {
      message.error("Import thất bại: " + error.message);
    } finally {
      setImportPlanLoading(false);
    }
  };

  // ===== WORK ORDER MANAGEMENT =====

  const handleCreateWorkOrder = (plan) => {
    setEditingWorkOrder(null);
    setSelectedRecord(plan);
    workOrderForm.resetFields();

    // Nếu có plan (từ tab sắp đến hạn), tự động điền thông tin
    if (plan) {
      // ✅ Xác định scheduledDate MẶC ĐỊNH (ngày đến hạn của plan)
      const defaultScheduledDate = plan.postponedDueDate
        ? dayjs(plan.postponedDueDate)
        : dayjs(plan.nextDueDate);

      workOrderForm.setFieldsValue({
        planId: plan.planId,
        equipmentId: plan.equipmentId,
        templateId: plan.templateId,
        scheduledDate: defaultScheduledDate, // ✅ Giá trị mặc định = NextDueDate
        // Không set assignedTo, để user chọn
      });

      // Load template checklist nếu có
      if (plan.templateId) {
        loadTemplateChecklist(plan.templateId);
      }
    } else {
      workOrderForm.setFieldsValue({
        scheduledDate: dayjs().add(1, "day"),
      });
    }
    setIsWorkOrderModalVisible(true);
  };

  const [templateChecklist, setTemplateChecklist] = useState([]);

  const loadTemplateChecklist = async (templateId) => {
    try {
      const response = await getAllTemplates();
      const template = response?.data?.find((t) => t.templateId === templateId);
      if (template && template.templateItems) {
        setTemplateChecklist(template.templateItems);
      }
    } catch (error) {
      console.error("Load template checklist error:", error);
    }
  };

  const handleEditWorkOrder = (record) => {
    setEditingWorkOrder(record);
    workOrderForm.setFieldsValue({
      dueDate: dayjs(record.dueDate),
      assignedToElectrical: record.assignedToElectrical,
      assignedToMechanical: record.assignedToMechanical,
      // ❌ REMOVED: usageUnit, inspectionCode, repairTime - không sử dụng
      notes: record.notes,
    });
    setIsWorkOrderModalVisible(true);
  };

  const handleWorkOrderSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingWorkOrder) {
        await updateWorkOrder(editingWorkOrder.workOrderId, {
          scheduledDate: values.scheduledDate?.toISOString(),
          assignedToElectrical: values.assignedToElectrical,
          assignedToMechanical: values.assignedToMechanical,
          notes: values.notes,
        });
        message.success("Cập nhật phiếu bảo trì thành công!");
      } else {
        // ✅ Chỉ gửi scheduledDate lên API (ngày bảo trì)
        await createWorkOrder({
          planId: values.planId,
          scheduledDate: values.scheduledDate.toISOString(), // ✅ Ngày bảo trì
          assignedToElectrical: values.assignedToElectrical,
          assignedToMechanical: values.assignedToMechanical,
          notes: values.notes,
        });
        message.success("Tạo phiếu bảo trì thành công!");
      }

      setIsWorkOrderModalVisible(false);
      workOrderForm.resetFields();
      setSelectedRecord(null);
      loadWorkOrders();
      loadPendingWorkOrders();
      loadUpcomingMaintenance();
      loadMaintenancePlans();
      loadStats();
    } catch (error) {
      message.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTechnicians = (record) => {
    setSelectedRecord(record);
    assignForm.setFieldsValue({
      electricalTechnicianId: record.assignedToElectrical,
      mechanicalTechnicianId: record.assignedToMechanical,
    });
    setIsAssignModalVisible(true);
  };

  const handleAssignSubmit = async (values) => {
    setLoading(true);
    try {
      await assignTechnicians(selectedRecord.workOrderId, {
        electricalTechnicianId: values.electricalTechnicianId,
        mechanicalTechnicianId: values.mechanicalTechnicianId,
      });
      message.success("Phân công kỹ thuật viên thành công!");
      setIsAssignModalVisible(false);
      loadWorkOrders();
      loadPendingWorkOrders();
    } catch (error) {
      message.error("Phân công thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWorkOrder = (record) => {
    Modal.confirm({
      title: "Hủy phiếu bảo trì",
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn hủy phiếu bảo trì{" "}
            <strong>{record.workOrderCode}</strong>?
          </p>
          <Input.TextArea
            id="cancelReason"
            placeholder="Nhập lý do hủy..."
            rows={3}
          />
        </div>
      ),
      okText: "Hủy phiếu",
      cancelText: "Đóng",
      okButtonProps: { danger: true },
      onOk: async () => {
        const reason = document.getElementById("cancelReason")?.value;
        if (!reason) {
          message.error("Vui lòng nhập lý do hủy");
          return Promise.reject();
        }
        try {
          await cancelWorkOrder(record.workOrderId, reason);
          message.success("Hủy phiếu bảo trì thành công!");
          loadWorkOrders();
          loadStats();
        } catch (error) {
          message.error("Hủy phiếu thất bại: " + error.message);
          return Promise.reject();
        }
      },
    });
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  // ===== ASSIGN MULTIPLE TECHNICIANS =====

  const handleAssignMultipleTechnicians = (record) => {
    setSelectedRecord(record);
    // Load existing assignments
    const existingAssignments = record.assignedTechnicians || [];
    multiAssignForm.setFieldsValue({
      technicians: existingAssignments.map((t) => ({
        technicianId: t.technicianId,
        technicianType: t.technicianType,
      })),
    });
    setAssigningTechnicians(
      existingAssignments.map((t) => ({
        technicianId: t.technicianId,
        technicianType: t.technicianType,
        fullName: t.fullName,
        employeeCode: t.employeeCode,
      }))
    );
    setIsAssignMultipleModalVisible(true);
  };

  // ===== POSTPONE MAINTENANCE =====

  const handlePostponeMaintenance = (record) => {
    setSelectedRecord(record);
    postponeForm.resetFields();
    setIsPostponeModalVisible(true);
  };

  const handlePostponeSubmit = async (values) => {
    setLoading(true);
    try {
      await postponeMaintenancePlan(selectedRecord.planId, {
        postponeDays: values.postponeDays,
        reason: values.reason,
      });
      message.success(`Hoãn bảo trì thành công ${values.postponeDays} ngày!`);
      setIsPostponeModalVisible(false);
      postponeForm.resetFields();
      loadUpcomingMaintenance();
      loadMaintenancePlans();
      loadStats();
    } catch (error) {
      message.error("Hoãn bảo trì thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTechnician = () => {
    const newTech = { technicianId: "", technicianType: "" };
    setAssigningTechnicians([...assigningTechnicians, newTech]);
  };

  const handleRemoveTechnician = (index) => {
    const updated = assigningTechnicians.filter((_, i) => i !== index);
    setAssigningTechnicians(updated);
  };

  const handleTechnicianChange = (index, field, value) => {
    const updated = [...assigningTechnicians];
    updated[index][field] = value;

    // Auto-fill name and code when selecting technician
    if (field === "technicianId") {
      const allTechs = [...mechanicalTechs, ...electricalTechs];
      const selected = allTechs.find((t) => t.userId === value);
      if (selected) {
        updated[index].fullName = selected.fullName;
        updated[index].employeeCode = selected.employeeCode;
      }
    }

    setAssigningTechnicians(updated);
  };

  const handleMultiAssignSubmit = async () => {
    // Validate
    const hasEmpty = assigningTechnicians.some(
      (t) => !t.technicianId || !t.technicianType
    );
    if (hasEmpty) {
      message.error("Vui lòng chọn đầy đủ thông tin cho tất cả kỹ thuật viên");
      return;
    }

    setLoading(true);
    try {
      await assignMultipleTechnicians(selectedRecord.planId, {
        technicians: assigningTechnicians.map((t) => ({
          technicianId: t.technicianId,
          technicianType: t.technicianType,
        })),
      });
      message.success("Phân công nhiều kỹ thuật viên thành công!");
      setIsAssignMultipleModalVisible(false);
      setAssigningTechnicians([]);
      loadUpcomingMaintenance();
      loadMaintenancePlans();
    } catch (error) {
      message.error("Phân công thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== RENDERING HELPERS =====

  const getStatusTag = (status) => {
    const statusConfig = {
      Pending: {
        color: "gold",
        icon: <ClockCircleOutlined />,
        text: "Chờ xử lý",
      },
      InProgress: {
        color: "blue",
        icon: <PlayCircleOutlined />,
        text: "Đang thực hiện",
      },
      Completed: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      Cancelled: { color: "red", icon: <StopOutlined />, text: "Đã hủy" },
      Overdue: { color: "error", icon: <WarningOutlined />, text: "Quá hạn" },
    };
    const config = statusConfig[status] || statusConfig.Pending;
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  const getPlanStatusTag = (plan) => {
    // Nếu không hoạt động (đã tắt)
    if (!plan.isActive) {
      return (
        <Tag color="default" icon={<StopOutlined />}>
          Không hoạt động
        </Tag>
      );
    }

    // Kiểm tra xem plan có bị hoãn không
    if (plan.status === "Postponed" || plan.postponedReason) {
      return (
        <Tag icon={<ClockCircleOutlined />} color="purple">
          Đã hoãn bảo trì
        </Tag>
      );
    }

    // Kiểm tra xem có WorkOrder active không
    if (plan.hasActiveWorkOrder || plan.status === "InProgress") {
      return (
        <Tag icon={<PlayCircleOutlined />} color="blue">
          Đang thực hiện
        </Tag>
      );
    }

    const daysUntilDue = plan.daysUntilDue || 0;

    if (daysUntilDue < 0) {
      return (
        <Tag icon={<WarningOutlined />} color="error">
          Quá hạn
        </Tag>
      );
    } else if (daysUntilDue <= 3) {
      return (
        <Tag icon={<ClockCircleOutlined />} color="red">
          Gấp
        </Tag>
      );
    } else if (daysUntilDue <= 7) {
      return (
        <Tag icon={<ClockCircleOutlined />} color="orange">
          Sắp đến hạn
        </Tag>
      );
    } else {
      return (
        <Tag icon={<CheckCircleOutlined />} color="green">
          Đang hoạt động
        </Tag>
      );
    }
  };

  const planColumns = [
    {
      title: "Mã KH",
      dataIndex: "planId",
      key: "planId",
      width: 80,
      render: (id) => `PLAN${String(id).padStart(3, "0")}`,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 180,
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.equipmentCode}
          </Text>
        </div>
      ),
    },
    {
      title: "Vị trí",
      key: "location",
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.lineName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.stageName}
          </Text>
        </div>
      ),
    },
    {
      title: "Chu kỳ",
      key: "interval",
      width: 120,
      render: (_, record) => {
        const intervalTypeMap = {
          Days: "ngày",
          days: "ngày",
          Months: "tháng",
          months: "tháng",
          Hours: "giờ",
          hours: "giờ",
          UsageCycles: "chu kỳ",
          usagecycles: "chu kỳ",
        };
        return (
          <span>
            {record.intervalValue}{" "}
            {intervalTypeMap[record.intervalType] || "chu kỳ"}
          </span>
        );
      },
    },
    {
      title: "Ngày đến hạn",
      dataIndex: "nextDueDate",
      key: "nextDueDate",
      width: 130,
      render: (date, record) => {
        const today = dayjs();
        // Sử dụng PostponedDueDate nếu có, không thì dùng NextDueDate
        const effectiveDueDate = record.postponedDueDate
          ? dayjs(record.postponedDueDate)
          : dayjs(date);
        const daysUntilDue = effectiveDueDate.diff(today, "day");
        const isOverdue = daysUntilDue < 0;
        const isUpcomingSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

        return (
          <div>
            <div
              style={{
                color: isOverdue
                  ? "#ff4d4f"
                  : isUpcomingSoon
                  ? "#faad14"
                  : "inherit",
                fontWeight: isOverdue || isUpcomingSoon ? "bold" : "normal",
              }}
            >
              {effectiveDueDate.format("DD/MM/YYYY")}
            </div>
            {record.daysUntilDue !== null && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.daysUntilDue > 0
                  ? `Còn ${record.daysUntilDue} ngày`
                  : record.daysUntilDue === 0
                  ? "Hôm nay"
                  : `Quá ${Math.abs(record.daysUntilDue)} ngày`}
              </Text>
            )}
            {record.postponedDueDate && (
              <div>
                <Tag color="purple" style={{ fontSize: 10, marginTop: 4 }}>
                  Đã hoãn từ {dayjs(date).format("DD/MM/YYYY")}
                </Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      render: (_, record) => getPlanStatusTag(record),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chi tiết">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditPlan(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => handleDeletePlan(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const templateColumns = [
    {
      title: "Mã Template",
      dataIndex: "templateId",
      key: "templateId",
      width: 80,
      render: (id) => `TPL${String(id).padStart(3, "0")}`,
    },
    {
      title: "Tên Template",
      dataIndex: "templateName",
      key: "templateName",
      width: 180,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 250,
    },
    {
      title: "Mã kiểm tra",
      dataIndex: "inspectionCode",
      key: "inspectionCode",
      width: 120,
    },
    {
      title: "Công đoạn",
      dataIndex: "stageName",
      key: "stageName",
      width: 150,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      render: (_, record) => (
        <Tag color={record.isActive ? "green" : "default"}>
          {record.isActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditTemplate(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => handleDeleteTemplate(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const workOrderColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "workOrderId",
      key: "workOrderId",
      width: 120,
      render: (id, record) => {
        const sparePartCount = workOrderSparePartRequests[id] || 0;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>{`WO${String(id).padStart(3, "0")}`}</span>
            {sparePartCount > 0 && (
              <Tooltip title={`${sparePartCount} yêu cầu linh kiện chờ duyệt`}>
                <div
                  style={{
                    backgroundColor: "#ff4d4f",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "pulse 2s infinite",
                    boxShadow: "0 0 8px rgba(255, 77, 79, 0.5)",
                  }}
                >
                  <PushpinOutlined
                    style={{
                      color: "white",
                      fontSize: "12px",
                    }}
                  />
                </div>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 180,
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.equipmentCode}
          </Text>
        </div>
      ),
    },
    {
      title: "Ngày đến hạn",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 130,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Người phụ trách",
      key: "assignedTechnicians",
      width: 200,
      render: (_, record) => {
        const hasElectrical = record.electricalTechnicianName;
        const hasMechanical = record.mechanicalTechnicianName;
        const isInProgress = record.status === "InProgress";

        if (!hasElectrical && !hasMechanical) {
          return <Text type="secondary">Chưa phân công</Text>;
        }

        return (
          <div>
            {hasElectrical && (
              <div style={{ marginBottom: 4 }}>
                <ThunderboltOutlined
                  style={{ color: "#1890ff", marginRight: 4 }}
                />
                <Text style={{ fontSize: 12 }}>
                  {record.electricalTechnicianName}
                  {record.electricalEmployeeCode && (
                    <Text type="secondary">
                      {" "}
                      ({record.electricalEmployeeCode})
                    </Text>
                  )}
                </Text>
                {isInProgress && (
                  <Tag
                    color="processing"
                    style={{ marginLeft: 8, fontSize: 10 }}
                  >
                    Đang thực hiện
                  </Tag>
                )}
              </div>
            )}
            {hasMechanical && (
              <div>
                <ToolOutlined style={{ color: "#52c41a", marginRight: 4 }} />
                <Text style={{ fontSize: 12 }}>
                  {record.mechanicalTechnicianName}
                  {record.mechanicalEmployeeCode && (
                    <Text type="secondary">
                      {" "}
                      ({record.mechanicalEmployeeCode})
                    </Text>
                  )}
                </Text>
                {isInProgress && (
                  <Tag
                    color="processing"
                    style={{ marginLeft: 8, fontSize: 10 }}
                  >
                    Đang thực hiện
                  </Tag>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => {
        const sparePartCount =
          workOrderSparePartRequests[record.workOrderId] || 0;
        const isFinished =
          record.status === "Completed" ||
          record.status === "Cancelled" ||
          record.status === "InProgress";

        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "Chi tiết",
            onClick: () => handleViewDetail(record),
          },
          !isFinished && {
            key: "assign",
            icon: <UserAddOutlined />,
            label: "Giao việc",
            onClick: () => handleAssignTechnicians(record),
          },
          sparePartCount > 0 && {
            key: "spare-parts",
            icon: <PushpinOutlined style={{ color: "#ff4d4f" }} />,
            label: `Linh kiện chờ duyệt (${sparePartCount})`,
            onClick: () => handleViewDetail(record),
          },
          !isFinished && {
            key: "cancel",
            icon: <StopOutlined />,
            label: "Hủy",
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: "Xác nhận hủy?",
                okText: "Hủy",
                cancelText: "Đóng",
                onOk: () => handleCancelWorkOrder(record),
              });
            },
          },
        ].filter(Boolean);

        return (
          <Dropdown
            menu={{ items: menuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button
              type="text"
              icon={<DownOutlined style={{ fontSize: 14 }} />}
              size="small"
            />
          </Dropdown>
        );
      },
    },
  ];

  const filteredPlans = maintenancePlans.filter(
    (plan) =>
      plan.equipmentName?.toLowerCase().includes(searchText.toLowerCase()) ||
      plan.assignedToName?.toLowerCase().includes(searchText.toLowerCase()) ||
      plan.equipmentCode?.toLowerCase().includes(searchText.toLowerCase())
  );

  const searchedTemplates = templates.filter(
    (template) =>
      template.templateName?.toLowerCase().includes(searchText.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      template.inspectionCode?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Apply filters and sorting for Work Orders
  const getFilteredAndSortedWorkOrders = () => {
    let filtered = workOrders.filter(
      (order) =>
        order.equipmentName?.toLowerCase().includes(searchText.toLowerCase()) ||
        order.electricalTechnicianName
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        order.mechanicalTechnicianName
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        order.equipmentCode?.toLowerCase().includes(searchText.toLowerCase())
    );

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Filter by technician
    if (technicianFilter !== "all") {
      filtered = filtered.filter(
        (order) =>
          order.assignedToElectrical === technicianFilter ||
          order.assignedToMechanical === technicianFilter
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.assignedDate) - new Date(a.assignedDate);
        case "oldest":
          return new Date(a.assignedDate) - new Date(b.assignedDate);
        case "dueSoon":
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "dueDate":
          return new Date(b.dueDate) - new Date(a.dueDate);
        default:
          return 0;
      }
    });

    return sorted;
  };

  // Tab: Maintenance Plans
  const MaintenancePlansTab = (
    <Card title="Chu kỳ bảo trì" bordered={false}>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng chu kỳ"
              value={stats.totalPlans}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Đang hoạt động"
              value={stats.activePlans}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Đến hạn tuần này"
              value={stats.dueThisWeek}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Quá hạn"
              value={stats.overdueWorkOrders}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Search
              placeholder="Tìm theo thiết bị, mã thiết bị hoặc người phụ trách"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: "right" }}>
            <Space>
              <Button
                type="button"
                icon={<DownloadOutlined />}
                onClick={handleDownloadPlanExcel}
              >
                Tải Excel mẫu
              </Button>
              <Button
                type="button"
                icon={<UploadOutlined />}
                onClick={() => setIsPlanImportModalVisible(true)}
              >
                Import từ Excel
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddPlan}
              >
                Thêm chu kỳ bảo trì
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={planColumns}
          dataSource={filteredPlans}
          rowKey="planId"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} chu kỳ`,
          }}
        />
      </Space>

      {/* Import Plan Modal */}
      <Modal
        title="Import Chu kỳ bảo trì từ Excel"
        open={isPlanImportModalVisible}
        onCancel={() => {
          setIsPlanImportModalVisible(false);
          setUploadedPlanFile(null);
        }}
        footer={null}
        width={600}
      >
        <Upload
          accept=".xlsx"
          beforeUpload={() => false}
          onChange={handlePlanFileChange}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
        </Upload>
        {uploadedPlanFile && (
          <div style={{ marginTop: 16 }}>
            <Text strong>File đã chọn:</Text> {uploadedPlanFile.name}
          </div>
        )}
        <div style={{ marginTop: 24, textAlign: "right" }}>
          <Button
            onClick={() => {
              setIsPlanImportModalVisible(false);
              setUploadedPlanFile(null);
            }}
            style={{ marginRight: 8 }}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleImportPlanExcel}
            loading={importPlanLoading}
          >
            Import
          </Button>
        </div>
      </Modal>
    </Card>
  );

  // Tab: Templates
  const TemplatesTab = (
    <Card title="Mẫu bảo trì" bordered={false}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Search
              placeholder="Tìm theo tên mẫu bảo trì, mô tả hoặc mã kiểm tra"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: "right" }}>
            <Space>
              <Button
                type="button"
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplateExcel}
              >
                Tải Excel mẫu
              </Button>
              <Button
                type="button"
                icon={<UploadOutlined />}
                onClick={() => setIsImportModalVisible(true)}
              >
                Import từ Excel
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTemplate}
              >
                Thêm mẫu bảo trì
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={templateColumns}
          dataSource={searchedTemplates}
          rowKey="templateId"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} mẫu bảo trì`,
          }}
        />
      </Space>

      {/* Import Modal */}
      <Modal
        title="Import Mẫu Bảo Trì từ Excel"
        open={isImportModalVisible}
        onCancel={() => {
          setIsImportModalVisible(false);
          setUploadedFile(null);
        }}
        footer={null}
        width={600}
      >
        <Upload
          accept=".xlsx"
          beforeUpload={() => false}
          onChange={handleFileChange}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
        </Upload>
        {uploadedFile && (
          <div style={{ marginTop: 16 }}>
            <Text strong>File đã chọn:</Text> {uploadedFile.name}
          </div>
        )}
        <div style={{ marginTop: 24, textAlign: "right" }}>
          <Button
            onClick={() => {
              setIsImportModalVisible(false);
              setUploadedFile(null);
            }}
            style={{ marginRight: 8 }}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleImportExcel}
            loading={importLoading}
          >
            Import
          </Button>
        </div>
      </Modal>
    </Card>
  );

  // Tab: Work Orders
  const WorkOrdersTab = (
    <Card title="Phiếu bảo trì" bordered={false}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Row gutter={16}>
          <Col xs={24} md={6}>
            <Search
              placeholder="Tìm theo thiết bị, mã thiết bị hoặc người phụ trách"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={5}>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="Pending">Chờ xử lý</Option>
              <Option value="InProgress">Đang thực hiện</Option>
              <Option value="Completed">Hoàn thành</Option>
              <Option value="Cancelled">Đã hủy</Option>
              <Option value="Overdue">Quá hạn</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Người phụ trách"
              value={technicianFilter}
              onChange={setTechnicianFilter}
              style={{ width: "100%" }}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option value="all">Tất cả KTV</Option>
              {[...mechanicalTechs, ...electricalTechs].map((tech) => (
                <Option key={tech.userId} value={tech.userId}>
                  {tech.fullName} ({tech.employeeCode})
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={5}>
            <Select
              placeholder="Sắp xếp"
              value={sortOrder}
              onChange={setSortOrder}
              style={{ width: "100%" }}
            >
              <Option value="newest">Mới nhất</Option>
              <Option value="oldest">Cũ nhất</Option>
              <Option value="dueSoon">Gần đến hạn nhất</Option>
              <Option value="dueDate">Hạn xa nhất</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={workOrderColumns}
          dataSource={getFilteredAndSortedWorkOrders()}
          rowKey="workOrderId"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phiếu`,
          }}
        />
      </Space>
    </Card>
  );

  // Tab: Upcoming Maintenance
  const UpcomingMaintenanceTab = (
    <Card title="Bảo trì sắp đến hạn" bordered={false}>
      <Table
        columns={[
          ...planColumns.filter((col) => col.key !== "action"), // Loại bỏ cột action cũ
          {
            title: "Thao tác",
            key: "action",
            fixed: "right",
            width: 200,
            render: (_, record) => (
              <Space size="small">
                <Tooltip title="Chi tiết">
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(record)}
                  />
                </Tooltip>
                <Tooltip title="Tạo phiếu bảo trì">
                  <Button
                    type="primary"
                    size="small"
                    icon={<FileTextOutlined />}
                    onClick={() => handleCreateWorkOrder(record)}
                  >
                    Tạo phiếu
                  </Button>
                </Tooltip>
                <Tooltip title="Hoãn">
                  <Button
                    type="link"
                    size="small"
                    icon={<ClockCircleOutlined />}
                    onClick={() => handlePostponeMaintenance(record)}
                  />
                </Tooltip>
              </Space>
            ),
          },
        ]}
        dataSource={upcomingMaintenance}
        rowKey="planId"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} kế hoạch`,
        }}
      />
    </Card>
  );

  const items = [
    {
      key: "plans",
      label: "Chu kỳ bảo trì",
      children: MaintenancePlansTab,
    },
    {
      key: "upcoming",
      label: "Lịch bảo trì sắp tới",
      children: UpcomingMaintenanceTab,
    },
    {
      key: "workOrders",
      label: "Phiếu bảo trì",
      children: WorkOrdersTab,
    },
    {
      key: "templates",
      label: "Mẫu hướng dẫn bảo trì",
      children: TemplatesTab,
    },
  ];

  // ===== REAL-TIME SIGNALR INTEGRATION =====

  useEffect(() => {
    if (!isConnected) return;

    console.log("✅ Setting up SignalR listeners for TechManager...");

    // 1. Lắng nghe khi Technician bắt đầu công việc
    const unsubscribeStarted = subscribe("WorkOrderStarted", (workOrder) => {
      console.log("📢 TechManager received: WorkOrder started", workOrder);

      // Tự động reload Work Orders
      loadWorkOrders();
      loadStats();

      // Cập nhật trạng thái trong danh sách hiện tại
      setWorkOrders((prev) =>
        prev.map((wo) =>
          wo.workOrderId === workOrder.workOrderId
            ? {
                ...wo,
                status: "InProgress",
                startedDate: new Date().toISOString(),
              }
            : wo
        )
      );
    });

    // 2. Lắng nghe khi Technician hoàn thành công việc
    const unsubscribeCompleted = subscribe(
      "WorkOrderCompleted",
      (workOrder) => {
        console.log("📢 TechManager received: WorkOrder completed", workOrder);

        // Tự động reload
        loadWorkOrders();
        loadStats();
        loadUpcomingMaintenance();
        loadMaintenancePlans();

        // Cập nhật trạng thái
        setWorkOrders((prev) =>
          prev.map((wo) =>
            wo.workOrderId === workOrder.workOrderId
              ? {
                  ...wo,
                  status: "Completed",
                  completedDate: new Date().toISOString(),
                }
              : wo
          )
        );
      }
    );

    // 3. Lắng nghe khi Technician cập nhật checklist
    const unsubscribeChecklist = subscribe("ChecklistItemUpdated", (data) => {
      console.log("📢 TechManager received: Checklist updated", data);

      // ✅ Reload toàn bộ WorkOrder để đảm bảo có data mới nhất
      if (data.workOrderId) {
        loadWorkOrders();
      }

      // Nếu đang mở modal chi tiết, cập nhật real-time
      if (selectedRecord && selectedRecord.workOrderId === data.workOrderId) {
        console.log("🔄 Updating selectedRecord checklist in real-time");

        setSelectedRecord((prev) => {
          if (!prev || !prev.checklistItems) return prev;

          return {
            ...prev,
            checklistItems: prev.checklistItems.map((item) => {
              if (
                item.checklistId === data.checklistItemId ||
                item.checklistId === data.checklistId
              ) {
                console.log(
                  `✅ Found matching item: ${item.checklistId} - Updating to isChecked=${data.isChecked}`
                );
                return {
                  ...item,
                  isChecked: data.isChecked,
                  notes: data.notes || item.notes,
                  completedBy: data.completedBy,
                  completedDate: data.completedDate,
                  completedByName: data.completedByName,
                };
              }
              return item;
            }),
          };
        });

        // ✅ KHÔNG hiển thị popup notification nữa - chỉ update modal
      }
    });

    // 4. Lắng nghe yêu cầu hỗ trợ từ Technician
    const unsubscribeHelp = subscribe("TechnicianRequestHelp", (request) => {
      console.log("📢 TechManager received: Technician request help", request);

      // Hiển thị modal hoặc notification đặc biệt
      Modal.warning({
        title: "🆘 Yêu cầu hỗ trợ",
        content: (
          <div>
            <p>
              <strong>Kỹ thuật viên:</strong> {request.technicianName}
            </p>
            <p>
              <strong>Thiết bị:</strong> {request.equipmentName}
            </p>
            <p>
              <strong>Lý do:</strong> {request.reason}
            </p>
            <p>
              <strong>Loại:</strong> {request.helpType}
            </p>
          </div>
        ),
        okText: "Đã hiểu",
      });
    });

    // Cleanup khi component unmount
    return () => {
      unsubscribeStarted();
      unsubscribeCompleted();
      unsubscribeChecklist();
      unsubscribeHelp();
      console.log("🧹 Cleaned up SignalR listeners for TechManager");
    };
  }, [isConnected, subscribe, selectedRecord]);

  // ===== AUTO REFRESH khi có thay đổi =====

  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to general data updates
    const unsubscribeDataUpdate = subscribe("DataUpdated", (data) => {
      console.log("📢 Data updated event:", data.type);

      // Reload dựa theo loại dữ liệu thay đổi
      if (data.type === "MaintenancePlan") {
        loadMaintenancePlans();
        loadStats();
      } else if (data.type === "WorkOrder") {
        loadWorkOrders();
        loadPendingWorkOrders();
        loadStats();
      } else if (data.type === "Template") {
        loadTemplates();
      } else if (data.type === "UpcomingMaintenance") {
        loadUpcomingMaintenance();
      }
    });

    // Subscribe to spare part requests
    const unsubscribeSparePartRequest = subscribe(
      "SparePartRequest",
      (data) => {
        console.log("📦 Spare part request event:", data);
        // Reload work orders để cập nhật badge yêu cầu linh kiện
        loadWorkOrders();
      }
    );

    return () => {
      unsubscribeDataUpdate();
      unsubscribeSparePartRequest();
    };
  }, [isConnected, subscribe]);

  return (
    <div className={styles.container}>
      <Tabs
        items={items}
        activeKey={activeTab}
        onChange={setActiveTab}
        defaultActiveKey="plans"
      />

      {/* Plan Modal */}
      <Modal
        title={
          editingPlan
            ? "Cập nhật trạng thái chu kỳ bảo trì"
            : "Thêm chu kỳ bảo trì mới"
        }
        open={isPlanModalVisible}
        onCancel={() => {
          setIsPlanModalVisible(false);
          planForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={planForm} layout="vertical" onFinish={handlePlanSubmit}>
          {editingPlan ? (
            // Khi EDIT: chỉ cho phép thay đổi trạng thái Active/Inactive
            <>
              <Alert
                message="Chế độ chỉnh sửa trạng thái"
                description={
                  <Descriptions bordered column={2} style={{ marginTop: 16 }}>
                    <Descriptions.Item label="Thiết bị" span={2}>
                      {editingPlan.equipmentName} ({editingPlan.equipmentCode})
                    </Descriptions.Item>
                    <Descriptions.Item label="Vị trí" span={2}>
                      {editingPlan.lineName} - {editingPlan.stageName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Chu kỳ" span={2}>
                      {editingPlan.intervalValue}{" "}
                      {editingPlan.intervalType === "Days"
                        ? "ngày"
                        : editingPlan.intervalType === "Months"
                        ? "tháng"
                        : editingPlan.intervalType === "Hours"
                        ? "giờ"
                        : "chu kỳ"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">
                      {dayjs(editingPlan.startDate).format("DD/MM/YYYY")}
                    </Descriptions.Item>
                  </Descriptions>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form.Item
                name="isActive"
                label="Trạng thái hoạt động"
                valuePropName="checked"
                initialValue={editingPlan.isActive}
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Không hoạt động"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                  <Button
                    onClick={() => {
                      setIsPlanModalVisible(false);
                      planForm.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Cập nhật trạng thái
                  </Button>
                </Space>
              </Form.Item>
            </>
          ) : (
            // Khi ADD: hiển thị form đầy đủ để tạo mới
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="lineId"
                    label="Dây chuyền"
                    rules={[
                      { required: true, message: "Vui lòng chọn dây chuyền" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn dây chuyền"
                      onChange={handleLineChange}
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {lines.map((line) => (
                        <Option key={line.lineId} value={line.lineId}>
                          {line.lineName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="stageId"
                    label="Công đoạn"
                    rules={[
                      { required: true, message: "Vui lòng chọn công đoạn" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn công đoạn"
                      onChange={handleStageChange}
                      disabled={!selectedLine}
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {filteredStages.map((stage) => (
                        <Option key={stage.stageId} value={stage.stageId}>
                          {stage.stageName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="equipmentId"
                    label="Thiết bị"
                    rules={[
                      { required: true, message: "Vui lòng chọn thiết bị" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn thiết bị"
                      disabled={!selectedStage}
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {filteredEquipments.map((equipment) => (
                        <Option
                          key={equipment.equipmentId}
                          value={equipment.equipmentId}
                        >
                          {equipment.equipmentName} - {equipment.equipmentCode}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="templateId"
                    label="Mẫu bảo trì"
                    rules={[
                      { required: true, message: "Vui lòng chọn mẫu bảo trì" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn mẫu bảo trì"
                      disabled={!selectedStage}
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {filteredTemplates.map((template) => (
                        <Option
                          key={template.templateId}
                          value={template.templateId}
                        >
                          {template.templateName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="intervalValue"
                    label="Giá trị chu kỳ"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập giá trị chu kỳ",
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: "100%" }}
                      placeholder="Nhập số"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="intervalType"
                    label="Loại chu kỳ"
                    rules={[
                      { required: true, message: "Vui lòng chọn loại chu kỳ" },
                    ]}
                  >
                    <Select placeholder="Chọn loại chu kỳ">
                      <Option value="Days">Ngày</Option>
                      <Option value="Months">Tháng</Option>
                      <Option value="Hours">Giờ</Option>
                      <Option value="UsageCycles">Chu kỳ sử dụng</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="startDate"
                    label="Ngày bắt đầu"
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                    ]}
                  >
                    <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                  <Button
                    onClick={() => {
                      setIsPlanModalVisible(false);
                      planForm.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Thêm mới
                  </Button>
                </Space>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* Template Modal */}
      <Modal
        title={
          editingTemplate ? "Cập nhật mẫu bảo trì" : "Thêm mẫu bảo trì mới"
        }
        open={isTemplateModalVisible}
        onCancel={() => {
          setIsTemplateModalVisible(false);
          templateForm.resetFields();
          setChecklistItems([]);
        }}
        footer={null}
        width={1000}
      >
        <Form
          form={templateForm}
          layout="vertical"
          onFinish={handleTemplateSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stageId"
                label="Công đoạn"
                rules={[{ required: true, message: "Vui lòng chọn công đoạn" }]}
              >
                <Select
                  placeholder="Chọn công đoạn"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {stages.map((stage) => (
                    <Option key={stage.stageId} value={stage.stageId}>
                      {stage.stageName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="templateName"
                label="Tên mẫu bảo trì"
                rules={[
                  { required: true, message: "Vui lòng nhập tên mẫu bảo trì" },
                ]}
              >
                <Input placeholder="Nhập tên mẫu bảo trì" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="description" label="Mô tả">
                <TextArea rows={3} placeholder="Nhập mô tả (tùy chọn)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="inspectionCode" label="Mã kiểm tra">
                <Input placeholder="Nhập mã kiểm tra (tùy chọn)" />
              </Form.Item>
            </Col>
          </Row>

          {editingTemplate && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Trạng thái"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Không hoạt động"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Divider>Danh sách công việc kiểm tra</Divider>

          {/* Form thêm bước mới */}
          <Card
            size="small"
            style={{ marginBottom: 16, backgroundColor: "#f5f5f5" }}
          >
            <Row gutter={16} align="bottom">
              <Col span={12}>
                <Input
                  placeholder="Tên bước kiểm tra"
                  value={newChecklistItem.stepName}
                  onChange={(e) =>
                    setNewChecklistItem({
                      ...newChecklistItem,
                      stepName: e.target.value,
                    })
                  }
                />
              </Col>
              <Col span={8}>
                <Select
                  placeholder="Loại công việc"
                  value={newChecklistItem.category}
                  onChange={(value) =>
                    setNewChecklistItem({
                      ...newChecklistItem,
                      category: value,
                    })
                  }
                  style={{ width: "100%" }}
                >
                  <Option value="Electrical">
                    <ThunderboltOutlined /> Điện
                  </Option>
                  <Option value="Mechanical">
                    <ToolOutlined /> Cơ khí
                  </Option>
                </Select>
              </Col>
              <Col span={4}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  block
                  onClick={handleAddChecklistItemClick}
                >
                  Thêm
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Hiển thị danh sách theo 2 cột: Điện và Cơ khí */}
          <Row gutter={16}>
            <Col span={12}>
              <Card
                title={
                  <span style={{ color: "#1890ff" }}>
                    <ThunderboltOutlined /> Công việc Điện (
                    {
                      checklistItems.filter(
                        (item) => item.category === "Electrical"
                      ).length
                    }
                    )
                  </span>
                }
                size="small"
                style={{ minHeight: 300 }}
              >
                {checklistItems.filter((item) => item.category === "Electrical")
                  .length > 0 ? (
                  <List
                    size="small"
                    dataSource={checklistItems.filter(
                      (item) => item.category === "Electrical"
                    )}
                    renderItem={(item, index) => (
                      <List.Item
                        actions={[
                          <Tooltip title="Xóa">
                            <Button
                              type="link"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                handleRemoveChecklistItem(
                                  checklistItems.indexOf(item)
                                )
                              }
                            />
                          </Tooltip>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Badge
                              count={index + 1}
                              style={{ backgroundColor: "#1890ff" }}
                            />
                          }
                          title={item.stepName}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có công việc điện"
                    style={{ padding: "40px 0" }}
                  />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title={
                  <span style={{ color: "#52c41a" }}>
                    <ToolOutlined /> Công việc Cơ khí (
                    {
                      checklistItems.filter(
                        (item) => item.category === "Mechanical"
                      ).length
                    }
                    )
                  </span>
                }
                size="small"
                style={{ minHeight: 300 }}
              >
                {checklistItems.filter((item) => item.category === "Mechanical")
                  .length > 0 ? (
                  <List
                    size="small"
                    dataSource={checklistItems.filter(
                      (item) => item.category === "Mechanical"
                    )}
                    renderItem={(item, index) => (
                      <List.Item
                        actions={[
                          <Tooltip title="Xóa">
                            <Button
                              type="link"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                handleRemoveChecklistItem(
                                  checklistItems.indexOf(item)
                                )
                              }
                            />
                          </Tooltip>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Badge
                              count={index + 1}
                              style={{ backgroundColor: "#52c41a" }}
                            />
                          }
                          title={item.stepName}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có công việc cơ khí"
                    style={{ padding: "40px 0" }}
                  />
                )}
              </Card>
            </Col>
          </Row>

          <Divider />

          <Alert
            message={`Tổng cộng: ${checklistItems.length} bước kiểm tra (${
              checklistItems.filter((i) => i.category === "Electrical").length
            } điện + ${
              checklistItems.filter((i) => i.category === "Mechanical").length
            } cơ khí)`}
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setIsTemplateModalVisible(false);
                  templateForm.resetFields();
                  setChecklistItems([]);
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={checklistItems.length === 0}
              >
                {editingTemplate ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Work Order Modal */}
      <Modal
        title={
          selectedRecord && !editingWorkOrder
            ? "Tạo phiếu bảo trì"
            : "Cập nhật phiếu bảo trì"
        }
        open={isWorkOrderModalVisible}
        onCancel={() => {
          setIsWorkOrderModalVisible(false);
          workOrderForm.resetFields();
          setTemplateChecklist([]);
        }}
        footer={null}
        width={1000}
      >
        <Form
          form={workOrderForm}
          layout="vertical"
          onFinish={handleWorkOrderSubmit}
        >
          {selectedRecord && !editingWorkOrder ? (
            // Khi TẠO từ plan: chỉ cho chọn kỹ thuật viên, hiển thị READ-ONLY thông tin khác
            <>
              <Alert
                message="Tạo phiếu bảo trì từ chu kỳ"
                description="Vui lòng chọn ngày bảo trì và phân công kỹ thuật viên."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
                <Descriptions.Item label="Thiết bị" span={2}>
                  <Text strong>{selectedRecord.equipmentName}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    ({selectedRecord.equipmentCode})
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Vị trí" span={2}>
                  {selectedRecord.lineName} - {selectedRecord.stageName}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày đến hạn (DueDate)" span={2}>
                  <Text strong style={{ color: "#ff4d4f" }}>
                    {selectedRecord.postponedDueDate
                      ? dayjs(selectedRecord.postponedDueDate).format(
                          "DD/MM/YYYY"
                        )
                      : dayjs(selectedRecord.nextDueDate).format("DD/MM/YYYY")}
                  </Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    (Ngày bảo trì phải trước hoặc bằng ngày này)
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              {/* Hidden fields để submit planId, equipmentId, templateId */}
              <Form.Item name="planId" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="equipmentId" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="templateId" hidden>
                <Input />
              </Form.Item>

              <Divider>Lịch trình bảo trì</Divider>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="scheduledDate"
                    label={
                      <span>
                        <CalendarOutlined
                          style={{ color: "#faad14", marginRight: 4 }}
                        />
                        Ngày bảo trì
                      </span>
                    }
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày bảo trì" },
                      () => ({
                        validator(_, value) {
                          if (!value) return Promise.resolve();

                          const today = dayjs().startOf("day");
                          if (value.isBefore(today)) {
                            return Promise.reject(
                              new Error("Ngày bảo trì không được là quá khứ")
                            );
                          }

                          // ✅ Validation: Ngày bảo trì phải <= NextDueDate
                          const dueDate = selectedRecord.postponedDueDate
                            ? dayjs(selectedRecord.postponedDueDate)
                            : dayjs(selectedRecord.nextDueDate);

                          if (value.isAfter(dueDate)) {
                            return Promise.reject(
                              new Error(
                                "Không được tạo bảo trì sau ngày đến hạn. Phải hoãn bảo trì."
                              )
                            );
                          }

                          return Promise.resolve();
                        },
                      }),
                    ]}
                    extra={`Ngày máy dừng hoạt động để bảo trì (không được sau ${
                      selectedRecord.postponedDueDate
                        ? dayjs(selectedRecord.postponedDueDate).format(
                            "DD/MM/YYYY"
                          )
                        : dayjs(selectedRecord.nextDueDate).format("DD/MM/YYYY")
                    })`}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      placeholder="Chọn ngày bảo trì"
                      disabledDate={(current) => {
                        // Không cho chọn ngày quá khứ
                        const today = dayjs().startOf("day");
                        if (current && current < today) return true;

                        // Không cho chọn ngày sau DueDate
                        const dueDate = selectedRecord.postponedDueDate
                          ? dayjs(selectedRecord.postponedDueDate)
                          : dayjs(selectedRecord.nextDueDate);
                        return current && current.isAfter(dueDate);
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Phân công kỹ thuật viên</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="assignedToElectrical"
                    label={
                      <span>
                        <ThunderboltOutlined
                          style={{ color: "#1890ff", marginRight: 4 }}
                        />
                        Kỹ thuật viên điện
                      </span>
                    }
                  >
                    <Select
                      placeholder="Chọn kỹ thuật viên điện"
                      showSearch
                      allowClear
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {electricalTechs.map((tech) => (
                        <Option key={tech.userId} value={tech.userId}>
                          {tech.fullName} - {tech.employeeCode}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="assignedToMechanical"
                    label={
                      <span>
                        <ToolOutlined
                          style={{ color: "#52c41a", marginRight: 4 }}
                        />
                        Kỹ thuật viên cơ khí
                      </span>
                    }
                  >
                    <Select
                      placeholder="Chọn kỹ thuật viên cơ khí"
                      showSearch
                      allowClear
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {mechanicalTechs.map((tech) => (
                        <Option key={tech.userId} value={tech.userId}>
                          {tech.fullName} - {tech.employeeCode}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Hiển thị template checklist */}
              {templateChecklist.length > 0 && (
                <>
                  <Divider>Chi tiết mẫu bảo trì</Divider>
                  <Alert
                    message={`Tổng cộng: ${
                      templateChecklist.length
                    } công việc kiểm tra (${
                      templateChecklist.filter(
                        (i) => i.category === "Electrical"
                      ).length
                    } điện + ${
                      templateChecklist.filter(
                        (i) => i.category === "Mechanical"
                      ).length
                    } cơ khí)`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card
                        title={
                          <span style={{ color: "#1890ff" }}>
                            <ThunderboltOutlined /> Công việc Điện (
                            {
                              templateChecklist.filter(
                                (item) => item.category === "Electrical"
                              ).length
                            }
                            )
                          </span>
                        }
                        size="small"
                        style={{ maxHeight: 400, overflow: "auto" }}
                      >
                        {templateChecklist.filter(
                          (item) => item.category === "Electrical"
                        ).length > 0 ? (
                          <List
                            size="small"
                            dataSource={templateChecklist
                              .filter((item) => item.category === "Electrical")
                              .sort((a, b) => a.orderIndex - b.orderIndex)}
                            renderItem={(item, index) => (
                              <List.Item>
                                <List.Item.Meta
                                  avatar={
                                    <Badge
                                      count={index + 1}
                                      style={{ backgroundColor: "#1890ff" }}
                                    />
                                  }
                                  title={item.stepName}
                                  description={item.stepDescription}
                                />
                              </List.Item>
                            )}
                          />
                        ) : (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Không có công việc điện"
                          />
                        )}
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card
                        title={
                          <span style={{ color: "#52c41a" }}>
                            <ToolOutlined /> Công việc Cơ khí (
                            {
                              templateChecklist.filter(
                                (item) => item.category === "Mechanical"
                              ).length
                            }
                            )
                          </span>
                        }
                        size="small"
                        style={{ maxHeight: 400, overflow: "auto" }}
                      >
                        {templateChecklist.filter(
                          (item) => item.category === "Mechanical"
                        ).length > 0 ? (
                          <List
                            size="small"
                            dataSource={templateChecklist
                              .filter((item) => item.category === "Mechanical")
                              .sort((a, b) => a.orderIndex - b.orderIndex)}
                            renderItem={(item, index) => (
                              <List.Item>
                                <List.Item.Meta
                                  avatar={
                                    <Badge
                                      count={index + 1}
                                      style={{ backgroundColor: "#52c41a" }}
                                    />
                                  }
                                  title={item.stepName}
                                  description={item.stepDescription}
                                />
                              </List.Item>
                            )}
                          />
                        ) : (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Không có công việc cơ khí"
                          />
                        )}
                      </Card>
                    </Col>
                  </Row>
                </>
              )}
            </>
          ) : (
            // Khi EDIT hoặc TẠO MANUAL: hiển thị form đầy đủ
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="planId"
                    label="Chu kỳ bảo trì"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn chu kỳ bảo trì",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn chu kỳ bảo trì"
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {maintenancePlans.map((plan) => (
                        <Option key={plan.planId} value={plan.planId}>
                          {plan.equipmentName} - {plan.equipmentCode}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dueDate"
                    label="Ngày đến hạn"
                    rules={[
                      { required: true, message: "Vui lòng chọn ngày đến hạn" },
                    ]}
                  >
                    <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="assignedToElectrical"
                    label="Kỹ thuật viên điện"
                  >
                    <Select
                      placeholder="Chọn kỹ thuật viên điện"
                      showSearch
                      allowClear
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {electricalTechs.map((tech) => (
                        <Option key={tech.userId} value={tech.userId}>
                          {tech.fullName} - {tech.employeeCode}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="assignedToMechanical"
                    label="Kỹ thuật viên cơ khí"
                  >
                    <Select
                      placeholder="Chọn kỹ thuật viên cơ khí"
                      showSearch
                      allowClear
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {mechanicalTechs.map((tech) => (
                        <Option key={tech.userId} value={tech.userId}>
                          {tech.fullName} - {tech.employeeCode}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="notes" label="Ghi chú">
                    <TextArea rows={3} placeholder="Nhập ghi chú (tùy chọn)" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setIsWorkOrderModalVisible(false);
                  workOrderForm.resetFields();
                  setTemplateChecklist([]);
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingWorkOrder ? "Cập nhật" : "Tạo phiếu bảo trì"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Technicians Modal */}
      <Modal
        title="Phân công kỹ thuật viên"
        open={isAssignModalVisible}
        onCancel={() => setIsAssignModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={assignForm} layout="vertical" onFinish={handleAssignSubmit}>
          <Form.Item
            name="electricalTechnicianId"
            label="Kỹ thuật viên điện"
            rules={[
              { required: true, message: "Vui lòng chọn kỹ thuật viên điện" },
            ]}
          >
            <Select
              placeholder="Chọn kỹ thuật viên điện"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {electricalTechs.map((tech) => (
                <Option key={tech.userId} value={tech.userId}>
                  {tech.fullName} - {tech.employeeCode}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="mechanicalTechnicianId"
            label="Kỹ thuật viên cơ khí"
            rules={[
              { required: true, message: "Vui lòng chọn kỹ thuật viên cơ khí" },
            ]}
          >
            <Select
              placeholder="Chọn kỹ thuật viên cơ khí"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {mechanicalTechs.map((tech) => (
                <Option key={tech.userId} value={tech.userId}>
                  {tech.fullName} - {tech.employeeCode}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsAssignModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Phân công
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Multiple Technicians Modal */}
      <Modal
        title="Phân công nhiều kỹ thuật viên"
        open={isAssignMultipleModalVisible}
        onCancel={() => setIsAssignMultipleModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={multiAssignForm}
          layout="vertical"
          onFinish={handleMultiAssignSubmit}
        >
          {assigningTechnicians.map((tech, index) => (
            <Row gutter={16} key={index} style={{ marginBottom: 16 }}>
              <Col span={10}>
                <Select
                  placeholder="Chọn kỹ thuật viên"
                  value={tech.technicianId}
                  onChange={(value) =>
                    handleTechnicianChange(index, "technicianId", value)
                  }
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {[...mechanicalTechs, ...electricalTechs].map((t) => (
                    <Option key={t.userId} value={t.userId}>
                      {t.fullName} - {t.employeeCode}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={10}>
                <Select
                  placeholder="Loại kỹ thuật viên"
                  value={tech.technicianType}
                  onChange={(value) =>
                    handleTechnicianChange(index, "technicianType", value)
                  }
                >
                  <Option value="Electrical">Điện</Option>
                  <Option value="Mechanical">Cơ khí</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveTechnician(index)}
                />
              </Col>
            </Row>
          ))}
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={handleAddTechnician}
          >
            Thêm kỹ thuật viên
          </Button>
          <Form.Item style={{ marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsAssignMultipleModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Phân công
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Postpone Modal */}
      <Modal
        title="Hoãn bảo trì"
        open={isPostponeModalVisible}
        onCancel={() => setIsPostponeModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={postponeForm}
          layout="vertical"
          onFinish={handlePostponeSubmit}
        >
          <Form.Item
            name="postponeDays"
            label="Số ngày hoãn"
            rules={[{ required: true, message: "Vui lòng nhập số ngày hoãn" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do hoãn"
            rules={[{ required: true, message: "Vui lòng nhập lý do hoãn" }]}
          >
            <TextArea rows={3} placeholder="Nhập lý do hoãn" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsPostponeModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Hoãn
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          selectedRecord?.workOrderId
            ? "Chi tiết phiếu bảo trì"
            : "Chi tiết kế hoạch bảo trì"
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={2}>
              {selectedRecord.workOrderId ? (
                <>
                  {/* WorkOrder Details */}
                  <Descriptions.Item label="Mã phiếu" span={2}>
                    {selectedRecord.workOrderCode ||
                      `WO${String(selectedRecord.workOrderId).padStart(
                        3,
                        "0"
                      )}`}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thiết bị">
                    {selectedRecord.equipmentName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã thiết bị">
                    {selectedRecord.equipmentCode}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chuyền">
                    {selectedRecord.lineName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Công đoạn">
                    {selectedRecord.stageName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày phân công">
                    {selectedRecord.assignedDate
                      ? dayjs(selectedRecord.assignedDate).format("DD/MM/YYYY")
                      : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày đến hạn">
                    {dayjs(selectedRecord.dueDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái" span={2}>
                    {getStatusTag(selectedRecord.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="KTV Điện" span={2}>
                    {selectedRecord.electricalTechnicianName ? (
                      <Space>
                        <ThunderboltOutlined style={{ color: "#1890ff" }} />
                        <Text strong>
                          {selectedRecord.electricalTechnicianName}
                        </Text>
                        <Text type="secondary">
                          ({selectedRecord.electricalEmployeeCode})
                        </Text>
                      </Space>
                    ) : (
                      <Text type="secondary">Chưa phân công</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="KTV Cơ khí" span={2}>
                    {selectedRecord.mechanicalTechnicianName ? (
                      <Space>
                        <ToolOutlined style={{ color: "#52c41a" }} />
                        <Text strong>
                          {selectedRecord.mechanicalTechnicianName}
                        </Text>
                        <Text type="secondary">
                          ({selectedRecord.mechanicalEmployeeCode})
                        </Text>
                      </Space>
                    ) : (
                      <Text type="secondary">Chưa phân công</Text>
                    )}
                  </Descriptions.Item>
                  {selectedRecord.notes && (
                    <Descriptions.Item label="Ghi chú" span={2}>
                      {selectedRecord.notes}
                    </Descriptions.Item>
                  )}
                </>
              ) : (
                <>
                  {/* Plan Details */}
                  <Descriptions.Item label="Mã kế hoạch" span={2}>
                    PLAN{String(selectedRecord.planId).padStart(3, "0")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thiết bị">
                    {selectedRecord.equipmentName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã thiết bị">
                    {selectedRecord.equipmentCode}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chuyền">
                    {selectedRecord.lineName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Công đoạn">
                    {selectedRecord.stageName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chu kỳ bảo trì">
                    {selectedRecord.intervalValue}{" "}
                    {selectedRecord.intervalType === "Days"
                      ? "ngày"
                      : selectedRecord.intervalType === "Months"
                      ? "tháng"
                      : selectedRecord.intervalType === "Hours"
                      ? "giờ"
                      : "chu kỳ"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày bắt đầu">
                    {dayjs(selectedRecord.startDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày đến hạn (gốc)">
                    {dayjs(selectedRecord.nextDueDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  {selectedRecord.postponedDueDate && (
                    <Descriptions.Item label="Ngày đến hạn (sau hoãn)" span={2}>
                      <Tag color="purple" icon={<ClockCircleOutlined />}>
                        {dayjs(selectedRecord.postponedDueDate).format(
                          "DD/MM/YYYY"
                        )}
                      </Tag>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        (Hoãn{" "}
                        {Math.round(
                          (new Date(selectedRecord.postponedDueDate) -
                            new Date(selectedRecord.nextDueDate)) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        ngày)
                      </Text>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Trạng thái">
                    {getPlanStatusTag(selectedRecord)}
                  </Descriptions.Item>
                  {selectedRecord.postponedReason && (
                    <>
                      <Descriptions.Item label="Lý do hoãn" span={2}>
                        <Alert
                          message={
                            <div>
                              <Text strong>Đã hoãn bảo trì</Text>
                              {selectedRecord.postponedDate && (
                                <Text
                                  type="secondary"
                                  style={{ marginLeft: 8, fontSize: 12 }}
                                >
                                  (
                                  {dayjs(selectedRecord.postponedDate).format(
                                    "DD/MM/YYYY HH:mm"
                                  )}
                                  )
                                </Text>
                              )}
                            </div>
                          }
                          description={selectedRecord.postponedReason}
                          type="warning"
                          showIcon
                          icon={<ClockCircleOutlined />}
                        />
                      </Descriptions.Item>
                    </>
                  )}
                </>
              )}
            </Descriptions>

            {selectedRecord.checklistItems &&
              selectedRecord.checklistItems.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <Title level={5}>Danh sách kiểm tra</Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card
                        title={
                          <>
                            <ThunderboltOutlined /> Công việc Điện
                          </>
                        }
                        size="small"
                      >
                        <List
                          size="small"
                          dataSource={selectedRecord.checklistItems.filter(
                            (item) => item.category === "Electrical"
                          )}
                          renderItem={(item) => (
                            <List.Item>
                              <Checkbox checked={item.isChecked} disabled>
                                {item.stepName}
                              </Checkbox>
                              {item.notes && (
                                <Text
                                  type="secondary"
                                  style={{
                                    marginLeft: 16,
                                    display: "block",
                                    fontSize: 12,
                                  }}
                                >
                                  Ghi chú: {item.notes}
                                </Text>
                              )}
                              {item.completedDate && (
                                <Text
                                  type="secondary"
                                  style={{
                                    marginLeft: 16,
                                    display: "block",
                                    fontSize: 12,
                                  }}
                                >
                                  Hoàn thành:{" "}
                                  {dayjs(item.completedDate).format(
                                    "DD/MM/YYYY HH:mm"
                                  )}
                                </Text>
                              )}
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card
                        title={
                          <>
                            <ToolOutlined /> Công việc Cơ khí
                          </>
                        }
                        size="small"
                      >
                        <List
                          size="small"
                          dataSource={selectedRecord.checklistItems.filter(
                            (item) => item.category === "Mechanical"
                          )}
                          renderItem={(item) => (
                            <List.Item>
                              <Checkbox checked={item.isChecked} disabled>
                                {item.stepName}
                              </Checkbox>
                              {item.notes && (
                                <Text
                                  type="secondary"
                                  style={{
                                    marginLeft: 16,
                                    display: "block",
                                    fontSize: 12,
                                  }}
                                >
                                  Ghi chú: {item.notes}
                                </Text>
                              )}
                              {item.completedDate && (
                                <Text
                                  type="secondary"
                                  style={{
                                    marginLeft: 16,
                                    display: "block",
                                    fontSize: 12,
                                  }}
                                >
                                  Hoàn thành:{" "}
                                  {dayjs(item.completedDate).format(
                                    "DD/MM/YYYY HH:mm"
                                  )}
                                </Text>
                              )}
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}
          </div>
        )}
      </Modal>

      {/* Add CSS animation for pulsing effect */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default MaintenanceManagement;
