using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class MaintenancePlan
{
    public int PlanId { get; set; }

    public int? EquipmentId { get; set; }

    public string IntervalType { get; set; } = null!; // 'Hours', 'Days', 'UsageCycles'

    public int IntervalValue { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly NextDueDate { get; set; }

    public string? AssignedToUserId { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual Equipment? Equipment { get; set; }

    public virtual User? AssignedToUser { get; set; }

    public virtual ICollection<MaintenanceChecklistItem> ChecklistItems { get; set; } = new List<MaintenanceChecklistItem>();
}
