namespace FITSKIP.Domain.DTO;

public class ProductionOutputSlotTimeRequest
{
    public int LineId { get; set; }
    public DateTime Date { get; set; }
    public int ShiftId { get; set; }
}
