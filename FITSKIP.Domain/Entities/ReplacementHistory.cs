using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class ReplacementHistory
{
    public int ReplacementId { get; set; }

    public int? EquipmentId { get; set; }

    public int PartId { get; set; }

    public int Quantity { get; set; }

    public DateTime ReplacedDate { get; set; }

    public string ReplacedBy { get; set; } = null!;

    public string Status { get; set; } = "Pending";

    public string? Remarks { get; set; }

    public virtual Equipment? Equipment { get; set; }

    public virtual SparePart Part { get; set; } = null!;

    public virtual User ReplacedByNavigation { get; set; } = null!;
}
