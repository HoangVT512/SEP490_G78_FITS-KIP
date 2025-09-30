namespace FITSKIP.Domain.DTO;

public class CreateDepartmentRequest
{
    public string? DepartmentCode { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? ManagerId { get; set; }
    public string? Description { get; set; }
}


