using System;
using System.Collections.Generic;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class ShiftSlot
{
    public int SlotId { get; set; }

    public int ShiftId { get; set; }

    public TimeOnly SlotStartTime { get; set; }

    public TimeOnly SlotEndTime { get; set; }

    public int Duration { get; set; }

    public virtual ICollection<ErrorHistory> ErrorHistories { get; set; } = new List<ErrorHistory>();

    public virtual Shift Shift { get; set; } = null!;
}
