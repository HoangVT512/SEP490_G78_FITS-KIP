using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class CreateProductionOutputRequest
{
    [Required(ErrorMessage = "ID chuyền sản xuất là bắt buộc")]
    [Range(1, int.MaxValue, ErrorMessage = "ID chuyền sản xuất phải lớn hơn 0")]
    public int LineId { get; set; }

    [Required(ErrorMessage = "Ngày sản xuất là bắt buộc")]
    public DateTime Date { get; set; }

    [Range(1, 1440, ErrorMessage = "Thời gian tải phải từ 1 đến 1440 phút")]
    public int? LoadingTime { get; set; }

    [Required(ErrorMessage = "ID ca làm việc là bắt buộc")]
    [Range(1, int.MaxValue, ErrorMessage = "ID ca làm việc phải lớn hơn 0")]
    public int ShiftId { get; set; }

    [Required(ErrorMessage = "Thời gian slot là bắt buộc")]
    [StringLength(10, MinimumLength = 3, ErrorMessage = "Thời gian slot phải từ 3 đến 10 ký tự")]
    [RegularExpression(@"^\d{1,2}h-\d{1,2}h$", ErrorMessage = "Thời gian slot phải có định dạng 'Xh-Yh' (VD: 7h-8h)")]
    public string SlotTime { get; set; } = string.Empty; // Format: "7h-8h", "8h-9h", etc.

    [Range(1, 10000, ErrorMessage = "Số lượng mục tiêu phải từ 1 đến 10.000")]
    public int? TargetAmount { get; set; } // Sản phẩm mục tiêu

    [Range(0, 10000, ErrorMessage = "Số lượng thực tế phải từ 0 đến 10.000")]
    public int? ResultAmount { get; set; } // Sản phẩm thực tế
}
