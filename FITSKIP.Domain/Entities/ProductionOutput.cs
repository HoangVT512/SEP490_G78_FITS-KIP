using System;
using System.Collections.Generic;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class ProductionOutput
{
    public int OutputId { get; set; }

    public int LineId { get; set; }

    public int StageId { get; set; }

    public int ShiftId { get; set; }

    public DateOnly Date { get; set; }

    public decimal ActualQuantity { get; set; }

    public int DowntimeMinutes { get; set; }

    public virtual Line Line { get; set; } = null!;

    public virtual Shift Shift { get; set; } = null!;

    public virtual Stage Stage { get; set; } = null!;
}
