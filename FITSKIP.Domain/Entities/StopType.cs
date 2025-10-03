using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class StopType
{
    public int TypeId { get; set; }

    public string? TypeName { get; set; }

    public virtual ICollection<IncidentHistory> IncidentHistories { get; set; } = new List<IncidentHistory>();
}
