namespace FITSKIP.Domain.DTO;

public class SlotTimeResponse
{
    public string SlotTime { get; set; } = string.Empty; // Format: "7h-8h"
    public int LoadingTime { get; set; } // Minutes
    public bool IsAvailable { get; set; } = true;
    public string? Reason { get; set; } // Reason if not available
}
