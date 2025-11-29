import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  Popconfirm,
  Tooltip,
  Statistic,
  Badge,
  Descriptions,
  Timeline,
  Upload,
  Alert,
  Dropdown,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  UploadOutlined,
  FilterOutlined,
  DownOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  FileExcelOutlined,
  ToolOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import * as utcPlugin from "dayjs/plugin/utc";
import * as minMaxPlugin from "dayjs/plugin/minMax";
import styles from "../../styles/pages/IncidentManagement.module.css";

// Extend dayjs with UTC plugin
dayjs.extend(utcPlugin.default || utcPlugin);
dayjs.extend(minMaxPlugin.default || minMaxPlugin);
import { incidentService } from "../../services/incidentService";
import { equipmentService } from "../../services/equipmentService";
import { lineService } from "../../services/lineService";
import { stageService } from "../../services/stageService";
import { stopTypeService } from "../../services/stopTypeService";
import { userService } from "../../services/userService";
import { authService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import * as XLSX from "xlsx";

// Calculate adjusted duration with break time deduction (same logic as backend)
const calculateAdjustedDuration = (startTime, endTime) => {
  if (!startTime || !endTime || !dayjs(endTime).isAfter(dayjs(startTime))) {
    return null;
  }

  const rawDuration = dayjs(endTime).diff(dayjs(startTime), "minute", true);
  let adjustedDuration = rawDuration;

  // Break times: 11:00-11:30 and 18:00-18:30
  const break1Start = dayjs(startTime)
    .set("hour", 11)
    .set("minute", 0)
    .set("second", 0);
  const break1End = dayjs(startTime)
    .set("hour", 11)
    .set("minute", 30)
    .set("second", 0);
  const break2Start = dayjs(startTime)
    .set("hour", 18)
    .set("minute", 0)
    .set("second", 0);
  const break2End = dayjs(startTime)
    .set("hour", 18)
    .set("minute", 30)
    .set("second", 0);

  // Calculate overlap with break 1 (11:00-11:30)
  const break1Overlap = calculateOverlapMinutes(
    startTime,
    endTime,
    break1Start,
    break1End
  );
  adjustedDuration -= break1Overlap;

  // Calculate overlap with break 2 (18:00-18:30)
  const break2Overlap = calculateOverlapMinutes(
    startTime,
    endTime,
    break2Start,
    break2End
  );
  adjustedDuration -= break2Overlap;

  // Ensure duration is not negative
  return Math.max(0, adjustedDuration);
};

// Calculate overlap minutes between two time ranges
const calculateOverlapMinutes = (start1, end1, start2, end2) => {
  const overlapStart = dayjs.max(dayjs(start1), dayjs(start2));
  const overlapEnd = dayjs.min(dayjs(end1), dayjs(end2));

  if (overlapStart.isBefore(overlapEnd)) {
    return overlapEnd.diff(overlapStart, "minute", true);
  }

  return 0;
};

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const IncidentManagement = () => {
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [createStatus, setCreateStatus] = useState("Chờ xử lý");
  const [selectedDate, setSelectedDate] = useState(null);
  const [form] = Form.useForm();
  const [incidentForms, setIncidentForms] = useState([
    { id: 1, status: "Chờ xử lý" },
  ]);

  // State for dropdown data
  const [equipments, setEquipments] = useState([]);
  const [lines, setLines] = useState([]);
  const [stages, setStages] = useState([]);
  const [stopTypes, setStopTypes] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [currentReporter, setCurrentReporter] = useState(null);
  const [teamLeads, setTeamLeads] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  // const [userLines, setUserLines] = useState([]); // No longer needed - filtering done in backend
  const [incidentShifts, setIncidentShifts] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [formChanged, setFormChanged] = useState(false);
  // Keep previous endTime to restore if user cancels clearing it
  const [previousEndTime, setPreviousEndTime] = useState(null);
  const [formChangeCounter, setFormChangeCounter] = useState(0);
  // Track which duration fields have been manually edited
  const [manualDurationFields, setManualDurationFields] = useState(new Set());
  // Ref to skip auto-calculate duration on initial form open (use ref to avoid re-render trigger)
  const skipInitialDurationCalcRef = useRef(false);
  // Image upload states
  const [imageFileList, setImageFileList] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState({});

  const searchInput = useRef(null);

  const getColumnSearchProps = (dataIndex, placeholderText = "") => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={placeholderText || `Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters && clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const text = record[dataIndex];
      return text
        ? text.toString().toLowerCase().includes(value.toLowerCase())
        : false;
    },
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  useEffect(() => {
    fetchEquipments();
    fetchLines();
    fetchStages();
    fetchStopTypes();
    fetchAllUsers();
    fetchIncidents();
  }, []);

  // Handle navigation state from EFormSystem
  useEffect(() => {
    if (location.state?.openEditModal && location.state?.incidentToEdit) {
      const incidentToEdit = location.state.incidentToEdit;

      // Wait a bit for data to load
      setTimeout(() => {
        handleEditIncident(incidentToEdit);
      }, 500);

      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    handleFilter();
  }, [searchText, filterStatus, filterPriority, selectedDate, incidents]);

  useEffect(() => {
    if (formModalVisible && (selectedEquipment || currentUser)) {
      fetchTeamLeads();
    }
  }, [selectedEquipment, currentUser, formModalVisible]);

  // Auto-calculate duration when startTime or endTime changes (Edit mode)
  // Only auto-fill if user hasn't manually entered duration
  useEffect(() => {
    if (formModalVisible && isEditMode) {
      // Skip initial calculation when form first opens with existing data
      if (skipInitialDurationCalcRef.current) {
        skipInitialDurationCalcRef.current = false;
        return;
      }

      const startTime = form.getFieldValue("startTime");
      const endTime = form.getFieldValue("endTime");

      if (startTime && endTime && dayjs(endTime).isAfter(dayjs(startTime))) {
        const adjustedDuration = calculateAdjustedDuration(startTime, endTime);
        // Only auto-update if duration field hasn't been manually edited
        if (!manualDurationFields.has("duration")) {
          form.setFieldsValue({
            duration: Math.round(adjustedDuration * 100) / 100,
          }); // Round to 0.01 minutes
        }

        // Auto-update status to "Hoàn thành" when endTime exists
        form.setFieldsValue({
          status: "Hoàn thành",
        });
      } else if (!endTime) {
        // Reset duration when endTime is cleared (only if not manually set)
        if (!manualDurationFields.has("duration")) {
          form.setFieldsValue({ duration: undefined });
        }

        // Reset status to "Chờ xử lý" or "Đang xử lý" when endTime is cleared
        const isTechSupport = form.getFieldValue("isTechSupport");
        const assignedTo = selectedIncident?.assignedTo;
        if (isTechSupport && assignedTo) {
          form.setFieldsValue({ status: "Đang xử lý" });
        } else {
          form.setFieldsValue({ status: "Chờ xử lý" });
        }
      }
    }
  }, [
    formModalVisible,
    form.getFieldValue("startTime"),
    form.getFieldValue("endTime"),
    isEditMode,
    manualDurationFields,
  ]);

  const handleFormValuesChange = (changedValues, allValues) => {
    // Track manual duration input
    const changedKeys = Object.keys(changedValues);
    changedKeys.forEach((key) => {
      if (key === "duration" || key.includes("duration_")) {
        setManualDurationFields((prev) => new Set(prev).add(key));
      }
    });

    // Trigger re-calculation when startTime or endTime changes
    if (
      changedValues.startTime !== undefined ||
      changedValues.endTime !== undefined
    ) {
      setFormChangeCounter((prev) => prev + 1);
    }
    // Also trigger for create mode form fields
    const hasTimeChange = changedKeys.some(
      (key) => key.includes("startTime_") || key.includes("endTime_")
    );
    if (hasTimeChange) {
      setFormChangeCounter((prev) => prev + 1);
    }
    setFormChanged(true);
  };

  // Auto-calculate duration for create mode (multiple forms)
  // Only auto-fill if user hasn't manually entered duration
  useEffect(() => {
    if (formModalVisible && !isEditMode) {
      incidentForms.forEach((incidentForm) => {
        const formId = incidentForm.id;
        const startTime = form.getFieldValue(`startTime_${formId}`);
        const endTime = form.getFieldValue(`endTime_${formId}`);
        const durationFieldKey = `duration_${formId}`;

        if (startTime && endTime && dayjs(endTime).isAfter(dayjs(startTime))) {
          const adjustedDuration = calculateAdjustedDuration(
            startTime,
            endTime
          );
          // Only auto-update if duration field hasn't been manually edited
          if (!manualDurationFields.has(durationFieldKey)) {
            form.setFieldsValue({
              [durationFieldKey]: Math.round(adjustedDuration * 100) / 100,
            });
          }
        } else if (!endTime) {
          // Reset duration when endTime is cleared (only if not manually set)
          if (!manualDurationFields.has(durationFieldKey)) {
            form.setFieldsValue({
              [durationFieldKey]: undefined,
            });
          }
        }
      });
    }
  }, [
    formModalVisible,
    incidentForms,
    isEditMode,
    formChangeCounter,
    manualDurationFields,
  ]);

  const fetchEquipments = async () => {
    try {
      const isAdmin = authService.isAdmin();
      let response;

      if (isAdmin) {
        // Admin sees all equipments
        response = await equipmentService.getEquipments();
      } else {
        // Team Leader sees only equipments from their assigned lines
        response = await equipmentService.getEquipmentsByUserLines(
          currentUser.id
        );
      }

      const data = Array.isArray(response) ? response : response?.data || [];
      setEquipments(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách thiết bị:", error);
      message.error("Không thể tải danh sách thiết bị");
    }
  };

  const fetchLines = async () => {
    try {
      const isAdmin = authService.isAdmin();
      let response;

      if (isAdmin) {
        // Admin sees all lines
        response = await lineService.getLines();
      } else {
        // Team Leader sees only lines they are assigned to
        response = await lineService.getLinesByUser(currentUser.id);
      }

      const data = Array.isArray(response) ? response : response?.data || [];
      setLines(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách dây chuyền:", error);
      message.error("Không thể tải danh sách dây chuyền");
    }
  };

  const fetchStages = async () => {
    try {
      const isAdmin = authService.isAdmin();
      let response;

      if (isAdmin) {
        // Admin sees all stages
        response = await stageService.getStages();
      } else {
        // Team Leader sees only stages from their assigned lines
        response = await stageService.getStagesByUserLines(currentUser.id);
      }

      const data = Array.isArray(response) ? response : response?.data || [];
      setStages(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách công đoạn:", error);
      message.error("Không thể tải danh sách công đoạn");
    }
  };

  const fetchStopTypes = async () => {
    try {
      const response = await stopTypeService.getStopTypes();
      const data = Array.isArray(response) ? response : response?.data || [];
      setStopTypes(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách loại dừng:", error);
      message.error("Không thể tải danh sách loại dừng");
    }
  };

  const fetchTeamLeads = async () => {
    try {
      // Get lineId from selected equipment or current user's line
      let lineId = null;

      // First try to get from selected equipment
      if (selectedEquipment?.lineId) {
        lineId = selectedEquipment.lineId;
      }
      // If no selected equipment, try to get from current user's lines
      else if (currentUser?.userLines && currentUser.userLines.length > 0) {
        lineId = currentUser.userLines[0].lineId; // Take first line if user has multiple
      }

      if (!lineId) {
        console.warn("Không xác định được dây chuyền để tải tổ trưởng");
        setTeamLeads([]);
        return;
      }

      // Get active team leads for the specific line
      const response = await userService.getActiveTeamLeadsByLine(lineId);
      const data = Array.isArray(response) ? response : response?.data || [];
      setTeamLeads(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tổ trưởng:", error);
      message.error("Không thể tải danh sách tổ trưởng");
      setTeamLeads([]);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await userService.getUsers();
      const users = Array.isArray(res) ? res : res?.data || [];
      setAllUsers(users);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      // don't block UI if users cannot be loaded
      setAllUsers([]);
    }
  };

  const fetchUserLines = async () => {
    try {
      const data = await userService.getUserLines(currentUser.id);
      setUserLines(data);
    } catch (error) {
      console.error("fetchUserLines error", error);
    }
  };

  const fetchIncidentShifts = async (incidentId) => {
    try {
      const response = await incidentService.getIncidentShifts(incidentId);
      const data = Array.isArray(response) ? response : response?.data || [];
      setIncidentShifts(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách ca sự cố:", error);
      setIncidentShifts([]);
    }
  };

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      let res;

      // Check if user is admin
      const isAdmin = authService.isAdmin();

      if (isAdmin) {
        // Admin sees all incidents
        res = await incidentService.getAll();
      } else {
        // Team Leader sees only incidents from their assigned lines
        res = await incidentService.getIncidentsByUserLines(currentUser.id);
      }

      // backend returns { success, data }
      const items = Array.isArray(res) ? res : res?.data || [];
      // Normalize to frontend shape
      const mapped = (items || []).map((it) => {
        // compute downtime in minutes if possible
        let downtime = 0;
        try {
          // Priority: use duration from database (already calculated with break time deduction)
          // Only calculate from start/end time if duration is not available
          if (it.duration != null) {
            downtime = Number(it.duration) || 0;
          } else if (it.downtimeMinutes != null) {
            downtime = Number(it.downtimeMinutes) || 0;
          } else if (it.downtime != null) {
            downtime = Number(it.downtime) || 0;
          } else if (it.endTime && it.startTime) {
            // Fallback: calculate from start/end time (without break time deduction)
            const start = dayjs(it.startTime);
            const end = dayjs(it.endTime);
            downtime = Math.abs(end.diff(start, "minute", true)); // true for floating point precision
          }
        } catch (e) {
          downtime = it.downtimeMinutes || it.downtime || it.duration || 0;
        }

        return {
          id: it.incidentId || it.id || it.IncidentId,
          equipmentId: it.equipmentId || it.equipment?.equipmentId,
          typeId: it.typeId || it.type?.typeId || it.type?.stopTypeId,
          lineId: it.equipment?.lineId || it.line?.lineId,
          stageId: it.equipment?.stageId || it.stage?.stageId,
          title:
            it.title ||
            it.Title ||
            it.type?.typeName ||
            it.typeName ||
            it.TypeName ||
            "",
          equipmentName:
            it.equipment?.equipmentName ||
            it.equipmentName ||
            it.EquipmentName ||
            "",
          equipmentCode: it.equipment?.equipmentCode || it.equipmentCode || "",
          lineName:
            it.equipment?.stage?.line?.lineName ||
            it.line?.lineName ||
            it.lineName ||
            it.LineName ||
            "",
          stageName:
            it.equipment?.stage?.stageName ||
            it.stage?.stageName ||
            it.stageName ||
            it.StageName ||
            "",
          priority: it.priority || it.Priority || "Trung bình",
          status:
            it.status ||
            it.Status ||
            (it.isResolved ? "Hoàn thành" : "Chờ xử lý"),
          reporter:
            it.reportedByUser?.fullName ||
            it.reportedByName ||
            it.reporter ||
            it.Reporter ||
            it.createdBy ||
            it.createdByName ||
            "",
          reportedByUserId:
            it.reportedByUserId ||
            it.reportedByUser?.id ||
            it.reporterId ||
            null,
          assignedTo:
            it.assignedToName || it.assignedTo || it.AssignedTo || null,
          reportDate:
            it.startTime ||
            it.reportDate ||
            it.ReportDate ||
            it.createdDate ||
            null,
          resolveDate: it.endTime || it.resolveDate || it.ResolveDate || null,
          issue: it.issue || it.Issue || it.description || "",
          reason: it.reason || it.Reason || null,
          solution: it.solution || it.Solution || null,
          imageUrls:
            it.incidentImages?.map((img) => img.imageUrl) ||
            it.IncidentImages?.map((img) => img.ImageUrl) ||
            [],
          category: it.category || it.Category || it.type?.typeName || null,
          downtime: downtime,
          impact: it.impact || it.Impact || null,
          attachments: it.attachments || it.files || [],
          startSlotTime:
            it.slot?.slotStartTime || it.slot?.SlotStartTime || null,
          endSlotTime: it.slot?.slotEndTime || it.slot?.SlotEndTime || null,
          isTechSupport: it.isTechSupport || false,
        };
      });
      setIncidents(mapped);
      setFilteredIncidents(mapped);
      // Clear selection after refresh ✅ THÊM DÒng này
      setSelectedRowKeys([]);
      setSelectedRows([]);
    } catch (err) {
      console.error("Lỗi khi tải danh sách sự cố:", err);
      message.error(err?.message || "Không thể tải danh sách sự cố");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = [...incidents];

    if (searchText) {
      const q = String(searchText).toLowerCase();
      filtered = filtered.filter((inc) => {
        const idStr = String(inc.id || "").toLowerCase();
        const titleStr = String(inc.title || "").toLowerCase();
        const equipmentStr = String(inc.equipmentName || "").toLowerCase();
        return (
          idStr.includes(q) || titleStr.includes(q) || equipmentStr.includes(q)
        );
      });
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((inc) => inc.status === filterStatus);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((inc) => inc.priority === filterPriority);
    }

    // Filter by selected date
    if (selectedDate) {
      const selectedDateStr = selectedDate.format("YYYY-MM-DD");
      filtered = filtered.filter((inc) => {
        if (!inc.reportDate) return false;
        const incidentDateStr = dayjs(inc.reportDate).format("YYYY-MM-DD");
        return incidentDateStr === selectedDateStr;
      });
    }

    // Sort by reportDate descending (newest first)
    filtered.sort(
      (a, b) => dayjs(b.reportDate).valueOf() - dayjs(a.reportDate).valueOf()
    );

    // Add rowIndex for display
    filtered = filtered.map((item, index) => ({
      ...item,
      rowIndex: index + 1,
    }));

    setFilteredIncidents(filtered);
  };

  const handleAddIncident = () => {
    setIsEditMode(false);
    setSelectedIncident(null);
    setSelectedEquipment(null); // Reset selected equipment
    setCreateStatus("Chờ xử lý"); // Reset status for create mode
    setIncidentForms([{ id: 1, status: "Chờ xử lý" }]); // Reset to single form
    setFormChanged(false); // Reset form changed state
    setFormChangeCounter(0); // Reset form change counter
    setManualDurationFields(new Set()); // Reset manual duration tracking
    form.resetFields();
    // No longer auto-fill reporter - user must select manually
    setFormModalVisible(true);
  };

  const addIncidentForm = () => {
    const newId = incidentForms.length + 1;
    setIncidentForms([...incidentForms, { id: newId, status: "Chờ xử lý" }]);
    message.info({
      content: "Một bản ghi sự cố khác đã được thêm bên dưới.",
      duration: 3,
    });

    // Scroll to the bottom of the modal after a short delay to show the new form
    setTimeout(() => {
      const modalContent = document.querySelector(".ant-modal-body");
      if (modalContent) {
        modalContent.scrollTop = modalContent.scrollHeight;
      }
    }, 100);
  };

  const removeIncidentForm = (idToRemove) => {
    if (incidentForms.length === 1) {
      message.warning("Phải có ít nhất một sự cố để báo cáo!");
      return;
    }
    setIncidentForms(incidentForms.filter((f) => f.id !== idToRemove));
  };

  const getCurrentShift = () => {
    const now = dayjs();
    const currentTime = now.format("HH:mm");

    // Hardcoded shifts based on the provided data
    const shifts = [
      {
        shiftId: 1,
        shiftName: "Ca1",
        startTime: "07:00",
        endTime: "15:00",
      },
      {
        shiftId: 2,
        shiftName: "Ca2",
        startTime: "15:00",
        endTime: "23:00",
      },
    ];

    for (const shift of shifts) {
      // Normal shifts
      if (currentTime >= shift.startTime && currentTime < shift.endTime) {
        return shift;
      }
    }

    return null; // No current shift
  };

  const handleEditIncident = (record) => {
    setIsEditMode(true);
    setSelectedIncident(record);
    setFormChanged(false); // Reset form changed state

    // Skip auto-calculate duration on initial form open to preserve existing value
    skipInitialDurationCalcRef.current = true;

    // Reset manual duration tracking for edit mode
    // If record has duration, mark it as manually edited so useEffect doesn't overwrite it
    const initialManualFields = new Set();
    if (record.duration !== undefined && record.duration !== null) {
      initialManualFields.add("duration");
    }
    setManualDurationFields(initialManualFields);

    // Load existing images from record
    const existingImageUrls = record.imageUrls || [];

    // Set uploaded image URLs
    setUploadedImageUrls({
      edit: existingImageUrls,
    });

    // Create fileList from existing images for display
    const existingFileList = existingImageUrls.map((url, index) => ({
      uid: `existing-${index}`,
      name: `image-${index + 1}.png`,
      status: "done",
      url: url,
      thumbUrl: url,
    }));

    setImageFileList({
      edit: existingFileList,
    });

    // Find the equipment to pre-select it - handle both equipmentId and equipment object
    const equipmentId = record.equipmentId || record.equipment?.equipmentId;
    const equipment = equipments.find((e) => e.equipmentId === equipmentId);
    if (equipment) {
      setSelectedEquipment(equipment);
    }

    // Handle date fields - support both reportDate/resolveDate and startTime/endTime
    const startTimeValue = record.startTime
      ? dayjs(record.startTime)
      : record.reportDate
      ? dayjs(record.reportDate)
      : null;
    const endTimeValue = record.endTime
      ? dayjs(record.endTime)
      : record.resolveDate
      ? dayjs(record.resolveDate)
      : null;

    // Calculate duration or use existing
    let durationValue = null;
    if (record.duration !== undefined && record.duration !== null) {
      durationValue = record.duration.toFixed(2);
    } else if (record.downtime !== undefined && record.downtime !== null) {
      durationValue = record.downtime.toFixed(2);
    } else if (startTimeValue && endTimeValue) {
      const durationInMinutes = endTimeValue.diff(
        startTimeValue,
        "minute",
        true
      );
      durationValue = durationInMinutes.toFixed(2);
    }

    // Get reporter ID - handle both direct userId and nested user object
    const reporterId =
      record.reportedByUserId ||
      record.reporterId ||
      record.reportedByUser?.userId ||
      null;

    // Set form values with proper equipment selection
    form.setFieldsValue({
      equipmentCode: equipmentId, // This is the value for the Select, which uses equipmentId
      equipmentId: equipmentId,
      lineId: equipment?.lineId || record.lineId || record.line?.lineId,
      stageId:
        equipment?.stageId ||
        record.stageId ||
        record.stage?.stageId ||
        record.equipment?.stage?.stageId,
      typeId:
        record.typeId ||
        record.type?.stopTypeId ||
        (record.category
          ? stopTypes.find((st) => st.typeName === record.category)?.stopTypeId
          : null),
      issue: record.issue || "",
      reason: record.reason || record.memo || "",
      solution: record.solution || "",
      status: record.status || "Chờ xử lý", // Use status from database
      startTime: startTimeValue,
      endTime: endTimeValue,
      duration: durationValue,
      reporter: reporterId, // Use user ID for editing
      isTechSupport: record.isTechSupport || record.technicalSupport || false,
    });

    // store previous endTime so we can restore if user cancels clearing it
    setPreviousEndTime(
      endTimeValue && endTimeValue.isValid() ? endTimeValue : null
    );

    setFormModalVisible(true);
  };

  const handleDeleteIncident = async (id) => {
    try {
      setLoading(true);
      await incidentService.delete(id);
      message.success("Xóa sự cố thành công!");
      fetchIncidents();
    } catch (error) {
      console.error("Lỗi khi xóa sự cố:", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        error?.data?.message ||
        "Xóa thất bại!";
      message.error(errMsg);
      setLoading(false);
    }
  };

  // const handleBulkDelete = async () => {
  //   if (selectedRows.length === 0) {
  //     message.warning("Vui lòng chọn ít nhất một sự cố để xóa!");
  //     return;
  //   }

  //   Modal.confirm({
  //     title: "Xóa nhiều sự cố",
  //     content: `Bạn có chắc chắn muốn xóa ${selectedRows.length} sự cố đã chọn?`,
  //     okText: "Xóa",
  //     cancelText: "Hủy",
  //     okButtonProps: { danger: true },
  //     onOk: async () => {
  //       try {
  //         setLoading(true);
  //         // Delete each selected incident in parallel
  //         const deletePromises = selectedRows.map(async (incident) => {
  //           try {
  //             await incidentService.delete(incident.id);
  //             return { success: true, incident };
  //           } catch (deleteError) {
  //             const errMsg = deleteError?.response?.data?.message || deleteError?.message || deleteError?.data?.message || "Xóa thất bại!";
  //             return { success: false, incident, error: errMsg };
  //           }
  //         });

  //         const results = await Promise.all(deletePromises);
  //         const successCount = results.filter(r => r.success).length;
  //         const failedResults = results.filter(r => !r.success);

  //         // Show results
  //         if (successCount > 0) {
  //           message.success(`Đã xóa thành công ${successCount} sự cố!`);
  //         }

  //         if (failedResults.length > 0) {
  //           const errorMessages = failedResults.map(failed =>
  //             `Sự cố #${failed.incident.id} (${failed.incident.equipmentName}): ${failed.error}`
  //           );
  //           message.error(`${errorMessages.join('\n')}`);
  //         }

  //         if (successCount > 0) {
  //           setSelectedRowKeys([]);
  //           setSelectedRows([]);
  //           fetchIncidents();
  //         }
  //       } catch (error) {
  //         console.error("Lỗi khi xóa nhiều sự cố:", error);
  //         const errMsg =
  //           error?.response?.data?.message || error?.message || error?.data?.message || "Xóa thất bại!";
  //         message.error(errMsg);
  //         setLoading(false);
  //       }
  //     },
  //   });
  // };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      message.warning("Vui lòng chọn ít nhất một sự cố để xóa!");
      return;
    }

    Modal.confirm({
      title: "Xóa nhiều sự cố",
      content: `Bạn có chắc chắn muốn xóa ${selectedRows.length} sự cố đã chọn?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          // Delete each selected incident in parallel
          const deletePromises = selectedRows.map(async (incident) => {
            try {
              await incidentService.delete(incident.id);
              return { success: true, incident };
            } catch (deleteError) {
              const errMsg =
                deleteError?.response?.data?.message ||
                deleteError?.message ||
                deleteError?.data?.message ||
                "Xóa thất bại!";
              return { success: false, incident, error: errMsg };
            }
          });

          const results = await Promise.all(deletePromises);
          const successCount = results.filter((r) => r.success).length;
          const failedResults = results.filter((r) => !r.success);

          // Show results
          if (successCount > 0) {
            message.success(`Đã xóa thành công ${successCount} sự cố!`);
          }

          if (failedResults.length > 0) {
            const errorMessages = failedResults.map(
              (failed) =>
                `Sự cố #${failed.incident.id} (${failed.incident.equipmentName}): ${failed.error}`
            );
            message.error(`${errorMessages.join("\n")}`);
          }

          if (successCount > 0) {
            setSelectedRowKeys([]);
            setSelectedRows([]);
            fetchIncidents();
          }
        } catch (error) {
          console.error("Lỗi khi xóa nhiều sự cố:", error);
          const errMsg =
            error?.response?.data?.message ||
            error?.message ||
            error?.data?.message ||
            "Xóa thất bại!";
          message.error(errMsg);
          setLoading(false);
        }
      },
    });
  };

  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredIncidents.map((incident, index) => ({
        STT: index + 1,
        "Mã sự cố": incident.id,
        "Thiết bị": `${incident.equipmentName}${
          incident.equipmentCode ? ` (${incident.equipmentCode})` : ""
        }`,
        "Dây chuyền": incident.lineName || "",
        "Công đoạn": incident.stageName || "",
        "Loại dừng": incident.category || "",
        "Vấn đề": incident.issue || "",
        "Ngày báo cáo": incident.reportDate
          ? dayjs(incident.reportDate).format("DD/MM/YYYY")
          : "",
        "Giờ bắt đầu": incident.reportDate
          ? dayjs(incident.reportDate).format("HH:mm")
          : "",
        "Giờ kết thúc": incident.resolveDate
          ? dayjs(incident.resolveDate).format("HH:mm")
          : "",
        "Thời lượng (phút)": incident.downtime
          ? incident.downtime.toFixed(2)
          : "",
        "Trạng thái": incident.status || "",
        "Người báo cáo": incident.reporter || "",
        "Cần hỗ trợ kỹ thuật": incident.isTechSupport ? "Có" : "Không",
        "Nguyên nhân": incident.reason || "",
        "Giải pháp": incident.solution || "",
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 }, // STT
        { wch: 10 }, // Mã sự cố
        { wch: 25 }, // Thiết bị
        { wch: 15 }, // Dây chuyền
        { wch: 15 }, // Công đoạn
        { wch: 15 }, // Loại dừng
        { wch: 30 }, // Vấn đề
        { wch: 12 }, // Ngày báo cáo
        { wch: 10 }, // Giờ bắt đầu
        { wch: 10 }, // Giờ kết thúc
        { wch: 15 }, // Thời lượng
        { wch: 12 }, // Trạng thái
        { wch: 20 }, // Người báo cáo
        { wch: 18 }, // Cần hỗ trợ kỹ thuật
        { wch: 30 }, // Nguyên nhân
        { wch: 30 }, // Giải pháp
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Báo cáo sự cố");

      // Generate filename with current date
      const fileName = `BaoCaoSuCo_${dayjs().format("YYYY-MM-DD")}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);

      message.success("Xuất file Excel thành công!");
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      message.error("Xuất file Excel thất bại!");
    }
  };

  const handleViewDetail = (record) => {
    setSelectedIncident(record);
    console.log("Selected incident for detail view:", record); // Debug log
    fetchIncidentShifts(record.id);
    // Ensure we have latest user/team lead lists for name resolution
    fetchAllUsers();
    fetchTeamLeads();
    setDetailModalVisible(true);
  };

  // Handle image upload - supports multiple images (up to 5)
  const handleImageUpload = async (file, formId = "edit") => {
    try {
      setUploadingImage(true);
      const imageUrl = await incidentService.uploadImage(file);

      // Store the uploaded URL in array format
      setUploadedImageUrls((prev) => {
        const existingUrls = prev[formId] || [];
        const updatedUrls = Array.isArray(existingUrls)
          ? [...existingUrls, imageUrl]
          : [imageUrl];

        return {
          ...prev,
          [formId]: updatedUrls.slice(0, 5), // Limit to 5 images
        };
      });

      // Mark form as changed so submit button is enabled in edit mode
      setFormChanged(true);

      message.success("Tải ảnh lên thành công!");
      return imageUrl;
    } catch (error) {
      console.error("Lỗi khi tải ảnh:", error);
      message.error(error?.message || "Tải ảnh lên thất bại!");
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload props for Ant Design Upload component
  const getUploadProps = (formId = "edit") => ({
    name: "file",
    listType: "picture",
    maxCount: 5,
    multiple: true, // Allow selecting multiple files at once
    accept: "image/*",
    beforeUpload: async (file) => {
      // Check if already have 5 images
      const currentFileList = imageFileList[formId] || [];
      if (currentFileList.length >= 5) {
        message.error("Bạn chỉ được đính kèm tối đa 5 ảnh!");
        return Upload.LIST_IGNORE;
      }

      // Validate file type
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Chỉ có thể tải lên file ảnh!");
        return Upload.LIST_IGNORE;
      }

      // Validate file size (5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Kích thước ảnh phải nhỏ hơn 5MB!");
        return Upload.LIST_IGNORE;
      }

      // Upload immediately
      try {
        await handleImageUpload(file, formId);
      } catch (error) {
        return Upload.LIST_IGNORE;
      }

      return false; // Prevent default upload behavior
    },
    fileList: imageFileList[formId] || [],
    onChange: ({ fileList }) => {
      setImageFileList((prev) => ({
        ...prev,
        [formId]: fileList,
      }));
    },
    onRemove: (file) => {
      // Mark form as changed
      setFormChanged(true);

      // Remove the specific image URL from the array
      const fileIndex = imageFileList[formId]?.indexOf(file);
      if (fileIndex !== undefined && fileIndex >= 0) {
        setUploadedImageUrls((prev) => {
          const currentUrls = prev[formId] || [];
          const newUrls = Array.isArray(currentUrls)
            ? currentUrls.filter((_, index) => index !== fileIndex)
            : [];

          return {
            ...prev,
            [formId]: newUrls, // Keep empty array instead of null
          };
        });
      }

      setImageFileList((prev) => {
        const currentList = prev[formId] || [];
        const newList = currentList.filter((f) => f.uid !== file.uid);
        return {
          ...prev,
          [formId]: newList,
        };
      });
    },
  });

  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);

      // Validate overlapping incidents (frontend check)
      if (values.lineId && values.startTime) {
        const overlappingIncidents = incidents.filter((incident) => {
          // Skip if same incident (for edit mode)
          if (isEditMode && incident.id === selectedIncident?.id) return false;

          // Check if same line (not equipment)
          if (incident.lineId !== values.lineId) return false;

          // Check time overlap
          const incidentStart = dayjs(incident.reportDate);
          const incidentEnd = incident.resolveDate
            ? dayjs(incident.resolveDate)
            : null;
          const newStart = dayjs(values.startTime);
          const newEnd = values.endTime ? dayjs(values.endTime) : null;

          // Overlap logic: new incident starts before existing ends and ends after existing starts
          const startsBeforeExistingEnds = newStart.isBefore(
            incidentEnd || dayjs().add(100, "years")
          );
          const endsAfterExistingStarts =
            !newEnd || newEnd.isAfter(incidentStart);

          return startsBeforeExistingEnds && endsAfterExistingStarts;
        });

        if (overlappingIncidents.length > 0) {
          message.error(
            "Thời gian báo cáo sự cố trùng với sự cố khác trên cùng dây chuyền"
          );
          setLoading(false);
          return;
        }
      }

      // Validate duration against actual time difference
      if (values.startTime && values.endTime && values.duration) {
        const startTime = dayjs(values.startTime);
        const endTime = dayjs(values.endTime);
        const actualDuration = calculateAdjustedDuration(startTime, endTime);

        // Use more lenient tolerance to account for floating-point precision differences
        if (values.duration > actualDuration + 0.02) {
          message.error(
            `Thời lượng (${
              values.duration
            } phút) không được lớn hơn thời gian thực tế (${actualDuration.toFixed(
              2
            )} phút)!`
          );
          setLoading(false);
          return;
        }
      }

      // Validate duration based on stop type (edit mode)
      if (values.typeId && values.duration) {
        const stopType = stopTypes.find(
          (st) => (st.stopTypeId || st.typeId) === values.typeId
        );
        if (stopType) {
          const typeName = stopType.typeName || stopType.stopTypeName;

          // Check for "Dừng ngắn" - must be < 5 minutes
          if (typeName === "Dừng ngắn" && values.duration >= 5) {
            message.error(
              "Loại 'Dừng ngắn' chỉ áp dụng khi thời lượng < 5 phút."
            );
            setLoading(false);
            return;
          }

          // Check for "Dừng dài" - must be >= 5 minutes
          if (typeName === "Dừng dài" && values.duration < 5) {
            message.error(
              "Loại 'Dừng dài' chỉ áp dụng khi thời lượng ≥ 5 phút."
            );
            setLoading(false);
            return;
          }

          // Other types (Vệ sinh, Đổi mã, Phế phẩm) - no duration check
        }
      }

      // Validate stop type requires endTime for duration-based types
      if (values.typeId && !values.endTime) {
        const stopType = stopTypes.find(
          (st) => (st.stopTypeId || st.typeId) === values.typeId
        );
        if (stopType) {
          const typeName = stopType.typeName || stopType.stopTypeName;
          if (typeName === "Dừng ngắn" || typeName === "Dừng dài") {
            message.error(
              `Loại "${typeName}" cần endTime để tính duration và xác định loại dừng.`
            );
            setLoading(false);
            return;
          }
        }
      }

      if (isEditMode) {
        // Edit mode
        const formEquipmentId = form.getFieldValue("equipmentId");
        const finalEquipmentId =
          formEquipmentId !== undefined ? formEquipmentId : null; // Convert undefined to null for nullable field

        let typeId = values.typeId;
        if (!typeId && selectedIncident.category) {
          const stopType = stopTypes.find(
            (st) => st.typeName === selectedIncident.category
          );
          typeId = stopType?.stopTypeId || stopType?.typeId;
        }

        const editPayload = {
          equipmentId: finalEquipmentId,
          lineId: values.lineId !== undefined ? values.lineId : null, // Convert undefined to null for nullable field
          startTime: values.startTime
            ? dayjs(values.startTime).format("YYYY-MM-DDTHH:mm:ss.SSS")
            : dayjs(selectedIncident.reportDate).format(
                "YYYY-MM-DDTHH:mm:ss.SSS"
              ),
          endTime: values.endTime
            ? dayjs(values.endTime).format("YYYY-MM-DDTHH:mm:ss.SSS")
            : null,
          duration:
            values.duration !== undefined &&
            values.duration !== null &&
            values.duration !== ""
              ? parseFloat(values.duration)
              : null, // Convert to number before sending
          typeId: typeId || null,
          issue:
            values.issue !== undefined
              ? values.issue?.trim() === ""
                ? null
                : values.issue
              : selectedIncident.issue,
          reason:
            values.reason !== undefined
              ? values.reason?.trim() === ""
                ? null
                : values.reason
              : selectedIncident.reason,
          solution:
            values.solution !== undefined
              ? values.solution?.trim() === ""
                ? null
                : values.solution
              : selectedIncident.solution,
          ...(values.reporter !== undefined
            ? { reportedByUserId: values.reporter }
            : {}),
          isTechSupport: values.isTechSupport || false,
          imageUrls:
            uploadedImageUrls["edit"] !== undefined
              ? uploadedImageUrls["edit"]
              : selectedIncident.imageUrls || null,
        };

        const id =
          selectedIncident?.id ||
          selectedIncident?.incidentId ||
          selectedIncident?.IncidentId;
        console.log("Edit payload:", editPayload);

        const updatedIncident = await incidentService.update(id, editPayload);

        // Update form to reflect backend's automatic status determination
        // Backend automatically sets status to "Hoàn thành" when endTime exists
        if (updatedIncident && updatedIncident.status) {
          form.setFieldsValue({
            status: updatedIncident.status,
          });
        }

        message.success("Cập nhật sự cố thành công!");
        setFormModalVisible(false);
        fetchIncidents();
      } else {
        // Create mode - multiple incidents
        const incidentsToCreate = [];

        // Loop through each incident form and collect data
        for (const incidentForm of incidentForms) {
          const formId = incidentForm.id;

          // Get values for this specific form
          const equipmentId = form.getFieldValue(`equipmentId_${formId}`);
          const lineId = form.getFieldValue(`lineId_${formId}`);
          const startTime = form.getFieldValue(`startTime_${formId}`);
          const endTime = form.getFieldValue(`endTime_${formId}`);
          const duration = form.getFieldValue(`duration_${formId}`);
          const typeId = form.getFieldValue(`typeId_${formId}`);
          const issue = form.getFieldValue(`issue_${formId}`);
          const reason = form.getFieldValue(`reason_${formId}`);
          const solution = form.getFieldValue(`solution_${formId}`);
          const reporter = form.getFieldValue(`reporter_${formId}`);
          const isTechSupport =
            form.getFieldValue(`isTechSupport_${formId}`) || false;

          if (!startTime) {
            message.error(
              `Sự cố No.${formId}: Vui lòng nhập thời gian bắt đầu sự cố!`
            );
            setLoading(false);
            return;
          }

          // Validate overlapping incidents (frontend check)
          if (lineId && startTime) {
            const overlappingIncidents = incidents.filter((incident) => {
              // Check if same line (not equipment)
              if (incident.lineId !== lineId) return false;

              // Check time overlap
              const incidentStart = dayjs(incident.reportDate);
              const incidentEnd = incident.resolveDate
                ? dayjs(incident.resolveDate)
                : null;
              const newStart = dayjs(startTime);
              const newEnd = endTime ? dayjs(endTime) : null;

              // Overlap logic: new incident starts before existing ends and ends after existing starts
              const startsBeforeExistingEnds = newStart.isBefore(
                incidentEnd || dayjs().add(100, "years")
              );
              const endsAfterExistingStarts =
                !newEnd || newEnd.isAfter(incidentStart);

              return startsBeforeExistingEnds && endsAfterExistingStarts;
            });

            if (overlappingIncidents.length > 0) {
              message.error(
                `Sự cố No.${formId}: Thời gian báo cáo sự cố trùng với sự cố khác trên cùng dây chuyền`
              );
              setLoading(false);
              return;
            }
          }

          // Validate duration against actual time difference
          if (startTime && endTime && duration) {
            const startTimeObj = dayjs(startTime);
            const endTimeObj = dayjs(endTime);
            const actualDuration = calculateAdjustedDuration(
              startTimeObj,
              endTimeObj
            );

            // Use more lenient tolerance to account for floating-point precision differences
            if (duration > actualDuration + 0.02) {
              message.error(
                `Sự cố No.${formId}: Thời lượng (${duration} phút) không được lớn hơn thời gian thực tế (${actualDuration.toFixed(
                  2
                )} phút)!`
              );
              setLoading(false);
              return;
            }
          }

          // Validate duration based on stop type
          if (typeId && duration) {
            const stopType = stopTypes.find(
              (st) => (st.stopTypeId || st.typeId) === typeId
            );
            if (stopType) {
              const typeName = stopType.typeName || stopType.stopTypeName;

              // Check for "Dừng ngắn" - must be < 5 minutes
              if (typeName === "Dừng ngắn" && duration >= 5) {
                message.error(
                  `Sự cố No.${formId}: Loại 'Dừng ngắn' chỉ áp dụng khi thời lượng < 5 phút.`
                );
                setLoading(false);
                return;
              }

              // Check for "Dừng dài" - must be >= 5 minutes
              if (typeName === "Dừng dài" && duration < 5) {
                message.error(
                  `Sự cố No.${formId}: Loại 'Dừng dài' chỉ áp dụng khi thời lượng ≥ 5 phút.`
                );
                setLoading(false);
                return;
              }

              // Other types (Vệ sinh, Đổi mã, Phế phẩm) - no duration check
            }
          }

          // Validate stop type requires endTime for duration-based types
          if (typeId && !endTime) {
            const stopType = stopTypes.find(
              (st) => (st.stopTypeId || st.typeId) === typeId
            );
            if (stopType) {
              const typeName = stopType.typeName || stopType.stopTypeName;
              if (typeName === "Dừng ngắn" || typeName === "Dừng dài") {
                message.error(
                  `Loại "${typeName}" cần endTime để tính duration và xác định loại dừng.`
                );
                setLoading(false);
                return;
              }
            }
          }

          // Determine status
          const hasEndTime = endTime && dayjs(endTime).isValid();
          const status = hasEndTime ? "Hoàn thành" : "Chờ xử lý";

          // Check for active incidents on the line (same day and after start time)
          if (lineId && startTime) {
            try {
              const activeIncidents =
                await incidentService.getActiveIncidentsByLine(lineId);

              // Filter active incidents that are in the same day and started before the new incident
              const conflictingIncidents = activeIncidents.filter(
                (activeIncident) => {
                  const activeStart = dayjs(
                    activeIncident.reportDate || activeIncident.startTime
                  );
                  const newStart = dayjs(startTime);

                  // Same day and new incident starts after active incident
                  return (
                    activeStart.isSame(newStart, "day") &&
                    newStart.isAfter(activeStart)
                  );
                }
              );

              if (conflictingIncidents.length > 0) {
                const lineName =
                  lines.find((l) => l.lineId === lineId)?.lineName ||
                  `ID ${lineId}`;
                message.error(
                  `Sự cố No.${formId}: Không thể tạo sự cố mới! Dây chuyền "${lineName}" đang có ${conflictingIncidents.length} sự cố chưa hoàn thành.`
                );
                setLoading(false);
                return;
              }
            } catch (error) {
              console.error("Lỗi khi kiểm tra sự cố đang hoạt động:", error);
              message.error(
                "Không thể kiểm tra trạng thái dây chuyền. Vui lòng thử lại."
              );
              setLoading(false);
              return;
            }
          }

          // Build payload for this incident
          const payload = {
            equipmentId: equipmentId || null,
            lineId: lineId || null,
            startTime: startTime
              ? dayjs(startTime).format("YYYY-MM-DDTHH:mm:ss.SSS")
              : null,
            endTime: endTime
              ? dayjs(endTime).format("YYYY-MM-DDTHH:mm:ss.SSS")
              : null,
            duration:
              duration !== undefined && duration !== null && duration !== ""
                ? parseFloat(duration)
                : null, // Convert to number before sending
            typeId: typeId || null,
            issue: issue?.trim() || null,
            reason: reason?.trim() || null,
            solution: solution?.trim() || null,
            // Only send reportedByUserId when the user explicitly selected a reporter.
            // Do NOT fallback to currentUser here — otherwise an empty reporter field
            // will be interpreted as "reported by the current user" on the server.
            reportedByUserId: reporter && reporter !== "" ? reporter : null,
            isTechSupport: isTechSupport || false,
            imageUrls: uploadedImageUrls[formId] || null, // Send array of image URLs
          };

          console.log(`Payload for incident No.${formId}:`, payload);
          incidentsToCreate.push(payload);
        }

        // Create all incidents using bulk API
        try {
          console.log("Creating bulk incidents:", incidentsToCreate);
          const response = await incidentService.createBulk(incidentsToCreate);
          console.log("Bulk create response:", response);

          if (response.successCount > 0) {
            message.success(
              `Đã tạo thành công ${response.successCount}/${response.totalRequested} sự cố!`
            );
          }

          if (response.failureCount > 0) {
            message.warning(`${response.failureCount} sự cố tạo thất bại!`);
            // Show detailed errors
            response.errors?.forEach((error) => {
              console.error(`Sự cố No.${error.index}: ${error.errorMessage}`);
              message.error(`Sự cố #${error.index}: ${error.errorMessage}`);
            });

            // If ALL incidents failed, don't close the modal
            if (response.successCount === 0) {
              return; // Keep modal open for user to fix errors
            }
          }

          // Only close modal and reset if at least one incident was created successfully
          setFormModalVisible(false);
          setSelectedEquipment(null);
          setIncidentForms([{ id: 1, status: "Chờ xử lý" }]);
          setManualDurationFields(new Set()); // Reset manual duration tracking
          setImageFileList({}); // Reset image file list
          setUploadedImageUrls({}); // Reset uploaded image URLs
          form.resetFields();
          fetchIncidents();
        } catch (error) {
          console.error("Lỗi khi tạo nhiều sự cố:", error);
          message.error(error?.message || "Tạo sự cố thất bại!");
          // Don't close modal on error - let user fix and retry
          return;
        }
      }
    } catch (error) {
      console.error("Lỗi khi lưu sự cố:", error);
      const errMsg = error?.message || error?.data?.message || "Lưu thất bại!";
      message.error(errMsg);
      // Don't close modal on error - keep it open for user to fix
      return;
    } finally {
      setLoading(false);
    }
  };

  // Handler for endTime DatePicker changes in the edit form.
  // If user clears the endTime for a previously completed incident, ask for confirmation.
  const handleEndTimeChange = (value) => {
    try {
      const currentlyCompleted =
        selectedIncident?.resolveDate &&
        dayjs(selectedIncident.resolveDate).isValid();

      // User cleared the endTime (value === null)
      if (!value && currentlyCompleted) {
        Modal.confirm({
          title: "Xác nhận xóa thời gian kết thúc",
          content:
            "Sự cố này đã được đánh dấu là 'Hoàn thành'. Bạn có chắc chắn muốn xóa thời gian kết thúc? Việc này có thể thay đổi trạng thái sự cố.",
          okText: "Xóa",
          cancelText: "Hủy",
          onOk() {
            // User confirmed: clear the form field (it is already null), update status preview according to business rules
            // Derive new status based on isTechSupport and assignedTo
            const isTech = form.getFieldValue("isTechSupport");
            const assigned =
              form.getFieldValue("assignedTo") || selectedIncident?.assignedTo;

            if (isTech && assigned) {
              form.setFieldsValue({
                status: "Đang xử lý",
              });
            } else {
              form.setFieldsValue({
                status: "Chờ xử lý",
              });
            }

            form.setFieldsValue({
              duration: null, // Clear duration when endTime is cleared
            });
            setPreviousEndTime(null);
            setFormChanged(true);
          },
          onCancel() {
            // Restore previous endTime, status, and duration in the form
            if (previousEndTime) {
              form.setFieldsValue({
                endTime: previousEndTime,
                duration: selectedIncident.downtime
                  ? selectedIncident.downtime.toFixed(2)
                  : null,
                status: "Hoàn thành", // Always restore to "Hoàn thành" when restoring endTime
              });
            }
          },
        });
      } else {
        // Normal change (set or modify endTime) -> update status preview
        if (value && dayjs(value).isValid()) {
          // Always set status to "Hoàn thành" when endTime exists
          form.setFieldsValue({ status: "Hoàn thành" });
        } else {
          // value is null but not previously completed: derive status conservatively
          const isTech = form.getFieldValue("isTechSupport");
          const assigned =
            form.getFieldValue("assignedTo") || selectedIncident?.assignedTo;
          if (isTech && assigned) {
            form.setFieldsValue({
              status: "Đang xử lý",
            });
          } else {
            form.setFieldsValue({
              status: "Chờ xử lý",
            });
          }
        }
        // update stored previousEndTime
        setPreviousEndTime(value && dayjs(value).isValid() ? value : null);
        setFormChanged(true);
      }
    } catch (e) {
      console.error("handleEndTimeChange error", e);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Cao":
        return "red";
      case "Trung bình":
        return "orange";
      case "Thấp":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Chờ xử lý":
        return "warning";
      case "Đang xử lý":
        return "processing";
      case "Hoàn thành":
        return "success";
      //case "Hủy":
      //  return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Chờ xử lý":
        return <ExclamationCircleOutlined />;
      case "Đang xử lý":
        return <ClockCircleOutlined />;
      case "Hoàn thành":
        return <CheckCircleOutlined />;
      default:
        return null;
    }
  };

  const getReporterName = (reporterId) => {
    if (!reporterId) return "";
    const teamLead = teamLeads.find(
      (tl) =>
        tl.id === reporterId ||
        tl.userId === reporterId ||
        tl.userID === reporterId
    );
    if (teamLead) return teamLead.fullName || teamLead.userName;
    // fallback to all users list
    const user = allUsers.find(
      (u) => (u.id || u.userId || u.userID) === reporterId
    );
    return user
      ? user.fullName || user.name || user.userName || user.username
      : reporterId;
  };

  const getAssignedToName = (assignedToIdOrName) => {
    if (assignedToIdOrName == null) return null;

    // If API already provides a readable name, prefer it — but avoid treating UUIDs as names.
    if (typeof assignedToIdOrName === "string") {
      const trimmed = assignedToIdOrName.trim();
      // UUID regex (v4 format) — if it matches, treat as an id, not a name
      const uuidRegex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (uuidRegex.test(trimmed)) {
        // it's an id-like string, continue to lookup
      } else {
        // Heuristic: if string contains a space (likely a full name) or non-hex letters with spaces, consider it a name
        if (trimmed.includes(" ")) return trimmed;
      }
    }

    // Normalize to string for comparisons
    const target = String(assignedToIdOrName);

    // Try to find in allUsers by common id fields (compare as strings)
    const user = allUsers.find((u) => {
      const candidate = String(u.id || u.userId || u.userID || "");
      return candidate && candidate === target;
    });
    if (user)
      return user.fullName || user.name || user.userName || user.username;

    // Try to find by matching username/fullName fields too
    const userByName = allUsers.find((u) => {
      const fullname = (
        u.fullName ||
        u.name ||
        u.userName ||
        u.username ||
        ""
      ).toString();
      return fullname && fullname === target;
    });
    if (userByName)
      return (
        userByName.fullName ||
        userByName.name ||
        userByName.userName ||
        userByName.username
      );

    // Try teamLeads as a final fallback (compare as strings)
    const tl = teamLeads.find((t) => {
      const cand = String(t.id || t.userId || t.userID || "");
      return cand && cand === target;
    });
    if (tl) return tl.fullName || tl.userName;

    // Nothing matched; return original value (may be null/empty)
    return assignedToIdOrName;
  };

  // Helper function to truncate long text with tooltip
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const columns = [
    {
      title: "#",
      dataIndex: "rowIndex",
      key: "rowIndex",
      width: 50,
      fixed: "left",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      fixed: "left",
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      ...getColumnSearchProps("equipmentName", "Tìm thiết bị"),
      render: (text, record) => (
        <Tooltip
          title={`${text}${
            record.equipmentCode ? ` (${record.equipmentCode})` : ""
          }`}
        >
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            {record.equipmentCode && (
              <div style={{ color: "#999", fontSize: 12 }}>
                {record.equipmentCode}
              </div>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Dây chuyền",
      dataIndex: "lineName",
      key: "lineName",
      width: 130,
      ellipsis: {
        showTitle: false,
      },
      ...getColumnSearchProps("lineName", "Tìm dây chuyền"),
      render: (text) => (
        <Tooltip title={text}>
          <Tag color="purple">{text}</Tag>
        </Tooltip>
      ),
    },
    {
      title: "Công đoạn",
      dataIndex: "stageName",
      key: "stageName",
      width: 130,
      ellipsis: {
        showTitle: false,
      },
      ...getColumnSearchProps("stageName", "Tìm công đoạn"),
      render: (text) => (
        <Tooltip title={text || " "}>
          <Tag color="blue">{text || " "}</Tag>
        </Tooltip>
      ),
    },
    {
      title: "Vấn đề",
      dataIndex: "issue",
      key: "issue",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      ...getColumnSearchProps("issue", "Tìm vấn đề"),
      render: (text) => (
        <Tooltip title={text || " "}>
          <span className={styles.cellContent}>
            {truncateText(text, 20) || " "}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Ngày",
      dataIndex: "reportDate",
      key: "reportDate",
      width: 150,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        close,
      }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <DatePicker
            placeholder="Chọn ngày"
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setSelectedKeys(date ? [date.format("YYYY-MM-DD")] : []);
            }}
            format="DD/MM/YYYY"
            style={{ width: "100%", marginBottom: 8 }}
            allowClear
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm kiếm
            </Button>
            <Button
              onClick={() => {
                clearFilters && clearFilters();
                setSelectedDate(null);
              }}
              size="small"
              style={{ width: 90 }}
            >
              Đặt lại
            </Button>
            <Button type="link" size="small" onClick={() => close()}>
              Đóng
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <CalendarOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
      onFilter: (value, record) => {
        if (!value) return true;
        const recordDate = record.reportDate;
        if (!recordDate) return false;
        const recordDateStr = dayjs(recordDate).format("YYYY-MM-DD");
        return recordDateStr === value;
      },
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Thời gian BD",
      dataIndex: "reportDate",
      key: "startTime",
      width: 150,
      render: (d) => (d ? dayjs(d).format("HH:mm") : "-"),
    },
    {
      title: "Thời gian KT",
      dataIndex: "resolveDate",
      key: "endTime",
      width: 150,
      render: (d) => (d ? dayjs(d).format("HH:mm") : "-"),
    },
    {
      title: "Tổng TG(phút)",
      dataIndex: "downtime",
      key: "downtime",
      width: 150,
      align: "center",
      render: (val) => (
        <span
          style={{ color: val > 5 ? "#ff4d4f" : "#1890ff", fontWeight: 500 }}
        >
          {typeof val === "number" ? val.toFixed(2) : val}
        </span>
      ),
    },
    {
      title: "Loại dừng",
      dataIndex: "category",
      key: "category",
      width: 130,
      ellipsis: {
        showTitle: false,
      },
      filters: stopTypes.map((stopType) => ({
        text: stopType.typeName || stopType.stopTypeName,
        value: stopType.typeName || stopType.stopTypeName,
      })),
      onFilter: (value, record) => {
        const stopType = stopTypes.find(
          (st) =>
            st.stopTypeId === record.typeId ||
            st.typeId === record.typeId ||
            st.typeName === record.category ||
            st.stopTypeName === record.category
        );
        const stopTypeName =
          stopType?.typeName || stopType?.stopTypeName || record.category || "";
        return stopTypeName === value;
      },
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
      render: (text) => (
        <Tooltip title={text || " "}>
          {/* <Tag color="orange">{text || "Chưa phân loại"}</Tag> */}
          {text || " "}
        </Tooltip>
      ),
    },
    // {
    //   title: "Nguyên nhân",
    //   dataIndex: "reason",
    //   key: "reason",
    //   width: 180,
    //   ellipsis: {
    //     showTitle: false,
    //   },
    //   render: (text) => (
    //     <Tooltip title={text || "Chưa xác định"}>
    //       <span>{text || "Chưa xác định"}</span>
    //     </Tooltip>
    //   ),
    // },
    // {
    //   title: "Giải pháp",
    //   dataIndex: "solution",
    //   key: "solution",
    //   width: 180,
    //   ellipsis: {
    //     showTitle: false,
    //   },
    //   render: (text) => (
    //     <Tooltip title={text || "Chưa có giải pháp"}>
    //       <span>{text || "Chưa có giải pháp"}</span>
    //     </Tooltip>
    //   ),
    // },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => {
        const items = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "Xem chi tiết",
            onClick: () => handleViewDetail(record),
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Chỉnh sửa",
            onClick: () => handleEditIncident(record),
          },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Xóa",
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: "Xóa sự cố",
                content: "Bạn có chắc chắn muốn xóa sự cố này?",
                okText: "Xóa",
                cancelText: "Hủy",
                okButtonProps: { danger: true },
                onOk() {
                  handleDeleteIncident(record.id);
                },
              });
            },
          },
        ];
        return (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <DownOutlined style={{ cursor: "pointer", fontSize: "16px" }} />
          </Dropdown>
        );
      },
    },
  ];

  // Calculate statistics
  const stats = {
    total: incidents.length,
    pending: incidents.filter((i) => i.status === "Chờ xử lý").length,
    inProgress: incidents.filter((i) => i.status === "Đang xử lý").length,
    completed: incidents.filter((i) => i.status === "Hoàn thành").length,
    totalDowntime: incidents
      .reduce((sum, i) => sum + (i.downtime || 0), 0)
      .toFixed(2),
  };

  return (
    <div className={styles.incidentManagement}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless">
            <Statistic
              title="Tổng sự cố"
              value={stats.total}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless">
            <Statistic
              title="Chờ xử lý"
              value={stats.pending}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless">
            <Statistic
              title="Đang xử lý"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless">
            <Statistic
              title="Thời gian chết"
              value={stats.totalDowntime}
              suffix="phút"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        title={
          <Space>
            <WarningOutlined />
            <span>Quản lý sự cố</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddIncident}
              style={{ backgroundColor: "#334766", borderColor: "#334766" }}
            >
              Báo cáo sự cố
            </Button>
            <Button
              type="dashed"
              icon={<FileExcelOutlined />}
              onClick={exportToExcel}
              //style={{ backgroundColor: "#52c41a", borderColor: "#52c41a", color: "white" }}
            >
              Xuất Excel
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBulkDelete}
              disabled={selectedRowKeys.length === 0}
              style={{
                backgroundColor:
                  selectedRowKeys.length === 0 ? "#f5f5f5" : "#ff4d4f",
                color:
                  selectedRowKeys.length === 0 ? "rgba(0,0,0,0.25)" : "white",
                borderColor:
                  selectedRowKeys.length === 0 ? "#d9d9d9" : "#ff4d4f",
              }}
            >
              Xóa đã chọn ({selectedRowKeys.length})
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchIncidents}>
              Làm mới
            </Button>
          </Space>
        }
        variant="borderless"
        className={styles.tableCard}
      >
        {/* Filters */}
        <div className={styles.filterSection}>
          <Space size="middle" wrap>
            <Input
              placeholder="Tìm kiếm mã, tiêu đề, thiết bị..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 150 }}
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả</Option>
              <Option value="Chờ xử lý">Chờ xử lý</Option>
              <Option value="Đang xử lý">Đang xử lý</Option>
              <Option value="Hoàn thành">Hoàn thành</Option>
              {/* <Option value="Hủy">Hủy</Option> */}
            </Select>
            {/* <Select
              value={filterPriority}
              onChange={setFilterPriority}
              style={{ width: 150 }}
              placeholder="Mức độ"
            >
              <Option value="all">Tất cả</Option>
              <Option value="Cao">Cao</Option>
              <Option value="Trung bình">Trung bình</Option>
              <Option value="Thấp">Thấp</Option>
            </Select> */}
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredIncidents}
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content" }}
          rowSelection={{
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedRowKeys(selectedRowKeys);
              setSelectedRows(selectedRows);
            },
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sự cố`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Chi tiết sự cố</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              handleEditIncident(selectedIncident);
            }}
            style={{ backgroundColor: "#334766", borderColor: "#334766" }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={1200}
        style={{ top: 20 }}
        styles={{
          body: {
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
            padding: "20px 24px",
          },
        }}
      >
        {selectedIncident && (
          <div className={styles.detailContent}>
            <Row gutter={[24, 24]}>
              {/* Incident Header */}
              <Col span={24}>
                <Card
                  size="small"
                  variant="outlined"
                  style={{
                    background: "#334766",
                    color: "white",
                    border: "none",
                  }}
                >
                  <Row gutter={[16, 8]} align="middle">
                    <Col span={18}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: 700,
                          marginBottom: "4px",
                        }}
                      >
                        #{selectedIncident.id}
                      </div>
                      <div style={{ fontSize: "14px", opacity: 0.9 }}>
                        {selectedIncident.equipmentName}
                        {selectedIncident.equipmentCode && (
                          <span style={{ marginLeft: "8px" }}>
                            ({selectedIncident.equipmentCode})
                          </span>
                        )}
                      </div>
                    </Col>
                    <Col span={6} style={{ textAlign: "right" }}>
                      {selectedIncident.status ? (
                        <Tag
                          icon={getStatusIcon(selectedIncident.status)}
                          color={getStatusColor(selectedIncident.status)}
                          style={{
                            fontSize: "14px",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontWeight: 600,
                          }}
                        >
                          {selectedIncident.status}
                        </Tag>
                      ) : (
                        <span>-</span>
                      )}
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Equipment & Process Information */}
              <Col span={24}>
                <Card
                  size="small"
                  title={
                    <>
                      <InfoCircleOutlined /> Thông tin thiết bị & quy trình
                    </>
                  }
                  variant="outlined"
                >
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Thiết bị
                      </div>
                      <div style={{ fontWeight: 600, fontSize: "14px" }}>
                        {selectedIncident.equipmentName}
                        {selectedIncident.equipmentCode && (
                          <span style={{ color: "#999", marginLeft: 8 }}>
                            ({selectedIncident.equipmentCode})
                          </span>
                        )}
                      </div>
                    </Col>
                    <Col span={8}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Dây chuyền
                      </div>
                      <div style={{ fontSize: "14px" }}>
                        {selectedIncident.lineName || "-"}
                      </div>
                    </Col>
                    <Col span={8}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Công đoạn
                      </div>
                      <div style={{ fontSize: "14px" }}>
                        {selectedIncident.stageName || "-"}
                      </div>
                    </Col>
                    <Col span={8}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Loại dừng
                      </div>
                      {selectedIncident.category ? (
                        <Tag color="orange" style={{ fontSize: "13px" }}>
                          {selectedIncident.category}
                        </Tag>
                      ) : (
                        <span style={{ fontSize: "14px" }}>-</span>
                      )}
                    </Col>
                    <Col span={8}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Người báo cáo
                      </div>
                      <div style={{ fontSize: "14px" }}>
                        {(() => {
                          const reporterUser = teamLeads.find(
                            (tl) =>
                              tl.id === selectedIncident.reporter ||
                              tl.userId === selectedIncident.reporter ||
                              tl.userID === selectedIncident.reporter
                          );
                          return reporterUser
                            ? reporterUser.fullName || reporterUser.userName
                            : selectedIncident.reporter;
                        })()}
                      </div>
                    </Col>
                    <Col span={8}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Ngày tạo
                      </div>
                      <div style={{ fontSize: "14px" }}>
                        {selectedIncident.reportDate
                          ? dayjs(selectedIncident.reportDate).format(
                              "DD/MM/YYYY"
                            )
                          : "-"}
                      </div>
                    </Col>
                    {selectedIncident.isTechSupport && (
                      <>
                        <Col span={8}>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#666",
                              marginBottom: "6px",
                              fontWeight: 600,
                            }}
                          >
                            Hỗ trợ kỹ thuật
                          </div>
                          <Tag
                            color="blue"
                            icon={<ToolOutlined />}
                            style={{ fontSize: "13px" }}
                          >
                            Yêu cầu hỗ trợ
                          </Tag>
                        </Col>
                        <Col span={8}>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#666",
                              marginBottom: "6px",
                              fontWeight: 600,
                            }}
                          >
                            Người đảm nhiệm
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: 600 }}>
                            {getAssignedToName(selectedIncident.assignedTo) ||
                              "Chưa phân công"}
                          </div>
                        </Col>
                      </>
                    )}
                  </Row>
                </Card>
              </Col>

              {/* Time Information */}
              <Col span={24}>
                <Card
                  size="small"
                  title={
                    <>
                      <ClockCircleOutlined /> Thông tin thời gian
                    </>
                  }
                  variant="outlined"
                >
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Thời gian bắt đầu
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 500 }}>
                        {selectedIncident.reportDate
                          ? dayjs(selectedIncident.reportDate).format(
                              "DD/MM/YYYY HH:mm:ss"
                            )
                          : "-"}
                      </div>
                    </Col>
                    <Col span={8}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Thời gian kết thúc
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 500 }}>
                        {selectedIncident.resolveDate
                          ? dayjs(selectedIncident.resolveDate).format(
                              "DD/MM/YYYY HH:mm:ss"
                            )
                          : "-"}
                      </div>
                    </Col>
                    <Col span={8}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Thời lượng (phút)
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color:
                            selectedIncident.downtime > 5 ? "red" : "#1890ff",
                        }}
                      >
                        {selectedIncident.downtime
                          ? selectedIncident.downtime.toFixed(2)
                          : "-"}
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Incident Details */}
              <Col span={24}>
                <Card
                  size="small"
                  title={
                    <>
                      <FileTextOutlined /> Chi tiết sự cố
                    </>
                  }
                  variant="outlined"
                >
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Vấn đề
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.6,
                          padding: "12px",
                          backgroundColor: "#fafafa",
                          borderRadius: "6px",
                          border: "1px solid #f0f0f0",
                        }}
                      >
                        {selectedIncident.issue || "Không có mô tả"}
                      </div>
                    </Col>
                    <Col span={24}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Nguyên nhân
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.6,
                          padding: "12px",
                          backgroundColor: "#fafafa",
                          borderRadius: "6px",
                          border: "1px solid #f0f0f0",
                        }}
                      >
                        {selectedIncident.reason || "Chưa xác định"}
                      </div>
                    </Col>
                    <Col span={24}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Giải pháp
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.6,
                          padding: "12px",
                          backgroundColor: "#fafafa",
                          borderRadius: "6px",
                          border: "1px solid #f0f0f0",
                        }}
                      >
                        {selectedIncident.solution || "Chưa có giải pháp"}
                      </div>
                    </Col>
                    {selectedIncident.imageUrls &&
                      selectedIncident.imageUrls.length > 0 && (
                        <Col span={24}>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#666",
                              marginBottom: "6px",
                              fontWeight: 600,
                            }}
                          >
                            Hình ảnh sự cố
                          </div>
                          <div
                            style={{
                              padding: "12px",
                              backgroundColor: "#fafafa",
                              borderRadius: "6px",
                              border: "1px solid #f0f0f0",
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "12px",
                            }}
                          >
                            {selectedIncident.imageUrls.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Hình ảnh sự cố ${index + 1}`}
                                style={{
                                  maxWidth: "200px",
                                  maxHeight: "200px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  objectFit: "cover",
                                }}
                                onClick={() => window.open(url, "_blank")}
                              />
                            ))}
                          </div>
                        </Col>
                      )}
                  </Row>
                </Card>
              </Col>

              {/* Incident Shifts Table */}
              {incidentShifts.length > 0 && (
                <Col span={24}>
                  <Card
                    size="small"
                    title={
                      <>
                        <TeamOutlined /> Chi tiết theo ca
                      </>
                    }
                    variant="outlined"
                  >
                    <Table
                      dataSource={incidentShifts.map((shift, index) => ({
                        key: shift.incidentShiftId,
                        index: index + 1,
                        shiftName: shift.shift?.shiftName || "N/A",
                        shiftStartTime: shift.shift?.startTime || "-",
                        shiftEndTime: shift.shift?.endTime || "-",
                        duration:
                          shift.startTime && shift.endTime
                            ? dayjs(shift.endTime).diff(
                                dayjs(shift.startTime),
                                "minute",
                                true
                              )
                            : "-",
                        shiftDuration:
                          shift.shift?.startTime && shift.shift?.endTime
                            ? (() => {
                                const start = dayjs(
                                  shift.shift.startTime,
                                  "HH:mm:ss.SSSSSSS"
                                );
                                let end = dayjs(
                                  shift.shift.endTime,
                                  "HH:mm:ss.SSSSSSS"
                                );
                                // Handle night shift (end time is next day)
                                if (end.isBefore(start)) {
                                  end = end.add(1, "day");
                                }
                                return end.diff(start, "minute", true);
                              })()
                            : "-",
                      }))}
                      columns={[
                        {
                          title: "#",
                          dataIndex: "index",
                          key: "index",
                          width: 60,
                          align: "center",
                        },
                        {
                          title: "Ca",
                          dataIndex: "shiftName",
                          key: "shiftName",
                          width: 120,
                          align: "center",
                          render: (text) => (
                            <Tag style={{ fontWeight: 600 }}>{text}</Tag>
                          ),
                        },
                        {
                          title: "Ca giờ BD",
                          dataIndex: "shiftStartTime",
                          key: "shiftStartTime",
                          align: "center",
                          render: (text) => {
                            return text && text !== "-" ? (
                              <span style={{ fontWeight: 600 }}>
                                {dayjs(`1970-01-01T${text}`).format("HH:mm")}
                              </span>
                            ) : (
                              text
                            );
                          },
                        },
                        {
                          title: "Ca giờ KT",
                          dataIndex: "shiftEndTime",
                          key: "shiftEndTime",
                          align: "center",
                          render: (text) => {
                            return text && text !== "-" ? (
                              <span style={{ fontWeight: 600 }}>
                                {dayjs(`1970-01-01T${text}`).format("HH:mm")}
                              </span>
                            ) : (
                              text
                            );
                          },
                        },
                        {
                          title: "Thời lượng (phút)",
                          dataIndex: "duration",
                          key: "duration",
                          width: 130,
                          align: "center",
                          render: (val) =>
                            val !== "-" ? (
                              <span style={{ fontWeight: 600 }}>
                                {val.toFixed(2)}
                              </span>
                            ) : (
                              val
                            ),
                        },
                      ]}
                      pagination={false}
                      size="small"
                      bordered
                      style={{ marginTop: "8px" }}
                    />
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      {/* Form Modal (Add/Edit) */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingRight: "40px",
            }}
          >
            <Space>
              {isEditMode ? <EditOutlined /> : <PlusOutlined />}
              <span>{isEditMode ? "Cập nhật" : "Báo cáo"} sự cố</span>
            </Space>
            {!isEditMode && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addIncidentForm}
                size="small"
                style={{
                  backgroundColor: "#334766",
                  borderColor: "#334766",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                Thêm sự cố
              </Button>
            )}
          </div>
        }
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false);
          setSelectedEquipment(null); // Reset selected equipment when closing modal
          setIncidentForms([{ id: 1, status: "Chờ xử lý" }]); // Reset forms
          setFormChanged(false); // Reset form changed state
          setFormChangeCounter(0); // Reset form change counter
          setManualDurationFields(new Set()); // Reset manual duration tracking
          skipInitialDurationCalcRef.current = false; // Reset skip flag
          setImageFileList({}); // Reset image file list
          setUploadedImageUrls({}); // Reset uploaded image URLs
          form.resetFields();
        }}
        footer={
          <div
            style={{
              textAlign: "center",
              marginTop: "16px",
              padding: "12px 0",
              backgroundColor: "#c4c2c2ff",
            }}
          >
            <Space size="large">
              <Button
                size="large"
                onClick={() => {
                  setFormModalVisible(false);
                  setSelectedEquipment(null);
                  setIncidentForms([{ id: 1, status: "Chờ xử lý" }]);
                  setFormChanged(false); // Reset form changed state
                  setFormChangeCounter(0); // Reset form change counter
                  setManualDurationFields(new Set()); // Reset manual duration tracking
                  skipInitialDurationCalcRef.current = false; // Reset skip flag
                  setImageFileList({}); // Reset image file list
                  setUploadedImageUrls({}); // Reset uploaded image URLs
                  form.resetFields();
                }}
                style={{ minWidth: "120px" }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                onClick={() => form.submit()}
                disabled={isEditMode && !formChanged}
                style={{
                  backgroundColor:
                    !isEditMode || formChanged ? "#334766" : "#d9d9d9",
                  borderColor:
                    !isEditMode || formChanged ? "#334766" : "#d9d9d9",
                  minWidth: "120px",
                }}
              >
                {isEditMode ? "Cập nhật" : "Báo cáo"}
              </Button>
            </Space>
          </div>
        }
        width={1300}
        style={{ top: 20 }}
        styles={{
          body: {
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
            overflowX: "hidden",
            paddingBottom: "60px",
            paddingLeft: "24px",
            paddingRight: "24px",
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          onValuesChange={handleFormValuesChange}
          initialValues={{ status: "Chờ xử lý" }}
        >
          {!isEditMode ? (
            // Create mode - multiple incidents
            <>
              {incidentForms.map((incidentForm, index) => {
                const currentShift = getCurrentShift();
                return (
                  <div
                    key={incidentForm.id}
                    style={{
                      marginBottom: "24px",
                      padding: "20px",
                      border: "1px solid #e8e8e8",
                      borderRadius: "8px",
                      backgroundColor: "#fafafa",
                      position: "relative",
                    }}
                  >
                    {/* No. Badge */}
                    <div
                      style={{
                        marginBottom: "16px",
                        fontWeight: 600,
                        fontSize: "16px",
                        color: "#334766",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <Badge
                        count={`No.${incidentForm.id}`}
                        style={{
                          backgroundColor: "#e9e9e9ff",
                          color: "#333",
                          fontWeight: "500",
                          fontSize: "14px",
                          height: "28px",
                          lineHeight: "28px",
                          borderRadius: "14px",
                          padding: "0 12px",
                        }}
                      />
                      {/* <span>Báo cáo sự cố</span> */}
                    </div>

                    {/* Current Shift Display */}
                    <div
                      style={{
                        marginBottom: "20px",
                        padding: "12px 16px",
                        backgroundColor: "#fff",
                        borderRadius: "6px",
                        border: "1px solid #d9d9d9",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <ClockCircleOutlined
                        style={{ color: "#1890ff", fontSize: "16px" }}
                      />
                      <span style={{ color: "#666", marginRight: "8px" }}>
                        Ca hiện tại:
                      </span>
                      {currentShift ? (
                        <>
                          <span
                            style={{
                              backgroundColor: "#e6f7ff",
                              color: "#1890ff",
                              padding: "4px 12px",
                              borderRadius: "4px",
                              fontWeight: 600,
                              fontSize: "14px",
                            }}
                          >
                            {currentShift.shiftName}
                          </span>
                          <span style={{ color: "#999", margin: "0 4px" }}>
                            ({currentShift.startTime} - {currentShift.endTime})
                          </span>
                        </>
                      ) : (
                        <span style={{ color: "#999", fontStyle: "italic" }}>
                          Không có ca nào đang hoạt động
                        </span>
                      )}
                    </div>

                    {/* Form Fields */}
                    <Row gutter={16}>
                      <Form.Item
                        name={`status_${incidentForm.id}`}
                        hidden
                        initialValue="Chờ xử lý"
                      >
                        <Input />
                      </Form.Item>

                      <Col span={12}>
                        <Form.Item
                          label="Mã thiết bị"
                          name={`equipmentCode_${incidentForm.id}`}
                          // rules={[
                          //   {
                          //     required: true,
                          //     message: "Vui lòng chọn mã thiết bị!",
                          //   },
                          // ]}
                        >
                          <Select
                            placeholder="Chọn hoặc tìm mã thiết bị"
                            showSearch
                            allowClear
                            optionFilterProp="children"
                            onChange={(value) => {
                              const equipment = equipments.find(
                                (e) => e.equipmentId === value
                              );
                              if (equipment) {
                                setSelectedEquipment(equipment);
                                form.setFieldsValue({
                                  [`equipmentId_${incidentForm.id}`]:
                                    equipment.equipmentId,
                                  [`lineId_${incidentForm.id}`]:
                                    equipment.lineId,
                                  [`stageId_${incidentForm.id}`]:
                                    equipment.stageId,
                                });
                                // Trigger form change to re-render disable state
                                setFormChangeCounter((prev) => prev + 1);
                              } else {
                                setSelectedEquipment(null);
                                form.setFieldsValue({
                                  [`lineId_${incidentForm.id}`]: undefined,
                                  [`stageId_${incidentForm.id}`]: undefined,
                                });
                                setFormChangeCounter((prev) => prev + 1);
                              }
                            }}
                          >
                            {equipments.map((equipment) => (
                              <Option
                                key={equipment.equipmentId}
                                value={equipment.equipmentId}
                              >
                                {equipment.equipmentCode} -{" "}
                                {equipment.equipmentName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Thiết bị"
                          name={`equipmentId_${incidentForm.id}`}
                        >
                          <Select
                            placeholder="-- Chọn --"
                            showSearch
                            allowClear
                            optionFilterProp="children"
                            disabled
                          >
                            {equipments.map((equipment) => (
                              <Option
                                key={equipment.equipmentId}
                                value={equipment.equipmentId}
                              >
                                {equipment.equipmentName} (
                                {equipment.equipmentCode})
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Công đoạn"
                          name={`stageId_${incidentForm.id}`}
                        >
                          <Select
                            placeholder="-- Chọn --"
                            showSearch
                            allowClear
                            optionFilterProp="children"
                            disabled
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
                          label="Dây chuyền"
                          name={`lineId_${incidentForm.id}`}
                          rules={[
                            { required: true, message: "Vui lòng dây chuyền!" },
                          ]}
                        >
                          <Select
                            placeholder="-- Chọn --"
                            showSearch
                            allowClear
                            optionFilterProp="children"
                            disabled={
                              !!form.getFieldValue(
                                `equipmentCode_${incidentForm.id}`
                              )
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
                          shouldUpdate={(prevValues, currentValues) => {
                            const prevIsTechSupport =
                              prevValues[`isTechSupport_${incidentForm.id}`];
                            const currentIsTechSupport =
                              currentValues[`isTechSupport_${incidentForm.id}`];
                            const prevEndTime =
                              prevValues[`endTime_${incidentForm.id}`];
                            const currentEndTime =
                              currentValues[`endTime_${incidentForm.id}`];
                            return (
                              prevIsTechSupport !== currentIsTechSupport ||
                              prevEndTime !== currentEndTime
                            );
                          }}
                          noStyle
                        >
                          {({ getFieldValue }) => {
                            const isTechSupport =
                              getFieldValue(
                                `isTechSupport_${incidentForm.id}`
                              ) || false;
                            const endTime = getFieldValue(
                              `endTime_${incidentForm.id}`
                            );
                            const hasEndTime =
                              endTime && dayjs(endTime).isValid();
                            const isRequired =
                              !isTechSupport || (isTechSupport && hasEndTime);
                            return (
                              <Form.Item
                                label="Loại"
                                name={`typeId_${incidentForm.id}`}
                                required={isRequired}
                                rules={
                                  isRequired
                                    ? [
                                        {
                                          required: true,
                                          message: "Vui lòng chọn loại dừng!",
                                        },
                                      ]
                                    : []
                                }
                              >
                                <Select
                                  placeholder="-- Chọn --"
                                  showSearch
                                  allowClear
                                  optionFilterProp="children"
                                >
                                  {stopTypes.map((stopType) => (
                                    <Option
                                      key={
                                        stopType.stopTypeId || stopType.typeId
                                      }
                                      value={
                                        stopType.stopTypeId || stopType.typeId
                                      }
                                    >
                                      {stopType.typeName ||
                                        stopType.stopTypeName}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            );
                          }}
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Thời gian bắt đầu sự cố"
                          name={`startTime_${incidentForm.id}`}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập thời gian bắt đầu sự cố!",
                            },
                          ]}
                        >
                          <DatePicker
                            showTime={{ format: "HH:mm:ss" }}
                            format="DD/MM/YYYY HH:mm:ss"
                            placeholder="Chọn thời gian bắt đầu sự cố"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Thời gian kết thúc sự cố"
                          name={`endTime_${incidentForm.id}`}
                        >
                          <DatePicker
                            showTime={{ format: "HH:mm:ss" }}
                            format="DD/MM/YYYY HH:mm:ss"
                            placeholder="Chọn thời gian kết thúc sự cố"
                            style={{ width: "100%" }}
                            onChange={(value) => {
                              const hasEndTime =
                                value && dayjs(value).isValid();
                              const status = hasEndTime
                                ? "Hoàn thành"
                                : "Chờ xử lý";
                              form.setFieldsValue({
                                [`status_${incidentForm.id}`]: status,
                              });
                              // Update status in incidentForms state
                              setIncidentForms((prev) =>
                                prev.map((f) =>
                                  f.id === incidentForm.id
                                    ? { ...f, status }
                                    : f
                                )
                              );
                            }}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Thời lượng (phút)"
                          name={`duration_${incidentForm.id}`}
                          help="Mặc định tự động tính từ ST-ET (trừ break time). Có thể nhập thủ công để ghi đè."
                          rules={[
                            {
                              pattern: /^\d+(\.\d+)?$/,
                              message: "Thời lượng phải là số dương!",
                            },
                          ]}
                        >
                          <Input
                            type="number"
                            placeholder="Tự động tính từ ST-ET hoặc nhập thủ công"
                            min={0}
                            step={0.01}
                            addonAfter="phút"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Người báo cáo"
                          name={`reporter_${incidentForm.id}`}
                        >
                          <Select
                            placeholder="Chọn người báo cáo"
                            showSearch
                            allowClear
                            optionFilterProp="children"
                          >
                            <Option value={null}>Không có</Option>
                            {teamLeads.map((teamLead) => (
                              <Option
                                key={
                                  teamLead.id ||
                                  teamLead.userId ||
                                  teamLead.userID
                                }
                                value={
                                  teamLead.id ||
                                  teamLead.userId ||
                                  teamLead.userID
                                }
                              >
                                {teamLead.fullName ||
                                  teamLead.userName ||
                                  "Không xác định"}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Alert
                          type="info"
                          message="Vui lòng chọn người báo cáo từ danh sách tổ trưởng."
                          showIcon
                          style={{ marginBottom: 16 }}
                        />
                      </Col>

                      <Col span={12}>
                        <Form.Item label="Trạng thái">
                          <Select value={incidentForm.status} disabled>
                            <Option value="Chờ xử lý">Chờ xử lý</Option>
                            <Option value="Đang xử lý">Đang xử lý</Option>
                            <Option value="Hoàn thành">Hoàn thành</Option>
                          </Select>
                        </Form.Item>

                        {/* <Form.Item
                          name={`isTechSupport_${incidentForm.id}`}
                          valuePropName="checked"
                          style={{ marginTop: "30px" }}
                        >
                          <Checkbox
                            disabled={form.getFieldValue(`endTime_${incidentForm.id}`) && dayjs(form.getFieldValue(`endTime_${incidentForm.id}`)).isValid()}
                          >
                            Cần hỗ trợ kỹ thuật
                          </Checkbox>
                        </Form.Item> */}
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          name={`isTechSupport_${incidentForm.id}`}
                          valuePropName="checked"
                          style={{ marginTop: "30px" }}
                        >
                          <Checkbox
                            disabled={
                              form.getFieldValue(
                                `endTime_${incidentForm.id}`
                              ) &&
                              dayjs(
                                form.getFieldValue(`endTime_${incidentForm.id}`)
                              ).isValid()
                            }
                          >
                            Cần hỗ trợ kỹ thuật
                          </Checkbox>
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item
                          label="Mô tả vấn đề"
                          name={`issue_${incidentForm.id}`}
                        >
                          <TextArea
                            rows={3}
                            placeholder="Mô tả chi tiết vấn đề gặp phải... (tùy chọn)"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item
                          label="Nguyên nhân"
                          name={`reason_${incidentForm.id}`}
                        >
                          <TextArea
                            rows={2}
                            placeholder="Phân tích nguyên nhân... (tùy chọn)"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item
                          label="Giải pháp"
                          name={`solution_${incidentForm.id}`}
                        >
                          <TextArea
                            rows={3}
                            placeholder="Mô tả giải pháp đã/đang thực hiện... (tùy chọn)"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item label="Hình ảnh sự cố">
                          <Upload {...getUploadProps(incidentForm.id)}>
                            <Button
                              icon={<UploadOutlined />}
                              loading={uploadingImage}
                            >
                              Chọn ảnh
                            </Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Delete Button */}
                    {incidentForms.length > 1 && (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeIncidentForm(incidentForm.id)}
                        block
                        style={{
                          marginTop: "16px",
                          height: "40px",
                          fontWeight: 600,
                        }}
                      >
                        Xóa sự cố này
                      </Button>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            // Edit mode - single incident (existing code)
            <>
              <Row gutter={[12, 16]}>
                {/* hidden status field for create mode, visible for edit mode */}
                {!isEditMode && (
                  <Form.Item name="status" hidden>
                    <Input />
                  </Form.Item>
                )}

                <Col span={12}>
                  <Form.Item
                    label="Mã thiết bị"
                    name="equipmentCode"
                    // rules={[
                    //   { required: true, message: "Vui lòng chọn mã thiết bị!" },
                    // ]}
                  >
                    <Select
                      placeholder="Chọn hoặc tìm mã thiết bị"
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      onSearch={() => {}}
                      onChange={(value) => {
                        // value will be equipmentId (we store id as value but show code+name)
                        const equipment = equipments.find(
                          (e) => e.equipmentId === value
                        );
                        if (equipment) {
                          setSelectedEquipment(equipment);
                          // set equipmentId, lineId, stageId in form so other fields stay in sync
                          form.setFieldsValue({
                            equipmentId: equipment.equipmentId,
                            equipmentCode: equipment.equipmentCode,
                            lineId: equipment.lineId,
                            stageId: equipment.stageId,
                          });
                          // Trigger re-render to update disable state
                          setFormChangeCounter((prev) => prev + 1);
                        } else {
                          setSelectedEquipment(null);
                          form.setFieldsValue({
                            equipmentId: null,
                            lineId: undefined,
                            stageId: undefined,
                          });
                          setFormChangeCounter((prev) => prev + 1);
                        }
                      }}
                    >
                      {equipments.map((equipment) => (
                        <Option
                          key={equipment.equipmentId}
                          value={equipment.equipmentId}
                        >
                          {equipment.equipmentCode} - {equipment.equipmentName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Thiết bị" name="equipmentId">
                    <Select
                      placeholder="-- Chọn --"
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      disabled
                    >
                      {equipments.map((equipment) => (
                        <Option
                          key={equipment.equipmentId}
                          value={equipment.equipmentId}
                        >
                          {equipment.equipmentName} ({equipment.equipmentCode})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="Công đoạn" name="stageId">
                    <Select
                      placeholder="-- Chọn --"
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      disabled
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
                    label="Dây chuyền"
                    name="lineId"
                    rules={[
                      { required: true, message: "Vui lòng chọn dây chuyền!" },
                    ]}
                  >
                    <Select
                      placeholder="-- Chọn --"
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      disabled={!!form.getFieldValue("equipmentCode")}
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
                    shouldUpdate={(prevValues, currentValues) => {
                      const prevIsTechSupport = prevValues.isTechSupport;
                      const currentIsTechSupport = currentValues.isTechSupport;
                      const prevEndTime = prevValues.endTime;
                      const currentEndTime = currentValues.endTime;
                      return (
                        prevIsTechSupport !== currentIsTechSupport ||
                        prevEndTime !== currentEndTime
                      );
                    }}
                    noStyle
                  >
                    {({ getFieldValue }) => {
                      const isTechSupport =
                        getFieldValue("isTechSupport") || false;
                      const endTime = getFieldValue("endTime");
                      const hasEndTime = endTime && dayjs(endTime).isValid();
                      const isRequired =
                        !isTechSupport || (isTechSupport && hasEndTime);
                      return (
                        <Form.Item
                          label="Loại"
                          name="typeId"
                          required={isRequired}
                          rules={
                            isRequired
                              ? [
                                  {
                                    required: true,
                                    message: "Vui lòng chọn loại dừng!",
                                  },
                                ]
                              : []
                          }
                        >
                          <Select
                            placeholder="-- Chọn --"
                            showSearch
                            allowClear
                            optionFilterProp="children"
                          >
                            {stopTypes.map((stopType) => (
                              <Option
                                key={stopType.stopTypeId || stopType.typeId}
                                value={stopType.stopTypeId || stopType.typeId}
                              >
                                {stopType.typeName || stopType.stopTypeName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Thời gian bắt đầu sự cố"
                    name="startTime"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập thời gian bắt đầu sự cố!",
                      },
                    ]}
                  >
                    <DatePicker
                      showTime={{ format: "HH:mm:ss" }}
                      format="DD/MM/YYYY HH:mm:ss"
                      placeholder="Chọn thời gian bắt đầu sự cố"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="Thời gian kết thúc sự cố" name="endTime">
                    <DatePicker
                      showTime={{ format: "HH:mm:ss" }}
                      format="DD/MM/YYYY HH:mm:ss"
                      placeholder="Chọn thời gian kết thúc sự cố"
                      style={{ width: "100%" }}
                      onChange={(value) => handleEndTimeChange(value)}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Thời lượng (phút)"
                    name="duration"
                    help="Mặc định tự động tính từ ST-ET (trừ break time). Có thể nhập thủ công để ghi đè."
                    rules={[
                      {
                        pattern: /^\d+(\.\d+)?$/,
                        message: "Thời lượng phải là số dương!",
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Tự động tính từ ST-ET hoặc nhập thủ công"
                      min={0}
                      step={0.01}
                      addonAfter="phút"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="Người báo cáo" name="reporter">
                    <Select
                      placeholder="Chọn người báo cáo"
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      onSearch={() => {}}
                    >
                      <Option value={null}>Không có</Option>
                      {teamLeads.map((teamLead) => (
                        <Option
                          key={
                            teamLead.id || teamLead.userId || teamLead.userID
                          }
                          value={
                            teamLead.id || teamLead.userId || teamLead.userID
                          }
                        >
                          {teamLead.fullName ||
                            teamLead.userName ||
                            "Không xác định"}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Alert
                    type="info"
                    message="Bạn có thể chọn tổ trưởng khác để cập nhật người báo cáo, chọn 'Không có' để xóa người báo cáo, hoặc để trống nếu không muốn thay đổi."
                    showIcon
                    style={{ marginBottom: 16, marginTop: 8 }}
                  />
                </Col>

                <Col span={12}>
                  {isEditMode && (
                    <Form.Item
                      label="Trạng thái"
                      name="status"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn trạng thái!",
                        },
                      ]}
                    >
                      <Select placeholder="Chọn trạng thái" disabled>
                        <Option value="Chờ xử lý">Chờ xử lý</Option>
                        <Option value="Đang xử lý">Đang xử lý</Option>
                        <Option value="Hoàn thành">Hoàn thành</Option>
                      </Select>
                    </Form.Item>
                  )}
                  {!isEditMode && (
                    <Form.Item label="Trạng thái">
                      <Input value={createStatus} />
                    </Form.Item>
                  )}

                  {/* <Form.Item
                    name="isTechSupport"
                    valuePropName="checked"
                    style={{ marginTop: "30px" }}
                  >
                    <Checkbox
                      disabled={isEditMode && selectedIncident?.resolveDate && dayjs(selectedIncident.resolveDate).isValid()}
                    >
                      Cần hỗ trợ kỹ thuật
                    </Checkbox>
                  </Form.Item> */}
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="isTechSupport"
                    valuePropName="checked"
                    style={{ marginTop: "30px" }}
                  >
                    <Checkbox
                      disabled={
                        isEditMode &&
                        selectedIncident?.resolveDate &&
                        dayjs(selectedIncident.resolveDate).isValid()
                      }
                    >
                      Cần hỗ trợ kỹ thuật
                    </Checkbox>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Mô tả vấn đề" name="issue">
                    <TextArea
                      rows={3}
                      placeholder="Mô tả chi tiết vấn đề gặp phải... (tùy chọn)"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Nguyên nhân" name="reason">
                    <TextArea
                      rows={2}
                      placeholder="Phân tích nguyên nhân... (tùy chọn)"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Giải pháp" name="solution">
                    <TextArea
                      rows={3}
                      placeholder="Mô tả giải pháp đã/đang thực hiện... (tùy chọn)"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Hình ảnh sự cố">
                    <Upload {...getUploadProps("edit")}>
                      <Button
                        icon={<UploadOutlined />}
                        loading={uploadingImage}
                      >
                        Chọn ảnh
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {/* <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setFormModalVisible(false);
                  setSelectedEquipment(null); // Reset selected equipment when canceling
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ backgroundColor: "#334766", borderColor: "#334766" }}>
                {isEditMode ? "Cập nhật" : "Báo cáo"}
              </Button>
            </Space>
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default IncidentManagement;
