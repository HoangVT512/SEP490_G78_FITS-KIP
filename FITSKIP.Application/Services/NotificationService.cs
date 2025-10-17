using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;

namespace FITSKIP.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly INotificationHubService _notificationHubService;

        public NotificationService(
            INotificationRepository notificationRepository,
            INotificationHubService notificationHubService)
        {
            _notificationRepository = notificationRepository;
            _notificationHubService = notificationHubService;
        }

        public async Task<NotificationDTO> CreateNotificationAsync(CreateNotificationRequest request)
        {
            var notification = new Notification
            {
                UserId = request.UserId,
                Message = request.Message,
                Title = request.Title,
                IsRead = false,
                CreatedDate = DateTime.UtcNow
            };

            var createdNotification = await _notificationRepository.CreateAsync(notification);

            // NOTE: Do NOT send real-time notification here automatically
            // Let the caller decide when to send real-time notifications
            // This prevents duplicate notifications when used with SendNotificationToGroupAsync

            return MapToDTO(createdNotification);
        }

        public async Task<NotificationDTO?> GetNotificationByIdAsync(int notificationId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);
            return notification != null ? MapToDTO(notification) : null;
        }

        public async Task<IEnumerable<NotificationDTO>> GetUserNotificationsAsync(string userId, bool unreadOnly = false)
        {
            var notifications = await _notificationRepository.GetByUserIdAsync(userId, unreadOnly);
            return notifications.Select(MapToDTO);
        }

        public async Task<NotificationSummaryDTO> GetUserNotificationSummaryAsync(string userId)
        {
            var allNotifications = await _notificationRepository.GetByUserIdAsync(userId);
            var unreadCount = await _notificationRepository.GetUnreadCountAsync(userId);
            var recentNotifications = await _notificationRepository.GetRecentByUserIdAsync(userId, 10);

            return new NotificationSummaryDTO
            {
                TotalNotifications = allNotifications.Count(),
                UnreadCount = unreadCount,
                RecentNotifications = recentNotifications.Select(MapToDTO).ToList()
            };
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, string userId)
        {
            return await _notificationRepository.MarkAsReadAsync(notificationId, userId);
        }

        public async Task<bool> MarkAllAsReadAsync(string userId)
        {
            return await _notificationRepository.MarkAllAsReadAsync(userId);
        }

        public async Task<bool> DeleteNotificationAsync(int notificationId)
        {
            return await _notificationRepository.DeleteAsync(notificationId);
        }

        // Real-time notification methods
        public async Task SendNotificationToUserAsync(string userId, string title, string message, string type = "info")
        {
            var notificationData = new
            {
                Title = title,
                Message = message,
                Type = type,
                Timestamp = DateTime.UtcNow
            };

            await _notificationHubService.SendToUserAsync(userId, notificationData);
        }

        public async Task SendNotificationToGroupAsync(string groupName, string title, string message, string type = "info")
        {
            var notificationData = new
            {
                Title = title,
                Message = message,
                Type = type,
                Timestamp = DateTime.UtcNow
            };

            await _notificationHubService.SendToGroupAsync(groupName, notificationData);
        }

        public async Task SendNotificationToAllAsync(string title, string message, string type = "info")
        {
            var notificationData = new
            {
                Title = title,
                Message = message,
                Type = type,
                Timestamp = DateTime.UtcNow
            };

            await _notificationHubService.SendToAllAsync(notificationData);
        }

        private NotificationDTO MapToDTO(Notification notification)
        {
            return new NotificationDTO
            {
                NotificationId = notification.NotificationId,
                UserId = notification.UserId,
                Message = notification.Message,
                Title = notification.Title,
                IsRead = notification.IsRead,
                CreatedDate = notification.CreatedDate,
                UserName = notification.User?.UserName,
                UserEmail = notification.User?.Email
            };
        }
    }
}

