using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO
{
    public class CreateNotificationRequest
    {
        [Required]
        public string? UserId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Title { get; set; }

        [MaxLength(50)]
        public string? Type { get; set; } // e.g., "info", "warning", "error", "success"
    }
}

