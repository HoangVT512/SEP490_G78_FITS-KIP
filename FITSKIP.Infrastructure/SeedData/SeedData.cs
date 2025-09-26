using FITSKIP.Domain.Entities;
using FITSKIP.Infrastructure.DbContexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FITSKIP.Infrastructure.SeedData;

public static class SeedData
{
    public static async Task SeedAsync(FitskipDbContext context)
    {
        // NOTE: Do NOT remove existing data. Make seeding idempotent and additive only.

        // Seed Roles (only add missing)
        var rolesToEnsure = new[]
        {
            new { Name = "Quản trị viên", Normalized = "QUANTRI" },
            new { Name = "Quản lý", Normalized = "QUANLY" },
            new { Name = "Người dùng", Normalized = "NGUOIDUNG" }
        };

        foreach (var r in rolesToEnsure)
        {
            if (!await context.Roles.AnyAsync(x => x.Name == r.Name))
            {
                await context.Roles.AddAsync(new IdentityRole { Id = Guid.NewGuid().ToString(), Name = r.Name, NormalizedName = r.Normalized });
            }
        }

        await context.SaveChangesAsync();

        // Seed core users (admin, manager, basic user) - add only if missing
        var passwordHasher = new PasswordHasher<User>();

        var coreUsers = new[]
        {
            new { UserName = "admin@congty.com", Email = "admin@congty.com", FullName = "Nguyễn Văn Admin", EmployeeCode = "ADM001", Password = "Matkhau123!" },
            new { UserName = "quanly@congty.com", Email = "quanly@congty.com", FullName = "Trần Thị Quản lý", EmployeeCode = "QLY001", Password = "Matkhau123!" },
            new { UserName = "nguoidung@congty.com", Email = "nguoidung@congty.com", FullName = "Lê Văn Người dùng", EmployeeCode = "USR001", Password = "Matkhau123!" }
        };

        foreach (var u in coreUsers)
        {
            var normalizedEmail = u.Email.ToUpperInvariant();
            var exists = await context.Users.AnyAsync(x => x.NormalizedEmail == normalizedEmail || x.UserName == u.UserName);
            if (!exists)
            {
                var newUser = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = u.UserName,
                    NormalizedUserName = u.UserName.ToUpperInvariant(),
                    Email = u.Email,
                    NormalizedEmail = normalizedEmail,
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = u.FullName,
                    EmployeeCode = u.EmployeeCode
                };

                newUser.PasswordHash = passwordHasher.HashPassword(newUser, u.Password);
                await context.Users.AddAsync(newUser);
            }
        }

        await context.SaveChangesAsync();

        // Assign roles to core users if not already assigned
        async Task EnsureUserRole(string email, string roleName)
        {
            var user = await context.Users.FirstOrDefaultAsync(x => x.NormalizedEmail == email.ToUpperInvariant());
            var role = await context.Roles.FirstOrDefaultAsync(x => x.Name == roleName);
            if (user != null && role != null)
            {
                var already = await context.UserRoles.AnyAsync(ur => ur.UserId == user.Id && ur.RoleId == role.Id);
                if (!already)
                {
                    context.UserRoles.Add(new IdentityUserRole<string> { UserId = user.Id, RoleId = role.Id });
                }
            }
        }

        await EnsureUserRole("admin@congty.com", "Quản trị viên");
        await EnsureUserRole("quanly@congty.com", "Quản lý");

        await context.SaveChangesAsync();

        // Seed Departments (add if missing by name)
        var departmentsToEnsure = new[]
        {
            new Department { DepartmentName = "Công nghệ thông tin", Description = "Quản lý hệ thống CNTT" },
            new Department { DepartmentName = "Nhân sự", Description = "Quản lý nhân viên và tổ chức" },
            new Department { DepartmentName = "Sản xuất", Description = "Quản lý quy trình sản xuất" }
        };

        foreach (var d in departmentsToEnsure)
        {
            if (!await context.Departments.AnyAsync(x => x.DepartmentName == d.DepartmentName))
            {
                await context.Departments.AddAsync(d);
            }
        }

        // Seed Equipment (add if missing by code)
        var equipmentsToEnsure = new[]
        {
            new Equipment { EquipmentCode = "CNC001", EquipmentName = "Máy CNC 001", Origin = "Nhật Bản", Yom = 2022, IsActive = true },
            new Equipment { EquipmentCode = "LASER001", EquipmentName = "Máy hàn laser", Origin = "Đức", Yom = 2023, IsActive = true },
            new Equipment { EquipmentCode = "CONVEYOR001", EquipmentName = "Hệ thống băng tải", Origin = "Việt Nam", Yom = 2021, IsActive = false }
        };

        foreach (var e in equipmentsToEnsure)
        {
            if (!await context.Equipment.AnyAsync(x => x.EquipmentCode == e.EquipmentCode))
            {
                await context.Equipment.AddAsync(e);
            }
        }

        // Seed Spare Parts (add if missing by part number)
        var partsToEnsure = new[]
        {
            new SparePart { PartNumber = "SERVO001", PartName = "Động cơ servo", Quantity = 5, Location = "Kho linh kiện A", Status = "Sẵn sàng" },
            new SparePart { PartNumber = "FILTER001", PartName = "Bộ lọc dầu", Quantity = 10, Location = "Kho linh kiện B", Status = "Sẵn sàng" },
            new SparePart { PartNumber = "SENSOR001", PartName = "Cảm biến nhiệt độ", Quantity = 8, Location = "Kho linh kiện A", Status = "Sẵn sàng" }
        };

        foreach (var p in partsToEnsure)
        {
            if (!await context.SpareParts.AnyAsync(x => x.PartNumber == p.PartNumber))
            {
                await context.SpareParts.AddAsync(p);
            }
        }

        await context.SaveChangesAsync();

        // Seed an example error history and related assignments/purchase requests only if not present
        if (!await context.ErrorHistories.AnyAsync())
        {
            var equipment = await context.Equipment.FirstOrDefaultAsync();
            if (equipment != null)
            {
                var errorHistories = new List<ErrorHistory>
                {
                    new ErrorHistory { EquipmentId = equipment.EquipmentId, ErrorDescription = "Máy bị kẹt băng tải", StartTime = DateTime.Now.AddDays(-2), EndTime = DateTime.Now.AddDays(-1), Reason = "Bộ lọc bị tắc", Solution = "Thay thế bộ lọc và vệ sinh băng tải", Duration = 2.5m }
                };
                await context.ErrorHistories.AddRangeAsync(errorHistories);
                await context.SaveChangesAsync();

                var error = await context.ErrorHistories.FirstOrDefaultAsync();
                var technician = await context.Users.FirstOrDefaultAsync(u => u.UserName == "quanly@congty.com");
                if (error != null && technician != null && !await context.MaintenanceAssignments.AnyAsync())
                {
                    var assignments = new List<MaintenanceAssignment>
                    {
                        new MaintenanceAssignment { ErrorId = error.ErrorId, TechnicianId = technician.Id, AssignedAt = DateTime.Now.AddDays(-2), CompletedAt = DateTime.Now.AddDays(-1), ResolutionDetail = "Đã thay thế linh kiện và kiểm tra hệ thống" }
                    };
                    await context.MaintenanceAssignments.AddRangeAsync(assignments);
                }
            }
        }

        if (!await context.PurchaseRequests.AnyAsync())
        {
            var sparePart = await context.SpareParts.FirstOrDefaultAsync();
            var requester = await context.Users.FirstOrDefaultAsync(u => u.UserName == "quanly@congty.com");

            if (sparePart != null && requester != null)
            {
                var purchaseRequests = new List<PurchaseRequest>
                {
                    new PurchaseRequest { PartId = sparePart.PartId, RequestedBy = requester.Id, Quantity = 5, Urgency = "Cao", Reason = "Tồn kho thấp", Status = "Đã duyệt", ApprovedBy = requester.Id, ApprovedAt = DateTime.Now.AddDays(-2) }
                };
                await context.PurchaseRequests.AddRangeAsync(purchaseRequests);
            }
        }

        await context.SaveChangesAsync();
    }
}