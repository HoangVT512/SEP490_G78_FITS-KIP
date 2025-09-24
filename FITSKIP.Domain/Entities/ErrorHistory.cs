using System;
using System.Collections.Generic;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class ErrorHistory
{
    public int ErrorId { get; set; }

    public int? EquipmentId { get; set; }

    public string? ErrorDescription { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public int? StageId { get; set; }

    public int? LineId { get; set; }

    public int? SlotId { get; set; }

    public int? TypeId { get; set; }

    public string? Reason { get; set; }

    public string? Solution { get; set; }

    public decimal? Duration { get; set; }

    public virtual Equipment? Equipment { get; set; }

    public virtual Line? Line { get; set; }

    public virtual ICollection<MaintenanceAssignment> MaintenanceAssignments { get; set; } = new List<MaintenanceAssignment>();

    public virtual ShiftSlot? Slot { get; set; }

    public virtual Stage? Stage { get; set; }

    public virtual StopType? Type { get; set; }
}
