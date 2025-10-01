using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class UpdateStageRequest
{
    [Required(ErrorMessage = "Tên giai đoạn là bắt buộc")]
    [StringLength(100, ErrorMessage = "Tên giai đoạn không được vượt quá 100 ký tự")]
    public string StageName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Dây chuyền là bắt buộc")]
    public int LineId { get; set; }

    public string? Description { get; set; }

    public bool IsActive { get; set; }
}