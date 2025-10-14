namespace FITSKIP.Domain.DTO;

public class PurchaseRequestDTO
{
    public int RequestId { get; set; }
    public int PartId { get; set; }
    public string PartNumber { get; set; } = string.Empty;
    public string PartName { get; set; } = string.Empty;
    public string RequestedBy { get; set; } = string.Empty;
    public string RequestedByName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? Reason { get; set; }
    public string? Status { get; set; }
    public string? ApprovedBy { get; set; }
    public string? ApprovedByName { get; set; }
    public string? RejectedBy { get; set; }
    public string? RejectedByName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? RejectedAt { get; set; }

    public static PurchaseRequestDTO FromEntity(Domain.Entities.PurchaseRequest request)
    {
        return new PurchaseRequestDTO
        {
            RequestId = request.RequestId,
            PartId = request.PartId,
            PartNumber = request.Part?.PartNumber ?? string.Empty,
            PartName = request.Part?.PartName ?? string.Empty,
            RequestedBy = request.RequestedBy,
            RequestedByName = request.RequestedByNavigation?.FullName ?? string.Empty,
            Quantity = request.Quantity,
            Reason = request.Reason,
            Status = request.Status,
            ApprovedBy = request.ApprovedBy,
            ApprovedByName = request.ApprovedByNavigation?.FullName,
            RejectedBy = request.RejectedBy,
            RejectedByName = request.RejectedByNavigation?.FullName,
            ApprovedAt = request.ApprovedAt,
            RejectedAt = request.RejectedAt
        };
    }
}

