using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class UpdatePurchaseRequestRequest
{
    [Required(ErrorMessage = "Part ID là bắt buộc")]
    public int PartId { get; set; }

    [Required(ErrorMessage = "Số lượng là bắt buộc")]
    [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
    public int Quantity { get; set; }

    [MaxLength(500, ErrorMessage = "Lý do không được vượt quá 500 ký tự")]
    public string? Reason { get; set; }
}

