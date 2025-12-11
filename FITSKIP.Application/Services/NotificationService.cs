using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Domain.Exceptions;

namespace FITSKIP.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly INotificationHubService _notificationHubService;
        private readonly IUserRepository _userRepository;

        public NotificationService(
            INotificationRepository notificationRepository,
            INotificationHubService notificationHubService,
            IUserRepository userRepository)
        {
            _notificationRepository = notificationRepository;
            _notificationHubService = notificationHubService;
            _userRepository = userRepository;
        }

        // Validation-enabled method
        public async Task<NotificationDTO> CreateNotificationAsync(CreateNotificationRequest request)
        {
            // Validate message
            ValidateMessage(request.Message);

            // Validate title if provided
            if (!string.IsNullOrWhiteSpace(request.Title))
            {
                ValidateTitle(request.Title);
            }

            // Validate user ID if provided
            if (!string.IsNullOrWhiteSpace(request.UserId))
            {
                await ValidateUserIdAsync(request.UserId);
            }

            var notification = new Notification
            {
                UserId = request.UserId,
                Message = request.Message.Trim(),
                Title = request.Title?.Trim(),
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
            // Validate user ID
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new NotificationValidationException(
                    "User ID không được để trống",
                    "NOTIFICATION_USER_ID_REQUIRED");
            }

            // Validate notification exists and belongs to user
            var notification = await _notificationRepository.GetByIdAsync(notificationId);
            if (notification == null)
            {
                throw new NotificationValidationException(
                    $"Không tìm thấy thông báo với ID {notificationId}",
                    "NOTIFICATION_NOT_FOUND",
                    new { NotificationId = notificationId });
            }

            if (notification.UserId != userId)
            {
                throw new NotificationValidationException(
                    "Bạn không có quyền đánh dấu đọc thông báo này",
                    "NOTIFICATION_UNAUTHORIZED_ACCESS",
                    new { NotificationId = notificationId, RequestedUserId = userId, OwnerUserId = notification.UserId });
            }

            return await _notificationRepository.MarkAsReadAsync(notificationId, userId);
        }

        public async Task<bool> MarkAllAsReadAsync(string userId)
        {
            return await _notificationRepository.MarkAllAsReadAsync(userId);
        }

        public async Task<bool> DeleteNotificationAsync(int notificationId)
        {
            // Validate notification exists
            var notification = await _notificationRepository.GetByIdAsync(notificationId);
            if (notification == null)
            {
                throw new NotificationValidationException(
                    $"Không tìm thấy thông báo với ID {notificationId}",
                    "NOTIFICATION_NOT_FOUND",
                    new { NotificationId = notificationId });
            }

            return await _notificationRepository.DeleteAsync(notificationId);
        }

        // Real-time notification methods
        public async Task SendNotificationToUserAsync(string userId, string title, string message, string type = "info", string dataType = "incident")
        {
            var notificationData = new
            {
                Title = title,
                Message = message,
                Type = type,
                Timestamp = DateTime.UtcNow
            };

            await _notificationHubService.SendToUserAsync(userId, notificationData, dataType);
        }

        public async Task SendNotificationToGroupAsync(string groupName, string title, string message, string type = "info", string dataType = "incident")
        {
            var notificationData = new
            {
                Title = title,
                Message = message,
                Type = type,
                Timestamp = DateTime.UtcNow
            };

            await _notificationHubService.SendToGroupAsync(groupName, notificationData, dataType);
        }

        public async Task SendNotificationToGroupWithDataAsync(string groupName, object notificationData)
        {
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

        public async Task SendNotificationToRoleAsync(string roleName, string message, string type = "info")
        {
            // Get all users with this role
            var users = await _userRepository.GetUsersByRoleAsync(roleName);

            // Create notification in database for each user
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    UserId = user.Id, // IdentityUser uses Id, not UserId
                    Message = message,
                    Title = type == "replacementApproved" ? "Linh kiện đã được duyệt" : "Thông báo",
                    IsRead = false,
                    CreatedDate = DateTime.UtcNow
                };

                await _notificationRepository.CreateAsync(notification);
            }

            // Send real-time notification based on role
            if (roleName == "Kỹ thuật viên" && type == "replacementApproved")
            {
                // Send specific ReplacementApproved event for technicians
                var replacementData = new
                {
                    Message = message,
                    Type = type,
                    Timestamp = DateTime.UtcNow
                };

                await _notificationHubService.SendReplacementApprovedAsync(replacementData);
            }
            else
            {
                // Send to SignalR group based on role
                var groupName = roleName == "Quản lý kỹ thuật" ? "TechnicalManagers" :
                               roleName == "Kỹ thuật viên" ? "Technicians" : roleName;
                var notificationData = new
                {
                    Message = message,
                    Type = type,
                    Timestamp = DateTime.UtcNow
                };

                await _notificationHubService.SendToGroupAsync(groupName, notificationData);
            }
        }

        public async Task DeleteAllReadNotificationsAsync(string userId)
        {
            await _notificationRepository.DeleteAllReadByUserIdAsync(userId);
        }

        // Department-specific notification methods
        public async Task SendIncidentNotificationToDepartmentAsync(int departmentId, string title, string message)
        {
            var groupName = $"TechnicalManagers_Department_{departmentId}";
            var notificationData = new
            {
                Title = title,
                Message = message,
                Type = "incident",
                DepartmentId = departmentId,
                Timestamp = DateTime.UtcNow
            };

            await _notificationHubService.SendToGroupAsync(groupName, notificationData);
        }

        public async Task RefreshIncidentsForDepartmentAsync(int departmentId)
        {
            var groupName = $"TechnicalManagers_Department_{departmentId}";
            var refreshData = new
            {
                Type = "refresh",
                DepartmentId = departmentId,
                Timestamp = DateTime.UtcNow
            };

            await _notificationHubService.SendToGroupAsync(groupName, refreshData);
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
                CreatedDate = notification.CreatedDate.ToLocalTime(), // Convert UTC to local time
                UserName = notification.User?.UserName,
                UserEmail = notification.User?.Email
            };
        }

        private void ValidateMessage(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                throw new NotificationValidationException(
                    "Nội dung thông báo không được để trống",
                    "NOTIFICATION_MESSAGE_REQUIRED");
            }

            var trimmedMessage = message.Trim();
            if (trimmedMessage.Length < 5)
            {
                throw new NotificationValidationException(
                    "Nội dung thông báo phải có ít nhất 5 ký tự",
                    "NOTIFICATION_MESSAGE_TOO_SHORT",
                    new { MinLength = 5, ActualLength = trimmedMessage.Length });
            }

            if (trimmedMessage.Length > 500)
            {
                throw new NotificationValidationException(
                    "Nội dung thông báo không được vượt quá 500 ký tự",
                    "NOTIFICATION_MESSAGE_TOO_LONG",
                    new { MaxLength = 500, ActualLength = trimmedMessage.Length });
            }
        }

        private void ValidateTitle(string title)
        {
            if (title.Length > 200)
            {
                throw new NotificationValidationException(
                    "Tiêu đề thông báo không được vượt quá 200 ký tự",
                    "NOTIFICATION_TITLE_TOO_LONG",
                    new { MaxLength = 200, ActualLength = title.Length });
            }
        }

        private async Task ValidateUserIdAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new NotificationValidationException(
                    "User ID không được để trống",
                    "NOTIFICATION_USER_ID_REQUIRED");
            }

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new NotificationValidationException(
                    $"Không tìm thấy người dùng với ID {userId}",
                    "USER_NOT_FOUND",
                    new { UserId = userId });
            }
        }
    }
}

