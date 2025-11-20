using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class CreateEquipmentRequest
{
    [Required(ErrorMessage = "Mã thiết bị là bắt buộc")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Mã thiết bị phải có độ dài từ 2 đến 50 ký tự")]
    [RegularExpression(@"^[a-zA-Z0-9\-_]+$", ErrorMessage = "Mã thiết bị chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không có khoảng trắng")]
    public string EquipmentCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên thiết bị là bắt buộc")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Tên thiết bị phải có độ dài từ 2 đến 200 ký tự")]
    [RegularExpression(@"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+$", ErrorMessage = "Tên thiết bị chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới")]
    public string EquipmentName { get; set; } = string.Empty;

    public DateOnly? DateUse { get; set; }

    [StringLength(100, ErrorMessage = "Xuất xứ không được vượt quá 100 ký tự")]
    [RegularExpression(@"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$", ErrorMessage = "Xuất xứ chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới")]
    public string? Origin { get; set; }

    [Range(1900, 2030, ErrorMessage = "Năm sản xuất phải nằm trong khoảng 1900 đến 2030")]
    public int? Yom { get; set; }  // Year of manufacture

    public int? StageId { get; set; }

    public bool IsActive { get; set; } = true;
}
