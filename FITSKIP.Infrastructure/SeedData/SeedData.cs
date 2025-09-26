using FITSKIP.Domain.Entities;
using FITSKIP.Infrastructure.DbContexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FITSKIP.Infrastructure.SeedData;

public static class SeedData
{
    public static async Task SeedAsync(FitskipDbContext context)
    {
        Console.WriteLine("Starting seed data process...");
        
        // Don't clear data, just ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Seed Roles
        if (!await context.Roles.AnyAsync())
        {
            var roles = new List<IdentityRole>
            {
                new IdentityRole { Id = Guid.NewGuid().ToString(), Name = "Quản trị viên", NormalizedName = "QUANTRI" },
                new IdentityRole { Id = Guid.NewGuid().ToString(), Name = "Quản lý", NormalizedName = "QUANLY" },
                new IdentityRole { Id = Guid.NewGuid().ToString(), Name = "Người dùng", NormalizedName = "NGUOIDUNG" }
            };
            await context.Roles.AddRangeAsync(roles);
        }

        // Seed Users
        if (!await context.Users.AnyAsync())
        {
            var passwordHasher = new PasswordHasher<User>();

            var users = new List<User>
            {
                new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "admin@congty.com",
                    NormalizedUserName = "ADMIN@CONGTY.COM",
                    Email = "admin@congty.com",
                    NormalizedEmail = "ADMIN@CONGTY.COM",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Nguyễn Văn Admin",
                    EmployeeCode = "ADM001"
                },
                new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "quanly@congty.com",
                    NormalizedUserName = "QUANLY@CONGTY.COM",
                    Email = "quanly@congty.com",
                    NormalizedEmail = "QUANLY@CONGTY.COM",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Trần Thị Quản lý",
                    EmployeeCode = "QLY001"
                },
                new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "nguoidung@congty.com",
                    NormalizedUserName = "NGUOIDUNG@CONGTY.COM",
                    Email = "nguoidung@congty.com",
                    NormalizedEmail = "NGUOIDUNG@CONGTY.COM",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Lê Văn Người dùng",
                    EmployeeCode = "USR001"
                }
            };

            // Hash passwords
            foreach (var user in users)
            {
                user.PasswordHash = passwordHasher.HashPassword(user, "Matkhau123!");
            }

            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync(); // Save users first
        }

        // Assign roles to users (separate check)
        if (!await context.UserRoles.AnyAsync())
        {
            Console.WriteLine("Seeding user roles...");
            
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.NormalizedName == "QUANTRI");
            var managerRole = await context.Roles.FirstOrDefaultAsync(r => r.NormalizedName == "QUANLY");
            var userRole = await context.Roles.FirstOrDefaultAsync(r => r.NormalizedName == "NGUOIDUNG");

            var adminUser = await context.Users.FirstOrDefaultAsync(u => u.EmployeeCode == "ADM001");
            var managerUser = await context.Users.FirstOrDefaultAsync(u => u.EmployeeCode == "QLY001");
            var regularUser = await context.Users.FirstOrDefaultAsync(u => u.EmployeeCode == "USR001");

            if (adminRole != null && adminUser != null)
            {
                Console.WriteLine($"Assigning admin role to user {adminUser.Email}");
                await context.UserRoles.AddAsync(new IdentityUserRole<string> { UserId = adminUser.Id, RoleId = adminRole.Id });
            }
            if (managerRole != null && managerUser != null)
            {
                Console.WriteLine($"Assigning manager role to user {managerUser.Email}");
                await context.UserRoles.AddAsync(new IdentityUserRole<string> { UserId = managerUser.Id, RoleId = managerRole.Id });
            }
            if (userRole != null && regularUser != null)
            {
                Console.WriteLine($"Assigning user role to user {regularUser.Email}");
                await context.UserRoles.AddAsync(new IdentityUserRole<string> { UserId = regularUser.Id, RoleId = userRole.Id });
            }
            
            await context.SaveChangesAsync(); // Save role assignments
        }

        // Seed Departments
        if (!await context.Departments.AnyAsync())
        {
            var departments = new List<Department>
            {
                new Department { DepartmentName = "Công nghệ thông tin", Description = "Quản lý hệ thống CNTT" },
                new Department { DepartmentName = "Nhân sự", Description = "Quản lý nhân viên và tổ chức" },
                new Department { DepartmentName = "Sản xuất", Description = "Quản lý quy trình sản xuất" }
            };
            await context.Departments.AddRangeAsync(departments);
        }

        // Seed Equipment
        if (!await context.Equipment.AnyAsync())
        {
            var equipment = new List<Equipment>
            {
                new Equipment { EquipmentCode = "CNC001", EquipmentName = "Máy CNC 001", Origin = "Nhật Bản", Yom = 2022, IsActive = true },
                new Equipment { EquipmentCode = "LASER001", EquipmentName = "Máy hàn laser", Origin = "Đức", Yom = 2023, IsActive = true },
                new Equipment { EquipmentCode = "CONVEYOR001", EquipmentName = "Hệ thống băng tải", Origin = "Việt Nam", Yom = 2021, IsActive = false }
            };
            await context.Equipment.AddRangeAsync(equipment);
        }

        // Seed Spare Parts
        if (!await context.SpareParts.AnyAsync())
        {
            var spareParts = new List<SparePart>
            {
                new SparePart { PartNumber = "SERVO001", PartName = "Động cơ servo", Quantity = 5, Location = "Kho linh kiện A", Status = "Sẵn sàng" },
                new SparePart { PartNumber = "FILTER001", PartName = "Bộ lọc dầu", Quantity = 10, Location = "Kho linh kiện B", Status = "Sẵn sàng" },
                new SparePart { PartNumber = "SENSOR001", PartName = "Cảm biến nhiệt độ", Quantity = 8, Location = "Kho linh kiện A", Status = "Sẵn sàng" }
            };
            await context.SpareParts.AddRangeAsync(spareParts);
        }

        // Seed Error History (Corrective Maintenance)
        if (!await context.ErrorHistories.AnyAsync())
        {
            var equipment = await context.Equipment.FirstOrDefaultAsync();
            if (equipment != null)
            {
                var errorHistories = new List<ErrorHistory>
                {
                    new ErrorHistory { EquipmentId = equipment.EquipmentId, ErrorDescription = "Máy bị kẹt băng tải", StartTime = DateTime.Now.AddDays(-2), EndTime = DateTime.Now.AddDays(-1), Reason = "Bộ lọc bị tắc", Solution = "Thay thế bộ lọc và vệ sinh băng tải", Duration = 2.5m },
                    new ErrorHistory { EquipmentId = equipment.EquipmentId, ErrorDescription = "Động cơ servo bị quá nhiệt", StartTime = DateTime.Now.AddDays(-1), EndTime = null, Reason = "Hệ thống làm mát hỏng", Solution = null, Duration = null }
                };
                await context.ErrorHistories.AddRangeAsync(errorHistories);
            }
        }

        // Seed Maintenance Assignments
        if (!await context.MaintenanceAssignments.AnyAsync())
        {
            var error = await context.ErrorHistories.FirstOrDefaultAsync();
            var technician = await context.Users.FirstOrDefaultAsync(u => u.UserName == "quanly@congty.com");

            if (error != null && technician != null)
            {
                var assignments = new List<MaintenanceAssignment>
                {
                    new MaintenanceAssignment { ErrorId = error.ErrorId, TechnicianId = technician.Id, AssignedAt = DateTime.Now.AddDays(-2), CompletedAt = DateTime.Now.AddDays(-1), ResolutionDetail = "Đã thay thế linh kiện và kiểm tra hệ thống" },
                    new MaintenanceAssignment { ErrorId = error.ErrorId, TechnicianId = technician.Id, AssignedAt = DateTime.Now, CompletedAt = null, ResolutionDetail = null }
                };
                await context.MaintenanceAssignments.AddRangeAsync(assignments);
            }
        }

        // Seed Purchase Requests
        if (!await context.PurchaseRequests.AnyAsync())
        {
            var sparePart = await context.SpareParts.FirstOrDefaultAsync();
            var requester = await context.Users.FirstOrDefaultAsync(u => u.UserName == "quanly@congty.com");

            if (sparePart != null && requester != null)
            {
                var purchaseRequests = new List<PurchaseRequest>
                {
                    new PurchaseRequest { PartId = sparePart.PartId, RequestedBy = requester.Id, Quantity = 5, Urgency = "Cao", Reason = "Tồn kho thấp", Status = "Đã duyệt", ApprovedBy = requester.Id, ApprovedAt = DateTime.Now.AddDays(-2) },
                    new PurchaseRequest { PartId = sparePart.PartId, RequestedBy = requester.Id, Quantity = 3, Urgency = "Thấp", Reason = "Dự phòng", Status = "Chờ duyệt", ApprovedBy = null, ApprovedAt = null }
                };
                await context.PurchaseRequests.AddRangeAsync(purchaseRequests);
            }
        }

        // Seed Users table
        if (!await context.Users.AnyAsync())
        {
            var users = new List<User>
            {
                new User { Id = "1", UserName = "nguyenvana", EmployeeCode = "U001", FullName = "Nguyễn Văn A", Email = "a@example.com" },
                new User { Id = "2", UserName = "tranthib", EmployeeCode = "U002", FullName = "Trần Thị B", Email = "b@example.com" },
                new User { Id = "3", UserName = "levanc", EmployeeCode = "U003", FullName = "Lê Văn C", Email = "c@example.com" },
                new User { Id = "4", UserName = "phamthid", EmployeeCode = "U004", FullName = "Phạm Thị D", Email = "d@example.com" },
                new User { Id = "5", UserName = "hoangvane", EmployeeCode = "U005", FullName = "Hoàng Văn E", Email = "e@example.com" }
            };
            await context.Users.AddRangeAsync(users);
        }

        await context.SaveChangesAsync();
    }
}