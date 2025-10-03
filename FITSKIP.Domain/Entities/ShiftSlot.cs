using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class ShiftSlot
{
    public int SlotId { get; set; }

    public int ShiftId { get; set; }

    public TimeOnly SlotStartTime { get; set; }

    public TimeOnly SlotEndTime { get; set; }

    public int Duration { get; set; }

    public virtual Shift Shift { get; set; } = null!;

    public virtual ICollection<ProductionOutput> ProductionOutputs { get; set; } = new List<ProductionOutput>();
}
