using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class Shift
{
    public int ShiftId { get; set; }

    public string ShiftName { get; set; } = null!;

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public virtual ICollection<IncidentShift> IncidentShifts { get; set; } = new List<IncidentShift>();
}
