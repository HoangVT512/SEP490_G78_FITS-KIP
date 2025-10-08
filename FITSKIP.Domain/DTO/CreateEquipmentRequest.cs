using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class CreateEquipmentRequest
{
    [Required(ErrorMessage = "Mã thiết bị là bắt buộc")]
    [StringLength(50, ErrorMessage = "Mã thiết bị không được vượt quá 50 ký tự")]
    public string EquipmentCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên thiết bị là bắt buộc")]
    [StringLength(200, ErrorMessage = "Tên thiết bị không được vượt quá 200 ký tự")]
    public string EquipmentName { get; set; } = string.Empty;

    public DateOnly? DateUse { get; set; }

    [StringLength(100, ErrorMessage = "Xuất xứ không được vượt quá 100 ký tự")]
    public string? Origin { get; set; }

    public int? Yom { get; set; }  // Year of manufacture

    public int? StageId { get; set; }

    [StringLength(500, ErrorMessage = "Vấn đề không được vượt quá 500 ký tự")]
    public string? Issue { get; set; }

    public bool IsActive { get; set; } = true;
}
