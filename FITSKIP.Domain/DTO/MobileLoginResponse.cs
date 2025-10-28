namespace FITSKIP.Domain.DTO;

public class MobileLoginResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public MobileUserDTO User { get; set; } = null!;
    public MobileLineDTO Line { get; set; } = null!;
}

public class MobileUserDTO
{
    public string Id { get; set; } = null!;
    public string? FullName { get; set; }
    public string? EmployeeCode { get; set; }
    public bool IsActive { get; set; }
    public List<string>? Roles { get; set; }
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
}

public class MobileLineDTO
{
    public int LineId { get; set; }
    public string LineName { get; set; } = null!;
    public int? DepartmentId { get; set; }
    public bool IsActive { get; set; }
}