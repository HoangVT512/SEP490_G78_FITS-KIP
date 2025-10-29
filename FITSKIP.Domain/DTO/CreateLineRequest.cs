using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class CreateLineRequest
{
    [Required(ErrorMessage = "Tên chuyền là bắt buộc")]
    [StringLength(100, ErrorMessage = "Tên chuyền không được vượt quá 100 ký tự")]
    public string LineName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mã chuyền là bắt buộc")]
    [StringLength(50, ErrorMessage = "Mã chuyền không được vượt quá 50 ký tự")]
        [RegularExpression(@"^[a-zA-Z0-9\-_]+$", ErrorMessage = "Mã dây chuyền chỉ chứa chữ cái, số, dấu gạch ngang và dấu gạch dưới, không có khoảng trắng")]
    public string LineCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phòng ban là bắt buộc")]
    public int DepartmentId { get; set; }
}