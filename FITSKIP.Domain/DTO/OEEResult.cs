namespace FITSKIP.Domain.DTO;

public class OEEResult
{
    public string CalculationType { get; set; } = string.Empty; // "shift", "day"
    public decimal OEE { get; set; } // 0-1
    public decimal OEEPercentage { get; set; } // 0-100
}