using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using FITSKIP.Domain.Entities;
using FITSKIP.Infrastructure.DbContexts;

namespace FITSKIP.Infrastructure.SeedData
{
    public static class SeedData
    {
        private static readonly PasswordHasher<User> _passwordHasher = new PasswordHasher<User>();

        public static async Task SeedRoles(FitskipDbContext context)
        {
            // Kiểm tra nếu đã có roles thì không seed nữa
            if (!await context.Roles.AnyAsync())
            {
                var roles = new List<IdentityRole>
                {
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Quản lý",
                        NormalizedName = "QUẢN LÝ",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Tổ trưởng",
                        NormalizedName = "TỔ TRƯỞNG",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Quản lý kỹ thuật",
                        NormalizedName = "QUẢN LÝ KỸ THUẬT",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Kỹ thuật viên",
                        NormalizedName = "KỸ THUẬT VIÊN",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Quản trị viên",
                        NormalizedName = "QUẢN TRỊ VIÊN",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    }
                };

                await context.Roles.AddRangeAsync(roles);
                await context.SaveChangesAsync();
            }
            else
            {
                // Update NormalizedName của các roles đã tồn tại
                await UpdateExistingRolesNormalizedName(context);
            }
        }

        public static async Task UpdateExistingRolesNormalizedName(FitskipDbContext context)
        {
            var roles = await context.Roles.ToListAsync();

            foreach (var role in roles)
            {
                if (!string.IsNullOrEmpty(role.Name))
                {
                    // Update NormalizedName với dấu tiếng Việt
                    role.NormalizedName = role.Name.ToUpperInvariant();
                }
            }

            await context.SaveChangesAsync();
        }

        public static async Task SeedDepartments(FitskipDbContext context)
        {
            if (!await context.Departments.AnyAsync())
            {
                var departments = new List<Department>
                {
                    new Department
                    {
                        DepartmentName = "Phòng Sản xuất",
                        Description = "Phòng chịu trách nhiệm sản xuất các sản phẩm điện dân dụng"
                    },
                    new Department
                    {
                        DepartmentName = "Phòng Kỹ thuật",
                        Description = "Phòng chịu trách nhiệm về kỹ thuật và công nghệ sản xuất"
                    },
                    new Department
                    {
                        DepartmentName = "Phòng Kiểm tra chất lượng",
                        Description = "Phòng kiểm tra và đảm bảo chất lượng sản phẩm"
                    },
                    new Department
                    {
                        DepartmentName = "Phòng Hành chính",
                        Description = "Phòng quản lý hành chính và nhân sự"
                    },
                    new Department
                    {
                        DepartmentName = "Ban Giám đốc",
                        Description = "Ban điều hành và quản lý công ty"
                    }
                };

                await context.Departments.AddRangeAsync(departments);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedUsers(FitskipDbContext context)
        {
            if (!await context.Users.AnyAsync())
            {

                var users = new List<User>();

                // Admin Users - Quản trị viên
                var admin = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "admin.dev",
                    NormalizedUserName = "ADMIN.DEV",
                    Email = "admin.dev@kipvietnam.vn",
                    NormalizedEmail = "ADMIN.DEV@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Nguyễn Văn Quản trị",
                    EmployeeCode = "QTV001",
                    PhoneNumber = "0901234567"
                };
                admin.PasswordHash = _passwordHasher.HashPassword(admin, "Admin123@");
                users.Add(admin);

                // Manager Users - Quản lý
                var manager = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "quanly",
                    NormalizedUserName = "QUANLY",
                    Email = "quanly@kipvietnam.vn",
                    NormalizedEmail = "QUANLY@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Trần Thị Mai Anh",
                    EmployeeCode = "QL001",
                    PhoneNumber = "0987654321"
                };
                manager.PasswordHash = _passwordHasher.HashPassword(manager, "Manager123@");
                users.Add(manager);

                // Technical Manager - Quản lý kỹ thuật
                var techManager = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "quanly.kythuat",
                    NormalizedUserName = "QUANLY.KYTHUAT",
                    Email = "quanly.kythuat@kipvietnam.vn",
                    NormalizedEmail = "QUANLY.KYTHUAT@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Lê Văn Kỹ thuật",
                    EmployeeCode = "QLKT001",
                    PhoneNumber = "0912345678"
                };
                techManager.PasswordHash = _passwordHasher.HashPassword(techManager, "TechMgr123@");
                users.Add(techManager);

                // Team Leaders - Tổ trưởng
                var teamLeader = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "totruong.sanxuat",
                    NormalizedUserName = "TOTRUONG.SANXUAT",
                    Email = "totruong.sanxuat@kipvietnam.vn",
                    NormalizedEmail = "TOTRUONG.SANXUAT@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Phạm Văn Sản xuất",
                    EmployeeCode = "TT001",
                    PhoneNumber = "0923456789"
                };
                teamLeader.PasswordHash = _passwordHasher.HashPassword(teamLeader, "TeamLead123@");
                users.Add(teamLeader);

                // Technicians - Kỹ thuật viên
                var technician = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "kythuat.vien1",
                    NormalizedUserName = "KYTHUAT.VIEN1",
                    Email = "kythuat.vien1@kipvietnam.vn",
                    NormalizedEmail = "KYTHUAT.VIEN1@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Đặng Văn Kỹ thuật",
                    EmployeeCode = "KTV001",
                    PhoneNumber = "0945678901"
                };
                technician.PasswordHash = _passwordHasher.HashPassword(technician, "Tech123@");
                users.Add(technician);
                await context.Users.AddRangeAsync(users);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedUserRoles(FitskipDbContext context)
        {
            // Phân quyền cho người dùng (sử dụng RoleId trong User)
            var roles = await context.Roles.ToListAsync();
            var dbUsers = await context.Users.ToListAsync();

            bool hasChanges = false;

            // Phân quyền Quản trị viên
            var adminRole = roles.FirstOrDefault(r => r.NormalizedName == "QUẢN TRỊ VIÊN");
            if (adminRole != null)
            {
                var adminUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("QTV") == true && u.RoleId == null).ToList();
                foreach (var user in adminUsers)
                {
                    user.RoleId = adminRole.Id;
                    hasChanges = true;
                }
            }

            // Phân quyền Quản lý
            var managerRole = roles.FirstOrDefault(r => r.NormalizedName == "QUẢN LÝ");
            if (managerRole != null)
            {
                var managerUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("QL") == true && !u.EmployeeCode.StartsWith("QLKT") && u.RoleId == null).ToList();
                foreach (var user in managerUsers)
                {
                    user.RoleId = managerRole.Id;
                    hasChanges = true;
                }
            }

            // Phân quyền Quản lý kỹ thuật
            var techManagerRole = roles.FirstOrDefault(r => r.NormalizedName == "QUẢN LÝ KỸ THUẬT");
            if (techManagerRole != null)
            {
                var techManagerUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("QLKT") == true && u.RoleId == null).ToList();
                foreach (var user in techManagerUsers)
                {
                    user.RoleId = techManagerRole.Id;
                    hasChanges = true;
                }
            }

            // Phân quyền Tổ trưởng
            var teamLeaderRole = roles.FirstOrDefault(r => r.NormalizedName == "TỔ TRƯỞNG");
            if (teamLeaderRole != null)
            {
                var teamLeaderUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("TT") == true && u.RoleId == null).ToList();
                foreach (var user in teamLeaderUsers)
                {
                    user.RoleId = teamLeaderRole.Id;
                    hasChanges = true;
                }
            }

            // Phân quyền Kỹ thuật viên
            var technicianRole = roles.FirstOrDefault(r => r.NormalizedName == "KỸ THUẬT VIÊN");
            if (technicianRole != null)
            {
                var technicianUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("KTV") == true && u.RoleId == null).ToList();
                foreach (var user in technicianUsers)
                {
                    user.RoleId = technicianRole.Id;
                    hasChanges = true;
                }
            }

            if (hasChanges)
            {
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedAllData(FitskipDbContext context)
        {
            await SeedRoles(context);
            await SeedDepartments(context);
            await SeedUsers(context);
            await SeedUserRoles(context);
        }
    }
}