using System;

namespace FITSKIP.Domain.Entities;

public partial class IncidentImage
{
    public int ImageId { get; set; }

    public int IncidentId { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public int OrderIndex { get; set; } = 0; // Thứ tự ảnh (0, 1, 2, 3, 4)

    public DateTime UploadedAt { get; set; } = DateTime.Now;

    public virtual IncidentHistory? Incident { get; set; }
}
