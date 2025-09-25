using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class Department
{
    public int DepartmentId { get; set; }

    public string DepartmentName { get; set; } = null!;

    public string? ManagerId { get; set; }

    public string? Description { get; set; }

    public virtual User? Manager { get; set; }

    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}
