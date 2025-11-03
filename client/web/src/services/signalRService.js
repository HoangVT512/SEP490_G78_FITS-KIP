import * as signalR from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.listeners = {
      receiveNotification: [],
      receiveBroadcast: [],
      dataUpdated: [],
      replacementApproved: [],
    };
  }

  // Khởi tạo kết nối
  async startConnection(token) {
    try {
      // Nếu đã có connection và đang connected, return luôn
      if (this.connection && this.isConnected) {
        console.log("SignalR already connected, reusing existing connection");
        return this.connection;
      }

      // Nếu có connection cũ nhưng chưa connected, stop nó trước
      if (this.connection) {
        console.log("Stopping old SignalR connection...");
        await this.stopConnection();
      }

      // Tạo connection với URL của NotificationHub
      // Đảm bảo URL không có undefined hoặc các tham số không cần thiết
      const baseUrl =
        process.env.REACT_APP_API_BASE_URL || "https://localhost:7003/api";
      const hubUrl = `${baseUrl.replace("/api", "")}/hubs/notifications`;

      console.log("🔗 SignalR connecting to:", hubUrl);

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
          transport: signalR.HttpTransportType.WebSockets,
          skipNegotiation: false, // Ensure proper negotiation
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Tự động reconnect
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Xử lý khi kết nối lại thành công
      this.connection.onreconnecting((error) => {
        console.warn("⚠️ SignalR đang reconnecting...", error);
        this.isConnected = false;
      });

      this.connection.onreconnected((connectionId) => {
        console.log("✅ SignalR đã reconnected:", connectionId);
        this.isConnected = true;
      });

      this.connection.onclose((error) => {
        console.error("❌ SignalR connection closed:", error);
        this.isConnected = false;
      });

      // Start connection
      await this.connection.start();
      this.isConnected = true;
      console.log("✅ SignalR Connected successfully! ConnectionId:", this.connection.connectionId);

      return this.connection;
    } catch (error) {
      console.error("❌ SignalR Connection Error:", error);
      this.isConnected = false;
      throw error;
    }
  }

  // Đăng ký lắng nghe thông báo
  onReceiveNotification(callback) {
    if (!this.connection) {
      console.warn("⚠️ Cannot set up ReceiveNotification listener - no connection");
      return;
    }

    // Check if this callback already exists
    if (this.listeners.receiveNotification.includes(callback)) {
      console.log("📡 ReceiveNotification listener already registered, skipping");
      return;
    }

    // Add to tracking
    this.listeners.receiveNotification.push(callback);
    
    // Remove ALL existing event handlers first
    this.connection.off("ReceiveNotification");
    
    // Set up new consolidated handler that calls all registered callbacks
    console.log(`📡 Setting up ReceiveNotification listener (${this.listeners.receiveNotification.length} callbacks)`);
    this.connection.on("ReceiveNotification", (notification) => {
      console.log(`📨 [SignalR Service] ReceiveNotification event fired, calling ${this.listeners.receiveNotification.length} callback(s)`);
      
      // Call all registered callbacks
      this.listeners.receiveNotification.forEach((cb, index) => {
        try {
          console.log(`  └─ Calling callback #${index + 1}`);
          cb(notification);
        } catch (error) {
          console.error(`Error in ReceiveNotification callback #${index + 1}:`, error);
        }
      });
    });
  }

  // Hủy đăng ký lắng nghe thông báo
  offReceiveNotification(callback) {
    if (this.connection) {
      if (callback) {
        // Remove specific callback
        const index = this.listeners.receiveNotification.indexOf(callback);
        if (index > -1) {
          this.listeners.receiveNotification.splice(index, 1);
          console.log(`🔇 Removed specific ReceiveNotification callback (${this.listeners.receiveNotification.length} remaining)`);
        }
      } else {
        // Remove all callbacks
        console.log("🔇 Removing ALL ReceiveNotification listeners");
        this.listeners.receiveNotification = [];
        this.connection.off("ReceiveNotification");
      }
    }
  }

  // Đăng ký lắng nghe broadcast
  onReceiveBroadcast(callback) {
    if (this.connection) {
      // Remove existing listeners first to prevent duplicates
      this.connection.off("ReceiveBroadcast");

      this.connection.on("ReceiveBroadcast", (message) => {
        console.log("Received broadcast:", message);
        callback(message);
      });
    }
  }

  // Hủy đăng ký lắng nghe broadcast
  offReceiveBroadcast() {
    if (this.connection) {
      this.connection.off("ReceiveBroadcast");
    }
  }

  // Gửi thông báo đến user cụ thể (nếu cần)
  async sendNotificationToUser(userId, title, message, type = "info") {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke(
          "SendNotificationToUser",
          userId,
          title,
          message,
          type
        );
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  }

  // Gửi broadcast đến tất cả (nếu cần)
  async sendBroadcast(title, message, type = "info") {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke("SendBroadcast", title, message, type);
      } catch (error) {
        console.error("Error sending broadcast:", error);
      }
    }
  }

  // Dừng kết nối
  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.isConnected = false;
        console.log("SignalR Disconnected");
      } catch (error) {
        console.error("Error stopping connection:", error);
      }
    }
  }

  // Kiểm tra trạng thái kết nối
  getConnectionState() {
    return this.connection ? this.connection.state : "Disconnected";
  }

  // Đăng ký lắng nghe cập nhật dữ liệu
  onDataUpdated(callback) {
    if (this.connection) {
      // Remove existing listeners first to prevent duplicates
      this.connection.off("DataUpdated");

      this.connection.on("DataUpdated", (data) => {
        console.log("Data updated:", data);
        callback(data);
      });
    }
  }

  // Hủy đăng ký lắng nghe cập nhật dữ liệu
  offDataUpdated() {
    if (this.connection) {
      this.connection.off("DataUpdated");
    }
  }

  // Đăng ký lắng nghe thông báo duyệt cấp phát linh kiện
  onReplacementApproved(callback) {
    if (!this.connection) {
      console.warn("⚠️ Cannot set up ReplacementApproved listener - no connection");
      return;
    }

    // Check if this callback already exists
    if (this.listeners.replacementApproved.includes(callback)) {
      console.log("📡 ReplacementApproved listener already registered, skipping");
      return;
    }

    // Add to tracking
    this.listeners.replacementApproved.push(callback);
    
    // Remove ALL existing event handlers first
    this.connection.off("ReplacementApproved");
    
    // Set up new consolidated handler that calls all registered callbacks
    console.log(`📡 Setting up ReplacementApproved listener (${this.listeners.replacementApproved.length} callbacks)`);
    this.connection.on("ReplacementApproved", (data) => {
      console.log(`📨 [SignalR Service] ReplacementApproved event fired, calling ${this.listeners.replacementApproved.length} callback(s)`);
      
      // Call all registered callbacks
      this.listeners.replacementApproved.forEach((cb, index) => {
        try {
          console.log(`  └─ Calling callback #${index + 1}`);
          cb(data);
        } catch (error) {
          console.error(`Error in ReplacementApproved callback #${index + 1}:`, error);
        }
      });
    });
  }

  // Hủy đăng ký lắng nghe thông báo duyệt cấp phát linh kiện
  offReplacementApproved(callback) {
    if (this.connection) {
      if (callback) {
        // Remove specific callback
        const index = this.listeners.replacementApproved.indexOf(callback);
        if (index > -1) {
          this.listeners.replacementApproved.splice(index, 1);
          console.log(`🔇 Removed specific ReplacementApproved callback (${this.listeners.replacementApproved.length} remaining)`);
        }
      } else {
        // Remove all callbacks
        console.log("🔇 Removing ALL ReplacementApproved listeners");
        this.listeners.replacementApproved = [];
        this.connection.off("ReplacementApproved");
      }
    }
  }
}

// Export singleton instance
const signalRService = new SignalRService();
export default signalRService;
