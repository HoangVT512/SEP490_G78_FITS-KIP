namespace FITSKIP.Domain.DTO;

public class CreateProductionOutputRequest
{
    public int LineId { get; set; }
    public DateTime Date { get; set; }

    public int? LoadingTime { get; set; }
    public int ShiftId { get; set; }
    public string SlotTime { get; set; } = string.Empty; // Format: "7h-8h", "8h-9h", etc.
    public int? TargetAmount { get; set; } // Sản phẩm mục tiêu
    public int? ResultAmount { get; set; } // Sản phẩm thực tế
}
