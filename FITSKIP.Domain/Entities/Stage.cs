using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class Stage
{
    public int StageId { get; set; }

    public string StageName { get; set; } = null!;

    public int? LineId { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual ICollection<Equipment> Equipment { get; set; } = new List<Equipment>();

    public virtual ICollection<ErrorHistory> ErrorHistories { get; set; } = new List<ErrorHistory>();

    public virtual Line? Line { get; set; }

    public virtual ICollection<ProductionOutput> ProductionOutputs { get; set; } = new List<ProductionOutput>();
}
