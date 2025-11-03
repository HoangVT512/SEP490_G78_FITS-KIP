using FITSKIP.Domain.Entities;

namespace FITSKIP.Domain.Interfaces
{
    public interface INotificationRepository
    {
        Task<Notification> CreateAsync(Notification notification);
        Task<Notification?> GetByIdAsync(int notificationId);
        Task<IEnumerable<Notification>> GetByUserIdAsync(string userId, bool unreadOnly = false);
        Task<IEnumerable<Notification>> GetRecentByUserIdAsync(string userId, int count = 10);
        Task<int> GetUnreadCountAsync(string userId);
        Task<Notification> UpdateAsync(Notification notification);
        Task<bool> MarkAsReadAsync(int notificationId, string userId);
        Task<bool> MarkAllAsReadAsync(string userId);
        Task<bool> DeleteAsync(int notificationId);
        Task DeleteAllReadByUserIdAsync(string userId);
        Task<IEnumerable<Notification>> GetAllAsync();
        Task<int> DeleteOldReadNotificationsAsync(DateTime cutoffDate);
    }
}

