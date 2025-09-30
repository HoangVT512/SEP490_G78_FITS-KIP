using Microsoft.AspNetCore.Identity;

namespace FITSKIP.Domain.Entities;

public class User : IdentityUser
{
    public string? FullName { get; set; }
    public string? Gender { get; set; }
    public string? EmployeeCode { get; set; }
    public string? Position { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual ICollection<Department> Departments { get; set; } = new List<Department>();
    public virtual ICollection<MaintenanceAssignment> MaintenanceAssignments { get; set; } = new List<MaintenanceAssignment>();
    public virtual ICollection<PurchaseRequest> PurchaseRequestApprovedByNavigations { get; set; } = new List<PurchaseRequest>();
    public virtual ICollection<PurchaseRequest> PurchaseRequestRequestedByNavigations { get; set; } = new List<PurchaseRequest>();
    public virtual ICollection<UserLine> UserLines { get; set; } = new List<UserLine>();
}


