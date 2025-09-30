using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class GroupLine
{
    public int GroupLineId { get; set; }

    public string GroupLineName { get; set; } = null!;

    public virtual ICollection<Line> Lines { get; set; } = new List<Line>();
}
