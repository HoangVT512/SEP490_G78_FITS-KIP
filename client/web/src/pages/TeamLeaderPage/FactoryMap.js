import React, { useState, useEffect, useCallback } from "react";
import { Modal, Spin, message, Tag, Tooltip } from "antd";
import {
  ReloadOutlined,
  WarningOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import "../../styles/pages/FactoryMap.css";

// Mock data for demonstration
const mockFactoryData = {
  departments: [
    {
      departmentId: 1,
      departmentName: "Phòng Sản xuất",
      description: "Phòng chịu trách nhiệm sản xuất các sản phẩm điện dân dụng",
      lines: [
        {
          lineId: 1,
          lineName: "Dây chuyền sản xuất 1",
          stages: [
            {
              stageId: 1,
              stageName: "Chuẩn bị nguyên liệu",
              equipment: [
                {
                  equipmentId: 1,
                  equipmentCode: "CB001_001",
                  equipmentName: "Máy cắt nguyên liệu",
                  activeIncidents: [
                    {
                      incidentId: 1,
                      issue: "Máy dừng hoạt động đột ngột",
                      startTime: "2025-10-22T08:30:00",
                      status: "Pending",
                      isTechSupport: true,
                      typeName: "Dừng dài",
                    },
                  ],
                  maintenancePlans: [],
                },
                {
                  equipmentId: 2,
                  equipmentCode: "CB001_002",
                  equipmentName: "Máy phân loại",
                  activeIncidents: [],
                  maintenancePlans: [
                    {
                      planId: 1,
                      nextDueDate: "2025-10-20",
                      intervalType: "Monthly",
                      isOverdue: true,
                    },
                  ],
                },
              ],
            },
            {
              stageId: 2,
              stageName: "Gia công",
              equipment: [
                {
                  equipmentId: 3,
                  equipmentCode: "GC002_001",
                  equipmentName: "Máy phay CNC",
                  activeIncidents: [],
                  maintenancePlans: [],
                },
                {
                  equipmentId: 4,
                  equipmentCode: "GC002_002",
                  equipmentName: "Máy tiện",
                  activeIncidents: [],
                  maintenancePlans: [],
                },
              ],
            },
            {
              stageId: 3,
              stageName: "Lắp ráp",
              equipment: [
                {
                  equipmentId: 5,
                  equipmentCode: "LR003_001",
                  equipmentName: "Máy lắp ráp tự động",
                  activeIncidents: [],
                  maintenancePlans: [],
                },
              ],
            },
          ],
        },
        {
          lineId: 2,
          lineName: "Dây chuyền sản xuất 2",
          stages: [
            {
              stageId: 4,
              stageName: "Chuẩn bị nguyên liệu",
              equipment: [
                {
                  equipmentId: 6,
                  equipmentCode: "CB004_001",
                  equipmentName: "Máy cắt nguyên liệu",
                  activeIncidents: [
                    {
                      incidentId: 2,
                      issue: "Lỗi cảm biến",
                      startTime: "2025-10-22T10:15:00",
                      status: "InProgress",
                      isTechSupport: false,
                      typeName: "Dừng ngắn",
                    },
                  ],
                  maintenancePlans: [],
                },
              ],
            },
            {
              stageId: 5,
              stageName: "Gia công",
              equipment: [
                {
                  equipmentId: 7,
                  equipmentCode: "GC005_001",
                  equipmentName: "Máy phay CNC",
                  activeIncidents: [],
                  maintenancePlans: [],
                },
              ],
            },
          ],
        },
        {
          lineId: 3,
          lineName: "Dây chuyền đóng gói",
          stages: [
            {
              stageId: 6,
              stageName: "Kiểm tra sản phẩm",
              equipment: [
                {
                  equipmentId: 8,
                  equipmentCode: "KT006_001",
                  equipmentName: "Máy kiểm tra chất lượng",
                  activeIncidents: [],
                  maintenancePlans: [],
                },
              ],
            },
            {
              stageId: 7,
              stageName: "Đóng gói",
              equipment: [
                {
                  equipmentId: 9,
                  equipmentCode: "DG007_001",
                  equipmentName: "Máy đóng gói tự động",
                  activeIncidents: [],
                  maintenancePlans: [],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      departmentId: 2,
      departmentName: "Phòng Kỹ thuật",
      description: "Phòng chịu trách nhiệm về kỹ thuật và công nghệ sản xuất",
      lines: [
        {
          lineId: 4,
          lineName: "Dây chuyền bảo trì",
          stages: [
            {
              stageId: 8,
              stageName: "Kiểm tra thiết bị",
              equipment: [
                {
                  equipmentId: 10,
                  equipmentCode: "KT008_001",
                  equipmentName: "Máy đo kiểm",
                  activeIncidents: [],
                  maintenancePlans: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  statistics: {
    totalDepartments: 2,
    totalLines: 4,
    totalStages: 8,
    totalEquipment: 10,
    equipmentWithIncidents: 2,
    equipmentNeedingMaintenance: 1,
  },
  timestamp: new Date().toISOString(),
};

const mockEquipmentDetails = {
  1: {
    equipmentId: 1,
    equipmentCode: "CB001_001",
    equipmentName: "Máy cắt nguyên liệu",
    origin: "Nhật Bản",
    yom: 2020,
    dateUse: "2022-01-15",
    stageName: "Chuẩn bị nguyên liệu",
    lineName: "Dây chuyền sản xuất 1",
    departmentName: "Phòng Sản xuất",
    activeIncidents: [
      {
        incidentId: 1,
        issue: "Máy dừng hoạt động đột ngột",
        startTime: "2025-10-22T08:30:00",
        status: "Pending",
        isTechSupport: true,
        typeName: "Dừng dài",
        duration: 120,
      },
    ],
    maintenancePlans: [],
  },
  2: {
    equipmentId: 2,
    equipmentCode: "CB001_002",
    equipmentName: "Máy phân loại",
    origin: "Hàn Quốc",
    yom: 2021,
    dateUse: "2022-06-20",
    stageName: "Chuẩn bị nguyên liệu",
    lineName: "Dây chuyền sản xuất 1",
    departmentName: "Phòng Sản xuất",
    activeIncidents: [],
    maintenancePlans: [
      {
        planId: 1,
        nextDueDate: "2025-10-20",
        intervalType: "Monthly",
        intervalValue: 1,
        isOverdue: true,
      },
    ],
  },
};

const FactoryMap = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [factoryData, setFactoryData] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipmentDetailVisible, setEquipmentDetailVisible] = useState(false);

  const fetchFactoryData = useCallback(async () => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setFactoryData(mockFactoryData);
    } catch (error) {
      console.error("Error fetching factory data:", error);
      message.error("Không thể tải dữ liệu nhà máy");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFactoryData();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchFactoryData, 30000);
    return () => clearInterval(interval);
  }, [fetchFactoryData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFactoryData();
  };

  const fetchEquipmentDetail = async (equipmentId) => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      const detail = mockEquipmentDetails[equipmentId] || {
        equipmentId,
        equipmentCode: `EQ${equipmentId}`,
        equipmentName: "Thiết bị mẫu",
        origin: "N/A",
        yom: null,
        dateUse: null,
        stageName: "N/A",
        lineName: "N/A",
        departmentName: "N/A",
        activeIncidents: [],
        maintenancePlans: [],
      };
      setSelectedEquipment(detail);
      setEquipmentDetailVisible(true);
    } catch (error) {
      console.error("Error fetching equipment detail:", error);
      message.error("Không thể tải chi tiết thiết bị");
    }
  };

  const getEquipmentStatus = (equipment) => {
    if (equipment.activeIncidents && equipment.activeIncidents.length > 0) {
      return "incident";
    }
    if (
      equipment.maintenancePlans &&
      equipment.maintenancePlans.some((m) => m.isOverdue)
    ) {
      return "maintenance";
    }
    return "normal";
  };

  const getLineStatus = (line) => {
    const hasIncident = line.stages.some((stage) =>
      stage.equipment.some(
        (eq) => eq.activeIncidents && eq.activeIncidents.length > 0
      )
    );
    const hasMaintenance = line.stages.some((stage) =>
      stage.equipment.some(
        (eq) =>
          eq.maintenancePlans && eq.maintenancePlans.some((m) => m.isOverdue)
      )
    );

    if (hasIncident) return "has-incident";
    if (hasMaintenance) return "has-maintenance";
    return "normal";
  };

  const renderEquipmentDetail = () => {
    if (!selectedEquipment) return null;

    return (
      <Modal
        title={
          <div>
            <div style={{ fontWeight: 600, fontSize: "18px" }}>
              {selectedEquipment.equipmentName}
            </div>
            <div
              style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}
            >
              Mã: {selectedEquipment.equipmentCode}
            </div>
          </div>
        }
        visible={equipmentDetailVisible}
        onCancel={() => setEquipmentDetailVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ padding: "8px 0" }}>
          <div style={{ marginBottom: "16px" }}>
            <h4 style={{ marginBottom: "8px", color: "#374151" }}>
              Thông tin thiết bị
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                fontSize: "14px",
              }}
            >
              <div>
                <strong>Công đoạn:</strong> {selectedEquipment.stageName}
              </div>
              <div>
                <strong>Dây chuyền:</strong> {selectedEquipment.lineName}
              </div>
              <div>
                <strong>Phòng ban:</strong> {selectedEquipment.departmentName}
              </div>
              <div>
                <strong>Xuất xứ:</strong> {selectedEquipment.origin || "N/A"}
              </div>
              <div>
                <strong>Năm sản xuất:</strong> {selectedEquipment.yom || "N/A"}
              </div>
              <div>
                <strong>Ngày đưa vào sử dụng:</strong>{" "}
                {selectedEquipment.dateUse || "N/A"}
              </div>
            </div>
          </div>

          {selectedEquipment.activeIncidents &&
            selectedEquipment.activeIncidents.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ marginBottom: "8px", color: "#ef4444" }}>
                  <WarningOutlined /> Sự cố đang xảy ra (
                  {selectedEquipment.activeIncidents.length})
                </h4>
                {selectedEquipment.activeIncidents.map((incident, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#fef2f2",
                      padding: "12px",
                      borderRadius: "6px",
                      marginBottom: "8px",
                      borderLeft: "4px solid #ef4444",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <strong>{incident.typeName || "Sự cố"}</strong>
                      <Tag
                        color={
                          incident.status === "Pending" ? "orange" : "blue"
                        }
                      >
                        {incident.status === "Pending"
                          ? "Chờ xử lý"
                          : "Đang xử lý"}
                      </Tag>
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      {incident.issue}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                        marginTop: "4px",
                      }}
                    >
                      Bắt đầu:{" "}
                      {new Date(incident.startTime).toLocaleString("vi-VN")}
                    </div>
                    {incident.isTechSupport && (
                      <Tag color="purple" style={{ marginTop: "4px" }}>
                        Cần hỗ trợ kỹ thuật
                      </Tag>
                    )}
                  </div>
                ))}
              </div>
            )}

          {selectedEquipment.maintenancePlans &&
            selectedEquipment.maintenancePlans.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ marginBottom: "8px", color: "#f59e0b" }}>
                  <ToolOutlined /> Kế hoạch bảo trì
                </h4>
                {selectedEquipment.maintenancePlans.map((plan, index) => (
                  <div
                    key={index}
                    style={{
                      background: plan.isOverdue ? "#fffbeb" : "#f0fdf4",
                      padding: "12px",
                      borderRadius: "6px",
                      marginBottom: "8px",
                      borderLeft: `4px solid ${
                        plan.isOverdue ? "#f59e0b" : "#10b981"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {plan.intervalType} - {plan.intervalValue}{" "}
                          {plan.intervalType === "Daily"
                            ? "ngày"
                            : plan.intervalType === "Weekly"
                            ? "tuần"
                            : "tháng"}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#6b7280",
                            marginTop: "4px",
                          }}
                        >
                          Ngày đến hạn: {plan.nextDueDate}
                        </div>
                      </div>
                      {plan.isOverdue && <Tag color="orange">Quá hạn</Tag>}
                    </div>
                  </div>
                ))}
              </div>
            )}

          {(!selectedEquipment.activeIncidents ||
            selectedEquipment.activeIncidents.length === 0) &&
            (!selectedEquipment.maintenancePlans ||
              selectedEquipment.maintenancePlans.length === 0) && (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px",
                  color: "#6b7280",
                }}
              >
                <CheckCircleOutlined
                  style={{
                    fontSize: "48px",
                    color: "#10b981",
                    marginBottom: "8px",
                  }}
                />
                <div>Thiết bị đang hoạt động bình thường</div>
              </div>
            )}
        </div>
      </Modal>
    );
  };

  if (loading) {
    return (
      <div
        className="factory-map-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu nhà máy..." />
      </div>
    );
  }

  if (!factoryData) {
    return (
      <div className="factory-map-container">
        <div className="empty-state">
          <div className="empty-state-icon">🏭</div>
          <div className="empty-state-text">Không có dữ liệu nhà máy</div>
        </div>
      </div>
    );
  }

  return (
    <div className="factory-map-container">
      <div className="factory-map-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
              Sơ đồ Nhà máy
            </h2>
            <p style={{ margin: "4px 0 0 0", color: "#6b7280" }}>
              Cập nhật lúc:{" "}
              {new Date(factoryData.timestamp).toLocaleString("vi-VN")}
            </p>
          </div>
          <button
            className={`refresh-button ${refreshing ? "refreshing" : ""}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <ReloadOutlined className={refreshing ? "refresh-icon" : ""} />
            {refreshing ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        <div className="factory-stats">
          <div className="stat-card total">
            <div className="stat-value">
              {factoryData.statistics.totalEquipment}
            </div>
            <div className="stat-label">Tổng thiết bị</div>
          </div>
          <div className="stat-card running">
            <div className="stat-value">
              {factoryData.statistics.totalEquipment -
                factoryData.statistics.equipmentWithIncidents}
            </div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
          <div className="stat-card incident">
            <div className="stat-value">
              {factoryData.statistics.equipmentWithIncidents}
            </div>
            <div className="stat-label">Có sự cố</div>
          </div>
          <div className="stat-card maintenance">
            <div className="stat-value">
              {factoryData.statistics.equipmentNeedingMaintenance}
            </div>
            <div className="stat-label">Cần bảo trì</div>
          </div>
        </div>
      </div>

      <div className="departments-grid">
        {factoryData.departments.map((department) => (
          <div key={department.departmentId} className="department-card">
            <div className="department-header">
              <div className="department-title">
                {department.departmentName}
              </div>
              <Tag color="blue">{department.lines.length} dây chuyền</Tag>
            </div>

            <div className="lines-container">
              {department.lines.map((line) => {
                const lineStatus = getLineStatus(line);
                const equipmentCount = line.stages.reduce(
                  (sum, stage) => sum + stage.equipment.length,
                  0
                );
                const incidentCount = line.stages.reduce(
                  (sum, stage) =>
                    sum +
                    stage.equipment.filter(
                      (eq) =>
                        eq.activeIncidents && eq.activeIncidents.length > 0
                    ).length,
                  0
                );

                return (
                  <div key={line.lineId} className={`line-item ${lineStatus}`}>
                    <div className="line-header">
                      <div className="line-name">{line.lineName}</div>
                      <div className="line-status">
                        {lineStatus === "has-incident" && (
                          <Tooltip title={`${incidentCount} thiết bị có sự cố`}>
                            <span className="status-badge incident">
                              <span className="status-dot red"></span>
                              {incidentCount} sự cố
                            </span>
                          </Tooltip>
                        )}
                        {lineStatus === "has-maintenance" && (
                          <span className="status-badge maintenance">
                            <span className="status-dot orange"></span>
                            Cần bảo trì
                          </span>
                        )}
                        {lineStatus === "normal" && (
                          <span className="status-badge running">
                            <span className="status-dot green"></span>
                            Hoạt động tốt
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="equipment-list">
                      {line.stages.map((stage) =>
                        stage.equipment.map((equipment) => {
                          const eqStatus = getEquipmentStatus(equipment);
                          return (
                            <Tooltip
                              key={equipment.equipmentId}
                              title="Click để xem chi tiết"
                              placement="top"
                            >
                              <div
                                className={`equipment-card ${eqStatus}`}
                                onClick={() =>
                                  fetchEquipmentDetail(equipment.equipmentId)
                                }
                              >
                                <div className="equipment-code">
                                  {equipment.equipmentCode}
                                </div>
                                <div className="equipment-name">
                                  {equipment.equipmentName}
                                </div>
                                <div className="equipment-status">
                                  {equipment.activeIncidents &&
                                    equipment.activeIncidents.length > 0 && (
                                      <span className="equipment-status-tag incident">
                                        {equipment.activeIncidents.length} sự cố
                                      </span>
                                    )}
                                  {equipment.maintenancePlans &&
                                    equipment.maintenancePlans.some(
                                      (m) => m.isOverdue
                                    ) && (
                                      <span className="equipment-status-tag maintenance">
                                        Bảo trì
                                      </span>
                                    )}
                                </div>
                              </div>
                            </Tooltip>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="factory-legend">
        <div className="legend-title">Chú thích:</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color running"></div>
            <span>Hoạt động bình thường</span>
          </div>
          <div className="legend-item">
            <div className="legend-color incident"></div>
            <span>Có sự cố</span>
          </div>
          <div className="legend-item">
            <div className="legend-color maintenance"></div>
            <span>Cần bảo trì</span>
          </div>
          <div className="legend-item">
            <InfoCircleOutlined
              style={{ color: "#667eea", fontSize: "18px" }}
            />
            <span>Click vào thiết bị để xem chi tiết</span>
          </div>
        </div>
      </div>

      {renderEquipmentDetail()}
    </div>
  );
};

export default FactoryMap;
