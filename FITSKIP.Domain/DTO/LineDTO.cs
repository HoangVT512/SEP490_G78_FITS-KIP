namespace FITSKIP.Domain.DTO;

public class LineDTO
{
    public int LineId { get; set; }
    public string LineName { get; set; } = string.Empty;
    public string? LineCode { get; set; }
    public string? Description { get; set; }
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public int StageCount { get; set; }
    public int EquipmentCount { get; set; }
}