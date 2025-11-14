using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class CreateLineRequest
{
    [Required(ErrorMessage = "Tên chuyền sản xuất là bắt buộc")]
    [StringLength(100, ErrorMessage = "Tên chuyền sản xuất không được vượt quá 100 ký tự")]
    public string LineName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mã chuyền sản xuất là bắt buộc")]
    [StringLength(50, ErrorMessage = "Mã chuyền sản xuất không được vượt quá 50 ký tự")]
    [RegularExpression(@"^[a-zA-Z0-9\-_]+$", ErrorMessage = "Mã chuyền sản xuất chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không có khoảng trắng")]
    public string LineCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phòng ban là bắt buộc")]
    public int DepartmentId { get; set; }
}