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
  CloseCircleOutlined,
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
  SaveOutlined,
  ExclamationCircleOutlined,
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
  getAllTechnicians,
  getMaintenanceStats,
  getUpcomingMaintenance,
  addChecklistItemToTemplate,
  getTemplateById,
} from "../../services/maintenanceService";
import { equipmentService } from "../../services/equipmentService";
import { getAllStages, stageService } from "../../services/stageService";
import { lineService } from "../../services/lineService";
import { replacementHistoryService } from "../../services/replacementHistoryService";
import styles from "../../styles/pages/MaintenanceManagement.module.css";
import WorkScheduleManagement from "./WorkScheduleManagement";

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;
const { Text, Title } = Typography;
const { Step } = Steps;

const MaintenanceManagement = () => {
  const [loading, setLoading] = useState(false);

  // Helper functions for showing errors/success messages
  const showError = (title, errors) => {
    const errorList = Array.isArray(errors) ? errors : [errors];
    Modal.error({
      title: title || "Lỗi",
      content: (
        <ul style={{ maxHeight: 300, overflow: "auto", paddingLeft: 20 }}>
          {errorList.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      ),
      width: 600,
      okText: "Đóng",
      closable: true,
      maskClosable: true,
    });
  };

  const showSuccess = (title, messages) => {
    const messageList = Array.isArray(messages) ? messages : [messages];
    Modal.success({
      title: title || "Thành công",
      content: (
        <ul style={{ maxHeight: 300, overflow: "auto", paddingLeft: 20 }}>
          {messageList.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      ),
      okText: "Đóng",
      closable: true,
      maskClosable: true,
    });
  };



  // Modal states
  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [isWorkOrderModalVisible, setIsWorkOrderModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isViewPlanModalVisible, setIsViewPlanModalVisible] = useState(false);
  const [isViewTemplateModalVisible, setIsViewTemplateModalVisible] = useState(false);

  const [editingPlan, setEditingPlan] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingWorkOrder, setEditingWorkOrder] = useState(null);
  const [viewingPlan, setViewingPlan] = useState(null);
  const [isViewPlanEditing, setIsViewPlanEditing] = useState(false);
  const [planMaintenanceHistory, setPlanMaintenanceHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [viewingWorkOrder, setViewingWorkOrder] = useState(null);
  const [isViewWorkOrderModalVisible, setIsViewWorkOrderModalVisible] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState(null);

  // Forms
  const [planForm] = Form.useForm();
  const [viewPlanForm] = Form.useForm();
  const [templateForm] = Form.useForm();
  const [workOrderForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("plans");


  // Data states
  const [maintenancePlans, setMaintenancePlans] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
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

  // ===== STATES CHO IMPORT TEMPLATE ITEMS (BƯỚC KIỂM TRA) =====
  const [isItemsImportModalVisible, setIsItemsImportModalVisible] = useState(false);
  const [selectedTemplateForImport, setSelectedTemplateForImport] = useState(null);
  const [uploadedItemsFile, setUploadedItemsFile] = useState(null);
  const [importItemsLoading, setImportItemsLoading] = useState(false);

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

  // Load lịch sử bảo trì khi mở modal ViewPlan
  useEffect(() => {
    const loadPlanHistory = async () => {
      if (isViewPlanModalVisible && viewingPlan) {
        setLoadingHistory(true);
        try {
          const allWorkOrders = await getAllWorkOrders();
          // ✅ Hiển thị cả Completed và Cancelled trong lịch sử
          const history = allWorkOrders.data?.filter(
            wo => wo.planId === viewingPlan.planId && (wo.status === 'Completed' || wo.status === 'Cancelled')
          ).sort((a, b) => new Date(b.completedDate || b.scheduledDate) - new Date(a.completedDate || a.scheduledDate)) || [];
          setPlanMaintenanceHistory(history);
          
          // Load templates for equipment if editing mode
          if (viewingPlan.equipmentId) {
            try {
              const response = await templateService.getTemplatesByEquipment(viewingPlan.equipmentId);
              setFilteredTemplates(response?.data || []);
            } catch (error) {
              console.error("Load templates error:", error);
            }
          }
        } catch (error) {
          console.error("Lỗi khi tải lịch sử bảo trì:", error);
          setPlanMaintenanceHistory([]);
        } finally {
          setLoadingHistory(false);
        }
      } else {
        setPlanMaintenanceHistory([]);
      }
    };

    loadPlanHistory();
  }, [isViewPlanModalVisible, viewingPlan]);

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
      showError("Tải dữ liệu thất bại", [error.message]);
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
      showError("Tải danh sách template thất bại", [error.message || "Lỗi không xác định"]);
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
      showError("Tải danh sách phiếu bảo trì thất bại", [error.message || "Lỗi không xác định"]);
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
      showError("Tải danh sách phiếu chờ xử lý thất bại", [error.message || "Lỗi không xác định"]);
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
      showError("Tải danh sách bảo trì sắp đến hạn thất bại", [error.message || "Lỗi không xác định"]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getMaintenanceStats(); 
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
      showError("Không thể tải danh sách kỹ thuật viên", [error.message || "Lỗi không xác định"]);
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
        showError("Không thể tải danh sách công đoạn", [error.message || "Lỗi không xác định"]);
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
        showError("Không thể tải dữ liệu", [error.message || "Lỗi không xác định"]);
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

  const handleViewDetail = (record) => {
    setViewingPlan(record);
    setIsViewPlanModalVisible(true);
    setIsViewPlanEditing(false);
    // useEffect sẽ tự động load lịch sử
  };

  const handleUpdatePlanFromView = async (values) => {
    setLoading(true);
    try {
      await updateMaintenancePlan(viewingPlan.planId, {
        equipmentId: viewingPlan.equipmentId,
        templateId: values.templateId || viewingPlan.templateId,
        intervalType: viewingPlan.intervalType,
        intervalValue: viewingPlan.intervalValue,
        startDate: viewingPlan.startDate,
        reminderDaysBefore: values.reminderDaysBefore,
        isActive: values.isActive,
      });
      message.success("Cập nhật kế hoạch bảo trì thành công!");
      setIsViewPlanEditing(false);
      loadMaintenancePlans();
      loadStats();
      // Refresh viewingPlan data
      const response = await getAllMaintenancePlans();
      const updatedPlans = response?.data || response || [];
      if (Array.isArray(updatedPlans)) {
        const updatedPlan = updatedPlans.find(p => p.planId === viewingPlan.planId);
        if (updatedPlan) {
          setViewingPlan(updatedPlan);
        }
      }
    } catch (error) {
      showError("Lỗi khi cập nhật kế hoạch", [error.message || "Lỗi không xác định"]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewWorkOrderDetail = (workOrder) => {
    setViewingWorkOrder(workOrder);
    setIsViewWorkOrderModalVisible(true);
  };

  const handleDeletePlan = async (record) => {
    try {
      await deleteMaintenancePlan(record.planId);
      message.success("Xóa kế hoạch bảo trì thành công!");
      loadMaintenancePlans();
      loadStats();
    } catch (error) {
      showError("Xóa kế hoạch thất bại", [error.message || "Lỗi không xác định"]);
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
          startDate: values.startDate.format('YYYY-MM-DD'), // ✅ Dùng format thay vì toISOString() để tránh lùi giờ
          reminderDaysBefore: values.reminderDaysBefore ?? 3,
        };
        await createMaintenancePlan(planData);
        message.success("Tạo chu kỳ bảo trì thành công!");
      }

      setIsPlanModalVisible(false);
      planForm.resetFields();
      loadMaintenancePlans();
      loadStats();
    } catch (error) {
      let errorMessage = error.message || "Lỗi không xác định";
      
      // Loại bỏ phần "Chu kỳ hiện tại: ..." khỏi thông báo lỗi
      if (errorMessage.includes("Chu kỳ hiện tại:")) {
        errorMessage = errorMessage.replace(/Chu kỳ hiện tại:.*?\./g, '').trim();
      }
      
      showError("Lỗi khi xử lý kế hoạch bảo trì", [errorMessage]);
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
      isActive: record.isActive,
    });
    setChecklistItems(record.templateItems || []);
    setIsTemplateModalVisible(true);
  };

  const handleViewTemplateDetail = (record) => {
    setViewingTemplate(record);
    setIsViewTemplateModalVisible(true);
  };

  const handleDeleteTemplate = async (record) => {
    try {
      await deleteTemplate(record.templateId);
      message.success("Xóa mẫu bảo trì thành công!");
      loadTemplates();
    } catch (error) {
      const errorMessage = error.message || "Lỗi không xác định";
      
      // Kiểm tra nếu là lỗi đang được sử dụng bởi chu kỳ
      if (errorMessage.includes("đang được sử dụng bởi") || errorMessage.includes("chu kỳ bảo trì")) {
        // Trích xuất tên chu kỳ từ message (lấy phần sau "chu kỳ bảo trì đang hoạt động:")
        const match = errorMessage.match(/đang hoạt động: (.+?) Vui lòng/);
        const cycleInfo = match ? match[1] : "các chu kỳ bảo trì";
        message.error(`Mẫu bảo trì này đang được dùng ở chu kỳ ${cycleInfo}. Không thể xóa.`);
      } else {
        showError("Xóa mẫu bảo trì thất bại", [errorMessage]);
      }
    }
  };

  const handleTemplateSubmit = async (values) => {
    setLoading(true);
    try {
      const templateData = {
        stageId: values.stageId,
        templateName: values.templateName,
        description: values.description,
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
      showError("Lỗi khi xử lý mẫu bảo trì", [error.message || "Lỗi không xác định"]);
    } finally {
      setLoading(false);
    }
  };

  const [newChecklistItem, setNewChecklistItem] = useState({
    stepName: "",
    stepDescription: "",
    category: "",
  });

  const handleAddChecklistItemClick = () => {
    if (!newChecklistItem.stepName || !newChecklistItem.category) {
      showError("Thiếu thông tin", ["Vui lòng nhập đầy đủ thông tin bước kiểm tra"]);
      return;
    }

    // Tự động set RequiredRole dựa vào Category
    const requiredRole =
      newChecklistItem.category === "Electrical" ? "Electrical" : "Mechanical";

    const newItem = {
      stepName: newChecklistItem.stepName,
      stepDescription: newChecklistItem.stepDescription || "",
      category: newChecklistItem.category,
      requiredRole: requiredRole, // Thêm trường này cho API
      orderIndex: checklistItems.length + 1,
    };
    setChecklistItems([...checklistItems, newItem]);
    setNewChecklistItem({ stepName: "", stepDescription: "", category: "" });
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
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:7003/api";
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apiBaseUrl}/maintenance/templates/download-template`,
        {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải file Excel");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `MauBaoTri_Template_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("Tải Excel mẫu thành công!");
    } catch (error) {
      console.error("Download error:", error);
      showError("Tải Excel mẫu thất bại", [error.message || "Lỗi không xác định"]);
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
      showError("Thiếu file", ["Vui lòng chọn file Excel để import"]);
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
            title: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <WarningOutlined style={{ color: '#faad14' }} />
                <span>Phát hiện {result.data.errorCount} lỗi trong file Excel</span>
              </div>
            ),
            content: (
              <div>
                <Alert
                  message={`Đã import thành công ${result.data.successCount} mẫu bảo trì`}
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
                  Vui lòng sửa các lỗi sau và import lại:
                </div>
                <ul style={{ 
                  maxHeight: 400, 
                  overflow: 'auto', 
                  paddingLeft: 20,
                  backgroundColor: '#fff1f0',
                  padding: '12px 20px',
                  borderRadius: 4,
                  border: '1px solid #ffccc7'
                }}>
                  {result.data.errors.map((err, idx) => (
                    <li key={idx} style={{ marginBottom: 8, color: '#cf1322' }}>
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            ),
            width: 700,
            okText: "Đã hiểu",
            closable: true,
            maskClosable: true,
          });
        }

        setIsImportModalVisible(false);
        setUploadedFile(null);
        loadTemplates();
      } else {
        // Hiển thị lỗi validation chi tiết
        if (result.errors && result.errors.length > 0) {
          Modal.error({
            title: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                <span>Phát hiện {result.errors.length} lỗi trong file Excel</span>
              </div>
            ),
            content: (
              <div>
                <div style={{ marginBottom: 8 }}>
                  Vui lòng sửa các lỗi sau và import lại:
                </div>
                <ul style={{ 
                  maxHeight: 400, 
                  overflow: 'auto', 
                  paddingLeft: 20,
                  backgroundColor: '#fff1f0',
                  padding: '12px 20px',
                  borderRadius: 4,
                  border: '1px solid #ffccc7',
                  margin: 0
                }}>
                  {result.errors.map((err, idx) => (
                    <li key={idx} style={{ marginBottom: 8, color: '#cf1322' }}>
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            ),
            width: 700,
            okText: "Đóng",
            closable: true,
            maskClosable: true,
          });
        } else {
          showError("Import thất bại", [result.message || "Lỗi không xác định"]);
        }
      }
    } catch (error) {
      showError("Import thất bại", [error.message || "Lỗi không xác định"]);
    } finally {
      setImportLoading(false);
    }
  };

  // ===== EXCEL IMPORT FOR TEMPLATE ITEMS (Các bước kiểm tra) =====

  const handleDownloadTemplateItemsExcel = async () => {
    try {
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:7003/api";
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apiBaseUrl}/maintenance/templates/download-items-template`,
        {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải file Excel");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `MauBaoTri_CacBuocKiemTra_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("Tải Excel mẫu bước kiểm tra thành công!");
    } catch (error) {
      console.error("Download error:", error);
      showError("Tải Excel mẫu thất bại", [error.message || "Lỗi không xác định"]);
    }
  };

  const handleItemsFileChange = (info) => {
    const file = info.file.originFileObj || info.file;
    setUploadedItemsFile(file);
    console.log("✅ File đã chọn:", file.name);
  };

  const handleOpenItemsImport = (template) => {
    setSelectedTemplateForImport(template);
    setIsItemsImportModalVisible(true);
  };

  const handleImportItemsExcel = async () => {
    if (!uploadedItemsFile) {
      showError("Thiếu file", ["Vui lòng chọn file Excel để import"]);
      return;
    }

    if (!selectedTemplateForImport) {
      showError("Thiếu thông tin", ["Vui lòng chọn mẫu bảo trì để import vào"]);
      return;
    }

    setImportItemsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedItemsFile);

      const token = localStorage.getItem("token");
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:7003/api";

      const response = await fetch(
        `${apiBaseUrl}/maintenance/templates/${selectedTemplateForImport.templateId}/import-items`,
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
          `Import thành công ${result.data.successCount} bước kiểm tra vào mẫu '${selectedTemplateForImport.templateName}'!`
        );

        if (result.data.errors && result.data.errors.length > 0) {
          Modal.warning({
            title: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <WarningOutlined style={{ color: '#faad14' }} />
                <span>Phát hiện {result.data.errorCount} lỗi trong file Excel</span>
              </div>
            ),
            content: (
              <div>
                <Alert
                  message={`Đã import thành công ${result.data.successCount} bước kiểm tra vào mẫu '${selectedTemplateForImport.templateName}'`}
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
                  Vui lòng sửa các lỗi sau và import lại:
                </div>
                <ul style={{ 
                  maxHeight: 400, 
                  overflow: 'auto', 
                  paddingLeft: 20,
                  backgroundColor: '#fff1f0',
                  padding: '12px 20px',
                  borderRadius: 4,
                  border: '1px solid #ffccc7'
                }}>
                  {result.data.errors.map((err, idx) => (
                    <li key={idx} style={{ marginBottom: 8, color: '#cf1322' }}>
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            ),
            width: 700,
            okText: "Đã hiểu",
            closable: true,
            maskClosable: true,
          });
        }

        setIsItemsImportModalVisible(false);
        setUploadedItemsFile(null);
        setSelectedTemplateForImport(null);
        loadTemplates();
      } else {
        // Hiển thị lỗi validation chi tiết
        if (result.errors && result.errors.length > 0) {
          Modal.error({
            title: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                <span>Phát hiện {result.errors.length} lỗi trong file Excel</span>
              </div>
            ),
            content: (
              <div>
                <div style={{ marginBottom: 8 }}>
                  Vui lòng sửa các lỗi sau và import lại:
                </div>
                <ul style={{ 
                  maxHeight: 400, 
                  overflow: 'auto', 
                  paddingLeft: 20,
                  backgroundColor: '#fff1f0',
                  padding: '12px 20px',
                  borderRadius: 4,
                  border: '1px solid #ffccc7'
                }}>
                  {result.errors.map((err, idx) => (
                    <li key={idx} style={{ marginBottom: 8, color: '#cf1322' }}>
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            ),
            width: 700,
            okText: "Đã hiểu",
            closable: true,
            maskClosable: true,
          });
        } else {
          showError("Import thất bại", [result.message || "Lỗi không xác định"]);
        }
      }
    } catch (error) {
      showError("Import thất bại", [error.message || "Lỗi không xác định"]);
    } finally {
      setImportItemsLoading(false);
    }
  };

  // Import items to Form (không lưu DB, chỉ parse Excel và thêm vào checklistItems)
  const handleImportItemsToForm = async () => {
    if (!uploadedItemsFile) {
      showError("Thiếu file", ["Vui lòng chọn file Excel để import"]);
      return;
    }

    setImportLoading(true);
    try {
      // Đọc file Excel bằng XLSX library
      const XLSX = await import("xlsx");
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log("📊 Parsed Excel data:", jsonData);

          if (jsonData.length === 0) {
            message.warning("File Excel không có dữ liệu");
            setImportLoading(false);
            return;
          }

          // Parse và validate data
          const newItems = [];
          const errors = [];

          jsonData.forEach((row, index) => {
            const rowNum = index + 2; // Excel row (header = 1)

            // Validate required fields
            if (!row["Tên bước kiểm tra"] || row["Tên bước kiểm tra"].toString().trim() === "") {
              errors.push(`Dòng ${rowNum}: Thiếu tên bước`);
              return;
            }

            if (!row["Loại công việc"] || row["Loại công việc"].toString().trim() === "") {
              errors.push(`Dòng ${rowNum}: Thiếu loại công việc`);
              return;
            }

            const stepName = row["Tên bước kiểm tra"].toString().trim();
            const categoryRaw = row["Loại công việc"].toString().trim();

            // Map category
            let category;
            if (categoryRaw === "Điện" || categoryRaw === "Electrical") {
              category = "Electrical";
            } else if (categoryRaw === "Cơ khí" || categoryRaw === "Mechanical") {
              category = "Mechanical";
            } else if (categoryRaw === "Chung" || categoryRaw === "General") {
              category = "General";
            } else {
              errors.push(`Dòng ${rowNum}: Loại công việc không hợp lệ (chỉ chấp nhận: Điện/Electrical, Cơ khí/Mechanical, Chung/General)`);
              return;
            }

            // Check duplicate trong checklistItems hiện tại
            const isDuplicate = checklistItems.some(
              (item) =>
                item.stepName.toLowerCase() === stepName.toLowerCase() &&
                item.category === category
            );

            if (isDuplicate) {
              errors.push(
                `Dòng ${rowNum}: Bước "${stepName}" (${category === "Electrical" ? "Điện" : "Cơ khí"}) đã tồn tại`
              );
              return;
            }

            // Check duplicate trong newItems
            const isDuplicateInNew = newItems.some(
              (item) =>
                item.stepName.toLowerCase() === stepName.toLowerCase() &&
                item.category === category
            );

            if (isDuplicateInNew) {
              errors.push(
                `Dòng ${rowNum}: Bước "${stepName}" (${category === "Electrical" ? "Điện" : "Cơ khí"}) bị trùng trong file Excel`
              );
              return;
            }

            // Tự động set RequiredRole dựa vào Category
            const requiredRole =
              category === "Electrical" ? "Electrical" : "Mechanical";

            newItems.push({
              stepName,
              category,
              stepDescription: row["Mô tả chi tiết"] ? row["Mô tả chi tiết"].toString().trim() : "",
              requiredRole: requiredRole, // ✅ Thêm trường này cho API
              orderIndex: checklistItems.length + newItems.length + 1,
            });
          });

          if (errors.length > 0) {
            Modal.error({
              title: "⛔ Lỗi validation",
              content: (
                <div>
                  <p>
                    <strong>Tìm thấy {errors.length} lỗi trong file Excel:</strong>
                  </p>
                  <ul style={{ maxHeight: 400, overflow: "auto" }}>
                    {errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              ),
              width: 700,
            });
            setImportLoading(false);
            return;
          }

          if (newItems.length === 0) {
            message.warning("Không có bước kiểm tra hợp lệ để import");
            setImportLoading(false);
            return;
          }

          // Thêm vào checklistItems
          setChecklistItems([...checklistItems, ...newItems]);
          message.success(
            `✅ Import thành công ${newItems.length} bước kiểm tra (${
              newItems.filter((i) => i.category === "Electrical").length
            } điện + ${
              newItems.filter((i) => i.category === "Mechanical").length
            } cơ khí)`
          );

          // Reset file
          setUploadedItemsFile(null);
        } catch (parseError) {
          console.error("Parse error:", parseError);
          showError("Lỗi khi đọc file Excel", [parseError.message || "Định dạng file không hợp lệ"]);
        } finally {
          setImportLoading(false);
        }
      };

      reader.onerror = () => {
        showError("Lỗi khi đọc file", ["Không thể đọc file, vui lòng kiểm tra lại"]);
        setImportLoading(false);
      };

      reader.readAsArrayBuffer(uploadedItemsFile);
    } catch (error) {
      console.error("Import error:", error);
      showError("Import thất bại", [error.message || "Lỗi không xác định"]);
      setImportLoading(false);
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
      width: 100,
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
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Import bước kiểm tra">
            <Button
              type="link"
              size="small"
              icon={<UploadOutlined />}
              onClick={() => handleOpenItemsImport(record)}
            />
          </Tooltip>
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
      template.description?.toLowerCase().includes(searchText.toLowerCase())
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddPlan}
            >
              Thêm chu kỳ bảo trì
            </Button>
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
    </Card>
  );

  // Tab: Templates
  const TemplatesTab = (
    <Card title="Mẫu bảo trì" bordered={false}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Search
              placeholder="Tìm theo tên mẫu bảo trì hoặc mô tả"
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

      {/* Import Template Items Modal */}
      <Modal
        title={`Import Các Bước Kiểm Tra vào: ${selectedTemplateForImport?.templateName || ''}`}
        open={isItemsImportModalVisible}
        onCancel={() => {
          setIsItemsImportModalVisible(false);
          setUploadedItemsFile(null);
          setSelectedTemplateForImport(null);
        }}
        footer={null}
        width={600}
      >
        <Alert
          message="Hướng dẫn"
          description={
            <div>
              <p>1. Tải file Excel mẫu bằng nút bên dưới</p>
              <p>2. Điền thông tin các bước kiểm tra vào file Excel</p>
              <p>3. Upload file Excel đã điền để import</p>
              <p>
                <Text type="warning">
                  ⚠️ Các bước trùng tên sẽ bị từ chối
                </Text>
              </p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Button
          icon={<DownloadOutlined />}
          onClick={handleDownloadTemplateItemsExcel}
          style={{ marginBottom: 16 }}
        >
          Tải file Excel mẫu
        </Button>
        <br />
        <Upload
          accept=".xlsx"
          beforeUpload={() => false}
          onChange={handleItemsFileChange}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
        </Upload>
        {uploadedItemsFile && (
          <div style={{ marginTop: 16 }}>
            <Text strong>File đã chọn:</Text> {uploadedItemsFile.name}
          </div>
        )}
        <div style={{ marginTop: 24, textAlign: "right" }}>
          <Button
            onClick={() => {
              setIsItemsImportModalVisible(false);
              setUploadedItemsFile(null);
              setSelectedTemplateForImport(null);
            }}
            style={{ marginRight: 8 }}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleImportItemsExcel}
            loading={importItemsLoading}
          >
            Import
          </Button>
        </div>
      </Modal>
    </Card>
  );

  const items = [
    {
      key: "plans",
      label: "Chu kỳ bảo trì",
      children: MaintenancePlansTab,
    },
    {
      key: "workSchedule",
      label: "Lịch bảo trì & Công việc",
      children: <WorkScheduleManagement />,
    },
    {
      key: "templates",
      label: "Mẫu hướng dẫn bảo trì",
      children: TemplatesTab,
    },
  ];



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
                      {filteredEquipments.map((equipment) => {
                        const hasMaintenancePlan = maintenancePlans.some(
                          (plan) => plan.equipmentId === equipment.equipmentId
                        );
                        return (
                          <Option
                            key={equipment.equipmentId}
                            value={equipment.equipmentId}
                          >
                            {equipment.equipmentName} - {equipment.equipmentCode}
                            {hasMaintenancePlan && (
                              <span style={{ color: '#52c41a', marginLeft: 8 }}>
                                (đã có chu kỳ bảo trì)
                              </span>
                            )}
                          </Option>
                        );
                      })}
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
                    <DatePicker 
                      format="DD/MM/YYYY" 
                      style={{ width: "100%" }}
                      disabledDate={(current) => {
                        return current && current < dayjs().startOf('day');
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="reminderDaysBefore"
                    label="Số ngày nhắc nhở trước"
                    initialValue={3}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số ngày nhắc nhở",
                      },
                      {
                        type: "number",
                        min: 0,
                        max: 365,
                        message: "Số ngày phải từ 0 đến 365",
                      },
                    ]}
                    tooltip="Hệ thống sẽ gửi thông báo trước bao nhiêu ngày đến hạn bảo trì"
                  >
                    <InputNumber
                      min={0}
                      max={365}
                      style={{ width: "100%" }}
                      placeholder="Ví dụ: 3 ngày"
                    />
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
            <Col span={24}>
              <Form.Item name="description" label="Mô tả">
                <TextArea rows={3} placeholder="Nhập mô tả (tùy chọn)" />
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
            <Space direction="vertical" style={{ width: '100%' }} size="small">
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
              <Row gutter={16}>
                <Col span={24}>
                  <TextArea
                    placeholder="Mô tả chi tiết bước kiểm tra (tùy chọn)"
                    value={newChecklistItem.stepDescription}
                    onChange={(e) =>
                      setNewChecklistItem({
                        ...newChecklistItem,
                        stepDescription: e.target.value,
                      })
                    }
                    autoSize={{ minRows: 2, maxRows: 3 }}
                  />
                </Col>
              </Row>
            </Space>
          </Card>

          {/* Import Excel cho các bước kiểm tra */}
          <Card
            size="small"
            style={{ marginBottom: 16, backgroundColor: "#e6f7ff", borderColor: "#1890ff" }}
          >
            <Row gutter={16} align="middle">
              <Col span={24}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong>
                    <UploadOutlined /> Import từ Excel
                  </Text>
                  <Space>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handleDownloadTemplateItemsExcel}
                      size="small"
                    >
                      Tải mẫu Excel
                    </Button>
                    <Upload
                      accept=".xlsx"
                      beforeUpload={() => false}
                      onChange={handleItemsFileChange}
                      maxCount={1}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />} size="small">
                        Chọn file Excel
                      </Button>
                    </Upload>
                    {uploadedItemsFile && (
                      <>
                        <Text type="success">
                          <CheckOutlined /> {uploadedItemsFile.name}
                        </Text>
                        <Button
                          type="primary"
                          size="small"
                          onClick={handleImportItemsToForm}
                          loading={importLoading}
                        >
                          Import ngay
                        </Button>
                      </>
                    )}
                  </Space>
                </Space>
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
                          description={item.stepDescription ? (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {item.stepDescription}
                            </Text>
                          ) : null}
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
                          description={item.stepDescription ? (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {item.stepDescription}
                            </Text>
                          ) : null}
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

      {/* Modal Xem Chi Tiết Kế Hoạch Bảo Trì */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <EyeOutlined style={{ color: "#1890ff" }} />
            <span>Chi Tiết Kế Hoạch Bảo Trì</span>
          </div>
        }
        open={isViewPlanModalVisible}
        onCancel={() => {
          setIsViewPlanModalVisible(false);
          setViewingPlan(null);
          setPlanMaintenanceHistory([]);
          setIsViewPlanEditing(false);
          viewPlanForm.resetFields();
        }}
        footer={
          isViewPlanEditing ? [
            <Button
              key="cancel"
              onClick={() => {
                setIsViewPlanEditing(false);
                viewPlanForm.resetFields();
              }}
            >
              Hủy
            </Button>,
            <Button
              key="save"
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={() => viewPlanForm.submit()}
            >
              Lưu
            </Button>,
          ] : [
            <Button
              key="close"
              onClick={() => {
                setIsViewPlanModalVisible(false);
                setViewingPlan(null);
                setPlanMaintenanceHistory([]);
              }}
            >
              Đóng
            </Button>,
            <Button
              key="update"
              type="primary"
              icon={<EditOutlined />}
              onClick={async () => {
                // Lấy stageId từ equipment nếu viewingPlan không có
                let stageIdToUse = viewingPlan.stageId;
                
                if (!stageIdToUse && viewingPlan.equipmentId) {
                  // Tìm equipment từ danh sách để lấy stageId
                  const equipment = equipments.find(eq => eq.equipmentId === viewingPlan.equipmentId);
                  if (equipment) {
                    stageIdToUse = equipment.stageId;
                  }
                }
                
                console.log('🔍 ViewingPlan:', viewingPlan);
                console.log('🔍 StageId to use:', stageIdToUse);
                
                if (stageIdToUse) {
                  try {
                    setLoading(true);
                    const templateResponse = await getTemplatesByStage(stageIdToUse);
                    const templateData = templateResponse?.data || templateResponse || [];
                    console.log('🔍 Templates loaded:', templateData);
                    console.log('🔍 Current templateId:', viewingPlan.templateId);
                    
                    if (Array.isArray(templateData) && templateData.length > 0) {
                      setFilteredTemplates(templateData);
                      // Set field values SAU KHI đã có templates
                      setTimeout(() => {
                        setIsViewPlanEditing(true);
                        viewPlanForm.setFieldsValue({
                          isActive: viewingPlan.isActive,
                          reminderDaysBefore: viewingPlan.reminderDaysBefore || 3,
                          templateId: viewingPlan.templateId,
                        });
                      }, 100);
                    } else {
                      message.warning('Không tìm thấy mẫu bảo trì nào cho công đoạn này');
                    }
                  } catch (error) {
                    console.error('❌ Error loading templates:', error);
                    message.error('Không thể tải danh sách mẫu bảo trì');
                  } finally {
                    setLoading(false);
                  }
                } else {
                  message.error('Không xác định được công đoạn của chu kỳ này');
                }
              }}
            >
              Cập nhật
            </Button>,
          ]
        }
        width={800}
      >
        {viewingPlan && (
          <Form
            form={viewPlanForm}
            layout="vertical"
            onFinish={handleUpdatePlanFromView}
          >
            <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã Kế Hoạch" span={1}>
                <Tag color="blue">
                  PLAN{String(viewingPlan.planId).padStart(3, "0")}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái" span={1}>
                {isViewPlanEditing ? (
                  <Form.Item
                    name="isActive"
                    style={{ marginBottom: 0 }}
                  >
                    <Select style={{ width: '200px' }}>
                      <Option value={true}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                        Hoạt động
                      </Option>
                      <Option value={false}>
                        <CloseOutlined style={{ color: '#d9d9d9', marginRight: 4 }} />
                        Không hoạt động
                      </Option>
                    </Select>
                  </Form.Item>
                ) : (
                  viewingPlan.isActive ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Hoạt động
                    </Tag>
                  ) : (
                    <Tag color="default" icon={<CloseOutlined />}>
                      Không hoạt động
                    </Tag>
                  )
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Thiết Bị" span={2}>
                <div>
                  <div>
                    <strong>{viewingPlan.equipmentName}</strong>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Mã TB: {viewingPlan.equipmentCode} | Công đoạn:{" "}
                    {viewingPlan.stageName || "N/A"}
                  </Text>
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Mẫu Bảo Trì" span={2}>
                {isViewPlanEditing ? (
                  <Form.Item
                    name="templateId"
                    style={{ marginBottom: 0 }}
                    rules={[{ required: true, message: "Vui lòng chọn mẫu bảo trì" }]}
                  >
                    <Select
                      placeholder="Chọn mẫu bảo trì"
                      style={{ width: '100%' }}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={filteredTemplates.map((template) => ({
                        label: `${template.templateName} (TPL${String(template.templateId).padStart(3, "0")})`,
                        value: template.templateId,
                      }))}
                    />
                  </Form.Item>
                ) : (
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <strong>{viewingPlan.templateName}</strong>
                      <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                        (TPL{String(viewingPlan.templateId).padStart(3, "0")})
                      </Text>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={async () => {
                        try {
                          setLoading(true);
                          const response = await getTemplateById(viewingPlan.templateId);
                          if (response?.data) {
                            handleViewTemplateDetail(response.data);
                          }
                        } catch (error) {
                          showError("Không thể tải chi tiết mẫu bảo trì", [error.message || "Lỗi không xác định"]);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      style={{ padding: 0 }}
                    >
                      Xem chi tiết mẫu bảo trì
                    </Button>
                  </Space>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Chu Kỳ Bảo Trì" span={2}>
                <Tag color="processing">
                  {viewingPlan.intervalValue}{" "}
                  {viewingPlan.intervalType === "Days" && "Ngày"}
                  {viewingPlan.intervalType === "Weeks" && "Tuần"}
                  {viewingPlan.intervalType === "Months" && "Tháng"}
                  {viewingPlan.intervalType === "Years" && "Năm"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Số Ngày Nhắc Nhở" span={2}>
                {isViewPlanEditing ? (
                  <Form.Item
                    name="reminderDaysBefore"
                    style={{ marginBottom: 0 }}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số ngày nhắc nhở",
                      },
                      {
                        type: "number",
                        min: 0,
                        max: 365,
                        message: "Số ngày phải từ 0 đến 365",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      max={365}
                      style={{ width: '200px' }}
                      placeholder="Ví dụ: 3 ngày"
                      addonAfter="ngày"
                    />
                  </Form.Item>
                ) : (
                  <>
                    <Tag color="orange" icon={<BellOutlined />}>
                      Trước {viewingPlan.reminderDaysBefore || 3} ngày
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                      Hệ thống sẽ gửi thông báo trước {viewingPlan.reminderDaysBefore || 3} ngày đến hạn
                    </Text>
                  </>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày Bắt Đầu" span={1}>
                <Text>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {dayjs(viewingPlan.startDate).format("DD/MM/YYYY")}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Lần Bảo Trì Tiếp Theo" span={1}>
                {viewingPlan.nextDueDate ? (
                  <Text>
                    {dayjs(viewingPlan.nextDueDate).format("DD/MM/YYYY")}
                  </Text>
                ) : (
                  <Text type="secondary">Chưa xác định</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Lần Bảo Trì Cuối" span={1}>
                {planMaintenanceHistory.length > 0 ? (
                  <Text type="success">
                    <CheckOutlined style={{ marginRight: 4 }} />
                    {dayjs(planMaintenanceHistory[0].completedDate || planMaintenanceHistory[0].scheduledDate).format(
                      "DD/MM/YYYY"
                    )}
                  </Text>
                ) : (
                  <Text type="secondary">Chưa có</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Người Tạo" span={1}>
                <Text>{viewingPlan.createdByName || viewingPlan.createdBy || "N/A"}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày Tạo" span={1}>
                <Text type="secondary">
                  {viewingPlan.createdDate
                    ? dayjs(viewingPlan.createdDate).format("DD/MM/YYYY HH:mm")
                    : "N/A"}
                </Text>
              </Descriptions.Item>

              {viewingPlan.hasActiveWorkOrder && (
                <Descriptions.Item label="Trạng Thái Work Order" span={2}>
                  <Alert
                    message="Đang có Work Order đang chạy"
                    type="info"
                    showIcon
                    icon={<PlayCircleOutlined />}
                  />
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Lịch Sử Bảo Trì */}
            <Divider orientation="left">
              <FileTextOutlined /> Lịch Sử Bảo Trì ({planMaintenanceHistory.length})
            </Divider>
            
            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <ReloadOutlined spin /> Đang tải lịch sử...
              </div>
            ) : planMaintenanceHistory.length === 0 ? (
              <Empty 
                description="Chưa có lịch sử bảo trì"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Timeline mode="left">
                {planMaintenanceHistory.map((wo) => {
                  const isCompleted = wo.status === 'Completed';
                  const isCancelled = wo.status === 'Cancelled';
                  const isOverdue = wo.status === 'Overdue';
                  const color = isCompleted ? 'green' : isCancelled ? 'red' : isOverdue ? 'orange' : 'blue';
                  
                  return (
                    <Timeline.Item
                      key={wo.workOrderId}
                      color={color}
                      label={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(wo.completedDate || wo.dueDate).format("DD/MM/YYYY")}
                        </Text>
                      }
                    >
                      <Card 
                        size="small" 
                        hoverable
                        onClick={() => handleViewWorkOrderDetail(wo)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>
                              WO{String(wo.workOrderId).padStart(4, "0")}
                            </Text>
                            {isCompleted ? (
                              <Tag color="success" icon={<CheckCircleOutlined />}>
                                Hoàn thành
                              </Tag>
                            ) : isCancelled ? (
                              <Tag color="error" icon={<CloseCircleOutlined />}>
                                Đã hủy
                              </Tag>
                            ) : isOverdue ? (
                              <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                                Quá hạn
                              </Tag>
                            ) : (
                              <Tag color="processing" icon={<ClockCircleOutlined />}>
                                {wo.status}
                              </Tag>
                            )}
                          </div>
                          
                          {isCompleted && wo.completedDate && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <ClockCircleOutlined /> Hoàn thành: {dayjs(wo.completedDate).format("DD/MM/YYYY HH:mm")}
                            </Text>
                          )}
                          
                          {isOverdue && (
                            <Text type="danger" style={{ fontSize: 12 }}>
                              <WarningOutlined /> Đến hạn: {dayjs(wo.dueDate).format("DD/MM/YYYY")} - Không thực hiện bảo trì
                            </Text>
                          )}
                          
                          {wo.scheduledDate && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <CalendarOutlined /> Dự kiến: {dayjs(wo.scheduledDate).format("DD/MM/YYYY")}
                            </Text>
                          )}
                          
                          <div>
                          {wo.mechanicalTechnicianName && (
                            <div>
                              <Tag color="orange" size="small" icon={<ToolOutlined />}>
                                Cơ khí
                              </Tag>
                              <Text style={{ fontSize: 12 }}>{wo.mechanicalTechnicianName}</Text>
                            </div>
                          )}
                          {wo.electricalTechnicianName && (
                            <div>
                              <Tag color="blue" size="small" icon={<ThunderboltOutlined />}>
                                Điện
                              </Tag>
                              <Text style={{ fontSize: 12 }}>{wo.electricalTechnicianName}</Text>
                            </div>
                          )}
                        </div>

                        {wo.completionNotes && (
                          <Text type="secondary" italic style={{ fontSize: 12 }}>
                            "{wo.completionNotes}"
                          </Text>
                        )}
                        
                        <Button 
                          type="link" 
                          size="small" 
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewWorkOrderDetail(wo);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </Space>
                    </Card>
                  </Timeline.Item>
                  );
                })}
              </Timeline>
            )}
          </div>
          </Form>
        )}
      </Modal>

      {/* Modal Xem Chi Tiết Work Order */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileTextOutlined style={{ color: "#52c41a" }} />
            <span>Chi Tiết Work Order</span>
          </div>
        }
        open={isViewWorkOrderModalVisible}
        onCancel={() => {
          setIsViewWorkOrderModalVisible(false);
          setViewingWorkOrder(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsViewWorkOrderModalVisible(false);
              setViewingWorkOrder(null);
            }}
          >
            Đóng
          </Button>
        ]}
        width={900}
      >
        {viewingWorkOrder && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã Work Order" span={1}>
                <Tag color="green">
                  WO{String(viewingWorkOrder.workOrderId).padStart(4, "0")}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái" span={1}>
                {viewingWorkOrder.status === 'Completed' && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    Hoàn thành
                  </Tag>
                )}
                {viewingWorkOrder.status === 'Cancelled' && (
                  <Tag color="error" icon={<CloseCircleOutlined />}>
                    Đã hủy
                  </Tag>
                )}
                {viewingWorkOrder.status === 'Overdue' && (
                  <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                    Quá hạn
                  </Tag>
                )}
                {viewingWorkOrder.status === 'InProgress' && (
                  <Tag color="processing" icon={<PlayCircleOutlined />}>
                    Đang thực hiện
                  </Tag>
                )}
                {viewingWorkOrder.status === 'Pending' && (
                  <Tag color="default" icon={<ClockCircleOutlined />}>
                    Chờ xử lý
                  </Tag>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Kế Hoạch" span={2}>
                <Tag color="blue">
                  PLAN{String(viewingWorkOrder.planId).padStart(4, "0")}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày Lên Lịch" span={1}>
                <Text>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {dayjs(viewingWorkOrder.scheduledDate).format("DD/MM/YYYY")}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày Bắt Đầu" span={1}>
                {viewingWorkOrder.startedDate ? (
                  <Text type="success">
                    {dayjs(viewingWorkOrder.startedDate).format("DD/MM/YYYY HH:mm")}
                  </Text>
                ) : (
                  <Text type="secondary">Chưa bắt đầu</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày Hoàn Thành" span={2}>
                {viewingWorkOrder.completedDate ? (
                  <Text type="success">
                    <CheckOutlined style={{ marginRight: 4 }} />
                    {dayjs(viewingWorkOrder.completedDate).format("DD/MM/YYYY HH:mm")}
                  </Text>
                ) : (
                  <Text type="secondary">Chưa hoàn thành</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Kỹ Thuật Viên Cơ Khí" span={1}>
                {viewingWorkOrder.mechanicalTechnicianName ? (
                  <div>
                    <Tag color="orange" icon={<ToolOutlined />}>
                      Cơ khí
                    </Tag>
                    <Text>{viewingWorkOrder.mechanicalTechnicianName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Mã NV: {viewingWorkOrder.mechanicalTechnicianEmployeeCode}
                    </Text>
                  </div>
                ) : (
                  <Text type="secondary">Chưa phân công</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Kỹ Thuật Viên Điện" span={1}>
                {viewingWorkOrder.electricalTechnicianName ? (
                  <div>
                    <Tag color="blue" icon={<ThunderboltOutlined />}>
                      Điện
                    </Tag>
                    <Text>{viewingWorkOrder.electricalTechnicianName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Mã NV: {viewingWorkOrder.electricalTechnicianEmployeeCode}
                    </Text>
                  </div>
                ) : (
                  <Text type="secondary">Chưa phân công</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Ghi Chú Hoàn Thành" span={2}>
                {viewingWorkOrder.completionNotes ? (
                  <Text>{viewingWorkOrder.completionNotes}</Text>
                ) : (
                  <Text type="secondary">Không có ghi chú</Text>
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* Checklist Items */}
            {viewingWorkOrder.checklistItems && viewingWorkOrder.checklistItems.length > 0 && (
              <>
                <Divider orientation="left">
                  <CheckOutlined /> Checklist ({viewingWorkOrder.checklistItems.length} items)
                </Divider>
                <List
                  dataSource={viewingWorkOrder.checklistItems}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          item.isCompleted ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                          ) : (
                            <CloseOutlined style={{ color: '#d9d9d9', fontSize: 20 }} />
                          )
                        }
                        title={
                          <div>
                            <Text strong>{item.itemDescription}</Text>
                            {item.category && (
                              <Tag 
                                color={item.category === 'Mechanical' ? 'orange' : 'blue'} 
                                style={{ marginLeft: 8 }}
                              >
                                {item.category === 'Mechanical' ? 'Cơ khí' : 'Điện'}
                              </Tag>
                            )}
                            {item.isRequired && (
                              <Tag color="red" style={{ marginLeft: 8 }}>Bắt buộc</Tag>
                            )}
                          </div>
                        }
                        description={
                          item.notes ? (
                            <Text type="secondary" italic>{item.notes}</Text>
                          ) : null
                        }
                      />
                      {item.completedDate && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <ClockCircleOutlined /> {dayjs(item.completedDate).format("DD/MM/YYYY HH:mm")}
                        </Text>
                      )}
                    </List.Item>
                  )}
                />
              </>
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

      {/* View Template Detail Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            Chi tiết Mẫu Bảo Trì
          </Space>
        }
        open={isViewTemplateModalVisible}
        onCancel={() => {
          setIsViewTemplateModalVisible(false);
          setViewingTemplate(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsViewTemplateModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={900}
      >
        {viewingTemplate && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã Template" span={1}>
                <Tag color="blue">TPL{String(viewingTemplate.templateId).padStart(3, "0")}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag color={viewingTemplate.isActive ? "green" : "default"}>
                  {viewingTemplate.isActive ? "Hoạt động" : "Không hoạt động"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tên Mẫu" span={1}>
                <Text strong>{viewingTemplate.templateName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Công Đoạn" span={1}>
                <Text>{viewingTemplate.stageName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mô Tả" span={2}>
                <Text type="secondary">{viewingTemplate.description || "Không có mô tả"}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Các Bước Kiểm Tra ({viewingTemplate.templateItems?.length || 0})</Divider>
            <Table
              dataSource={viewingTemplate.templateItems || []}
              rowKey="itemId"
              pagination={false}
              size="small"
              columns={[
                {
                  title: "STT",
                  dataIndex: "orderIndex",
                  key: "orderIndex",
                  width: 60,
                  align: "center",
                },
                {
                  title: "Tên Bước",
                  dataIndex: "stepName",
                  key: "stepName",
                  width: 250,
                },
                {
                  title: "Mô Tả",
                  dataIndex: "stepDescription",
                  key: "stepDescription",
                  render: (text) => text || <Text type="secondary">Không có</Text>,
                },
                {
                  title: "Loại",
                  dataIndex: "category",
                  key: "category",
                  width: 120,
                  render: (category) => (
                    <Tag color={category === "Electrical" ? "blue" : "green"}>
                      {category === "Electrical" ? "Điện" : "Cơ"}
                    </Tag>
                  ),
                },
                
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaintenanceManagement;
