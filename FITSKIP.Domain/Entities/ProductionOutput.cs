using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class ProductionOutput
{
    public int OutputId { get; set; }

    public int LineId { get; set; }

    public int ShiftSlotId { get; set; }

    public DateOnly Date { get; set; }

    public decimal TargetQuantity { get; set; }

    public int PlannedProductionTime { get; set; } // minutes

    public int ActualQuantity { get; set; }

    public int GoodQuantity { get; set; }

    public int DowntimeMinutes { get; set; }

    public decimal IdealCycleTime { get; set; }

    public virtual Line Line { get; set; } = null!;

    public virtual ShiftSlot ShiftSlot { get; set; } = null!;
}
