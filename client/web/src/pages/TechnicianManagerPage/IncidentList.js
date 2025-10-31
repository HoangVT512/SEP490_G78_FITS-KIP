import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Select,
  Space,
  message,
  Tag,
  Tooltip,
  Card,
  Row,
  Col,
  Statistic,
  Empty,
  Tabs,
  Dropdown,
  Image,
  Carousel,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  DownOutlined,
  LeftOutlined,
  RightOutlined,
  PictureOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { incidentService } from "../../services/incidentService";
import { userService } from "../../services/userService";
import { lineService } from "../../services/lineService";
import { stageService } from "../../services/stageService";
import signalRService from "../../services/signalRService";
import { useAuth } from "../../contexts/AuthContext";
import ReplacementApprovalModal from "./ReplacementApprovalModal";

const { Option } = Select;
const IncidentList = () => {
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [allIncidents, setAllIncidents] = useState([]); // Store all incidents for tab counts
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [approvalEquipmentId, setApprovalEquipmentId] = useState(null);
  const [approvalEquipmentInfo, setApprovalEquipmentInfo] = useState(null); // Equipment name and code
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");
  const [technicians, setTechnicians] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
  const [sparePartsRequiredMap, setSparePartsRequiredMap] = useState({}); // Track which incidents have spare parts
  const [historyModalVisible, setHistoryModalVisible] = useState(false); // Xem lịch sử thay thế
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null); // Equipment ID để xem lịch sử
  const [selectedEquipmentInfo, setSelectedEquipmentInfo] = useState(null); // Equipment info for history modal
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false); // Modal xem hình ảnh
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Index hình ảnh hiện tại
  const [lines, setLines] = useState([]); // Danh sách dây chuyền
  const [stages, setStages] = useState([]); // Danh sách công đoạn

  // Get current user from auth context to filter by department
  const { user: currentUser } = useAuth();

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
    fetchIncidents();
    fetchTechnicians();
    fetchLines();
    fetchStages();
  }, []);

  useEffect(() => {
    // Fetch incidents again when activeTab changes
    fetchIncidents();
  }, [activeTab]);

  useEffect(() => {
    handleFilter();
  }, [searchText, filterStatus, incidents, activeTab]);

  // Thêm useEffect để lắng nghe cập nhật dữ liệu real-time
  useEffect(() => {
    // Lắng nghe cập nhật dữ liệu (tự động refresh danh sách)
    const handleDataUpdate = (data) => {
      console.log("🔄 Data updated:", data);
      if (data.type === "incident") {
        console.log("Incident data updated, reloading incidents...");
        fetchIncidents(); // Tải lại dữ liệu khi có thay đổi
      }
    };

    // Đăng ký lắng nghe data updates (không lắng nghe notifications vì đã được handle ở layout)
    signalRService.onDataUpdated(handleDataUpdate);

    return () => {
      signalRService.offDataUpdated();
    };
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      let res;

      // Always fetch all incidents for tab counts and statistics
      res = await incidentService.getAll();

      // backend returns { success, data }
      const items = Array.isArray(res) ? res : res?.data || [];

      // Filter only incidents that need technical support
      let techSupportIncidents = items.filter(
        (item) => item.isTechSupport === true
      );

      // For Technical Manager: Show ALL tech support incidents from all departments
      let allIncidentsData = techSupportIncidents;
      console.log(
        `✅ Showing ${allIncidentsData.length} incidents for Technical Manager (all departments)`
      );

      // Normalize to frontend shape
      const mapped = (allIncidentsData || []).map((it) => {
        // compute downtime in minutes if possible
        let downtime = 0;
        try {
          if (it.endTime && it.startTime) {
            const start = dayjs(it.startTime);
            const end = dayjs(it.endTime);
            downtime = end.diff(start, "minute", true); // true for floating point precision
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
          imageUrls:
            it.incidentImages?.map((img) => img.imageUrl) ||
            it.IncidentImages?.map((img) => img.ImageUrl) ||
            [],
          startSlotTime:
            it.slot?.slotStartTime || it.slot?.SlotStartTime || null,
          endSlotTime: it.slot?.slotEndTime || it.slot?.SlotEndTime || null,
          isTechSupport: it.isTechSupport || false,
        };
      });

      // Always store all incidents for tab counts and statistics
      setAllIncidents(mapped);

      // Filter incidents based on active tab for display
      let displayIncidents = mapped;
      if (activeTab === "myTasks") {
        const currentUserId = currentUser?.userId || currentUser?.id;
        displayIncidents = mapped.filter((i) => {
          const assignedId = i.assignedTo || i.assignedToId;
          return assignedId && assignedId === currentUserId;
        });
      }

      setIncidents(displayIncidents);
      setFilteredIncidents(displayIncidents);

      // Check which incidents have spare parts required
      const sparePartsMap = {};
      for (const incident of mapped) {
        try {
          const hasSpareParts = await incidentService.checkHasSpareParts(
            incident.id
          );
          sparePartsMap[incident.id] = hasSpareParts;
        } catch (err) {
          console.error(
            `Error checking spare parts for incident ${incident.id}:`,
            err
          );
          sparePartsMap[incident.id] = false;
        }
      }
      setSparePartsRequiredMap(sparePartsMap);
    } catch (err) {
      console.error("Lỗi khi tải danh sách sự cố:", err);
      message.error(err?.message || "Không thể tải danh sách sự cố");
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await userService.getUsers();
      const users = Array.isArray(res) ? res : res?.data || [];

      // Store all users for name lookup
      setAllUsers(users);

      // Filter technicians (assuming role-based filtering or specific criteria)
      const techUsers = users.filter(
        (user) =>
          user.role === "Kỹ thuật viên" ||
          user.roles?.includes("Kỹ thuật viên") ||
          user.roleId === 3 // Assuming technician role ID
      );
      setTechnicians(techUsers);
    } catch (err) {
      console.error("Lỗi khi tải danh sách kỹ thuật viên:", err);
      message.error("Không thể tải danh sách kỹ thuật viên");
    }
  };

  const fetchLines = async () => {
    try {
      const res = await lineService.getActiveLines();
      const lineData = Array.isArray(res) ? res : res?.data || [];
      setLines(lineData);
    } catch (err) {
      console.error("Lỗi khi tải danh sách dây chuyền:", err);
      message.error("Không thể tải danh sách dây chuyền");
    }
  };

  const fetchStages = async () => {
    try {
      const res = await stageService.getActiveStages();
      const stageData = Array.isArray(res) ? res : res?.data || [];
      setStages(stageData);
    } catch (err) {
      console.error("Lỗi khi tải danh sách công đoạn:", err);
      message.error("Không thể tải danh sách công đoạn");
    }
  };

  const getTechnicianName = (technicianId) => {
    if (!technicianId) return null;
    const user = allUsers.find((u) => (u.userId || u.id) === technicianId);
    if (!user) return technicianId;

    const name = user.fullName || user.name || user.username;
    const code = user.employeeCode;
    return code ? `${name} (${code})` : name;
  };

  const assignTechnician = async (
    incidentId,
    technicianId,
    updateStatus = false
  ) => {
    try {
      await incidentService.assignTechnician(
        incidentId,
        technicianId,
        updateStatus
      );
      message.success(
        updateStatus
          ? "Đã phân công kỹ thuật viên và cập nhật trạng thái thành công"
          : "Đã phân công kỹ thuật viên thành công"
      );
      fetchIncidents(); // Refresh the list
      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedTechnicianId(technicianId);
      }
    } catch (err) {
      console.error("Lỗi khi phân công kỹ thuật viên:", err);
      message.error(err?.message || "Không thể phân công kỹ thuật viên");
    }
  };

  const handleUpdateAssignment = async () => {
    if (!selectedTechnicianId || !selectedIncident) {
      message.warning("Vui lòng chọn kỹ thuật viên");
      return;
    }

    await assignTechnician(selectedIncident.id, selectedTechnicianId, true);
    // Đóng modal sau khi cập nhật thành công
    setDetailModalVisible(false);
  };

  const handleFilter = () => {
    let filtered = [...incidents];

    // Filter by tab first
    if (activeTab === "pending") {
      filtered = filtered.filter(
        (inc) => inc.status === "Chờ xử lý" || inc.status === "Đang xử lý"
      );
    } else if (activeTab === "completed") {
      filtered = filtered.filter((inc) => inc.status === "Hoàn thành");
    }
    // For "myTasks" tab, data is already filtered by backend (assigned to current user)
    // So no additional filtering needed here

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

  const handleViewDetail = (record) => {
    setSelectedIncident(record);
    setSelectedTechnicianId(record.assignedTo);
    setDetailModalVisible(true);
    setCurrentImageIndex(0); // Reset image index
  };

  const handleImagePreview = (index) => {
    setCurrentImageIndex(index);
    setImagePreviewVisible(true);
  };

  const handleImageNavigation = (direction) => {
    const imageUrls = selectedIncident?.imageUrls || [];
    if (direction === "next") {
      setCurrentImageIndex((prev) =>
        prev < imageUrls.length - 1 ? prev + 1 : 0
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev > 0 ? prev - 1 : imageUrls.length - 1
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Chờ xử lý":
        return "orange";
      case "Đang xử lý":
        return "blue";
      case "Hoàn thành":
        return "green";
      case "Hủy":
        return "red";
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

  const columns = [
    {
      title: "#",
      dataIndex: "rowIndex",
      key: "rowIndex",
      width: 80,
      fixed: "left",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 500 }}>{text}</span>
          {sparePartsRequiredMap[record.id] && (
            <Tooltip title="Có yêu cầu linh kiện thay thế">
              <div style={{
                backgroundColor: "#ff4d4f",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "pulse 2s infinite",
                boxShadow: "0 0 8px rgba(255, 77, 79, 0.5)",
                border: "2px solid white"
              }}>
                <PushpinOutlined
                  style={{
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}
                />
              </div>
            </Tooltip>
          )}
        </div>
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
          title={`${text}${record.equipmentCode ? ` (${record.equipmentCode})` : ""
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
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      filters: Array.isArray(lines)
        ? lines.map((line) => ({
          text: line.lineName,
          value: line.lineName,
        }))
        : [],
      onFilter: (value, record) => record.lineName === value,
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
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
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      filters: Array.isArray(stages)
        ? stages.map((stage) => ({
          text: stage.stageName,
          value: stage.stageName,
        }))
        : [],
      onFilter: (value, record) => record.stageName === value,
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
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
          <span>{text || " "}</span>
        </Tooltip>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    // Remove the separate "Yêu cầu linh kiện" column as it's now integrated into the # column
    // {
    //   title: "Yêu cầu linh kiện",
    //   dataIndex: "id",
    //   key: "hasSpareParts",
    //   width: 120,
    //   align: "center",
    //   render: (incidentId) => {
    //     const hasSpareParts = sparePartsRequiredMap[incidentId];
    //     if (hasSpareParts === undefined) {
    //       return <span style={{ color: "#999" }}>Kiểm tra...</span>;
    //     }
    //     return hasSpareParts ? (
    //       <Tag color="red" icon={<ExclamationCircleOutlined />}>
    //         Có yêu cầu
    //       </Tag>
    //     ) : (
    //       <Tag color="default">Không</Tag>
    //     );
    //   },
    // },
    {
      title: "Ngày báo cáo",
      dataIndex: "reportDate",
      key: "reportDate",
      width: 120,
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Thời gian BD",
      dataIndex: "reportDate",
      key: "startTime",
      width: 100,
      render: (d) => (d ? dayjs(d).format("HH:mm") : "-"),
    },
    // Hide downtime column for pending/solving incidents
    ...(activeTab === "completed"
      ? [
        {
          title: "Thời lượng (phút)",
          dataIndex: "downtime",
          key: "downtime",
          width: 120,
          align: "center",
          render: (val) => (
            <span
              style={{
                color: val > 5 ? "#ff4d4f" : "#1890ff",
                fontWeight: 500,
              }}
            >
              {typeof val === "number" ? val.toFixed(2) : val}
            </span>
          ),
        },
      ]
      : []),
    {
      title: "Người đảm nhiệm",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 150,
      render: (assignedTo, record) => {
        const technicianName = getTechnicianName(assignedTo);
        return <span>{technicianName || "-"}</span>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => {
        const actionMenuItems = [
          {
            key: "view",
            label: "Xem chi tiết",
            icon: <EyeOutlined />,
            onClick: () => handleViewDetail(record),
          },
          {
            key: "replacementRequests",
            label: "Yêu cầu thay thế",
            icon: <UserAddOutlined />,
            onClick: () => {
              setSelectedIncident(record);
              setApprovalEquipmentId(record.equipmentId || record.equipmentId);
              setApprovalEquipmentInfo({
                name: record.equipmentName,
                code: record.equipmentCode,
              });
              setApprovalModalVisible(true);
            },
          },
          {
            key: "replacementHistory",
            label: "Xem lịch sử thay thế",
            icon: <EyeOutlined />,
            onClick: () => {
              setSelectedEquipmentId(record.equipmentId);
              setSelectedEquipmentInfo({
                name: record.equipmentName,
                code: record.equipmentCode,
              });
              setHistoryModalVisible(true);
            },
          },
        ];

        return (
          <Dropdown
            menu={{ items: actionMenuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button type="text" icon={<DownOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // Calculate statistics based on active tab
  const getStats = () => {
    let filteredIncidents = allIncidents;

    if (activeTab === "pending") {
      filteredIncidents = allIncidents.filter(
        (i) => i.status === "Chờ xử lý" || i.status === "Đang xử lý"
      );
    } else if (activeTab === "completed") {
      filteredIncidents = allIncidents.filter((i) => i.status === "Hoàn thành");
    } else if (activeTab === "myTasks") {
      const currentUserId = currentUser?.userId || currentUser?.id;
      filteredIncidents = allIncidents.filter((i) => {
        const assignedId = i.assignedTo || i.assignedToId;
        return assignedId && assignedId === currentUserId;
      });
    }

    return {
      total: filteredIncidents.length,
      pending: filteredIncidents.filter((i) => i.status === "Chờ xử lý").length,
      inProgress: filteredIncidents.filter((i) => i.status === "Đang xử lý")
        .length,
      completed: filteredIncidents.filter((i) => i.status === "Hoàn thành")
        .length,
      totalDowntime: filteredIncidents
        .reduce((sum, i) => sum + (i.downtime || 0), 0)
        .toFixed(2),
    };
  };

  const stats = getStats();

  // Tab items configuration
  const tabItems = [
    {
      key: "pending",
      label: (
        <span>
          <ExclamationCircleOutlined />
          Chờ xử lý (
          {
            allIncidents.filter(
              (i) => i.status === "Chờ xử lý" || i.status === "Đang xử lý"
            ).length
          }
          )
        </span>
      ),
      children: (
        <Card
          title={
            <Space>
              <WarningOutlined />
              <span>Sự cố cần hỗ trợ kỹ thuật - Chờ xử lý</span>
            </Space>
          }
          extra={
            <Button icon={<ReloadOutlined />} onClick={fetchIncidents}>
              Làm mới
            </Button>
          }
          variant="borderless"
        >
          {/* Filters */}
          <div style={{ marginBottom: 16 }}>
            <Space size="middle" wrap>
              <Input
                placeholder="Tìm kiếm mã, tiêu đề, thiết bị..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
              {/* <Select
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
              showTotal: (total) => `Tổng ${total} sự cố chờ xử lý`,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="Không có sự cố nào chờ xử lý"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        </Card>
      ),
    },
    {
      key: "completed",
      label: (
        <span>
          <CheckCircleOutlined />
          Hoàn thành (
          {allIncidents.filter((i) => i.status === "Hoàn thành").length})
        </span>
      ),
      children: (
        <Card
          title={
            <Space>
              <CheckCircleOutlined />
              <span>Sự cố cần hỗ trợ kỹ thuật - Hoàn thành</span>
            </Space>
          }
          extra={
            <Button icon={<ReloadOutlined />} onClick={fetchIncidents}>
              Làm mới
            </Button>
          }
          variant="borderless"
        >
          {/* Filters */}
          <div style={{ marginBottom: 16 }}>
            <Space size="middle" wrap>
              <Input
                placeholder="Tìm kiếm mã, tiêu đề, thiết bị..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
              {/* <Select
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
              showTotal: (total) => `Tổng ${total} sự cố hoàn thành`,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="Không có sự cố nào đã hoàn thành"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        </Card>
      ),
    },
    // {
    //   key: "myTasks",
    //   label: (
    //     <span>
    //       <UserAddOutlined />
    //       Nhiệm vụ của tôi (
    //       {
    //         allIncidents.filter((i) => {
    //           const currentUserId = currentUser?.userId || currentUser?.id;
    //           const assignedId = i.assignedTo || i.assignedToId;
    //           return assignedId && assignedId === currentUserId;
    //         }).length
    //       }
    //       )
    //     </span>
    //   ),
    //   children: (
    //     <Card
    //       title={
    //         <Space>
    //           <UserAddOutlined />
    //           <span>Sự cố được phân công cho tôi</span>
    //         </Space>
    //       }
    //       extra={
    //         <Button icon={<ReloadOutlined />} onClick={fetchIncidents}>
    //           Làm mới
    //         </Button>
    //       }
    //       variant="borderless"
    //     >
    //       {/* Filters */}
    //       <div style={{ marginBottom: 16 }}>
    //         <Space size="middle" wrap>
    //           <Input
    //             placeholder="Tìm kiếm mã, tiêu đề, thiết bị..."
    //             prefix={<SearchOutlined />}
    //             value={searchText}
    //             onChange={(e) => setSearchText(e.target.value)}
    //             style={{ width: 300 }}
    //             allowClear
    //           />
    //           <Select
    //             value={filterStatus}
    //             onChange={setFilterStatus}
    //             style={{ width: 150 }}
    //             placeholder="Trạng thái"
    //           >
    //             <Option value="all">Tất cả</Option>
    //             <Option value="Chờ xử lý">Chờ xử lý</Option>
    //             <Option value="Đang xử lý">Đang xử lý</Option>
    //             <Option value="Hoàn thành">Hoàn thành</Option>
    //             <Option value="Hủy">Hủy</Option>
    //           </Select>
    //         </Space>
    //       </div>

    //       {/* Table */}
    //       <Table
    //         columns={columns}
    //         dataSource={filteredIncidents}
    //         rowKey="id"
    //         loading={loading}
    //         scroll={{ x: "max-content" }}
    //         pagination={{
    //           pageSize: 10,
    //           showSizeChanger: true,
    //           showTotal: (total) => `Tổng ${total} nhiệm vụ của tôi`,
    //         }}
    //         locale={{
    //           emptyText: (
    //             <Empty
    //               description="Không có nhiệm vụ nào được phân công cho bạn"
    //               image={Empty.PRESENTED_IMAGE_SIMPLE}
    //             />
    //           ),
    //         }}
    //       />
    //     </Card>
    //   ),
    // },
  ];

  return (
    <div>
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

      {/* Replacement approvals modal */}
      <ReplacementApprovalModal
        equipmentId={approvalEquipmentId}
        equipmentInfo={approvalEquipmentInfo}
        open={approvalModalVisible}
        onClose={() => {
          setApprovalModalVisible(false);
          setApprovalEquipmentId(null);
          setApprovalEquipmentInfo(null);
        }}
        onUpdated={() => fetchIncidents()}
      />

      {/* Replacement History Modal */}
      <ReplacementApprovalModal
        equipmentId={selectedEquipmentId}
        equipmentInfo={selectedEquipmentInfo}
        open={historyModalVisible}
        onClose={() => {
          setHistoryModalVisible(false);
          setSelectedEquipmentId(null);
          setSelectedEquipmentInfo(null);
        }}
        onUpdated={fetchIncidents}
        viewMode={true}
      />
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless">
            <Statistic
              title={
                activeTab === "pending"
                  ? "Tổng sự cố chờ xử lý"
                  : activeTab === "completed"
                    ? "Tổng sự cố hoàn thành"
                    : "Tổng nhiệm vụ của tôi"
              }
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

      {/* Tabs for Pending vs Completed */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ marginBottom: 16 }}
        items={tabItems}
      />

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Chi tiết sự cố cần hỗ trợ kỹ thuật</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setDetailModalVisible(false)}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
          selectedIncident && selectedIncident.status !== "Hoàn thành" && (
            <Button
              key="update"
              type="primary"
              onClick={handleUpdateAssignment}
              style={{
                backgroundColor: "#334766",
                borderColor: "#334766",
                height: "40px",
                fontSize: "16px",
                minWidth: "120px",
              }}
            >
              Cập nhật
            </Button>
          ),
        ]}
        width={1200}
        style={{ top: 20 }}
      >
        {selectedIncident && (
          <div>
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
                      <Tag
                        icon={<WarningOutlined />}
                        color="orange"
                        style={{
                          fontSize: "14px",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontWeight: 600,
                        }}
                      >
                        Cần hỗ trợ kỹ thuật
                      </Tag>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Equipment & Process Information */}
              <Col span={24}>
                <Card
                  size="small"
                  title="Thông tin thiết bị & quy trình"
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
                        {selectedIncident.reporter || "-"}
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
                  </Row>
                </Card>
              </Col>

              {/* Time Information */}
              <Col span={24}>
                <Card
                  size="small"
                  title="Thông tin thời gian"
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

              {/* Assignment Information */}
              <Col span={24}>
                <Card
                  size="small"
                  title="Thông tin phân công"
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
                        Người đảm nhiệm
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 500 }}>
                        {getTechnicianName(selectedIncident.assignedTo) ||
                          "Chưa phân công"}
                      </div>
                    </Col>
                    {selectedIncident.status !== "Hoàn thành" && (
                      <>
                        <Col span={24}>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#666",
                              marginBottom: "6px",
                              fontWeight: 600,
                            }}
                          >
                            Chọn kỹ thuật viên
                          </div>
                          <Select
                            placeholder="Chọn kỹ thuật viên để phân công"
                            style={{ width: "100%" }}
                            value={selectedTechnicianId}
                            onChange={setSelectedTechnicianId}
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                              (option?.children ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                          >
                            {technicians.map((tech) => (
                              <Option
                                key={tech.userId || tech.id}
                                value={tech.userId || tech.id}
                              >
                                {tech.fullName || tech.name || tech.username}
                                {tech.employeeCode
                                  ? ` (${tech.employeeCode})`
                                  : ""}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                        <Col span={24}>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#999",
                              fontStyle: "italic",
                            }}
                          >
                            * Chọn kỹ thuật viên và nhấn "Cập nhật" để phân công
                            và chuyển trạng thái thành "Đang xử lý"
                          </div>
                        </Col>
                      </>
                    )}
                  </Row>
                </Card>
              </Col>

              {/* Incident Details */}
              <Col span={24}>
                <Card size="small" title="Chi tiết sự cố" variant="outlined">
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
                  </Row>
                </Card>
              </Col>

              {/* Incident Images */}
              {selectedIncident.imageUrls && selectedIncident.imageUrls.length > 0 && (
                <Col span={24}>
                  <Card
                    size="small"
                    title={
                      <Space>
                        <PictureOutlined />
                        <span>Hình ảnh sự cố ({selectedIncident.imageUrls.length} ảnh)</span>
                      </Space>
                    }
                    variant="outlined"
                  >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                      {selectedIncident.imageUrls.map((imageUrl, index) => (
                        <div
                          key={index}
                          style={{
                            position: "relative",
                            cursor: "pointer",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "2px solid #f0f0f0",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#1890ff";
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#f0f0f0";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                          onClick={() => handleImagePreview(index)}
                        >
                          <Image
                            src={imageUrl}
                            alt={`Hình ảnh sự cố ${index + 1}`}
                            width={120}
                            height={120}
                            style={{
                              objectFit: "cover",
                              borderRadius: "6px"
                            }}
                            preview={false}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1xkE8O+ePLf3AAAAAElFTkSuQmCC"
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: "4px",
                              right: "4px",
                              backgroundColor: "rgba(0, 0, 0, 0.6)",
                              color: "white",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: 500,
                            }}
                          >
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "12px",
                        color: "#999",
                        fontStyle: "italic"
                      }}
                    >
                      * Nhấp vào ảnh để xem chi tiết với chế độ xem toàn màn hình
                    </div>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        title={
          <Space>
            <PictureOutlined />
            <span>
              Hình ảnh sự cố - {currentImageIndex + 1}/{selectedIncident?.imageUrls?.length || 0}
            </span>
          </Space>
        }
        open={imagePreviewVisible}
        onCancel={() => setImagePreviewVisible(false)}
        width="90vw"
        style={{ top: 20 }}
        footer={[
          // <Button 
          //   key="prev" 
          //   icon={<LeftOutlined />} 
          //   onClick={() => handleImageNavigation("prev")}
          //   disabled={!selectedIncident?.imageUrls?.length || selectedIncident.imageUrls.length <= 1}
          // >
          //   Ảnh trước
          // </Button>,
          // <Button 
          //   key="next" 
          //   type="primary" 
          //   icon={<RightOutlined />} 
          //   onClick={() => handleImageNavigation("next")}
          //   disabled={!selectedIncident?.imageUrls?.length || selectedIncident.imageUrls.length <= 1}
          //   style={{ backgroundColor: "#334766", borderColor: "#334766" }}
          // >
          //   Ảnh tiếp theo
          // </Button>,
          <Button
            key="close"
            onClick={() => setImagePreviewVisible(false)}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
        ]}
      >
        {selectedIncident?.imageUrls?.length > 0 && (
          <div style={{ textAlign: "center" }}>
            <Image
              src={selectedIncident.imageUrls[currentImageIndex]}
              alt={`Hình ảnh sự cố ${currentImageIndex + 1}`}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain"
              }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1xkE8O+ePLf3AAAAAElFTkSuQmCC"
            />

            {/* Image thumbnails navigation */}
            {selectedIncident.imageUrls.length > 1 && (
              <div style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                flexWrap: "wrap"
              }}>
                {selectedIncident.imageUrls.map((imageUrl, index) => (
                  <div
                    key={index}
                    style={{
                      cursor: "pointer",
                      border: index === currentImageIndex ? "3px solid #1890ff" : "2px solid #f0f0f0",
                      borderRadius: "6px",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={imageUrl}
                      alt={`Thumbnail ${index + 1}`}
                      width={60}
                      height={60}
                      style={{
                        objectFit: "cover"
                      }}
                      preview={false}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1xkE8O+ePLf3AAAAAElFTkSuQmCC"
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{
              marginTop: "16px",
              fontSize: "14px",
              color: "#666",
              fontStyle: "italic"
            }}>
              Sử dụng nút "Ảnh trước" và "Ảnh tiếp theo" hoặc nhấp vào ảnh nhỏ bên dưới để điều hướng
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IncidentList;
