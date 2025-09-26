using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class LoginRequest
{
    [Required(ErrorMessage = "Email hoặc mã nhân viên là bắt buộc")]
    public string EmailOrEmployeeCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; } = false;
}