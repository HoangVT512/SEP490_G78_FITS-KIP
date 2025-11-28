using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces
{
    public interface INotificationService
    {
        Task<NotificationDTO> CreateNotificationAsync(CreateNotificationRequest request);
        Task<NotificationDTO?> GetNotificationByIdAsync(int notificationId);
        Task<IEnumerable<NotificationDTO>> GetUserNotificationsAsync(string userId, bool unreadOnly = false);
        Task<NotificationSummaryDTO> GetUserNotificationSummaryAsync(string userId);
        Task<bool> MarkAsReadAsync(int notificationId, string userId);
        Task<bool> MarkAllAsReadAsync(string userId);
        Task<bool> DeleteNotificationAsync(int notificationId);
        Task DeleteAllReadNotificationsAsync(string userId);

        // Real-time notification methods
        Task SendNotificationToUserAsync(string userId, string title, string message, string type = "info", string dataType = "incident");
        Task SendNotificationToGroupAsync(string groupName, string title, string message, string type = "info", string dataType = "incident");
        Task SendNotificationToGroupWithDataAsync(string groupName, object notificationData);
        Task SendNotificationToAllAsync(string title, string message, string type = "info");
        Task SendNotificationToRoleAsync(string roleName, string message, string type = "info");

        // Department-specific notification methods
        Task SendIncidentNotificationToDepartmentAsync(int departmentId, string title, string message);
        Task RefreshIncidentsForDepartmentAsync(int departmentId);
    }
}

