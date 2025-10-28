namespace FITSKIP.Domain.DTO;

public class CreateDepartmentRequest
{
    public string DepartmentName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ManagerId { get; set; }
}



