using System;
using System.Collections.Generic;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class Shift
{
    public int ShiftId { get; set; }

    public string ShiftName { get; set; } = null!;

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public virtual ICollection<ProductionOutput> ProductionOutputs { get; set; } = new List<ProductionOutput>();

    public virtual ICollection<ShiftSlot> ShiftSlots { get; set; } = new List<ShiftSlot>();
}
