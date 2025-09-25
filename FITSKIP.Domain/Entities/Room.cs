using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class Room
{
    public int RoomId { get; set; }

    public string RoomName { get; set; } = null!;

    public int? DepartmentId { get; set; }

    public virtual Department? Department { get; set; }

    public virtual ICollection<GroupLine> GroupLines { get; set; } = new List<GroupLine>();
}
