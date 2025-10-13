using Microsoft.AspNetCore.Identity;

namespace FITSKIP.Domain.Entities;

public class User : IdentityUser
{
    public string? FullName { get; set; }
    public string? EmployeeCode { get; set; }
    public bool IsActive { get; set; } = true;

    // Foreign Key to Role (1-to-many relationship)
    public string? RoleId { get; set; }

    // Foreign Key to Department (many-to-one relationship)
    public int? DepartmentId { get; set; }

    // Navigation properties
    public virtual IdentityRole? Role { get; set; }
    public virtual Department? Department { get; set; }
    public virtual ICollection<PurchaseRequest> PurchaseRequestApprovedByNavigations { get; set; } = new List<PurchaseRequest>();
    public virtual ICollection<PurchaseRequest> PurchaseRequestRejectedByNavigations { get; set; } = new List<PurchaseRequest>();
    public virtual ICollection<PurchaseRequest> PurchaseRequestRequestedByNavigations { get; set; } = new List<PurchaseRequest>();
    public virtual ICollection<UserLine> UserLines { get; set; } = new List<UserLine>();
    public virtual ICollection<MaintenancePlan> MaintenancePlans { get; set; } = new List<MaintenancePlan>();
    public virtual ICollection<ReplacementHistory> ReplacementHistories { get; set; } = new List<ReplacementHistory>();
}


