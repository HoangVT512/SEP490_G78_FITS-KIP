using System;
using System.Collections.Generic;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class MaintenanceAssignment
{
    public int AssignmentId { get; set; }

    public int ErrorId { get; set; }

    public string TechnicianId { get; set; } = null!;

    public DateTime AssignedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string? ResolutionDetail { get; set; }

    public virtual ErrorHistory Error { get; set; } = null!;

    public virtual AspNetUser Technician { get; set; } = null!;
}
