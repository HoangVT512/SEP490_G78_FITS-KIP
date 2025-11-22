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
  Row,
  Col,
  Statistic,
  Descriptions,
  Typography,
  Tooltip,
  Badge,
  Alert,
  Divider,
  List,
  Checkbox,
  Popconfirm,
  Dropdown,
  Progress,
} from "antd";
import {
  EyeOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  CalendarOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  SearchOutlined,
  PushpinOutlined,
  FileTextOutlined,
  EditOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getUpcomingMaintenance,
  getAllWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  postponeMaintenancePlan,
  postponeWorkOrder,
  cancelWorkOrder,
  closeWorkOrder,
  getAllTechnicians,
} from "../../services/maintenanceService";
import { replacementHistoryService } from "../../services/replacementHistoryService";
import { authService } from "../../services/authService";
import signalRService from "../../services/signalRService";

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;
const { Text } = Typography;

const WorkScheduleManagement = ({ openWorkOrderCode }) => {
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // ← Thêm state để chuyển giữa View và Edit
  const [isPostponeModalVisible, setIsPostponeModalVisible] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [hasFormChanges, setHasFormChanges] = useState(false); // ← Track thay đổi form
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Forms
  const [detailForm] = Form.useForm(); // ← Đổi tên từ assignForm sang detailForm
  const [postponeForm] = Form.useForm();

  // Data states
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [mechanicalTechs, setMechanicalTechs] = useState([]);
  const [electricalTechs, setElectricalTechs] = useState([]);
  const [workOrderSparePartRequests, setWorkOrderSparePartRequests] = useState({});
  const [workOrderSparePartsList, setWorkOrderSparePartsList] = useState([]);
  const [templateChecklistItems, setTemplateChecklistItems] = useState([]); // ← Thêm state riêng cho checklist
  const [techWorkload, setTechWorkload] = useState({}); // ← Thêm state để lưu workload của KTV theo ngày

  // Statistics
  const [stats, setStats] = useState({
    pendingCount: 0,
    inProgressCount: 0,
    overdueCount: 0,
    completedCount: 0,
    closedCount: 0,
  });

  useEffect(() => {
    loadAllData();
  }, []);

  // ✅ Lắng nghe SignalR notification để reload data
  useEffect(() => {
    const handleWorkOrderNotification = (notificationData) => {
      if (notificationData.Type === "workOrderCompleted") {
        // Reload data khi có WorkOrder hoàn thành
        loadAllData();
        
        // Hiển thị message
        message.success({
          content: notificationData.Message,
          duration: 5,
          onClick: () => {
            // Nếu có workOrderId, mở modal detail
            if (notificationData.WorkOrderId) {
              const workOrder = workOrders.find(
                wo => wo.workOrderId === notificationData.WorkOrderId
              );
              if (workOrder) {
                handleViewDetail(workOrder);
              }
            }
          },
        });
      }
    };

    // Đăng ký listener
    signalRService.onReceiveNotification(handleWorkOrderNotification);

    // Cleanup
    return () => {
      signalRService.offReceiveNotification(handleWorkOrderNotification);
    };
  }, [workOrders]); // Dependency on workOrders để có data mới nhất

  // ✅ Tự động mở WorkOrder khi navigate từ notification
  useEffect(() => {
    if (openWorkOrderCode && workOrders.length > 0) {
      const workOrder = workOrders.find(wo => wo.workOrderCode === openWorkOrderCode);
      if (workOrder) {
        handleViewDetail(workOrder);
      }
    }
  }, [openWorkOrderCode, workOrders]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUpcomingMaintenance(),
        loadWorkOrders(),
        loadTechnicians(),
      ]);
    } catch (error) {
      message.error("Tải dữ liệu thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingMaintenance = async () => {
    try {
      const response = await getUpcomingMaintenance(7);
      setUpcomingMaintenance(response?.data || []);
    } catch (error) {
      console.error("Load upcoming maintenance error:", error);
    }
  };

  const loadWorkOrders = async () => {
    try {
      const response = await getAllWorkOrders();
      setWorkOrders(response?.data || []);

      if (response?.data && response.data.length > 0) {
        await fetchSparePartRequestsForWorkOrders(response.data);
      }
    } catch (error) {
      console.error("Load work orders error:", error);
    }
  };

  const fetchSparePartRequestsForWorkOrders = async (workOrders) => {
    try {
      const requestMap = {};
      const promises = workOrders.map((wo) =>
        replacementHistoryService
          .getByWorkOrderId(wo.workOrderId)
          .then((histories) => {
            const pendingCount = (histories || []).filter(
              (h) => h.status === "Chờ duyệt cấp phát"
            ).length;
            if (pendingCount > 0) {
              requestMap[wo.workOrderId] = pendingCount;
            }
          })
          .catch((err) => console.error(`Error fetching spare parts:`, err))
      );
      await Promise.all(promises);
      setWorkOrderSparePartRequests(requestMap);
    } catch (error) {
      console.error("Fetch spare part requests error:", error);
    }
  };

  const loadTechnicians = async () => {
    try {
      const response = await getAllTechnicians();
      const techData = response?.data || [];
      setMechanicalTechs(techData);
      setElectricalTechs(techData);
    } catch (error) {
      console.error("Load technicians error:", error);
    }
  };

  // Gộp upcomingMaintenance và workOrders thành 1 danh sách
  useEffect(() => {
    const merged = [];

    // 1. Thêm Plans chưa có WorkOrder (Chờ giao việc)
    upcomingMaintenance.forEach((plan) => {
      if (!plan.hasActiveWorkOrder) {
        merged.push({
          ...plan,
          type: "plan",
          workStatus: "pending",
          displayStatus: "Chờ giao việc",
          sortDate: new Date(plan.postponedDueDate || plan.nextDueDate),
        });
      }
    });

    // 2. Thêm WorkOrders (đã tạo)
    workOrders.forEach((wo) => {
      // ✅ Normalize status: trim và lowercase để so sánh
      const normalizedStatus = wo.status?.trim();
      
      let workStatus = "pending"; // ✅ Mặc định là pending
      
      if (normalizedStatus === "Đang thực hiện" || normalizedStatus === "InProgress") {
        workStatus = "inProgress";
      } else if (normalizedStatus === "Hoàn thành" || normalizedStatus === "Completed") {
        workStatus = "completed";
      } else if (normalizedStatus === "Đã đóng" || normalizedStatus === "Closed") {
        workStatus = "closed";
      } else if (normalizedStatus === "Đã hủy" || normalizedStatus === "Cancelled") {
        workStatus = "cancelled";
      } else if (normalizedStatus === "Quá hạn" || normalizedStatus === "Overdue") {
        workStatus = "overdue";
      } else if (normalizedStatus === "Hoãn" || normalizedStatus === "Postponed") {
        workStatus = "postponed";
      }

      merged.push({
        ...wo,
        type: "workOrder",
        workStatus,
        sortDate: new Date(wo.dueDate),
      });
    });

    // Sắp xếp ưu tiên theo trạng thái: Quá hạn → Chờ xử lý → Đang thực hiện → Khác
    // Trong cùng trạng thái thì sắp xếp theo ngày tạo mới nhất
    merged.sort((a, b) => {
      const statusPriority = {
        overdue: 1,
        pending: 2,
        inProgress: 3,
        completed: 4,
        postponed: 5,
        closed: 6,
        cancelled: 7,
      };

      const priorityA = statusPriority[a.workStatus] || 99;
      const priorityB = statusPriority[b.workStatus] || 99;

      // Ưu tiên theo trạng thái trước
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Trong cùng trạng thái, sắp xếp theo ngày tạo mới nhất
      const dateA = new Date(a.createdDate || 0);
      const dateB = new Date(b.createdDate || 0);
      return dateB - dateA;
    });

    setMergedData(merged);

    // Calculate stats
    const pendingCount = merged.filter((m) => m.workStatus === "pending").length;
    const inProgressCount = merged.filter((m) => m.workStatus === "inProgress").length;
    const overdueCount = merged.filter((m) => m.workStatus === "overdue").length;
    const completedCount = merged.filter((m) => m.workStatus === "completed").length;
    const closedCount = merged.filter((m) => m.workStatus === "closed").length;

    setStats({
      pendingCount,
      inProgressCount,
      overdueCount,
      completedCount,
      closedCount,
    });
  }, [upcomingMaintenance, workOrders]);

  // Filter data
  const getFilteredData = () => {
    let filtered = mergedData;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.workStatus === statusFilter);
    }

    // Filter by search
    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          item.equipmentName?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.equipmentCode?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.electricalTechnicianName?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.mechanicalTechnicianName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Sắp xếp ưu tiên theo trạng thái, sau đó theo ngày tạo
    return filtered.sort((a, b) => {
      const statusPriority = {
        overdue: 1,
        pending: 2,
        inProgress: 3,
        completed: 4,
        postponed: 5,
        closed: 6,
        cancelled: 7,
      };

      const priorityA = statusPriority[a.workStatus] || 99;
      const priorityB = statusPriority[b.workStatus] || 99;

      // Ưu tiên theo trạng thái trước
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Trong cùng trạng thái, sắp xếp theo ngày tạo mới nhất
      const dateA = new Date(a.createdDate || 0);
      const dateB = new Date(b.createdDate || 0);
      return dateB - dateA;
    });
  };

  // Handlers
  const handleViewDetail = async (record) => {
    console.log("🔍 Record clicked:", record);
    
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
    setIsEditMode(false); // ← Luôn vào chế độ View khi ấn "Xem"
    setTemplateChecklistItems([]); // ← Reset trước khi load

    // ✅ Load template checklist
    if (record.type === "workOrder" && record.workOrderId) {
      // ✅ Reload WorkOrder từ API để lấy checklist items mới nhất
      try {
        const { getWorkOrderById } = require("../../services/maintenanceService");
        const workOrderResponse = await getWorkOrderById(record.workOrderId);
        
        if (workOrderResponse?.data?.checklistItems && workOrderResponse.data.checklistItems.length > 0) {
          console.log("✅ WorkOrder reloaded với checklistItems:", workOrderResponse.data.checklistItems);
          setTemplateChecklistItems(workOrderResponse.data.checklistItems);
        }
        // Nếu vẫn không có checklist, load từ template
        else if (record.templateId) {
          const { getTemplateById } = require("../../services/maintenanceService");
          const templateResponse = await getTemplateById(record.templateId);
          
          if (templateResponse?.data?.templateItems) {
            console.log("✅ Template loaded từ WorkOrder templateId:", templateResponse.data);
            setTemplateChecklistItems(templateResponse.data.templateItems);
          }
        }
      } catch (error) {
        console.error("❌ Load WorkOrder checklist error:", error);
      }
    } 
    // ✅ Nếu là Plan: Load template từ templateId
    else if (record.type === "plan" && record.templateId) {
      try {
        const { getTemplateById } = require("../../services/maintenanceService");
        const templateResponse = await getTemplateById(record.templateId);
        
        if (templateResponse?.data?.templateItems) {
          console.log("✅ Template loaded từ Plan:", templateResponse.data);
          setTemplateChecklistItems(templateResponse.data.templateItems);
        }
      } catch (error) {
        console.error("❌ Load template checklist error:", error);
      }
    }

    // Load spare parts nếu là WorkOrder
    if (record.workOrderId) {
      try {
        const histories = await replacementHistoryService.getByWorkOrderId(
          record.workOrderId
        );
        setWorkOrderSparePartsList(histories || []);
      } catch (error) {
        console.error("Fetch spare parts error:", error);
      }
    }
  };

  const handleAssignWork = async (record) => {
    setSelectedRecord(record);
    detailForm.resetFields();
    setHasFormChanges(false); // ← Reset tracking
    setTemplateChecklistItems([]); // ← Reset trước khi load
    
    if (record.type === "workOrder") {
      // ✅ Load template checklist - ưu tiên checklistItems, nếu không có thì load từ templateId
      if (record.checklistItems && record.checklistItems.length > 0) {
        console.log("✅ WorkOrder đã có checklistItems:", record.checklistItems);
        setTemplateChecklistItems(record.checklistItems);
      } else if (record.templateId) {
        try {
          const { getTemplateById } = require("../../services/maintenanceService");
          const templateResponse = await getTemplateById(record.templateId);
          
          if (templateResponse?.data?.templateItems) {
            console.log("✅ Template loaded từ WorkOrder templateId:", templateResponse.data);
            setTemplateChecklistItems(templateResponse.data.templateItems);
          }
        } catch (error) {
          console.error("❌ Load template checklist error:", error);
        }
      }
      
      const scheduledDate = dayjs(record.scheduledDate);
      detailForm.setFieldsValue({
        scheduledDate: scheduledDate,
        assignedToElectrical: record.assignedToElectrical,
        assignedToMechanical: record.assignedToMechanical,
        notes: record.notes,
      });
      
      // ✅ Load workload cho ngày scheduledDate (gửi Date object)
      await loadTechWorkloadForDate(scheduledDate.toDate());
    } else {
      if (record.templateId) {
        try {
          const { getTemplateById } = require("../../services/maintenanceService");
          const templateResponse = await getTemplateById(record.templateId);
          
          if (templateResponse?.data?.templateItems) {
            setTemplateChecklistItems(templateResponse.data.templateItems);
          } else {
            setTemplateChecklistItems([]);
          }
        } catch (error) {
          console.error("Load template checklist error:", error);
          setTemplateChecklistItems([]);
        }
      } else {
        setTemplateChecklistItems([]);
      }
      
      const defaultDate = record.postponedDueDate
        ? dayjs(record.postponedDueDate)
        : dayjs(record.nextDueDate);
      detailForm.setFieldsValue({
        scheduledDate: defaultDate,
      });
      
      // ✅ Load workload cho ngày mặc định
      await loadTechWorkloadForDate(defaultDate.toDate());
    }

    setIsEditMode(true);
    setIsDetailModalVisible(true);
  };

  // ✅ Hàm load workload của KTV theo ngày - SỬA FORMAT NGÀY
  const loadTechWorkloadForDate = async (date) => {
    try {
      const { getTechniciansWorkloadByDate } = require("../../services/maintenanceService");
      
      // ✅ Format ngày theo định dạng YYYY-MM-DD để gửi lên API
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      console.log("🔄 Loading workload for date:", formattedDate);
      
      const response = await getTechniciansWorkloadByDate(formattedDate);
      
      if (response?.data) {
        // Convert array to object map: { userId: workOrderCount }
        const workloadMap = {};
        response.data.forEach(item => {
          workloadMap[item.userId] = item.workOrderCount;
        });
        setTechWorkload(workloadMap);
        console.log("✅ Loaded workload:", workloadMap);
      } else {
        console.log("⚠️ No workload data returned");
        setTechWorkload({});
      }
    } catch (error) {
      console.error("❌ Load tech workload error:", error);
      setTechWorkload({});
    }
  };

  // ✅ Handle khi thay đổi ngày trong DatePicker
  const handleScheduledDateChange = async (date) => {
    if (date) {
      await loadTechWorkloadForDate(date.toDate());
    } else {
      setTechWorkload({});
    }
  };

  const getChecklistJobTypes = () => {
    const hasElectrical = templateChecklistItems.some(item => item.category === "Electrical");
    const hasMechanical = templateChecklistItems.some(item => item.category === "Mechanical");
    
    return { hasElectrical, hasMechanical };
  };

  const handleAssignSubmit = async (values) => {
    setLoading(true);
    try {
      // ===== VALIDATION =====
      const jobTypes = getChecklistJobTypes();
      const scheduledDate = dayjs(values.scheduledDate);
      const today = dayjs().startOf('day');
      
      // Validate ngày không được là quá khứ
      if (scheduledDate.isBefore(today)) {
        message.error('Ngày bảo trì không được là ngày trong quá khứ!');
        setLoading(false);
        return;
      }
      
      // Validate phải có ít nhất 1 KTV được chọn
      if (!values.assignedToElectrical && !values.assignedToMechanical) {
        message.error('Vui lòng chọn ít nhất 1 kỹ thuật viên!');
        setLoading(false);
        return;
      }
      
      // Validate KTV điện nếu có công việc điện
      if (jobTypes.hasElectrical && !values.assignedToElectrical) {
        message.error('Mẫu bảo trì có công việc điện, vui lòng chọn KTV điện!');
        setLoading(false);
        return;
      }
      
      // Validate KTV cơ khí nếu có công việc cơ khí
      if (jobTypes.hasMechanical && !values.assignedToMechanical) {
        message.error('Mẫu bảo trì có công việc cơ khí, vui lòng chọn KTV cơ khí!');
        setLoading(false);
        return;
      }
      
      if (selectedRecord.type === "workOrder") {
        // ===== CẬP NHẬT WORKORDER =====
        if (!selectedRecord.workOrderId) {
          message.error('Không tìm thấy mã WorkOrder để cập nhật!');
          setLoading(false);
          return;
        }
        
        // ✅ Validate notes bắt buộc khi đổi KTV cho WorkOrder đang thực hiện
        if ((selectedRecord.status === "Đang thực hiện" || selectedRecord.workStatus === "inProgress") && !values.notes) {
          message.error('Vui lòng nhập lý do thay đổi KTV!');
          setLoading(false);
          return;
        }
        
        // Validate ngày không được sau dueDate
        const dueDate = dayjs(selectedRecord.dueDate).endOf('day');
        if (scheduledDate.isAfter(dueDate)) {
          message.error(`Ngày bảo trì không được sau ngày đến hạn (${dueDate.format('DD/MM/YYYY')})!`);
          setLoading(false);
          return;
        }
        
        const updateData = {
          scheduledDate: scheduledDate.format('YYYY-MM-DD'),
          assignedToElectrical: values.assignedToElectrical || null,
          assignedToMechanical: values.assignedToMechanical || null,
          notes: values.notes || '',
        };
        
        console.log('🔄 Updating WorkOrder ID:', selectedRecord.workOrderId);
        console.log('🔄 Update Data:', updateData);
        
        const response = await updateWorkOrder(selectedRecord.workOrderId, updateData);
        console.log('✅ Update response:', response);
        
        message.success('Cập nhật phân công thành công!');
        
        // Reload data
        await loadAllData();
        
        // Tìm và update selectedRecord với data mới
        const updatedWorkOrders = await getAllWorkOrders();
        const updatedRecord = updatedWorkOrders?.data?.find(
          wo => wo.workOrderId === selectedRecord.workOrderId
        );
        
        if (updatedRecord) {
          setSelectedRecord(updatedRecord);
          setTemplateChecklistItems(updatedRecord.checklistItems || []);
        }
        
        setIsEditMode(false);
        setHasFormChanges(false);
        
      } else {
        // ===== TẠO WORKORDER MỚI TỪ PLAN =====
        
        // Validate ngày không được sau dueDate của Plan
        const planDueDate = selectedRecord.postponedDueDate
          ? dayjs(selectedRecord.postponedDueDate).endOf('day')
          : dayjs(selectedRecord.nextDueDate).endOf('day');
          
        if (scheduledDate.isAfter(planDueDate)) {
          message.error(`Ngày bảo trì không được sau ngày đến hạn (${planDueDate.format('DD/MM/YYYY')})!`);
          setLoading(false);
          return;
        }
        
        const createData = {
          planId: selectedRecord.planId,
          scheduledDate: scheduledDate.format('YYYY-MM-DD'),
          assignedToElectrical: values.assignedToElectrical || null,
          assignedToMechanical: values.assignedToMechanical || null,
          notes: values.notes || '',
        };
        
        console.log('🆕 Creating WorkOrder:', createData);
        
        await createWorkOrder(createData);
        message.success('Giao việc thành công!');
        
        // Reload và đóng modal
        await loadAllData();
        setIsDetailModalVisible(false);
        detailForm.resetFields();
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePostpone = (record) => {
    setSelectedRecord(record);
    postponeForm.resetFields();
    setIsPostponeModalVisible(true);
  };

  const handlePostponeSubmit = async (values) => {
    setLoading(true);
    try {
      if (selectedRecord.type === "workOrder") {
        // Hoãn WorkOrder - gửi NewScheduledDate
        await postponeWorkOrder(selectedRecord.workOrderId, {
          newScheduledDate: values.newScheduledDate.toISOString(),
          reason: values.reason,
        });
        message.success(`✅ Hoãn phiếu bảo trì đến ngày ${values.newScheduledDate.format('DD/MM/YYYY')}!`);
      } else {
        // Hoãn Plan (chưa có WorkOrder)
        await postponeMaintenancePlan(selectedRecord.planId, {
          postponeDays: values.postponeDays,
          reason: values.reason,
        });
        message.success(`✅ Hoãn kế hoạch bảo trì thành công ${values.postponeDays} ngày!`);
      }

      setIsPostponeModalVisible(false);
      postponeForm.resetFields();
      loadAllData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOverdueWorkOrder = async (record) => {
    try {
      setLoading(true);
      
      if (!record.workOrderId) {
        message.error("Không tìm thấy mã WorkOrder!");
        return;
      }
      
      // Gọi API hủy WorkOrder
      await cancelWorkOrder(record.workOrderId, "Hủy lần bảo trì do quá hạn - TechManager quyết định");
      
      message.success("✅ Đã hủy lần bảo trì này. Chu kỳ tiếp theo sẽ được cập nhật!");
      
      // Đóng modal và reload data
      setIsDetailModalVisible(false);
      await loadAllData();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi hủy WorkOrder";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSparepart = async (record) => {
    try {
      setLoading(true);
      await replacementHistoryService.update(record.replacementID, {
        ...record,
        status: "Đã duyệt cấp phát",
      });
      message.success("Duyệt linh kiện thành công!");

      if (selectedRecord?.workOrderId) {
        const histories = await replacementHistoryService.getByWorkOrderId(
          selectedRecord.workOrderId
        );
        setWorkOrderSparePartsList(histories || []);
      }

      loadWorkOrders();
    } catch (error) {
      message.error("Duyệt linh kiện thất bại: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handler đóng phiếu bảo trì (QLKT)
  const handleCloseWorkOrder = async (workOrderId) => {
    Modal.confirm({
      title: "Xác nhận đóng phiếu bảo trì",
      content: (
        <div>
          <p>Bạn có chắc chắn muốn đóng phiếu bảo trì này?</p>
          <p style={{ color: '#ff4d4f', marginTop: 8 }}>
            ⚠️ Sau khi đóng, chu kỳ bảo trì tiếp theo sẽ được kích hoạt và không thể hoàn tác.
          </p>
        </div>
      ),
      okText: "Đồng ý đóng",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          await closeWorkOrder(workOrderId);
          message.success("✅ Đã đóng phiếu bảo trì và kích hoạt chu kỳ tiếp theo!");
          setIsDetailModalVisible(false);
          await loadAllData();
        } catch (error) {
          message.error("❌ Đóng phiếu bảo trì thất bại: " + error.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleRejectSparepart = (record) => {
    Modal.confirm({
      title: "Từ chối yêu cầu linh kiện",
      content: `Bạn có chắc muốn từ chối yêu cầu ${record.partName}?`,
      okText: "Từ chối",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          await replacementHistoryService.update(record.replacementID, {
            ...record,
            status: "Đã từ chối",
          });
          message.success("Từ chối thành công!");

          if (selectedRecord?.workOrderId) {
            const histories = await replacementHistoryService.getByWorkOrderId(
              selectedRecord.workOrderId
            );
            setWorkOrderSparePartsList(histories || []);
          }

          loadWorkOrders();
        } catch (error) {
          message.error("Từ chối thất bại: " + error.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleConfirmReturn = (record) => {
    Modal.confirm({
      title: "Xác nhận trả lại kho",
      content: (
        <div>
          <p>
            Xác nhận trả lại <strong>{record.quantityToReturn}</strong> cái{" "}
            <strong>{record.partName}</strong> vào kho?
          </p>
        </div>
      ),
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          const currentUser = authService.getStoredUser();

          await replacementHistoryService.confirmReturn(record.replacementID, {
            actualQuantityUsed: record.actualQuantityUsed || record.quantity,
            returnedDate: new Date(),
            returnConfirmedBy:
              currentUser?.fullName || currentUser?.userName || "Admin",
            returnRemarks: `Trả lại ${record.quantityToReturn} cái`,
          });
          message.success("Xác nhận trả lại kho thành công!");

          if (selectedRecord?.workOrderId) {
            const histories = await replacementHistoryService.getByWorkOrderId(
              selectedRecord.workOrderId
            );
            setWorkOrderSparePartsList(histories || []);
          }

          loadWorkOrders();
        } catch (error) {
          message.error("Xác nhận thất bại: " + error.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Get status tag
  const getStatusTag = (record) => {
    // ✅ Map từ status tiếng Việt (DB) sang config
    const statusMap = {
      "Chờ xử lý": "pending",
      "Cho xu ly": "pending", // Fallback không dấu
      "Đang thực hiện": "inProgress",
      "Dang thuc hien": "inProgress", // Fallback không dấu
      "Hoàn thành": "completed",
      "Hoan thanh": "completed", // Fallback không dấu
      "Đã đóng": "closed",
      "Da dong": "closed", // Fallback không dấu
      "Đã hủy": "cancelled",
      "Da huy": "cancelled", // Fallback không dấu
      "Quá hạn": "overdue",
      "Qua han": "overdue", // Fallback không dấu
      "Hoãn": "postponed",
      "Hoan": "postponed", // Fallback không dấu
    };

    const statusConfig = {
      pending: {
        color: "gold",
        icon: <ClockCircleOutlined />,
        text: "Chờ xử lý",
      },
      inProgress: {
        color: "blue",
        icon: <PlayCircleOutlined />,
        text: "Đang thực hiện",
      },
      completed: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Hoàn thành",
      },
      closed: {
        color: "default",
        icon: <LockOutlined />,
        text: "Đã đóng",
      },
      cancelled: {
        color: "red",
        icon: <StopOutlined />,
        text: "Đã hủy",
      },
      overdue: {
        color: "red",
        icon: <ExclamationCircleOutlined />,
        text: "Quá hạn",
      },
      postponed: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Hoãn",
      },
    };
    
    const normalizedStatus = record.status?.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let statusKey = record.status ? statusMap[record.status] : null;
    
    if (!statusKey && normalizedStatus) {
      const normalizedMap = {
        'cho xu ly': 'pending',
        'dang thuc hien': 'inProgress',
        'hoan thanh': 'completed',
        'da dong': 'closed',
        'da huy': 'cancelled',
        'qua han': 'overdue',
        'hoan': 'postponed',
      };
      statusKey = normalizedMap[normalizedStatus];
    }
    
    // Fallback về workStatus hoặc pending
    if (!statusKey) {
      statusKey = record.workStatus?.toLowerCase() || 'pending';
    }
    
    const config = statusConfig[statusKey] || statusConfig.pending;
    
    // ✅ Nếu WorkOrder đã bị hoãn, hiển thị cả status Hoãn
    const isPostponed = record.type === "workOrder" && record.postponedDate;
    
    // Nếu là WorkOrder đã giao việc (assigned/Pending), hiển thị thêm ngày scheduledDate
    if (record.type === "workOrder" && (statusKey === "pending" || record.workStatus === "assigned") && record.scheduledDate) {
      return (
        <div>
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
          {isPostponed && (
            <Tag icon={<ClockCircleOutlined />} color="orange" style={{ marginLeft: 4 }}>
              Hoãn
            </Tag>
          )}
          <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
            {dayjs(record.scheduledDate).format("DD/MM/YYYY")}
          </div>
        </div>
      );
    }
    
    // Nếu là status khác nhưng vẫn bị hoãn
    if (isPostponed) {
      return (
        <div>
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
          <Tag icon={<ClockCircleOutlined />} color="orange" style={{ marginLeft: 4 }}>
            Hoãn
          </Tag>
        </div>
      );
    }
    
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  // Table columns
  const columns = [
    {
      title: "Mã",
      key: "code",
      width: 100,
      render: (_, record) => {
        if (record.type === "plan") {
          return <Text strong>PLAN{record.planId}</Text>;
        } else {
          const sparePartCount = workOrderSparePartRequests[record.workOrderId] || 0;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text strong>{record.workOrderCode || `WO${record.workOrderId}`}</Text>
              {sparePartCount > 0 && (
                <Tooltip title={`${sparePartCount} yêu cầu linh kiện chờ duyệt`}>
                  <Badge count={sparePartCount} style={{ backgroundColor: "#ff4d4f" }} />
                </Tooltip>
              )}
            </div>
          );
        }
      },
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 160,
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.equipmentCode}
          </Text>
        </div>
      ),
    },
    {
      title: "Vị trí",
      key: "location",
      width: 120,
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
      title: "Ngày đến hạn",
      key: "dueDate",
      width: 130,
      render: (_, record) => {
        const dueDate =
          record.type === "plan"
            ? record.postponedDueDate
              ? dayjs(record.postponedDueDate)
              : dayjs(record.nextDueDate)
            : dayjs(record.dueDate);

        const isClosed = record.workStatus === "Đã đóng" || record.workStatus === "closed";

        if (isClosed) {
          return (
            <div>
              <div>{dueDate.format("DD/MM/YYYY")}</div>
            </div>
          );
        }

        const today = dayjs().startOf('day');
        const dueDateStart = dueDate.startOf('day');
        const daysUntilDue = dueDateStart.diff(today, "day");
        const isOverdue = daysUntilDue < 0;
        
        // ✅ Lấy reminderDaysBefore từ record (mặc định 3 ngày)
        const reminderDays = record.reminderDaysBefore || 3;
        const isUpcomingSoon = daysUntilDue <= reminderDays && daysUntilDue >= 0;

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
              {dueDate.format("DD/MM/YYYY")}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {daysUntilDue > 0
                ? `Còn ${daysUntilDue} ngày`
                : daysUntilDue === 0
                ? "Hôm nay"
                : `Quá ${Math.abs(daysUntilDue)} ngày`}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Người phụ trách",
      key: "assignedTechnicians",
      width: 160,
      render: (_, record) => {
        if (
          record.type === "plan" ||
          (!record.electricalTechnicianName && !record.mechanicalTechnicianName)
        ) {
          return (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chưa giao việc
            </Text>
          );
        }

        return (
          <div>
            {record.electricalTechnicianName && (
              <div style={{ marginBottom: 2 }}>
                <ThunderboltOutlined
                  style={{ color: "#1890ff", marginRight: 4, fontSize: 12 }}
                />
                <Text style={{ fontSize: 12 }}>
                  {record.electricalTechnicianName}
                </Text>
              </div>
            )}
            {record.mechanicalTechnicianName && (
              <div>
                <ToolOutlined
                  style={{ color: "#52c41a", marginRight: 4, fontSize: 12 }}
                />
                <Text style={{ fontSize: 12 }}>
                  {record.mechanicalTechnicianName}
                </Text>
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
      render: (_, record) => getStatusTag(record),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Lịch bảo trì & Công việc" bordered={false}>
        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Chờ giao việc"
                value={stats.pendingCount}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Đang thực hiện"
                value={stats.inProgressCount}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Quá hạn"
                value={stats.overdueCount}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
             <Card bordered={false}>
              <Statistic
                title="Hoàn thành"
                value={stats.completedCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
             <Card bordered={false}>
              <Statistic
                title="Đã đóng"
                value={stats.closedCount}
                prefix={<LockOutlined />}
                valueStyle={{ color: "#8c8c8c" }}
              />
            </Card>
          </Col>
        </Row>

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Search
                placeholder="Tìm theo thiết bị, mã thiết bị, KTV"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: "100%", height: 32 }}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="pending">
                  <ClockCircleOutlined /> Chờ xử lý
                </Option>
                <Option value="inProgress">
                  <PlayCircleOutlined /> Đang thực hiện
                </Option>
                <Option value="overdue">
                  <ExclamationCircleOutlined /> Quá hạn
                </Option>
                <Option value="completed">
                  <CheckCircleOutlined /> Hoàn thành
                </Option>
                <Option value="closed">
                  <LockOutlined /> Đã đóng
                </Option>
                <Option value="cancelled">
                  <StopOutlined /> Đã hủy
                </Option>
              </Select>
            </Col>
            <Col xs={24} md={6} style={{ textAlign: "right" }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadAllData}
              >
                Làm mới
              </Button>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={getFilteredData()}
            rowKey={(record) =>
              record.type === "plan"
                ? `plan-${record.planId}`
                : `wo-${record.workOrderId}`
            }
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} mục`,
            }}
          />
        </Space>
      </Card>

      {/* Postpone Modal */}
      <Modal
        title="Hoãn bảo trì"
        open={isPostponeModalVisible}
        onCancel={() => {
          setIsPostponeModalVisible(false);
          postponeForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={postponeForm}
          layout="vertical"
          onFinish={handlePostponeSubmit}
        >
          <Form.Item
            name="newScheduledDate"
            label="Chọn ngày hoãn"
            rules={[{ required: true, message: "Vui lòng chọn ngày hoãn" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày hoãn"
              disabledDate={(current) => {
                if (!current) return false;
                
                const today = dayjs().startOf('day');
                const dueDate = selectedRecord?.dueDate ? dayjs(selectedRecord.dueDate).startOf('day') : null;
                const planNextDueDate = selectedRecord?.planNextDueDate ? dayjs(selectedRecord.planNextDueDate).startOf('day') : null;
                
                // ✅ Cho phép hoãn SAU ngày đến hạn nhưng TRƯỚC chu kỳ tiếp theo
                // VD: DueDate = 30/11, PlanNextDueDate = 05/12 → Cho chọn 01/12 - 04/12
                
                // Không cho chọn hôm nay hoặc quá khứ
                if (current < today) {
                  return true;
                }
                
                // Không cho chọn TRƯỚC hoặc BẰNG ngày đến hạn hiện tại
                if (dueDate && current <= dueDate) {
                  return true;
                }
                
                // Không cho chọn SAU hoặc BẰNG chu kỳ tiếp theo
                if (planNextDueDate && current >= planNextDueDate) {
                  return true;
                }
                
                return false;
              }}
            />
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
              <Button
                onClick={() => {
                  setIsPostponeModalVisible(false);
                  postponeForm.resetFields();
                }}
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
                  borderColor: "#283652",
                  height: "40px",
                  fontSize: "16px",
                  minWidth: "120px",
                }}
              >
                Hoãn
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal - Gộp cả View và Edit */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            {isEditMode
              ? selectedRecord?.type === "plan"
                ? "Giao việc bảo trì"
                : (selectedRecord?.status === "Đang thực hiện" || selectedRecord?.workStatus === "inProgress")
                ? "Đổi kỹ thuật viên"
                : "Cập nhật phân công"
              : selectedRecord?.workOrderId
              ? "Chi tiết phiếu bảo trì"
              : "Chi tiết kế hoạch bảo trì"}
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setIsEditMode(false);
          detailForm.resetFields();
        }}
        footer={
          selectedRecord && 
          selectedRecord.workStatus !== "completed" && 
          selectedRecord.workStatus !== "cancelled" &&
          selectedRecord.workStatus !== "closed"
            ? isEditMode
              ? [
                  <Button
                    key="cancel"
                    onClick={() => {
                      setIsEditMode(false);
                      detailForm.resetFields();
                    }}
                    style={{
                      height: "40px",
                      fontSize: "16px",
                      minWidth: "120px",
                    }}
                  >
                    Hủy
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    disabled={selectedRecord.type === "workOrder" && !hasFormChanges}
                    onClick={() => detailForm.submit()}
                    style={{
                      backgroundColor: "#283652",
                      borderColor: "#283652",
                      color: "#fff",
                      height: "40px",
                      fontSize: "16px",
                      minWidth: "120px",
                    }}
                  >
                    {selectedRecord.type === "plan" ? "Giao việc" : "Cập nhật"}
                  </Button>,
                ]
              : [
                  <Button
                    key="close"
                    onClick={() => {
                      setIsDetailModalVisible(false);
                      setIsEditMode(false);
                    }}
                    style={{
                      height: "40px",
                      fontSize: "16px",
                      minWidth: "120px",
                    }}
                  >
                    Đóng
                  </Button>,

                  // ✅ NÚT CHUYỂN LỊCH CHO OVERDUE:
                  // WorkOrder quá hạn (Overdue) → Hiện nút "Chuyển lịch" để update ngày và KTV
                  (selectedRecord.workStatus === "overdue" || selectedRecord.status === "Overdue") && (
                    <Button
                      key="reschedule"
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => handleAssignWork(selectedRecord)}
                      style={{
                        backgroundColor: "#1890ff",
                        borderColor: "#1890ff",
                        height: "40px",
                        fontSize: "16px",
                        minWidth: "120px",
                      }}
                    >
                      Chuyển lịch
                    </Button>
                  ),

                  // ✅ NÚT HỦY BẢO TRÌ LẦN NÀY CHO OVERDUE:
                  (selectedRecord.workStatus === "overdue" || selectedRecord.status === "Overdue") && (
                    <Popconfirm
                      key="cancel-overdue"
                      title="Hủy lần bảo trì này?"
                      description={`Bạn có chắc muốn hủy lần bảo trì này? Chu kỳ tiếp theo sẽ được tính từ ngày ${dayjs(selectedRecord.nextDueDate || selectedRecord.dueDate).format('DD/MM/YYYY')}.`}
                      onConfirm={() => handleCancelOverdueWorkOrder(selectedRecord)}
                      okText="Đồng ý"
                      cancelText="Không"
                    >
                      <Button
                        key="cancel-overdue"
                        danger
                        icon={<CloseCircleOutlined />}
                        style={{
                          height: "40px",
                          fontSize: "16px",
                          minWidth: "120px",
                        }}
                      >
                        Hủy bảo trì lần này
                      </Button>
                    </Popconfirm>
                  ),

                  // ✅ NÚT ĐỔI KTV CHO ĐANG THỰC HIỆN (thay thế KTV bị tai nạn/nghỉ việc):
                  (selectedRecord.status === "Đang thực hiện" || selectedRecord.workStatus === "inProgress") && (
                    <Button
                      key="change-technician"
                      type="primary"
                      icon={<SwapOutlined />}
                      onClick={() => handleAssignWork(selectedRecord)}
                      style={{
                        backgroundColor: "#faad14",
                        borderColor: "#faad14",
                        height: "40px",
                        fontSize: "16px",
                        minWidth: "120px",
                      }}
                    >
                      Đổi KTV
                    </Button>
                  ),

                  // ✅ NÚT HOÃN CHO PENDING (không InProgress, không overdue, không Đang thực hiện):
                  (selectedRecord.status !== "Đang thực hiện") && 
                  (selectedRecord.workStatus !== "inProgress") &&
                  (selectedRecord.workStatus !== "overdue" && selectedRecord.status !== "Quá hạn") && 
                  (selectedRecord.status !== "Đang thực hiện") && (
                    <Button
                      key="postpone"
                      icon={<ClockCircleOutlined />}
                      onClick={() => {
                        setIsDetailModalVisible(false);
                        handlePostpone(selectedRecord);
                      }}
                      style={{
                        height: "40px",
                        fontSize: "16px",
                        minWidth: "120px",
                      }}
                    >
                      Hoãn
                    </Button>
                  ),

                  // ✅ NÚT GIAO VIỆC/CẬP NHẬT KTV (không InProgress, không overdue):
                  (selectedRecord.status !== "Đang thực hiện") &&
                  (selectedRecord.workStatus !== "inProgress") &&
                  (selectedRecord.workStatus !== "overdue" && selectedRecord.status !== "Overdue") && (
                    <Button
                      key="assign"
                      type="primary"
                      icon={<UserAddOutlined />}
                      onClick={() => handleAssignWork(selectedRecord)}
                      style={{
                        backgroundColor: "#283652",
                        borderColor: "#283652",
                        height: "40px",
                        fontSize: "16px",
                        minWidth: "120px",
                      }}
                    >
                      {selectedRecord.type === "plan" ? "Giao việc" : "Cập nhật KTV"}
                    </Button>
                  ),
                ].filter(Boolean) // Lọc bỏ các false values
            : [
                <Button
                  key="close-modal"
                  onClick={() => {
                    setIsDetailModalVisible(false);
                    setIsEditMode(false);
                  }}
                  style={{
                    height: "40px",
                    fontSize: "16px",
                    minWidth: "120px",
                  }}
                >
                  Đóng
                </Button>,
                // ✅ NÚT ĐÓNG PHIẾU BẢO TRÌ khi status = Completed
                selectedRecord?.workStatus === "completed" && selectedRecord?.workOrderId && (
                  <Button
                    key="close-workorder"
                    type="primary"
                    icon={<LockOutlined />}
                    loading={loading}
                    onClick={() => handleCloseWorkOrder(selectedRecord.workOrderId)}
                    style={{
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                      height: "40px",
                      fontSize: "16px",
                      minWidth: "120px",
                    }}
                  >
                    Đóng phiếu bảo trì
                  </Button>
                ),
              ].filter(Boolean)
        }
        width={900}
      >
        {selectedRecord && (
          <div>
            {/* Thông tin cơ bản - READONLY */}
            <Descriptions bordered column={2} size="small">
              {selectedRecord.workOrderId ? (
                <>
                  <Descriptions.Item label="Mã phiếu" span={2}>
                    <Text strong style={{ fontSize: 16 }}>
                      {selectedRecord.workOrderCode || `WO${selectedRecord.workOrderId}`}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Thiết bị" span={2}>
                    <Text strong>{selectedRecord.equipmentName}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      ({selectedRecord.equipmentCode})
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Chuyền">
                    {selectedRecord.lineName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Công đoạn">
                    {selectedRecord.stageName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày đến hạn">
                    {dayjs(selectedRecord.dueDate).format("DD/MM/YYYY HH:mm")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    {getStatusTag(selectedRecord)}
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
                  <Descriptions.Item label="Mã kế hoạch" span={2}>
                    <Text strong style={{ fontSize: 16 }}>
                      PLAN{selectedRecord.planId}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Thiết bị" span={2}>
                    <Text strong>{selectedRecord.equipmentName}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      ({selectedRecord.equipmentCode})
                    </Text>
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
                    <Descriptions.Item label="Ngày đến hạn (sau hoãn)">
                      <Tag color="purple" icon={<ClockCircleOutlined />}>
                        {dayjs(selectedRecord.postponedDueDate).format("DD/MM/YYYY")}
                      </Tag>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Trạng thái" span={selectedRecord.postponedDueDate ? 2 : 1}>
                    {getStatusTag(selectedRecord)}
                  </Descriptions.Item>
                  {selectedRecord.postponedReason && (
                    <Descriptions.Item label="Lý do hoãn" span={2}>
                      <Alert
                        message="Đã hoãn bảo trì"
                        description={selectedRecord.postponedReason}
                        type="warning"
                        showIcon
                        icon={<ClockCircleOutlined />}
                        style={{ marginTop: 8 }}
                      />
                    </Descriptions.Item>
                  )}
                </>
              )}
            </Descriptions>



            {/* Form Giao việc - CHỈ HIỂN THỊ KHI isEditMode = true */}
            {isEditMode && (
              <div style={{ marginTop: 24 }}>
                {/* ✅ Cảnh báo khi đổi KTV cho WorkOrder đang thực hiện */}
                {selectedRecord?.workOrderId && (selectedRecord.status === "Đang thực hiện" || selectedRecord.workStatus === "inProgress") && (
                  <Alert
                    message="Đổi kỹ thuật viên đang thực hiện"
                    description={
                      <div>
                        <p>Bạn đang thay đổi KTV cho phiếu bảo trì đang thực hiện.</p>
                        <p><strong>Lưu ý:</strong> Các công việc đã hoàn thành sẽ giữ nguyên thông tin KTV cũ. KTV mới chỉ thực hiện các công việc còn lại.</p>
                      </div>
                    }
                    type="warning"
                    showIcon
                    icon={<SwapOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                )}

                <Divider orientation="left">
                  <Space>
                    <UserAddOutlined style={{ color: "#1890ff" }} />
                    <Text strong>Phân công kỹ thuật viên</Text>
                  </Space>
                </Divider>

                <Form form={detailForm} layout="vertical" onFinish={handleAssignSubmit}
                  onValuesChange={() => setHasFormChanges(true)}
                >
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
                        ]}
                      >
                        <DatePicker
                          format="DD/MM/YYYY"
                          style={{ width: "100%" }}
                          placeholder="Chọn ngày bảo trì"
                          disabledDate={(current) => {
                            if (!current) return false;
                            
                            const today = dayjs().startOf('day');
                            
                            // ❌ Không được chọn ngày quá khứ
                            if (current.isBefore(today, 'day')) {
                              return true;
                            }
                            
                            // Lấy ngày đến hạn từ record
                            let dueDate = null;
                            
                            if (selectedRecord?.type === 'plan') {
                              // Giao việc mới từ Plan
                              dueDate = selectedRecord.postponedDueDate
                                ? dayjs(selectedRecord.postponedDueDate)
                                : dayjs(selectedRecord.nextDueDate);
                            } else if (selectedRecord?.type === 'workOrder') {
                              // Cập nhật WorkOrder
                              dueDate = dayjs(selectedRecord.dueDate);
                            }
                            
                            // ❌ Không được chọn ngày sau dueDate
                            if (dueDate && current.isAfter(dueDate, 'day')) {
                              return true;
                            }
                            
                            return false;
                          }}
                          onChange={handleScheduledDateChange}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

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
                            {!getChecklistJobTypes().hasElectrical && (
                              <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                                (Không có công việc điện)
                              </Text>
                            )}
                          </span>
                        }
                        rules={[
                          {
                            required: getChecklistJobTypes().hasElectrical,
                            message: "Vui lòng chọn KTV điện",
                          },
                        ]}
                      >
                        <Select
                          placeholder={
                            getChecklistJobTypes().hasElectrical
                              ? "Chọn KTV điện"
                              : "Không cần KTV điện"
                          }
                          showSearch
                          allowClear
                          disabled={!getChecklistJobTypes().hasElectrical}
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          {electricalTechs.map((tech) => {
                            const workload = techWorkload[tech.userId] || 0;
                            return (
                              <Option key={tech.userId} value={tech.userId}>
                                {tech.fullName} - {tech.employeeCode}
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                  ({workload > 0 ? `${workload} công việc` : 'chưa giao công việc'})
                                </Text>
                              </Option>
                            );
                          })}
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
                            {!getChecklistJobTypes().hasMechanical && (
                              <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                                (Không có công việc cơ khí)
                              </Text>
                            )}
                          </span>
                        }
                        rules={[
                          {
                            required: getChecklistJobTypes().hasMechanical,
                            message: "Vui lòng chọn KTV cơ khí",
                          },
                        ]}
                      >
                        <Select
                          placeholder={
                            getChecklistJobTypes().hasMechanical
                              ? "Chọn KTV cơ khí"
                              : "Không cần KTV cơ khí"
                          }
                          showSearch
                          allowClear
                          disabled={!getChecklistJobTypes().hasMechanical}
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          {mechanicalTechs.map((tech) => {
                            const workload = techWorkload[tech.userId] || 0;
                            return (
                              <Option key={tech.userId} value={tech.userId}>
                                {tech.fullName} - {tech.employeeCode}
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                  ({workload > 0 ? `${workload} công việc` : 'chưa giao công việc'})
                                </Text>
                              </Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* ✅ Trường Notes - BẮT BUỘC khi đổi KTV cho WorkOrder đang thực hiện */}
                  {selectedRecord?.workOrderId && (selectedRecord.status === "Đang thực hiện" || selectedRecord.workStatus === "inProgress") && (
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="notes"
                          label={
                            <span>
                              <FileTextOutlined style={{ color: "#faad14", marginRight: 4 }} />
                              Lý do thay đổi KTV
                            </span>
                          }
                          rules={[
                            { required: true, message: "Vui lòng nhập lý do thay đổi KTV" },
                            { min: 10, message: "Lý do phải có ít nhất 10 ký tự" }
                          ]}
                        >
                          <TextArea
                            rows={3}
                            placeholder="Ví dụ: KTV cũ bị tai nạn nghề nghiệp, cần thay thế khẩn cấp..."
                            showCount
                            maxLength={500}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                </Form>

                {/* Template Checklist - Hiển thị ở chế độ Edit để Manager xem trước */}
                {templateChecklistItems.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Alert
                      message={
                        <Space>
                          <FileTextOutlined />
                          <Text strong>
                            Công việc sẽ giao cho Technician ({templateChecklistItems.length} bước)
                          </Text>
                        </Space>
                      }
                      description={`${
                        templateChecklistItems.filter((i) => i.category === "Electrical").length
                      } công việc điện + ${
                        templateChecklistItems.filter((i) => i.category === "Mechanical").length
                      } công việc cơ khí`}
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />

                    <Row gutter={16}>
                      {/* Công việc Điện */}
                      <Col span={12}>
                        <Card
                          title={
                            <Space>
                              <ThunderboltOutlined style={{ color: "#1890ff" }} />
                              <Text strong style={{ color: "#1890ff", fontSize: 13 }}>
                                Điện ({
                                  templateChecklistItems.filter(
                                    (item) => item.category === "Electrical"
                                  ).length
                                })
                              </Text>
                            </Space>
                          }
                          size="small"
                          style={{ maxHeight: 300, overflow: "auto" }}
                        >
                          {templateChecklistItems.filter(
                            (item) => item.category === "Electrical"
                          ).length > 0 ? (
                            <List
                              size="small"
                              dataSource={templateChecklistItems
                                .filter((item) => item.category === "Electrical")
                                .sort((a, b) => a.orderIndex - b.orderIndex)}
                              renderItem={(item, index) => (
                                <List.Item style={{ padding: "8px 0" }}>
                                  <List.Item.Meta
                                    avatar={
                                      <Badge
                                        count={index + 1}
                                        style={{ backgroundColor: "#1890ff" }}
                                      />
                                    }
                                    title={
                                      <Text style={{ fontSize: 13 }}>{item.stepName}</Text>
                                    }
                                  />
                                </List.Item>
                              )}
                            />
                          ) : (
                            <Alert message="Không có công việc điện" type="info" showIcon />
                          )}
                        </Card>
                      </Col>

                      {/* Công việc Cơ khí */}
                      <Col span={12}>
                        <Card
                          title={
                            <Space>
                              <ToolOutlined style={{ color: "#52c41a" }} />
                              <Text strong style={{ color: "#52c41a", fontSize: 13 }}>
                                Cơ khí ({
                                  templateChecklistItems.filter(
                                    (item) => item.category === "Mechanical"
                                  ).length
                                })
                              </Text>
                            </Space>
                          }
                          size="small"
                          style={{ maxHeight: 300, overflow: "auto" }}
                        >
                          {templateChecklistItems.filter(
                            (item) => item.category === "Mechanical"
                          ).length > 0 ? (
                            <List
                              size="small"
                              dataSource={templateChecklistItems
                                .filter((item) => item.category === "Mechanical")
                                .sort((a, b) => a.orderIndex - b.orderIndex)}
                              renderItem={(item, index) => (
                                <List.Item style={{ padding: "8px 0" }}>
                                  <List.Item.Meta
                                    avatar={
                                      <Badge
                                        count={index + 1}
                                        style={{ backgroundColor: "#52c41a" }}
                                      />
                                    }
                                    title={
                                      <Text style={{ fontSize: 13 }}>{item.stepName}</Text>
                                    }
                                  />
                                </List.Item>
                              )}
                            />
                          ) : (
                            <Alert message="Không có công việc cơ khí" type="info" showIcon />
                          )}
                        </Card>
                      </Col>
                    </Row>
                  </div>
                )}
              </div>
            )}

            {/* Template Checklist - LUÔN HIỂN THỊ (không phụ thuộc vào isEditMode) */}
            {!isEditMode && templateChecklistItems.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Divider orientation="left">
                  <Space>
                    <FileTextOutlined style={{ color: "#1890ff" }} />
                    <Text strong>Danh sách công việc kiểm tra</Text>
                  </Space>
                </Divider>
                
                <Alert
                  message={`Tổng cộng: ${templateChecklistItems.length} bước kiểm tra (${
                    templateChecklistItems.filter((i) => i.category === "Electrical").length
                  } điện + ${
                    templateChecklistItems.filter((i) => i.category === "Mechanical").length
                  } cơ khí)`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Row gutter={16}>
                  {/* Công việc Điện */}
                  <Col span={12}>
                    <Card
                      title={
                        <Space>
                          <ThunderboltOutlined style={{ color: "#1890ff" }} />
                          <Text strong style={{ color: "#1890ff" }}>
                            Công việc Điện ({
                              templateChecklistItems.filter(
                                (item) => item.category === "Electrical"
                              ).length
                            })
                          </Text>
                        </Space>
                      }
                      size="small"
                      style={{ maxHeight: 400, overflow: "auto" }}
                    >
                      {templateChecklistItems.filter(
                        (item) => item.category === "Electrical"
                      ).length > 0 ? (
                        <List
                          size="small"
                          dataSource={templateChecklistItems
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
                                title={
                                  <Space>
                                    {item.stepName}
                                    {selectedRecord.workOrderId && item.isChecked && (
                                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                                    )}
                                  </Space>
                                }
                                description={
                                  selectedRecord.workOrderId && item.isChecked ? (
                                    <div style={{ marginTop: 4 }}>
                                      <div>
                                        <Text strong style={{ fontSize: 12, color: "#52c41a" }}>
                                          {item.completedByName || "KTV"}
                                        </Text>
                                        {item.completedByEmployeeCode && (
                                          <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                                            - {item.completedByEmployeeCode}
                                          </Text>
                                        )}
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                          {" "}đã hoàn thành lúc {dayjs(item.completedDate).format("DD/MM/YYYY HH:mm")}
                                        </Text>
                                      </div>
                                      {item.notes && (
                                        <div style={{ marginTop: 4, paddingLeft: 8, borderLeft: "2px solid #d9d9d9" }}>
                                          <Text type="secondary" style={{ fontSize: 11, fontStyle: "italic" }}>
                                            Ghi chú: {item.notes}
                                          </Text>
                                        </div>
                                      )}
                                    </div>
                                  ) : null
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Alert
                          message="Không có công việc điện"
                          type="info"
                          showIcon
                        />
                      )}
                    </Card>
                  </Col>

                  {/* Công việc Cơ khí */}
                  <Col span={12}>
                    <Card
                      title={
                        <Space>
                          <ToolOutlined style={{ color: "#52c41a" }} />
                          <Text strong style={{ color: "#52c41a" }}>
                            Công việc Cơ khí ({
                              templateChecklistItems.filter(
                                (item) => item.category === "Mechanical"
                              ).length
                            })
                          </Text>
                        </Space>
                      }
                      size="small"
                      style={{ maxHeight: 400, overflow: "auto" }}
                    >
                      {templateChecklistItems.filter(
                        (item) => item.category === "Mechanical"
                      ).length > 0 ? (
                        <List
                          size="small"
                          dataSource={templateChecklistItems
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
                                title={
                                  <Space>
                                    {item.stepName}
                                    {selectedRecord.workOrderId && item.isChecked && (
                                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                                    )}
                                  </Space>
                                }
                                description={
                                  selectedRecord.workOrderId && item.isChecked ? (
                                    <div style={{ marginTop: 4 }}>
                                      <div>
                                        <Text strong style={{ fontSize: 12, color: "#52c41a" }}>
                                          {item.completedByName || "KTV"}
                                        </Text>
                                        {item.completedByEmployeeCode && (
                                          <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                                            - {item.completedByEmployeeCode}
                                          </Text>
                                        )}
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                          {" "}đã hoàn thành lúc {dayjs(item.completedDate).format("DD/MM/YYYY HH:mm")}
                                        </Text>
                                      </div>
                                      {item.notes && (
                                        <div style={{ marginTop: 4, paddingLeft: 8, borderLeft: "2px solid #d9d9d9" }}>
                                          <Text type="secondary" style={{ fontSize: 11, fontStyle: "italic" }}>
                                            Ghi chú: {item.notes}
                                          </Text>
                                        </div>
                                      )}
                                    </div>
                                  ) : null
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Alert
                          message="Không có công việc cơ khí"
                          type="info"
                          showIcon
                        />
                      )}
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {/* Template Checklist - CHỈ HIỂN THỊ Ở CHẾ ĐỘ EDIT (để xem trước khi giao việc) - ĐÃ XÓA DUPLICATE */}

            {/* Yêu cầu linh kiện */}
            {selectedRecord.workOrderId && workOrderSparePartsList.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Divider orientation="left">
                  <Space>
                    <PushpinOutlined style={{ color: "#ff4d4f" }} />
                    <Text strong>Yêu cầu linh kiện</Text>
                  </Space>
                </Divider>
                
                <Alert
                  message={`Có ${workOrderSparePartsList.length} yêu cầu linh kiện`}
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <Table
                  columns={[
                    {
                      title: "Tên linh kiện",
                      dataIndex: "partName",
                      key: "partName",
                      render: (text, record) => (
                        <div>
                          <div style={{ fontWeight: 500 }}>{text}</div>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            Mã: {record.partNumber}
                          </Text>
                        </div>
                      ),
                    },
                    {
                      title: "Số lượng",
                      dataIndex: "quantity",
                      key: "quantity",
                      width: 100,
                      render: (text) => <Text strong>{text}</Text>,
                    },
                    {
                      title: "Trạng thái",
                      dataIndex: "status",
                      key: "status",
                      width: 150,
                      render: (status) => {
                        let color = "default";
                        if (status === "Chờ duyệt cấp phát") color = "warning";
                        else if (status === "Đã duyệt cấp phát") color = "blue";
                        else if (status === "Chờ trả lại") color = "orange";
                        else if (status === "Hoàn thành") color = "success";
                        return <Tag color={color}>{status}</Tag>;
                      },
                    },
                    {
                      title: "Thao tác",
                      key: "action",
                      width: 180,
                      render: (_, record) => (
                        <Space size="small">
                          {record.status === "Chờ duyệt cấp phát" && (
                            <>
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handleApproveSparepart(record)}
                              >
                                Duyệt
                              </Button>
                              <Button
                                danger
                                size="small"
                                onClick={() => handleRejectSparepart(record)}
                              >
                                Từ chối
                              </Button>
                            </>
                          )}
                          {record.status === "Chờ trả lại" && (
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => handleConfirmReturn(record)}
                            >
                              Xác nhận trả
                            </Button>
                          )}
                          {(record.status === "Đã duyệt cấp phát" ||
                            record.status === "Hoàn thành") && (
                            <Tag color="success">
                              {record.status === "Đã duyệt cấp phát"
                                ? "Đã duyệt"
                                : "Hoàn thành"}
                            </Tag>
                          )}
                        </Space>
                      ),
                    },
                  ]}
                  dataSource={workOrderSparePartsList}
                  rowKey="replacementID"
                  pagination={false}
                  size="small"
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* CSS animation for pulsing effect */}
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

export default WorkScheduleManagement;