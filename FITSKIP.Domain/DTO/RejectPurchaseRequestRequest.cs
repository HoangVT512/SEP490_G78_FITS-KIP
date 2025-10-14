using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class RejectPurchaseRequestRequest
{
    [Required(ErrorMessage = "Lý do từ chối là bắt buộc")]
    [MaxLength(500, ErrorMessage = "Lý do từ chối không được vượt quá 500 ký tự")]
    public string Reason { get; set; } = null!;
}

