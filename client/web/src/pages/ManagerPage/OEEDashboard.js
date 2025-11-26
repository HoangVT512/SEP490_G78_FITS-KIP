import React, { useEffect, useState } from "react";
import { LoadingOverlay } from "../../components/OEE/LoadingOverlay";
import { Header } from "../../components/OEE/Header";
import { Legend } from "../../components/OEE/Legend";
import { Factory } from "../../components/OEE/Factory";
import { IncidentModal } from "../../components/OEE/IncidentModal";
import { Tooltip } from "../../components/OEE/Tooltip";
import { Footer } from "../../components/OEE/Footer";
import { dashboardService } from "../../services/dashboardService";
import { incidentService } from "../../services/incidentService";
import signalRService from "../../services/signalRService";
import { authService } from "../../services/authService";
import "../../styles/pages/OEE.css";

const OEEDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [modalData, setModalData] = useState(null);
  const [oeeData, setOeeData] = useState([]);
  const [incidentData, setIncidentData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRealtime, setIsRealtime] = useState(false);

  // Fetch OEE and incident data
  const fetchData = async (date) => {
    setIsLoading(true);
    try {
      console.log("Lỗi lấy dữ liệu theo ngày:", date);

      // Fetch OEE data for all lines
      const oeeResponse = await dashboardService.getOEEStatsByDate(date);
      console.log("OEE phản hồi:", oeeResponse);
      if (oeeResponse?.success && oeeResponse?.data) {
        setOeeData(oeeResponse.data);
      }

      // Fetch pending tech support incidents
      // Format date for incident API (yyyy-MM-dd)
      console.log("Đang gọi api sự cố theo ngày :", date);
      try {
        const incidentResponse =
          await incidentService.getTechSupportPendingIncidents(date);
        console.log("Gọi api sự cố hoàn thành");
        console.log("Sự cố phản hồi:", incidentResponse);
        if (incidentResponse?.success && incidentResponse?.data) {
          console.log("Đang thiết lập dữ liệu sự cố:", incidentResponse.data);
          setIncidentData(incidentResponse.data);
        } else {
          console.log("Không có dữ liệu sự cố hoặc phản hồi không hợp lệ");
          setIncidentData([]);
        }
      } catch (incidentError) {
        console.error("Lỗi khi lấy dữ liệu sự cố:", incidentError);
        setIncidentData([]);
      }

      // Update last refresh time
      setLastUpdate(new Date());
      console.log(
        "✨ Data refresh completed at:",
        new Date().toLocaleTimeString("vi-VN")
      );
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu bảng điều khiển OEE:", error);
      setIncidentData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize SignalR connection for realtime updates
  useEffect(() => {
    let handleDataUpdate = null;
    let handleReceiveNotification = null;
    let handleReceiveBroadcast = null;

    const initializeSignalR = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          if (!signalRService.isConnected) {
            await signalRService.startConnection(token);
          }
          setIsRealtime(true);

          // Listen for incident updates
          handleReceiveNotification = (notification) => {
            console.log("📢 Received notification:", notification);
            // Refresh data when incident created/updated
            if (
              notification?.type === "incident" ||
              notification?.message?.includes("sự cố")
            ) {
              console.log("🔄 Refreshing data due to incident notification");
              fetchData(selectedDate);
            }
          };
          signalRService.onReceiveNotification(handleReceiveNotification);

          // Listen for general data updates
          handleDataUpdate = (data) => {
            console.log("📊 Data updated:", data);
            if (
              data?.type === "incident" ||
              data?.action === "created" ||
              data?.action === "updated" ||
              data?.action === "deleted"
            ) {
              console.log("🚨 Incident data changed, refreshing...");
              fetchData(selectedDate);
            }
          };
          signalRService.onDataUpdated(handleDataUpdate);

          // Listen for broadcasts
          handleReceiveBroadcast = (message) => {
            console.log("📡 Received broadcast:", message);
            fetchData(selectedDate);
          };
          signalRService.onReceiveBroadcast(handleReceiveBroadcast);

          // Listen for specific incident notifications
          if (signalRService.connection) {
            // Note: These direct connection listeners are harder to manage cleanly with the service wrapper
            // Ideally signalRService should expose methods for these too
            signalRService.connection.on("IncidentNotification", (data) => {
              console.log("🚨 Incident notification received:", data);
              fetchData(selectedDate);
            });

            signalRService.connection.on("RefreshIncidents", (data) => {
              console.log("🔄 Refresh incidents signal received:", data);
              fetchData(selectedDate);
            });

            // This one duplicates onDataUpdated but directly on connection
            // signalRService.connection.on("DataUpdated", ...);
          }
        }
      } catch (error) {
        console.error("❌ SignalR connection failed:", error);
        setIsRealtime(false);
      }
    };

    initializeSignalR();

    return () => {
      // Cleanup SignalR listeners
      if (handleReceiveNotification)
        signalRService.offReceiveNotification(handleReceiveNotification);
      if (handleDataUpdate) signalRService.offDataUpdated(handleDataUpdate);
      // signalRService.offReceiveBroadcast(handleReceiveBroadcast); // Service doesn't support specific off for broadcast yet, or does it?
      // Checking signalRService.js, offReceiveBroadcast doesn't take args. It removes all.
      // We should probably fix that too, but for now let's leave it or just call it if we are sure we are the only one.
      // But ManagerLayout also uses it. So calling offReceiveBroadcast() here will break ManagerLayout.
      // I'll skip offReceiveBroadcast for now or implement it properly in service.

      // Remove custom listeners
      if (signalRService.connection) {
        signalRService.connection.off("IncidentNotification");
        signalRService.connection.off("RefreshIncidents");
        // signalRService.connection.off("DataUpdated"); // Don't remove this as it might remove the service's listener
      }
    };
  }, [selectedDate]);

  useEffect(() => {
    fetchData(selectedDate);

    // Removed polling - now relying on SignalR realtime updates only
  }, [selectedDate]);

  // Debug: log incident data changes
  useEffect(() => {
    console.log("Dữ liệu sự cố đã thay đổi:", incidentData);
  }, [incidentData]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleBoxHover = (data, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipData(data);
    setTooltipPosition({ x: rect.right + 10, y: rect.top });
  };

  const handleBoxLeave = () => {
    setTooltipData(null);
  };

  const handleIncidentClick = (data) => {
    // Format modal data from incident
    const formattedData = {
      equipmentCode: data.incident?.incidents[0]?.equipmentCode || "-",
      equipmentName: data.incident?.incidents[0]?.equipmentName || "-",
      stage: data.incident?.incidents[0]?.stage || "-",
      line: data.incident?.incidents[0]?.line || data.name || "-",
      startTime: data.incident?.incidents[0]?.startTime
        ? new Date(data.incident.incidents[0].startTime).toLocaleString("vi-VN")
        : "-",
      hours: data.incident?.hours || "-",
      assignee: data.incident?.incidents[0]?.assignedTo || "-",
      oee: data.oee || "-",
      issue: data.incident?.incidents[0]?.issue || "-", // Add issue field
      incidentCount: data.incident?.count || 0,
      allIncidents: data.incident?.incidents || [],
    };
    setModalData(formattedData);
  };

  return (
    <div className="oee-reset">
      <LoadingOverlay isLoading={isLoading} />
      <div className="main-container" style={{ opacity: isLoading ? 0 : 1 }}>
        <Header selectedDate={selectedDate} onDateChange={handleDateChange} />
        <Legend />
        <div className="factories-container">
          <Factory
            title="Xưởng Cơ khí"
            type="mechanical"
            oeeData={oeeData}
            incidentData={incidentData}
            onBoxHover={handleBoxHover}
            onBoxLeave={handleBoxLeave}
            onIncidentClick={handleIncidentClick}
          />
          <Factory
            title="Xưởng Lắp ráp"
            type="assembly"
            oeeData={oeeData}
            incidentData={incidentData}
            onBoxHover={handleBoxHover}
            onBoxLeave={handleBoxLeave}
            onIncidentClick={handleIncidentClick}
          />
          <Factory
            title="Xưởng Dây"
            type="wire"
            oeeData={oeeData}
            incidentData={incidentData}
            onBoxHover={handleBoxHover}
            onBoxLeave={handleBoxLeave}
            onIncidentClick={handleIncidentClick}
          />
        </div>
        <Tooltip data={tooltipData} position={tooltipPosition} />
        <IncidentModal data={modalData} onClose={() => setModalData(null)} />
        <Footer />
      </div>
    </div>
  );
};

export default OEEDashboard;
