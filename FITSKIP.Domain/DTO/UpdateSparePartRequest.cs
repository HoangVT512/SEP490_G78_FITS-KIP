using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO
{
    public class UpdateSparePartRequest
    {
        [Required(ErrorMessage = "Mã phụ tùng là bắt buộc")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Mã phụ tùng phải có độ dài từ 2 đến 50 ký tự")]
        [RegularExpression(@"^[a-zA-Z0-9\-_]+$", ErrorMessage = "Mã phụ tùng chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không có khoảng trắng")]
        public string PartNumber { get; set; } = null!;

        [Required(ErrorMessage = "Tên phụ tùng là bắt buộc")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Tên phụ tùng phải có độ dài từ 2 đến 200 ký tự")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+$", ErrorMessage = "Tên phụ tùng chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới")]
        public string PartName { get; set; } = null!;

        [StringLength(100, ErrorMessage = "Loại phụ tùng không được vượt quá 100 ký tự")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$", ErrorMessage = "Loại phụ tùng chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới")]
        public string? PartType { get; set; }

        [StringLength(100, ErrorMessage = "Vật liệu không được vượt quá 100 ký tự")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$", ErrorMessage = "Vật liệu chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới")]
        public string? Material { get; set; }

        [StringLength(500, ErrorMessage = "Thông số kỹ thuật không được vượt quá 500 ký tự")]
        public string? Specifications { get; set; }

        [StringLength(100, ErrorMessage = "Nhà cung cấp không được vượt quá 100 ký tự")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$", ErrorMessage = "Nhà cung cấp chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới")]
        public string? Supplier { get; set; }

        [Range(0, 1000000000, ErrorMessage = "Giá mua phải nằm trong khoảng 0 đến 1.000.000.000 VND")]
        public decimal? PurchasePrice { get; set; }

        [Range(0, 1000000, ErrorMessage = "Số lượng phải nằm trong khoảng 0 đến 1.000.000")]
        public int Quantity { get; set; }

        [Range(0, 100000, ErrorMessage = "Số lượng tối thiểu phải nằm trong khoảng 0 đến 100.000")]
        public int MinQuantity { get; set; } = 5;

        [StringLength(100, ErrorMessage = "Vị trí không được vượt quá 100 ký tự")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$", ErrorMessage = "Vị trí chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới")]
        public string? Location { get; set; }

        [StringLength(100, ErrorMessage = "Kho không được vượt quá 100 ký tự")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$", ErrorMessage = "Kho chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới")]
        public string? Warehouse { get; set; }

        [StringLength(20, ErrorMessage = "Đơn vị tính không được vượt quá 20 ký tự")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$", ErrorMessage = "Đơn vị tính chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới")]
        public string? UoM { get; set; }

        public string? ReplacementCycle { get; set; }

        public DateTime? DateAdded { get; set; }

        public string? Status { get; set; }

        public string? DocumentUrl { get; set; }
    }
}
