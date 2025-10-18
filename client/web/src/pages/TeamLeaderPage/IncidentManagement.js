import React, { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import dayjs from "dayjs";
import * as utcPlugin from "dayjs/plugin/utc";
import styles from "../../styles/pages/IncidentManagement.module.css";

// Extend dayjs with UTC plugin
dayjs.extend(utcPlugin.default || utcPlugin);
import { incidentService } from "../../services/incidentService";
import { equipmentService } from "../../services/equipmentService";
import { lineService } from "../../services/lineService";
import { stageService } from "../../services/stageService";
import { stopTypeService } from "../../services/stopTypeService";
import { userService } from "../../services/userService";
import { useAuth } from "../../contexts/AuthContext";

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const IncidentManagement = () => {
  const { user: currentUser } = useAuth();
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

  useEffect(() => {
    fetchIncidents();
    fetchEquipments();
    fetchLines();
    fetchStages();
    fetchStopTypes();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [searchText, filterStatus, filterPriority, incidents, teamLeads]);

  useEffect(() => {
    if (formModalVisible && (selectedEquipment || currentUser)) {
      fetchTeamLeads();
    }
  }, [selectedEquipment, currentUser, formModalVisible]);

  const fetchEquipments = async () => {
    try {
      const response = await equipmentService.getEquipments();
      const data = Array.isArray(response) ? response : response?.data || [];
      setEquipments(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách thiết bị:", error);
      message.error("Không thể tải danh sách thiết bị");
    }
  };

  const fetchLines = async () => {
    try {
      const response = await lineService.getLines();
      const data = Array.isArray(response) ? response : response?.data || [];
      setLines(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách dây chuyền:", error);
      message.error("Không thể tải danh sách dây chuyền");
    }
  };

  const fetchStages = async () => {
    try {
      const response = await stageService.getStages();
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

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await incidentService.getAll();
      // backend returns { success, data }
      const items = Array.isArray(res) ? res : res?.data || [];
      // Normalize to frontend shape
      const mapped = (items || []).map((it) => {
        // compute downtime in minutes if possible
        let downtime = 0;
        try {
          if (it.endTime && it.startTime) {
            const start = dayjs(it.startTime);
            const end = dayjs(it.endTime);
            downtime = Math.abs(end.diff(start, "minute", true)); // true for floating point precision
          } else if (it.downtimeMinutes != null) {
            downtime = Number(it.downtimeMinutes) || 0;
          } else if (it.duration != null) {
            // duration may be in hours or minutes depending on API; keep as-is
            downtime = Number(it.duration) || 0;
          } else if (it.downtime != null) {
            downtime = Number(it.downtime) || 0;
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
          category: it.category || it.Category || it.type?.typeName || null,
          downtime: downtime,
          impact: it.impact || it.Impact || null,
          attachments: it.attachments || it.files || [],
          startSlotTime:
            it.slot?.slotStartTime || it.slot?.SlotStartTime || null,
          endSlotTime: it.slot?.slotEndTime || it.slot?.SlotEndTime || null,
        };
      });
      setIncidents(mapped);
      setFilteredIncidents(mapped);
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

    setFilteredIncidents(filtered);
  };

  const handleAddIncident = () => {
    setIsEditMode(false);
    setSelectedIncident(null);
    setSelectedEquipment(null); // Reset selected equipment
    setCreateStatus("Chờ xử lý"); // Reset status for create mode
    setIncidentForms([{ id: 1, status: "Chờ xử lý" }]); // Reset to single form
    form.resetFields();
    // Auto-fill reporter with current user ID (can be changed to other team leads)
    form.setFieldsValue({
      //reporter: currentUser?.id || currentUser?.userId || currentUser?.userID || null,
      reporter:
        currentUser?.fullName || currentUser?.userName || "Không xác định",
    });
    setFormModalVisible(true);
  };

  const addIncidentForm = () => {
    const newId = incidentForms.length + 1;
    setIncidentForms([...incidentForms, { id: newId, status: "Chờ xử lý" }]);
    message.info({
      content:
        "Một bản ghi sự cố khác đã được thêm bên dưới.",
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

  const getCurrentTimeSlot = () => {
    const now = dayjs();
    const currentHour = now.hour();
    const currentMinute = now.minute();

    // Round to nearest 30-minute slot
    let startMinute = currentMinute < 30 ? 0 : 30;
    let endMinute = startMinute === 0 ? 30 : 0;
    let endHour = startMinute === 0 ? currentHour : currentHour + 1;

    const startTime = `${String(currentHour).padStart(2, "0")}:${String(
      startMinute
    ).padStart(2, "0")}`;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(
      endMinute
    ).padStart(2, "0")}`;

    return { startTime, endTime };
  };

  const handleEditIncident = (record) => {
    setIsEditMode(true);
    setSelectedIncident(record);

    // Find the equipment to pre-select it
    const equipment = equipments.find(
      (e) => e.equipmentId === record.equipmentId
    );
    if (equipment) {
      setSelectedEquipment(equipment);
    }

    // Set form values with proper equipment selection
    form.setFieldsValue({
      equipmentCode: record.equipmentId, // This is the value for the Select, which uses equipmentId
      equipmentId: record.equipmentId,
      lineId: equipment?.lineId || record.lineId,
      stageId: equipment?.stageId || record.stageId,
      typeId:
        record.typeId ||
        (record.category
          ? stopTypes.find((st) => st.typeName === record.category)?.stopTypeId
          : null),
      issue: record.issue,
      reason: record.reason,
      solution: record.solution,
      status: record.status, // Will be overridden below
      startTime: record.reportDate ? dayjs(record.reportDate) : null,
      endTime: record.resolveDate ? dayjs(record.resolveDate) : null,
      reporter: record.reportedByUserId || record.reporterId || null, // Use user ID for editing
    });

    // Set status based on presence of endTime
    const hasEndTime =
      record.resolveDate && dayjs(record.resolveDate).isValid();
    form.setFieldsValue({
      status: hasEndTime ? "Hoàn thành" : "Chờ xử lý",
    });
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
      const errMsg = error?.message || error?.data?.message || "Xóa thất bại!";
      message.error(errMsg);
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedIncident(record);
    setDetailModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);

      if (isEditMode) {
        // Edit mode - single incident (existing logic)
        const hasEndTime = values.endTime && dayjs(values.endTime).isValid();
        const status = hasEndTime ? "Hoàn thành" : "Chờ xử lý";

        const formEquipmentId = form.getFieldValue("equipmentId");
        const finalEquipmentId =
          formEquipmentId ||
          selectedEquipment?.equipmentId ||
          selectedIncident.equipmentId;

        let typeId = values.typeId;
        if (!typeId && selectedIncident.category) {
          const stopType = stopTypes.find(
            (st) => st.typeName === selectedIncident.category
          );
          typeId = stopType?.stopTypeId || stopType?.typeId;
        }

        const editPayload = {
          equipmentId: finalEquipmentId,
          startTime: values.startTime
            ? dayjs(values.startTime).format("YYYY-MM-DDTHH:mm:ss.SSS")
            : dayjs(selectedIncident.reportDate).format(
                "YYYY-MM-DDTHH:mm:ss.SSS"
              ),
          endTime: values.endTime
            ? dayjs(values.endTime).format("YYYY-MM-DDTHH:mm:ss.SSS")
            : null,
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
          status: status,
          reportedByUserId:
            values.reporter || selectedIncident.reportedByUserId || null,
        };

        const id =
          selectedIncident?.id ||
          selectedIncident?.incidentId ||
          selectedIncident?.IncidentId;
        await incidentService.update(id, editPayload);
        message.success("Cập nhật sự cố thành công!");
      } else {
        // Create mode - multiple incidents
        const incidentsToCreate = [];

        // Loop through each incident form and collect data
        for (const incidentForm of incidentForms) {
          const formId = incidentForm.id;

          // Get values for this specific form
          const equipmentId = form.getFieldValue(`equipmentId_${formId}`);
          const startTime = form.getFieldValue(`startTime_${formId}`);
          const endTime = form.getFieldValue(`endTime_${formId}`);
          const typeId = form.getFieldValue(`typeId_${formId}`);
          const issue = form.getFieldValue(`issue_${formId}`);
          const reason = form.getFieldValue(`reason_${formId}`);
          const solution = form.getFieldValue(`solution_${formId}`);
          const reporter = form.getFieldValue(`reporter_${formId}`);

          // Validate required fields
          if (!equipmentId) {
            message.error(`Sự cố No.${formId}: Vui lòng chọn thiết bị!`);
            setLoading(false);
            return;
          }

          if (!typeId) {
            message.error(`Sự cố No.${formId}: Vui lòng chọn loại dừng!`);
            setLoading(false);
            return;
          }

          if (!startTime) {
            message.error(
              `Sự cố No.${formId}: Vui lòng nhập thời gian bắt đầu!`
            );
            setLoading(false);
            return;
          }

          if (!reporter) {
            message.error(`Sự cố No.${formId}: Vui lòng chọn người báo cáo!`);
            setLoading(false);
            return;
          }

          // Determine status
          const hasEndTime = endTime && dayjs(endTime).isValid();
          const status = hasEndTime ? "Hoàn thành" : "Chờ xử lý";

          // Build payload for this incident
          const payload = {
            equipmentId: equipmentId,
            startTime: startTime
              ? dayjs(startTime).format("YYYY-MM-DDTHH:mm:ss.SSS")
              : null,
            endTime: endTime
              ? dayjs(endTime).format("YYYY-MM-DDTHH:mm:ss.SSS")
              : null,
            typeId: typeId,
            issue: issue || null,
            reason: reason || null,
            solution: solution || null,
            status: status,
            reportedByUserId:
              reporter ||
              currentUser?.id ||
              currentUser?.userId ||
              currentUser?.userID ||
              null,
          };

          incidentsToCreate.push(payload);
        }

        // Create all incidents using bulk API
        try {
          const response = await incidentService.createBulk(incidentsToCreate);

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
            });
          }
        } catch (error) {
          console.error("Lỗi khi tạo nhiều sự cố:", error);
          message.error(error?.message || "Tạo sự cố thất bại!");
        }
      }

      setFormModalVisible(false);
      setSelectedEquipment(null);
      setIncidentForms([{ id: 1, status: "Chờ xử lý" }]);
      form.resetFields();
      fetchIncidents();
    } catch (error) {
      console.error("Lỗi khi lưu sự cố:", error);
      const errMsg = error?.message || error?.data?.message || "Lưu thất bại!";
      message.error(errMsg);
    } finally {
      setLoading(false);
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
      case "Hủy":
        return "error";
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
    return teamLead ? teamLead.fullName || teamLead.userName : reporterId;
  };

  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: 100,
      fixed: "left",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 150,
      ellipsis: {
        showTitle: false,
      },
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
      render: (text) => (
        <Tooltip title={text || " "}>
          <span>{text || " "}</span>
        </Tooltip>
      ),
    },
    {
      title: "Khung giờ BD",
      dataIndex: "startSlotTime",
      key: "startSlotTime",
      width: 130,
      render: (time) => (time ? time.toString().substring(0, 5) : "-"),
    },
    {
      title: "Khung giờ KT",
      dataIndex: "endSlotTime",
      key: "endSlotTime",
      width: 130,
      render: (time) => (time ? time.toString().substring(0, 5) : "-"),
    },
    {
      title: "Ngày",
      dataIndex: "reportDate",
      key: "reportDate",
      width: 150,
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
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
          <Card bordered={false}>
            <Statistic
              title="Tổng sự cố"
              value={stats.total}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Chờ xử lý"
              value={stats.pending}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Đang xử lý"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
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
            <Button icon={<ReloadOutlined />} onClick={fetchIncidents}>
              Làm mới
            </Button>
          </Space>
        }
        bordered={false}
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
              <Option value="Hủy">Hủy</Option>
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
        width={900}
      >
        {selectedIncident && (
          <div className={styles.detailContent}>
            <Row gutter={[16, 16]}>
              {/* Main Information Card */}
              <Col span={24}>
                <Card size="small">
                  <Row gutter={[16, 16]}>
                    {/* Row 1: Mã sự cố */}
                    <Col span={24}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Mã sự cố
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "18px",
                          color: "#334766",
                        }}
                      >
                        #{selectedIncident.id}
                      </div>
                    </Col>

                    {/* Row 2: Thiết bị */}
                    {selectedIncident.equipmentName && (
                      <Col span={24}>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#666",
                            marginBottom: 6,
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
                    )}

                    {/* Row 3: Slot Time Info (Khung giờ BD, Khung giờ KT) */}
                    <Col span={12}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Khung giờ BD
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        {selectedIncident.startSlotTime
                          ? selectedIncident.startSlotTime
                              .toString()
                              .substring(0, 5)
                          : "-"}
                      </div>
                    </Col>
                    <Col span={12}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Khung giờ KT
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        {selectedIncident.endSlotTime
                          ? selectedIncident.endSlotTime
                              .toString()
                              .substring(0, 5)
                          : "-"}
                      </div>
                    </Col>

                    {/* Row 4: Time Info (StartTime, EndTime, Duration) */}
                    <Col span={8}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Thời gian bắt đầu
                      </div>
                      <div style={{ fontSize: "13px" }}>
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
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Thời gian kết thúc
                      </div>
                      <div style={{ fontSize: "13px" }}>
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
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Thời lượng (phút)
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>
                        {selectedIncident.downtime.toFixed(2) || "-"}
                      </div>
                    </Col>

                    {/* Row 5: Status, StopType */}
                    <Col span={12}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Trạng thái
                      </div>
                      {selectedIncident.status ? (
                        <Tag
                          icon={getStatusIcon(selectedIncident.status)}
                          color={getStatusColor(selectedIncident.status)}
                        >
                          {selectedIncident.status}
                        </Tag>
                      ) : (
                        <span>-</span>
                      )}
                    </Col>
                    <Col span={12}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Loại dừng
                      </div>
                      {selectedIncident.category ? (
                        <Tag color="orange">{selectedIncident.category}</Tag>
                      ) : (
                        <span>-</span>
                      )}
                    </Col>

                    {/* Row 6: Issue (Vấn đề) */}
                    <Col span={24}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Vấn đề
                      </div>
                      <div style={{ fontSize: "14px", lineHeight: 1.6 }}>
                        {selectedIncident.issue || "-"}
                      </div>
                    </Col>

                    {/* Row 7: Reason (Nguyên nhân) */}
                    <Col span={24}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Nguyên nhân
                      </div>
                      <div style={{ fontSize: "14px", lineHeight: 1.6 }}>
                        {selectedIncident.reason || "-"}
                      </div>
                    </Col>

                    {/* Row 8: Solution (Giải pháp) */}
                    <Col span={24}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Giải pháp
                      </div>
                      <div style={{ fontSize: "14px", lineHeight: 1.6 }}>
                        {selectedIncident.solution || "-"}
                      </div>
                    </Col>

                    {/* Row 9: CreatedDate, ReportedByUserId */}
                    <Col span={12}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Ngày tạo
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        {selectedIncident.reportDate
                          ? dayjs(selectedIncident.reportDate).format(
                              "DD/MM/YYYY"
                            )
                          : "-"}
                      </div>
                    </Col>
                    <Col span={12}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#666",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        Người báo cáo
                      </div>
                      <div style={{ fontSize: "13px" }}>
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
                  </Row>
                </Card>
              </Col>
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
                style={{
                  backgroundColor: "#334766",
                  borderColor: "#334766",
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
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          overflowX: "hidden",
          paddingBottom: "60px",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ status: "Chờ xử lý" }}
        >
          {!isEditMode ? (
            // Create mode - multiple incidents
            <>
              {incidentForms.map((incidentForm, index) => {
                const timeSlot = getCurrentTimeSlot();
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

                    {/* Time Slot Display */}
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
                        Khung thời gian hiện tại:
                      </span>
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
                        {timeSlot.startTime}
                      </span>
                      <span style={{ color: "#999", margin: "0 4px" }}>-</span>
                      <span
                        style={{
                          backgroundColor: "#f6ffed",
                          color: "#52c41a",
                          padding: "4px 12px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        {timeSlot.endTime}
                      </span>
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
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn mã thiết bị!",
                            },
                          ]}
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
                              } else {
                                setSelectedEquipment(null);
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
                          name={`equipmentId_${incidentForm.id}`}
                          hidden
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item label="Thiết bị">
                          <Input
                            disabled
                            value={
                              selectedEquipment
                                ? `${selectedEquipment.equipmentName}${
                                    selectedEquipment.equipmentCode
                                      ? ` (${selectedEquipment.equipmentCode})`
                                      : ""
                                  }`
                                : ""
                            }
                            placeholder="-- Chọn --"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name={`lineId_${incidentForm.id}`} hidden>
                          <Input />
                        </Form.Item>
                        <Form.Item label="Dây chuyền">
                          <Input
                            disabled
                            value={
                              selectedEquipment
                                ? lines.find(
                                    (l) => l.lineId === selectedEquipment.lineId
                                  )?.lineName || ""
                                : ""
                            }
                            placeholder="-- Chọn --"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name={`stageId_${incidentForm.id}`} hidden>
                          <Input />
                        </Form.Item>
                        <Form.Item label="Công đoạn">
                          <Input
                            disabled
                            value={
                              selectedEquipment
                                ? stages.find(
                                    (s) =>
                                      s.stageId === selectedEquipment.stageId
                                  )?.stageName || ""
                                : ""
                            }
                            placeholder="-- Chọn --"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Loại"
                          name={`typeId_${incidentForm.id}`}
                          rules={[
                            { required: true, message: "Vui lòng chọn loại!" },
                          ]}
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
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Thời gian bắt đầu"
                          name={`startTime_${incidentForm.id}`}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập thời gian bắt đầu!",
                            },
                          ]}
                        >
                          <DatePicker
                            showTime={{ format: "HH:mm:ss" }}
                            format="DD/MM/YYYY HH:mm:ss"
                            placeholder="Chọn thời gian bắt đầu"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Thời gian kết thúc"
                          name={`endTime_${incidentForm.id}`}
                        >
                          <DatePicker
                            showTime={{ format: "HH:mm:ss" }}
                            format="DD/MM/YYYY HH:mm:ss"
                            placeholder="Chọn thời gian kết thúc"
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
                        <Form.Item label="Trạng thái">
                          <Input disabled value={incidentForm.status} />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Người báo cáo"
                          name={`reporter_${incidentForm.id}`}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn người báo cáo!",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn người báo cáo"
                            showSearch
                            allowClear
                            optionFilterProp="children"
                          >
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
                        <Col span={24}>
                          <Alert
                            type="info"
                            message="Lưu ý: Mặc định là tài khoản hiện đang đăng nhập. Bạn có thể chọn tổ trưởng khác trong cùng dây chuyền để báo cáo sự cố."
                            showIcon
                            style={{ marginBottom: 16 }}
                          />
                        </Col>
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
                    rules={[
                      { required: true, message: "Vui lòng chọn mã thiết bị!" },
                    ]}
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
                        } else {
                          setSelectedEquipment(null);
                          form.setFieldsValue({ equipmentId: null });
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
                  {/* hidden equipmentId so form submission includes the id */}
                  <Form.Item name="equipmentId" hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Thiết bị">
                    <Input
                      disabled
                      value={
                        selectedEquipment
                          ? `${selectedEquipment.equipmentName}${
                              selectedEquipment.equipmentCode
                                ? ` (${selectedEquipment.equipmentCode})`
                                : ""
                            }`
                          : ""
                      }
                      placeholder="-- Chọn --"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="lineId" hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Dây chuyền">
                    <Input
                      disabled
                      value={
                        selectedEquipment
                          ? lines.find(
                              (l) => l.lineId === selectedEquipment.lineId
                            )?.lineName || ""
                          : lines.find(
                              (l) => l.lineId === form.getFieldValue("lineId")
                            )?.lineName || ""
                      }
                      placeholder="-- Chọn --"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="stageId" hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Công đoạn">
                    <Input
                      disabled
                      value={
                        selectedEquipment
                          ? stages.find(
                              (s) => s.stageId === selectedEquipment.stageId
                            )?.stageName || ""
                          : stages.find(
                              (s) => s.stageId === form.getFieldValue("stageId")
                            )?.stageName || ""
                      }
                      placeholder="-- Chọn --"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Loại"
                    name="typeId"
                    rules={[{ required: true, message: "Vui lòng chọn loại!" }]}
                  >
                    <Select
                      placeholder="-- Chọn --"
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      onSearch={() => {}}
                      onChange={(value) => {
                        // value will be equipmentId (we store id as value but show code+name)
                        const stopType = stopTypes.find(
                          (e) => e.stopTypeId === value
                        );
                      }}
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
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Thời gian bắt đầu"
                    name="startTime"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập thời gian bắt đầu!",
                      },
                    ]}
                  >
                    <DatePicker
                      showTime={{ format: "HH:mm:ss" }}
                      format="DD/MM/YYYY HH:mm:ss"
                      placeholder="Chọn thời gian bắt đầu"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="Thời gian kết thúc" name="endTime">
                    <DatePicker
                      showTime={{ format: "HH:mm:ss" }}
                      format="DD/MM/YYYY HH:mm:ss"
                      placeholder="Chọn thời gian kết thúc"
                      style={{ width: "100%" }}
                      onChange={(value) => {
                        const hasEndTime = value && dayjs(value).isValid();
                        const status = hasEndTime ? "Hoàn thành" : "Chờ xử lý";
                        form.setFieldsValue({ status });
                        if (!isEditMode) {
                          setCreateStatus(status);
                        }
                      }}
                    />
                  </Form.Item>
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
                        <Option value="Hủy">Hủy</Option>
                      </Select>
                    </Form.Item>
                  )}
                  {!isEditMode && (
                    <Form.Item label="Trạng thái">
                      <Input disabled value={createStatus} />
                    </Form.Item>
                  )}
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Người báo cáo"
                    name="reporter"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn người báo cáo!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn người báo cáo"
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      onSearch={() => {}}
                    >
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
                </Col>

                <Col span={24}>
                  <Alert
                    type="info"
                    message="Lưu ý: Mặc định là tài khoản hiện đang đăng nhập. Bạn có thể chọn tổ trưởng khác trong cùng dây chuyền để báo cáo sự cố."
                    showIcon
                    style={{ marginBottom: 16, marginTop: 8 }}
                  />
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
