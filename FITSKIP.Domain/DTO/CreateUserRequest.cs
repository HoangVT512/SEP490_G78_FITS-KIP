using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO
{
    public class CreateUserRequest
    {
        [System.Text.Json.Serialization.JsonIgnore]
        public string UserName { get; set; } = string.Empty; // Deprecated, auto-generated from EmployeeCode

        [Required(ErrorMessage = "Email là bắt buộc")]
        [StringLength(256, ErrorMessage = "Email không được vượt quá 256 ký tự")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string Email { get; set; } = string.Empty;

        [System.Text.Json.Serialization.JsonIgnore]
        public string Password { get; set; } = string.Empty; // Deprecated, default to "123456"

        [StringLength(100, MinimumLength = 2, ErrorMessage = "Họ tên phải có độ dài từ 2 đến 100 ký tự")]
        [RegularExpression(@"^[a-zA-Z\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$", ErrorMessage = "Họ tên chỉ được chứa chữ cái và khoảng trắng")]
        public string? FullName { get; set; }

        [StringLength(20, MinimumLength = 2, ErrorMessage = "Mã nhân viên phải có độ dài từ 2 đến 20 ký tự")]
        [RegularExpression(@"^[a-zA-Z0-9\-_]+$", ErrorMessage = "Mã nhân viên chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không có khoảng trắng")]
        public string? EmployeeCode { get; set; }

        [StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
        [RegularExpression(@"^(\+84|84|0)[3|5|7|8|9][0-9]{8}$", ErrorMessage = "Số điện thoại không đúng định dạng (VD: 0987654321 hoặc +84987654321)")]
        public string? PhoneNumber { get; set; }
        public string[]? RoleIds { get; set; }
        public int? DepartmentId { get; set; } // Optional: assign as manager of this department
        public int[]? LineIds { get; set; } // Optional: assign to these lines
    }
}