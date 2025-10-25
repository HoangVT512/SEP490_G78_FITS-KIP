using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class ProductionOutput
{
    public int OutputId { get; set; }
    public int LineId { get; set; }
    public DateTime Date { get; set; }
    public int ShiftId { get; set; }
    public string SlotTime { get; set; } = null!;
    public int? LoadingTime { get; set; }
    public int? TargetAmount { get; set; } // Sản phẩm mục tiêu
    public int? ResultAmount { get; set; } // Sản phẩm thực tế
    public decimal? OEE { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual Line Line { get; set; } = null!;
    public virtual Shift Shift { get; set; } = null!;
}
