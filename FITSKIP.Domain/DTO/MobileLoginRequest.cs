using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class MobileLoginRequest
{
    [Required(ErrorMessage = "Mã nhân viên là bắt buộc")]
    public string EmployeeCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "ID dây chuyền là bắt buộc")]
    public int LineId { get; set; }
}