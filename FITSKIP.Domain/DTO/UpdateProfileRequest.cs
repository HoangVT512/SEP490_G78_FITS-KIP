using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace FITSKIP.Domain.DTO;

public class UpdateProfileRequest
{
    [Required(ErrorMessage = "Họ và tên là bắt buộc")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
    [StringLength(256, ErrorMessage = "Email không được vượt quá 256 ký tự")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
    [RegularExpression(@"^0[0-9]{9}$", ErrorMessage = "Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0")]
    public string PhoneNumber { get; set; } = string.Empty;

    public string? ProfileImageUrl { get; set; }
}