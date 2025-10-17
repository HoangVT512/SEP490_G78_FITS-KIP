using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class IncidentHistory
{
    public int IncidentId { get; set; }

    public int? EquipmentId { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public decimal? Duration { get; set; }

    public int? TypeId { get; set; }

    public string? Reason { get; set; }

    public string? Solution { get; set; }

    public string? Issue { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public virtual Equipment? Equipment { get; set; }

    public virtual StopType? Type { get; set; }

    public virtual User? ReportedByUser { get; set; }
}
