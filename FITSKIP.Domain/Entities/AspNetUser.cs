using System;
using System.Collections.Generic;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class AspNetUser
{
    public string Id { get; set; } = null!;

    public string? UserName { get; set; }

    public string? NormalizedUserName { get; set; }

    public string? Email { get; set; }

    public string? NormalizedEmail { get; set; }

    public bool EmailConfirmed { get; set; }

    public string? PasswordHash { get; set; }

    public string? SecurityStamp { get; set; }

    public string? ConcurrencyStamp { get; set; }

    public string? PhoneNumber { get; set; }

    public bool PhoneNumberConfirmed { get; set; }

    public bool TwoFactorEnabled { get; set; }

    public DateTimeOffset? LockoutEnd { get; set; }

    public bool LockoutEnabled { get; set; }

    public int AccessFailedCount { get; set; }

    public string? FullName { get; set; }

    public string? Gender { get; set; }

    public string? EmployeeCode { get; set; }

    public string? Position { get; set; }

    public virtual ICollection<AspNetUserClaim> AspNetUserClaims { get; set; } = new List<AspNetUserClaim>();

    public virtual ICollection<AspNetUserLogin> AspNetUserLogins { get; set; } = new List<AspNetUserLogin>();

    public virtual ICollection<AspNetUserToken> AspNetUserTokens { get; set; } = new List<AspNetUserToken>();

    public virtual ICollection<Department> Departments { get; set; } = new List<Department>();

    public virtual ICollection<MaintenanceAssignment> MaintenanceAssignments { get; set; } = new List<MaintenanceAssignment>();

    public virtual ICollection<PurchaseRequest> PurchaseRequestApprovedByNavigations { get; set; } = new List<PurchaseRequest>();

    public virtual ICollection<PurchaseRequest> PurchaseRequestRequestedByNavigations { get; set; } = new List<PurchaseRequest>();

    public virtual ICollection<UserLine> UserLines { get; set; } = new List<UserLine>();

    public virtual ICollection<AspNetRole> Roles { get; set; } = new List<AspNetRole>();
}
