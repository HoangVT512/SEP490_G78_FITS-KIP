namespace FITSKIP.Domain.DTO
{
    public class NotificationSummaryDTO
    {
        public int TotalNotifications { get; set; }
        public int UnreadCount { get; set; }
        public List<NotificationDTO> RecentNotifications { get; set; } = new List<NotificationDTO>();
    }
}

