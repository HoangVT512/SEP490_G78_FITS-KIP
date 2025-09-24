using System;
using System.Collections.Generic;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class PurchaseRequest
{
    public int RequestId { get; set; }

    public int PartId { get; set; }

    public string RequestedBy { get; set; } = null!;

    public int Quantity { get; set; }

    public string? Urgency { get; set; }

    public string? Reason { get; set; }

    public string? Status { get; set; }

    public string? ApprovedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public virtual AspNetUser? ApprovedByNavigation { get; set; }

    public virtual SparePart Part { get; set; } = null!;

    public virtual AspNetUser RequestedByNavigation { get; set; } = null!;
}
