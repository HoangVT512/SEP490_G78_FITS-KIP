using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class UpdateProfileRequest
{
    [Required(ErrorMessage = "Họ và tên là bắt buộc")]
    [StringLength(250, ErrorMessage = "Họ và tên không được vượt quá 250 ký tự")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    [StringLength(256, ErrorMessage = "Email không được vượt quá 256 ký tự")]
    public string Email { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    [StringLength(15, ErrorMessage = "Số điện thoại không được vượt quá 15 ký tự")]
    public string? PhoneNumber { get; set; }

    [StringLength(10, ErrorMessage = "Giới tính không được vượt quá 10 ký tự")]
    public string? Gender { get; set; }

    public string? ProfileImageUrl { get; set; }
}