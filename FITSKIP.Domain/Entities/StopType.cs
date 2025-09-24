using System;
using System.Collections.Generic;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class StopType
{
    public int TypeId { get; set; }

    public string? TypeName { get; set; }

    public virtual ICollection<ErrorHistory> ErrorHistories { get; set; } = new List<ErrorHistory>();
}
