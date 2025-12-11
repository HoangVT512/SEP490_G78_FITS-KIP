using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class PurchaseRequest
{
    public int RequestId { get; set; }

    public int PartId { get; set; }

    public string RequestedBy { get; set; } = null!;

    public int Quantity { get; set; }

    public string? Reason { get; set; }

    public string? Status { get; set; }

    public string? ApprovedBy { get; set; }

    public string? RejectedBy { get; set; }

    public string? ReceivedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public DateTime? RejectedAt { get; set; }

    public DateTime? ReceivedAt { get; set; }

    public virtual User? ApprovedByNavigation { get; set; }

    public virtual User? RejectedByNavigation { get; set; }

    public virtual User? ReceivedByNavigation { get; set; }

    public virtual SparePart? Part { get; set; } = null!;

    public virtual User? RequestedByNavigation { get; set; } = null!;
}
