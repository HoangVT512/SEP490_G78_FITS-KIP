namespace FITSKIP.Domain.DTO;

public class ProductionOutputDTO
{
    public int OutputId { get; set; }
    public int LineId { get; set; }
    public string LineName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public int ShiftId { get; set; }
    public string ShiftName { get; set; } = string.Empty;
    public string SlotTime { get; set; } = string.Empty;
    public int? LoadingTime { get; set; }
    public int? TargetAmount { get; set; }
    public int? ResultAmount { get; set; }
    public decimal? OEE { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public static ProductionOutputDTO FromEntity(Domain.Entities.ProductionOutput output)
    {
        return new ProductionOutputDTO
        {
            OutputId = output.OutputId,
            LineId = output.LineId,
            LineName = output.Line?.LineName ?? string.Empty,
            Date = output.Date,
            ShiftId = output.ShiftId,
            ShiftName = output.Shift?.ShiftName ?? string.Empty,
            SlotTime = output.SlotTime,
            LoadingTime = output.LoadingTime,
            TargetAmount = output.TargetAmount,
            ResultAmount = output.ResultAmount,
            OEE = output.OEE,
            CreatedAt = output.CreatedAt,
            UpdatedAt = output.UpdatedAt
        };
    }
}
