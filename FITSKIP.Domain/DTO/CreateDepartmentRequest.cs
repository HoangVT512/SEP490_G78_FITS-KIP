using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class CreateDepartmentRequest
{
    [Required(ErrorMessage = "Tên phòng ban không được để trống")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Tên phòng ban phải có độ dài từ 2 đến 100 ký tự")]
    [RegularExpression(@"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+$", ErrorMessage = "Tên phòng ban chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới")]
    public string DepartmentName { get; set; } = string.Empty;

    [StringLength(500, ErrorMessage = "Mô tả phòng ban không được vượt quá 500 ký tự")]
    public string? Description { get; set; }
}



