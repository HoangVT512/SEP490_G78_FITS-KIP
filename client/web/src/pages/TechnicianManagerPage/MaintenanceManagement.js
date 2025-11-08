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
  getAllTechnicians,
  getMaintenanceStats,
  getUpcomingMaintenance,
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



  // Modal states
  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [isWorkOrderModalVisible, setIsWorkOrderModalVisible] = useState(false);
    useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);

  const [editingPlan, setEditingPlan] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingWorkOrder, setEditingWorkOrder] = useState(null);

  // Forms
  const [planForm] = Form.useForm();
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
