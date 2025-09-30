using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class Department
{
    public int DepartmentId { get; set; }

    public string DepartmentName { get; set; } = null!;

    public string? ManagerId { get; set; }

    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual User? Manager { get; set; }

    public virtual ICollection<Line> Lines { get; set; } = new List<Line>();
}
