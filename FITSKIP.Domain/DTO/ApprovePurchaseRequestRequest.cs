using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class ApprovePurchaseRequestRequest
{
    [MaxLength(500, ErrorMessage = "Ghi chú không được vượt quá 500 ký tự")]
    public string? Note { get; set; }
}

