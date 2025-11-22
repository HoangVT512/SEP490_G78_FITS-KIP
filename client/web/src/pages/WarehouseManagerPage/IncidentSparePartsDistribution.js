import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  InputNumber,
  Input,
  message,
  Descriptions,
  Alert,
  Tooltip,
  DatePicker,
  Row,
  Col,
  Drawer,
  Empty,
  Badge,
  Select,
  Spin,
  Tabs,
  Dropdown,
  Statistic,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  WarningOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  DownOutlined,
  RollbackOutlined,
  UpOutlined,
  HistoryOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
import { incidentService } from "../../services/incidentService";
import { sparePartService } from "../../services/sparePartService";
import { replacementHistoryService } from "../../services/replacementHistoryService";
import { getAllWorkOrders } from "../../services/maintenanceService";

const IncidentSparePartsDistribution = () => {
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [filteredDistributions, setFilteredDistributions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [distributionForm] = Form.useForm();
  const [selectedDistributions, setSelectedDistributions] = useState([]);
  const [distributionType, setDistributionType] = useState("incident");
  const [searchingIncidents, setSearchingIncidents] = useState(false);
  const [searchingMaintenances, setSearchingMaintenances] = useState(false);
  const [activeTab, setActiveTab] = useState("incident");
  const [searchText, setSearchText] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDistributionDetail, setSelectedDistributionDetail] =
    useState(null);

  // State cho chức năng trả lại vật tư
  const [expandedReturnRow, setExpandedReturnRow] = useState(null);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [selectedDistributionForReturn, setSelectedDistributionForReturn] =
    useState(null);
  const [returnForm] = Form.useForm();
  const [returnItems, setReturnItems] = useState([]);

  // State cho statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    distributed: 0,
    returned: 0,
    pendingReturn: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    dateRange: null,
    status: null,
    searchText: "",
  });

  useEffect(() => {
    fetchSpareParts();
    fetchDistributions();
    fetchIncidents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [distributions, filters]);

  const fetchDistributions = async () => {
    setLoading(true);
    try {
      const allReplacements = await replacementHistoryService.getAll();

      // Get both "Đã xuất" and "Đã trả lại" statuses
      const exportedReplacements = (allReplacements || []).filter(
        (r) => r.status === "Đã xuất" || r.status === "Đã trả lại"
      );

      const formattedDistributions = exportedReplacements.map((replacement) => {
        const distributionType = replacement.incidentId
          ? "incident"
          : "maintenance";
        const recordId = replacement.incidentId || replacement.workOrderId;

        return {
          id: replacement.replacementID,
          distributionType: distributionType,
          recordId: recordId,
          recordName: replacement.equipmentName || "",
          recordCode: replacement.equipmentCode || "",
          technicianName:
            replacement.replacedByFullName ||
            replacement.replacedByUserName ||
            "",
          technicianCode: replacement.replacedByEmployeeCode || "",
          distributedAt: replacement.replacedDate,
          distributedBy:
            replacement.replacedByFullName ||
            replacement.replacedByUserName ||
            "",
          items: [
            {
              partId: replacement.partID,
              partName: replacement.partName || "",
              partNumber: replacement.partNumber || "",
              quantity: replacement.quantity,
              actualQuantityUsed: replacement.actualQuantityUsed || 0,
              quantityToReturn: replacement.quantityToReturn || 0,
            },
          ],
          notes: replacement.remarks || "",
          status: replacement.status || "Đã xuất",
        };
      });

      setDistributions(formattedDistributions);
      const grouped = groupDistributions(formattedDistributions);
      setFilteredDistributions(grouped);
      calculateStatistics(formattedDistributions); // Use original data for stats
    } catch (error) {
      console.error("Error fetching distributions:", error);
      message.error("Lỗi khi tải danh sách phiếu cấp phát");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (distributions) => {
    const stats = {
      total: distributions.length,
      exported: distributions.filter((d) => d.status === "Đã xuất").length,
      returned: distributions.filter((d) => d.status === "Đã trả lại").length,
    };
    setStatistics(stats);
  };

  const applyFilters = () => {
    let filtered = [...distributions];

    // Filter by date range
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange;
      filtered = filtered.filter((d) =>
        dayjs(d.distributedAt).isBetween(start, end, "day", "[]")
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((d) => d.status === filters.status);
    }

    // Filter by search text
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.recordId?.toString().toLowerCase().includes(searchLower) ||
          d.recordName?.toLowerCase().includes(searchLower) ||
          d.recordCode?.toLowerCase().includes(searchLower) ||
          d.technicianName?.toLowerCase().includes(searchLower) ||
          d.technicianCode?.toLowerCase().includes(searchLower)
      );
    }

    // Group lại
    const grouped = groupDistributions(filtered);
    setFilteredDistributions(grouped);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: null,
      status: null,
      searchText: "",
    });
  };

  const fetchSpareParts = async () => {
    try {
      const data = await sparePartService.getAll();
      setSpareParts(data || []);
    } catch (error) {
      console.error("Error fetching spare parts:", error);
    }
  };

  const fetchIncidents = async () => {
    setSearchingIncidents(true);
    try {
      const data = await incidentService.getAll();
      const filteredIncidents = (data || []).filter(
        (incident) =>
          incident.isTechSupport === true && incident.status === "Đang xử lý"
      );
      // Sắp xếp giảm dần theo IncidentID
      const sortedIncidents = filteredIncidents.sort(
        (a, b) => b.incidentId - a.incidentId
      );
      setIncidents(sortedIncidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      message.error("Lỗi khi tải danh sách sự cố");
    } finally {
      setSearchingIncidents(false);
    }
  };

  const searchIncidents = async (searchValue) => {
    if (!searchValue) {
      fetchIncidents();
      return;
    }
    setSearchingIncidents(true);
    try {
      const data = await incidentService.getAll();
      const filtered = (data || []).filter(
        (incident) =>
          incident.isTechSupport === true &&
          incident.status === "Đang xử lý" &&
          (incident.incidentId?.toString().includes(searchValue) ||
            incident.equipmentName
              ?.toLowerCase()
              .includes(searchValue.toLowerCase()) ||
            incident.equipmentCode
              ?.toLowerCase()
              .includes(searchValue.toLowerCase()))
      );
      // Sắp xếp giảm dần theo IncidentID
      const sortedFiltered = filtered.sort(
        (a, b) => b.incidentId - a.incidentId
      );
      setIncidents(sortedFiltered);
    } catch (error) {
      console.error("Error searching incidents:", error);
      message.error("Lỗi khi tìm kiếm sự cố");
    } finally {
      setSearchingIncidents(false);
    }
  };

  const searchMaintenances = async (searchValue) => {
    if (!searchValue) {
      fetchMaintenances();
      return;
    }
    setSearchingMaintenances(true);
    try {
      const response = await getAllWorkOrders();
      const workOrders = response?.data || [];

      const filtered = workOrders.filter((workOrder) => {
        const statusMatch =
          workOrder.status === "Pending" ||
          workOrder.status === "In Progress" ||
          workOrder.status === "Chờ xử lý" ||
          workOrder.status === "Đang xử lý" ||
          workOrder.status === "Đang thực hiện";

        const searchMatch =
          workOrder.workOrderId?.toString().includes(searchValue) ||
          workOrder.equipmentName
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          workOrder.equipmentCode
            ?.toLowerCase()
            .includes(searchValue.toLowerCase());

        // Validate: Chỉ hiển thị nếu ngày hiện tại >= ngày bảo trì (ScheduledDate)
        const isScheduledDateReached = dayjs().isSameOrAfter(
          dayjs(workOrder.scheduledDate),
          "day"
        );

        // Show all pending/in-progress work orders regardless of technician assignment
        return statusMatch && searchMatch && isScheduledDateReached;
      });

      setMaintenances(filtered);
    } catch (error) {
      console.error("Error searching maintenances:", error);
      message.error("Lỗi khi tìm kiếm bảo trì");
    } finally {
      setSearchingMaintenances(false);
    }
  };

  const fetchMaintenances = async () => {
    setSearchingMaintenances(true);
    try {
      const response = await getAllWorkOrders();
      const workOrders = response?.data || [];

      console.log("All work orders:", workOrders);
      console.log("First work order full object:", workOrders[0]);

      // Filter: status must be "Pending" or "In Progress" (English status from backend)
      // Also accept Vietnamese: "Chờ xử lý" or "Đang xử lý"
      const filteredMaintenances = workOrders.filter((workOrder) => {
        const statusMatch =
          workOrder.status === "Pending" ||
          workOrder.status === "In Progress" ||
          workOrder.status === "Chờ xử lý" ||
          workOrder.status === "Đang xử lý" ||
          workOrder.status === "Đang thực hiện";

        // Check all possible technician field variations
        const hasTechnician =
          workOrder.mechanicalTechnicianId ||
          workOrder.electricalTechnicianId ||
          workOrder.mechanicalTechnician ||
          workOrder.electricalTechnician ||
          workOrder.assignedTechnicians?.length > 0;

        // Validate: Chỉ hiển thị nếu ngày hiện tại >= ngày bảo trì (ScheduledDate)
        const isScheduledDateReached = dayjs().isSameOrAfter(
          dayjs(workOrder.scheduledDate),
          "day"
        );

        console.log(`WorkOrder ${workOrder.workOrderId}:`, {
          status: workOrder.status,
          statusMatch,
          scheduledDate: workOrder.scheduledDate,
          isScheduledDateReached,
          mechanicalTechnicianId: workOrder.mechanicalTechnicianId,
          electricalTechnicianId: workOrder.electricalTechnicianId,
          mechanicalTechnician: workOrder.mechanicalTechnician,
          electricalTechnician: workOrder.electricalTechnician,
          assignedTechnicians: workOrder.assignedTechnicians,
          hasTechnician,
        });

        // For warehouse distribution, we should show ALL pending/in-progress work orders
        // even if technician is not assigned yet (warehouse can prepare parts in advance)
        // BUT only if the scheduled date has arrived
        return statusMatch && isScheduledDateReached;
      });

      console.log("Filtered maintenances:", filteredMaintenances);

      // Sort by workOrderId descending
      const sortedMaintenances = filteredMaintenances.sort(
        (a, b) => b.workOrderId - a.workOrderId
      );

      setMaintenances(sortedMaintenances);
    } catch (error) {
      console.error("Error fetching maintenances:", error);
      message.error("Lỗi khi tải danh sách bảo trì");
    } finally {
      setSearchingMaintenances(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedDistributions([]);
    setSelectedRecord(null);
    distributionForm.resetFields();
    setDistributionType("incident");
    setMaintenances([]);
    fetchIncidents();
    setIsModalVisible(true);
  };

  const handleRecordSelect = (recordId) => {
    const record =
      distributionType === "incident"
        ? incidents.find((i) => i.incidentId === recordId)
        : maintenances.find((m) => m.workOrderId === recordId);

    console.log("Selected record:", record);
    setSelectedRecord(record);

    if (record) {
      if (distributionType === "maintenance") {
        // For maintenance work orders, show both mechanical and electrical technicians
        const mechanicalName =
          record.mechanicalTechnicianName ||
          record.mechanicalTechnician?.fullName ||
          record.mechanicalTechnician?.name;
        const mechanicalCode =
          record.mechanicalTechnicianCode ||
          record.mechanicalTechnician?.employeeCode;
        const electricalName =
          record.electricalTechnicianName ||
          record.electricalTechnician?.fullName ||
          record.electricalTechnician?.name;
        const electricalCode =
          record.electricalTechnicianCode ||
          record.electricalTechnician?.employeeCode;

        console.log("Technician data:", {
          mechanicalName,
          mechanicalCode,
          electricalName,
          electricalCode,
        });

        const technicians = [];
        if (mechanicalName) {
          const mech = mechanicalCode
            ? `KTV Cơ: ${mechanicalName} (${mechanicalCode})`
            : `KTV Cơ: ${mechanicalName}`;
          technicians.push(mech);
        }
        if (electricalName) {
          const elec = electricalCode
            ? `KTV Điện: ${electricalName} (${electricalCode})`
            : `KTV Điện: ${electricalName}`;
          technicians.push(elec);
        }

        const technicianDisplay =
          technicians.length > 0
            ? technicians.join(" | ")
            : "Chưa phân công kỹ thuật viên";

        console.log("Final technician display:", technicianDisplay);

        const technicianId =
          record.mechanicalTechnicianId || record.electricalTechnicianId;

        distributionForm.setFieldsValue({
          technicianName: technicianDisplay,
          technicianId: technicianId,
        });
      } else {
        // For incidents
        const technicianName = record.assignedToName;
        const technicianCode = record.assignedToEmployeeCode;

        if (technicianName) {
          const technicianDisplay = technicianCode
            ? `${technicianName} (${technicianCode})`
            : technicianName;
          distributionForm.setFieldsValue({
            technicianName: technicianDisplay,
            technicianId: record.assignedTo,
          });
        }
      }
    }
  };

  const handleAddSparePartToDistribution = () => {
    setSelectedDistributions([
      ...selectedDistributions,
      {
        id: Math.random(),
        partId: undefined,
        partName: "",
        quantity: 1,
        notes: "",
      },
    ]);
  };

  const handleRemoveSparePartFromDistribution = (id) => {
    setSelectedDistributions(
      selectedDistributions.filter((item) => item.id !== id)
    );
  };

  const handleUpdateSparePartInDistribution = (id, field, value) => {
    const updated = selectedDistributions.map((item) => {
      if (item.id === id) {
        if (field === "partId") {
          const selectedPart = spareParts.find((p) => p.partId === value);
          return {
            ...item,
            partId: value,
            partName: selectedPart?.partName || "",
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    setSelectedDistributions(updated);
  };

  const handleSaveDistribution = async () => {
    setLoading(true);
    try {
      const values = await distributionForm.validateFields();

      if (selectedDistributions.length === 0) {
        message.warning("Vui lòng thêm ít nhất một phụ tùng");
        setLoading(false);
        return;
      }

      const invalidParts = selectedDistributions.some((part) => !part.partId);
      if (invalidParts) {
        message.warning("Vui lòng chọn phụ tùng cho tất cả các dòng");
        setLoading(false);
        return;
      }

      const insufficientStock = selectedDistributions.find((item) => {
        const part = spareParts.find((p) => p.partId === item.partId);
        return part && part.quantity < item.quantity;
      });

      if (insufficientStock) {
        const part = spareParts.find(
          (p) => p.partId === insufficientStock.partId
        );
        message.error(
          `Không đủ tồn kho cho phụ tùng "${part?.partName}". Tồn kho: ${part?.quantity}, Yêu cầu: ${insufficientStock.quantity}`
        );
        setLoading(false);
        return;
      }

      const recordType = distributionType === "incident" ? "sự cố" : "bảo trì";
      const currentUserId = localStorage.getItem("userId");
      const currentUserName = localStorage.getItem("userName") || "Quản lý kho";

      console.log("Current user info:", { currentUserId, currentUserName });

      const selectedRecordData =
        distributionType === "incident"
          ? incidents.find((i) => i.incidentId === values.recordId)
          : maintenances.find((m) => m.workOrderId === values.recordId);

      if (!selectedRecordData) {
        message.error("Không tìm thấy dữ liệu sự cố/bảo trì");
        setLoading(false);
        return;
      }

      const equipmentId =
        selectedRecordData.equipmentId || selectedRecordData.equipmentID;
      if (!equipmentId) {
        message.error("Không tìm thấy thiết bị");
        setLoading(false);
        return;
      }

      // Get replacedBy: priority is currentUserId > technicianId > assignedTo
      const replacedBy =
        currentUserId ||
        values.technicianId ||
        selectedRecordData.assignedToMechanical ||
        selectedRecordData.assignedToElectrical ||
        selectedRecordData.assignedTo;

      if (!replacedBy) {
        message.error("Không xác định được người phân phối. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      console.log("ReplacedBy will be:", replacedBy);

      const replacementPromises = selectedDistributions.map(async (item) => {
        const replacementData = {
          partId: item.partId,
          equipmentId: equipmentId,
          // Use correct ID based on distribution type
          incidentId: distributionType === "incident" ? values.recordId : null,
          workOrderId:
            distributionType === "maintenance" ? values.recordId : null,
          quantity: item.quantity,
          replacedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
          replacedBy: replacedBy,
          status: "Đã xuất",
          remarks: values.notes || "",
        };

        console.log("Creating replacement history:", replacementData);
        console.log("Selected record data:", selectedRecordData);
        console.log("Distribution type:", distributionType);
        console.log("Record ID:", values.recordId);
        return replacementHistoryService.create(replacementData);
      });

      await Promise.all(replacementPromises);

      const updatePromises = selectedDistributions.map(async (item) => {
        const part = spareParts.find((p) => p.partId === item.partId);
        if (!part) return;

        const newQuantity = part.quantity - item.quantity;
        let newStatus = "Đủ hàng";

        if (newQuantity <= 0) {
          newStatus = "Hết hàng";
        } else if (newQuantity <= part.minQuantity) {
          newStatus = "Sắp hết";
        }

        const updateData = {
          partNumber: part.partNumber,
          partName: part.partName,
          partType: part.partType,
          quantity: newQuantity,
          minQuantity: part.minQuantity,
          location: part.location,
          dateAdded: part.dateAdded,
          status: newStatus,
        };

        return sparePartService.update(part.partId, updateData);
      });

      await Promise.all(updatePromises);

      // Refresh data from server
      await fetchSpareParts();
      await fetchDistributions();

      message.success(`Cấp phát vật tư cho ${recordType} thành công!`);

      setIsModalVisible(false);
      setSelectedDistributions([]);
      setSelectedRecord(null);
      setIncidents([]);
      setMaintenances([]);
      distributionForm.resetFields();
    } catch (error) {
      console.error("Error saving distribution:", error);
      if (error.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      } else {
        message.error(
          error.message || "Lỗi khi lưu phiếu cấp phát. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý trả lại vật tư
  const handleOpenReturnDropdown = (record) => {
    setExpandedReturnRow(
      expandedReturnRow === record.recordId ? null : record.recordId
    );
    setSelectedDistributionForReturn(record);
  };

  const handleOpenReturnModal = (record, distributionRecord) => {
    setSelectedDistributionForReturn(record);

    console.log("Opening return modal for record:", record);
    console.log("Distribution record to return:", distributionRecord);

    // Get workOrderId and incidentId from the record
    const workOrderId =
      record.distributionType === "maintenance" ? record.recordId : null;
    const incidentId =
      record.distributionType === "incident" ? record.recordId : null;

    console.log("Distribution type:", record.distributionType);
    console.log("WorkOrderId for return:", workOrderId);
    console.log("IncidentId for return:", incidentId);

    // Map all items in this specific distribution record
    const itemsToReturn = distributionRecord.items.map((item) => ({
      replacementId: distributionRecord.id,
      partId: item.partId,
      partNumber: item.partNumber,
      partName: item.partName,
      quantityExported: item.quantity, // Original exported quantity for THIS record
      quantityToReturn: 0,
      workOrderId: workOrderId,
      incidentId: incidentId,
    }));

    setReturnItems(itemsToReturn);
    returnForm.resetFields();
    setReturnModalVisible(true);
  };

  const handleUpdateReturnQuantity = (partId, value) => {
    const updated = returnItems.map((item) => {
      if (item.partId === partId) {
        return { ...item, quantityToReturn: value || 0 };
      }
      return item;
    });
    setReturnItems(updated);
  };

  const handleSaveReturn = async (values) => {
    const itemsWithReturn = returnItems.filter(
      (item) => item.quantityToReturn > 0
    );

    // Validate số lượng trả lại không vượt quá số lượng đã xuất
    const invalidItems = itemsWithReturn.filter(
      (item) => item.quantityToReturn > item.quantityExported
    );
    if (invalidItems.length > 0) {
      message.error(
        "Số lượng trả lại không được vượt quá số lượng đã xuất cho một số phụ tùng!"
      );
      return;
    }

    if (itemsWithReturn.length === 0) {
      message.warning(
        "Vui lòng nhập số lượng trả lại cho ít nhất một phụ tùng"
      );
      return;
    }

    try {
      setLoading(true);

      // Get current user from localStorage
      const currentUserStr = localStorage.getItem("currentUser");
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      const currentUserId = currentUser?.id || currentUser?.userId;
      const currentUserName =
        currentUser?.fullName || currentUser?.userName || "Quản lý kho";

      console.log("Current user for return confirmation:", currentUser);
      console.log("Current user ID:", currentUserId);

      // Update existing replacement history records with return information
      const updatePromises = itemsWithReturn.map(async (item) => {
        // First, get the existing record to preserve all fields
        const existingRecord = await replacementHistoryService.getById(
          item.replacementId
        );

        if (!existingRecord) {
          throw new Error(`Không tìm thấy record với ID ${item.replacementId}`);
        }

        // Calculate actual quantity used
        const actualQuantityUsed =
          item.quantityExported - item.quantityToReturn;

        console.log("Return item data:", item);
        console.log("Existing record before update:", existingRecord);
        console.log("Existing workOrderId:", existingRecord.workOrderId);
        console.log("Existing incidentId:", existingRecord.incidentId);
        console.log("Item workOrderId from returnItems:", item.workOrderId);
        console.log("Item incidentId from returnItems:", item.incidentId);

        // Update only the return-related fields, keep everything else
        // IMPORTANT: Use workOrderId and incidentId from item (stored when opening return modal)
        // because backend API doesn't return these fields in getById
        const updateData = {
          partId: existingRecord.partID || existingRecord.partId,
          equipmentId: existingRecord.equipmentID || existingRecord.equipmentId,
          incidentId: item.incidentId || existingRecord.incidentId || null,
          workOrderId: item.workOrderId || existingRecord.workOrderId || null,
          quantity: existingRecord.quantity, // Keep original exported quantity
          replacedDate: existingRecord.replacedDate, // Keep original date
          replacedBy: existingRecord.replacedBy, // Keep original technician
          status: "Đã trả lại", // Update status to returned
          remarks:
            existingRecord.remarks ||
            values.returnNotes ||
            `Trả lại ${item.quantityToReturn} phụ tùng`,
          actualQuantityUsed: actualQuantityUsed, // Actual quantity used (đã dùng thực tế)
          quantityToReturn: item.quantityToReturn, // Quantity being returned (số lượng trả lại)
          returnedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"), // Return date (ngày trả lại)
          returnConfirmedBy: currentUserId, // Warehouse manager who confirmed (người xác nhận)
        };

        console.log("Update data being sent:", updateData);
        console.log("WorkOrderId in update:", updateData.workOrderId);
        console.log("IncidentId in update:", updateData.incidentId);
        return replacementHistoryService.update(item.replacementId, updateData);
      });

      // Execute all updates
      await Promise.all(updatePromises);

      // Update spare parts inventory: ADD back ONLY the returned quantity
      const sparePartUpdatePromises = itemsWithReturn.map(async (item) => {
        const part = spareParts.find((p) => p.partId === item.partId);
        if (!part) return;

        // Only add back the returned quantity (not the full exported quantity)
        const newQuantity = part.quantity + item.quantityToReturn;
        let newStatus = "Đủ hàng";

        // Determine status based on quantity and minQuantity
        if (newQuantity <= 0) {
          newStatus = "Hết hàng";
        } else if (newQuantity <= part.minQuantity) {
          newStatus = "Sắp hết";
        }

        // Update spare part
        const updateData = {
          partNumber: part.partNumber,
          partName: part.partName,
          partType: part.partType,
          quantity: newQuantity,
          minQuantity: part.minQuantity,
          location: part.location,
          dateAdded: part.dateAdded,
          status: newStatus,
        };

        return sparePartService.update(part.partId, updateData);
      });

      await Promise.all(sparePartUpdatePromises);

      // Refresh data
      await fetchSpareParts();
      await fetchDistributions();

      message.success(
        `Ghi nhận trả lại ${itemsWithReturn.reduce(
          (sum, item) => sum + item.quantityToReturn,
          0
        )} phụ tùng thành công!`
      );

      setReturnModalVisible(false);
      setReturnItems([]);
      setSelectedDistributionForReturn(null);
      returnForm.resetFields();
    } catch (error) {
      console.error("Error saving return:", error);
      message.error(
        error.message || "Lỗi khi lưu phiếu trả lại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const getDistributionColumns = (type) => [
    {
      title: "Loại",
      dataIndex: "distributionType",
      key: "distributionType",
      width: 100,
      fixed: "left",
      render: (type, record) => {
        const isIncident = type === "incident";
        const hasReturnItems = record.status === "Đã trả lại";
        return (
          <Space size="small">
            {hasReturnItems && (
              <Tooltip title="Đã có phụ tùng trả lại">
                <span style={{ fontSize: "18px" }}>
                  <RollbackOutlined />
                </span>
              </Tooltip>
            )}
            <Tag
              color={isIncident ? "red" : "blue"}
              icon={isIncident ? <WarningOutlined /> : <ToolOutlined />}
              style={{ fontSize: "13px", fontWeight: 600 }}
            >
              {isIncident ? "Sự cố" : "Bảo trì"}
            </Tag>
          </Space>
        );
      },
    },
    {
      title:
        type === "incident"
          ? "Mã sự cố"
          : type === "maintenance"
          ? "Mã bảo trì"
          : "Mã SC/BT",
      dataIndex: "recordId",
      key: "recordId",
      width: 100,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Thiết bị",
      dataIndex: "recordName",
      key: "recordName",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: "13px" }}>
            {record.recordName}
          </div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.recordCode}
          </div>
        </div>
      ),
    },
    {
      title: "Người yêu cầu",
      dataIndex: "technicianName",
      key: "technicianName",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 500 }}>
            {record.technicianName || record.technicianName || "Chưa xác định"}
          </div>
          {record.technicianCode && (
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {record.technicianCode}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Số lượng",
      key: "totalItemsCount",
      width: 130,
      align: "center",
      render: (_, record) => {
        const totalItems = record.allItems?.length || record.items?.length || 0;
        return <Badge count={totalItems} showZero color="blue" />;
      },
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "lastDistributedAt",
      key: "lastDistributedAt",
      width: 150,
      render: (time) =>
        time ? (
          <div>
            <div style={{ fontSize: "13px" }}>
              {dayjs(time).format("DD/MM/YYYY")}
            </div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {dayjs(time).format("HH:mm")}
            </div>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                label: "Xem chi tiết",
                icon: <EyeOutlined />,
                onClick: () => showDistributionDetail(record),
              },
              {
                key: "return",
                label: "Trả lại vật tư",
                icon: <RollbackOutlined />,
                onClick: () => handleOpenReturnDropdown(record),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button size="small" icon={<DownOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const groupDistributions = (distributions) => {
    const grouped = distributions.reduce((acc, dist) => {
      const key = `${dist.distributionType}_${dist.recordId}`;
      if (!acc[key]) {
        acc[key] = {
          distributionType: dist.distributionType,
          recordId: dist.recordId,
          recordName: dist.recordName,
          recordCode: dist.recordCode,
          technicianName: dist.technicianName,
          technicianCode: dist.technicianCode,
          lastDistributedAt: dist.distributedAt,
          distributions: [],
          allItems: [],
          allStatuses: new Set(),
        };
      }

      if (
        dayjs(dist.distributedAt).isAfter(dayjs(acc[key].lastDistributedAt))
      ) {
        acc[key].lastDistributedAt = dist.distributedAt;
      }

      acc[key].distributions.push({
        id: dist.id,
        distributedAt: dist.distributedAt,
        distributedBy: dist.distributedBy,
        items: dist.items,
        notes: dist.notes,
        status: dist.status, // Add status to distribution record
      });

      // Track all statuses for this record
      acc[key].allStatuses.add(dist.status);

      dist.items?.forEach((item) => {
        const existingItem = acc[key].allItems.find(
          (i) => i.partId === item.partId
        );
        if (existingItem) {
          // Always add quantity regardless of status (quantity is the exported amount)
          existingItem.quantity += item.quantity || 0;
          // Add returned quantity
          existingItem.quantityToReturn =
            (existingItem.quantityToReturn || 0) + (item.quantityToReturn || 0);
          // Add actual used quantity
          existingItem.actualQuantityUsed =
            (existingItem.actualQuantityUsed || 0) +
            (item.actualQuantityUsed || 0);
        } else {
          acc[key].allItems.push({
            ...item,
            quantityToReturn: item.quantityToReturn || 0,
            actualQuantityUsed: item.actualQuantityUsed || 0,
          });
        }
      });

      return acc;
    }, {});

    // Convert to array and determine primary status for each group
    return Object.values(grouped).map((group) => {
      const totalQuantity = group.allItems.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );
      const totalReturned = group.allItems.reduce(
        (sum, item) => sum + (item.quantityToReturn || 0),
        0
      );
      const totalUsed = group.allItems.reduce(
        (sum, item) =>
          sum +
          Math.max(0, (item.quantity || 0) - (item.quantityToReturn || 0)),
        0
      );

      // Determine primary status based on allStatuses
      // If all distributions have status "Đã trả lại", then the group status is "Đã trả lại"
      // Otherwise, check if everything is returned (totalUsed === 0)
      let primaryStatus = "Đã xuất";

      const allReturned = Array.from(group.allStatuses).every(
        (status) => status === "Đã trả lại"
      );

      if (allReturned || (totalQuantity > 0 && totalUsed === 0)) {
        primaryStatus = "Đã trả lại";
      }

      return {
        ...group,
        totalQuantity,
        totalReturned,
        totalUsed,
        status: primaryStatus,
      };
    });
  };

  const filteredDistributionsList = filteredDistributions.filter((dist) => {
    if (!filters.searchText) return true;
    const searchLower = filters.searchText.toLowerCase();
    return (
      dist.recordId?.toString().toLowerCase().includes(searchLower) ||
      dist.recordName?.toLowerCase().includes(searchLower) ||
      dist.technicianName?.toLowerCase().includes(searchLower)
    );
  });

  const showDistributionDetail = React.useCallback((record) => {
    console.log("Opening detail for:", record);
    setSelectedDistributionDetail(record);
    setDetailModalVisible(true);
  }, []);

  // Tab "Sự cố" và "Bảo trì" chỉ hiển thị những phiếu chưa trả hoàn toàn (còn đang sử dụng)
  const incidentDistributions = filteredDistributionsList.filter(
    (d) => d.distributionType === "incident" && d.status === "Đã xuất"
  );
  const maintenanceDistributions = filteredDistributionsList.filter(
    (d) => d.distributionType === "maintenance" && d.status === "Đã xuất"
  );

  // Hàm render expandable row cho trả lại vật tư
  const renderReturnExpandRow = (record) => {
    if (expandedReturnRow !== record.recordId) return null;

    // Filter only "Đã xuất" distributions (not returned yet)
    const activeDistributions =
      record.distributions?.filter(
        (dist) => dist.status === "Đã xuất" || !dist.status
      ) || [];

    console.log("Active distributions for return:", activeDistributions);

    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#fafafa",
          borderRadius: "8px",
        }}
      >
        {/* <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        > */}
        {/* <Alert
            message="📦 Danh sách phụ tùng cấp phát - Sẵn sàng trả lại"
            description="Chọn phụ tùng cần trả lại và nhập số lượng thừa trong modal"
            type="warning"
            showIcon
            style={{ margin: 0, flex: 1 }}
          /> */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <Button
            type="text"
            size="small"
            onClick={() => setExpandedReturnRow(null)}
            style={{
              marginLeft: "16px",
              fontSize: "16px",
              color: "#999",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              padding: "4px 12px",
            }}
            title="Đóng"
          >
            <UpOutlined />
          </Button>
        </div>
        {/* </div> */}

        <div
          style={{
            overflow: "auto",
            borderRadius: "8px",
            border: "2px solid #D3D3D3",
            boxShadow: "0 2px 8px rgba(242, 232, 232, 0.15)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#D3D3D3",
                  borderBottom: "2px solid #D3D3D3",
                }}
              >
                <th
                  style={{
                    padding: "14px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#fff",
                    borderRight: "1px solid #aaaaaaff",
                  }}
                >
                  STT
                </th>
                <th
                  style={{
                    padding: "14px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#fff",
                    borderRight: "1px solid #aaaaaaff",
                  }}
                >
                  Mã phụ tùng
                </th>
                <th
                  style={{
                    padding: "14px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#fff",
                    borderRight: "1px solid #aaaaaaff",
                  }}
                >
                  Phụ tùng
                </th>
                <th
                  style={{
                    padding: "14px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#fff",
                    borderRight: "1px solid #aaaaaaff",
                  }}
                >
                  Ngày xuất
                </th>
                <th
                  style={{
                    padding: "14px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#fff",
                    borderRight: "1px solid #aaaaaaff",
                  }}
                >
                  SL đã xuất
                </th>
                <th
                  style={{
                    padding: "14px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#fff",
                    fixed: "right",
                  }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {activeDistributions && activeDistributions.length > 0 ? (
                activeDistributions.map((dist, idx) => (
                  <React.Fragment key={`dist_${dist.id}_${idx}`}>
                    {dist.items.map((item, itemIdx) => (
                      <tr
                        key={`${dist.id}_${item.partId}_${itemIdx}`}
                        style={{
                          borderBottom: "1px solid #e8e8e8",
                          backgroundColor: idx % 2 === 0 ? "#fff" : "#f5f5f5ff",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f5f5f5ff";
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 0 1px #aaaaaaff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            idx % 2 === 0 ? "#fff" : "#f5f5f5ff";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <td
                          style={{
                            padding: "14px",
                            textAlign: "center",
                            fontWeight: 600,
                            borderRight: "1px solid #e8e8e8",
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td
                          style={{
                            padding: "14px",
                            textAlign: "center",
                            fontSize: "13px",
                            color: "#666",
                            borderRight: "1px solid #e8e8e8",
                          }}
                        >
                          {item.partNumber}
                        </td>
                        <td
                          style={{
                            padding: "14px",
                            borderRight: "1px solid #e8e8e8",
                          }}
                        >
                          <strong style={{ fontSize: "15px" }}>
                            {item.partName}
                          </strong>
                        </td>
                        <td
                          style={{
                            padding: "14px",
                            textAlign: "center",
                            fontSize: "13px",
                            borderRight: "1px solid #e8e8e8",
                          }}
                        >
                          {dayjs(dist.distributedAt).format("DD/MM/YYYY HH:mm")}
                        </td>
                        <td
                          style={{
                            padding: "14px",
                            textAlign: "center",
                            borderRight: "1px solid #e8e8e8",
                          }}
                        >
                          <Tag
                            color="blue"
                            style={{ fontSize: "14px", padding: "4px 12px" }}
                          >
                            {item.quantity}
                          </Tag>
                        </td>
                        <td
                          style={{
                            padding: "14px",
                            textAlign: "center",
                          }}
                        >
                          {itemIdx === 0 && (
                            <Button
                              type="primary"
                              size="small"
                              icon={<RollbackOutlined />}
                              onClick={() =>
                                handleOpenReturnModal(record, dist)
                              }
                              style={{
                                fontWeight: 600,
                                backgroundColor: "#C8AC7D",
                                borderColor: "#C8AC7D",
                              }}
                            >
                              Trả lại
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#999",
                    }}
                  >
                    Không có phụ tùng nào cần trả lại
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header Section */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <div>
              <h2 style={{ margin: 0, marginBottom: 8 }}>Cấp phát vật tư</h2>
              <p style={{ margin: 0, color: "#666" }}>
                Khi kỹ thuật viên đến yêu cầu vật tư, nhấn nút bên cạnh để tạo
                phiếu cấp phát
              </p>
            </div>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
            >
              Tạo phiếu cấp phát mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ backgroundColor: "#f0f5ff" }}>
            <Statistic
              title={
                <span style={{ fontSize: "13px", color: "#1890ff" }}>
                  Tổng số cấp phát
                </span>
              }
              value={statistics.total}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ backgroundColor: "#f6ffed" }}>
            <Statistic
              title={
                <span style={{ fontSize: "13px", color: "#52c41a" }}>
                  Đã xuất
                </span>
              }
              value={statistics.exported}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ backgroundColor: "#f9f0ff" }}>
            <Statistic
              title={
                <span style={{ fontSize: "13px", color: "#722ed1" }}>
                  Đã trả lại
                </span>
              }
              value={statistics.returned}
              prefix={<InboxOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: "24px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Distribution List */}
      <Card
        title="Danh sách phiếu cấp phát"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchDistributions}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        {/* Search Filter */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            backgroundColor: "#fafafa",
            borderRadius: "8px",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 4, fontSize: "13px", color: "#666" }}>
                Khoảng thời gian
              </div>
              <DatePicker.RangePicker
                style={{ width: "100%" }}
                value={filters.dateRange}
                onChange={(dates) => handleFilterChange("dateRange", dates)}
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 4, fontSize: "13px", color: "#666" }}>
                Trạng thái
              </div>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn trạng thái"
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
                allowClear
              >
                <Select.Option value="Đã xuất">Đã xuất</Select.Option>
                <Select.Option value="Đã trả lại">Đã trả lại</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <div style={{ marginBottom: 4, fontSize: "13px", color: "#666" }}>
                Tìm kiếm
              </div>
              <Input
                placeholder="Tìm theo mã, thiết bị, người cấp phát..."
                prefix={<SearchOutlined />}
                value={filters.searchText}
                onChange={(e) =>
                  handleFilterChange("searchText", e.target.value)
                }
                allowClear
              />
            </Col>
          </Row>
          <Row style={{ marginTop: 12 }}>
            <Col span={24}>
              <Button size="small" onClick={handleResetFilters}>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "incident",
              label: (
                <span>
                  <FileTextOutlined /> Sự cố{" "}
                  <Badge
                    count={incidentDistributions.length}
                    style={{ backgroundColor: "#52c41a" }}
                  />
                </span>
              ),
              children: (
                <Table
                  dataSource={incidentDistributions}
                  columns={getDistributionColumns("incident")}
                  rowKey="recordId"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng ${total} phiếu cấp phát`,
                  }}
                  locale={{
                    emptyText: (
                      <Empty description="Chưa có phiếu cấp phát nào" />
                    ),
                  }}
                  scroll={{ x: 1000 }}
                  expandable={{
                    expandedRowKeys: expandedReturnRow
                      ? [expandedReturnRow]
                      : [],
                    expandedRowRender: renderReturnExpandRow,
                    expandIcon: () => null,
                    expandIconColumnIndex: -1,
                  }}
                />
              ),
            },
            {
              key: "maintenance",
              label: (
                <span>
                  <FileTextOutlined /> Bảo trì{" "}
                  <Badge
                    count={maintenanceDistributions.length}
                    style={{ backgroundColor: "#52c41a" }}
                  />
                </span>
              ),
              children: (
                <Table
                  dataSource={maintenanceDistributions}
                  columns={getDistributionColumns("maintenance")}
                  rowKey="recordId"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng ${total} phiếu cấp phát`,
                  }}
                  locale={{
                    emptyText: (
                      <Empty description="Chưa có phiếu cấp phát nào" />
                    ),
                  }}
                  scroll={{ x: 1000 }}
                  expandable={{
                    expandedRowKeys: expandedReturnRow
                      ? [expandedReturnRow]
                      : [],
                    expandedRowRender: renderReturnExpandRow,
                    expandIcon: () => null,
                    expandIconColumnIndex: -1,
                  }}
                />
              ),
            },
            {
              key: "history",
              label: (
                <span>
                  <HistoryOutlined /> Lịch sử giao dịch{" "}
                  <Badge
                    count={filteredDistributionsList.length}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                </span>
              ),
              children: (
                <Table
                  dataSource={filteredDistributionsList}
                  columns={[
                    {
                      title: "Loại",
                      dataIndex: "distributionType",
                      key: "distributionType",
                      width: 100,
                      fixed: "left",
                      render: (type) => (
                        <Tag color={type === "incident" ? "red" : "blue"}>
                          {type === "incident" ? "Sự cố" : "Bảo trì"}
                        </Tag>
                      ),
                    },
                    {
                      title: "Mã SC/BT",
                      dataIndex: "recordId",
                      key: "recordId",
                      width: 100,
                      render: (text) => <strong>{text}</strong>,
                    },
                    {
                      title: "Thiết bị",
                      dataIndex: "recordName",
                      key: "recordName",
                      width: 200,
                      render: (_, record) => (
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "13px" }}>
                            {record.recordName}
                          </div>
                          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            {record.recordCode}
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: "Người yêu cầu",
                      dataIndex: "technicianName",
                      key: "technicianName",
                      width: 150,
                      render: (_, record) => (
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 500 }}>
                            {record.technicianName}
                          </div>
                          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            {record.technicianCode}
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: "Số lượng",
                      key: "totalItemsCount",
                      width: 130,
                      align: "center",
                      render: (_, record) => {
                        return (
                          <Badge
                            count={record.totalQuantity}
                            showZero
                            color="blue"
                          />
                        );
                      },
                    },
                    {
                      title: "Trạng thái",
                      dataIndex: "status",
                      key: "status",
                      width: 150,
                      render: (status) => {
                        const statusConfig = {
                          "Đã xuất": {
                            color: "green",
                            icon: <CheckCircleOutlined />,
                          },
                          "Đã trả lại": {
                            color: "purple",
                            icon: <InboxOutlined />,
                          },
                        };
                        const config = statusConfig[status] || {
                          color: "default",
                          icon: null,
                        };
                        return (
                          <Tag color={config.color} icon={config.icon}>
                            {status}
                          </Tag>
                        );
                      },
                    },
                    {
                      title: "Ngày yêu cầu",
                      dataIndex: "lastDistributedAt",
                      key: "lastDistributedAt",
                      width: 150,
                      render: (time) =>
                        time ? (
                          <div>
                            <div style={{ fontSize: "13px" }}>
                              {dayjs(time).format("DD/MM/YYYY")}
                            </div>
                            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                              {dayjs(time).format("HH:mm")}
                            </div>
                          </div>
                        ) : (
                          "-"
                        ),
                    },
                    {
                      title: "Thao tác",
                      key: "action",
                      width: 100,
                      render: (_, record) => {
                        const menuItems = [
                          {
                            key: "detail",
                            label: "Xem chi tiết",
                            icon: <EyeOutlined />,
                            onClick: () => showDistributionDetail(record),
                          },
                        ];
                        return (
                          <Dropdown
                            menu={{ items: menuItems }}
                            trigger={["click"]}
                            placement="bottomRight"
                          >
                            <Button
                              type="link"
                              icon={<DownOutlined />}
                              style={{ padding: "4px 8px", color: "#334766" }}
                            />
                          </Dropdown>
                        );
                      },
                    },
                  ]}
                  rowKey="recordId"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng ${total} giao dịch`,
                  }}
                  scroll={{ x: 1200 }}
                  locale={{
                    emptyText: (
                      <Empty description="Không có lịch sử giao dịch nào" />
                    ),
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Distribution Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Tạo phiếu cấp phát vật tư
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedDistributions([]);
          setSelectedRecord(null);
          setMaintenances([]);
          distributionForm.resetFields();
        }}
        width={1100}
        footer={null}
        destroyOnClose
      >
        <Form
          form={distributionForm}
          layout="vertical"
          onFinish={handleSaveDistribution}
        >
          <Alert
            message="Thông tin cấp phát"
            description="Vui lòng điền đầy đủ thông tin về phiếu cấp phát vật tư"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label={
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Loại cấp phát
              </span>
            }
            name="distributionType"
            initialValue="incident"
            rules={[{ required: true, message: "Vui lòng chọn loại cấp phát" }]}
          >
            <Select
              placeholder="Chọn loại cấp phát"
              size="large"
              allowClear
              onChange={(value) => {
                setDistributionType(value);
                setSelectedRecord(null);
                if (value === "incident") {
                  fetchIncidents();
                  setMaintenances([]);
                } else {
                  setIncidents([]);
                  fetchMaintenances();
                }
                distributionForm.setFieldsValue({
                  recordId: undefined,
                  technicianName: undefined,
                  technicianId: undefined,
                });
              }}
            >
              <Select.Option value="incident">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Tag color="red" style={{ margin: 0, marginRight: 8 }}>
                    Sự cố
                  </Tag>
                  <span>Cấp phát cho sự cố</span>
                </div>
              </Select.Option>
              <Select.Option value="maintenance">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Tag color="cyan" style={{ margin: 0, marginRight: 8 }}>
                    Bảo trì
                  </Tag>
                  <span>Cấp phát cho bảo trì</span>
                </div>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {distributionType === "incident" ? "Mã sự cố" : "Mã bảo trì"}
              </span>
            }
            name="recordId"
            rules={[
              {
                required: true,
                message: `Vui lòng chọn ${
                  distributionType === "incident" ? "sự cố" : "bảo trì"
                }`,
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              size="large"
              placeholder={`Tìm kiếm và chọn ${
                distributionType === "incident" ? "sự cố" : "bảo trì"
              }...`}
              onSearch={(value) => {
                if (distributionType === "incident") {
                  searchIncidents(value);
                } else {
                  searchMaintenances(value);
                }
              }}
              onChange={handleRecordSelect}
              filterOption={false}
              loading={searchingIncidents || searchingMaintenances}
              notFoundContent={
                searchingIncidents || searchingMaintenances ? (
                  <Spin size="small" />
                ) : (
                  <Empty
                    description={
                      distributionType === "incident"
                        ? "Không có sự cố nào được giao cho kỹ thuật viên"
                        : "Không có bảo trì nào"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )
              }
              dropdownStyle={{ maxWidth: "600px" }}
            >
              {(distributionType === "incident" ? incidents : maintenances).map(
                (record) => {
                  const recordId =
                    distributionType === "incident"
                      ? record.incidentId
                      : record.workOrderId;
                  const displayId =
                    distributionType === "incident"
                      ? record.incidentId
                      : record.workOrderId;
                  return (
                    <Select.Option key={recordId} value={recordId}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          overflow: "hidden",
                        }}
                      >
                        <Tag
                          color={
                            distributionType === "incident" ? "red" : "cyan"
                          }
                          style={{ margin: 0, marginRight: 8, flexShrink: 0 }}
                        >
                          {displayId}
                        </Tag>
                        <span
                          style={{
                            fontWeight: 500,
                            marginRight: 8,
                            flexShrink: 0,
                          }}
                        >
                          {record.equipmentName}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#999",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ({record.equipmentCode} -{" "}
                          {record.lineName || record.equipment?.line?.lineName})
                        </span>
                      </div>
                    </Select.Option>
                  );
                }
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Kỹ thuật viên đảm nhiệm
              </span>
            }
            name="technicianName"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn sự cố để hiển thị kỹ thuật viên",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Chọn sự cố để xem thông tin kỹ thuật viên"
              prefix={<UserOutlined />}
              style={{
                backgroundColor: "#f5f5f5",
                color: "#000",
                cursor: "not-allowed",
              }}
            />
          </Form.Item>
          <Form.Item name="technicianId" hidden>
            <Input type="hidden" />
          </Form.Item>

          {selectedRecord && (
            <Alert
              message={
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {distributionType === "incident"
                    ? "Thông tin sự cố đã chọn"
                    : "Thông tin bảo trì đã chọn"}
                </span>
              }
              description={
                <div style={{ lineHeight: "1.8" }}>
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        <strong style={{ minWidth: 80, flexShrink: 0 }}>
                          Thiết bị:
                        </strong>
                        <span style={{ flex: 1, paddingLeft: 8 }}>
                          {selectedRecord.equipmentName ||
                            selectedRecord.equipment?.equipmentName}{" "}
                          (
                          {selectedRecord.equipmentCode ||
                            selectedRecord.equipment?.equipmentCode}
                          )
                        </span>
                      </div>
                    </Col>
                    {distributionType === "maintenance" ? (
                      <>
                        <Col span={12}>
                          <div style={{ display: "flex", flexWrap: "wrap" }}>
                            <strong style={{ minWidth: 120, flexShrink: 0 }}>
                              KTV Cơ khí:
                            </strong>
                            <span style={{ flex: 1, paddingLeft: 8 }}>
                              {selectedRecord.mechanicalTechnicianName ||
                                selectedRecord.mechanicalTechnician?.fullName ||
                                selectedRecord.mechanicalTechnician?.name || (
                                  <span style={{ color: "#999" }}>
                                    Chưa phân công
                                  </span>
                                )}
                            </span>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ display: "flex", flexWrap: "wrap" }}>
                            <strong style={{ minWidth: 120, flexShrink: 0 }}>
                              KTV Điện:
                            </strong>
                            <span style={{ flex: 1, paddingLeft: 8 }}>
                              {selectedRecord.electricalTechnicianName ||
                                selectedRecord.electricalTechnician?.fullName ||
                                selectedRecord.electricalTechnician?.name || (
                                  <span style={{ color: "#999" }}>
                                    Chưa phân công
                                  </span>
                                )}
                            </span>
                          </div>
                        </Col>
                      </>
                    ) : (
                      <Col span={12}>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          <strong style={{ minWidth: 100, flexShrink: 0 }}>
                            Kỹ thuật viên:
                          </strong>
                          <span style={{ flex: 1, paddingLeft: 8 }}>
                            {selectedRecord.assignedToName || "Chưa phân công"}
                          </span>
                        </div>
                      </Col>
                    )}
                    <Col span={12}>
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        <strong style={{ minWidth: 80, flexShrink: 0 }}>
                          Dây chuyền:
                        </strong>
                        <span style={{ flex: 1, paddingLeft: 8 }}>
                          {selectedRecord.lineName ||
                            selectedRecord.equipment?.line?.lineName ||
                            "N/A"}
                        </span>
                      </div>
                    </Col>
                    {(selectedRecord.startTime ||
                      selectedRecord.scheduledDate) && (
                      <Col span={12}>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          <strong style={{ minWidth: 100, flexShrink: 0 }}>
                            {distributionType === "incident"
                              ? "Thời gian bắt đầu:"
                              : "Ngày lên kế hoạch:"}
                          </strong>
                          <span style={{ flex: 1, paddingLeft: 8 }}>
                            {dayjs(
                              selectedRecord.startTime ||
                                selectedRecord.scheduledDate
                            ).format("DD/MM/YYYY HH:mm")}
                          </span>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            label={
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                Danh sách phụ tùng cần cấp phát
              </span>
            }
          >
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#fafafa",
                minHeight: 200,
              }}
            >
              {selectedDistributions.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      tableLayout: "fixed",
                    }}
                  >
                    <colgroup>
                      <col style={{ width: "60px" }} />
                      <col style={{ width: "auto" }} />
                      <col style={{ width: "120px" }} />
                      <col style={{ width: "140px" }} />
                      <col style={{ width: "80px" }} />
                    </colgroup>
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid #d9d9d9",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            fontWeight: 600,
                          }}
                        >
                          STT
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            fontWeight: 600,
                          }}
                        >
                          Phụ tùng
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            fontWeight: 600,
                          }}
                        >
                          Số lượng
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "left",
                            fontWeight: 600,
                          }}
                        >
                          Số lượng tồn kho
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            textAlign: "center",
                            fontWeight: 600,
                          }}
                        >
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDistributions.map((item, index) => (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: "1px solid #f0f0f0",
                            backgroundColor:
                              index % 2 === 0 ? "#fff" : "#fafafa",
                          }}
                        >
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            {index + 1}
                          </td>
                          <td style={{ padding: "8px" }}>
                            <Select
                              placeholder="Chọn phụ tùng"
                              style={{ width: "100%" }}
                              value={item.partId}
                              allowClear
                              showSearch
                              filterOption={(input, option) =>
                                option.label
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                              onChange={(value) =>
                                handleUpdateSparePartInDistribution(
                                  item.id,
                                  "partId",
                                  value
                                )
                              }
                              optionLabelProp="label"
                            >
                              {spareParts.map((part) => (
                                <Select.Option
                                  key={part.partId}
                                  value={part.partId}
                                  label={`${part.partName} (${part.partNumber})`}
                                >
                                  <div>
                                    <div style={{ fontWeight: 500 }}>
                                      {part.partName}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 12,
                                        color: "#999",
                                      }}
                                    >
                                      {part.partNumber}
                                    </div>
                                  </div>
                                </Select.Option>
                              ))}
                            </Select>
                          </td>
                          <td style={{ padding: "8px" }}>
                            <InputNumber
                              min={1}
                              value={item.quantity}
                              onChange={(value) =>
                                handleUpdateSparePartInDistribution(
                                  item.id,
                                  "quantity",
                                  value
                                )
                              }
                              style={{ width: "100%" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <span
                              style={{
                                fontWeight: 500,
                                color: item.partId
                                  ? (spareParts.find(
                                      (p) => p.partId === item.partId
                                    )?.quantity || 0) < item.quantity
                                    ? "#ff4d4f"
                                    : "#52c41a"
                                  : "#000",
                              }}
                            >
                              {item.partId
                                ? spareParts.find(
                                    (p) => p.partId === item.partId
                                  )?.quantity || 0
                                : "-"}
                            </span>
                          </td>
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                handleRemoveSparePartFromDistribution(item.id)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty
                  description="Chưa thêm phụ tùng nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: "40px 0" }}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddSparePartToDistribution}
                  >
                    Thêm phụ tùng đầu tiên
                  </Button>
                </Empty>
              )}
            </div>
          </Form.Item>

          {selectedDistributions.length > 0 && (
            <Form.Item>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddSparePartToDistribution}
                block
                size="large"
              >
                Thêm phụ tùng khác
              </Button>
            </Form.Item>
          )}

          <Form.Item label="Ghi chú thêm" name="notes">
            <Input.TextArea
              placeholder="Nhập ghi chú về phiếu cấp phát (nếu có)..."
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                size="large"
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedDistributions([]);
                  setSelectedRecord(null);
                  setMaintenances([]);
                  distributionForm.resetFields();
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<CheckCircleOutlined />}
                disabled={selectedDistributions.length === 0}
                loading={loading}
              >
                Lưu phiếu cấp phát
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Distribution Detail Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Chi tiết phiếu cấp phát
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedDistributionDetail(null);
        }}
        width={1000}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(false);
              setSelectedDistributionDetail(null);
            }}
          >
            Đóng
          </Button>,
        ]}
      >
        {selectedDistributionDetail && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Loại">
              {selectedDistributionDetail.distributionType === "incident"
                ? "Sự cố"
                : "Bảo trì"}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                selectedDistributionDetail.distributionType === "incident"
                  ? "Mã Sự cố"
                  : "Mã Bảo trì"
              }
            >
              {selectedDistributionDetail.recordId}
            </Descriptions.Item>

            <Descriptions.Item label="Thiết bị" span={2}>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {selectedDistributionDetail.recordName}
                </div>
                <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                  Mã: {selectedDistributionDetail.recordCode}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Phụ tùng cấp phát" span={2}>
              {selectedDistributionDetail.allItems ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {selectedDistributionDetail.allItems.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "12px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "6px",
                        border: "1px solid #d9d9d9",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>
                        {item.partName}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#8c8c8c",
                          marginBottom: 8,
                        }}
                      >
                        Mã: {item.partNumber || item.partCode}
                      </div>
                      <Space size="large">
                        <span>
                          <strong>Cấp phát:</strong> {item.quantity} cái
                        </span>
                      </Space>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedDistributionDetail.partName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                    Mã: {selectedDistributionDetail.partCode}
                  </div>
                </div>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Tổng số lượng cấp phát">
              <strong>{selectedDistributionDetail.totalQuantity} cái</strong>
            </Descriptions.Item>

            <Descriptions.Item label="Tổng số lượng sử dụng">
              {selectedDistributionDetail.totalUsed != null ? (
                <strong style={{ color: "#52c41a" }}>
                  {selectedDistributionDetail.totalUsed} cái
                </strong>
              ) : (
                <span style={{ color: "#8c8c8c", fontStyle: "italic" }}>
                  Chưa xác định
                </span>
              )}
            </Descriptions.Item>

            {(selectedDistributionDetail.totalReturned != null ||
              selectedDistributionDetail.totalReturned > 0) && (
              <Descriptions.Item label="Tổng số lượng trả lại" span={2}>
                <strong style={{ color: "#1890ff" }}>
                  {selectedDistributionDetail.totalReturned ?? 0} cái
                </strong>
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Người yêu cầu">
              <div>
                <div style={{ fontWeight: 600 }}>
                  {selectedDistributionDetail.technicianName || "Chưa xác định"}
                </div>
                {selectedDistributionDetail.technicianCode && (
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                    Mã NV: {selectedDistributionDetail.technicianCode}
                  </div>
                )}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Ngày yêu cầu">
              {selectedDistributionDetail.lastDistributedAt
                ? dayjs(selectedDistributionDetail.lastDistributedAt).format(
                    "DD/MM/YYYY HH:mm"
                  )
                : "-"}
            </Descriptions.Item>

            {selectedDistributionDetail.distributions?.some(
              (d) => d.returnDate
            ) && (
              <Descriptions.Item label="Ngày trả lại" span={2}>
                {dayjs(
                  selectedDistributionDetail.distributions.find(
                    (d) => d.returnDate
                  ).returnDate
                ).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            )}

            {selectedDistributionDetail.notes && (
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedDistributionDetail.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Return Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            <RollbackOutlined style={{ marginRight: 8 }} />
            Ghi nhận Trả lại Phụ tùng
          </div>
        }
        open={returnModalVisible}
        onCancel={() => {
          setReturnModalVisible(false);
          setReturnItems([]);
          setSelectedDistributionForReturn(null);
        }}
        width={900}
        footer={null}
        destroyOnClose
      >
        {selectedDistributionForReturn && (
          <Form form={returnForm} layout="vertical" onFinish={handleSaveReturn}>
            <Alert
              message="Ghi nhận Phụ tùng Trả lại"
              description="Nhập số lượng phụ tùng thừa mà kỹ thuật viên trả lại"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Descriptions
              bordered
              column={2}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Mã">
                {selectedDistributionForReturn.recordId}
              </Descriptions.Item>
              <Descriptions.Item label="Thiết bị">
                {selectedDistributionForReturn.recordName}
              </Descriptions.Item>
              <Descriptions.Item label="Kỹ thuật viên" span={2}>
                {selectedDistributionForReturn.technicianName}
              </Descriptions.Item>
            </Descriptions>

            <Form.Item
              label={
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  Danh sách Phụ tùng Trả lại
                </span>
              }
            >
              <div
                style={{
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: 600,
                          borderBottom: "1px solid #d9d9d9",
                        }}
                      >
                        STT
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: 600,
                          borderBottom: "1px solid #d9d9d9",
                        }}
                      >
                        Phụ tùng
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: 600,
                          borderBottom: "1px solid #d9d9d9",
                          width: 100,
                        }}
                      >
                        Đã xuất
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: 600,
                          borderBottom: "1px solid #d9d9d9",
                          width: 150,
                        }}
                      >
                        Trả lại
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.map((item, idx) => (
                      <tr key={item.partId}>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          <div>
                            <strong>{item.partName}</strong>
                            <div style={{ fontSize: 12, color: "#999" }}>
                              {item.partNumber}
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          <Tag color="blue">{item.quantityExported}</Tag>
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          <InputNumber
                            min={0}
                            //max={item.quantityExported}
                            value={item.quantityToReturn}
                            onChange={(value) =>
                              handleUpdateReturnQuantity(item.partId, value)
                            }
                            style={{ width: "100%" }}
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Form.Item>

            <Form.Item label="Ghi chú" name="returnNotes">
              <Input.TextArea
                placeholder="Nhập ghi chú về phiếu trả lại..."
                rows={3}
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Alert
              message={
                <span style={{ fontWeight: 600 }}>
                  Tổng trả lại:{" "}
                  <Tag color="green" style={{ fontSize: 14 }}>
                    {returnItems.reduce(
                      (sum, item) => sum + (item.quantityToReturn || 0),
                      0
                    )}
                  </Tag>
                  phụ tùng
                </span>
              }
              type="success"
              style={{ marginBottom: 16 }}
            />

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button
                  size="large"
                  onClick={() => {
                    setReturnModalVisible(false);
                    setReturnItems([]);
                    setSelectedDistributionForReturn(null);
                  }}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  icon={<CheckCircleOutlined />}
                  disabled={
                    returnItems.reduce(
                      (sum, item) => sum + (item.quantityToReturn || 0),
                      0
                    ) === 0
                  }
                  loading={loading}
                >
                  Lưu Phiếu Trả lại
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default IncidentSparePartsDistribution;
