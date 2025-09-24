using System;
using System.Collections.Generic;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class GroupLine
{
    public int GroupLineId { get; set; }

    public string GroupLineName { get; set; } = null!;

    public int? RoomId { get; set; }

    public virtual ICollection<Line> Lines { get; set; } = new List<Line>();

    public virtual Room? Room { get; set; }
}
