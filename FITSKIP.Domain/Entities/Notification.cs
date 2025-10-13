using System;

namespace FITSKIP.Domain.Entities;

public partial class Notification
{
    public int NotificationId { get; set; }

    public string? UserId { get; set; }

    public string Message { get; set; } = string.Empty;

    public string? Title { get; set; }

    public string? Type { get; set; }

    public bool IsRead { get; set; } = false;

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public DateTime? ReadDate { get; set; }

    public virtual User? User { get; set; }
}
