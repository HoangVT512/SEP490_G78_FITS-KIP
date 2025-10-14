namespace FITSKIP.Domain.DTO
{
    public class NotificationDTO
    {
        public int NotificationId { get; set; }
        public string? UserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Type { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ReadDate { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
    }
}

