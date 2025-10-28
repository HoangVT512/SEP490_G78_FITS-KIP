namespace FITSKIP.Domain.DTO;

public class UpdateProductionOutputRequest
{
    public int? LoadingTime { get; set; }
    public int? TargetAmount { get; set; }
    public int? ResultAmount { get; set; }
}
