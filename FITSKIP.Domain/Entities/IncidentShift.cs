using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class IncidentShift
{
    public int IncidentShiftId { get; set; }

    public int IncidentId { get; set; }

    public int ShiftId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public virtual IncidentHistory Incident { get; set; } = null!;

    public virtual Shift Shift { get; set; } = null!;
}
