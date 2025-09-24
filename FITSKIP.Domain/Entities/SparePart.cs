using System;
using System.Collections.Generic;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class SparePart
{
    public int PartId { get; set; }

    public string PartNumber { get; set; } = null!;

    public string PartName { get; set; } = null!;

    public int Quantity { get; set; }

    public string? Location { get; set; }

    public string? Status { get; set; }

    public virtual ICollection<PurchaseRequest> PurchaseRequests { get; set; } = new List<PurchaseRequest>();
}
