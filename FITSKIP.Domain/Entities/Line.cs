using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class Line
{
    public int LineId { get; set; }

    public string LineName { get; set; } = null!;

    public int? GroupLineId { get; set; }

    public virtual ICollection<Equipment> Equipment { get; set; } = new List<Equipment>();

    public virtual ICollection<ErrorHistory> ErrorHistories { get; set; } = new List<ErrorHistory>();

    public virtual GroupLine? GroupLine { get; set; }

    public virtual ICollection<ProductionOutput> ProductionOutputs { get; set; } = new List<ProductionOutput>();

    public virtual ICollection<Stage> Stages { get; set; } = new List<Stage>();

    public virtual ICollection<UserLine> UserLines { get; set; } = new List<UserLine>();
}
