using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO
{
    public class MarkNotificationReadRequest
    {
        [Required(ErrorMessage = "ID thông báo là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "ID thông báo phải lớn hơn 0")]
        public int NotificationId { get; set; }
    }
}

