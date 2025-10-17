import React, { useState, useEffect } from "react";
import {
  List,
  Badge,
  Typography,
  Button,
  Space,
  message,
  Empty,
  Spin,
  Tag,
  Divider,
} from "antd";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import * as notificationService from "../../services/notificationService";
import styles from "../../styles/pages/NotificationsList.module.css";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text, Paragraph } = Typography;

const NotificationsList = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(unreadOnly);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      message.error("Lỗi khi tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      message.success("Đã đánh dấu đã đọc");
      fetchNotifications(); // Refresh list
    } catch (error) {
      console.error("Error marking as read:", error);
      message.error("Lỗi khi đánh dấu đã đọc");
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      message.success("Đã đánh dấu tất cả đã đọc");
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
      message.error("Lỗi khi đánh dấu tất cả đã đọc");
    }
  };

  // Delete notification
  const deleteNotificationItem = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      message.success("Đã xóa thông báo");
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      message.error("Lỗi khi xóa thông báo");
    }
  };

  // Delete all read notifications
  const deleteAllRead = async () => {
    try {
      await notificationService.deleteAllReadNotifications();
      message.success("Đã xóa tất cả thông báo đã đọc");
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting all read notifications:", error);
      message.error("Lỗi khi xóa thông báo đã đọc");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className={styles.notificationsContainer}>
      <div className={styles.header}>
        <Space align="center">
          <BellOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Thông báo
          </Title>
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ backgroundColor: "#ff4d4f" }} />
          )}
        </Space>

        <Space>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={fetchNotifications}
          >
            Làm mới
          </Button>
          {unreadCount > 0 && (
            <Button
              type="text"
              icon={<CheckOutlined />}
              onClick={markAllAsRead}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
          {notifications.filter((n) => n.isRead).length > 0 && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={deleteAllRead}
            >
              Xóa những tin đã đọc
            </Button>
          )}
        </Space>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div className={styles.filterContainer}>
        <Space>
          <Button
            type={!unreadOnly ? "primary" : "default"}
            size="small"
            onClick={() => setUnreadOnly(false)}
          >
            Tất cả ({notifications.length})
          </Button>
          <Button
            type={unreadOnly ? "primary" : "default"}
            size="small"
            onClick={() => setUnreadOnly(true)}
          >
            Chưa đọc ({unreadCount})
          </Button>
        </Space>
      </div>

      <div className={styles.listContainer}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            description={
              unreadOnly
                ? "Không có thông báo chưa đọc"
                : "Chưa có thông báo nào"
            }
            style={{ padding: "40px" }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className={`${styles.notificationItem} ${
                  !item.isRead ? styles.unread : ""
                }`}
                actions={[
                  <Space key="actions" size="small">
                    {!item.isRead && (
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.notificationId);
                        }}
                        title="Đánh dấu đã đọc"
                      />
                    )}
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotificationItem(item.notificationId);
                      }}
                      title="Xóa"
                    />
                  </Space>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div className={styles.iconContainer}>
                      <BellOutlined
                        style={{
                          fontSize: "24px",
                          color: item.isRead ? "#d9d9d9" : "#1890ff",
                        }}
                      />
                    </div>
                  }
                  title={
                    <Space size={4}>
                      <Text strong={!item.isRead} ellipsis>
                        {item.title}
                      </Text>
                      {!item.isRead && <Badge status="processing" text="Mới" />}
                    </Space>
                  }
                  description={
                    <div style={{ maxWidth: "100%" }}>
                      <Paragraph
                        ellipsis={{
                          rows: 2,
                          expandable: true,
                          symbol: "xem thêm",
                        }}
                        style={{ marginBottom: "8px", wordBreak: "break-word" }}
                      >
                        {item.message}
                      </Paragraph>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {dayjs(item.createdDate).fromNow()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
