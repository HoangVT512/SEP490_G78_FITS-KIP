using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class MaintenanceChecklistItem
{
    public int ChecklistId { get; set; }

    public int PlanId { get; set; }

    public string StepName { get; set; } = null!;

    public bool? IsChecked { get; set; }

    public DateTime? CompletedDate { get; set; }

    public string? Notes { get; set; }

    public virtual MaintenancePlan Plan { get; set; } = null!;
}
