using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class UpdateLineRequest
{
    [Required(ErrorMessage = "Tên chuyền là bắt buộc")]
    [StringLength(100, ErrorMessage = "Tên chuyền không được vượt quá 100 ký tự")]
    public string LineName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phòng ban là bắt buộc")]
    public int DepartmentId { get; set; }

    public bool IsActive { get; set; } = true;
}