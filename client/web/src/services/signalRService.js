import * as signalR from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  // Khởi tạo kết nối
  async startConnection(token) {
    try {
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
        console.warn("SignalR đang reconnecting...", error);
        this.isConnected = false;
      });

      this.connection.onreconnected((connectionId) => {
        console.log("SignalR đã reconnected:", connectionId);
        this.isConnected = true;
      });

      this.connection.onclose((error) => {
        console.error("SignalR connection closed:", error);
        this.isConnected = false;
      });

      // Start connection
      await this.connection.start();
      this.isConnected = true;
      console.log("SignalR Connected successfully!");

      return this.connection;
    } catch (error) {
      console.error("SignalR Connection Error:", error);
      this.isConnected = false;
      throw error;
    }
  }

  // Đăng ký lắng nghe thông báo
  onReceiveNotification(callback) {
    if (this.connection) {
      // Remove existing listeners first to prevent duplicates
      this.connection.off("ReceiveNotification");

      this.connection.on("ReceiveNotification", (notification) => {
        console.log("Received notification:", notification);
        callback(notification);
      });
    }
  }

  // Hủy đăng ký lắng nghe thông báo
  offReceiveNotification() {
    if (this.connection) {
      this.connection.off("ReceiveNotification");
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
}

// Export singleton instance
const signalRService = new SignalRService();
export default signalRService;
