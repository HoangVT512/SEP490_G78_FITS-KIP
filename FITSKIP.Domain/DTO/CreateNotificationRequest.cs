using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO
{
    public class CreateNotificationRequest
    {
        [StringLength(450, ErrorMessage = "User ID không được vượt quá 450 ký tự")]
        public string? UserId { get; set; }

        [Required(ErrorMessage = "Nội dung thông báo là bắt buộc")]
        [StringLength(500, MinimumLength = 5, ErrorMessage = "Nội dung thông báo phải từ 5 đến 500 ký tự")]
        public string Message { get; set; } = string.Empty;

        [StringLength(200, ErrorMessage = "Tiêu đề không được vượt quá 200 ký tự")]
        public string? Title { get; set; }
    }
}

