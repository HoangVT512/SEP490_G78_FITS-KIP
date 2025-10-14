using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO
{
    public class MarkNotificationReadRequest
    {
        [Required]
        public int NotificationId { get; set; }
    }
}

