import React, { useState, useEffect } from "react";
import { List, Tag, Typography, Spin, Empty, Button, Space } from "antd";
import { BellOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import * as notificationService from "../../services/notificationService";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Text } = Typography;

const NotificationsList = ({ onClose, onNotificationCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);

      // Update unread count
      const unreadCount = (data || []).filter((n) => !n.isRead).length;
      if (onNotificationCountChange) {
        onNotificationCountChange(unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "50px 0",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space>
          <Text strong>
            {notifications.filter((n) => !n.isRead).length} chưa đọc
          </Text>
        </Space>
        <Button
          type="link"
          icon={<CheckOutlined />}
          onClick={handleMarkAllAsRead}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Empty description="Không có thông báo" style={{ padding: "50px 0" }} />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                backgroundColor: item.isRead ? "#fff" : "#f0f5ff",
                padding: "16px",
              }}
              actions={[
                !item.isRead && (
                  <Button
                    type="link"
                    icon={<CheckOutlined />}
                    onClick={() => handleMarkAsRead(item.notificationId)}
                  >
                    Đánh dấu đã đọc
                  </Button>
                ),
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(item.notificationId)}
                >
                  Xóa
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<BellOutlined style={{ fontSize: 24 }} />}
                title={
                  <Space>
                    <Text strong={!item.isRead}>{item.title}</Text>
                    {!item.isRead && <Tag color="blue">Mới</Tag>}
                  </Space>
                }
                description={
                  <>
                    <Text>{item.message}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(item.createdAt).fromNow()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default NotificationsList;
