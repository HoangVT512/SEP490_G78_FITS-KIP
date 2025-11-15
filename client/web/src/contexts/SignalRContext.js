import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import * as signalR from "@microsoft/signalr";
import { message } from "antd";
import { useAuth } from "./AuthContext";

const SignalRContext = createContext(null);

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR must be used within a SignalRProvider");
  }
  return context;
};

export const SignalRProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const listenersRef = useRef(new Map());
  const reconnectTimeoutRef = useRef(null);
  const hasListenersRef = useRef(false);
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://localhost:7003";

  // Chỉ kết nối SignalR khi có page đăng ký listener (opt-in approach)
  // Tránh tự động kết nối cho các page không cần SignalR (như Maintenance)
  useEffect(() => {
    if (isAuthenticated && user && hasListenersRef.current) {
      connectToHub();
    } else {
      disconnectFromHub();
    }

    return () => {
      disconnectFromHub();
    };
  }, [isAuthenticated, user, hasListenersRef.current]);

  const connectToHub = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ No token found, cannot connect to SignalR");
        return;
      }

      console.log("🔌 Connecting to SignalR Hub...");

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/hubs/notifications`, {
          accessTokenFactory: () => token,
          transport:
            signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.ServerSentEvents |
            signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Tăng dần thời gian reconnect: 0s, 2s, 10s, 30s, max 60s
            if (retryContext.elapsedMilliseconds < 60000) {
              return Math.min(
                1000 * Math.pow(2, retryContext.previousRetryCount),
                60000
              );
            }
            return null; // Stop reconnecting after 1 minute
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Event handlers
      newConnection.onreconnecting((error) => {
        console.log("🔄 SignalR reconnecting...", error);
        setIsConnected(false);
      });

      newConnection.onreconnected((connectionId) => {
        console.log("✅ SignalR reconnected:", connectionId);
        setIsConnected(true);
        message.success("Kết nối lại thành công!", 2);
      });

      newConnection.onclose((error) => {
        console.log("❌ SignalR connection closed:", error);
        setIsConnected(false);

        // Auto reconnect after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Attempting to reconnect...");
          connectToHub();
        }, 5000);
      });

      // ===== NOTIFICATION LISTENERS =====

      // 1. Nhận thông báo chung
      newConnection.on("ReceiveNotification", (notification) => {
        console.log("🔔 Received notification:", notification);
        setNotifications((prev) => [notification, ...prev]);

        // Note: Toast notification removed from global context
        // Each layout should handle displaying notifications based on their needs
        // to avoid duplicate notifications
      });

      // 2. Cập nhật dữ liệu real-time
      newConnection.on("DataUpdated", (data) => {
        console.log("🔄 Data updated:", data);

        // Trigger callbacks cho listeners đã đăng ký
        const listeners = listenersRef.current.get(data.type);
        if (listeners) {
          listeners.forEach((callback) => callback(data.data));
        }
      });

      // 3. Nhận thông báo phân công Work Order (cho Technician)
      newConnection.on("WorkOrderAssigned", (workOrder) => {
        console.log("📋 Work Order assigned to you:", workOrder);

        const listeners = listenersRef.current.get("WorkOrderAssigned");
        if (listeners) {
          listeners.forEach((callback) => callback(workOrder));
        }

        message.info({
          content: `Bạn được giao công việc mới: ${workOrder.equipmentName}`,
          duration: 5,
        });
      });

      // 4. Nhận thông báo Technician bắt đầu làm việc (cho TechManager)
      newConnection.on("WorkOrderStarted", (workOrder) => {
        console.log("▶️ Work Order started:", workOrder);

        const listeners = listenersRef.current.get("WorkOrderStarted");
        if (listeners) {
          listeners.forEach((callback) => callback(workOrder));
        }

        message.info({
          content: `${workOrder.technicianName} đã bắt đầu công việc: ${workOrder.equipmentName}`,
          duration: 4,
        });
      });

      // 5. Nhận thông báo Technician hoàn thành (cho TechManager)
      newConnection.on("WorkOrderCompleted", (workOrder) => {
        console.log("✅ Work Order completed:", workOrder);

        const listeners = listenersRef.current.get("WorkOrderCompleted");
        if (listeners) {
          listeners.forEach((callback) => callback(workOrder));
        }

        message.success({
          content: `${workOrder.technicianName} đã hoàn thành: ${workOrder.equipmentName}`,
          duration: 5,
        });
      });

      // 6. Nhận thông báo cập nhật checklist (cho TechManager)
      newConnection.on("ChecklistItemUpdated", (data) => {
        console.log("☑️ Checklist item updated:", data);

        const listeners = listenersRef.current.get("ChecklistItemUpdated");
        if (listeners) {
          listeners.forEach((callback) => callback(data));
        }
      });

      // 7. Nhận thông báo tạo Work Order mới (cho Technician)
      newConnection.on("NewWorkOrderCreated", (workOrder) => {
        console.log("🆕 New Work Order created:", workOrder);

        const listeners = listenersRef.current.get("NewWorkOrderCreated");
        if (listeners) {
          listeners.forEach((callback) => callback(workOrder));
        }
      });

      // 8. Nhận thông báo hủy Work Order (cho Technician)
      newConnection.on("WorkOrderCancelled", (workOrder) => {
        console.log("❌ Work Order cancelled:", workOrder);

        const listeners = listenersRef.current.get("WorkOrderCancelled");
        if (listeners) {
          listeners.forEach((callback) => callback(workOrder));
        }

        message.warning({
          content: `Công việc ${workOrder.equipmentName} đã bị hủy: ${workOrder.reason}`,
          duration: 5,
        });
      });

      // 9. Nhận thông báo hoãn bảo trì (cho TechManager)
      newConnection.on("MaintenancePostponed", (plan) => {
        console.log("⏰ Maintenance postponed:", plan);

        const listeners = listenersRef.current.get("MaintenancePostponed");
        if (listeners) {
          listeners.forEach((callback) => callback(plan));
        }

        message.info({
          content: `Chu kỳ bảo trì ${plan.equipmentName} đã được hoãn`,
          duration: 4,
        });
      });

      // 10. Nhận thông báo yêu cầu hỗ trợ từ Technician (cho TechManager)
      newConnection.on("TechnicianRequestHelp", (request) => {
        console.log("🆘 Technician request help:", request);

        const listeners = listenersRef.current.get("TechnicianRequestHelp");
        if (listeners) {
          listeners.forEach((callback) => callback(request));
        }

        message.warning({
          content: `${request.technicianName} yêu cầu hỗ trợ: ${request.reason}`,
          duration: 6,
        });
      });

      // 11. Nhận thông báo duyệt cấp phát linh kiện (cho Technician)
      newConnection.on("ReplacementApproved", (data) => {
        console.log("✅ Replacement approved:", data);

        const listeners = listenersRef.current.get("ReplacementApproved");
        if (listeners) {
          listeners.forEach((callback) => callback(data));
        }

        message.success({
          content: `Linh kiện đã được duyệt: ${data.partName} cho ${data.equipmentName}`,
          duration: 5,
        });
      });

      // Start connection
      await newConnection.start();
      console.log("✅ SignalR connected successfully!");
      setConnection(newConnection);
      setIsConnected(true);
    } catch (error) {
      console.error("❌ SignalR connection error:", error);
      setIsConnected(false);

      // Retry after 5 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("🔄 Retrying connection...");
        connectToHub();
      }, 5000);
    }
  }, [user, isAuthenticated]);

  const disconnectFromHub = useCallback(async () => {
    if (connection) {
      try {
        console.log("🔌 Disconnecting from SignalR Hub...");
        await connection.stop();
        setConnection(null);
        setIsConnected(false);
        console.log("✅ SignalR disconnected");
      } catch (error) {
        console.error("❌ Error disconnecting SignalR:", error);
      }
    }

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clear all listeners
    listenersRef.current.clear();
  }, [connection]);

  // Subscribe to specific event
  const subscribe = useCallback((eventType, callback) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType).add(callback);

    // Mark that we have listeners, trigger connection
    if (!hasListenersRef.current && isAuthenticated && user) {
      hasListenersRef.current = true;
      connectToHub();
    }

    // Return unsubscribe function
    return () => {
      const listeners = listenersRef.current.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          listenersRef.current.delete(eventType);
        }
      }

      // If no more listeners, disconnect
      if (listenersRef.current.size === 0) {
        hasListenersRef.current = false;
        disconnectFromHub();
      }
    };
  }, [isAuthenticated, user]);

  // Send message to hub
  const sendMessage = useCallback(
    async (method, ...args) => {
      if (!connection || !isConnected) {
        console.warn("⚠️ SignalR not connected, cannot send message");
        return;
      }

      try {
        await connection.invoke(method, ...args);
        console.log(`✅ Sent message: ${method}`, args);
      } catch (error) {
        console.error(`❌ Error sending message: ${method}`, error);
        throw error;
      }
    },
    [connection, isConnected]
  );

  const value = {
    connection,
    isConnected,
    notifications,
    subscribe,
    sendMessage,
    connectToHub,
    disconnectFromHub,
  };

  return (
    <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>
  );
};
